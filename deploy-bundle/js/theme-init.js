(function () {
    const STORAGE_KEY = 'pm-theme';
    const MIGRATED_KEY = 'pm-theme-neon-default';

    function getTheme() {
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

    /** Recovery when a broken <li class=" produkt…> swallowed <main> into the nav. */
    function repairBrokenNavNesting() {
        const nav = document.querySelector('ul.nav-links');
        if (!nav) return false;
        const trapped = nav.querySelector('main.main-content, main');
        if (!trapped) return false;

        const header = document.querySelector('header.site-header, header');
        const host = header && header.parentNode;
        if (!host) return false;

        const brokenLi = trapped.closest('li');
        if (!brokenLi || !nav.contains(brokenLi)) return false;

        const frag = document.createDocumentFragment();
        while (brokenLi.firstChild) {
            frag.appendChild(brokenLi.firstChild);
        }
        if (header.nextSibling) host.insertBefore(frag, header.nextSibling);
        else host.appendChild(frag);

        const fix = document.createElement('li');
        fix.className = 'nav-add-product';
        const add = document.createElement('a');
        add.className = 'nav-link nav-link--subtle';
        add.href = pathPrefix() + 'dodaj-produkt';
        add.textContent = 'Dodaj produkt';
        if (/dodaj-produkt/.test(window.location.pathname || '')) {
            add.classList.add('active');
            add.setAttribute('aria-current', 'page');
        }
        fix.appendChild(add);
        brokenLi.replaceWith(fix);
        return true;
    }

    function injectHeaderUtilities() {
        if (document.body) repairBrokenNavNesting();
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
