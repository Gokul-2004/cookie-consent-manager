# Deployment Guide - Making Cookie Consent Widget Accessible Online

This guide will help you deploy the Cookie Consent Manager so that external websites can use your widget.

## Table of Contents
1. [Quick Start](#quick-start)
2. [Deployment Options](#deployment-options)
3. [Configuration for Production](#configuration-for-production)
4. [Integration for Website Owners](#integration-for-website-owners)
5. [Security Considerations](#security-considerations)

---

## Quick Start

### Step 1: Deploy Your Backend

**🆓 For FREE deployment (no credit card): See [FREE-DEPLOYMENT-OPTIONS.md](./FREE-DEPLOYMENT-OPTIONS.md)**

**Recommended**: **Render** - Easiest, free, no credit card required!

Choose one of the deployment platforms below and deploy your backend API.

### Step 2: Get Your Production URL

After deployment, you'll get a URL like:
- `https://your-app.onrender.com` (Render) ⭐ **Recommended - Free, No Card**
- `https://your-app.railway.app` (Railway)
- `https://your-app.vercel.app` (Vercel)

### Step 3: Update Dashboard Configuration

1. Open your dashboard: `https://your-production-url.com/dashboard`
2. Create/Update your script configuration
3. Set the domain to match the website that will use the widget
4. Publish the configuration

### Step 4: Share Integration Code

Provide website owners with this script tag (replace placeholders):

```html
<script
    src="https://your-production-url.com/widget/consent-widget.js"
    data-domain-script="YOUR_SCRIPT_ID"
    data-api-url="https://your-production-url.com"
    charset="UTF-8"
></script>
```

---

## Deployment Options

### 🆓 Free Options (No Credit Card)

**See [FREE-DEPLOYMENT-OPTIONS.md](./FREE-DEPLOYMENT-OPTIONS.md) for complete guide**

**Best Free Option**: **Render** - Free PostgreSQL, no credit card, 5-minute setup!

---

### Option 1: Render (Recommended - Free & Easiest) ⭐

**Render** is the easiest free option - no credit card required!

#### Quick Steps:

1. **Push to GitHub** (if not already):
   ```bash
   git add .
   git commit -m "Ready for Render"
   git push origin main
   ```

2. **Go to Render**:
   - Visit: [render.com](https://render.com)
   - Sign up with GitHub (free, no card)

3. **Create Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Settings:
     - **Build Command**: `cd backend && pip install -r requirements.txt`
     - **Start Command**: `cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`

4. **Add PostgreSQL** (free):
   - Click "New +" → "PostgreSQL"
   - Copy connection string
   - Add to Web Service env vars as `DATABASE_URL`

5. **Set Environment Variables**:
   ```
   DATABASE_URL=<from PostgreSQL>
   CORS_ORIGINS=["*"]
   SECRET_KEY=your-secret-key
   ```

6. **Deploy**: Click "Create Web Service" → Wait 2-3 min → Done!

**Get URL**: `https://your-app.onrender.com`

#### Render Advantages:
- ✅ **Free tier** - no credit card required
- ✅ **Free PostgreSQL** database included
- ✅ **Automatic HTTPS**
- ✅ **Auto-deploy from GitHub**
- ✅ **Easiest setup** - 5 minutes

**📘 Full Guide**: See [FREE-DEPLOYMENT-OPTIONS.md](./FREE-DEPLOYMENT-OPTIONS.md)

---

### Option 2: Railway

**Railway** is the easiest option with automatic deployments from GitHub.

#### Steps:

1. **Install Railway CLI** (optional, can use web interface):
   ```bash
   npm i -g @railway/cli
   railway login
   ```

2. **Create `railway.json`** (already created):
   ```json
   {
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT",
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10
     }
   }
   ```

3. **Deploy via Railway Dashboard**:
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository
   - Railway will auto-detect Python and deploy

4. **Set Environment Variables** (in Railway dashboard):
   ```
   PORT=8000
   DATABASE_URL=postgresql://... (Railway provides this automatically)
   CORS_ORIGINS=["*"] (or specific domains)
   ```

5. **Get Your URL**:
   - Railway provides: `https://your-app.railway.app`
   - Use this as your production URL

#### Railway Advantages:
- ✅ Free tier available
- ✅ Automatic HTTPS
- ✅ PostgreSQL database included
- ✅ Auto-deploy from GitHub
- ✅ Easy environment variable management

---

### Option 2: Render

**Render** offers free hosting with PostgreSQL.

#### Steps:

1. **Create `render.yaml`** (create this file):
   ```yaml
   services:
     - type: web
       name: cookie-consent-api
       env: python
       buildCommand: cd backend && pip install -r requirements.txt
       startCommand: cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
       envVars:
         - key: DATABASE_URL
           fromDatabase:
             name: cookie-consent-db
             property: connectionString
         - key: PORT
           value: 8000
   ```

2. **Deploy**:
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Render will auto-detect settings
   - Add PostgreSQL database (free tier)

3. **Get Your URL**:
   - Render provides: `https://your-app.onrender.com`

#### Render Advantages:
- ✅ Free tier available
- ✅ Automatic HTTPS
- ✅ PostgreSQL database
- ✅ Auto-deploy from GitHub

---

### Option 3: Vercel (Serverless Functions) ⭐ Recommended for APIs

**Vercel** is excellent for FastAPI with serverless functions!

#### Quick Steps:

1. **Set Up PostgreSQL Database**:
   - Vercel Postgres (in Vercel dashboard → Storage → Create Database)
   - OR External PostgreSQL (Railway, Supabase, etc.)

2. **Deploy via GitHub**:
   - Push code to GitHub
   - Connect to Vercel
   - Vercel auto-detects Python

3. **Set Environment Variables**:
   ```
   POSTGRES_URL=postgresql://... (if using Vercel Postgres)
   # OR
   DATABASE_URL=postgresql://... (if using external)
   CORS_ORIGINS=["*"]
   SECRET_KEY=your-secret-key
   ```

4. **Get Your URL**: `https://your-app.vercel.app`

#### ✅ Files Already Created:
- `vercel.json` - Vercel configuration
- `api/index.py` - Serverless function entry point

#### 📘 Full Guide:
**See [VERCEL-DEPLOYMENT.md](./VERCEL-DEPLOYMENT.md) for complete step-by-step instructions**

#### Vercel Advantages:
- ✅ Free tier available
- ✅ Automatic HTTPS
- ✅ Serverless (auto-scaling)
- ✅ Fast global CDN
- ✅ Easy GitHub integration
- ⚠️ Database separate (use Vercel Postgres or external)

---

### Option 4: DigitalOcean App Platform

**DigitalOcean** offers scalable hosting.

#### Steps:

1. **Create `app.yaml`**:
   ```yaml
   name: cookie-consent-manager
   services:
     - name: api
       github:
         repo: your-username/your-repo
         branch: main
       run_command: cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
       environment_slug: python
       instance_count: 1
       instance_size_slug: basic-xxs
       envs:
         - key: DATABASE_URL
           scope: RUN_TIME
           value: ${db.DATABASE_URL}
         - key: PORT
           scope: RUN_TIME
           value: "8000"
   databases:
     - name: db
       engine: PG
       version: "14"
   ```

2. **Deploy**:
   - Go to DigitalOcean App Platform
   - Connect GitHub repository
   - DigitalOcean will auto-detect and deploy

---

### Option 5: AWS / Google Cloud / Azure

For enterprise deployments, use containerized deployments:

#### Docker Deployment:

1. **Create `Dockerfile`**:
   ```dockerfile
   FROM python:3.11-slim
   WORKDIR /app
   COPY backend/requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt
   COPY backend/ .
   EXPOSE 8000
   CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
   ```

2. **Deploy to**:
   - AWS ECS / Elastic Beanstalk
   - Google Cloud Run
   - Azure Container Instances

---

## Configuration for Production

### 1. Update CORS Settings

In `backend/app/core/config.py`, update CORS origins:

```python
# For production, specify actual domains:
CORS_ORIGINS: List[str] = [
    "https://example.com",
    "https://www.example.com",
    "https://client1.com",
    "https://client2.com"
]

# Or allow all (less secure):
CORS_ORIGINS: List[str] = ["*"]
```

### 2. Set Environment Variables

Create `.env` file or set in deployment platform:

```env
# Production Settings
DEBUG=False
SECRET_KEY=your-super-secret-key-change-this-in-production
DATABASE_URL=postgresql://user:password@host:port/dbname
CORS_ORIGINS=["https://example.com","https://www.example.com"]
PORT=8000
HOST=0.0.0.0

# Widget CDN URL (optional, if using CDN)
WIDGET_CDN_URL=https://your-cdn.com/widget/consent-widget.js
```

### 3. Database Setup

**For PostgreSQL** (recommended for production):

1. Create database in your deployment platform
2. Update `DATABASE_URL` environment variable
3. Database migrations run automatically on startup

**For SQLite** (development only):
- Works locally but not recommended for production
- Use PostgreSQL for production

### 4. Update Widget Script Tag Generator

The dashboard should generate script tags with your production URL. Update `backend/app/api/routes/config.py`:

```python
# In get_script_config_detail function, update script_tag:
script_tag = f'<script src="{settings.WIDGET_CDN_URL or "https://your-production-url.com"}/widget/consent-widget.js" data-domain-script="{config.script_id}" data-api-url="{settings.WIDGET_CDN_URL or "https://your-production-url.com"}" charset="UTF-8"></script>'
```

---

## Integration for Website Owners

### For Your Clients / Website Owners

Provide them with this integration guide:

---

## 🍪 Cookie Consent Widget - Integration Guide

### Quick Integration (2 Steps)

#### Step 1: Add Script Tag

Add this script tag **just before the closing `</body>` tag** in your HTML:

```html
<!-- Cookie Consent Widget -->
<script
    src="https://your-production-url.com/widget/consent-widget.js"
    data-domain-script="YOUR_SCRIPT_ID"
    data-api-url="https://your-production-url.com"
    charset="UTF-8"
></script>
```

**Replace:**
- `YOUR_SCRIPT_ID` - Get this from the dashboard
- `your-production-url.com` - Your deployed API URL

#### Step 2: Test

1. Open your website
2. The cookie banner should appear automatically
3. Test Accept/Reject/Customize buttons

### Complete Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My Website</title>
</head>
<body>
    <h1>Welcome to My Website</h1>
    <p>Your content here...</p>

    <!-- Cookie Consent Widget -->
    <script
        src="https://your-production-url.com/widget/consent-widget.js"
        data-domain-script="abc123xyz"
        data-api-url="https://your-production-url.com"
        charset="UTF-8"
    ></script>
</body>
</html>
```

### Using Consent State in Your Code

```javascript
// Wait for widget to load
setTimeout(() => {
    if (window.ConsentManager) {
        // Check if analytics is consented
        if (window.ConsentManager.hasConsent('analytics')) {
            // Initialize Google Analytics
            gtag('config', 'GA_MEASUREMENT_ID');
        }
        
        // Check if marketing is consented
        if (window.ConsentManager.hasConsent('marketing')) {
            // Initialize marketing scripts
            // e.g., Facebook Pixel, LinkedIn Insight Tag
        }
        
        // Listen for consent changes
        window.ConsentManager.onConsentChange((categories) => {
            console.log('Consent changed:', categories);
            // Reload scripts based on new consent
        });
    }
}, 1000);
```

### API Reference

- `window.ConsentManager.hasConsent('category_name')` - Check if category is consented
- `window.ConsentManager.getAllConsents()` - Get all consent states
- `window.ConsentManager.onConsentChange(callback)` - Listen for changes
- `window.ConsentManager.showPreferences()` - Open preference center programmatically

---

## Security Considerations

### 1. API Key Security

- ✅ API keys are only needed for dashboard access
- ✅ Widget configuration endpoint (`/api/config/{script_id}`) is public (no auth required)
- ✅ This is intentional - configuration is meant to be public
- ✅ Only published configurations are accessible

### 2. CORS Configuration

- **Development**: `CORS_ORIGINS = ["*"]` (allows all origins)
- **Production**: Specify exact domains:
  ```python
  CORS_ORIGINS = [
      "https://client1.com",
      "https://client2.com"
  ]
  ```

### 3. Rate Limiting (Recommended)

Add rate limiting to prevent abuse:

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@router.get("/config/{script_id}")
@limiter.limit("100/minute")
async def get_script_config(...):
    ...
```

### 4. HTTPS Only

- ✅ Always use HTTPS in production
- ✅ Most deployment platforms provide HTTPS automatically
- ✅ Update script tags to use `https://` not `http://`

### 5. Domain Validation

The widget validates domains when creating configurations. Ensure:
- Domain matches the website using the widget
- Use exact domain (e.g., `example.com` not `*.example.com`)

---

## Testing Production Deployment

### 1. Test Widget Loading

```bash
curl https://your-production-url.com/widget/consent-widget.js
```

Should return JavaScript code.

### 2. Test Configuration Endpoint

```bash
curl https://your-production-url.com/api/config/YOUR_SCRIPT_ID
```

Should return JSON configuration.

### 3. Test CORS

Open browser console on external website and check for CORS errors.

### 4. Test Widget on External Site

1. Create a test HTML file on a different domain
2. Add the script tag
3. Verify banner appears
4. Test all functionality

---

## Troubleshooting

### Widget Not Loading?

1. ✅ Check script tag URL is correct
2. ✅ Verify configuration is published
3. ✅ Check browser console for errors
4. ✅ Verify CORS is configured correctly
5. ✅ Check network tab - is script loading?

### CORS Errors?

1. ✅ Update `CORS_ORIGINS` in environment variables
2. ✅ Restart server after changing CORS settings
3. ✅ Check browser console for specific CORS error

### Configuration Not Found?

1. ✅ Verify script_id is correct
2. ✅ Check configuration is published in dashboard
3. ✅ Verify domain matches

### Database Errors?

1. ✅ Check `DATABASE_URL` environment variable
2. ✅ Verify database is accessible
3. ✅ Check database migrations ran successfully

---

## Next Steps

1. ✅ Deploy backend to chosen platform
2. ✅ Update CORS settings for your clients' domains
3. ✅ Create script configurations in dashboard
4. ✅ Share integration code with website owners
5. ✅ Monitor usage and performance

---

## Support

For issues or questions:
- Check browser console for errors
- Review server logs
- Verify configuration in dashboard
- Test endpoints with curl/Postman

