(function () {
    const STORAGE_KEY = 'pm_cookie_consent';
    let loaded = false;

    const ECPM_GLOBAL_SCRIPTS = [
        'https://pl29651366.effectivecpmnetwork.com/c0/1c/eb/c01ceb5b0b612559acfbc1d6526ef8bb.js',
        'https://pl29651368.effectivecpmnetwork.com/e2/a9/78/e2a97881d4d9e461601c63766013a906.js',
        'https://www.effectivecpmnetwork.com/wbspeedw?key=656c16baec0e7ef92f42b76bb9bb1cdb'
    ];

    const HPF_ADS = [
        { key: '771a5950ad069c158ee79ef6a5943958', width: 728, height: 90, className: '728x90' },
        { key: 'ba53866ada7a0867cc0d44a70cd71eb9', width: 468, height: 60, className: '468x60' },
        { key: 'a87d0b3fe2ab743d8626ade2069d3128', width: 320, height: 50, className: '320x50' },
        { key: '0f3d22d42185c00bdff61f40130d8357', width: 300, height: 250, className: '300x250' },
        { key: '8dd5a04bd51b190b2cdaf588219cbcea', width: 160, height: 300, className: '160x300' },
        { key: '80251502c79aab83754f86505251e1c9', width: 160, height: 600, className: '160x600' }
    ];

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

    function buildAdsBlock() {
        if (document.getElementById('pm-partner-ads')) return;

        const footer = document.querySelector('.site-footer');
        if (!footer || !footer.parentNode) return;

        const aside = document.createElement('aside');
        aside.id = 'pm-partner-ads';
        aside.className = 'pm-partner-ads';
        aside.setAttribute('aria-label', 'Reklama');

        const inner = document.createElement('div');
        inner.className = 'pm-partner-ads__inner';

        const ecpmSlot = document.createElement('div');
        ecpmSlot.className = 'pm-ad-slot pm-ad-slot--ecpm-invoke';
        const ecpmScript = document.createElement('script');
        ecpmScript.async = true;
        ecpmScript.setAttribute('data-cfasync', 'false');
        ecpmScript.src =
            'https://pl29651369.effectivecpmnetwork.com/658eec4fdcf15651f91c6d8adbe4f016/invoke.js';
        const ecpmContainer = document.createElement('div');
        ecpmContainer.id = 'container-658eec4fdcf15651f91c6d8adbe4f016';
        ecpmSlot.appendChild(ecpmScript);
        ecpmSlot.appendChild(ecpmContainer);
        inner.appendChild(ecpmSlot);

        HPF_ADS.forEach((ad) => loadHpfAd(inner, ad));

        aside.appendChild(inner);
        footer.parentNode.insertBefore(aside, footer);
    }

    function loadPartnerAds() {
        if (loaded || !hasConsent()) return;
        loaded = true;

        ECPM_GLOBAL_SCRIPTS.forEach((src) => injectScript(src));
        buildAdsBlock();
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
