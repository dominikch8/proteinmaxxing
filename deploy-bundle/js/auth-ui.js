/**
 * Slot konta w nawigacji (Zaloguj / Konto).
 */
(function () {
    function scriptPrefix() {
        const scripts = document.getElementsByTagName('script');
        for (let i = scripts.length - 1; i >= 0; i--) {
            const src = scripts[i].getAttribute('src') || '';
            if (src.includes('auth-ui.js')) {
                const idx = src.lastIndexOf('/');
                const dir = idx >= 0 ? src.slice(0, idx + 1) : '';
                // js/ → root relative prefix for pages in subfolders
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
        li.innerHTML =
            '<a class="nav-link auth-nav-link' +
            (window.location.pathname.includes('konto') ? ' active' : '') +
            '" href="' +
            prefix +
            'konto" title="' +
            String(user.email || '').replace(/"/g, '&quot;') +
            '">' +
            label +
            (name ? ' · ' + escapeHtml(name) : '') +
            '</a>';
    }

    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
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
        renderSlot(li, null, prefix);

        try {
            await ensureApiScript(prefix);
            const data = await window.ProteinerAuth.me();
            renderSlot(li, data && data.user ? data.user : null, prefix);
        } catch {
            // API niedostępne lokalnie bez PHP — zostaw link Zaloguj
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
