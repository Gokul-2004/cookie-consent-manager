"""FastAPI Application Entry Point"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.core.config import settings
from app.core.database import init_db
from app.api.routes import config, consent, admin

app = FastAPI(
    title=settings.APP_NAME,
    description="DPDP Compliant Cookie Consent Management System",
    version=settings.APP_VERSION
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(config.router)
app.include_router(consent.router)
app.include_router(admin.router)

# Serve widget file
@app.get("/widget/consent-widget.js")
async def get_widget():
    """Serve the consent widget JavaScript file"""
    import os
    widget_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "widget", "consent-widget.js")
    if os.path.exists(widget_path):
        return FileResponse(widget_path, media_type="application/javascript")
    return {"error": "Widget file not found"}

# Serve dashboard
@app.get("/dashboard")
async def get_dashboard():
    """Serve the dashboard HTML file"""
    import os
    dashboard_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "dashboard", "index.html")
    if os.path.exists(dashboard_path):
        return FileResponse(dashboard_path, media_type="text/html")
    return {"error": "Dashboard file not found"}

# Serve test widget page
@app.get("/test-widget.html")
async def get_test_widget():
    """Serve the test widget HTML file"""
    import os
    test_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "test-widget.html")
    if os.path.exists(test_path):
        return FileResponse(test_path, media_type="text/html")
    return {"error": "Test widget file not found"}

# Serve demo website page
@app.get("/demo")
async def get_demo_website():
    """Serve the demo website HTML file"""
    import os
    demo_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "demo-website.html")
    if os.path.exists(demo_path):
        return FileResponse(demo_path, media_type="text/html")
    return {"error": "Demo website file not found"}


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Cookie Consent Manager API",
        "version": settings.APP_VERSION,
        "docs": "/docs"
    }


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    await init_db()
    print("Database initialized")
    print(f"Server running on http://{settings.HOST}:{settings.PORT}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )

