(function () {
    const STORAGE_KEY = 'pm_cookie_consent';
    const GA_ID = 'G-4FJC6S1VCX';

    function readChoice() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            try {
                const obj = JSON.parse(raw);
                if (obj && typeof obj === 'object' && obj.value) return obj;
            } catch {
                /* stary format (sam string) */
            }
            return { value: raw, ts: 0 };
        } catch {
            return null;
        }
    }

    window.dataLayer = window.dataLayer || [];
    function gtag() {
        window.dataLayer.push(arguments);
    }
    window.gtag = window.gtag || gtag;

    // Domyślnie WSZYSTKO odmówione (brak zgody bez działania użytkownika).
    const choice = readChoice();
    const accepted = !!choice && choice.value === 'accepted';

    gtag('consent', 'default', {
        ad_storage: accepted ? 'granted' : 'denied',
        ad_user_data: accepted ? 'granted' : 'denied',
        ad_personalization: accepted ? 'granted' : 'denied',
        analytics_storage: accepted ? 'granted' : 'denied',
        functionality_storage: 'granted',
        security_storage: 'granted',
        wait_for_update: choice ? 0 : 500
    });

    // Redakcja danych reklamowych, dopóki brak zgody.
    if (!accepted) {
        gtag('set', 'ads_data_redaction', true);
        gtag('set', 'url_passthrough', true);
    }

    gtag('js', new Date());
    gtag('config', GA_ID, {
        anonymize_ip: true
    });

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);
})();

