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

    function mountThemeSwitch() {
        if (document.getElementById('pm-theme-switch')) return;

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

        document.body.appendChild(wrap);
        applyTheme(getStoredTheme());
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', mountThemeSwitch);
    } else {
        mountThemeSwitch();
    }
})();
