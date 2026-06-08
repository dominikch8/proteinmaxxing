(function () {
    function mountSlot(slot) {
        const zone = slot.getAttribute('data-ad-zone');
        const src = slot.getAttribute('data-ad-src');
        if (!zone || !src || slot.dataset.adMounted === '1') return;
        slot.dataset.adMounted = '1';
        const s = document.createElement('script');
        s.dataset.zone = zone;
        s.src = src;
        slot.appendChild(s);
    }

    document.querySelectorAll('.site-ad-slot[data-ad-zone]').forEach(mountSlot);
})();
