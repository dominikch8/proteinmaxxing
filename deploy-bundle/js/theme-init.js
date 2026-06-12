(function () {
    try {
        if (localStorage.getItem('pm-theme') === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    } catch (e) {
        /* ignore */
    }
})();
