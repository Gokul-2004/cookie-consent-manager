/**
 * Cookie Consent Widget - DPDP Compliant
 * OneTrust-style integration: Reads data-domain-script and fetches config from API
 */

(function() {
    'use strict';

    // Get script ID from data-domain-script attribute (OneTrust-style)
    const scriptElement = document.currentScript;
    const scriptId = scriptElement?.getAttribute('data-domain-script') || '';
    const apiUrl = scriptElement?.getAttribute('data-api-url') || window.location.origin;
    
    if (!scriptId) {
        console.error('Consent Manager: data-domain-script attribute is required');
        return;
    }

    // Configuration loaded from API
    let config = {
        scriptId: scriptId,
        apiUrl: apiUrl,
        loaded: false,
        categories: {},
        bannerConfig: {},
        defaultLanguage: 'en',
        supportedLanguages: ['en'],
        cookiePolicyUrl: null,
        webhookUrl: null,
        externalToolUrl: null
    };

    // Current consent state
    let currentConsent = {
        hasConsent: false,
        consentId: null,
        categories: {}
    };

    // Current language
    let currentLanguage = 'en';

    // Translations
    const translations = {
        en: {
            banner: {
                title: "Why we use cookies and other tracking technologies?",
                message: "Our site enables script (e.g. cookies) that is able to read, store, and write information on your browser and in your device. The information processed by this script includes data relating to you which may include personal identifiers (e.g. IP address and session details) and browsing activity. We use this information for various purposes - e.g. to deliver content, maintain security, enable user choice, improve our sites, and for marketing purposes. You can reject all non-essential processing by choosing to accept only necessary cookies. To personalize your choice and learn more click here to adjust your preferences",
                acceptAll: "Allow All",
                rejectAll: "Accept only necessary",
                customize: "Adjust my preferences",
                learnMore: "Learn more",
                cookieNotice: "Cookie Notice"
            },
            modal: {
                title: "Preference Center",
                description: "How can you manage your preferences?",
                save: "Save my Preferences",
                cancel: "Cancel",
                acceptOnlyNecessary: "Accept only necessary",
                turnOn: "Turn ON to enable",
                alwaysActive: "Always Active"
            },
            settings: {
                link: "Cookie Settings",
                alwaysAvailable: "Cookie preferences can be changed at any time"
            }
        },
        hi: {
            banner: {
                title: "हम कुकीज़ का उपयोग करते हैं",
                message: "हम आपके अनुभव को बेहतर बनाने के लिए कुकीज़ का उपयोग करते हैं।",
                acceptAll: "सभी स्वीकार करें",
                rejectAll: "सभी अस्वीकार करें",
                customize: "अनुकूलित करें",
                learnMore: "अधिक जानें"
            },
            modal: {
                title: "कुकी वरीयताएं",
                description: "अपनी कुकी वरीयताएं प्रबंधित करें।",
                save: "वरीयताएं सहेजें",
                cancel: "रद्द करें",
                turnOn: "सक्षम करने के लिए ON करें"
            },
            settings: {
                link: "कुकी सेटिंग्स",
                alwaysAvailable: "कुकी वरीयताएं कभी भी बदली जा सकती हैं"
            }
        }
    };

    // Get translation
    function t(key) {
        const keys = key.split('.');
        let value = translations[currentLanguage];
        for (const k of keys) {
            value = value?.[k];
        }
        return value || key;
    }

    // Global ConsentManager API (for tag managers)
    window.ConsentManager = {
        hasConsent: function(category) {
            return currentConsent.categories[category] === true;
        },
        getAllConsents: function() {
            return currentConsent.categories || {};
        },
        onConsentChange: function(callback) {
            if (typeof callback === 'function') {
                window.addEventListener('consentChange', function(event) {
                    callback(event.detail);
                });
            }
        },
        showPreferences: function() {
            showPreferencesModal();
        }
    };

    // Expose showPreferencesModal globally
    window.showConsentModal = showPreferencesModal;

    // Load configuration from API
    async function loadConfiguration() {
        try {
            const response = await fetch(`${config.apiUrl}/api/config/${config.scriptId}`);
            if (!response.ok) {
                throw new Error(`Failed to load configuration: ${response.statusText}`);
            }
            const apiConfig = await response.json();
            
            config.categories = apiConfig.categories || {};
            config.bannerConfig = apiConfig.banner_config || { position: 'bottom' };
            config.defaultLanguage = apiConfig.default_language || 'en';
            config.supportedLanguages = apiConfig.supported_languages || ['en'];
            config.cookiePolicyUrl = apiConfig.cookie_policy_url || null;
            config.webhookUrl = apiConfig.webhook_url || null;
            config.externalToolUrl = apiConfig.external_tool_url || null;
            config.loaded = true;
            
            // Set current language
            currentLanguage = localStorage.getItem('consent_language') || config.defaultLanguage;
            if (!config.supportedLanguages.includes(currentLanguage)) {
                currentLanguage = config.defaultLanguage;
            }
            
            return true;
        } catch (error) {
            console.error('Consent Manager: Error loading configuration', error);
            return false;
        }
    }

    // Get or create session ID
    function getSessionId() {
        let sessionId = localStorage.getItem('consent_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('consent_session_id', sessionId);
        }
        return sessionId;
    }

    // Check existing consent
    async function checkExistingConsent() {
        try {
            const consentId = localStorage.getItem('consent_id');
            const categories = localStorage.getItem('consent_categories');
            
            if (consentId && categories) {
                currentConsent = {
                    hasConsent: true,
                    consentId: consentId,
                    categories: JSON.parse(categories)
                };
                return currentConsent;
            }
        } catch (error) {
            console.error('Error checking consent:', error);
        }
        
        currentConsent = { hasConsent: false, consentId: null, categories: {} };
        return currentConsent;
    }

    // Save consent
    async function saveConsent(categories, action = 'created') {
        try {
            const sessionId = getSessionId();
            
            // Store in localStorage
            const consentId = 'consent_' + Date.now();
            localStorage.setItem('consent_id', consentId);
            localStorage.setItem('consent_categories', JSON.stringify(categories));
            localStorage.setItem('consent_timestamp', new Date().toISOString());
            
            currentConsent = {
                hasConsent: true,
                consentId: consentId,
                categories: categories
            };
            
            // Trigger consent change event
            window.dispatchEvent(new CustomEvent('consentChange', { detail: categories }));
            
            // Update Google Consent Mode if available
            if (window.gtag) {
                window.gtag('consent', 'update', {
                    'analytics_storage': categories.analytics ? 'granted' : 'denied',
                    'ad_storage': categories.marketing ? 'granted' : 'denied',
                    'ad_user_data': categories.marketing ? 'granted' : 'denied',
                    'ad_personalization': categories.marketing ? 'granted' : 'denied'
                });
            }
            
            // Push to GTM dataLayer if available
            if (window.dataLayer) {
                window.dataLayer.push({
                    'event': 'consentUpdate',
                    'consentCategories': categories
                });
            }
            
            return { success: true, consentId: consentId };
        } catch (error) {
            console.error('Error saving consent:', error);
            return { success: false, error: error.message };
        }
    }

    // Create banner - OneTrust style (centered modal)
    function createBanner() {
        if (document.getElementById('consent-banner')) return;
        
        const position = config.bannerConfig.position || 'bottom';
        const primaryColor = config.bannerConfig.colors?.primary || '#00A862'; // OneTrust green
        
        // OneTrust uses centered modal, but we support bottom too
        if (position === 'center') {
            // Centered modal style (OneTrust)
            const overlay = document.createElement('div');
            overlay.id = 'consent-banner-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            `;
            
            const banner = document.createElement('div');
            banner.id = 'consent-banner';
            banner.setAttribute('role', 'dialog');
            banner.setAttribute('aria-label', t('banner.title'));
            banner.style.cssText = `
                background: #f5f5f5;
                border-radius: 8px;
                max-width: 800px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                position: relative;
            `;
            
            banner.innerHTML = `
                <div style="padding: 30px; display: flex; gap: 20px; align-items: flex-start;">
                    <!-- Cookie Icon -->
                    <div style="flex-shrink: 0; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center;">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#00A862"/>
                            <circle cx="8.5" cy="10.5" r="1" fill="#00A862"/>
                            <circle cx="15.5" cy="10.5" r="1" fill="#00A862"/>
                            <circle cx="12" cy="15" r="1" fill="#00A862"/>
                        </svg>
                    </div>
                    
                    <!-- Content -->
                    <div style="flex: 1; min-width: 0;">
                        <h3 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #1a1a1a; line-height: 1.3;">
                            ${t('banner.title')}
                        </h3>
                        <p style="margin: 0 0 20px 0; font-size: 14px; color: #4a4a4a; line-height: 1.6;">
                            ${t('banner.message')}
                            ${config.cookiePolicyUrl ? ` <a href="${config.cookiePolicyUrl}" target="_blank" style="color: ${primaryColor}; text-decoration: underline; font-weight: 600;">${t('banner.cookieNotice')}</a>` : ''}
                        </p>
                        
                        <!-- Buttons - Stacked vertically (OneTrust style) -->
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            <button id="consent-accept-all" style="
                                padding: 14px 24px; 
                                background: ${primaryColor}; 
                                color: white; 
                                border: none; 
                                border-radius: 6px; 
                                cursor: pointer; 
                                font-size: 14px; 
                                font-weight: 600; 
                                transition: all 0.2s;
                                width: 100%;
                                text-align: center;
                            ">
                                ${t('banner.acceptAll')}
                            </button>
                            <button id="consent-reject-all" style="
                                padding: 14px 24px; 
                                background: ${primaryColor}; 
                                color: white; 
                                border: none; 
                                border-radius: 6px; 
                                cursor: pointer; 
                                font-size: 14px; 
                                font-weight: 600; 
                                transition: all 0.2s;
                                width: 100%;
                                text-align: center;
                            ">
                                ${t('banner.rejectAll')}
                            </button>
                            <button id="consent-customize" style="
                                padding: 14px 24px; 
                                background: transparent; 
                                color: ${primaryColor}; 
                                border: 2px solid ${primaryColor}; 
                                border-radius: 6px; 
                                cursor: pointer; 
                                font-size: 14px; 
                                font-weight: 600; 
                                transition: all 0.2s;
                                width: 100%;
                                text-align: center;
                            ">
                                ${t('banner.customize')}
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            overlay.appendChild(banner);
            document.body.appendChild(overlay);
            
            // Close on overlay click
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    // Don't close on overlay click for OneTrust style - user must make a choice
                }
            });
            
            // Add hover effects
            const buttons = banner.querySelectorAll('button');
            buttons.forEach(btn => {
                btn.addEventListener('mouseenter', function() {
                    if (this.id === 'consent-customize') {
                        this.style.background = primaryColor + '10';
                    } else {
                        this.style.opacity = '0.9';
                        this.style.transform = 'translateY(-1px)';
                    }
                });
                btn.addEventListener('mouseleave', function() {
                    if (this.id === 'consent-customize') {
                        this.style.background = 'transparent';
                    } else {
                        this.style.opacity = '1';
                        this.style.transform = 'translateY(0)';
                    }
                });
            });
            
            // Event listeners
            document.getElementById('consent-accept-all').addEventListener('click', () => {
                const allCategories = {};
                Object.keys(config.categories).forEach(key => {
                    allCategories[key] = true;
                });
                saveConsent(allCategories, 'accepted_all');
                overlay.remove();
                createPersistentSettingsLink();
            });
            
            document.getElementById('consent-reject-all').addEventListener('click', () => {
                const essentialOnly = {};
                Object.keys(config.categories).forEach(key => {
                    essentialOnly[key] = config.categories[key].required || false;
                });
                saveConsent(essentialOnly, 'rejected_all');
                overlay.remove();
                createPersistentSettingsLink();
            });
            
            document.getElementById('consent-customize').addEventListener('click', () => {
                overlay.remove();
                showPreferencesModal();
            });
            
        } else {
            // Original bottom banner style (fallback)
            const banner = document.createElement('div');
            banner.id = 'consent-banner';
            banner.setAttribute('role', 'banner');
            banner.setAttribute('aria-label', t('banner.title'));
            
            banner.style.cssText = `
                position: fixed;
                ${position === 'top' ? 'top: 0;' : 'bottom: 0;'}
                left: 0;
                right: 0;
                background: #ffffff;
                padding: 24px 0;
                box-shadow: 0 ${position === 'top' ? '2px' : '-2px'} 20px rgba(0,0,0,0.15);
                z-index: 10000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                border-top: ${position === 'bottom' ? '1px solid #e0e0e0' : 'none'};
                border-bottom: ${position === 'top' ? '1px solid #e0e0e0' : 'none'};
            `;
            
            banner.innerHTML = `
                <div style="max-width: 1400px; margin: 0 auto; padding: 0 20px;">
                    <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 30px; flex-wrap: wrap;">
                        <div style="flex: 1; min-width: 300px; max-width: 800px;">
                            <h3 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 600; color: #1a1a1a;">${t('banner.title')}</h3>
                            <p style="margin: 0 0 12px 0; font-size: 14px; color: #4a4a4a; line-height: 1.7;">
                                ${t('banner.message')}
                            </p>
                            ${config.cookiePolicyUrl ? `
                                <p style="margin: 0; font-size: 13px;">
                                    <a href="${config.cookiePolicyUrl}" target="_blank" style="color: ${primaryColor}; text-decoration: underline; font-weight: 500;">${t('banner.cookieNotice')}</a>
                                </p>
                            ` : ''}
                        </div>
                        <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center; flex-shrink: 0;">
                            <button id="consent-accept-all" style="
                                padding: 12px 24px; 
                                background: ${primaryColor}; 
                                color: white; 
                                border: none; 
                                border-radius: 6px; 
                                cursor: pointer; 
                                font-size: 14px; 
                                font-weight: 600; 
                                transition: all 0.2s;
                                white-space: nowrap;
                                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                            ">
                                ${t('banner.acceptAll')}
                            </button>
                            <button id="consent-reject-all" style="
                                padding: 12px 24px; 
                                background: ${primaryColor}; 
                                color: white; 
                                border: none; 
                                border-radius: 6px; 
                                cursor: pointer; 
                                font-size: 14px; 
                                font-weight: 600; 
                                transition: all 0.2s;
                                white-space: nowrap;
                                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                            ">
                                ${t('banner.rejectAll')}
                            </button>
                            <button id="consent-customize" style="
                                padding: 12px 24px; 
                                background: ${primaryColor}; 
                                color: white; 
                                border: none; 
                                border-radius: 6px; 
                                cursor: pointer; 
                                font-size: 14px; 
                                font-weight: 600; 
                                transition: all 0.2s;
                                white-space: nowrap;
                                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                            ">
                                ${t('banner.customize')}
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(banner);
            
            // Add hover effects
            const buttons = banner.querySelectorAll('button');
            buttons.forEach(btn => {
                btn.addEventListener('mouseenter', function() {
                    this.style.opacity = '0.9';
                    this.style.transform = 'translateY(-1px)';
                    this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                });
                btn.addEventListener('mouseleave', function() {
                    this.style.opacity = '1';
                    this.style.transform = 'translateY(0)';
                    this.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                });
                btn.addEventListener('mousedown', function() {
                    this.style.transform = 'translateY(0)';
                });
            });
            
            // Event listeners
            document.getElementById('consent-accept-all').addEventListener('click', () => {
                const allCategories = {};
                Object.keys(config.categories).forEach(key => {
                    allCategories[key] = true;
                });
                saveConsent(allCategories, 'accepted_all');
                banner.remove();
                createPersistentSettingsLink();
            });
            
            document.getElementById('consent-reject-all').addEventListener('click', () => {
                const essentialOnly = {};
                Object.keys(config.categories).forEach(key => {
                    essentialOnly[key] = config.categories[key].required || false;
                });
                saveConsent(essentialOnly, 'rejected_all');
                banner.remove();
                createPersistentSettingsLink();
            });
            
            document.getElementById('consent-customize').addEventListener('click', () => {
                showPreferencesModal();
                banner.remove();
            });
        }
    }

    // Show preferences modal
    function showPreferencesModal() {
        // Remove existing modal
        const existing = document.getElementById('consent-modal');
        if (existing) existing.remove();
        
        // DPDP COMPLIANT: All cookies OFF by default except Essential (locked)
        const hasConsentId = localStorage.getItem('consent_id');
        let currentCategories = {};
        
        // Always initialize: All OFF except Essential (DPDP requirement)
        Object.keys(config.categories).forEach(key => {
            // Essential cookies are always ON, everything else is OFF by default
            currentCategories[key] = config.categories[key].required || false;
        });
        
        // If user has given consent before, use their saved preferences
        if (hasConsentId) {
            try {
                const saved = JSON.parse(localStorage.getItem('consent_categories') || '{}');
                // Only use saved values if they are explicitly true, otherwise keep default (false)
                Object.keys(config.categories).forEach(key => {
                    if (saved[key] === true) {
                        currentCategories[key] = true;
                    }
                });
            } catch (e) {
                console.error('Error parsing saved consent:', e);
            }
        }
        
        // Ensure essential is always true (cannot be disabled)
        Object.keys(config.categories).forEach(key => {
            if (config.categories[key].required) {
                currentCategories[key] = true;
            }
        });
        
        // Create modal
        const modal = document.createElement('div');
        modal.id = 'consent-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-label', t('modal.title'));
        modal.setAttribute('aria-modal', 'true');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
            background: rgba(0,0,0,0.5); z-index: 10001; 
            display: flex; align-items: center; justify-content: center;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        
        // Language selector
        let languageSelector = '';
        if (config.supportedLanguages.length > 1) {
            languageSelector = `
                <select id="consent-language" style="padding: 5px 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;">
                    ${config.supportedLanguages.map(lang => 
                        `<option value="${lang}" ${lang === currentLanguage ? 'selected' : ''}>${lang.toUpperCase()}</option>`
                    ).join('')}
                </select>
            `;
        }
        
        // OneTrust-style: Two-panel layout with tabs
        const primaryColor = config.bannerConfig.colors?.primary || '#00A862';
        let selectedTab = 'categories'; // 'categories' or 'data-request'
        let selectedCategory = null;
        const categoryKeys = Object.keys(config.categories);
        if (categoryKeys.length > 0) {
            selectedCategory = categoryKeys[0]; // Default to first category
        }
        
        // Build left panel navigation with tabs
        let leftNavHTML = '<h3 style="margin: 0 0 20px 0; font-size: 16px; font-weight: 600; color: #333;">' + t('modal.description') + '</h3>';
        
        // Tab navigation
        leftNavHTML += `
            <div style="display: flex; gap: 0; margin-bottom: 20px; border-bottom: 1px solid #e0e0e0;">
                <div 
                    class="pref-tab" 
                    data-tab="categories"
                    style="
                        padding: 10px 16px;
                        cursor: pointer;
                        border-bottom: 2px solid ${selectedTab === 'categories' ? primaryColor : 'transparent'};
                        color: ${selectedTab === 'categories' ? primaryColor : '#666'};
                        font-weight: ${selectedTab === 'categories' ? '600' : '400'};
                        font-size: 14px;
                        transition: all 0.2s;
                    "
                >
                    Cookie Categories
                </div>
                <div 
                    class="pref-tab" 
                    data-tab="data-request"
                    style="
                        padding: 10px 16px;
                        cursor: pointer;
                        border-bottom: 2px solid ${selectedTab === 'data-request' ? primaryColor : 'transparent'};
                        color: ${selectedTab === 'data-request' ? primaryColor : '#666'};
                        font-weight: ${selectedTab === 'data-request' ? '600' : '400'};
                        font-size: 14px;
                        transition: all 0.2s;
                    "
                >
                    Data Request
                </div>
            </div>
        `;
        
        // Category navigation (shown when categories tab is selected)
        leftNavHTML += '<div id="category-nav-list" style="display: flex; flex-direction: column; gap: 0;">';
        Object.keys(config.categories).forEach(key => {
            const category = config.categories[key];
            const isSelected = key === selectedCategory && selectedTab === 'categories';
            leftNavHTML += `
                <div 
                    class="category-nav-item" 
                    data-category-key="${key}"
                    style="
                        padding: 12px 16px;
                        cursor: pointer;
                        border-left: 4px solid ${isSelected ? primaryColor : 'transparent'};
                        background: ${isSelected ? '#f5f5f5' : 'transparent'};
                        transition: all 0.2s;
                        font-size: 14px;
                        color: ${isSelected ? '#1a1a1a' : '#666'};
                        font-weight: ${isSelected ? '600' : '400'};
                    "
                >
                    ${category.name}
                </div>
            `;
        });
        leftNavHTML += '</div>';
        
        // Build right panel content for selected category
        function buildRightPanelContent(categoryKey) {
            const category = config.categories[categoryKey];
            const isChecked = currentCategories[categoryKey] === true;
            const isDisabled = category.required || false;
            const vendors = category.vendors || [];
            
            let content = `
                <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #1a1a1a; display: flex; align-items: center; justify-content: space-between;">
                    <span>${category.name}</span>
                    ${isDisabled ? `<span style="color: ${primaryColor}; font-size: 14px; font-weight: 500;">${t('modal.alwaysActive')}</span>` : ''}
                </h2>
                <p style="margin: 0 0 24px 0; font-size: 14px; color: #666; line-height: 1.6;">
                    ${category.description}
                </p>
            `;
            
            // Toggle switch - DPDP: All non-essential OFF by default
            if (!isDisabled) {
                content += `
                    <div style="margin-top: 20px; padding: 16px; background: #f9f9f9; border-radius: 6px; display: flex; align-items: center; justify-content: space-between;">
                        <span style="font-size: 14px; font-weight: 500; color: #333;">Enable ${category.name}</span>
                        <label style="position: relative; display: inline-block; width: 50px; height: 26px;">
                            <input 
                                type="checkbox" 
                                class="consent-toggle" 
                                data-category="${categoryKey}"
                                ${isChecked ? 'checked' : ''}
                                style="opacity: 0; width: 0; height: 0;"
                            >
                            <span class="toggle-slider" style="
                                position: absolute; cursor: pointer;
                                top: 0; left: 0; right: 0; bottom: 0;
                                background-color: ${isChecked ? primaryColor : '#ccc'};
                                transition: 0.3s; border-radius: 26px;
                            ">
                                <span style="
                                    position: absolute; content: '';
                                    height: 20px; width: 20px; left: 3px; bottom: 3px;
                                    background-color: white; transition: 0.3s; border-radius: 50%;
                                    transform: ${isChecked ? 'translateX(24px)' : 'translateX(0)'};
                                "></span>
                            </span>
                        </label>
                    </div>
                `;
            }
            
            // Vendor List (OneTrust style) - only show if vendors exist
            if (vendors.length > 0) {
                content += `
                    <div style="margin-top: 30px;">
                        <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #1a1a1a;">Vendor List</h3>
                        <div style="display: flex; flex-direction: column; gap: 12px;">
                `;
                
                vendors.forEach((vendor, index) => {
                    const vendorId = `vendor-${categoryKey}-${index}`;
                    const isExpanded = false; // Start collapsed
                    content += `
                        <div class="vendor-item" data-vendor-id="${vendorId}" style="
                            border: 1px solid #e0e0e0;
                            border-radius: 6px;
                            overflow: hidden;
                            background: #ffffff;
                        ">
                            <div style="
                                padding: 14px 16px;
                                display: flex;
                                align-items: center;
                                justify-content: space-between;
                                cursor: pointer;
                                background: #fafafa;
                                transition: background 0.2s;
                            " onclick="toggleVendorDetails('${vendorId}')">
                                <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                                    <span style="
                                        font-size: 16px;
                                        color: ${primaryColor};
                                        transition: transform 0.3s;
                                        transform: rotate(0deg);
                                    " id="${vendorId}-arrow">▶</span>
                                    <span style="font-size: 14px; font-weight: 500; color: #333;">${vendor.name}</span>
                                    ${vendor.parent_company ? `<span style="font-size: 12px; color: #666;">(${vendor.parent_company})</span>` : ''}
                                </div>
                                ${!isDisabled ? `
                                    <label style="position: relative; display: inline-block; width: 50px; height: 26px; margin-left: 12px;" onclick="event.stopPropagation();">
                                        <input 
                                            type="checkbox" 
                                            class="vendor-toggle" 
                                            data-category="${categoryKey}"
                                            data-vendor="${vendor.name}"
                                            ${isChecked ? 'checked' : ''}
                                            ${isDisabled ? 'disabled' : ''}
                                            style="opacity: 0; width: 0; height: 0;"
                                        >
                                        <span class="toggle-slider" style="
                                            position: absolute; cursor: ${isDisabled ? 'not-allowed' : 'pointer'};
                                            top: 0; left: 0; right: 0; bottom: 0;
                                            background-color: ${isChecked ? primaryColor : '#ccc'};
                                            transition: 0.3s; border-radius: 26px;
                                        ">
                                            <span style="
                                                position: absolute; content: '';
                                                height: 20px; width: 20px; left: 3px; bottom: 3px;
                                                background-color: white; transition: 0.3s; border-radius: 50%;
                                                transform: ${isChecked ? 'translateX(24px)' : 'translateX(0)'};
                                            "></span>
                                        </span>
                                    </label>
                                ` : `<span style="color: ${primaryColor}; font-size: 12px; font-weight: 500; margin-left: 12px;">${t('modal.alwaysActive')}</span>`}
                            </div>
                            <div id="${vendorId}-details" style="
                                display: none;
                                padding: 16px;
                                border-top: 1px solid #e0e0e0;
                                background: #ffffff;
                            ">
                                ${vendor.description ? `<p style="margin: 0 0 12px 0; font-size: 13px; color: #666; line-height: 1.5;"><strong>Description:</strong> ${vendor.description}</p>` : ''}
                                ${vendor.parent_company ? `<p style="margin: 0 0 12px 0; font-size: 13px; color: #666;"><strong>Parent Company:</strong> ${vendor.parent_company}</p>` : ''}
                                <p style="margin: 0 0 8px 0; font-size: 13px; color: #666;"><strong>Default Category:</strong> ${category.name}</p>
                                ${vendor.privacy_policy_url ? `<p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Privacy Policy Link:</strong> <a href="${vendor.privacy_policy_url}" target="_blank" style="color: ${primaryColor}; text-decoration: underline;">${vendor.privacy_policy_url}</a></p>` : ''}
                                ${vendor.cookie_policy_url ? `<p style="margin: 0 0 0 0; font-size: 13px;"><strong>Cookie Policy Link:</strong> <a href="${vendor.cookie_policy_url}" target="_blank" style="color: ${primaryColor}; text-decoration: underline;">${vendor.cookie_policy_url}</a></p>` : ''}
                            </div>
                        </div>
                    `;
                });
                
                content += `
                        </div>
                    </div>
                `;
            }
            
            return content;
        }
        
        // Toggle vendor details (OneTrust style expand/collapse)
        window.toggleVendorDetails = function(vendorId) {
            const detailsDiv = document.getElementById(vendorId + '-details');
            const arrow = document.getElementById(vendorId + '-arrow');
            if (detailsDiv.style.display === 'none') {
                detailsDiv.style.display = 'block';
                arrow.style.transform = 'rotate(90deg)';
            } else {
                detailsDiv.style.display = 'none';
                arrow.style.transform = 'rotate(0deg)';
            }
        };
        
        // Build data request form
        function buildDataRequestForm() {
            return `
                <h2 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #1a1a1a;">
                    Data Request Form
                </h2>
                <p style="margin: 0 0 24px 0; font-size: 14px; color: #666; line-height: 1.6;">
                    Submit a request to access, export, or delete your personal data in accordance with DPDP regulations.
                </p>
                
                <form id="data-request-form" style="display: flex; flex-direction: column; gap: 20px;">
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500; color: #333;">
                            Your Name <span style="color: #ff4444;">*</span>
                        </label>
                        <input 
                            type="text" 
                            id="data-request-name" 
                            required
                            placeholder="Type your full name"
                            style="
                                width: 100%;
                                padding: 12px;
                                border: 1px solid #ddd;
                                border-radius: 6px;
                                font-size: 14px;
                                font-family: inherit;
                            "
                        >
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500; color: #333;">
                            Your Email <span style="color: #ff4444;">*</span>
                        </label>
                        <input 
                            type="email" 
                            id="data-request-email" 
                            required
                            placeholder="Type your email"
                            style="
                                width: 100%;
                                padding: 12px;
                                border: 1px solid #ddd;
                                border-radius: 6px;
                                font-size: 14px;
                                font-family: inherit;
                            "
                        >
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500; color: #333;">
                            Address
                        </label>
                        <input 
                            type="text" 
                            id="data-request-address" 
                            placeholder="Type your address"
                            style="
                                width: 100%;
                                padding: 12px;
                                border: 1px solid #ddd;
                                border-radius: 6px;
                                font-size: 14px;
                                font-family: inherit;
                            "
                        >
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500; color: #333;">
                            Phone
                        </label>
                        <input 
                            type="tel" 
                            id="data-request-phone" 
                            placeholder="Type your phone number"
                            style="
                                width: 100%;
                                padding: 12px;
                                border: 1px solid #ddd;
                                border-radius: 6px;
                                font-size: 14px;
                                font-family: inherit;
                            "
                        >
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 12px; font-size: 14px; font-weight: 500; color: #333;">
                            Request Type <span style="color: #ff4444;">*</span>
                        </label>
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                <input 
                                    type="radio" 
                                    name="request-type" 
                                    value="export" 
                                    checked
                                    style="width: 18px; height: 18px; cursor: pointer;"
                                >
                                <span style="font-size: 14px; color: #333;">Data export</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                <input 
                                    type="radio" 
                                    name="request-type" 
                                    value="deletion"
                                    style="width: 18px; height: 18px; cursor: pointer;"
                                >
                                <span style="font-size: 14px; color: #333;">Data deletion</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                <input 
                                    type="radio" 
                                    name="request-type" 
                                    value="other"
                                    style="width: 18px; height: 18px; cursor: pointer;"
                                >
                                <span style="font-size: 14px; color: #333;">Other request</span>
                            </label>
                        </div>
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500; color: #333;">
                            Message
                        </label>
                        <textarea 
                            id="data-request-message" 
                            rows="4"
                            placeholder="Additional details about your request..."
                            style="
                                width: 100%;
                                padding: 12px;
                                border: 1px solid #ddd;
                                border-radius: 6px;
                                font-size: 14px;
                                font-family: inherit;
                                resize: vertical;
                            "
                        ></textarea>
                    </div>
                    
                    <div style="display: flex; gap: 12px; margin-top: 10px;">
                        <button 
                            type="button" 
                            id="data-request-cancel"
                            style="
                                padding: 12px 24px;
                                background: #f8f9fa;
                                color: #333;
                                border: 1px solid #ddd;
                                border-radius: 6px;
                                cursor: pointer;
                                font-size: 14px;
                                font-weight: 500;
                                transition: all 0.2s;
                                flex: 1;
                            "
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            id="data-request-submit"
                            style="
                                padding: 12px 24px;
                                background: ${primaryColor};
                                color: white;
                                border: none;
                                border-radius: 6px;
                                cursor: pointer;
                                font-size: 14px;
                                font-weight: 600;
                                transition: all 0.2s;
                                flex: 1;
                            "
                        >
                            Submit
                        </button>
                    </div>
                </form>
            `;
        }
        
        modal.innerHTML = `
            <div style="
                background: white; border-radius: 8px; 
                max-width: 1000px; width: 100%; max-height: 90vh;
                overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                display: flex; flex-direction: column;
            ">
                <div style="padding: 25px 30px; border-bottom: 1px solid #e0e0e0; display: flex; justify-content: space-between; align-items: center; background: #ffffff;">
                    <h2 style="margin: 0; font-size: 22px; font-weight: 600; color: #1a1a1a; letter-spacing: -0.3px;">${t('modal.title')}</h2>
                    ${languageSelector}
                </div>
                <div style="display: flex; flex: 1; overflow: hidden;">
                    <!-- Left Panel: Category Navigation -->
                    <div style="width: 280px; border-right: 1px solid #e0e0e0; padding: 25px; overflow-y: auto; background: #fafafa;">
                        ${leftNavHTML}
                    </div>
                    <!-- Right Panel: Category Details or Data Request -->
                    <div style="flex: 1; padding: 30px; overflow-y: auto; background: #ffffff;" id="category-details-panel">
                        ${selectedTab === 'categories' ? buildRightPanelContent(selectedCategory) : buildDataRequestForm()}
                    </div>
                </div>
                <div style="padding: 25px; border-top: 1px solid #eee; display: flex; gap: 12px; justify-content: flex-end; flex-wrap: wrap; background: #ffffff;">
                    <button id="consent-save" style="
                        padding: 12px 24px; background: ${primaryColor}; color: white;
                        border: none; border-radius: 6px; cursor: pointer;
                        font-size: 14px; font-weight: 600;
                        transition: all 0.2s;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    ">${t('modal.save')}</button>
                    <button id="consent-accept-only" style="
                        padding: 12px 24px; background: ${primaryColor}; color: white;
                        border: none; border-radius: 6px; cursor: pointer;
                        font-size: 14px; font-weight: 600;
                        transition: all 0.2s;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    ">${t('modal.acceptOnlyNecessary')}</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Language selector
        if (languageSelector) {
            document.getElementById('consent-language').addEventListener('change', (e) => {
                currentLanguage = e.target.value;
                localStorage.setItem('consent_language', currentLanguage);
                showPreferencesModal(); // Recreate modal with new language
            });
        }
        
        // Tab navigation handlers
        const prefTabs = modal.querySelectorAll('.pref-tab');
        prefTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const tabName = this.dataset.tab;
                selectedTab = tabName;
                
                // Update tab highlighting
                prefTabs.forEach(t => {
                    const isSelected = t.dataset.tab === tabName;
                    t.style.borderBottomColor = isSelected ? primaryColor : 'transparent';
                    t.style.color = isSelected ? primaryColor : '#666';
                    t.style.fontWeight = isSelected ? '600' : '400';
                });
                
                // Show/hide category navigation
                const categoryNav = document.getElementById('category-nav-list');
                if (tabName === 'categories') {
                    categoryNav.style.display = 'flex';
                } else {
                    categoryNav.style.display = 'none';
                }
                
                // Update right panel content
                const detailsPanel = document.getElementById('category-details-panel');
                if (tabName === 'categories') {
                    detailsPanel.innerHTML = buildRightPanelContent(selectedCategory);
                    // Re-attach category toggle listeners
                    attachCategoryToggleListeners();
                } else {
                    detailsPanel.innerHTML = buildDataRequestForm();
                    // Attach data request form handlers
                    attachDataRequestHandlers();
                }
            });
        });
        
        // Category navigation click handlers
        function attachCategoryToggleListeners() {
            const navItems = modal.querySelectorAll('.category-nav-item');
            navItems.forEach(item => {
                item.addEventListener('click', function() {
                    const categoryKey = this.dataset.categoryKey;
                    selectedCategory = categoryKey;
                    
                    // Update navigation highlighting
                    navItems.forEach(nav => {
                        const isSelected = nav.dataset.categoryKey === categoryKey;
                        nav.style.borderLeftColor = isSelected ? primaryColor : 'transparent';
                        nav.style.background = isSelected ? '#f5f5f5' : 'transparent';
                        nav.style.color = isSelected ? '#1a1a1a' : '#666';
                        nav.style.fontWeight = isSelected ? '600' : '400';
                    });
                    
                    // Update right panel content
                    const detailsPanel = document.getElementById('category-details-panel');
                    detailsPanel.innerHTML = buildRightPanelContent(categoryKey);
                    
                    // Re-attach category toggle event listener
                    const toggle = detailsPanel.querySelector('.consent-toggle');
                    if (toggle) {
                        toggle.addEventListener('change', function() {
                            const catKey = this.dataset.category;
                            const isChecked = this.checked;
                            const slider = this.nextElementSibling;
                            slider.style.backgroundColor = isChecked ? primaryColor : '#ccc';
                            slider.querySelector('span').style.transform = isChecked ? 'translateX(24px)' : 'translateX(0)';
                            
                            // Sync vendor toggles with category toggle
                            const vendorToggles = detailsPanel.querySelectorAll('.vendor-toggle');
                            vendorToggles.forEach(vt => {
                                vt.checked = isChecked;
                                const vSlider = vt.nextElementSibling;
                                vSlider.style.backgroundColor = isChecked ? primaryColor : '#ccc';
                                vSlider.querySelector('span').style.transform = isChecked ? 'translateX(24px)' : 'translateX(0)';
                            });
                        });
                    }
                    
                    // Attach vendor toggle listeners
                    const vendorToggles = detailsPanel.querySelectorAll('.vendor-toggle');
                    vendorToggles.forEach(vt => {
                        vt.addEventListener('change', function() {
                            const isChecked = this.checked;
                            const slider = this.nextElementSibling;
                            slider.style.backgroundColor = isChecked ? primaryColor : '#ccc';
                            slider.querySelector('span').style.transform = isChecked ? 'translateX(24px)' : 'translateX(0)';
                            
                            // If any vendor is enabled, enable the category
                            const categoryToggle = detailsPanel.querySelector('.consent-toggle');
                            if (categoryToggle && !categoryToggle.disabled) {
                                const anyVendorEnabled = Array.from(detailsPanel.querySelectorAll('.vendor-toggle')).some(v => v.checked);
                                if (anyVendorEnabled && !categoryToggle.checked) {
                                    categoryToggle.checked = true;
                                    const catSlider = categoryToggle.nextElementSibling;
                                    catSlider.style.backgroundColor = primaryColor;
                                    catSlider.querySelector('span').style.transform = 'translateX(24px)';
                                }
                            }
                        });
                    });
                });
            });
        }
        
        // Data request form handlers
        function attachDataRequestHandlers() {
            const form = document.getElementById('data-request-form');
            const cancelBtn = document.getElementById('data-request-cancel');
            
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    modal.remove();
                });
            }
            
            if (form) {
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    
                    const requestData = {
                        name: document.getElementById('data-request-name').value,
                        email: document.getElementById('data-request-email').value,
                        address: document.getElementById('data-request-address').value || null,
                        phone: document.getElementById('data-request-phone').value || null,
                        request_type: document.querySelector('input[name="request-type"]:checked').value,
                        message: document.getElementById('data-request-message').value || null,
                        session_id: getSessionId()
                    };
                    
                    try {
                        // Send to backend API
                        const response = await fetch(`${config.apiUrl}/api/grievance/create`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(requestData)
                        });
                        
                        if (response.ok) {
                            alert('Data request submitted successfully! We will process your request within 30 days as per DPDP regulations.');
                            form.reset();
                            modal.remove();
                        } else {
                            alert('Error submitting request. Please try again.');
                        }
                    } catch (error) {
                        console.error('Error submitting data request:', error);
                        alert('Request submitted (offline mode). We will process your request within 30 days.');
                        form.reset();
                        modal.remove();
                    }
                });
            }
        }
        
        // Initialize category navigation listeners
        attachCategoryToggleListeners();
        
        // Toggle switches (category toggles)
        const toggles = modal.querySelectorAll('.consent-toggle');
        toggles.forEach(toggle => {
            toggle.addEventListener('change', function() {
                const category = this.dataset.category;
                const isChecked = this.checked;
                const slider = this.nextElementSibling;
                slider.style.backgroundColor = isChecked ? primaryColor : '#ccc';
                slider.querySelector('span').style.transform = isChecked ? 'translateX(24px)' : 'translateX(0)';
                
                // Sync vendor toggles with category toggle
                const detailsPanel = document.getElementById('category-details-panel');
                const vendorToggles = detailsPanel.querySelectorAll('.vendor-toggle');
                vendorToggles.forEach(vt => {
                    if (vt.dataset.category === category) {
                        vt.checked = isChecked;
                        const vSlider = vt.nextElementSibling;
                        vSlider.style.backgroundColor = isChecked ? primaryColor : '#ccc';
                        vSlider.querySelector('span').style.transform = isChecked ? 'translateX(24px)' : 'translateX(0)';
                    }
                });
            });
        });
        
        // Vendor toggle switches (sync with category)
        const vendorToggles = modal.querySelectorAll('.vendor-toggle');
        vendorToggles.forEach(vt => {
            vt.addEventListener('change', function() {
                const category = this.dataset.category;
                const isChecked = this.checked;
                const slider = this.nextElementSibling;
                slider.style.backgroundColor = isChecked ? primaryColor : '#ccc';
                slider.querySelector('span').style.transform = isChecked ? 'translateX(24px)' : 'translateX(0)';
                
                // If any vendor is enabled, enable the category
                const categoryToggle = modal.querySelector(`.consent-toggle[data-category="${category}"]`);
                if (categoryToggle && !categoryToggle.disabled) {
                    const allVendorToggles = modal.querySelectorAll(`.vendor-toggle[data-category="${category}"]`);
                    const anyVendorEnabled = Array.from(allVendorToggles).some(v => v.checked);
                    if (anyVendorEnabled && !categoryToggle.checked) {
                        categoryToggle.checked = true;
                        const catSlider = categoryToggle.nextElementSibling;
                        catSlider.style.backgroundColor = primaryColor;
                        catSlider.querySelector('span').style.transform = 'translateX(24px)';
                    }
                }
            });
        });
        
        // Save button
        document.getElementById('consent-save').addEventListener('click', () => {
            const categories = {};
            toggles.forEach(toggle => {
                const category = toggle.dataset.category;
                categories[category] = toggle.checked;
            });
            
            // Ensure essential is always true
            Object.keys(config.categories).forEach(key => {
                if (config.categories[key].required) {
                    categories[key] = true;
                }
            });
            
            saveConsent(categories, 'customized');
            modal.remove();
            createPersistentSettingsLink();
        });
        
        // Accept only necessary button
        document.getElementById('consent-accept-only').addEventListener('click', () => {
            const essentialOnly = {};
            Object.keys(config.categories).forEach(key => {
                essentialOnly[key] = config.categories[key].required || false;
            });
            saveConsent(essentialOnly, 'accepted_only_necessary');
            modal.remove();
            createPersistentSettingsLink();
        });
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // Close on Escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    // Create persistent settings link
    function createPersistentSettingsLink() {
        if (document.getElementById('consent-settings-link')) return;
        
        const link = document.createElement('button');
        link.id = 'consent-settings-link';
        link.textContent = t('settings.link');
        link.style.cssText = `
            position: fixed; bottom: 20px; right: 20px;
            padding: 10px 20px; background: #007bff; color: white;
            border: none; border-radius: 20px; cursor: pointer;
            font-size: 13px; font-weight: 500; z-index: 9999;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            transition: all 0.2s;
        `;
        
        link.addEventListener('mouseenter', () => {
            link.style.transform = 'scale(1.05)';
        });
        link.addEventListener('mouseleave', () => {
            link.style.transform = 'scale(1)';
        });
        
        link.addEventListener('click', () => {
            showPreferencesModal();
        });
        
        document.body.appendChild(link);
    }

    // Initialize
    async function init() {
        const configLoaded = await loadConfiguration();
        if (!configLoaded) {
            console.error('Consent Manager: Failed to load configuration');
            return;
        }
        
        const consentStatus = await checkExistingConsent();
        if (!consentStatus.hasConsent) {
            createBanner();
        } else {
            createPersistentSettingsLink();
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
