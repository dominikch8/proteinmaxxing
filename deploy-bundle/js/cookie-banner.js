(function () {
    const STORAGE_KEY = 'pm_cookie_consent';

    function readChoice() {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch {
            return null;
        }
    }

    function saveChoice(value) {
        try {
            localStorage.setItem(STORAGE_KEY, value);
        } catch {
            /* ignore */
        }
    }

    function applyConsent(granted) {
        if (typeof window.gtag !== 'function') return;
        if (granted) {
            window.gtag('consent', 'update', {
                ad_storage: 'granted',
                ad_user_data: 'granted',
                ad_personalization: 'granted',
                analytics_storage: 'denied'
            });
            return;
        }
        window.gtag('consent', 'update', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'denied'
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

    function mountBanner() {
        if (readChoice()) return;

        const wrap = document.createElement('div');
        wrap.id = 'pm-cookie-banner';
        wrap.className = 'pm-cookie-banner';
        wrap.setAttribute('role', 'dialog');
        wrap.setAttribute('aria-label', 'Zgoda na pliki cookie');
        wrap.innerHTML = `
            <div class="pm-cookie-banner__inner">
                <p class="pm-cookie-banner__text">
                    Ta strona korzysta z plików cookie (Google AdSense),
                    m.in. do dopasowanych reklam.
                    <a href="${policyUrl()}">Więcej w Informacjach</a> (UE / RODO).
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
            const granted = btn.getAttribute('data-choice') === 'accepted';
            const choice = btn.getAttribute('data-choice');
            saveChoice(choice);
            applyConsent(granted);
            removeBanner();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', mountBanner);
    } else {
        mountBanner();
    }
})();
