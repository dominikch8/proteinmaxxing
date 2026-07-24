(function () {
    const STORAGE_KEY = 'pm_cookie_consent';

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
    const base = {
        functionality_storage: 'granted',
        security_storage: 'granted',
        wait_for_update: choice ? 0 : 500
    };

    if (choice === 'accepted') {
        gtag('consent', 'default', {
            ...base,
            ad_storage: 'granted',
            ad_user_data: 'granted',
            ad_personalization: 'granted',
            analytics_storage: 'denied'
        });
        return;
    }

    gtag('consent', 'default', {
        ...base,
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied'
    });
})();
