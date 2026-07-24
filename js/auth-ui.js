/**
 * Slot konta w nawigacji (Zaloguj / Konto).
 * Cache sesji w sessionStorage, żeby nie migało „Zaloguj” → „Admin” przy każdej zakładce.
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

    function findNavList() {
        return document.querySelector('.site-header .nav-links');
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

    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function renderSlot(li, user, prefix) {
        li.className = 'auth-nav-item';
        if (!user) {
            li.innerHTML =
                '<a class="nav-link auth-nav-link" href="' +
                prefix +
                'logowanie">Zaloguj</a>';
            return;
        }
        const label = user.role === 'admin' ? 'Admin' : 'Konto';
        const name = (user.name || user.email || 'Konto').split(' ')[0];
        const path = window.location.pathname || '';
        const isActive = path.includes('konto') || path.includes('admin-zgloszenia');
        li.innerHTML =
            '<a class="nav-link auth-nav-link' +
            (isActive ? ' active' : '') +
            '" href="' +
            prefix +
            'konto" title="' +
            String(user.email || '').replace(/"/g, '&quot;') +
            '">' +
            label +
            (name ? ' · ' + escapeHtml(name) : '') +
            '</a>';
    }

    async function init() {
        const nav = findNavList();
        if (!nav) return;

        let li = document.getElementById('authNavSlot');
        if (!li) {
            li = document.createElement('li');
            li.id = 'authNavSlot';
            nav.appendChild(li);
        }

        const prefix = scriptPrefix();
        const cached = readCache();
        // Od razu pokaż cache (albo nic), bez pośredniego „Zaloguj” jeśli user jest zalogowany
        if (cached !== undefined) {
            renderSlot(li, cached, prefix);
        } else {
            // Placeholder o stałej szerokości — mniej skoku layoutu
            li.className = 'auth-nav-item';
            li.innerHTML = '<a class="nav-link auth-nav-link" href="' + prefix + 'logowanie" style="visibility:hidden">Konto</a>';
        }

        try {
            await ensureApiScript(prefix);
            const data = await window.ProteinerAuth.me();
            const user = data && data.user ? data.user : null;
            writeCache(user);
            renderSlot(li, user, prefix);
        } catch {
            if (cached === undefined) {
                renderSlot(li, null, prefix);
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
