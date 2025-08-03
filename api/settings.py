# api/settings.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """
    Environment-driven config used by api/main.py
    (values come from your .env file or the real environment)
    """
    STRIPE_SECRET_KEY: str
    STRIPE_PRICE_ID: str
    STRIPE_WEBHOOK_SECRET: str
    BASE_URL: str = "http://localhost:8000"
    REDIS_URL: str = "redis://redis:6379/0"

    class Config:
        env_file = ".env"   # FastAPI will load variables from this file automatically

