(function () {
    const STORAGE_KEY = 'pm-theme';

    function getTheme() {
        try {
            return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
        } catch (e) {
            return 'light';
        }
    }

    const theme = getTheme();
    try {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    } catch (e) {
        /* ignore */
    }

    function pathPrefix() {
        const path = window.location.pathname || '';
        if (path.includes('/produkty/kategoria/')) return '../../';
        if (path.includes('/produkty/')) return '../';
        return '';
    }

    function injectHeaderUtilities() {
        if (document.getElementById('pm-header-utilities') && document.getElementById('pm-header-theme')) {
            return true;
        }
        if (!document.body) return false;

        const prefix = pathPrefix();
        const path = window.location.pathname || '';
        const addActive = /dodaj-produkt/.test(path) ? ' active' : '';
        const authActive = /logowanie|konto|admin-zgloszenia/.test(path) ? ' active' : '';
        const lightActive = theme === 'light';
        const darkActive = theme === 'dark';

        if (!document.getElementById('pm-header-theme')) {
            const themeCluster = document.createElement('div');
            themeCluster.id = 'pm-header-theme';
            themeCluster.className = 'header-utilities header-utilities--theme';
            themeCluster.innerHTML =
                '<div id="pm-theme-switch" class="theme-switch" role="group" aria-label="Motyw strony">' +
                '<button type="button" class="theme-switch-btn' +
                (lightActive ? ' is-active' : '') +
                '" data-theme-value="light" aria-pressed="' +
                (lightActive ? 'true' : 'false') +
                '" title="Jasny motyw">' +
                '<span aria-hidden="true">☀️</span><span class="theme-switch-text">Jasny</span>' +
                '</button>' +
                '<button type="button" class="theme-switch-btn' +
                (darkActive ? ' is-active' : '') +
                '" data-theme-value="dark" aria-pressed="' +
                (darkActive ? 'true' : 'false') +
                '" title="Ciemny motyw neon">' +
                '<span aria-hidden="true">🌙</span><span class="theme-switch-text">Neon</span>' +
                '</button>' +
                '</div>';
            document.body.appendChild(themeCluster);
        }

        if (!document.getElementById('pm-header-utilities')) {
            const actions = document.createElement('div');
            actions.id = 'pm-header-utilities';
            actions.className = 'header-utilities header-utilities--actions';
            actions.innerHTML =
                '<a id="addProductFloating" class="nav-add-floating' +
                addActive +
                '" href="' +
                prefix +
                'dodaj-produkt">Dodaj produkt</a>' +
                '<a id="authNavFloating" class="nav-add-floating auth-nav-floating' +
                authActive +
                '" href="' +
                prefix +
                'logowanie">Zaloguj</a>';
            document.body.appendChild(actions);
        }

        return true;
    }

    if (!injectHeaderUtilities()) {
        const mo = new MutationObserver(() => {
            if (injectHeaderUtilities()) mo.disconnect();
        });
        mo.observe(document.documentElement, { childList: true, subtree: true });
    }
})();
