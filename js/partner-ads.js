(function () {
    const STORAGE_KEY = 'pm_cookie_consent';
    let loaded = false;

    const ECPM_GLOBAL_SCRIPTS = [
        'https://pl29651366.effectivecpmnetwork.com/c0/1c/eb/c01ceb5b0b612559acfbc1d6526ef8bb.js',
        'https://pl29651368.effectivecpmnetwork.com/e2/a9/78/e2a97881d4d9e461601c63766013a906.js',
        'https://www.effectivecpmnetwork.com/wbspeedw?key=656c16baec0e7ef92f42b76bb9bb1cdb'
    ];

    /** highperformanceformat.com — przypisanie formatu do strefy */
    const HPF_BY_ZONE = {
        railLeft: [{ key: '80251502c79aab83754f86505251e1c9', width: 160, height: 600, className: '160x600' }],
        railRight: [{ key: '8dd5a04bd51b190b2cdaf588219cbcea', width: 160, height: 300, className: '160x300' }],
        leaderboard: [{ key: '771a5950ad069c158ee79ef6a5943958', width: 728, height: 90, className: '728x90' }],
        mobileBar: [{ key: 'a87d0b3fe2ab743d8626ade2069d3128', width: 320, height: 50, className: '320x50' }],
        footer: [
            { key: 'ba53866ada7a0867cc0d44a70cd71eb9', width: 468, height: 60, className: '468x60' },
            { key: '0f3d22d42185c00bdff61f40130d8357', width: 300, height: 250, className: '300x250' }
        ]
    };

    function hasConsent() {
        try {
            return localStorage.getItem(STORAGE_KEY) === 'accepted';
        } catch {
            return false;
        }
    }

    function injectScript(src, attrs) {
        const exists = Array.from(document.querySelectorAll('script[src]')).some(
            (s) => s.getAttribute('src') === src
        );
        if (exists) return;
        const s = document.createElement('script');
        s.src = src;
        s.async = true;
        if (attrs) {
            Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v));
        }
        document.body.appendChild(s);
    }

    function loadHpfAd(parent, ad) {
        const slot = document.createElement('div');
        slot.className = `pm-ad-slot pm-ad-slot--${ad.className}`;

        const cfg = document.createElement('script');
        cfg.text = `atOptions = ${JSON.stringify({
            key: ad.key,
            format: 'iframe',
            height: ad.height,
            width: ad.width,
            params: {}
        })};`;

        const inv = document.createElement('script');
        inv.src = `https://www.highperformanceformat.com/${ad.key}/invoke.js`;
        inv.async = true;

        slot.appendChild(cfg);
        slot.appendChild(inv);
        parent.appendChild(slot);
    }

    function loadHpfZone(parent, ads) {
        ads.forEach((ad) => loadHpfAd(parent, ad));
    }

    function loadEcpmInvoke(parent) {
        const slot = document.createElement('div');
        slot.className = 'pm-ad-slot pm-ad-slot--ecpm-invoke';
        const ecpmScript = document.createElement('script');
        ecpmScript.async = true;
        ecpmScript.setAttribute('data-cfasync', 'false');
        ecpmScript.src =
            'https://pl29651369.effectivecpmnetwork.com/658eec4fdcf15651f91c6d8adbe4f016/invoke.js';
        const ecpmContainer = document.createElement('div');
        ecpmContainer.id = 'container-658eec4fdcf15651f91c6d8adbe4f016';
        slot.appendChild(ecpmScript);
        slot.appendChild(ecpmContainer);
        parent.appendChild(slot);
    }

    function createZone(id, className, label) {
        const el = document.createElement('aside');
        el.id = id;
        el.className = className;
        el.setAttribute('aria-label', label);
        return el;
    }

    function buildAdsLayout() {
        if (document.getElementById('pm-ad-rail-left')) return;

        document.body.classList.add('pm-ads-active');

        /* Lewy skyscraper 160×600 */
        const railLeft = createZone('pm-ad-rail-left', 'pm-ad-rail pm-ad-rail--left', 'Reklama — lewa kolumna');
        loadHpfZone(railLeft, HPF_BY_ZONE.railLeft);
        document.body.appendChild(railLeft);

        /* Prawy skyscraper 160×300 */
        const railRight = createZone('pm-ad-rail-right', 'pm-ad-rail pm-ad-rail--right', 'Reklama — prawa kolumna');
        loadHpfZone(railRight, HPF_BY_ZONE.railRight);
        document.body.appendChild(railRight);

        /* Leaderboard 728×90 — pod nagłówkiem */
        const header = document.querySelector('.site-header');
        if (header && header.parentNode) {
            const leaderboard = createZone('pm-ad-leaderboard', 'pm-ad-leaderboard', 'Reklama');
            loadHpfZone(leaderboard, HPF_BY_ZONE.leaderboard);
            header.insertAdjacentElement('afterend', leaderboard);
        }

        /* Pasek 320×50 — mobile, pod nagłówkiem */
        const mobileBar = createZone('pm-ad-mobile-bar', 'pm-ad-mobile-bar', 'Reklama');
        loadHpfZone(mobileBar, HPF_BY_ZONE.mobileBar);
        if (header && header.parentNode) {
            header.insertAdjacentElement('afterend', mobileBar);
        } else {
            document.body.prepend(mobileBar);
        }

        /* Stopka: 468×60 + 300×250 + ECPM invoke */
        const footer = document.querySelector('.site-footer');
        if (footer && footer.parentNode) {
            const strip = createZone('pm-ad-footer-strip', 'pm-ad-footer-strip', 'Reklama');
            const inner = document.createElement('div');
            inner.className = 'pm-ad-footer-strip__inner';
            loadHpfZone(inner, HPF_BY_ZONE.footer);
            loadEcpmInvoke(inner);
            strip.appendChild(inner);
            footer.parentNode.insertBefore(strip, footer);
        }

        /* Usuń stary blok (jeśli był z poprzedniej wersji) */
        document.getElementById('pm-partner-ads')?.remove();
    }

    function loadPartnerAds() {
        if (loaded || !hasConsent()) return;
        loaded = true;

        ECPM_GLOBAL_SCRIPTS.forEach((src) => injectScript(src));
        buildAdsLayout();
    }

    window.pmLoadPartnerAds = loadPartnerAds;

    if (hasConsent()) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', loadPartnerAds);
        } else {
            loadPartnerAds();
        }
    }
})();
