#!/usr/bin/env python3
"""
Database seeding script for img-to-uzdz API
Run this after creating the database schema to populate with test data
"""

import uuid
from datetime import datetime, timedelta
from decimal import Decimal
from sqlalchemy.orm import Session

# Import your database models and setup
from database import (
    create_engine_from_url, get_session_factory, create_tables,
    User, Org, Job, JobImage, JobOutput, ApiKey, 
    CreditsLedger, StripeCustomer, UsageEvent
)
from settings import Settings
from auth import get_password_hash, generate_api_key

def seed_database():
    """Seed the database with test data"""
    
    settings = Settings()
    engine = create_engine_from_url(settings.DATABASE_URL)
    SessionLocal = get_session_factory(engine)
    
    # Ensure tables exist
    create_tables(engine)
    
    db: Session = SessionLocal()
    
    try:
        print("🌱 Starting database seeding...")
        
        # Check if we already have data
        existing_users = db.query(User).count()
        if existing_users > 0:
            print(f"⚠️  Database already has {existing_users} users. Skipping seeding.")
            print("   Delete existing data first if you want to re-seed.")
            return
        
        # 1. Create test user
        print("👤 Creating test user...")
        test_user_id = str(uuid.uuid4())
        test_user = User(
            id=test_user_id,
            email="test@example.com",
            password_hash=get_password_hash("testpassword123")
        )
        db.add(test_user)
        db.flush()
        
        # 2. Create test organization  
        print("🏢 Creating test organization...")
        test_org_id = str(uuid.uuid4())
        test_org = Org(
            id=test_org_id,
            name="Test Organization",
            owner_user_id=test_user_id
        )
        db.add(test_org)
        db.flush()
        
        # 3. Create sample jobs
        print("⚙️  Creating sample jobs...")
        jobs_data = [
            {"id": str(uuid.uuid4()), "status": "completed", "cost": 2.5, "hours_ago": 1},
            {"id": str(uuid.uuid4()), "status": "completed", "cost": 1.0, "hours_ago": 2}, 
            {"id": str(uuid.uuid4()), "status": "running", "cost": 2.5, "hours_ago": 0.5},
            {"id": str(uuid.uuid4()), "status": "failed", "cost": 0, "hours_ago": 0.75},
            {"id": str(uuid.uuid4()), "status": "queued", "cost": 1.0, "hours_ago": 0.08},
        ]
        
        job_objects = []
        for job_data in jobs_data:
            job = Job(
                id=job_data["id"],
                org_id=test_org_id,
                status=job_data["status"],
                cost_credits=Decimal(str(job_data["cost"])),
                created_at=datetime.utcnow() - timedelta(hours=job_data["hours_ago"]),
                updated_at=datetime.utcnow() - timedelta(hours=job_data["hours_ago"])
            )
            db.add(job)
            job_objects.append(job)
        
        db.flush()
        
        # 4. Create job images for completed jobs
        print("🖼️  Creating job images...")
        completed_jobs = [j for j in job_objects if j.status == "completed"]
        for i, job in enumerate(completed_jobs):
            for img_idx in range(3):  # 3 images per job
                job_image = JobImage(
                    id=str(uuid.uuid4()),
                    job_id=job.id,
                    storage_key=f"uploads/{test_org_id}/job_{i+1}_image_{img_idx+1}.jpg",
                    filename=f"product_{i+1}_{img_idx+1}.jpg"
                )
                db.add(job_image)
        
        # 5. Create job outputs for completed jobs
        print("📦 Creating job outputs...")
        for job in completed_jobs:
            for format_type in ["glb", "usdz"]:
                size = 2048576 if format_type == "glb" else 1536000
                job_output = JobOutput(
                    id=str(uuid.uuid4()),
                    job_id=job.id,
                    format=format_type,
                    storage_key=f"outputs/{job.id}/model.{format_type}",
                    size_bytes=size
                )
                db.add(job_output)
        
        # 6. Create credits transactions
        print("💳 Creating credits transactions...")
        credits_data = [
            {"amount": 50.0, "type": "purchase", "ref_type": "stripe_payment", "ref_id": "pi_test123", "days_ago": 3},
            {"amount": -2.5, "type": "job_charge", "ref_type": "job", "ref_id": completed_jobs[0].id, "days_ago": 0.04},
            {"amount": -1.0, "type": "job_charge", "ref_type": "job", "ref_id": completed_jobs[1].id, "days_ago": 0.08},
            {"amount": 100.0, "type": "purchase", "ref_type": "stripe_payment", "ref_id": "pi_test456", "days_ago": 7},
        ]
        
        for credit_data in credits_data:
            credit_entry = CreditsLedger(
                id=str(uuid.uuid4()),
                org_id=test_org_id,
                amount=Decimal(str(credit_data["amount"])),
                transaction_type=credit_data["type"],
                reference_type=credit_data["ref_type"],
                reference_id=credit_data["ref_id"],
                created_at=datetime.utcnow() - timedelta(days=credit_data["days_ago"])
            )
            db.add(credit_entry)
        
        # 7. Create usage events for admin activity feed
        print("📊 Creating usage events...")
        events_data = [
            {"type": "job_completed", "desc": f"Job {completed_jobs[0].id} finished successfully", "hours_ago": 1},
            {"type": "job_created", "desc": f"New job {job_objects[2].id} created with 4 images", "hours_ago": 0.5},
            {"type": "payment_processed", "desc": "Credit purchase of 100 credits completed", "hours_ago": 168},  # 7 days
            {"type": "job_failed", "desc": f"Job {job_objects[3].id} failed due to insufficient image quality", "hours_ago": 0.75},
            {"type": "user_created", "desc": "New user registered: test@example.com", "hours_ago": 72},  # 3 days
        ]
        
        for event_data in events_data:
            usage_event = UsageEvent(
                id=str(uuid.uuid4()),
                user_id=test_user_id,
                org_id=test_org_id,
                event_type=event_data["type"],
                description=event_data["desc"],
                timestamp=datetime.utcnow() - timedelta(hours=event_data["hours_ago"])
            )
            db.add(usage_event)
        
        # 8. Create API key
        print("🔑 Creating API key...")
        key, key_hash = generate_api_key()
        api_key = ApiKey(
            id=str(uuid.uuid4()),
            org_id=test_org_id,
            name="Test API Key",
            key_hash=key_hash,
            created_at=datetime.utcnow() - timedelta(days=2)
        )
        db.add(api_key)
        
        # 9. Create Stripe customer
        print("💳 Creating Stripe customer...")
        stripe_customer = StripeCustomer(
            id=str(uuid.uuid4()),
            org_id=test_org_id,
            stripe_customer_id="cus_test1234567890",
            created_at=datetime.utcnow() - timedelta(days=3)
        )
        db.add(stripe_customer)
        
        # Commit all changes
        db.commit()
        
        print("✅ Database seeding completed successfully!")
        print(f"")
        print(f"📋 Created test data:")
        print(f"   👤 Test User: test@example.com (password: testpassword123)")
        print(f"   🏢 Test Org: Test Organization")
        print(f"   ⚙️  Jobs: {len(job_objects)} sample jobs")
        print(f"   💳 Credits: 4 transaction records")
        print(f"   📊 Events: {len(events_data)} usage events")
        print(f"   🔑 API Key: ak_{key}")
        print(f"")
        print(f"📦 Next steps:")
        print(f"   1. Create admin user: python create_admin.py")
        print(f"   2. Set up Stripe products in your Stripe dashboard:")
        print(f"      - Starter Package: 10 credits for $10.00")
        print(f"      - Professional Package: 50 credits for $45.00")
        print(f"      - Enterprise Package: 200 credits for $160.00")
        print(f"   3. Start the API server: python main_v2.py")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()