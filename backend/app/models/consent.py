"""Consent model"""
from sqlalchemy import Column, String, Boolean, DateTime, JSON, Text, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from datetime import datetime
import uuid
from app.core.database import Base


class Consent(Base):
    """Main consent records"""
    __tablename__ = "consents"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(String(255), nullable=False, index=True)
    user_id = Column(String(255), index=True)
    api_key_id = Column(UUID(as_uuid=True), ForeignKey("api_keys.id"), nullable=False)
    script_id = Column(String(100), index=True)  # Link to script config
    
    # Consent categories
    consent_categories = Column(JSON, nullable=False)
    
    # Metadata
    ip_address = Column(String(45))
    user_agent = Column(Text)
    
    # Status
    status = Column(String(50), default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    expires_at = Column(DateTime(timezone=True), index=True)
    revoked_at = Column(DateTime(timezone=True))
    
    __table_args__ = (
        Index('idx_session_status', 'session_id', 'status'),
        Index('idx_expires_at', 'expires_at'),
        Index('idx_script_session', 'script_id', 'session_id'),
    )
    
    def __repr__(self):
        return f"<Consent(id={self.id}, session={self.session_id}, status={self.status})>"
    
    def is_expired(self) -> bool:
        """Check if consent has expired"""
        if self.expires_at:
            return datetime.utcnow() > self.expires_at
        return False
    
    def is_active(self) -> bool:
        """Check if consent is currently active"""
        return self.status == "active" and not self.is_expired() and not self.revoked_at





