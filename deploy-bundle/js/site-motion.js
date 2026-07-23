/**
 * Proteiner — site-wide motion
 * Page entrance + IntersectionObserver reveals for cards/tiles.
 * Skips .compare-page (has its own motion system).
 */
(function () {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const root = document.documentElement;

    if (reduce) {
        root.classList.add('pm-motion-reduce');
        document.body.classList.add('pm-motion-ready');
        return;
    }

    root.classList.add('pm-motion');

    const REVEAL_SELECTOR = [
        '.product-card-link',
        '.products-grid > .product-card',
        '.macro-card',
        '.bmi-card',
        '.water-card',
        '.poradnik-nutrient-tile',
        '.home-info-tile',
        'a.shop-item',
        '.tips-list > li',
        '.pm-podium-card',
        '.calc-protein-maxxing-cta',
        '.shopping-box',
        '.micro-collapse',
        '.nutrition-section',
        '.serving-table-wrap',
        '.related-products .product-card-link',
        '.product-page .macro-pill',
        '.myth-list > li',
        '.category-quick-links > a',
        '.info-section',
        '.auth-card',
        '.add-product-card',
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
        { rootMargin: '0px 0px -6% 0px', threshold: 0.06 }
    );

    function shouldSkip(el) {
        if (!el || el.classList.contains('pm-reveal') || el.classList.contains('pm-revealed')) {
            return true;
        }
        if (el.closest('.compare-page')) return true;
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
            el.style.setProperty('--pm-stagger', `${Math.min(i % 12, 11) * 40}ms`);
            i += 1;

            const rect = el.getBoundingClientRect();
            const inView = rect.top < vh * 0.96 && rect.bottom > -40;
            if (inView) {
                requestAnimationFrame(() => el.classList.add('pm-revealed'));
            } else {
                io.observe(el);
            }
        });
    }

    function boot() {
        requestAnimationFrame(() => {
            document.body.classList.add('pm-motion-ready');
            observeTree(document);

            const grids = document.querySelectorAll('#productsGrid, .products-grid, .related-products, .pm-top10-list, .shopping-grid');
            grids.forEach((grid) => {
                const mo = new MutationObserver(() => {
                    observeTree(grid);
                });
                mo.observe(grid, { childList: true, subtree: false });
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
