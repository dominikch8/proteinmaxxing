(function () {
    const STORAGE_KEY = 'pm-theme';
    const MIGRATED_KEY = 'pm-theme-neon-default';

    function getStoredTheme() {
        try {
            if (!localStorage.getItem(MIGRATED_KEY)) {
                localStorage.setItem(MIGRATED_KEY, '1');
                localStorage.removeItem(STORAGE_KEY);
            }
            return localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark';
        } catch (e) {
            return 'dark';
        }
    }

    function applyTheme(theme) {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.setAttribute('data-theme', 'dark');
        } else {
            root.removeAttribute('data-theme');
        }
        document.querySelectorAll('.theme-switch-btn').forEach((btn) => {
            const isDark = btn.dataset.themeValue === 'dark';
            const active = (theme === 'dark' && isDark) || (theme === 'light' && !isDark);
            btn.classList.toggle('is-active', active);
            btn.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
    }

    function pathPrefix() {
        const path = window.location.pathname || '';
        if (path.includes('/produkty/kategoria/')) return '../../';
        if (path.includes('/produkty/')) return '../';
        return '';
    }

    function ensureThemeCluster() {
        let cluster = document.getElementById('pm-header-theme');
        if (!cluster) {
            cluster = document.createElement('div');
            cluster.id = 'pm-header-theme';
            cluster.className = 'header-utilities header-utilities--theme';
            document.body.appendChild(cluster);
        }
        return cluster;
    }

    function ensureActionsCluster() {
        let cluster = document.getElementById('pm-header-utilities');
        if (!cluster) {
            cluster = document.createElement('div');
            cluster.id = 'pm-header-utilities';
            cluster.className = 'header-utilities header-utilities--actions';
            document.body.appendChild(cluster);
        } else {
            cluster.classList.add('header-utilities--actions');
        }
        return cluster;
    }

    function takeAddProductLink(cluster) {
        let link =
            document.getElementById('addProductFloating') ||
            cluster.querySelector('a.nav-add-floating:not(.auth-nav-floating)');
        const item = document.querySelector('.nav-add-product');
        const navLink = item?.querySelector('a');
        const isActive = /dodaj-produkt/.test(window.location.pathname || '');
        const href = (navLink && navLink.getAttribute('href')) || pathPrefix() + 'dodaj-produkt';

        if (!link) {
            link = document.createElement('a');
            link.id = 'addProductFloating';
        }
        link.id = 'addProductFloating';
        link.className = 'nav-add-floating';
        link.href = href;
        link.textContent = 'Dodaj produkt';
        link.classList.toggle('active', isActive || !!(navLink && navLink.classList.contains('active')));

        const auth = cluster.querySelector('a.auth-nav-floating');
        if (auth) cluster.insertBefore(link, auth);
        else cluster.appendChild(link);

        if (item) item.remove();
        return link;
    }

    function takeAuthLink(cluster) {
        let link = document.getElementById('authNavFloating') || cluster.querySelector('a.auth-nav-floating');
        const item = document.getElementById('authNavSlot') || document.querySelector('.nav-links > .auth-nav-item');
        const navLink = item?.querySelector('a');
        const path = window.location.pathname || '';
        const isActive = /logowanie|konto|admin-zgloszenia/.test(path);
        const href = (navLink && navLink.getAttribute('href')) || pathPrefix() + 'logowanie';
        const label =
            (link && link.dataset.authManaged && link.textContent) ||
            ((navLink && navLink.textContent) || 'Zaloguj').trim() ||
            'Zaloguj';

        if (!link) {
            link = document.createElement('a');
        }
        link.id = 'authNavFloating';
        link.className = 'nav-add-floating auth-nav-floating';
        link.href = href;
        if (!link.dataset.authManaged) link.textContent = label;
        link.classList.toggle('active', isActive || !!(navLink && navLink.classList.contains('active')));
        cluster.appendChild(link);

        if (item) item.remove();
        return link;
    }

    function ensureThemeSwitch(cluster) {
        let wrap = document.getElementById('pm-theme-switch');
        if (!wrap) {
            wrap = document.createElement('div');
            wrap.id = 'pm-theme-switch';
            wrap.className = 'theme-switch';
            wrap.setAttribute('role', 'group');
            wrap.setAttribute('aria-label', 'Motyw strony');
            wrap.innerHTML = `
                <button type="button" class="theme-switch-btn" data-theme-value="light" aria-pressed="false" title="Jasny motyw">
                    <span aria-hidden="true">☀️</span><span class="theme-switch-text">Jasny</span>
                </button>
                <button type="button" class="theme-switch-btn" data-theme-value="dark" aria-pressed="false" title="Ciemny motyw neon">
                    <span aria-hidden="true">🌙</span><span class="theme-switch-text">Neon</span>
                </button>
            `;
        }
        if (!cluster.contains(wrap)) {
            cluster.appendChild(wrap);
        }

        if (wrap.dataset.pmThemeBound === '1') return wrap;
        wrap.dataset.pmThemeBound = '1';

        wrap.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-theme-value]');
            if (!btn) return;
            const next = btn.dataset.themeValue === 'dark' ? 'dark' : 'light';
            try {
                localStorage.setItem(STORAGE_KEY, next);
            } catch (err) {
                /* ignore */
            }
            applyTheme(next);
        });

        return wrap;
    }

    function mountThemeSwitch() {
        const themeCluster = ensureThemeCluster();
        const actions = ensureActionsCluster();
        ensureThemeSwitch(themeCluster);
        takeAddProductLink(actions);
        takeAuthLink(actions);
        applyTheme(getStoredTheme());
    }

    function mountMobileNav() {
        const nav = document.querySelector('.site-header nav');
        const links = nav?.querySelector('.nav-links');
        if (!nav || !links) return;

        let btn = nav.querySelector('.nav-toggle');
        if (!btn) {
            btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'nav-toggle';
            btn.setAttribute('aria-label', 'Otwórz menu');
            btn.setAttribute('aria-expanded', 'false');
            btn.setAttribute('aria-controls', 'site-nav-links');
            btn.innerHTML =
                '<span class="nav-toggle-bar" aria-hidden="true"></span><span class="nav-toggle-bar" aria-hidden="true"></span><span class="nav-toggle-bar" aria-hidden="true"></span>';
            nav.insertBefore(btn, links);
        }

        if (!links.id) links.id = 'site-nav-links';
        btn.setAttribute('aria-controls', links.id);

        if (btn.dataset.pmNavBound === '1') return;
        btn.dataset.pmNavBound = '1';

        let backdrop = document.querySelector('.nav-backdrop');
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.className = 'nav-backdrop';
            backdrop.hidden = true;
            document.body.appendChild(backdrop);
        }

        const close = () => {
            nav.classList.remove('nav-open');
            btn.setAttribute('aria-expanded', 'false');
            btn.setAttribute('aria-label', 'Otwórz menu');
            backdrop.hidden = true;
            document.body.classList.remove('nav-menu-open');
        };

        const open = () => {
            nav.classList.add('nav-open');
            btn.setAttribute('aria-expanded', 'true');
            btn.setAttribute('aria-label', 'Zamknij menu');
            backdrop.hidden = false;
            document.body.classList.add('nav-menu-open');
        };

        btn.addEventListener('click', () => {
            if (nav.classList.contains('nav-open')) close();
            else open();
        });

        backdrop.addEventListener('click', close);
        links.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') close();
        });
    }

    function optionLabel(opt) {
        return ((opt && opt.textContent) || '').trim();
    }

    function enhanceSelect(select) {
        if (!select || select.dataset.pmEnhanced === '1') return;
        if (select.multiple || Number(select.getAttribute('size') || 0) > 1) return;
        select.dataset.pmEnhanced = '1';

        const wrap = document.createElement('div');
        wrap.className = 'pm-select';
        select.parentNode.insertBefore(wrap, select);
        wrap.appendChild(select);

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'pm-select-btn';
        btn.setAttribute('aria-haspopup', 'listbox');
        btn.setAttribute('aria-expanded', 'false');
        const aria = select.getAttribute('aria-label');
        if (aria) btn.setAttribute('aria-label', aria);

        const panel = document.createElement('div');
        panel.className = 'pm-select-panel';
        panel.setAttribute('role', 'listbox');
        panel.hidden = true;
        wrap.appendChild(btn);
        document.body.appendChild(panel);

        function currentLabel() {
            return optionLabel(select.selectedOptions[0] || select.options[0]);
        }

        function syncPanel() {
            panel.innerHTML = '';
            [...select.options].forEach((opt, i) => {
                const item = document.createElement('button');
                item.type = 'button';
                item.className = 'pm-select-option' + (opt.selected ? ' is-selected' : '');
                item.setAttribute('role', 'option');
                item.setAttribute('aria-selected', opt.selected ? 'true' : 'false');
                item.textContent = optionLabel(opt);
                item.addEventListener('click', () => {
                    select.selectedIndex = i;
                    select.dispatchEvent(new Event('change', { bubbles: true }));
                    btn.textContent = optionLabel(opt);
                    closePanel();
                });
                panel.appendChild(item);
            });
            btn.textContent = currentLabel();
        }

        function placePanel() {
            const r = wrap.getBoundingClientRect();
            panel.style.position = 'fixed';
            panel.style.left = Math.max(8, r.left) + 'px';
            panel.style.width = Math.max(r.width, 200) + 'px';
            panel.style.zIndex = '500';
            const spaceBelow = window.innerHeight - r.bottom;
            if (spaceBelow < 240 && r.top > spaceBelow) {
                panel.style.top = 'auto';
                panel.style.bottom = window.innerHeight - r.top + 6 + 'px';
            } else {
                panel.style.bottom = 'auto';
                panel.style.top = r.bottom + 6 + 'px';
            }
        }

        function closePanel() {
            panel.hidden = true;
            btn.setAttribute('aria-expanded', 'false');
            wrap.classList.remove('is-open');
        }

        function openPanel() {
            syncPanel();
            panel.hidden = false;
            btn.setAttribute('aria-expanded', 'true');
            wrap.classList.add('is-open');
            placePanel();
            const selected = panel.querySelector('.is-selected');
            if (selected) selected.scrollIntoView({ block: 'nearest' });
        }

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (panel.hidden) openPanel();
            else closePanel();
        });

        document.addEventListener('click', (e) => {
            if (!wrap.contains(e.target) && !panel.contains(e.target)) closePanel();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closePanel();
        });
        window.addEventListener(
            'resize',
            () => {
                if (!panel.hidden) placePanel();
            },
            { passive: true }
        );
        window.addEventListener(
            'scroll',
            () => {
                if (!panel.hidden) closePanel();
            },
            true
        );

        select.addEventListener('change', () => {
            btn.textContent = currentLabel();
        });
        new MutationObserver(() => {
            btn.textContent = currentLabel();
            if (!panel.hidden) syncPanel();
        }).observe(select, { childList: true, subtree: true });

        btn.textContent = currentLabel();
    }

    function enhanceAllSelects() {
        document.querySelectorAll('select').forEach(enhanceSelect);
    }

    function initUi() {
        mountThemeSwitch();
        mountMobileNav();
        enhanceAllSelects();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initUi);
    } else {
        initUi();
    }
})();
