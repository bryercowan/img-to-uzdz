from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime
from uuid import UUID
from decimal import Decimal

# Error schemas
class ErrorDetail(BaseModel):
    code: str
    message: str
    field: Optional[str] = None

class APIError(BaseModel):
    error: ErrorDetail
    request_id: Optional[str] = None

# Auth schemas
class UserSignup(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    org_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: UUID
    org_id: Optional[UUID] = None

class ApiKeyCreate(BaseModel):
    name: str
    org_id: Optional[UUID] = None

class ApiKeyResponse(BaseModel):
    id: UUID
    name: str
    key: str  # Only returned on creation
    created_at: datetime

# Upload schemas
class PresignRequest(BaseModel):
    filenames: List[str]
    content_types: List[str]

class PresignedUrl(BaseModel):
    put_url: str
    key: str
    content_type: str

class PresignResponse(BaseModel):
    urls: List[PresignedUrl]

# Job schemas
class ImageRef(BaseModel):
    url: str
    filename: str

class JobParams(BaseModel):
    quality: Literal["fast", "high"] = "fast"
    target_formats: List[Literal["glb", "usdz"]] = Field(default_factory=lambda: ["glb"])
    max_iterations: Optional[int] = None
    mesh_simplify_target_tris: Optional[int] = 150000
    compress: bool = True

class JobCreate(BaseModel):
    images: List[ImageRef]
    params: JobParams = Field(default_factory=JobParams)
    webhook_url: Optional[str] = None
    org_id: Optional[UUID] = None

class JobPreview(BaseModel):
    images: List[ImageRef]

class JobPreviewResponse(BaseModel):
    ok: bool
    warnings: List[str] = Field(default_factory=list)
    preview_token: str
    estimate_credits: Decimal
    estimate_minutes: int

class JobOutput(BaseModel):
    format: str
    url: str
    size_bytes: int

class JobResponse(BaseModel):
    id: UUID
    status: Literal["queued", "running", "exporting", "completed", "failed", "canceled"]
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    estimate_credits: Optional[Decimal] = None
    cost_credits: Optional[Decimal] = None
    outputs: List[JobOutput] = Field(default_factory=list)
    errors: List[str] = Field(default_factory=list)

class JobCreateResponse(BaseModel):
    id: UUID
    status: str
    cost_estimate_credits: Decimal

# Batch schemas
class BatchCreate(BaseModel):
    source: Literal["csv", "manifest", "zip"]
    url: str
    params: Optional[JobParams] = None
    webhook_url: Optional[str] = None
    org_id: UUID

class BatchResponse(BaseModel):
    batch_id: UUID
    status: str
    total_jobs: int
    completed_jobs: int
    failed_jobs: int
    jobs: List[JobResponse] = Field(default_factory=list)

# Billing schemas
class CreditBalance(BaseModel):
    org_id: UUID
    balance: Decimal
    usage_this_month: Decimal

class EstimateRequest(BaseModel):
    job_count: int = 1
    params: JobParams = Field(default_factory=JobParams)

class EstimateResponse(BaseModel):
    total_credits: Decimal
    per_job_credits: Decimal
    estimated_minutes_per_job: int

class CheckoutSessionCreate(BaseModel):
    preview_token: str
    success_url: Optional[str] = None
    cancel_url: Optional[str] = None

class CheckoutSessionResponse(BaseModel):
    session_url: str
    session_id: str

# Webhook schemas
class WebhookEndpointCreate(BaseModel):
    url: str
    org_id: UUID

class WebhookEndpointResponse(BaseModel):
    id: UUID
    url: str
    secret: str  # Only returned on creation
    created_at: datetime

# Usage and analytics schemas
class UsageRecord(BaseModel):
    job_id: UUID
    event_type: str
    gpu_minutes: Optional[Decimal] = None
    details: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime

class HealthResponse(BaseModel):
    status: str = "ok"
    version: str
    database: str
    redis: str
    timestamp: datetime

# Studio-specific schemas (for backward compatibility)
class StudioUploadResponse(BaseModel):
    checkout_url: str
    job_id: UUID
    preview_data: Dict[str, Any]

class StudioResultResponse(BaseModel):
    status: str
    preview_data: Optional[Dict[str, Any]] = None
    download_available: bool = False
    message: Optional[str] = None

# Config for Pydantic models
class BaseConfig:
    model_config = ConfigDict(
        from_attributes=True,
        use_enum_values=True,
        json_encoders={
            datetime: lambda v: v.isoformat(),
            Decimal: lambda v: float(v),
            UUID: lambda v: str(v)
        }
    )

# Apply config to all models
for model_name in globals():
    model = globals()[model_name]
    if isinstance(model, type) and issubclass(model, BaseModel) and model != BaseModel:
        if not hasattr(model, 'model_config'):
            model.model_config = ConfigDict(
                from_attributes=True,
                use_enum_values=True,
                json_encoders={
                    datetime: lambda v: v.isoformat(),
                    Decimal: lambda v: float(v),
                    UUID: lambda v: str(v)
                }
            )