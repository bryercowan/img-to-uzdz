# api/settings.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """
    Environment-driven config used by api/main.py
    (values come from your .env file or the real environment)
    """
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/imgto3d"
    
    # Redis
    REDIS_URL: str = "redis://redis:6379/0"
    
    # Stripe
    STRIPE_SECRET_KEY: str
    STRIPE_PRICE_ID: str
    STRIPE_WEBHOOK_SECRET: str
    
    # S3/Storage
    S3_ENDPOINT: str = ""
    S3_ACCESS_KEY: str = ""
    S3_SECRET_KEY: str = ""
    S3_BUCKET: str = "imgto3d-storage"
    S3_REGION: str = "us-east-1"
    
    # Google Cloud (legacy)
    GOOGLE_CLOUD_PROJECT_ID: str = ""
    GOOGLE_APPLICATION_CREDENTIALS: str = ""
    
    # App
    BASE_URL: str = "http://localhost:8000"
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30 * 24 * 60  # 30 days
    
    # Features
    FEATURE_USDZ: bool = False
    
    # Job settings
    JOB_MAX_ITER_FAST: int = 3000
    JOB_MAX_ITER_HIGH: int = 8000
    RUSH_QUEUE_ENABLED: bool = False
    
    # Credits pricing (per job)
    CREDITS_FAST_JOB: float = 1.0
    CREDITS_HIGH_JOB: float = 2.5
    CREDITS_RUSH_MULTIPLIER: float = 1.5
    
    class Config:
        env_file = ".env"

