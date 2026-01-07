"""Consent History model for audit logging"""
from sqlalchemy import Column, String, DateTime, JSON, Text, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.core.database import Base


class ConsentHistory(Base):
    """Immutable audit log of all consent actions"""
    __tablename__ = "consent_history"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    consent_id = Column(UUID(as_uuid=True), ForeignKey("consents.id"), nullable=False, index=True)
    session_id = Column(String(255), nullable=False, index=True)
    
    # Action details
    action = Column(String(50), nullable=False)
    previous_categories = Column(JSON)
    new_categories = Column(JSON)
    
    # Metadata
    ip_address = Column(String(45))
    user_agent = Column(Text)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Additional metadata
    extra_metadata = Column(JSON)
    
    __table_args__ = (
        Index('idx_consent_timestamp', 'consent_id', 'timestamp'),
        Index('idx_session_timestamp', 'session_id', 'timestamp'),
    )
    
    def __repr__(self):
        return f"<ConsentHistory(consent_id={self.consent_id}, action={self.action})>"





