/**
 * Osobne podstrony rankingów (bialko-maxxing.html, cena-bialka.html).
 * Hash: #kategoria/warzywa (opcjonalnie #protein-max/kategoria/warzywa).
 */
function parseRankingPageHash() {
    const hashRaw = (window.location.hash || '').replace(/^#/, '').trim();
    if (!hashRaw) return null;

    const parts = hashRaw.split('/').map((p) => decodeURIComponent(p).trim());
    const katIdx = parts.findIndex((p) => p.toLowerCase() === 'kategoria');
    if (katIdx >= 0 && parts[katIdx + 1]) {
        return parts[katIdx + 1].toLowerCase();
    }
    if (parts.length === 1 && parts[0] && parts[0].toLowerCase() !== 'kategoria') {
        return parts[0].toLowerCase();
    }
    return null;
}

function buildRankingPageHash(kategoria) {
    if (!kategoria || kategoria === 'all') return '';
    return `kategoria/${encodeURIComponent(kategoria)}`;
}

function syncRankingPageUrl(kategoria, replace = true) {
    const hash = buildRankingPageHash(kategoria);
    const next = `${window.location.pathname}${hash ? `#${hash}` : ''}`;
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (next === current) return;
    const fn = replace ? history.replaceState : history.pushState;
    fn.call(history, {}, '', next);
}

function onRankingCategoryChange(mode) {
    if (mode === 'maxxing' && typeof renderProteinMaxxing === 'function') {
        renderProteinMaxxing();
    } else if (mode === 'price' && typeof renderProteinPrice === 'function') {
        renderProteinPrice();
    }
    const selId = mode === 'maxxing' ? 'categoryFilter' : 'priceCategoryFilter';
    const kat = document.getElementById(selId)?.value || 'all';
    syncRankingPageUrl(kat, false);
}

function initRankingPage(mode) {
    const selectId = mode === 'maxxing' ? 'categoryFilter' : 'priceCategoryFilter';
    const sel = document.getElementById(selectId);
    if (!sel) return;

    populateCategorySelect(sel, { includeTop10: true });

    const kategoria = parseRankingPageHash();
    if (kategoria && kategoria !== 'all') {
        const has = Array.from(sel.options).some((o) => o.value === kategoria);
        if (has) sel.value = kategoria;
    }

    if (mode === 'maxxing' && typeof renderProteinMaxxing === 'function') {
        renderProteinMaxxing();
    } else if (mode === 'price' && typeof renderProteinPrice === 'function') {
        renderProteinPrice();
    }

    syncRankingPageUrl(sel.value, true);
}

function bootRankingPage() {
    const mode = document.body.dataset.rankingMode;
    if (!mode) return;
    try {
        initRankingPage(mode);
    } catch (err) {
        console.error('ranking-page:', err);
    }
}

window.onRankingCategoryChange = onRankingCategoryChange;
window.parseRankingPageHash = parseRankingPageHash;

window.addEventListener('hashchange', () => {
    const mode = document.body.dataset.rankingMode;
    if (!mode) return;
    initRankingPage(mode);
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootRankingPage);
} else {
    bootRankingPage();
}
