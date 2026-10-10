(function () {
    const STORAGE_KEY = 'pm_cookie_consent';
    const CONSENT_TTL_MS = 180 * 24 * 60 * 60 * 1000; // 180 dni

    function readChoice() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            let obj;
            try {
                obj = JSON.parse(raw);
            } catch {
                obj = { value: raw, ts: 0 };
            }
            if (!obj || !obj.value) return null;
            // wygasła zgoda -> pytamy ponownie
            if (obj.ts && Date.now() - obj.ts > CONSENT_TTL_MS) {
                try {
                    localStorage.removeItem(STORAGE_KEY);
                } catch {
                    /* ignore */
                }
                return null;
            }
            return obj;
        } catch {
            return null;
        }
    }

    function saveChoice(value) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ value, ts: Date.now() }));
        } catch {
            /* ignore */
        }
    }

    function applyConsent(granted) {
        if (typeof window.gtag !== 'function') return;
        window.gtag('consent', 'update', {
            ad_storage: granted ? 'granted' : 'denied',
            ad_user_data: granted ? 'granted' : 'denied',
            ad_personalization: granted ? 'granted' : 'denied',
            analytics_storage: granted ? 'granted' : 'denied'
        });
    }

    function policyUrl() {
        return window.location.pathname.includes('/produkty/')
            ? '../informacje'
            : 'informacje';
    }

    function removeBanner() {
        const el = document.getElementById('pm-cookie-banner');
        if (el) el.remove();
        document.body.classList.remove('pm-cookie-banner-open');
    }

    function mountBanner(force) {
        if (document.getElementById('pm-cookie-banner')) return;
        if (!force && readChoice()) return;

        const wrap = document.createElement('div');
        wrap.id = 'pm-cookie-banner';
        wrap.className = 'pm-cookie-banner';
        wrap.setAttribute('role', 'dialog');
        wrap.setAttribute('aria-label', 'Zgoda na pliki cookie');
        wrap.innerHTML = `
            <div class="pm-cookie-banner__inner">
                <p class="pm-cookie-banner__text">
                    Używamy plików cookie (Google Analytics, reklamy Google AdSense),
                    m.in. do statystyk i dopasowanych reklam. Zgodę możesz w każdej chwili
                    zmienić lub wycofać. <a href="${policyUrl()}">Więcej w Informacjach</a> (UE / RODO).
                </p>
                <div class="pm-cookie-banner__actions">
                    <button type="button" class="pm-cookie-btn pm-cookie-btn--reject" data-choice="rejected">Odrzuć wszystkie</button>
                    <button type="button" class="pm-cookie-btn pm-cookie-btn--accept" data-choice="accepted">Akceptuję</button>
                </div>
            </div>
        `;

        document.body.appendChild(wrap);
        document.body.classList.add('pm-cookie-banner-open');

        wrap.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-choice]');
            if (!btn) return;
            const choice = btn.getAttribute('data-choice');
            saveChoice(choice);
            applyConsent(choice === 'accepted');
            removeBanner();
        });
    }

    // Pozwala ponownie otworzyć baner (zmiana / wycofanie zgody).
    window.pmOpenCookieSettings = function () {
        removeBanner();
        mountBanner(true);
    };

    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-pm-cookie-settings]');
        if (!trigger) return;
        e.preventDefault();
        window.pmOpenCookieSettings();
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => mountBanner(false));
    } else {
        mountBanner(false);
    }
})();

