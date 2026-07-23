/**
 * Płynne otwieranie / zamykanie kafelków .home-info-tile (details).
 */
(function () {
    document.documentElement.classList.add('js-info-tiles');

    const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
    const DURATION = 420;

    function clearInline(panel) {
        panel.style.height = '';
        panel.style.opacity = '';
        panel.style.paddingTop = '';
        panel.style.paddingBottom = '';
        panel.style.overflow = '';
    }

    function measureExpandedHeight(panel) {
        const prev = {
            height: panel.style.height,
            opacity: panel.style.opacity,
            paddingTop: panel.style.paddingTop,
            paddingBottom: panel.style.paddingBottom,
            overflow: panel.style.overflow
        };
        panel.style.height = 'auto';
        panel.style.opacity = '1';
        panel.style.paddingTop = '16px';
        panel.style.paddingBottom = '18px';
        panel.style.overflow = 'hidden';
        const h = panel.scrollHeight;
        panel.style.height = prev.height;
        panel.style.opacity = prev.opacity;
        panel.style.paddingTop = prev.paddingTop;
        panel.style.paddingBottom = prev.paddingBottom;
        panel.style.overflow = prev.overflow;
        return h;
    }

    function animateOpen(details, panel) {
        details.classList.add('is-animating-open');
        details.classList.remove('is-open-animated');
        details.open = true;

        const target = measureExpandedHeight(panel);
        panel.style.overflow = 'hidden';
        panel.style.height = '0px';
        panel.style.opacity = '0';
        panel.style.paddingTop = '0px';
        panel.style.paddingBottom = '0px';

        const anim = panel.animate(
            [
                {
                    height: '0px',
                    opacity: 0,
                    paddingTop: '0px',
                    paddingBottom: '0px'
                },
                {
                    height: target + 'px',
                    opacity: 1,
                    paddingTop: '16px',
                    paddingBottom: '18px'
                }
            ],
            { duration: DURATION, easing: EASE, fill: 'forwards' }
        );

        anim.onfinish = () => {
            clearInline(panel);
            panel.classList.add('is-expanded');
            details.classList.remove('is-animating-open');
            details.classList.add('is-open-animated');
            anim.cancel();
        };
    }

    function animateClose(details, panel) {
        details.classList.remove('is-open-animated');
        const start = panel.scrollHeight || measureExpandedHeight(panel);
        panel.classList.remove('is-expanded');
        panel.style.overflow = 'hidden';
        panel.style.height = start + 'px';
        panel.style.opacity = '1';
        panel.style.paddingTop = '16px';
        panel.style.paddingBottom = '18px';

        const anim = panel.animate(
            [
                {
                    height: start + 'px',
                    opacity: 1,
                    paddingTop: '16px',
                    paddingBottom: '18px'
                },
                {
                    height: '0px',
                    opacity: 0,
                    paddingTop: '0px',
                    paddingBottom: '0px'
                }
            ],
            { duration: Math.max(280, DURATION - 60), easing: EASE, fill: 'forwards' }
        );

        anim.onfinish = () => {
            details.open = false;
            clearInline(panel);
            panel.classList.remove('is-expanded');
            anim.cancel();
        };
    }

    function enhance(details) {
        if (details.dataset.infoAnim === '1') return;
        details.dataset.infoAnim = '1';

        const summary = details.querySelector(':scope > summary.home-info-tile-bar');
        const panel = details.querySelector(':scope > .home-info-tile-panel');
        if (!summary || !panel) return;

        if (details.open) {
            panel.classList.add('is-expanded');
            details.classList.add('is-open-animated');
        }

        if (REDUCE) {
            return;
        }

        summary.addEventListener('click', (e) => {
            e.preventDefault();
            if (details.dataset.busy === '1') return;
            details.dataset.busy = '1';

            const done = () => {
                details.dataset.busy = '0';
            };

            if (details.open) {
                animateClose(details, panel);
                setTimeout(done, DURATION + 40);
            } else {
                // Zamknij inne kafelki w tej samej grupie (czytelniejszy layout)
                const group = details.closest('.home-info-tiles');
                if (group) {
                    group.querySelectorAll('details.home-info-tile[open]').forEach((other) => {
                        if (other === details) return;
                        const otherPanel = other.querySelector(':scope > .home-info-tile-panel');
                        if (otherPanel) animateClose(other, otherPanel);
                    });
                }
                animateOpen(details, panel);
                setTimeout(done, DURATION + 40);
            }
        });
    }

    function init() {
        document.querySelectorAll('details.home-info-tile').forEach(enhance);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
