function getSubtabsContainer(subTabEl) {
    let node = subTabEl;
    while (node) {
        const parent = node.parentElement;
        if (parent?.classList.contains('page-with-subtabs')) {
            const panels = [...parent.children].filter((c) => c.classList.contains('sub-tab-content'));
            if (panels.includes(subTabEl)) return parent;
        }
        node = parent;
    }
    return subTabEl.closest('.page-with-subtabs');
}

function switchSubTab(subTabId, btn, options = {}) {
    const { preserveCategory = false, skipUrlSync = false } = options;
    const target = document.getElementById(subTabId);
    if (!target) return;
    const parent = getSubtabsContainer(target);
    if (!parent) return;

    parent.querySelectorAll(':scope > .sub-tab-content').forEach((content) => content.classList.remove('active'));
    parent.querySelector(':scope > .sub-nav')?.querySelectorAll('.btn-sub').forEach((b) => b.classList.remove('active'));

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

const PORADNIK_HASH = {
    skladniki: { tab: 'poradnik-skladniki' },
    odzywianie: { tab: 'poradnik-odzywianie' },
    tipy: { tab: 'poradnik-tipy' },
    trening: { tab: 'poradnik-trening', inner: 'trening-przewodnik' },
    mity: { tab: 'poradnik-trening', inner: 'trening-mity' },
    'trening-mity': { tab: 'poradnik-trening', inner: 'trening-mity' }
};

function initPoradnikFromHash() {
    if (!document.body.classList.contains('poradnik-page')) return;
    const key = (location.hash || '').replace(/^#/, '').toLowerCase();
    const cfg = PORADNIK_HASH[key] || PORADNIK_HASH.skladniki;

    const tabBtn = document.querySelector(`.btn-sub[data-tab="${cfg.tab}"]`);
    switchSubTab(cfg.tab, tabBtn, { skipUrlSync: true });

    if (cfg.inner) {
        const innerBtn = document
            .getElementById('poradnik-trening')
            ?.querySelector(`.btn-sub[onclick*="${cfg.inner}"]`);
        switchSubTab(cfg.inner, innerBtn, { skipUrlSync: true });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPoradnikFromHash);
} else {
    initPoradnikFromHash();
}
