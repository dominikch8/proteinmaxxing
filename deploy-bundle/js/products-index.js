// DEPRECATED: produkty/index.html przekierowuje na dieta.html#produkty
// Indeks produktów — filtr kategorii i wyszukiwanie (produkty/index.html)
(function () {
    const listEl = document.getElementById('productsIndexList');
    const searchEl = document.getElementById('productsIndexSearch');
    const categoryEl = document.getElementById('productsIndexCategory');
    const countEl = document.getElementById('productsIndexCount');
    if (!listEl || typeof productsDatabase === 'undefined') return;

    populateCategorySelect(categoryEl, { useDietaLabels: false });

    const params = new URLSearchParams(window.location.search);
    const urlCat = params.get('kategoria') || params.get('category');
    if (urlCat && categoryEl.querySelector(`option[value="${urlCat}"]`)) {
        categoryEl.value = urlCat;
    }

    function renderIndex() {
        const cat = categoryEl.value;
        const query = (searchEl?.value || '').toLowerCase().trim();
        let items = [...productsDatabase].sort((a, b) =>
            a.name.localeCompare(b.name, 'pl')
        );
        if (cat !== 'all') {
            items = items.filter((p) => p.category === cat);
        }
        if (query) {
            items = items.filter((p) => p.name.toLowerCase().includes(query));
        }

        if (countEl) {
            const catLabel =
                cat === 'all'
                    ? 'Wszystkie kategorie'
                    : CATEGORY_LABELS[cat] || cat;
            countEl.textContent =
                query || cat !== 'all'
                    ? `${catLabel} — ${items.length} produktów`
                    : `${items.length} produktów w bazie`;
        }

        listEl.innerHTML = items
            .map(
                (p) =>
                    `<li><a href="${p.slug}.html">${escapeHtml(p.name)}</a> <span class="products-index-cat">${escapeHtml(CATEGORY_LABELS[p.category] || p.category)}</span></li>`
            )
            .join('');
    }

    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    categoryEl.addEventListener('change', renderIndex);
    searchEl?.addEventListener('input', renderIndex);
    renderIndex();
})();
