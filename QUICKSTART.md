# Quick Start Guide

## 1. Setup Backend

```bash
cd backend
pip install -r requirements.txt
python run.py
```

Server will start on `http://localhost:8000`

## 2. Create API Key

Visit http://localhost:8000/docs and use the `/api/admin/api-keys` endpoint:

```json
{
  "customer_name": "Test Customer",
  "customer_email": "test@example.com"
}
```

Save the returned `api_key` - you'll need it!

## 3. Create Script Configuration

Use the `/api/script-configs` endpoint with your API key:

**Headers:**
```
X-API-Key: YOUR_API_KEY_HERE
```

**Body:**
```json
{
  "domain": "example.com",
  "categories": {
    "essential": {
      "name": "Essential Cookies",
      "description": "Required for website to function",
      "required": true
    },
    "analytics": {
      "name": "Analytics Cookies",
      "description": "Help us understand website usage",
      "required": false
    },
    "marketing": {
      "name": "Marketing Cookies",
      "description": "Used for advertising",
      "required": false
    }
  },
  "banner_config": {
    "position": "bottom",
    "colors": {
      "primary": "#007bff",
      "background": "#ffffff"
    }
  },
  "default_language": "en",
  "supported_languages": ["en", "hi"]
}
```

You'll get back a `script_id` and `script_tag`.

## 4. Publish Configuration

Use `/api/script-configs/{script_id}/publish` to make it active.

## 5. Add Widget to Your Site

Copy the `script_tag` from step 3 and add it to your HTML:

```html
<script
    src="http://localhost:8000/widget/consent-widget.js"
    data-domain-script="YOUR_SCRIPT_ID"
    charset="UTF-8"
></script>
```

## 6. Test It!

Open `examples/basic.html` in your browser to see it in action.

## Using Consent State

```javascript
// Check consent
if (window.ConsentManager.hasConsent('analytics')) {
    // Load analytics
}

// Get all consents
const consents = window.ConsentManager.getAllConsents();

// Listen for changes
window.ConsentManager.onConsentChange(function(categories) {
    console.log('Consent updated:', categories);
});
```

## Next Steps

- Complete the widget UI (preferences modal)
- Build the dashboard for visual configuration
- Add webhook integration
- Add export functionality
