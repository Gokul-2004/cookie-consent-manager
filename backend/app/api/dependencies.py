"""API dependencies (authentication, etc.)"""
from fastapi import HTTPException, Header, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from datetime import datetime
from app.core.database import get_db
from app.models.api_key import APIKey


async def verify_api_key(
    x_api_key: str = Header(..., alias="X-API-Key"),
    db: AsyncSession = Depends(get_db)
) -> APIKey:
    """Verify customer API key"""
    if not x_api_key:
        raise HTTPException(status_code=401, detail="API key required")
    
    result = await db.execute(
        select(APIKey).where(
            and_(
                APIKey.key == x_api_key,
                APIKey.is_active == True
            )
        )
    )
    api_key_obj = result.scalar_one_or_none()
    
    if not api_key_obj:
        raise HTTPException(status_code=401, detail="Invalid or inactive API key")
    
    # Check expiry
    if api_key_obj.expires_at and datetime.utcnow() > api_key_obj.expires_at:
        raise HTTPException(status_code=401, detail="API key has expired")
    
    return api_key_obj





