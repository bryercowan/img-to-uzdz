from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import User, Org, ApiKey
from settings import Settings
import hashlib
import secrets

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
settings = Settings()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def generate_api_key() -> tuple[str, str]:
    """Generate API key and its hash. Returns (key, hash)"""
    key = secrets.token_urlsafe(32)
    key_hash = hashlib.sha256(key.encode()).hexdigest()
    return key, key_hash

def verify_api_key(key: str, key_hash: str) -> bool:
    """Verify API key against stored hash"""
    return hashlib.sha256(key.encode()).hexdigest() == key_hash

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(credentials.credentials, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

async def get_api_key_org(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> tuple[Optional[User], Optional[Org]]:
    """Validate API key and return associated user/org. Returns (None, None) for invalid keys."""
    
    if not credentials.credentials.startswith("ak_"):
        return None, None
    
    # Look up API key
    api_keys = db.query(ApiKey).all()
    for api_key in api_keys:
        if verify_api_key(credentials.credentials, api_key.key_hash):
            # Update last used timestamp
            api_key.last_used_at = datetime.utcnow()
            db.commit()
            
            org = db.query(Org).filter(Org.id == api_key.org_id).first()
            user = db.query(User).filter(User.id == org.owner_user_id).first() if org else None
            return user, org
    
    return None, None

async def get_current_user_or_api_key(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> tuple[Optional[User], Optional[Org]]:
    """Get user from JWT token or API key. Returns (user, org) tuple."""
    
    # Try API key first
    if credentials.credentials.startswith("ak_"):
        return await get_api_key_org(credentials, db)
    
    # Try JWT token
    try:
        user = await get_current_user(credentials, db)
        # Get user's primary org
        org = db.query(Org).filter(Org.owner_user_id == user.id).first()
        return user, org
    except HTTPException:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )

# Database dependency - this will be imported from elsewhere
from database import SessionLocal

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()