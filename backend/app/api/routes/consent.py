"""Consent Management Routes"""
from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from datetime import datetime, timedelta
from typing import Optional
import uuid
from app.core.database import get_db
from app.api.dependencies import verify_api_key
from app.models.api_key import APIKey
from app.models.consent import Consent
from app.models.consent_history import ConsentHistory
from app.models.script_config import ScriptConfig
from app.api.schemas import ConsentRequest, ConsentResponse, ConsentStatus
import asyncio
import aiohttp

router = APIRouter(prefix="/api/v1", tags=["Consent"])


@router.get("/consent/check", response_model=ConsentStatus)
async def check_consent(
    session_id: str,
    script_id: Optional[str] = None,
    api_key_obj: APIKey = Depends(verify_api_key),
    db: AsyncSession = Depends(get_db)
):
    """Check if user has given consent"""
    query = select(Consent).where(
        and_(
            Consent.session_id == session_id,
            Consent.api_key_id == api_key_obj.id,
            Consent.status == "active"
        )
    )
    
    if script_id:
        query = query.where(Consent.script_id == script_id)
    
    result = await db.execute(query.order_by(Consent.created_at.desc()))
    consent = result.scalar_one_or_none()
    
    if consent and consent.is_active():
        return {
            "has_consent": True,
            "consent_id": str(consent.id),
            "categories": consent.consent_categories,
            "last_updated": consent.updated_at
        }
    
    return {
        "has_consent": False,
        "consent_id": None,
        "categories": None,
        "last_updated": None
    }


@router.post("/consent/create", response_model=ConsentResponse)
async def create_consent(
    consent_data: ConsentRequest,
    request: Request,
    script_id: Optional[str] = None,
    api_key_obj: APIKey = Depends(verify_api_key),
    db: AsyncSession = Depends(get_db)
):
    """Create a new consent record"""
    # Get IP address
    ip_address = consent_data.ip_address or request.client.host if request.client else None
    
    # Get script config if script_id provided
    script_config = None
    if script_id:
        result = await db.execute(
            select(ScriptConfig).where(
                and_(
                    ScriptConfig.script_id == script_id,
                    ScriptConfig.api_key_id == api_key_obj.id
                )
            )
        )
        script_config = result.scalar_one_or_none()
    
    # Create consent
    consent = Consent(
        session_id=consent_data.session_id,
        user_id=consent_data.user_id,
        api_key_id=api_key_obj.id,
        script_id=script_id,
        consent_categories=consent_data.consent_categories,
        ip_address=ip_address,
        user_agent=consent_data.user_agent,
        status="active",
        expires_at=datetime.utcnow() + timedelta(days=365)  # 1 year expiry
    )
    
    db.add(consent)
    await db.commit()
    await db.refresh(consent)
    
    # Create history record
    history = ConsentHistory(
        consent_id=consent.id,
        session_id=consent.session_id,
        action=consent_data.action or "created",
        new_categories=consent.consent_categories,
        ip_address=ip_address,
        user_agent=consent_data.user_agent,
        extra_metadata={
            "referer": request.headers.get("referer"),
            "accept_language": request.headers.get("accept-language"),
            "timestamp": datetime.utcnow().isoformat()
        }
    )
    db.add(history)
    await db.commit()
    
    # Send webhook if configured
    if script_config and script_config.webhook_url:
        asyncio.create_task(send_webhook(script_config.webhook_url, consent, "created"))
    
    return {
        "consent_id": str(consent.id),
        "status": consent.status,
        "timestamp": consent.created_at,
        "expires_at": consent.expires_at
    }


@router.put("/consent/{consent_id}", response_model=ConsentResponse)
async def update_consent(
    consent_id: str,
    consent_data: ConsentRequest,
    request: Request,
    api_key_obj: APIKey = Depends(verify_api_key),
    db: AsyncSession = Depends(get_db)
):
    """Update an existing consent"""
    consent_uuid = uuid.UUID(consent_id)
    result = await db.execute(
        select(Consent).where(
            and_(
                Consent.id == consent_uuid,
                Consent.api_key_id == api_key_obj.id
            )
        )
    )
    consent = result.scalar_one_or_none()
    
    if not consent:
        raise HTTPException(status_code=404, detail="Consent not found")
    
    # Store previous categories for history
    previous_categories = consent.consent_categories.copy()
    
    # Update consent
    consent.consent_categories = consent_data.consent_categories
    consent.ip_address = consent_data.ip_address or request.client.host if request.client else consent.ip_address
    consent.user_agent = consent_data.user_agent or consent.user_agent
    
    await db.commit()
    await db.refresh(consent)
    
    # Create history record
    history = ConsentHistory(
        consent_id=consent.id,
        session_id=consent.session_id,
        action=consent_data.action or "updated",
        previous_categories=previous_categories,
        new_categories=consent.consent_categories,
        ip_address=consent.ip_address,
        user_agent=consent.user_agent,
        extra_metadata={
            "referer": request.headers.get("referer"),
            "accept_language": request.headers.get("accept-language"),
            "timestamp": datetime.utcnow().isoformat()
        }
    )
    db.add(history)
    await db.commit()
    
    # Send webhook if configured
    if consent.script_id:
        result = await db.execute(
            select(ScriptConfig).where(ScriptConfig.script_id == consent.script_id)
        )
        script_config = result.scalar_one_or_none()
        if script_config and script_config.webhook_url:
            asyncio.create_task(send_webhook(script_config.webhook_url, consent, "updated"))
    
    return {
        "consent_id": str(consent.id),
        "status": consent.status,
        "timestamp": consent.updated_at or consent.created_at,
        "expires_at": consent.expires_at
    }


async def send_webhook(webhook_url: str, consent: Consent, action: str):
    """Send consent data to webhook URL"""
    try:
        async with aiohttp.ClientSession() as session:
            payload = {
                "consent_id": str(consent.id),
                "session_id": consent.session_id,
                "action": action,
                "categories": consent.consent_categories,
                "status": consent.status,
                "created_at": consent.created_at.isoformat(),
                "updated_at": consent.updated_at.isoformat() if consent.updated_at else None,
                "expires_at": consent.expires_at.isoformat() if consent.expires_at else None
            }
            async with session.post(webhook_url, json=payload, timeout=aiohttp.ClientTimeout(total=5)) as response:
                if response.status == 200:
                    return await response.json()
    except Exception as e:
        print(f"Error sending webhook: {e}")
        return None

