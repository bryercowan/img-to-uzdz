import redis
import json
from typing import Dict, Any, Optional
from datetime import datetime
from settings import Settings
from database import Job, JobImage, JobOutput, UsageEvent, WebhookEvent
from sqlalchemy.orm import Session
import uuid

settings = Settings()
redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

class JobQueue:
    """Manages job queuing and worker communication"""
    
    def __init__(self):
        self.redis = redis_client
    
    def enqueue_job(self, job_id: str, queue: str = "standard", priority: int = 0) -> bool:
        """Enqueue a job for processing"""
        try:
            # Get job details from database
            db = self._get_db()
            job = db.query(Job).filter(Job.id == job_id).first()
            if not job:
                return False
            
            # Get job images
            images = db.query(JobImage).filter(JobImage.job_id == job_id).all()
            
            # Create worker payload
            payload = {
                "job_id": str(job_id),
                "images": [{"s3_key": img.storage_key, "filename": img.filename} for img in images],
                "params": {
                    "quality": job.quality,
                    "target_formats": job.target_formats,
                    "max_iterations": settings.JOB_MAX_ITER_HIGH if job.quality == "high" else settings.JOB_MAX_ITER_FAST,
                    "mesh_simplify_target_tris": 150000,
                    "compress": True
                },
                "output_prefix": f"s3://{settings.S3_BUCKET}/org/{job.org_id or 'anon'}/jobs/{job_id}/outputs/",
                "feature_usdz": settings.FEATURE_USDZ,
                "queued_at": datetime.utcnow().isoformat(),
                "priority": priority
            }
            
            # Add to Redis queue with priority support
            queue_key = f"queue:{queue}"
            if priority > 0:
                # Use sorted set for priority queue
                self.redis.zadd(f"{queue_key}:priority", {json.dumps(payload): priority})
            else:
                # Use list for FIFO queue
                self.redis.lpush(queue_key, json.dumps(payload))
            
            db.close()
            return True
            
        except Exception as e:
            print(f"Failed to enqueue job {job_id}: {e}")
            return False
    
    def dequeue_job(self, queue: str = "standard", timeout: int = 30) -> Optional[Dict[str, Any]]:
        """Dequeue a job for processing (blocking)"""
        try:
            # Check priority queue first
            priority_key = f"queue:{queue}:priority"
            priority_items = self.redis.zrevrange(priority_key, 0, 0, withscores=True)
            
            if priority_items:
                payload_json, score = priority_items[0]
                self.redis.zrem(priority_key, payload_json)
                return json.loads(payload_json)
            
            # Fall back to regular FIFO queue
            queue_key = f"queue:{queue}"
            result = self.redis.brpop([queue_key], timeout=timeout)
            
            if result:
                _, payload_json = result
                return json.loads(payload_json)
            
            return None
            
        except Exception as e:
            print(f"Failed to dequeue job from {queue}: {e}")
            return None
    
    def update_job_status(self, job_id: str, status: str, error_message: str = None, 
                         outputs: list = None, gpu_minutes: float = None) -> bool:
        """Update job status and related data"""
        try:
            db = self._get_db()
            job = db.query(Job).filter(Job.id == job_id).first()
            if not job:
                return False
            
            job.status = status
            
            if status == "running" and not job.started_at:
                job.started_at = datetime.utcnow()
            
            if status in ["completed", "failed", "canceled"]:
                job.completed_at = datetime.utcnow()
            
            if error_message:
                job.error_message = error_message
            
            # Add outputs if provided
            if outputs and status == "completed":
                for output_data in outputs:
                    output = JobOutput(
                        job_id=job.id,
                        format=output_data["format"],
                        storage_key=output_data["storage_key"],
                        size_bytes=output_data["size_bytes"]
                    )
                    db.add(output)
            
            # Record GPU usage
            if gpu_minutes:
                usage_event = UsageEvent(
                    job_id=job.id,
                    event_type="gpu_minutes",
                    gpu_minutes=gpu_minutes,
                    details={"status": status}
                )
                db.add(usage_event)
            
            db.commit()
            
            # Trigger webhook if configured
            if job.webhook_url:
                self._enqueue_webhook(job.id, status, db)
            
            db.close()
            return True
            
        except Exception as e:
            print(f"Failed to update job status for {job_id}: {e}")
            return False
    
    def get_queue_stats(self, queue: str = "standard") -> Dict[str, int]:
        """Get queue statistics"""
        queue_key = f"queue:{queue}"
        priority_key = f"{queue_key}:priority"
        
        regular_count = self.redis.llen(queue_key)
        priority_count = self.redis.zcard(priority_key)
        
        return {
            "regular_queue": regular_count,
            "priority_queue": priority_count,
            "total_pending": regular_count + priority_count
        }
    
    def _enqueue_webhook(self, job_id: str, event_type: str, db: Session):
        """Enqueue webhook delivery"""
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job or not job.webhook_url:
            return
        
        webhook_event = WebhookEvent(
            org_id=job.org_id,
            job_id=job.id,
            type=f"job.{event_type}",
            payload={
                "job_id": str(job.id),
                "status": job.status,
                "created_at": job.created_at.isoformat(),
                "completed_at": job.completed_at.isoformat() if job.completed_at else None
            }
        )
        db.add(webhook_event)
        
        # Add to webhook delivery queue
        webhook_payload = {
            "event_id": str(webhook_event.id),
            "url": job.webhook_url,
            "payload": webhook_event.payload,
            "created_at": datetime.utcnow().isoformat()
        }
        
        self.redis.lpush("queue:webhooks", json.dumps(webhook_payload))
    
    def _get_db(self):
        # This should be properly imported, but for now create a session
        from database import SessionLocal
        return SessionLocal()

# Global queue instance
job_queue = JobQueue()

def enqueue_job(job_id: str, queue: str = "standard", priority: int = 0):
    """Helper function to enqueue a job"""
    return job_queue.enqueue_job(job_id, queue, priority)

def update_job_status(job_id: str, status: str, **kwargs):
    """Helper function to update job status"""
    return job_queue.update_job_status(job_id, status, **kwargs)