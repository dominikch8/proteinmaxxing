/**
 * Slot konta w nawigacji (Zaloguj / Konto).
 * Preferuje pływający przycisk w #pm-header-utilities (#authNavFloating).
 */
(function () {
    const CACHE_KEY = 'pmx_auth_nav_v1';

    function scriptPrefix() {
        const scripts = document.getElementsByTagName('script');
        for (let i = scripts.length - 1; i >= 0; i--) {
            const src = scripts[i].getAttribute('src') || '';
            if (src.includes('auth-ui.js')) {
                const idx = src.lastIndexOf('/');
                const dir = idx >= 0 ? src.slice(0, idx + 1) : '';
                if (dir.startsWith('../')) return dir.replace(/js\/$/, '');
                return '';
            }
        }
        const path = window.location.pathname || '';
        if (path.includes('/produkty/')) {
            return path.includes('/kategoria/') ? '../../' : '../';
        }
        return '';
    }

    function ensureApiScript(prefix) {
        if (window.ProteinerAuth) return Promise.resolve();
        return new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = prefix + 'js/auth-api.js';
            s.onload = () => resolve();
            s.onerror = () => reject(new Error('Nie załadowano auth-api.js'));
            document.head.appendChild(s);
        });
    }

    function pathPrefix() {
        const path = window.location.pathname || '';
        if (path.includes('/produkty/kategoria/')) return '../../';
        if (path.includes('/produkty/')) return '../';
        return '';
    }

    function readCache() {
        try {
            const raw = sessionStorage.getItem(CACHE_KEY);
            if (!raw) return undefined;
            return JSON.parse(raw);
        } catch {
            return undefined;
        }
    }

    function writeCache(user) {
        try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify(user || null));
        } catch {
            /* ignore */
        }
    }

    function ensureAuthLink(prefix) {
        let link = document.getElementById('authNavFloating');
        if (link) return link;

        let cluster = document.getElementById('pm-header-utilities');
        if (!cluster) {
            cluster = document.createElement('div');
            cluster.id = 'pm-header-utilities';
            cluster.className = 'header-utilities';
            document.body.appendChild(cluster);
        }

        link = document.createElement('a');
        link.id = 'authNavFloating';
        link.className = 'nav-add-floating auth-nav-floating';
        link.href = prefix + 'logowanie';
        link.textContent = 'Zaloguj';

        // Actions cluster: [Dodaj produkt][Zaloguj] — Zaloguj always furthest right
        cluster.appendChild(link);
        return link;
    }

    function renderAuthLink(link, user, prefix) {
        link.dataset.authManaged = '1';
        link.className = 'nav-add-floating auth-nav-floating';
        const path = window.location.pathname || '';

        if (!user) {
            link.href = prefix + 'logowanie';
            link.textContent = 'Zaloguj';
            link.removeAttribute('title');
            link.classList.toggle('active', path.includes('logowanie'));
            return;
        }

        const label = user.role === 'admin' ? 'Admin' : 'Konto';
        const name = (user.name || user.email || 'Konto').split(' ')[0];
        const isActive = path.includes('konto') || path.includes('admin-zgloszenia');
        link.href = prefix + 'konto';
        link.textContent = label + (name ? ' · ' + name : '');
        link.title = user.email || '';
        link.classList.toggle('active', isActive);
    }

    async function init() {
        const prefix = scriptPrefix() || pathPrefix();
        const link = ensureAuthLink(prefix);
        const cached = readCache();

        if (cached !== undefined) {
            renderAuthLink(link, cached, prefix);
        } else if (!link.textContent.trim()) {
            renderAuthLink(link, null, prefix);
        }

        // Usuń stary slot z paska nawigacji, jeśli jeszcze jest
        const old = document.getElementById('authNavSlot');
        if (old) old.remove();

        try {
            await ensureApiScript(prefix);
            const data = await window.ProteinerAuth.me();
            const user = data && data.user ? data.user : null;
            writeCache(user);
            renderAuthLink(link, user, prefix);
        } catch {
            if (cached === undefined) {
                renderAuthLink(link, null, prefix);
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
