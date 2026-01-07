# Deploying to Vercel - Complete Guide

Yes, Vercel works great for FastAPI! This guide will walk you through deploying your Cookie Consent Manager to Vercel.

## ⚠️ Important Notes

**Vercel uses serverless functions**, which means:
- ✅ Perfect for API endpoints
- ✅ Automatic scaling
- ✅ Free tier available
- ⚠️ **SQLite won't work** - You MUST use PostgreSQL (Vercel provides this)
- ⚠️ Database connections need proper handling (connection pooling)
- ⚠️ **Cold starts** - First request might be slower (~1-2 seconds)
- ⚠️ **Function timeout** - Free tier: 10 seconds, Pro: 60 seconds

---

## 🚀 Quick Deployment Steps

### Step 1: Prepare Your Project

Your project is already set up with:
- ✅ `vercel.json` - Vercel configuration
- ✅ `api/index.py` - Serverless function entry point
- ✅ FastAPI app structure

### Step 2: Set Up PostgreSQL Database

Vercel doesn't include a database, so you need to add one:

#### Option A: Vercel Postgres (Recommended - Easiest)

1. Go to your Vercel project dashboard
2. Click "Storage" tab
3. Click "Create Database" → Select "Postgres"
4. Vercel will create a database and provide `POSTGRES_URL` automatically

#### Option B: External PostgreSQL (Railway, Supabase, etc.)

1. Create PostgreSQL database on Railway/Supabase/etc.
2. Get connection string
3. Add as environment variable in Vercel

### Step 3: Deploy to Vercel

#### Method 1: Via Vercel Dashboard (Easiest)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Python

3. **Configure Build Settings**:
   - Framework Preset: **Other**
   - Root Directory: `.` (root)
   - Build Command: `cd backend && pip install -r requirements.txt`
   - Output Directory: Leave empty
   - Install Command: `pip install -r backend/requirements.txt`

4. **Set Environment Variables**:
   ```
   DATABASE_URL=postgresql://... (from Vercel Postgres or your provider)
   CORS_ORIGINS=["*"]
   DEBUG=False
   SECRET_KEY=your-secret-key-here
   ```

5. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete
   - Get your URL: `https://your-app.vercel.app`

#### Method 2: Via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

---

## 📋 Required Files (Already Created)

### `vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/app/main.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/widget/(.*)",
      "dest": "/widget/$1"
    },
    {
      "src": "/(.*)",
      "dest": "backend/app/main.py"
    }
  ]
}
```

### `api/index.py`
This file is required for Vercel to handle FastAPI properly.

---

## 🔧 Configuration

### Environment Variables in Vercel

Go to: **Project Settings → Environment Variables**

Add these:

```env
# Database (REQUIRED - Vercel Postgres provides POSTGRES_URL)
DATABASE_URL=postgresql://user:pass@host:port/dbname
# OR use POSTGRES_URL if using Vercel Postgres

# CORS
CORS_ORIGINS=["*"]
# Or specific domains:
# CORS_ORIGINS=["https://example.com","https://www.example.com"]

# Security
SECRET_KEY=your-super-secret-key-change-this
DEBUG=False

# Server (Vercel handles these automatically)
HOST=0.0.0.0
PORT=8000
```

### Update Database URL Format

If using Vercel Postgres, you might need to convert the connection string:

```python
# In backend/app/core/config.py, Vercel provides POSTGRES_URL
# Convert it to DATABASE_URL format:
DATABASE_URL = os.getenv("POSTGRES_URL", os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./consent_manager.db"))
```

---

## 🎯 Serving Static Files (Widget & Dashboard)

Vercel needs special handling for static files. Update `backend/app/main.py`:

```python
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

# Serve widget file
@app.get("/widget/consent-widget.js")
async def get_widget():
    """Serve the consent widget JavaScript file"""
    widget_path = os.path.join(os.path.dirname(__file__), "..", "..", "widget", "consent-widget.js")
    if os.path.exists(widget_path):
        return FileResponse(widget_path, media_type="application/javascript")
    return {"error": "Widget file not found"}

# Serve dashboard
@app.get("/dashboard")
async def get_dashboard():
    """Serve the dashboard HTML file"""
    dashboard_path = os.path.join(os.path.dirname(__file__), "..", "..", "dashboard", "index.html")
    if os.path.exists(dashboard_path):
        return FileResponse(dashboard_path, media_type="text/html")
    return {"error": "Dashboard file not found"}
```

---

## ✅ Testing Your Deployment

### 1. Test API Endpoints

```bash
# Test root endpoint
curl https://your-app.vercel.app/

# Test widget file
curl https://your-app.vercel.app/widget/consent-widget.js

# Test configuration endpoint (after creating config)
curl https://your-app.vercel.app/api/config/YOUR_SCRIPT_ID
```

### 2. Test Dashboard

Visit: `https://your-app.vercel.app/dashboard`

### 3. Test Widget Integration

Create a test HTML file:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Test Widget</title>
</head>
<body>
    <h1>Cookie Consent Test</h1>
    
    <script
        src="https://your-app.vercel.app/widget/consent-widget.js"
        data-domain-script="YOUR_SCRIPT_ID"
        data-api-url="https://your-app.vercel.app"
        charset="UTF-8"
    ></script>
</body>
</html>
```

---

## 🐛 Troubleshooting

### Issue: "Module not found" errors

**Solution**: Make sure all dependencies are in `backend/requirements.txt`:
```bash
cd backend
pip freeze > requirements.txt
```

### Issue: Database connection errors

**Solution**: 
1. Check `DATABASE_URL` environment variable
2. Ensure PostgreSQL database is running
3. Check connection string format (should start with `postgresql://`)

### Issue: Widget file not loading

**Solution**: 
1. Check file path in `vercel.json`
2. Verify widget file exists in `widget/` directory
3. Check Vercel build logs for errors

### Issue: CORS errors

**Solution**: 
1. Update `CORS_ORIGINS` environment variable
2. Add your domain to the list
3. Redeploy

### Issue: Function timeout

**Solution**: 
- Vercel free tier: 10 seconds timeout
- Pro tier: 60 seconds
- Optimize database queries
- Use connection pooling

---

## 💡 Vercel vs Railway vs Render

| Feature | Vercel | Railway | Render |
|---------|--------|---------|--------|
| **Deployment Type** | Serverless | Container | Container |
| **Free Tier** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Database** | ❌ Separate | ✅ Included | ✅ Included |
| **HTTPS** | ✅ Auto | ✅ Auto | ✅ Auto |
| **Cold Starts** | ⚠️ Yes | ❌ No | ❌ No |
| **Best For** | APIs, Static | Full Apps | Full Apps |

**Recommendation**: 
- **Vercel**: Great if you want serverless, already have a database, or prefer Vercel ecosystem
- **Railway**: Easiest if you want everything included (database + app)
- **Render**: Good alternative to Railway

---

## 🎉 After Deployment

1. **Get Your URL**: `https://your-app.vercel.app`

2. **Update Dashboard**:
   - Open dashboard: `https://your-app.vercel.app/dashboard`
   - Set Production URL in the blue box
   - Create configurations

3. **Share Script Tags**:
   - Script tags will use your Vercel URL automatically
   - Share with website owners

---

## 📚 Additional Resources

- [Vercel Python Documentation](https://vercel.com/docs/frameworks/python)
- [Vercel Postgres Documentation](https://vercel.com/docs/storage/vercel-postgres)
- [FastAPI on Vercel](https://vercel.com/docs/frameworks/backend/fastapi)

---

## ✅ Checklist

- [ ] Project pushed to GitHub
- [ ] PostgreSQL database created (Vercel Postgres or external)
- [ ] `DATABASE_URL` environment variable set
- [ ] Other environment variables configured
- [ ] Deployed to Vercel
- [ ] Tested API endpoints
- [ ] Tested widget loading
- [ ] Tested dashboard
- [ ] Set production URL in dashboard
- [ ] Created test configuration
- [ ] Tested widget on external site

---

**You're all set! Your Cookie Consent Manager is now live on Vercel! 🚀**

