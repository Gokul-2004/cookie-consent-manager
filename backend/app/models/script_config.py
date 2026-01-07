"""Script Configuration model - OneTrust-style configuration"""
from sqlalchemy import Column, String, Boolean, DateTime, JSON, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy import ForeignKey
import uuid
from app.core.database import Base


class ScriptConfig(Base):
    """Script configuration - OneTrust-style configuration per script ID"""
    __tablename__ = "script_configs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    script_id = Column(String(100), unique=True, nullable=False, index=True)
    api_key_id = Column(UUID(as_uuid=True), ForeignKey("api_keys.id"), nullable=False, index=True)
    
    # Domain/Website
    domain = Column(String(255), nullable=False)
    
    # Cookie Categories Configuration
    categories = Column(JSON, nullable=False)
    
    # Banner Configuration
    banner_config = Column(JSON, nullable=False)
    
    # Language Settings
    default_language = Column(String(10), default="en")
    supported_languages = Column(JSON, default=["en"])
    
    # Cookie Policy
    cookie_policy_url = Column(String(500))
    
    # External Integrations
    webhook_url = Column(String(500))
    external_tool_url = Column(String(500))
    
    # Status
    is_active = Column(Boolean, default=True)
    is_published = Column(Boolean, default=False)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    __table_args__ = (
        Index('idx_script_id_published', 'script_id', 'is_published', 'is_active'),
    )
    
    def __repr__(self):
        return f"<ScriptConfig(script_id={self.script_id}, domain={self.domain})>"





