from datetime import datetime, timedelta
from typing import Dict, List, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from database import Job, UsageEvent, CreditsLedger, User, Org
from decimal import Decimal
import redis
import json

class MetricsCollector:
    """Collects and provides system metrics"""
    
    def __init__(self, redis_client):
        self.redis = redis_client
    
    def get_system_metrics(self, db: Session) -> Dict[str, Any]:
        """Get overall system metrics"""
        now = datetime.utcnow()
        last_24h = now - timedelta(hours=24)
        last_7d = now - timedelta(days=7)
        last_30d = now - timedelta(days=30)
        
        # Job metrics
        total_jobs = db.query(Job).count()
        jobs_24h = db.query(Job).filter(Job.created_at >= last_24h).count()
        jobs_7d = db.query(Job).filter(Job.created_at >= last_7d).count()
        jobs_30d = db.query(Job).filter(Job.created_at >= last_30d).count()
        
        # Job status breakdown
        job_statuses = db.query(
            Job.status, func.count(Job.id)
        ).group_by(Job.status).all()
        
        status_counts = {status: count for status, count in job_statuses}
        
        # Processing metrics
        completed_jobs = status_counts.get("completed", 0)
        failed_jobs = status_counts.get("failed", 0)
        success_rate = (completed_jobs / max(completed_jobs + failed_jobs, 1)) * 100
        
        # GPU usage metrics
        gpu_usage = db.query(func.sum(UsageEvent.gpu_minutes)).filter(
            UsageEvent.created_at >= last_24h,
            UsageEvent.event_type == "gpu_minutes"
        ).scalar() or Decimal("0")
        
        # Credit metrics
        credits_spent_24h = db.query(func.sum(CreditsLedger.delta)).filter(
            CreditsLedger.created_at >= last_24h,
            CreditsLedger.delta < 0
        ).scalar() or Decimal("0")
        
        # User metrics
        total_users = db.query(User).count()
        users_24h = db.query(User).filter(User.created_at >= last_24h).count()
        
        total_orgs = db.query(Org).count()
        
        # Queue metrics
        queue_stats = self._get_queue_metrics()
        
        return {
            "timestamp": now.isoformat(),
            "jobs": {
                "total": total_jobs,
                "last_24h": jobs_24h,
                "last_7d": jobs_7d,
                "last_30d": jobs_30d,
                "status_breakdown": status_counts,
                "success_rate_percent": float(success_rate)
            },
            "processing": {
                "gpu_minutes_24h": float(gpu_usage),
                "credits_spent_24h": float(abs(credits_spent_24h))
            },
            "users": {
                "total_users": total_users,
                "new_users_24h": users_24h,
                "total_orgs": total_orgs
            },
            "queues": queue_stats
        }
    
    def get_org_metrics(self, org_id: str, db: Session) -> Dict[str, Any]:
        """Get metrics for a specific organization"""
        now = datetime.utcnow()
        last_30d = now - timedelta(days=30)
        
        # Job metrics for this org
        total_jobs = db.query(Job).filter(Job.org_id == org_id).count()
        jobs_30d = db.query(Job).filter(
            Job.org_id == org_id,
            Job.created_at >= last_30d
        ).count()
        
        # Job status breakdown
        job_statuses = db.query(
            Job.status, func.count(Job.id)
        ).filter(Job.org_id == org_id).group_by(Job.status).all()
        
        status_counts = {status: count for status, count in job_statuses}
        
        # GPU usage for this org
        gpu_usage = db.query(func.sum(UsageEvent.gpu_minutes)).join(Job).filter(
            Job.org_id == org_id,
            UsageEvent.created_at >= last_30d,
            UsageEvent.event_type == "gpu_minutes"
        ).scalar() or Decimal("0")
        
        # Credit usage
        credits_spent = db.query(func.sum(CreditsLedger.delta)).filter(
            CreditsLedger.org_id == org_id,
            CreditsLedger.delta < 0,
            CreditsLedger.created_at >= last_30d
        ).scalar() or Decimal("0")
        
        current_balance = db.query(func.sum(CreditsLedger.delta)).filter(
            CreditsLedger.org_id == org_id
        ).scalar() or Decimal("0")
        
        return {
            "org_id": org_id,
            "timestamp": now.isoformat(),
            "jobs": {
                "total": total_jobs,
                "last_30d": jobs_30d,
                "status_breakdown": status_counts
            },
            "usage": {
                "gpu_minutes_30d": float(gpu_usage),
                "credits_spent_30d": float(abs(credits_spent)),
                "current_credit_balance": float(current_balance)
            }
        }
    
    def _get_queue_metrics(self) -> Dict[str, Any]:
        """Get queue status metrics"""
        try:
            # Standard queue
            standard_queue = self.redis.llen("queue:standard")
            standard_priority = self.redis.zcard("queue:standard:priority")
            
            # Rush queue (if enabled)
            rush_queue = self.redis.llen("queue:rush")
            rush_priority = self.redis.zcard("queue:rush:priority")
            
            # Status update queues
            job_updates = self.redis.llen("queue:job_updates")
            webhooks = self.redis.llen("queue:webhooks")
            webhook_retries = self.redis.llen("queue:webhook_retries")
            
            return {
                "standard": {
                    "regular": standard_queue,
                    "priority": standard_priority,
                    "total": standard_queue + standard_priority
                },
                "rush": {
                    "regular": rush_queue,
                    "priority": rush_priority,
                    "total": rush_queue + rush_priority
                },
                "system": {
                    "job_updates": job_updates,
                    "webhooks": webhooks,
                    "webhook_retries": webhook_retries
                }
            }
        except Exception as e:
            print(f"Error getting queue metrics: {e}")
            return {"error": str(e)}
    
    def record_api_call(self, endpoint: str, method: str, status_code: int, 
                       response_time_ms: float, org_id: str = None):
        """Record API call metrics"""
        try:
            metric_data = {
                "endpoint": endpoint,
                "method": method,
                "status_code": status_code,
                "response_time_ms": response_time_ms,
                "org_id": org_id,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # Store in Redis with expiration (7 days)
            key = f"api_metrics:{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
            self.redis.setex(key, 604800, json.dumps(metric_data))  # 7 days TTL
            
        except Exception as e:
            print(f"Error recording API metrics: {e}")
    
    def get_api_metrics(self, hours: int = 24) -> Dict[str, Any]:
        """Get API call metrics for the last N hours"""
        try:
            now = datetime.utcnow()
            cutoff = now - timedelta(hours=hours)
            
            # Get all API metrics keys from Redis
            pattern = "api_metrics:*"
            keys = self.redis.keys(pattern)
            
            metrics = []
            for key in keys:
                try:
                    data = json.loads(self.redis.get(key))
                    timestamp = datetime.fromisoformat(data["timestamp"])
                    
                    if timestamp >= cutoff:
                        metrics.append(data)
                except:
                    continue
            
            if not metrics:
                return {"total_calls": 0, "endpoints": {}, "status_codes": {}}
            
            # Aggregate metrics
            endpoint_counts = {}
            status_counts = {}
            total_response_time = 0
            
            for metric in metrics:
                endpoint = metric["endpoint"]
                status = metric["status_code"]
                response_time = metric["response_time_ms"]
                
                endpoint_counts[endpoint] = endpoint_counts.get(endpoint, 0) + 1
                status_counts[str(status)] = status_counts.get(str(status), 0) + 1
                total_response_time += response_time
            
            avg_response_time = total_response_time / len(metrics) if metrics else 0
            
            return {
                "total_calls": len(metrics),
                "avg_response_time_ms": avg_response_time,
                "endpoints": endpoint_counts,
                "status_codes": status_counts,
                "time_range_hours": hours
            }
            
        except Exception as e:
            print(f"Error getting API metrics: {e}")
            return {"error": str(e)}

# Prometheus/OpenTelemetry compatible metrics export
def export_prometheus_metrics(db: Session, redis_client) -> str:
    """Export metrics in Prometheus format"""
    collector = MetricsCollector(redis_client)
    metrics = collector.get_system_metrics(db)
    
    prometheus_output = []
    
    # Job metrics
    prometheus_output.append(f"# HELP total_jobs Total number of jobs")
    prometheus_output.append(f"# TYPE total_jobs counter")
    prometheus_output.append(f"total_jobs {metrics['jobs']['total']}")
    
    prometheus_output.append(f"# HELP jobs_24h Jobs created in last 24 hours")
    prometheus_output.append(f"# TYPE jobs_24h counter")
    prometheus_output.append(f"jobs_24h {metrics['jobs']['last_24h']}")
    
    # Job status metrics
    for status, count in metrics['jobs']['status_breakdown'].items():
        prometheus_output.append(f"jobs_by_status{{status=\"{status}\"}} {count}")
    
    # Success rate
    prometheus_output.append(f"# HELP job_success_rate Job success rate percentage")
    prometheus_output.append(f"# TYPE job_success_rate gauge")
    prometheus_output.append(f"job_success_rate {metrics['jobs']['success_rate_percent']}")
    
    # GPU usage
    prometheus_output.append(f"# HELP gpu_minutes_24h GPU minutes used in last 24 hours")
    prometheus_output.append(f"# TYPE gpu_minutes_24h counter")
    prometheus_output.append(f"gpu_minutes_24h {metrics['processing']['gpu_minutes_24h']}")
    
    # Queue metrics
    if 'error' not in metrics['queues']:
        for queue_name, queue_data in metrics['queues'].items():
            if isinstance(queue_data, dict) and 'total' in queue_data:
                prometheus_output.append(f"queue_depth{{queue=\"{queue_name}\"}} {queue_data['total']}")
    
    return "\n".join(prometheus_output)