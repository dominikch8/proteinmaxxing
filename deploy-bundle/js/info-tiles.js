/**
 * Płynne otwieranie kafelków .home-info-tile.
 * Panel treści trafia pod rząd kafelków i zajmuje całą szerokość.
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

    function ensureOutlet(group) {
        let outlet = group.querySelector(':scope > .home-info-tiles-outlet');
        if (!outlet) {
            outlet = document.createElement('div');
            outlet.className = 'home-info-tiles-outlet';
            outlet.hidden = true;
            group.appendChild(outlet);
        }
        return outlet;
    }

    function getPanelFor(details) {
        const group = details.closest('.home-info-tiles');
        const local = details.querySelector(':scope > .home-info-tile-panel');
        if (local) return local;
        if (!group) return null;
        const outlet = group.querySelector(':scope > .home-info-tiles-outlet');
        if (!outlet || outlet.dataset.activeTile !== details.id) return null;
        return outlet.querySelector(':scope > .home-info-tile-panel');
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

    function placePanelInOutlet(details, panel) {
        const group = details.closest('.home-info-tiles');
        if (!group) return null;
        const outlet = ensureOutlet(group);
        outlet.hidden = false;
        outlet.dataset.activeTile = details.id || '';
        outlet.classList.toggle('is-warning', details.classList.contains('home-info-tile--warning'));
        if (panel.parentElement !== outlet) {
            outlet.appendChild(panel);
        }
        return outlet;
    }

    function returnPanelToDetails(details, panel) {
        const group = details.closest('.home-info-tiles');
        const outlet = group && group.querySelector(':scope > .home-info-tiles-outlet');
        if (panel.parentElement !== details) {
            details.appendChild(panel);
        }
        if (outlet && outlet.dataset.activeTile === (details.id || '')) {
            outlet.hidden = true;
            outlet.classList.remove('is-warning');
            delete outlet.dataset.activeTile;
        }
    }

    function animateOpen(details, panel) {
        details.classList.add('is-animating-open');
        details.classList.remove('is-open-animated');
        panel.classList.remove('is-expanded', 'is-content-entering');
        details.open = true;
        placePanelInOutlet(details, panel);

        const target = measureExpandedHeight(panel);
        panel.style.overflow = 'hidden';
        panel.style.height = '0px';
        panel.style.opacity = '1';
        panel.style.paddingTop = '0px';
        panel.style.paddingBottom = '0px';

        // Treść wchodzi w trakcie rozwijania, nie dopiero po końcu
        requestAnimationFrame(() => {
            panel.classList.add('is-content-entering');
        });

        const anim = panel.animate(
            [
                { height: '0px', paddingTop: '0px', paddingBottom: '0px' },
                { height: target + 'px', paddingTop: '16px', paddingBottom: '18px' }
            ],
            { duration: DURATION, easing: EASE, fill: 'forwards' }
        );

        anim.onfinish = () => {
            clearInline(panel);
            panel.classList.add('is-expanded');
            panel.classList.remove('is-content-entering');
            details.classList.remove('is-animating-open');
            details.classList.add('is-open-animated');
            anim.cancel();
        };
    }

    function animateClose(details, panel) {
        details.classList.remove('is-open-animated');
        const start = panel.scrollHeight || measureExpandedHeight(panel);
        panel.classList.remove('is-expanded', 'is-content-entering');
        panel.style.overflow = 'hidden';
        panel.style.height = start + 'px';
        panel.style.opacity = '1';
        panel.style.paddingTop = '16px';
        panel.style.paddingBottom = '18px';

        const anim = panel.animate(
            [
                { height: start + 'px', opacity: 1, paddingTop: '16px', paddingBottom: '18px' },
                { height: '0px', opacity: 0, paddingTop: '0px', paddingBottom: '0px' }
            ],
            { duration: Math.max(280, DURATION - 60), easing: EASE, fill: 'forwards' }
        );

        anim.onfinish = () => {
            clearInline(panel);
            panel.classList.remove('is-expanded', 'is-content-entering');
            returnPanelToDetails(details, panel);
            details.open = false;
            anim.cancel();
        };
    }

    function openInstant(details, panel) {
        details.open = true;
        placePanelInOutlet(details, panel);
        panel.classList.add('is-expanded');
        details.classList.add('is-open-animated');
    }

    function closeInstant(details, panel) {
        panel.classList.remove('is-expanded');
        details.classList.remove('is-open-animated');
        returnPanelToDetails(details, panel);
        details.open = false;
    }

    function closeOthers(group, current) {
        group.querySelectorAll('details.home-info-tile[open]').forEach((other) => {
            if (other === current) return;
            const otherPanel = getPanelFor(other);
            if (!otherPanel) {
                other.open = false;
                return;
            }
            if (REDUCE) closeInstant(other, otherPanel);
            else animateClose(other, otherPanel);
        });
    }

    function enhance(details) {
        if (details.dataset.infoAnim === '1') return;
        details.dataset.infoAnim = '1';
        if (!details.id) {
            details.id = 'info-tile-' + Math.random().toString(36).slice(2, 9);
        }

        const summary = details.querySelector(':scope > summary.home-info-tile-bar');
        let panel = details.querySelector(':scope > .home-info-tile-panel');
        if (!summary || !panel) return;

        if (details.open) {
            openInstant(details, panel);
        }

        summary.addEventListener('click', (e) => {
            e.preventDefault();
            if (details.dataset.busy === '1') return;
            details.dataset.busy = '1';

            panel = getPanelFor(details) || panel;
            const done = () => {
                details.dataset.busy = '0';
            };

            if (details.open) {
                if (REDUCE) {
                    closeInstant(details, panel);
                    done();
                } else {
                    animateClose(details, panel);
                    setTimeout(done, DURATION + 40);
                }
                return;
            }

            const group = details.closest('.home-info-tiles');
            if (group) closeOthers(group, details);

            // Panel could still be inside details (first open)
            panel = details.querySelector(':scope > .home-info-tile-panel') || panel;

            if (REDUCE) {
                openInstant(details, panel);
                done();
            } else {
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
