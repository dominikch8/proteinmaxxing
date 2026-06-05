function switchSubTab(subTabId, btn, options = {}) {
    const { preserveCategory = false, skipUrlSync = false } = options;
    const target = document.getElementById(subTabId);
    if (!target) return;
    const parent = target.closest('.page-with-subtabs');
    if (!parent) return;
    parent.querySelectorAll('.sub-tab-content').forEach((content) => content.classList.remove('active'));
    parent.querySelectorAll('.btn-sub').forEach((b) => b.classList.remove('active'));
    target.classList.add('active');
    if (btn) btn.classList.add('active');
    if (subTabId === 'protein-max') {
        if (!preserveCategory) {
            const catSel = document.getElementById('categoryFilter');
            if (catSel) catSel.value = 'all';
        }
        const pmSearch = document.getElementById('proteinMaxSearch');
        if (pmSearch) pmSearch.value = '';
        if (typeof renderProteinMaxxing === 'function') renderProteinMaxxing();
    }
    if (subTabId === 'protein-price') {
        if (!preserveCategory) {
            const priceCat = document.getElementById('priceCategoryFilter');
            if (priceCat) priceCat.value = 'all';
        }
        const ppSearch = document.getElementById('proteinPriceSearch');
        if (ppSearch) ppSearch.value = '';
        if (typeof renderProteinPrice === 'function') renderProteinPrice();
    }
    if (subTabId === 'baza-prod') {
        if (!preserveCategory) {
            const bazaCat = document.getElementById('bazaCategoryFilter');
            if (bazaCat) bazaCat.value = 'all';
            if (typeof renderRandomProducts === 'function') renderRandomProducts();
        } else if (typeof filterProducts === 'function') {
            filterProducts();
        }
    }
    if (!skipUrlSync && typeof syncDietaUrl === 'function') syncDietaUrl(true);
}
