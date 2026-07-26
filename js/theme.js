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

    function takeAddProductLink() {
        let link = document.querySelector('a.nav-add-floating');
        if (link) return link;

        const item = document.querySelector('.nav-add-product');
        if (!item) return null;
        link = item.querySelector('a');
        if (!link) {
            item.remove();
            return null;
        }
        link.classList.add('nav-add-floating');
        item.remove();
        return link;
    }

    function mountThemeSwitch() {
        if (document.getElementById('pm-theme-switch')) return;

        let cluster = document.getElementById('pm-header-utilities');
        if (!cluster) {
            cluster = document.createElement('div');
            cluster.id = 'pm-header-utilities';
            cluster.className = 'header-utilities';
            document.body.appendChild(cluster);
        }

        const addLink = takeAddProductLink();
        if (addLink && !cluster.contains(addLink)) {
            cluster.appendChild(addLink);
        }

        const wrap = document.createElement('div');
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

        wrap.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-theme-value]');
            if (!btn) return;
            const theme = btn.dataset.themeValue === 'dark' ? 'dark' : 'light';
            try {
                localStorage.setItem(STORAGE_KEY, theme);
            } catch (err) {
                /* ignore */
            }
            applyTheme(theme);
        });

        cluster.appendChild(wrap);
        applyTheme(getStoredTheme());
    }

    function mountMobileNav() {
        const nav = document.querySelector('.site-header nav');
        const links = nav?.querySelector('.nav-links');
        if (!nav || !links) return;

        // Prefer toggle from HTML (no layout insert after paint)
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
