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

    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });

    // Enable header transitions only after first paint (prevents tab-switch flicker)
    requestAnimationFrame(() => {
        requestAnimationFrame(markChromeReady);
    });

    if (reduce) {
        root.classList.add('pm-motion-reduce');
        markReady();
        markChromeReady();
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

            // Height comes from CSS top/bottom — never set scrollHeight (that created footer gap)
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
