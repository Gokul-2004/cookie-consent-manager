"""
Vercel Serverless Function Entry Point for FastAPI
This file is required for Vercel to properly handle FastAPI routes
"""
import sys
import os
from pathlib import Path

# Add backend directory to path
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

# Import FastAPI app
from app.main import app

# Use Mangum adapter for Vercel serverless functions
try:
    from mangum import Mangum
    handler = Mangum(app, lifespan="off")  # lifespan="off" because Vercel handles it
except ImportError:
    # Fallback if mangum not available (shouldn't happen)
    handler = app

