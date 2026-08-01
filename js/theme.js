(function () {
    const STORAGE_KEY = 'pm-theme';

    function getStoredTheme() {
        try {
            return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
        } catch (e) {
            return 'light';
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

    function ensureHeaderUtilities() {
        let cluster = document.getElementById('pm-header-utilities');
        if (!cluster) {
            cluster = document.createElement('div');
            cluster.id = 'pm-header-utilities';
            cluster.className = 'header-utilities';
            document.body.appendChild(cluster);
        }
        return cluster;
    }

    function takeAddProductLink(cluster) {
        let link = cluster.querySelector('a.nav-add-floating');
        const item = document.querySelector('.nav-add-product');
        const navLink = item?.querySelector('a');

        if (navLink) {
            const href = navLink.getAttribute('href') || pathPrefix() + 'dodaj-produkt';
            const isActive = navLink.classList.contains('active') || /dodaj-produkt/.test(window.location.pathname || '');
            if (!link) {
                link = document.createElement('a');
                link.className = 'nav-add-floating';
                link.textContent = 'Dodaj produkty';
                cluster.insertBefore(link, cluster.firstChild);
            }
            link.href = href;
            link.classList.toggle('active', isActive);
            item.remove();
            return link;
        }

        if (!link) {
            link = document.createElement('a');
            link.className = 'nav-add-floating';
            link.href = pathPrefix() + 'dodaj-produkt';
            link.textContent = 'Dodaj produkty';
            if (/dodaj-produkt/.test(window.location.pathname || '')) {
                link.classList.add('active');
            }
            cluster.insertBefore(link, cluster.firstChild);
        }
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
            cluster.appendChild(wrap);
        } else if (!cluster.contains(wrap)) {
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
        const cluster = ensureHeaderUtilities();
        takeAddProductLink(cluster);
        ensureThemeSwitch(cluster);
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

    function initUi() {
        mountThemeSwitch();
        mountMobileNav();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initUi);
    } else {
        initUi();
    }
})();
