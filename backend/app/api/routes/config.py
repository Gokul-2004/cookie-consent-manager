"""Script Configuration Routes - OneTrust-style"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
import secrets
import string
from app.core.database import get_db
from app.api.dependencies import verify_api_key
from app.models.api_key import APIKey
from app.models.script_config import ScriptConfig
from app.api.schemas import ScriptConfigCreate, ScriptConfigUpdate, ScriptConfigResponse

router = APIRouter(prefix="/api", tags=["Script Configuration"])


@router.get("/config/{script_id}")
async def get_script_config(script_id: str, db: AsyncSession = Depends(get_db)):
    """
    Public endpoint to get script configuration by script ID
    Used by the widget to fetch its configuration
    No authentication required (public config)
    """
    result = await db.execute(
        select(ScriptConfig).where(
            and_(
                ScriptConfig.script_id == script_id,
                ScriptConfig.is_published == True,
                ScriptConfig.is_active == True
            )
        )
    )
    config = result.scalar_one_or_none()
    
    if not config:
        raise HTTPException(status_code=404, detail="Script configuration not found or not published")
    
    return {
        "script_id": config.script_id,
        "domain": config.domain,
        "categories": config.categories,
        "banner_config": config.banner_config,
        "default_language": config.default_language,
        "supported_languages": config.supported_languages,
        "cookie_policy_url": config.cookie_policy_url,
        "webhook_url": config.webhook_url,
        "external_tool_url": config.external_tool_url
    }


@router.post("/script-configs", response_model=dict)
async def create_script_config(
    config_data: ScriptConfigCreate,
    api_key_obj: APIKey = Depends(verify_api_key),
    db: AsyncSession = Depends(get_db)
):
    """Create a new script configuration"""
    # Use custom script_id if provided, otherwise generate one
    if config_data.script_id:
        script_id = config_data.script_id
        # Check if it already exists
        result = await db.execute(
            select(ScriptConfig).where(ScriptConfig.script_id == script_id)
        )
        if result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail=f"Script ID '{script_id}' already exists")
    else:
        # Generate unique script ID (alphanumeric, 12 characters)
        alphabet = string.ascii_lowercase + string.digits
        script_id = ''.join(secrets.choice(alphabet) for _ in range(12))
        
        # Ensure uniqueness
        while True:
            result = await db.execute(
                select(ScriptConfig).where(ScriptConfig.script_id == script_id)
            )
            if not result.scalar_one_or_none():
                break
            script_id = ''.join(secrets.choice(alphabet) for _ in range(12))
    
    # Create config
    script_config = ScriptConfig(
        script_id=script_id,
        api_key_id=api_key_obj.id,
        domain=config_data.domain,
        categories=config_data.categories,
        banner_config=config_data.banner_config,
        default_language=config_data.default_language,
        supported_languages=config_data.supported_languages,
        cookie_policy_url=config_data.cookie_policy_url,
        webhook_url=config_data.webhook_url,
        external_tool_url=config_data.external_tool_url,
        is_active=True,
        is_published=False
    )
    
    db.add(script_config)
    await db.commit()
    await db.refresh(script_config)
    
    return {
        "script_id": script_config.script_id,
        "script_tag": f'<script src="http://localhost:8000/widget/consent-widget.js" data-domain-script="{script_config.script_id}" charset="UTF-8"></script>',
        "message": "Script configuration created. Publish it to make it active.",
        "config": {
            "domain": script_config.domain,
            "is_published": script_config.is_published,
            "is_active": script_config.is_active
        }
    }


@router.get("/script-configs")
async def list_script_configs(
    api_key_obj: APIKey = Depends(verify_api_key),
    db: AsyncSession = Depends(get_db)
):
    """List all script configurations for the authenticated API key"""
    result = await db.execute(
        select(ScriptConfig).where(ScriptConfig.api_key_id == api_key_obj.id)
    )
    configs = result.scalars().all()
    
    return {
        "configs": [
            {
                "script_id": config.script_id,
                "domain": config.domain,
                "is_published": config.is_published,
                "is_active": config.is_active,
                "created_at": config.created_at.isoformat(),
                "updated_at": config.updated_at.isoformat() if config.updated_at else None
            }
            for config in configs
        ]
    }


@router.get("/script-configs/{script_id}")
async def get_script_config_detail(
    script_id: str,
    api_key_obj: APIKey = Depends(verify_api_key),
    db: AsyncSession = Depends(get_db)
):
    """Get detailed script configuration (for dashboard)"""
    result = await db.execute(
        select(ScriptConfig).where(
            and_(
                ScriptConfig.script_id == script_id,
                ScriptConfig.api_key_id == api_key_obj.id
            )
        )
    )
    config = result.scalar_one_or_none()
    
    if not config:
        raise HTTPException(status_code=404, detail="Script configuration not found")
    
    return {
        "script_id": config.script_id,
        "domain": config.domain,
        "categories": config.categories,
        "banner_config": config.banner_config,
        "default_language": config.default_language,
        "supported_languages": config.supported_languages,
        "cookie_policy_url": config.cookie_policy_url,
        "webhook_url": config.webhook_url,
        "external_tool_url": config.external_tool_url,
        "is_published": config.is_published,
        "is_active": config.is_active,
        "created_at": config.created_at.isoformat(),
        "updated_at": config.updated_at.isoformat() if config.updated_at else None,
        "script_tag": f'<script src="http://localhost:8000/widget/consent-widget.js" data-domain-script="{config.script_id}" charset="UTF-8"></script>'
    }


@router.put("/script-configs/{script_id}")
async def update_script_config(
    script_id: str,
    config_update: ScriptConfigUpdate,
    api_key_obj: APIKey = Depends(verify_api_key),
    db: AsyncSession = Depends(get_db)
):
    """Update script configuration"""
    result = await db.execute(
        select(ScriptConfig).where(
            and_(
                ScriptConfig.script_id == script_id,
                ScriptConfig.api_key_id == api_key_obj.id
            )
        )
    )
    config = result.scalar_one_or_none()
    
    if not config:
        raise HTTPException(status_code=404, detail="Script configuration not found")
    
    # Update fields
    update_data = config_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(config, key, value)
    
    await db.commit()
    await db.refresh(config)
    
    return {
        "script_id": config.script_id,
        "message": "Script configuration updated",
        "config": {
            "domain": config.domain,
            "is_published": config.is_published,
            "is_active": config.is_active
        }
    }


@router.post("/script-configs/{script_id}/publish")
async def publish_script_config(
    script_id: str,
    api_key_obj: APIKey = Depends(verify_api_key),
    db: AsyncSession = Depends(get_db)
):
    """Publish script configuration (makes it accessible to widget)"""
    result = await db.execute(
        select(ScriptConfig).where(
            and_(
                ScriptConfig.script_id == script_id,
                ScriptConfig.api_key_id == api_key_obj.id
            )
        )
    )
    config = result.scalar_one_or_none()
    
    if not config:
        raise HTTPException(status_code=404, detail="Script configuration not found")
    
    config.is_published = True
    await db.commit()
    
    return {
        "script_id": config.script_id,
        "message": "Script configuration published",
        "script_tag": f'<script src="http://localhost:8000/widget/consent-widget.js" data-domain-script="{config.script_id}" charset="UTF-8"></script>'
    }



