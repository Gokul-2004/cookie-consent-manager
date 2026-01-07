# Cookie Consent Banner Integration Guide

## Step-by-Step Guide to Add Cookie Consent Banner to Your Website

### Part 1: Create Configuration in Dashboard

1. **Start the Server**
   ```bash
   cd backend
   python run.py
   ```
   Server will run on `http://127.0.0.1:8000`

2. **Open Dashboard**
   - Go to: `http://127.0.0.1:8000/dashboard`

3. **Create API Key** (if you don't have one)
   - Click on "API Keys" tab
   - Enter:
     - Customer Name: `Netflix Clone`
     - Customer Email: `your-email@example.com`
   - Click "Create API Key"
   - **IMPORTANT**: Copy the API key shown (you'll need it in next step)

4. **Create Script Configuration**
   - Click on "Script Configurations" tab
   - Enter your API Key (from step 3)
   - Enter Domain: `localhost` (or `127.0.0.1`)
   - Configure Cookie Categories:
     - Essential Cookies (already added, required)
     - Click "+ Add Category" to add more:
       - Analytics Cookies
       - Marketing Cookies
       - Performance Cookies
   - (Optional) Add Vendors to categories:
     - Click "+ Add Vendor" under any category
     - Fill in vendor details (Name, Parent Company, Description, URLs)
   - Banner Position: Select "Center (OneTrust Style)"
   - Default Language: Select "English"
   - Cookie Policy URL: (Optional) Your cookie policy page URL
   - Click "Create Configuration"
   - **IMPORTANT**: Copy the Script ID shown (e.g., `n2qjxw67pgs7`)

5. **Publish Configuration**
   - Find your configuration in the list
   - Click "Publish Configuration" button
   - Status should change to "Published"

---

### Part 2: Add Banner to Your Netflix Clone

1. **Open your Netflix clone HTML file** (usually `index.html`)

2. **Add the script tag** just before the closing `</body>` tag:

```html
<!-- Cookie Consent Widget -->
<script
    src="http://127.0.0.1:8000/widget/consent-widget.js"
    data-domain-script="YOUR_SCRIPT_ID_HERE"
    data-api-url="http://127.0.0.1:8000"
    charset="UTF-8"
></script>
```

**Replace `YOUR_SCRIPT_ID_HERE`** with the Script ID from step 4 (e.g., `n2qjxw67pgs7`)

3. **Example - Complete HTML structure:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Netflix Clone</title>
    <!-- Your CSS files here -->
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <!-- Your Netflix clone content here -->
    <header>...</header>
    <main>...</main>
    <footer>...</footer>

    <!-- Cookie Consent Widget - Add this before closing </body> -->
    <script
        src="http://127.0.0.1:8000/widget/consent-widget.js"
        data-domain-script="n2qjxw67pgs7"
        data-api-url="http://127.0.0.1:8000"
        charset="UTF-8"
    ></script>
</body>
</html>
```

---

### Part 3: Test the Integration

1. **Make sure the server is running** (`http://127.0.0.1:8000`)

2. **Open your Netflix clone** in a browser
   - If it's a local file, open it directly (file://)
   - Or use a local server (e.g., `python -m http.server 3000`)

3. **The banner should appear** as a centered modal when you first visit

4. **Test the functionality:**
   - Click "Allow All" - should accept all cookies
   - Click "Accept only necessary" - should reject non-essential
   - Click "Adjust my preferences" - should open preference center
   - Try the Data Request tab
   - Try expanding vendor details (if you added vendors)

---

### Part 4: Using Consent State in Your Code

You can check consent status in your JavaScript:

```javascript
// Wait for widget to load
setTimeout(() => {
    if (window.ConsentManager) {
        // Check if analytics is consented
        if (window.ConsentManager.hasConsent('analytics')) {
            console.log('Analytics cookies are enabled');
            // Initialize your analytics here (e.g., Google Analytics)
        }
        
        // Check if marketing is consented
        if (window.ConsentManager.hasConsent('marketing')) {
            console.log('Marketing cookies are enabled');
            // Initialize marketing scripts here
        }
        
        // Get all consents
        const allConsents = window.ConsentManager.getAllConsents();
        console.log('All consents:', allConsents);
        
        // Listen for consent changes
        window.ConsentManager.onConsentChange((categories) => {
            console.log('Consent changed:', categories);
            // Update your scripts based on new consent
        });
    }
}, 1000);
```

---

### Troubleshooting

**Banner doesn't appear?**
- ✅ Check server is running: `http://127.0.0.1:8000`
- ✅ Check Script ID is correct in the script tag
- ✅ Check configuration is published in dashboard
- ✅ Open browser console (F12) and check for errors
- ✅ Make sure domain matches (localhost or 127.0.0.1)

**CORS errors?**
- The server should handle CORS automatically
- If issues, make sure you're accessing via `http://` not `file://`

**Widget not loading?**
- Check network tab in browser DevTools
- Verify `http://127.0.0.1:8000/widget/consent-widget.js` is accessible
- Check browser console for JavaScript errors

---

### Quick Reference

**Script Tag Template:**
```html
<script
    src="http://127.0.0.1:8000/widget/consent-widget.js"
    data-domain-script="YOUR_SCRIPT_ID"
    data-api-url="http://127.0.0.1:8000"
    charset="UTF-8"
></script>
```

**ConsentManager API:**
- `window.ConsentManager.hasConsent('category_name')` - Check if category is consented
- `window.ConsentManager.getAllConsents()` - Get all consent states
- `window.ConsentManager.onConsentChange(callback)` - Listen for changes
- `window.ConsentManager.showPreferences()` - Open preference center

---

### For Production Deployment

**📘 See [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md) for complete deployment instructions**

When deploying to production:
1. Deploy your backend to a cloud platform (Railway, Render, etc.)
2. Set Production URL in dashboard settings (top of Configurations tab)
3. Update domain in dashboard configuration to match your website domain
4. Use HTTPS in production (most platforms provide this automatically)
5. Share the generated script tag with website owners

**📘 See [WEBSITE-OWNER-GUIDE.md](./WEBSITE-OWNER-GUIDE.md) for integration instructions to share with website owners**



