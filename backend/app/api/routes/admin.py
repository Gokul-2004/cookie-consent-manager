"""Admin routes for API key management"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import secrets
import string
from app.core.database import get_db
from app.models.api_key import APIKey
from pydantic import BaseModel

router = APIRouter(prefix="/api/admin", tags=["Admin"])


class APIKeyCreate(BaseModel):
    customer_name: str
    customer_email: str = None


@router.get("/api-keys")
async def list_api_keys(db: AsyncSession = Depends(get_db)):
    """List all API keys"""
    result = await db.execute(select(APIKey).order_by(APIKey.created_at.desc()))
    keys = result.scalars().all()
    
    return [
        {
            "key": key.key,
            "customer_name": key.customer_name,
            "customer_email": key.customer_email,
            "is_active": key.is_active,
            "created_at": key.created_at.isoformat(),
            "expires_at": key.expires_at.isoformat() if key.expires_at else None
        }
        for key in keys
    ]

@router.post("/api-keys")
async def create_api_key(
    key_data: APIKeyCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new API key (for testing/admin)"""
    # Generate API key
    alphabet = string.ascii_letters + string.digits
    api_key = ''.join(secrets.choice(alphabet) for _ in range(32))
    
    # Ensure uniqueness
    while True:
        result = await db.execute(
            select(APIKey).where(APIKey.key == api_key)
        )
        if not result.scalar_one_or_none():
            break
        api_key = ''.join(secrets.choice(alphabet) for _ in range(32))
    
    # Create API key
    api_key_obj = APIKey(
        key=api_key,
        customer_name=key_data.customer_name,
        customer_email=key_data.customer_email,
        is_active=True
    )
    
    db.add(api_key_obj)
    await db.commit()
    await db.refresh(api_key_obj)
    
    return {
        "api_key": api_key,
        "customer_name": api_key_obj.customer_name,
        "customer_email": api_key_obj.customer_email,
        "created_at": api_key_obj.created_at.isoformat(),
        "warning": "Save this API key - it won't be shown again!"
    }

