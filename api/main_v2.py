from fastapi import FastAPI, HTTPException, Depends, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
import stripe
import redis
import uuid
from datetime import datetime, timedelta
from decimal import Decimal
from typing import List, Optional
import json
import hashlib
import hmac

from settings import Settings
from database import (
    create_engine_from_url, get_session_factory, create_tables,
    User, Org, Job, JobImage, JobOutput, ApiKey, 
    CreditsLedger, StripeCustomer, WebhookEndpoint, WebhookEvent,
    Batch, UsageEvent
)
from models import (
    # Auth
    UserSignup, UserLogin, AuthResponse, ApiKeyCreate, ApiKeyResponse,
    # Uploads & Jobs
    PresignRequest, PresignResponse, JobCreate, JobPreview, JobPreviewResponse,
    JobResponse, JobCreateResponse, JobOutput as JobOutputModel,
    # Batch
    BatchCreate, BatchResponse,
    # Billing
    CreditBalance, EstimateRequest, EstimateResponse,
    CheckoutSessionCreate, CheckoutSessionResponse,
    # Webhooks
    WebhookEndpointCreate, WebhookEndpointResponse,
    # Health & errors
    HealthResponse, APIError, ErrorDetail,
    # Studio legacy
    StudioUploadResponse, StudioResultResponse
)
from auth import (
    get_password_hash, verify_password, create_access_token,
    generate_api_key, get_current_user, get_current_user_or_api_key,
    get_db
)
from storage import S3StorageManager, generate_presigned_upload_urls, generate_storage_key
from validation import validate_images_for_preview, estimate_job_cost
from queue import job_queue
from credits import CreditsManager
from batch import batch_processor
from metrics import MetricsCollector, export_prometheus_metrics

# Initialize app
app = FastAPI(
    title="3D Model Generation API",
    description="Convert images to 3D models (GLB/USDZ) with Studio, API, and Batch tiers",
    version="1.0.0",
    openapi_url="/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize dependencies
settings = Settings()
stripe.api_key = settings.STRIPE_SECRET_KEY
redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

# Database setup
engine = create_engine_from_url(settings.DATABASE_URL)
SessionLocal = get_session_factory(engine)
create_tables(engine)

# Update auth.py to use our SessionLocal
import auth
auth.SessionLocal = SessionLocal

# Storage manager
storage = S3StorageManager()

# Metrics collector
metrics_collector = MetricsCollector(redis_client)

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": f"HTTP_{exc.status_code}",
                "message": exc.detail
            }
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred"
            }
        }
    )

# Health endpoint
@app.get("/healthz", response_model=HealthResponse)
async def health_check():
    try:
        redis_client.ping()
        redis_status = "ok"
    except:
        redis_status = "error"
    
    try:
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        db_status = "ok"
    except:
        db_status = "error"
    
    return HealthResponse(
        status="ok" if redis_status == "ok" and db_status == "ok" else "degraded",
        version="1.0.0",
        database=db_status,
        redis=redis_status,
        timestamp=datetime.utcnow()
    )

# Auth endpoints
@app.post("/auth/signup", response_model=AuthResponse)
async def signup(user_data: UserSignup, db: Session = Depends(get_db)):
    # Check if user exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = User(
        email=user_data.email,
        password_hash=get_password_hash(user_data.password)
    )
    db.add(user)
    db.flush()
    
    # Create org if provided
    org = None
    if user_data.org_name:
        org = Org(name=user_data.org_name, owner_user_id=user.id)
        db.add(org)
        db.flush()
    
    db.commit()
    
    # Generate token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return AuthResponse(
        access_token=access_token,
        user_id=user.id,
        org_id=org.id if org else None
    )

@app.post("/auth/login", response_model=AuthResponse)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Get user's primary org
    org = db.query(Org).filter(Org.owner_user_id == user.id).first()
    
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return AuthResponse(
        access_token=access_token,
        user_id=user.id,
        org_id=org.id if org else None
    )

@app.post("/auth/keys", response_model=ApiKeyResponse)
async def create_api_key(
    key_data: ApiKeyCreate,
    current_user_org: tuple = Depends(get_current_user_or_api_key),
    db: Session = Depends(get_db)
):
    user, org = current_user_org
    if not user or not org:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    target_org_id = key_data.org_id or org.id
    
    # Generate API key
    key, key_hash = generate_api_key()
    
    api_key = ApiKey(
        org_id=target_org_id,
        name=key_data.name,
        key_hash=key_hash
    )
    db.add(api_key)
    db.commit()
    
    return ApiKeyResponse(
        id=api_key.id,
        name=api_key.name,
        key=f"ak_{key}",  # Prefix for identification
        created_at=api_key.created_at
    )

@app.get("/auth/me")
async def get_current_user_info(
    current_user_org: tuple = Depends(get_current_user_or_api_key),
    db: Session = Depends(get_db)
):
    """Get current user information"""
    user, org = current_user_org
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    return {
        "id": str(user.id),
        "email": user.email,
        "org_id": str(org.id) if org else None
    }

# Admin endpoints
@app.get("/admin/stats")
async def get_admin_stats(
    current_user_org: tuple = Depends(get_current_user_or_api_key),
    db: Session = Depends(get_db)
):
    """Get system statistics (admin only)"""
    user, org = current_user_org
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Check if user is admin (you can implement proper role checking here)
    if user.email != 'admin@img-to-uzdz.com':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Get stats from database
    total_users = db.query(User).count()
    total_orgs = db.query(Org).count()
    total_jobs = db.query(Job).count()
    
    # Jobs today
    today = datetime.utcnow().date()
    jobs_today = db.query(Job).filter(
        Job.created_at >= datetime.combine(today, datetime.min.time())
    ).count()
    
    # Jobs this month
    first_of_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    jobs_this_month = db.query(Job).filter(Job.created_at >= first_of_month).count()
    
    # Revenue this month (approximate from credits ledger)
    revenue_credits = db.query(CreditsLedger).filter(
        CreditsLedger.created_at >= first_of_month,
        CreditsLedger.amount > 0
    ).all()
    revenue_this_month = sum([entry.amount * Decimal('0.80') for entry in revenue_credits])  # Assuming ~$0.80 per credit
    
    # Worker stats from Redis
    try:
        active_workers = len(redis_client.smembers("active_workers") or [])
        queue_size = redis_client.llen("job_queue") or 0
    except:
        active_workers = 0
        queue_size = 0
    
    return {
        "total_users": total_users,
        "total_orgs": total_orgs,
        "total_jobs": total_jobs,
        "jobs_today": jobs_today,
        "jobs_this_month": jobs_this_month,
        "revenue_this_month": float(revenue_this_month),
        "active_workers": active_workers,
        "queue_size": queue_size
    }

@app.get("/admin/activity")
async def get_admin_activity(
    current_user_org: tuple = Depends(get_current_user_or_api_key),
    db: Session = Depends(get_db)
):
    """Get recent system activity (admin only)"""
    user, org = current_user_org
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    if user.email != 'admin@img-to-uzdz.com':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Get recent activity from usage events
    recent_events = db.query(UsageEvent).order_by(UsageEvent.timestamp.desc()).limit(50).all()
    
    activity = []
    for event in recent_events:
        activity.append({
            "id": str(event.id),
            "type": event.event_type,
            "message": event.description or f"{event.event_type} event",
            "timestamp": event.timestamp.isoformat(),
            "user_id": str(event.user_id) if event.user_id else None,
            "org_id": str(event.org_id) if event.org_id else None
        })
    
    return activity

@app.post("/admin/system-message")
async def send_system_message(
    request: dict,
    current_user_org: tuple = Depends(get_current_user_or_api_key),
    db: Session = Depends(get_db)
):
    """Send system-wide message (admin only)"""
    user, org = current_user_org
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    if user.email != 'admin@img-to-uzdz.com':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    message = request.get("message", "")
    if not message:
        raise HTTPException(status_code=400, detail="Message is required")
    
    # Store system message in Redis with expiration
    redis_client.setex("system_message", 86400, message)  # 24 hours
    
    # Log the action
    usage_event = UsageEvent(
        user_id=user.id,
        org_id=org.id if org else None,
        event_type="system_message_sent",
        description=f"System message sent: {message[:50]}..."
    )
    db.add(usage_event)
    db.commit()
    
    return {"success": True}

@app.get("/admin/maintenance")
async def get_maintenance_mode(
    current_user_org: tuple = Depends(get_current_user_or_api_key),
    db: Session = Depends(get_db)
):
    """Get maintenance mode status (admin only)"""
    user, org = current_user_org
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    if user.email != 'admin@img-to-uzdz.com':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    enabled = redis_client.get("maintenance_mode") == "true"
    return {"enabled": enabled}

@app.post("/admin/maintenance")
async def set_maintenance_mode(
    request: dict,
    current_user_org: tuple = Depends(get_current_user_or_api_key),
    db: Session = Depends(get_db)
):
    """Set maintenance mode (admin only)"""
    user, org = current_user_org
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    if user.email != 'admin@img-to-uzdz.com':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    enabled = request.get("enabled", False)
    
    if enabled:
        redis_client.set("maintenance_mode", "true")
    else:
        redis_client.delete("maintenance_mode")
    
    # Log the action
    usage_event = UsageEvent(
        user_id=user.id,
        org_id=org.id if org else None,
        event_type="maintenance_mode_changed",
        description=f"Maintenance mode {'enabled' if enabled else 'disabled'}"
    )
    db.add(usage_event)
    db.commit()
    
    return {"success": True}

# Billing endpoints
@app.get("/billing/credits")
async def get_credit_balance(
    current_user_org: tuple = Depends(get_current_user_or_api_key),
    db: Session = Depends(get_db)
):
    """Get current credit balance for the organization"""
    user, org = current_user_org
    if not user or not org:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Calculate current balance from credits ledger
    credits_entries = db.query(CreditsLedger).filter(CreditsLedger.org_id == org.id).all()
    balance = sum([entry.amount for entry in credits_entries])
    
    # Calculate usage this month
    first_of_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    usage_entries = db.query(CreditsLedger).filter(
        CreditsLedger.org_id == org.id,
        CreditsLedger.created_at >= first_of_month,
        CreditsLedger.amount < 0  # Negative amounts are usage
    ).all()
    usage_this_month = abs(sum([entry.amount for entry in usage_entries]))
    
    return {
        "org_id": str(org.id),
        "balance": float(balance),
        "usage_this_month": float(usage_this_month)
    }

@app.post("/billing/stripe/checkout-session")
async def create_checkout_session(
    request: dict,
    current_user_org: tuple = Depends(get_current_user_or_api_key),
    db: Session = Depends(get_db)
):
    """Create Stripe checkout session for credit purchases or Studio payment"""
    user, org = current_user_org
    
    # Handle Studio payment (with preview_token)
    preview_token = request.get("preview_token")
    if preview_token:
        # Studio payment - no auth required
        preview_data = redis_client.hgetall(f"preview:{preview_token}")
        if not preview_data:
            raise HTTPException(status_code=400, detail="Invalid preview token")
        
        try:
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': '3D Model Generation',
                            'description': 'Studio tier - one-time 3D model generation',
                        },
                        'unit_amount': 300,  # $3.00
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url=request.get('success_url', 'http://localhost:3000/success'),
                cancel_url=request.get('cancel_url', 'http://localhost:3000/'),
                metadata={
                    'preview_token': preview_token,
                    'type': 'studio'
                }
            )
            
            return {
                "session_url": session.url,
                "session_id": session.id
            }
            
        except stripe.error.StripeError as e:
            raise HTTPException(status_code=400, detail=str(e))
    
    # Handle credit package purchase (requires auth)
    if not user or not org:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # For credit packages, you'd fetch from your Stripe products
    # For now, we'll handle the basic case
    credits = request.get("credits", 10)
    amount = request.get("amount", 1000)  # in cents
    
    try:
        # Get or create Stripe customer
        stripe_customer = db.query(StripeCustomer).filter(StripeCustomer.org_id == org.id).first()
        if not stripe_customer:
            customer = stripe.Customer.create(
                email=user.email,
                metadata={'org_id': str(org.id)}
            )
            stripe_customer = StripeCustomer(
                id=str(uuid.uuid4()),
                org_id=org.id,
                stripe_customer_id=customer.id
            )
            db.add(stripe_customer)
            db.commit()
        
        session = stripe.checkout.Session.create(
            customer=stripe_customer.stripe_customer_id,
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': f'{credits} Credits',
                        'description': f'Credit package for 3D model generation',
                    },
                    'unit_amount': amount,
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=request.get('success_url', 'http://localhost:3000/success'),
            cancel_url=request.get('cancel_url', 'http://localhost:3000/'),
            metadata={
                'org_id': str(org.id),
                'credits': str(credits),
                'type': 'credits'
            }
        )
        
        return {
            "session_url": session.url,
            "session_id": session.id
        }
        
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/billing/stripe/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle Stripe webhooks"""
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        metadata = session.get('metadata', {})
        
        if metadata.get('type') == 'studio':
            # Handle Studio payment
            preview_token = metadata.get('preview_token')
            if preview_token:
                # Create Studio job from preview
                await create_studio_job_from_preview(preview_token, session, db)
        
        elif metadata.get('type') == 'credits':
            # Handle credit purchase
            org_id = metadata.get('org_id')
            credits = int(metadata.get('credits', 0))
            
            if org_id and credits > 0:
                # Add credits to ledger
                credit_entry = CreditsLedger(
                    id=str(uuid.uuid4()),
                    org_id=org_id,
                    amount=Decimal(str(credits)),
                    transaction_type='purchase',
                    reference_type='stripe_payment',
                    reference_id=session['payment_intent']
                )
                db.add(credit_entry)
                db.commit()
    
    return {"status": "success"}

# Upload endpoints
@app.post("/uploads/presign", response_model=PresignResponse)
async def presign_uploads(
    request: PresignRequest,
    current_user_org: tuple = Depends(get_current_user_or_api_key),
    db: Session = Depends(get_db)
):
    user, org = current_user_org
    org_id = str(org.id) if org else None
    
    if len(request.filenames) != len(request.content_types):
        raise HTTPException(status_code=400, detail="Filenames and content_types must have same length")
    
    # Validate content types
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/heic"]
    for ct in request.content_types:
        if ct not in allowed_types:
            raise HTTPException(status_code=400, detail=f"Unsupported content type: {ct}")
    
    urls = generate_presigned_upload_urls(request.filenames, request.content_types, org_id)
    
    return PresignResponse(urls=urls)

# Job endpoints - Preview for Studio
@app.post("/jobs/preview", response_model=JobPreviewResponse)
async def preview_job(request: JobPreview):
    """Preview validation for Studio (no auth required)"""
    
    if len(request.images) < 3 or len(request.images) > 30:
        raise HTTPException(status_code=400, detail="Need 3-30 images for processing")
    
    # Run basic validation (coverage, blur, etc.)
    validation_result = validate_images_for_preview(request.images)
    
    if not validation_result["ok"]:
        return JobPreviewResponse(
            ok=False,
            warnings=validation_result["errors"],
            preview_token="",
            estimate_credits=Decimal("0"),
            estimate_minutes=0
        )
    
    # Generate preview token
    preview_token = str(uuid.uuid4())
    
    # Store preview data in Redis temporarily
    redis_client.hset(f"preview:{preview_token}", mapping={
        "images": json.dumps([img.dict() for img in request.images]),
        "created_at": datetime.utcnow().isoformat(),
        "validated": "true"
    })
    redis_client.expire(f"preview:{preview_token}", 3600)  # 1 hour
    
    estimate = estimate_job_cost("fast", ["glb"])
    
    return JobPreviewResponse(
        ok=True,
        warnings=validation_result.get("warnings", []),
        preview_token=preview_token,
        estimate_credits=estimate["credits"],
        estimate_minutes=estimate["minutes"]
    )

# Job endpoints - Create job
@app.post("/jobs", response_model=JobCreateResponse, status_code=202)
async def create_job(
    request: JobCreate,
    current_user_org: tuple = Depends(get_current_user_or_api_key),
    db: Session = Depends(get_db)
):
    user, org = current_user_org
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Validate credits
    if org:
        estimate = estimate_job_cost(request.params.quality, request.params.target_formats)
        if not CreditsManager.can_afford_job(org.id, request.params.quality, request.params.target_formats, settings, db):
            raise HTTPException(status_code=400, detail="Insufficient credits")
    
    # Create job
    job = Job(
        org_id=org.id if org else None,
        created_by_user_id=user.id,
        status="queued",
        quality=request.params.quality,
        target_formats=request.params.target_formats,
        estimate_credits=estimate["credits"],
        webhook_url=request.webhook_url,
        is_studio=False
    )
    db.add(job)
    db.flush()
    
    # Create job images
    for img in request.images:
        job_image = JobImage(
            job_id=job.id,
            storage_key=img.url,  # This should be the S3 key from presigned upload
            filename=img.filename
        )
        db.add(job_image)
    
    db.commit()
    
    # Queue job for processing
    job_queue.enqueue_job(str(job.id), "standard")
    
    return JobCreateResponse(
        id=job.id,
        status=job.status,
        cost_estimate_credits=job.estimate_credits
    )

@app.get("/jobs/{job_id}", response_model=JobResponse)
async def get_job(
    job_id: str,
    current_user_org: tuple = Depends(get_current_user_or_api_key),
    db: Session = Depends(get_db)
):
    user, org = current_user_org
    
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Check access rights
    if job.org_id and (not org or job.org_id != org.id):
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get outputs with presigned URLs
    outputs = []
    for output in job.outputs:
        download_url = storage.generate_presigned_download_url(output.storage_key)
        outputs.append(JobOutputModel(
            format=output.format,
            url=download_url,
            size_bytes=output.size_bytes
        ))
    
    return JobResponse(
        id=job.id,
        status=job.status,
        created_at=job.created_at,
        started_at=job.started_at,
        completed_at=job.completed_at,
        estimate_credits=job.estimate_credits,
        cost_credits=job.cost_credits,
        outputs=outputs,
        errors=[job.error_message] if job.error_message else []
    )

@app.delete("/jobs/{job_id}")
async def cancel_job(
    job_id: str,
    current_user_org: tuple = Depends(get_current_user_or_api_key),
    db: Session = Depends(get_db)
):
    user, org = current_user_org
    
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.org_id and (not org or job.org_id != org.id):
        raise HTTPException(status_code=403, detail="Access denied")
    
    if job.status not in ["queued", "running"]:
        raise HTTPException(status_code=400, detail="Job cannot be canceled")
    
    job.status = "canceled"
    db.commit()
    
    return {"message": "Job canceled"}

# Billing endpoints
@app.get("/billing/credits", response_model=CreditBalance)
async def get_credits(
    current_user_org: tuple = Depends(get_current_user_or_api_key),
    db: Session = Depends(get_db)
):
    user, org = current_user_org
    if not org:
        raise HTTPException(status_code=400, detail="Organization required")
    
    balance = CreditsManager.get_balance(str(org.id), db)
    usage_this_month = CreditsManager.get_usage_this_month(str(org.id), db)
    
    return CreditBalance(
        org_id=org.id,
        balance=balance,
        usage_this_month=usage_this_month
    )

@app.post("/billing/estimate", response_model=EstimateResponse)
async def estimate_costs(request: EstimateRequest):
    estimate = estimate_job_cost(request.params.quality, request.params.target_formats)
    
    return EstimateResponse(
        total_credits=estimate["credits"] * request.job_count,
        per_job_credits=estimate["credits"],
        estimated_minutes_per_job=estimate["minutes"]
    )

# Studio Stripe checkout
@app.post("/billing/stripe/checkout-session", response_model=CheckoutSessionResponse)
async def create_checkout_session(request: CheckoutSessionCreate):
    # Validate preview token
    preview_data = redis_client.hgetall(f"preview:{request.preview_token}")
    if not preview_data:
        raise HTTPException(status_code=400, detail="Invalid or expired preview token")
    
    # Create Stripe checkout session
    session = stripe.checkout.Session.create(
        mode="payment",
        line_items=[{
            "price": settings.STRIPE_PRICE_ID,
            "quantity": 1
        }],
        success_url=request.success_url or f"{settings.BASE_URL}/success?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=request.cancel_url or f"{settings.BASE_URL}/",
        metadata={"preview_token": request.preview_token}
    )
    
    return CheckoutSessionResponse(
        session_url=session.url,
        session_id=session.id
    )

# Stripe webhook
@app.post("/webhooks/stripe")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        preview_token = session.get("metadata", {}).get("preview_token")
        
        if preview_token:
            # Create Studio job from preview
            await create_studio_job_from_preview(preview_token, session, db)
    
    return {"received": True}

# Batch endpoints
@app.post("/batches", response_model=BatchResponse, status_code=202)
async def create_batch(
    request: BatchCreate,
    current_user_org: tuple = Depends(get_current_user_or_api_key),
    db: Session = Depends(get_db)
):
    user, org = current_user_org
    if not user or not org:
        raise HTTPException(status_code=401, detail="Organization authentication required")
    
    if request.org_id != org.id:
        raise HTTPException(status_code=403, detail="Invalid organization")
    
    # Create batch record
    batch = Batch(
        org_id=request.org_id,
        status="processing",
        source_type=request.source,
        source_url=request.url,
        params=request.params.dict() if request.params else {},
        webhook_url=request.webhook_url
    )
    db.add(batch)
    db.commit()
    
    # Process batch asynchronously
    try:
        result = batch_processor.process_batch(
            str(batch.id),
            request.source,
            request.url,
            request.params or JobParams(),
            str(request.org_id),
            db
        )
        
        if result["success"]:
            batch.status = "completed"
            batch.total_jobs = result["jobs_created"]
            batch.completed_at = datetime.utcnow()
        else:
            batch.status = "failed"
            print(f"Batch processing failed: {result.get('error')}")
        
        db.commit()
        
    except Exception as e:
        batch.status = "failed"
        db.commit()
        print(f"Batch processing error: {e}")
    
    return BatchResponse(
        batch_id=batch.id,
        status=batch.status,
        total_jobs=batch.total_jobs,
        completed_jobs=0,  # Would be calculated from job statuses
        failed_jobs=0,
        jobs=[]  # Would include job details in full implementation
    )

@app.get("/batches/{batch_id}", response_model=BatchResponse)
async def get_batch(
    batch_id: str,
    current_user_org: tuple = Depends(get_current_user_or_api_key),
    db: Session = Depends(get_db)
):
    user, org = current_user_org
    
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    if batch.org_id != org.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get batch jobs
    jobs = db.query(Job).filter(Job.org_id == batch.org_id).all()
    job_responses = []
    
    completed_jobs = 0
    failed_jobs = 0
    
    for job in jobs[:10]:  # Limit to first 10 jobs for response
        if job.status == "completed":
            completed_jobs += 1
        elif job.status == "failed":
            failed_jobs += 1
        
        # Get outputs
        outputs = []
        for output in job.outputs:
            download_url = storage.generate_presigned_download_url(output.storage_key)
            outputs.append(JobOutputModel(
                format=output.format,
                url=download_url,
                size_bytes=output.size_bytes
            ))
        
        job_responses.append(JobResponse(
            id=job.id,
            status=job.status,
            created_at=job.created_at,
            started_at=job.started_at,
            completed_at=job.completed_at,
            estimate_credits=job.estimate_credits,
            cost_credits=job.cost_credits,
            outputs=outputs,
            errors=[job.error_message] if job.error_message else []
        ))
    
    return BatchResponse(
        batch_id=batch.id,
        status=batch.status,
        total_jobs=batch.total_jobs,
        completed_jobs=completed_jobs,
        failed_jobs=failed_jobs,
        jobs=job_responses
    )

# Metrics endpoints
@app.get("/metrics")
async def get_metrics(db: Session = Depends(get_db)):
    """Get system metrics (Prometheus format)"""
    return export_prometheus_metrics(db, redis_client)

@app.get("/admin/metrics")
async def get_admin_metrics(
    current_user_org: tuple = Depends(get_current_user_or_api_key),
    db: Session = Depends(get_db)
):
    """Get detailed system metrics (admin only)"""
    user, org = current_user_org
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # In a real system, you'd check for admin permissions here
    
    system_metrics = metrics_collector.get_system_metrics(db)
    api_metrics = metrics_collector.get_api_metrics(24)
    
    return {
        "system": system_metrics,
        "api": api_metrics
    }

@app.get("/admin/metrics/org/{org_id}")
async def get_org_metrics(
    org_id: str,
    current_user_org: tuple = Depends(get_current_user_or_api_key),
    db: Session = Depends(get_db)
):
    """Get metrics for a specific organization"""
    user, org = current_user_org
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Check if user has access to this org
    if str(org.id) != org_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return metrics_collector.get_org_metrics(org_id, db)

# Helper functions

async def create_studio_job_from_preview(preview_token: str, stripe_session: dict, db: Session):
    """Create a Studio job from a completed preview/payment"""
    preview_data = redis_client.hgetall(f"preview:{preview_token}")
    if not preview_data:
        return
    
    images_data = json.loads(preview_data["images"])
    
    # Create Studio job
    job = Job(
        status="queued",
        quality="fast",
        target_formats=["glb", "usdz"] if settings.FEATURE_USDZ else ["glb"],
        estimate_credits=Decimal("0"),  # Studio jobs are pre-paid
        preview_token=preview_token,
        is_studio=True
    )
    db.add(job)
    db.flush()
    
    # Add images
    for img_data in images_data:
        job_image = JobImage(
            job_id=job.id,
            storage_key=img_data["url"],
            filename=img_data["filename"]
        )
        db.add(job_image)
    
    db.commit()
    
    # Store Stripe customer info
    customer_id = stripe_session.get("customer")
    if customer_id:
        stripe_customer = StripeCustomer(
            stripe_customer_id=customer_id
        )
        db.add(stripe_customer)
        db.commit()
    
    # Queue for processing
    job_queue.enqueue_job(str(job.id), "standard")
    
    # Update Redis with job ID
    redis_client.hset(f"preview:{preview_token}", "job_id", str(job.id))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)