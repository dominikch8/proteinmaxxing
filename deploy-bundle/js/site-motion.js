/**
 * Proteiner — site-wide motion + scroll polish
 */
(function () {
    const root = document.documentElement;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function markReady() {
        document.body.classList.add('pm-motion-ready');
    }

    function updateScrollState() {
        root.classList.toggle('pm-scrolled', window.scrollY > 8);
    }

    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });

    if (reduce) {
        root.classList.add('pm-motion-reduce');
        markReady();
        return;
    }

    root.classList.add('pm-motion');
    markReady();

    const REVEAL_SELECTOR = [
        '.product-card-link',
        '.macro-card',
        '.bmi-card',
        '.water-card',
        '.poradnik-nutrient-tile',
        '.home-info-tile',
        'a.shop-item',
        '.pm-podium-card',
        '.calc-protein-maxxing-cta',
        '.nutrition-section',
        '.product-page .macro-pill',
        '.compare-kpi-card',
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
            el.classList.add('pm-reveal');
            el.style.setProperty('--pm-stagger', `${Math.min(i % 8, 7) * 40}ms`);
            i += 1;

            const rect = el.getBoundingClientRect();
            if (rect.top < vh * 0.96 && rect.bottom > 0) {
                el.classList.add('pm-revealed');
            } else {
                io.observe(el);
            }
        });
    }

    function boot() {
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

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

    function syncCompareAtmosphere() {
        const layer = document.querySelector('.compare-atmosphere');
        const host = document.querySelector('main.compare-page, main.main-content');
        if (!layer || !host) return;
        const h = Math.max(host.scrollHeight, host.clientHeight, window.innerHeight * 0.6);
        layer.style.height = `${h}px`;
    }

    function mountAtmosphere() {
        if (reduce) return;

        if (document.body.classList.contains('compare-body')) {
            const run = () => syncCompareAtmosphere();
            run();
            window.addEventListener('resize', run, { passive: true });
            [400, 1200, 2500].forEach((ms) => setTimeout(run, ms));
            if (typeof ResizeObserver === 'function') {
                const host = document.querySelector('main.compare-page, main.main-content');
                if (host) new ResizeObserver(run).observe(host);
            }
            return;
        }

        if (document.querySelector('.pm-atmosphere')) return;

        const layer = document.createElement('div');
        layer.className = 'pm-atmosphere';
        layer.setAttribute('aria-hidden', 'true');
        layer.innerHTML = `
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
        `;
        document.body.prepend(layer);
        document.body.classList.add('pm-atmosphere-host');

        const syncHeight = () => {
            const h = Math.max(
                document.documentElement.scrollHeight,
                document.body.scrollHeight,
                window.innerHeight
            );
            layer.style.height = `${h}px`;
        };

        syncHeight();
        window.addEventListener('resize', syncHeight, { passive: true });
        window.addEventListener('load', syncHeight, { passive: true });

        if (typeof ResizeObserver === 'function') {
            const ro = new ResizeObserver(syncHeight);
            ro.observe(document.documentElement);
            ro.observe(document.body);
            const main = document.querySelector('main');
            if (main) ro.observe(main);
        }

        // Late content (product grids, tabs, images)
        [400, 1200, 2500].forEach((ms) => setTimeout(syncHeight, ms));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', mountAtmosphere);
    } else {
        mountAtmosphere();
    }

    // Safety: never leave content stuck invisible
    setTimeout(() => {
        document.querySelectorAll('.page-hero, .main-content, .pm-reveal').forEach((el) => {
            if (getComputedStyle(el).opacity === '0') {
                el.classList.add('pm-revealed');
                el.style.opacity = '1';
                el.style.transform = 'none';
            }
        });
    }, 1400);
})();
