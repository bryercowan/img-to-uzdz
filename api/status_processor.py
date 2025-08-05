#!/usr/bin/env python3
"""
Job Status Processor
Listens to job status updates from workers and updates database accordingly
"""

import redis
import json
import time
import traceback
from datetime import datetime
from decimal import Decimal
from sqlalchemy.orm import Session
from database import (
    create_engine_from_url, get_session_factory,
    Job, JobOutput, UsageEvent, WebhookEvent, CreditsLedger
)
from settings import Settings
import requests
import hmac
import hashlib

settings = Settings()

class StatusProcessor:
    def __init__(self):
        self.redis = redis.from_url(settings.REDIS_URL, decode_responses=True)
        
        # Database setup
        engine = create_engine_from_url(settings.DATABASE_URL)
        self.SessionLocal = get_session_factory(engine)
    
    def process_status_updates(self):
        """Main loop to process job status updates"""
        print("🚀 Status processor starting...")
        
        while True:
            try:
                # Get status update from queue
                result = self.redis.brpop(['queue:job_updates'], timeout=30)
                
                if result:
                    _, update_json = result
                    update_data = json.loads(update_json)
                    
                    print(f"📥 Processing status update: {update_data['job_id']} -> {update_data['status']}")
                    
                    # Process the update
                    self._process_single_update(update_data)
                else:
                    print("⏰ Queue timeout, continuing...")
                    
            except KeyboardInterrupt:
                print("\n🛑 Status processor shutting down...")
                break
            except Exception as e:
                print(f"💥 Status processor error: {e}")
                traceback.print_exc()
                time.sleep(5)
    
    def _process_single_update(self, update_data: dict):
        """Process a single status update"""
        job_id = update_data["job_id"]
        status = update_data["status"]
        
        db = self.SessionLocal()
        try:
            # Get job
            job = db.query(Job).filter(Job.id == job_id).first()
            if not job:
                print(f"❌ Job not found: {job_id}")
                return
            
            # Update job status
            job.status = status
            
            if status == "running" and not job.started_at:
                job.started_at = datetime.utcnow()
            
            if status in ["completed", "failed", "canceled"]:
                job.completed_at = datetime.utcnow()
            
            # Handle error message
            if "error_message" in update_data:
                job.error_message = update_data["error_message"]
            
            # Handle outputs
            if "outputs" in update_data and status == "completed":
                for output_data in update_data["outputs"]:
                    output = JobOutput(
                        job_id=job.id,
                        format=output_data["format"],
                        storage_key=output_data["storage_key"],
                        size_bytes=output_data["size_bytes"]
                    )
                    db.add(output)
            
            # Handle GPU usage
            if "gpu_minutes" in update_data:
                gpu_minutes = Decimal(str(update_data["gpu_minutes"]))
                
                usage_event = UsageEvent(
                    job_id=job.id,
                    event_type="gpu_minutes",
                    gpu_minutes=gpu_minutes,
                    details={
                        "status": status,
                        "worker_id": update_data.get("worker_id"),
                        "timestamp": update_data.get("timestamp")
                    }
                )
                db.add(usage_event)
                
                # Update job cost if completed
                if status == "completed":
                    job.cost_credits = self._calculate_job_cost(job, gpu_minutes)
                    
                    # Debit credits if this is an API job
                    if job.org_id:
                        self._debit_credits(job, db)
            
            # Refund credits if job failed
            if status == "failed" and job.org_id and job.estimate_credits:
                self._refund_credits(job, db)
            
            db.commit()
            
            # Trigger webhook
            if job.webhook_url:
                self._trigger_webhook(job, db)
            
            print(f"✅ Updated job {job_id}: {status}")
            
        except Exception as e:
            print(f"❌ Failed to process update for {job_id}: {e}")
            traceback.print_exc()
            db.rollback()
        finally:
            db.close()
    
    def _calculate_job_cost(self, job: Job, gpu_minutes: Decimal) -> Decimal:
        """Calculate actual job cost based on usage"""
        # Base cost calculation
        base_cost = Decimal(str(settings.CREDITS_FAST_JOB)) if job.quality == "fast" else Decimal(str(settings.CREDITS_HIGH_JOB))
        
        # Add format multiplier
        if "usdz" in job.target_formats:
            base_cost *= Decimal("1.2")
        
        # Add rush multiplier if applicable
        # (This would be determined by queue priority in a real system)
        
        return base_cost
    
    def _debit_credits(self, job: Job, db: Session):
        """Debit credits from org for completed job"""
        if not job.cost_credits:
            return
        
        credit_entry = CreditsLedger(
            org_id=job.org_id,
            delta=-job.cost_credits,  # Negative = debit
            reason="job_charge",
            job_id=job.id
        )
        db.add(credit_entry)
        print(f"💳 Debited {job.cost_credits} credits for job {job.id}")
    
    def _refund_credits(self, job: Job, db: Session):
        """Refund credits for failed job"""
        if not job.estimate_credits:
            return
        
        credit_entry = CreditsLedger(
            org_id=job.org_id,
            delta=job.estimate_credits,  # Positive = credit
            reason="refund",
            job_id=job.id
        )
        db.add(credit_entry)
        print(f"💰 Refunded {job.estimate_credits} credits for failed job {job.id}")
    
    def _trigger_webhook(self, job: Job, db: Session):
        """Trigger webhook for job status change"""
        try:
            # Create webhook event record
            webhook_event = WebhookEvent(
                org_id=job.org_id,
                job_id=job.id,
                type=f"job.{job.status}",
                payload={
                    "job_id": str(job.id),
                    "status": job.status,
                    "created_at": job.created_at.isoformat(),
                    "started_at": job.started_at.isoformat() if job.started_at else None,
                    "completed_at": job.completed_at.isoformat() if job.completed_at else None,
                    "cost_credits": float(job.cost_credits) if job.cost_credits else None,
                    "error_message": job.error_message
                }
            )
            db.add(webhook_event)
            db.commit()
            
            # Queue webhook for delivery
            webhook_payload = {
                "event_id": str(webhook_event.id),
                "url": job.webhook_url,
                "payload": webhook_event.payload,
                "created_at": datetime.utcnow().isoformat()
            }
            
            self.redis.lpush("queue:webhooks", json.dumps(webhook_payload))
            print(f"📤 Queued webhook for job {job.id}")
            
        except Exception as e:
            print(f"❌ Failed to trigger webhook for job {job.id}: {e}")

class WebhookDeliveryProcessor:
    def __init__(self):
        self.redis = redis.from_url(settings.REDIS_URL, decode_responses=True)
        
        # Database setup
        engine = create_engine_from_url(settings.DATABASE_URL)
        self.SessionLocal = get_session_factory(engine)
    
    def process_webhooks(self):
        """Main loop to deliver webhooks"""
        print("🚀 Webhook delivery processor starting...")
        
        while True:
            try:
                # Get webhook from queue
                result = self.redis.brpop(['queue:webhooks'], timeout=30)
                
                if result:
                    _, webhook_json = result
                    webhook_data = json.loads(webhook_json)
                    
                    print(f"📤 Delivering webhook: {webhook_data['event_id']}")
                    
                    # Deliver the webhook
                    self._deliver_webhook(webhook_data)
                else:
                    print("⏰ Webhook queue timeout, continuing...")
                    
            except KeyboardInterrupt:
                print("\n🛑 Webhook processor shutting down...")
                break
            except Exception as e:
                print(f"💥 Webhook processor error: {e}")
                traceback.print_exc()
                time.sleep(5)
    
    def _deliver_webhook(self, webhook_data: dict):
        """Deliver a single webhook"""
        event_id = webhook_data["event_id"]
        url = webhook_data["url"]
        payload = webhook_data["payload"]
        
        db = self.SessionLocal()
        try:
            # Get webhook event
            webhook_event = db.query(WebhookEvent).filter(WebhookEvent.id == event_id).first()
            if not webhook_event:
                print(f"❌ Webhook event not found: {event_id}")
                return
            
            # Create HMAC signature (if we have webhook secrets configured)
            payload_json = json.dumps(payload, sort_keys=True)
            signature = self._create_signature(payload_json)
            
            # Prepare headers
            headers = {
                "Content-Type": "application/json",
                "User-Agent": "imgto3d-webhook/1.0",
                "X-Webhook-Event": webhook_event.type,
                "X-Webhook-Delivery": str(webhook_event.id)
            }
            
            if signature:
                headers["X-Webhook-Signature"] = signature
            
            # Attempt delivery
            webhook_event.attempts += 1
            
            try:
                response = requests.post(
                    url,
                    json=payload,
                    headers=headers,
                    timeout=30
                )
                
                if response.status_code == 200:
                    webhook_event.delivered_at = datetime.utcnow()
                    db.commit()
                    print(f"✅ Webhook delivered: {event_id}")
                else:
                    print(f"❌ Webhook delivery failed: {event_id} (HTTP {response.status_code})")
                    self._handle_failed_delivery(webhook_event, webhook_data, db)
                
            except requests.exceptions.RequestException as e:
                print(f"❌ Webhook delivery failed: {event_id} ({str(e)})")
                self._handle_failed_delivery(webhook_event, webhook_data, db)
            
        except Exception as e:
            print(f"❌ Webhook processing error for {event_id}: {e}")
            traceback.print_exc()
        finally:
            db.close()
    
    def _create_signature(self, payload: str) -> str:
        """Create HMAC signature for webhook payload"""
        # This would use a webhook secret from the database
        # For now, we'll use a default secret
        secret = settings.SECRET_KEY
        signature = hmac.new(
            secret.encode(),
            payload.encode(),
            hashlib.sha256
        ).hexdigest()
        return f"sha256={signature}"
    
    def _handle_failed_delivery(self, webhook_event: WebhookEvent, webhook_data: dict, db: Session):
        """Handle failed webhook delivery with retry logic"""
        max_attempts = 3
        
        if webhook_event.attempts < max_attempts:
            # Retry with exponential backoff
            delay = min(300, 60 * (2 ** (webhook_event.attempts - 1)))  # Max 5 minutes
            
            # Re-queue for retry
            retry_data = webhook_data.copy()
            retry_data["retry_after"] = datetime.utcnow().timestamp() + delay
            
            self.redis.lpush("queue:webhook_retries", json.dumps(retry_data))
            print(f"🔄 Webhook queued for retry in {delay}s: {webhook_event.id}")
        else:
            print(f"❌ Webhook delivery abandoned after {max_attempts} attempts: {webhook_event.id}")
        
        db.commit()

def run_status_processor():
    """Entry point for status processor"""
    processor = StatusProcessor()
    processor.process_status_updates()

def run_webhook_processor():
    """Entry point for webhook processor"""
    processor = WebhookDeliveryProcessor()
    processor.process_webhooks()

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "webhooks":
            run_webhook_processor()
        else:
            run_status_processor()
    else:
        run_status_processor()