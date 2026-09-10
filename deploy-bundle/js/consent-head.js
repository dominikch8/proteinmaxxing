(function () {
    const STORAGE_KEY = 'pm_cookie_consent';
    const GA_ID = 'G-4FJC6S1VCX';

    // Force-accept cookies by default (writes localStorage) to avoid
    // showing the banner / repeatedly asking the user.
    try {
        if (!localStorage.getItem(STORAGE_KEY)) {
            localStorage.setItem(STORAGE_KEY, 'accepted');
        }
    } catch {}

    function readChoice() {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch {
            return null;
        }
    }

    window.dataLayer = window.dataLayer || [];
    function gtag() {
        window.dataLayer.push(arguments);
    }
    window.gtag = window.gtag || gtag;

    const choice = readChoice();
    const accepted = choice === 'accepted';
    const base = {
        functionality_storage: 'granted',
        security_storage: 'granted',
        wait_for_update: choice ? 0 : 500
    };

    gtag('consent', 'default', {
        ...base,
        ad_storage: accepted ? 'granted' : 'denied',
        ad_user_data: accepted ? 'granted' : 'denied',
        ad_personalization: accepted ? 'granted' : 'denied',
        analytics_storage: accepted ? 'granted' : 'denied'
    });

    gtag('js', new Date());
    gtag('config', GA_ID, {
        anonymize_ip: true
    });

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);
})();
