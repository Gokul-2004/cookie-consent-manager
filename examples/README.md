# Integration Examples

## Basic HTML Integration

See `basic.html` for a simple HTML page with the widget integrated.

## WordPress Integration

Add this to your theme's `functions.php` or use a plugin:

```php
function add_consent_widget() {
    ?>
    <script
        src="http://localhost:8000/widget/consent-widget.js"
        data-domain-script="YOUR_SCRIPT_ID"
        charset="UTF-8"
    ></script>
    <?php
}
add_action('wp_head', 'add_consent_widget');
```

## React Integration

```jsx
import { useEffect } from 'react';

function App() {
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'http://localhost:8000/widget/consent-widget.js';
        script.setAttribute('data-domain-script', 'YOUR_SCRIPT_ID');
        script.setAttribute('data-api-url', 'http://localhost:8000');
        script.charset = 'UTF-8';
        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
        };
    }, []);

    // Use consent state
    useEffect(() => {
        if (window.ConsentManager) {
            const checkConsent = () => {
                if (window.ConsentManager.hasConsent('analytics')) {
                    // Load analytics
                    console.log('Analytics consented');
                }
            };
            
            checkConsent();
            window.ConsentManager.onConsentChange(checkConsent);
        }
    }, []);

    return <div>Your app content</div>;
}
```

## Google Tag Manager Integration

1. Add the widget script to your site
2. In GTM, create a Custom JavaScript variable:

```javascript
function() {
    return window.ConsentManager ? window.ConsentManager.getAllConsents() : {};
}
```

3. Create triggers that check consent:
   - Analytics tag: Only fire if `{{Consent Variable}}.analytics === true`
   - Marketing tag: Only fire if `{{Consent Variable}}.marketing === true`

## Google Consent Mode v2

The widget automatically updates Google Consent Mode when consent changes. Just make sure Google Tag Manager or gtag.js is loaded.





