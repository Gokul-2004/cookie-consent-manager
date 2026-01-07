"""Grievance model for data subject requests"""
from sqlalchemy import Column, String, DateTime, JSON, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.core.database import Base


class Grievance(Base):
    """Data subject grievances and requests"""
    __tablename__ = "grievances"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(String(255), nullable=False, index=True)
    user_id = Column(String(255), index=True)
    api_key_id = Column(UUID(as_uuid=True), ForeignKey("api_keys.id"), nullable=False)
    
    # Request details
    request_type = Column(String(50), nullable=False)
    subject = Column(String(255))
    description = Column(Text, nullable=False)
    
    # Status
    status = Column(String(50), default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    resolved_at = Column(DateTime(timezone=True))
    
    # Response
    response = Column(Text)
    response_metadata = Column(JSON)
    
    def __repr__(self):
        return f"<Grievance(id={self.id}, type={self.request_type}, status={self.status})>"





