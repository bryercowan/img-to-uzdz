from sqlalchemy import create_engine, Column, String, Integer, Boolean, DateTime, Text, Numeric, ForeignKey, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import datetime
import uuid

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    owned_orgs = relationship("Org", back_populates="owner", foreign_keys="Org.owner_user_id")
    org_memberships = relationship("UserOrgMember", back_populates="user")
    created_jobs = relationship("Job", back_populates="created_by_user")
    stripe_customers = relationship("StripeCustomer", back_populates="user")

class Org(Base):
    __tablename__ = "orgs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    owner_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    owner = relationship("User", back_populates="owned_orgs", foreign_keys=[owner_user_id])
    members = relationship("UserOrgMember", back_populates="org")
    api_keys = relationship("ApiKey", back_populates="org")
    credits_ledger = relationship("CreditsLedger", back_populates="org")
    jobs = relationship("Job", back_populates="org")
    batches = relationship("Batch", back_populates="org")
    webhook_endpoints = relationship("WebhookEndpoint", back_populates="org")
    stripe_customers = relationship("StripeCustomer", back_populates="org")

class UserOrgMember(Base):
    __tablename__ = "user_org_members"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
    org_id = Column(UUID(as_uuid=True), ForeignKey("orgs.id"), primary_key=True)
    role = Column(String, nullable=False, default="member")  # member, admin
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="org_memberships")
    org = relationship("Org", back_populates="members")

class ApiKey(Base):
    __tablename__ = "api_keys"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("orgs.id"), nullable=False)
    name = Column(String, nullable=False)
    key_hash = Column(String, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_used_at = Column(DateTime)
    
    # Relationships
    org = relationship("Org", back_populates="api_keys")

class StripeCustomer(Base):
    __tablename__ = "stripe_customers"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    org_id = Column(UUID(as_uuid=True), ForeignKey("orgs.id"), nullable=True)
    stripe_customer_id = Column(String, nullable=False, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="stripe_customers")
    org = relationship("Org", back_populates="stripe_customers")
    credits_ledger = relationship("CreditsLedger", back_populates="stripe_customer")

class CreditsLedger(Base):
    __tablename__ = "credits_ledger"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("orgs.id"), nullable=False)
    delta = Column(Numeric(10, 2), nullable=False)  # Can be positive (credit) or negative (debit)
    reason = Column(String, nullable=False)  # job_charge, refund, purchase, bonus
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id"), nullable=True)
    stripe_tx_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    org = relationship("Org", back_populates="credits_ledger")
    job = relationship("Job", back_populates="credits_ledger_entries")
    stripe_customer = relationship("StripeCustomer", back_populates="credits_ledger")

class Job(Base):
    __tablename__ = "jobs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("orgs.id"), nullable=True)  # Null for Studio jobs
    created_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    status = Column(String, nullable=False, default="queued", index=True)  # queued, running, exporting, completed, failed, canceled
    quality = Column(String, nullable=False, default="fast")  # fast, high
    target_formats = Column(JSONB, nullable=False, default=list)  # ["glb", "usdz"]
    estimate_credits = Column(Numeric(10, 2), nullable=True)
    cost_credits = Column(Numeric(10, 2), nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    error_code = Column(String, nullable=True)
    error_message = Column(Text, nullable=True)
    preview_token = Column(String, nullable=True, index=True)  # For Studio jobs
    is_studio = Column(Boolean, default=False, index=True)
    webhook_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    org = relationship("Org", back_populates="jobs")
    created_by_user = relationship("User", back_populates="created_jobs")
    images = relationship("JobImage", back_populates="job", cascade="all, delete-orphan")
    outputs = relationship("JobOutput", back_populates="job", cascade="all, delete-orphan")
    credits_ledger_entries = relationship("CreditsLedger", back_populates="job")
    usage_events = relationship("UsageEvent", back_populates="job")
    webhook_events = relationship("WebhookEvent", back_populates="job")
    
    # Indexes
    __table_args__ = (
        Index("idx_jobs_status_created", "status", "created_at"),
        Index("idx_jobs_org_status", "org_id", "status"),
    )

class JobImage(Base):
    __tablename__ = "job_images"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id"), nullable=False)
    storage_key = Column(String, nullable=False)
    filename = Column(String, nullable=False)
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    bytes = Column(Integer, nullable=True)
    blur_metric = Column(Numeric(10, 4), nullable=True)  # Laplacian variance
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    job = relationship("Job", back_populates="images")

class JobOutput(Base):
    __tablename__ = "job_outputs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id"), nullable=False)
    format = Column(String, nullable=False)  # glb, usdz
    storage_key = Column(String, nullable=False)
    size_bytes = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    job = relationship("Job", back_populates="outputs")

class Batch(Base):
    __tablename__ = "batches"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("orgs.id"), nullable=False)
    status = Column(String, nullable=False, default="queued", index=True)
    source_type = Column(String, nullable=False)  # csv, manifest, zip
    source_url = Column(String, nullable=False)
    params = Column(JSONB, nullable=False, default=dict)
    total_jobs = Column(Integer, default=0)
    webhook_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    org = relationship("Org", back_populates="batches")

class WebhookEndpoint(Base):
    __tablename__ = "webhook_endpoints"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("orgs.id"), nullable=False)
    url = Column(String, nullable=False)
    secret = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    org = relationship("Org", back_populates="webhook_endpoints")

class WebhookEvent(Base):
    __tablename__ = "webhook_events"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("orgs.id"), nullable=True)
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id"), nullable=True)
    type = Column(String, nullable=False)  # job.completed, job.failed, batch.completed
    payload = Column(JSONB, nullable=False)
    delivered_at = Column(DateTime, nullable=True)
    attempts = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    job = relationship("Job", back_populates="webhook_events")

class UsageEvent(Base):
    __tablename__ = "usage_events"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id"), nullable=False)
    event_type = Column(String, nullable=False)  # gpu_minutes, processing_time, credits_charged
    gpu_minutes = Column(Numeric(10, 4), nullable=True)
    details = Column(JSONB, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    job = relationship("Job", back_populates="usage_events")

# Database setup functions
def create_engine_from_url(database_url: str):
    return create_engine(database_url, echo=False)

def create_tables(engine):
    Base.metadata.create_all(bind=engine)

def get_session_factory(engine):
    return sessionmaker(autocommit=False, autoflush=False, bind=engine)