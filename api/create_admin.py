#!/usr/bin/env python3
"""
Create admin user for img-to-uzdz API
"""

from sqlalchemy.orm import Session
from database import (
    create_engine_from_url, get_session_factory, create_tables,
    User, Org
)
from settings import Settings
from auth import get_password_hash
import uuid

def create_admin_user():
    """Create the admin user and organization"""
    
    settings = Settings()
    engine = create_engine_from_url(settings.DATABASE_URL)
    SessionLocal = get_session_factory(engine)
    
    # Ensure tables exist
    create_tables(engine)
    
    db: Session = SessionLocal()
    
    try:
        # Check if admin user already exists
        existing_admin = db.query(User).filter(User.email == "admin@img-to-uzdz.com").first()
        if existing_admin:
            print("⚠️  Admin user already exists!")
            return
        
        print("👤 Creating admin user...")
        
        # Create admin user
        admin_user = User(
            id=str(uuid.uuid4()),
            email="admin@img-to-uzdz.com",
            password_hash=get_password_hash("admin123")  # Change this password!
        )
        db.add(admin_user)
        db.flush()
        
        # Create admin organization
        admin_org = Org(
            id=str(uuid.uuid4()),
            name="Admin Organization",
            owner_user_id=admin_user.id
        )
        db.add(admin_org)
        
        db.commit()
        
        print("✅ Admin user created successfully!")
        print(f"   📧 Email: admin@img-to-uzdz.com")
        print(f"   🔑 Password: admin123")
        print(f"   🏢 Organization: Admin Organization")
        print(f"")
        print(f"⚠️  SECURITY: Change the admin password after first login!")
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()