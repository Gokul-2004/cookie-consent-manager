"""Pydantic schemas for request/response validation"""
from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime


# Script Configuration Schemas
class ScriptConfigCreate(BaseModel):
    domain: str
    categories: Dict
    banner_config: Dict
    default_language: str = "en"
    supported_languages: List[str] = ["en"]
    cookie_policy_url: Optional[str] = None
    webhook_url: Optional[str] = None
    external_tool_url: Optional[str] = None
    script_id: Optional[str] = None  # Optional custom script_id


class ScriptConfigUpdate(BaseModel):
    domain: Optional[str] = None
    categories: Optional[Dict] = None
    banner_config: Optional[Dict] = None
    default_language: Optional[str] = None
    supported_languages: Optional[List[str]] = None
    cookie_policy_url: Optional[str] = None
    webhook_url: Optional[str] = None
    external_tool_url: Optional[str] = None
    is_active: Optional[bool] = None
    is_published: Optional[bool] = None


class ScriptConfigResponse(BaseModel):
    script_id: str
    domain: str
    categories: Dict
    banner_config: Dict
    default_language: str
    supported_languages: List[str]
    cookie_policy_url: Optional[str]
    webhook_url: Optional[str]
    external_tool_url: Optional[str]
    is_published: bool
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]
    script_tag: str


# Consent Schemas
class ConsentRequest(BaseModel):
    session_id: str
    user_id: Optional[str] = None
    consent_categories: Dict
    action: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None


class ConsentResponse(BaseModel):
    consent_id: str
    status: str
    timestamp: datetime
    expires_at: Optional[datetime] = None


class ConsentStatus(BaseModel):
    has_consent: bool
    consent_id: Optional[str] = None
    categories: Optional[Dict] = None
    last_updated: Optional[datetime] = None


# Grievance Schemas
class GrievanceRequest(BaseModel):
    session_id: str
    user_id: Optional[str] = None
    request_type: str
    subject: Optional[str] = None
    description: str


class GrievanceResponse(BaseModel):
    grievance_id: str
    status: str
    created_at: datetime



