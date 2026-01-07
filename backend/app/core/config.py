"""Application configuration"""
from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings"""
    
    # App
    APP_NAME: str = "Cookie Consent Manager"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = int(os.getenv("PORT", "8000"))  # Support Railway/Render PORT env var
    
    # Database
    # Vercel provides POSTGRES_URL, Railway/Render provide DATABASE_URL
    DATABASE_URL: str = os.getenv("POSTGRES_URL") or os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./consent_manager.db")
    # For PostgreSQL: "postgresql+asyncpg://user:password@localhost/dbname"
    # For Railway/Render: Set DATABASE_URL environment variable
    # For Vercel Postgres: POSTGRES_URL is automatically provided
    
    # CORS
    CORS_ORIGINS: List[str] = ["*"]  # In production, specify actual origins
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    API_KEY_LENGTH: int = 32
    
    # Widget
    WIDGET_CDN_URL: str = os.getenv("WIDGET_CDN_URL", "http://localhost:8000/widget/consent-widget.js")
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

