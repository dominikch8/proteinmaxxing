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
