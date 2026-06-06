(function () {
    const STORAGE_KEY = 'pm_cookie_consent';
    let loaded = false;
    const hpfQueue = [];
    let hpfBusy = false;

    const ECPM_GLOBAL_SCRIPTS = [
        'https://pl29651366.effectivecpmnetwork.com/c0/1c/eb/c01ceb5b0b612559acfbc1d6526ef8bb.js',
        'https://pl29651368.effectivecpmnetwork.com/e2/a9/78/e2a97881d4d9e461601c63766013a906.js',
        'https://www.effectivecpmnetwork.com/wbspeedw?key=656c16baec0e7ef92f42b76bb9bb1cdb'
    ];

    const HPF = {
        sky600: { key: '80251502c79aab83754f86505251e1c9', width: 160, height: 600, className: '160x600' },
        sky300: { key: '8dd5a04bd51b190b2cdaf588219cbcea', width: 160, height: 300, className: '160x300' },
        leaderboard: { key: '771a5950ad069c158ee79ef6a5943958', width: 728, height: 90, className: '728x90' },
        mobileBar: { key: 'a87d0b3fe2ab743d8626ade2069d3128', width: 320, height: 50, className: '320x50' },
        banner468: { key: 'ba53866ada7a0867cc0d44a70cd71eb9', width: 468, height: 60, className: '468x60' },
        rect300: { key: '0f3d22d42185c00bdff61f40130d8357', width: 300, height: 250, className: '300x250' }
    };

    const RAIL_TOP = 92;
    const RAIL_GAP = 12;

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
        if (attrs) Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v));
        document.body.appendChild(s);
    }

    function queueHpfAd(parent, ad) {
        if (!parent) return;
        hpfQueue.push({ parent, ad });
        drainHpfQueue();
    }

    function drainHpfQueue() {
        if (hpfBusy || !hpfQueue.length) return;
        hpfBusy = true;
        const { parent, ad } = hpfQueue.shift();

        const slot = document.createElement('div');
        slot.className = `pm-ad-slot pm-ad-slot--${ad.className}`;

        window.atOptions = {
            key: ad.key,
            format: 'iframe',
            height: ad.height,
            width: ad.width,
            params: {}
        };

        const inv = document.createElement('script');
        inv.src = `https://www.highperformanceformat.com/${ad.key}/invoke.js`;
        inv.async = true;

        const done = () => {
            hpfBusy = false;
            setTimeout(drainHpfQueue, 80);
        };
        inv.onload = done;
        inv.onerror = done;

        slot.appendChild(inv);
        parent.appendChild(slot);
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

    /** Ile skyscraperów zmieści się w wysokości okna (160×600 i 160×300). */
    function buildRailStack() {
        const available = window.innerHeight - RAIL_TOP - 20;
        const stack = [];
        let used = 0;

        if (available >= HPF.sky600.height) {
            stack.push(HPF.sky600);
            used += HPF.sky600.height + RAIL_GAP;
        }

        while (used + HPF.sky300.height <= available) {
            stack.push(HPF.sky300);
            used += HPF.sky300.height + RAIL_GAP;
        }

        if (stack.length === 0 && available >= HPF.sky300.height) {
            stack.push(HPF.sky300);
        }

        if (used + HPF.sky600.height <= available) {
            stack.push(HPF.sky600);
            used += HPF.sky600.height + RAIL_GAP;
            while (used + HPF.sky300.height <= available) {
                stack.push(HPF.sky300);
                used += HPF.sky300.height + RAIL_GAP;
            }
        }

        return stack.length ? stack : [HPF.sky600, HPF.sky300];
    }

    function fillRail(rail, stack) {
        stack.forEach((ad) => queueHpfAd(rail, ad));
    }

    function mountRailColumn(id, className, stack) {
        let rail = document.getElementById(id);
        if (!rail) {
            rail = createZone(id, className, 'Reklama — kolumna boczna');
            document.body.appendChild(rail);
            fillRail(rail, stack);
        }
        return rail;
    }

    function mountSideRails() {
        const stack = buildRailStack();
        document.body.dataset.pmRailStack = String(stack.length);

        mountRailColumn('pm-ad-rail-left', 'pm-ad-rail pm-ad-rail--left pm-ad-rail--col1', stack);
        mountRailColumn('pm-ad-rail-right', 'pm-ad-rail pm-ad-rail--right pm-ad-rail--col1', stack);
        mountRailColumn(
            'pm-ad-rail-left-2',
            'pm-ad-rail pm-ad-rail--left pm-ad-rail--col2',
            stack
        );
        mountRailColumn(
            'pm-ad-rail-right-2',
            'pm-ad-rail pm-ad-rail--right pm-ad-rail--col2',
            stack
        );
    }

    function removeInContentAds() {
        document.getElementById('pm-ad-mid-hero')?.remove();
        document.getElementById('pm-ad-mid-banner')?.remove();
    }

    function mountMobileBottomBar() {
        if (document.getElementById('pm-ad-mobile-bar-bottom')) return;

        const bar = createZone(
            'pm-ad-mobile-bar-bottom',
            'pm-ad-mobile-bar pm-ad-mobile-bar--bottom',
            'Reklama'
        );
        queueHpfAd(bar, HPF.mobileBar);
        document.body.appendChild(bar);
        document.body.classList.add('pm-ads-mobile-bottom');
    }

    function mountFooterStrip() {
        if (document.getElementById('pm-ad-footer-strip')) return;

        const footer = document.querySelector('.site-footer');
        if (!footer || !footer.parentNode) return;

        const strip = createZone('pm-ad-footer-strip', 'pm-ad-footer-strip', 'Reklama');
        const inner = document.createElement('div');
        inner.className = 'pm-ad-footer-strip__inner';
        strip.appendChild(inner);

        const rowEcpm = document.createElement('div');
        rowEcpm.className = 'pm-ad-footer-strip__row pm-ad-footer-strip__row--ecpm';
        inner.appendChild(rowEcpm);
        loadEcpmInvoke(rowEcpm);

        const rowHpf = document.createElement('div');
        rowHpf.className = 'pm-ad-footer-strip__row pm-ad-footer-strip__row--hpf';
        inner.appendChild(rowHpf);

        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        const footerAds = isMobile
            ? [HPF.rect300, HPF.banner468, HPF.rect300, HPF.mobileBar]
            : [HPF.leaderboard, HPF.rect300, HPF.rect300, HPF.banner468, HPF.banner468, HPF.leaderboard];

        footerAds.forEach((ad) => queueHpfAd(rowHpf, ad));

        footer.parentNode.insertBefore(strip, footer);
    }

    function unwrapLegacyGrid() {
        const grid = document.getElementById('pm-site-ads-grid');
        if (!grid || !grid.parentNode) return;

        const main = grid.querySelector('.pm-site-ads-main');
        const parent = grid.parentNode;
        const ref = grid;

        if (main) {
            while (main.firstChild) {
                parent.insertBefore(main.firstChild, ref);
            }
        }

        grid.remove();
    }

    function buildAdsLayout() {
        if (document.body.classList.contains('pm-ads-active')) return;

        document.body.classList.add('pm-ads-active');
        document.getElementById('pm-partner-ads')?.remove();
        unwrapLegacyGrid();
        removeInContentAds();

        const header = document.querySelector('.site-header');

        if (!document.getElementById('pm-ad-mobile-bar')) {
            const mobileBar = createZone('pm-ad-mobile-bar', 'pm-ad-mobile-bar', 'Reklama');
            queueHpfAd(mobileBar, HPF.mobileBar);
            if (header) {
                header.insertAdjacentElement('afterend', mobileBar);
            } else {
                document.body.prepend(mobileBar);
            }
        }

        if (!document.getElementById('pm-ad-leaderboard')) {
            const leaderboard = createZone('pm-ad-leaderboard', 'pm-ad-leaderboard', 'Reklama');
            queueHpfAd(leaderboard, HPF.leaderboard);
            if (header) {
                header.insertAdjacentElement('afterend', leaderboard);
            }
        }

        mountSideRails();
        mountMobileBottomBar();
        mountFooterStrip();
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
