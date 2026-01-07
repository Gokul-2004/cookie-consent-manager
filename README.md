# 🍪 Cookie Consent Manager - DPDP Compliant

A professional, OneTrust-style cookie consent management system that helps websites comply with the Digital Personal Data Protection Act (DPDP) and GDPR.

---

## ✨ Features

- ✅ **DPDP & GDPR Compliant** - Full compliance with data protection regulations
- ✅ **OneTrust-Style UI** - Professional, modern interface inspired by OneTrust
- ✅ **Easy Integration** - Simple script tag integration for any website
- ✅ **Multi-Domain Support** - Manage multiple websites from one dashboard
- ✅ **Preference Center** - Users can customize cookie preferences anytime
- ✅ **Data Request Portal** - Built-in data request form for DPDP compliance
- ✅ **Vendor Management** - Add and manage cookie vendors with details
- ✅ **Multi-Language** - Support for English, Hindi, and more
- ✅ **API-First** - RESTful API for programmatic access
- ✅ **Production Ready** - Deploy to Railway, Render, Vercel, or any platform

---

## 🚀 Quick Start

### 1. Start the Server

```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Open Dashboard

Visit: `http://localhost:8000/dashboard`

### 3. Create Configuration

1. Create an API Key
2. Create a Script Configuration
3. Publish the configuration
4. Copy the script tag

### 4. Add to Website

Add the script tag to your website before `</body>`:

```html
<script
    src="http://localhost:8000/widget/consent-widget.js"
    data-domain-script="YOUR_SCRIPT_ID"
    data-api-url="http://localhost:8000"
    charset="UTF-8"
></script>
```

---

## 📚 Documentation

- **[Integration Guide](./integration-guide.md)** - Step-by-step integration instructions
- **[Deployment Guide](./DEPLOYMENT-GUIDE.md)** - Deploy to production (Railway, Render, etc.)
- **[Website Owner Guide](./WEBSITE-OWNER-GUIDE.md)** - Integration guide for website owners

---

## 🎯 Use Cases

### For Service Providers

Deploy this system to provide cookie consent management as a service to multiple clients:

1. Deploy backend to cloud platform
2. Create configurations for each client website
3. Share script tags with clients
4. Manage all from one dashboard

### For Website Owners

Integrate the widget into your website:

1. Get Script ID from service provider
2. Add script tag to your website
3. Widget appears automatically
4. Users can manage preferences

---

## 🏗️ Architecture

```
┌─────────────────┐
│   Website A     │
│  (Client Site)  │
└────────┬────────┘
         │ Script Tag
         │
┌────────▼────────────────────────┐
│   Cookie Consent Widget         │
│   (consent-widget.js)           │
└────────┬────────────────────────┘
         │ API Calls
         │
┌────────▼────────────────────────┐
│   FastAPI Backend               │
│   - Configuration API           │
│   - Consent API                 │
│   - Admin API                   │
└────────┬────────────────────────┘
         │
┌────────▼────────────────────────┐
│   SQLite / PostgreSQL            │
│   - Configurations              │
│   - Consent Records              │
│   - API Keys                     │
└─────────────────────────────────┘
```

---

## 🛠️ Tech Stack

- **Backend**: FastAPI (Python)
- **Database**: SQLite (dev) / PostgreSQL (production)
- **Frontend**: Vanilla JavaScript (no dependencies)
- **Widget**: Self-contained JavaScript widget
- **Dashboard**: HTML/CSS/JavaScript

---

## 📦 Installation

### Prerequisites

- Python 3.11+
- pip

### Setup

```bash
# Clone repository
git clone <your-repo-url>
cd cookie-consent-manager

# Install dependencies
cd backend
pip install -r requirements.txt

# Run server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

---

## 🌐 Deployment

### Railway (Recommended)

1. Push code to GitHub
2. Connect to Railway
3. Railway auto-detects and deploys
4. Get your production URL

**See [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md) for detailed instructions**

### Other Platforms

- **Render** - Free PostgreSQL included
- **Vercel** - Serverless functions
- **DigitalOcean** - App Platform
- **AWS/GCP/Azure** - Container deployment

---

## 🔧 Configuration

### Environment Variables

```env
# Server
HOST=0.0.0.0
PORT=8000
DEBUG=False

# Database
DATABASE_URL=postgresql://user:pass@host:port/db

# CORS (comma-separated or ["*"] for all)
CORS_ORIGINS=["https://example.com","https://www.example.com"]

# Security
SECRET_KEY=your-secret-key-change-in-production
```

---

## 📖 API Documentation

Once server is running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Key Endpoints

- `GET /api/config/{script_id}` - Get widget configuration (public)
- `POST /api/script-configs` - Create configuration (requires API key)
- `POST /api/v1/consent/create` - Create consent record
- `GET /api/v1/consent/check` - Check consent status

---

## 🎨 Widget Features

### Banner Options

- **Center Modal** (OneTrust style) - Recommended
- **Bottom Banner**
- **Top Banner**

### Cookie Categories

- Essential Cookies (always active)
- Analytics Cookies
- Marketing Cookies
- Performance Cookies
- Custom categories

### User Features

- Accept All
- Reject All (DPDP compliant - non-essential off by default)
- Customize Preferences
- Preference Center
- Data Request Form
- Vendor Details

---

## 🔒 Security

- ✅ CORS configuration for domain whitelisting
- ✅ API key authentication for admin endpoints
- ✅ Public configuration endpoint (no sensitive data)
- ✅ HTTPS support
- ✅ Domain validation

---

## 📝 License

[Your License Here]

---

## 🤝 Contributing

Contributions welcome! Please read contributing guidelines first.

---

## 📞 Support

- Check [Integration Guide](./integration-guide.md) for setup help
- Review [Deployment Guide](./DEPLOYMENT-GUIDE.md) for deployment issues
- Check browser console for errors
- Review server logs

---

## 🎉 Getting Started Checklist

- [ ] Install Python dependencies
- [ ] Start server locally
- [ ] Open dashboard
- [ ] Create API key
- [ ] Create script configuration
- [ ] Publish configuration
- [ ] Test widget on local site
- [ ] Deploy to production
- [ ] Set production URL in dashboard
- [ ] Share script tag with clients

---

**Made with ❤️ for DPDP Compliance**
