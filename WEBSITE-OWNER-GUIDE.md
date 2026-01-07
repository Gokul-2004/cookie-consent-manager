# Cookie Consent Widget - Integration Guide for Website Owners

This guide helps you integrate the Cookie Consent Widget into your website in just 2 minutes!

---

## 🚀 Quick Start (2 Steps)

### Step 1: Get Your Script ID

Contact your service provider or access the dashboard to get your unique **Script ID**.

Example Script ID: `n2qjxw67pgs7`

### Step 2: Add Script Tag to Your Website

Add this code **just before the closing `</body>` tag** in your HTML:

```html
<!-- Cookie Consent Widget -->
<script
    src="https://your-service-provider.com/widget/consent-widget.js"
    data-domain-script="YOUR_SCRIPT_ID_HERE"
    data-api-url="https://your-service-provider.com"
    charset="UTF-8"
></script>
```

**Replace:**
- `YOUR_SCRIPT_ID_HERE` - Your unique Script ID
- `your-service-provider.com` - Your service provider's URL

---

## 📝 Complete Example

Here's a complete HTML example:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Website</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <h1>Welcome to My Website</h1>
    </header>
    
    <main>
        <p>Your website content goes here...</p>
    </main>
    
    <footer>
        <p>&copy; 2025 My Website</p>
    </footer>

    <!-- Cookie Consent Widget - Add this before closing </body> -->
    <script
        src="https://your-service-provider.com/widget/consent-widget.js"
        data-domain-script="n2qjxw67pgs7"
        data-api-url="https://your-service-provider.com"
        charset="UTF-8"
    ></script>
</body>
</html>
```

---

## 🎯 How It Works

1. **Automatic Display**: The banner appears automatically when users first visit your site
2. **User Choice**: Users can Accept All, Reject All, or Customize preferences
3. **Preference Center**: Users can change preferences anytime via the preference center
4. **DPDP Compliant**: Fully compliant with Digital Personal Data Protection Act (DPDP)

---

## 💻 Using Consent State in Your Code

You can check user consent and conditionally load scripts:

### Example: Google Analytics

```javascript
// Wait for widget to load
setTimeout(() => {
    if (window.ConsentManager && window.ConsentManager.hasConsent('analytics')) {
        // User has consented to analytics - initialize Google Analytics
        gtag('config', 'GA_MEASUREMENT_ID');
    }
}, 1000);
```

### Example: Facebook Pixel

```javascript
setTimeout(() => {
    if (window.ConsentManager && window.ConsentManager.hasConsent('marketing')) {
        // User has consented to marketing - initialize Facebook Pixel
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', 'YOUR_PIXEL_ID');
        fbq('track', 'PageView');
    }
}, 1000);
```

### Example: Multiple Scripts

```javascript
setTimeout(() => {
    if (window.ConsentManager) {
        const consents = window.ConsentManager.getAllConsents();
        
        // Analytics cookies
        if (consents.analytics) {
            // Load Google Analytics
            // Load other analytics tools
        }
        
        // Marketing cookies
        if (consents.marketing) {
            // Load Facebook Pixel
            // Load LinkedIn Insight Tag
            // Load other marketing tools
        }
        
        // Performance cookies
        if (consents.performance) {
            // Load performance monitoring tools
        }
    }
}, 1000);
```

---

## 🔧 API Reference

### Check Consent for a Category

```javascript
if (window.ConsentManager.hasConsent('analytics')) {
    // User has consented to analytics
}
```

### Get All Consents

```javascript
const allConsents = window.ConsentManager.getAllConsents();
// Returns: { analytics: true, marketing: false, performance: true, ... }
```

### Listen for Consent Changes

```javascript
window.ConsentManager.onConsentChange((categories) => {
    console.log('User changed preferences:', categories);
    // Reload scripts based on new consent
    if (categories.analytics) {
        // Initialize analytics
    } else {
        // Remove analytics
    }
});
```

### Open Preference Center Programmatically

```javascript
// Add a "Cookie Settings" link anywhere on your site
<button onclick="window.ConsentManager.showPreferences()">
    Cookie Settings
</button>
```

---

## 🎨 Customization

The widget appearance is configured by your service provider. Contact them to customize:

- Banner position (Center, Bottom, Top)
- Colors and branding
- Cookie categories
- Languages
- Cookie policy URL

---

## ✅ Testing

### Test the Integration

1. **Clear Browser Data**: Clear cookies and localStorage
2. **Visit Your Site**: The banner should appear automatically
3. **Test Actions**:
   - Click "Allow All" - should accept all cookies
   - Click "Accept only necessary" - should reject non-essential
   - Click "Adjust my preferences" - should open preference center
   - Test the Data Request tab
   - Change preferences and verify they save

### Verify Consent State

Open browser console (F12) and run:

```javascript
// Check if widget loaded
console.log(window.ConsentManager);

// Check consent for specific category
console.log(window.ConsentManager.hasConsent('analytics'));

// Get all consents
console.log(window.ConsentManager.getAllConsents());
```

---

## 🐛 Troubleshooting

### Banner Not Appearing?

1. ✅ Check script tag is added correctly
2. ✅ Verify Script ID is correct
3. ✅ Check browser console (F12) for errors
4. ✅ Clear browser cache and cookies
5. ✅ Verify configuration is published by service provider

### CORS Errors?

- Contact your service provider to add your domain to CORS settings
- Ensure you're using `https://` not `http://` in production

### Script Not Loading?

1. ✅ Check network tab in browser DevTools
2. ✅ Verify script URL is accessible
3. ✅ Check for ad blockers (they might block the script)
4. ✅ Verify internet connection

### Consent Not Saving?

1. ✅ Check browser console for errors
2. ✅ Verify localStorage is enabled in browser
3. ✅ Check if browser blocks third-party cookies

---

## 📱 Mobile Compatibility

The widget is fully responsive and works on:
- ✅ Desktop browsers
- ✅ Mobile browsers
- ✅ Tablets
- ✅ All screen sizes

---

## 🔒 Privacy & Compliance

- ✅ **DPDP Compliant**: Fully compliant with Digital Personal Data Protection Act
- ✅ **GDPR Ready**: Can be configured for GDPR compliance
- ✅ **User Control**: Users can change preferences anytime
- ✅ **Transparent**: Clear information about cookie usage
- ✅ **Secure**: All data transmitted over HTTPS

---

## 📞 Support

If you need help:
1. Check browser console for errors
2. Contact your service provider
3. Review this guide again
4. Test with a fresh browser session

---

## 🎉 That's It!

Your cookie consent widget is now integrated! The banner will appear automatically for new visitors, and users can manage their preferences anytime.

**Remember:**
- Always test after integration
- Monitor browser console for errors
- Keep your Script ID secure
- Contact your service provider for customization

