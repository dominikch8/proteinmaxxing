/**
 * Proteiner — site-wide motion + scroll polish
 */
(function () {
    const root = document.documentElement;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function markReady() {
        document.body.classList.add('pm-motion-ready');
    }

    function markChromeReady() {
        document.documentElement.classList.add('pm-chrome-ready');
    }

    function updateScrollState() {
        root.classList.toggle('pm-scrolled', window.scrollY > 8);
    }

    function afterFirstPaint(fn) {
        requestAnimationFrame(() => {
            requestAnimationFrame(fn);
        });
    }

    function whenIdle(fn, timeout) {
        if (typeof window.requestIdleCallback === 'function') {
            window.requestIdleCallback(fn, { timeout: timeout || 1200 });
        } else {
            setTimeout(fn, 200);
        }
    }

    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });

    if (reduce) {
        root.classList.add('pm-motion-reduce');
        markReady();
        markChromeReady();
        return;
    }

    root.classList.add('pm-motion');
    afterFirstPaint(() => {
        markChromeReady();
        markReady();
    });

    // Soft enter only for fallback navigations (native VT already animates the swap)
    try {
        if (sessionStorage.getItem('pm-nav-go') === 'fallback') {
            sessionStorage.removeItem('pm-nav-go');
            document.body.classList.add('pm-nav-entered');
            setTimeout(() => document.body.classList.remove('pm-nav-entered'), 520);
        } else {
            sessionStorage.removeItem('pm-nav-go');
        }
    } catch (_) {
        /* ignore */
    }

    function sameDocumentNav(url) {
        return (
            url.origin === window.location.origin &&
            url.pathname === window.location.pathname &&
            url.search === window.location.search
        );
    }

    function supportsCrossDocumentVT() {
        // Chromium MPA view transitions expose pageswap / pagereveal
        return 'onpagereveal' in window || 'onpageswap' in window;
    }

    function setupTopNavTransitions() {
        const header = document.querySelector('.site-header');
        if (!header) return;

        header.addEventListener('click', (e) => {
            const a = e.target.closest('a.nav-link');
            if (!a || !header.contains(a)) return;
            if (e.defaultPrevented || e.button !== 0) return;
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            if (a.target && a.target !== '_self') return;

            let url;
            try {
                url = new URL(a.href, window.location.href);
            } catch (_) {
                return;
            }
            if (url.origin !== window.location.origin) return;
            if (sameDocumentNav(url)) return; // same page / hash

            // Native cross-document VT: let the browser animate
            if (supportsCrossDocumentVT()) return;

            // Fallback: short content fade, then navigate
            e.preventDefault();
            try {
                sessionStorage.setItem('pm-nav-go', 'fallback');
            } catch (_) {
                /* ignore */
            }
            document.body.classList.add('pm-nav-leaving');
            window.setTimeout(() => {
                window.location.href = url.href;
            }, 180);
        });
    }

    setupTopNavTransitions();

    // Keep heavy list cards out of opacity:0 reveals — they jank the sticky header on dieta/rankings
    const REVEAL_SELECTOR = [
        '.macro-card',
        '.bmi-card',
        '.water-card',
        '.poradnik-nutrient-tile',
        '.home-info-tile',
        'a.shop-item',
        '.calc-protein-maxxing-cta',
        '.nutrition-section',
        '.product-page .macro-pill',
        '.compare-glass-panel',
        '.compare-matchup',
        '.compare-table-block',
        '.section-title',
        '.result-box',
        '.add-product-section',
        '.info-callout',
        '.poradnik-product-mini',
        '[data-pm-reveal]'
    ].join(',');

    const io = new IntersectionObserver(
        (entries) => {
            for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                entry.target.classList.add('pm-revealed');
                io.unobserve(entry.target);
            }
        },
        { rootMargin: '0px 0px -6% 0px', threshold: 0.08 }
    );

    function shouldSkip(el) {
        if (!el || el.classList.contains('pm-reveal') || el.classList.contains('pm-revealed')) return true;
        if (el.closest('[hidden]')) return true;
        return false;
    }

    function observeTree(scope) {
        const nodes = scope.querySelectorAll(REVEAL_SELECTOR);
        let i = 0;
        const vh = window.innerHeight || 800;

        nodes.forEach((el) => {
            if (shouldSkip(el)) return;

            // Avoid a one-frame opacity:0 flash: decide visibility before applying hide class
            const rect = el.getBoundingClientRect();
            const inView = rect.top < vh * 0.96 && rect.bottom > 0;

            if (inView) {
                el.classList.add('pm-reveal', 'pm-revealed');
                el.style.setProperty('--pm-stagger', '0ms');
                return;
            }

            el.classList.add('pm-reveal');
            el.style.setProperty('--pm-stagger', `${Math.min(i % 8, 7) * 40}ms`);
            i += 1;
            io.observe(el);
        });
    }

    function bootReveals() {
        observeTree(document);

        const watched = [
            document.getElementById('productsGrid'),
            document.getElementById('compareChart'),
            document.getElementById('compareChartSection')
        ].filter(Boolean);

        watched.forEach((node) => {
            let scheduled = false;
            new MutationObserver(() => {
                if (scheduled) return;
                scheduled = true;
                requestAnimationFrame(() => {
                    scheduled = false;
                    observeTree(node);
                });
            }).observe(node, { childList: true, subtree: true });
        });
    }

    // Defer reveals until after first paint so sticky header stays calm on heavy pages
    afterFirstPaint(() => whenIdle(bootReveals, 800));

    function atmosphereMarkup(extraClass) {
        const cls = extraClass ? `pm-atmosphere ${extraClass}` : 'pm-atmosphere';
        return {
            className: cls,
            html: `
            <span class="pm-atmosphere-blob pm-atmosphere-blob--a"></span>
            <span class="pm-atmosphere-blob pm-atmosphere-blob--b"></span>
            <span class="pm-atmosphere-blob pm-atmosphere-blob--c"></span>
            <span class="pm-atmosphere-blob pm-atmosphere-blob--d"></span>
            <span class="pm-atmosphere-blob pm-atmosphere-blob--e"></span>
            <span class="pm-atmosphere-ring pm-atmosphere-ring--a"></span>
            <span class="pm-atmosphere-ring pm-atmosphere-ring--b"></span>
            <span class="pm-atmosphere-ring pm-atmosphere-ring--c"></span>
            <span class="pm-atmosphere-dot pm-atmosphere-dot--1"></span>
            <span class="pm-atmosphere-dot pm-atmosphere-dot--2"></span>
            <span class="pm-atmosphere-dot pm-atmosphere-dot--3"></span>
            <span class="pm-atmosphere-dot pm-atmosphere-dot--4"></span>
            <span class="pm-atmosphere-dot pm-atmosphere-dot--5"></span>
            <span class="pm-atmosphere-dot pm-atmosphere-dot--6"></span>
            <span class="pm-atmosphere-dot pm-atmosphere-dot--7"></span>
            <span class="pm-atmosphere-dot pm-atmosphere-dot--8"></span>
            <span class="pm-atmosphere-dot pm-atmosphere-dot--9"></span>
            <span class="pm-atmosphere-dot pm-atmosphere-dot--10"></span>
        `
        };
    }

    function mountInnerAtmosphere() {
        if (document.querySelector('.pm-atmosphere--inner')) return;

        const host =
            document.querySelector('main.main-content:not(.compare-page)') ||
            document.querySelector('.product-hero-card') ||
            document.querySelector('main.product-page');
        if (!host) return;

        const spec = atmosphereMarkup('pm-atmosphere--inner');
        const layer = document.createElement('div');
        layer.className = spec.className;
        layer.setAttribute('aria-hidden', 'true');
        layer.innerHTML = spec.html;
        host.prepend(layer);
        host.classList.add('pm-atmosphere-inner-host');

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                layer.classList.add('is-live');
            });
        });
    }

    function syncCompareAtmosphere() {
        const layer = document.querySelector('.compare-atmosphere');
        if (!layer) return;
        layer.style.top = '0';
        layer.style.left = '0';
        layer.style.right = '0';
        layer.style.bottom = '0';
        layer.style.height = 'auto';
        layer.style.width = 'auto';
    }

    function mountAtmosphere() {
        if (reduce) return;

        if (document.body.classList.contains('compare-body')) {
            const run = () => syncCompareAtmosphere();
            run();
            window.addEventListener('resize', run, { passive: true });
            return;
        }

        if (!document.querySelector('.pm-atmosphere:not(.pm-atmosphere--inner)')) {
            const spec = atmosphereMarkup('');
            const layer = document.createElement('div');
            layer.className = spec.className;
            layer.setAttribute('aria-hidden', 'true');
            layer.innerHTML = spec.html;
            document.body.prepend(layer);
            document.body.classList.add('pm-atmosphere-host');
            layer.style.height = '';
            layer.style.bottom = '0';

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    layer.classList.add('is-live');
                });
            });
        }

        mountInnerAtmosphere();
    }

    // Atmosphere (blur blobs) is GPU-heavy — mount after idle so dieta/rankings don't hitch the header
    afterFirstPaint(() => whenIdle(mountAtmosphere, 1500));

    /** Półprzezroczyste kule/obręcze za wyciętym zdjęciem produktu */
    function mountProductImageAuras() {
        const AURA_HTML =
            '<span class="pia-glow"></span>' +
            '<span class="pia-ring pia-ring-1"></span>' +
            '<span class="pia-ring pia-ring-2"></span>' +
            '<span class="pia-ring pia-ring-3"></span>' +
            '<span class="pia-orb pia-orb-1"></span>' +
            '<span class="pia-orb pia-orb-2"></span>' +
            '<span class="pia-orb pia-orb-3"></span>' +
            '<span class="pia-orb pia-orb-4"></span>' +
            '<span class="pia-orb pia-orb-5"></span>' +
            '<span class="pia-orb pia-orb-6"></span>' +
            '<span class="pia-spark pia-spark-1"></span>' +
            '<span class="pia-spark pia-spark-2"></span>' +
            '<span class="pia-spark pia-spark-3"></span>' +
            '<span class="pia-spark pia-spark-4"></span>';

        document.querySelectorAll('.product-image-wrap').forEach((wrap) => {
            if (wrap.querySelector('.product-image-aura')) return;
            const aura = document.createElement('div');
            aura.className = 'product-image-aura';
            aura.setAttribute('aria-hidden', 'true');
            aura.innerHTML = AURA_HTML;
            wrap.insertBefore(aura, wrap.firstChild);
        });
    }

    afterFirstPaint(mountProductImageAuras);

    setTimeout(() => {
        document.querySelectorAll('.page-hero, .main-content, .pm-reveal').forEach((el) => {
            if (getComputedStyle(el).opacity === '0') {
                el.classList.add('pm-revealed');
                el.style.opacity = '1';
                el.style.transform = 'none';
            }
        });
    }, 1600);
})();
