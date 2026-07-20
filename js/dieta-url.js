/**
 * URL diety: zakładka i kategoria w hash (odporne na przekierowania serwera).
 * Przykłady:
 *   dieta.html#produkty
 *   dieta.html#produkty/kategoria/warzywa
 *   dieta.html#protein-max/kategoria/zupy
 * Stary format ?kategoria=… nadal obsługiwany, jeśli serwer go nie usuwa.
 */
const DIETA_HASH_TO_TAB = {
    'protein-max': 'protein-max',
    'bialko-maxxing': 'protein-max',
    'protein-price': 'protein-price',
    'cena-bialka': 'protein-price',
    'baza-prod': 'baza-prod',
    produkty: 'baza-prod',
};

const DIETA_TAB_TO_HASH = {
    'protein-max': 'protein-max',
    'protein-price': 'protein-price',
    'baza-prod': 'produkty',
};

/** @returns {{ tabId: string|null, kategoria: string|null }} */
function parseDietaHash() {
    const hashRaw = (window.location.hash || '').replace(/^#/, '').trim();
    if (!hashRaw) return { tabId: null, kategoria: null };

    const parts = hashRaw.split('/').map((p) => decodeURIComponent(p).trim());
    const head = parts[0].toLowerCase();
    const tabId = DIETA_HASH_TO_TAB[head] || DIETA_HASH_TO_TAB[head.replace(/-/g, '')] || null;

    let kategoria = null;
    const katIdx = parts.findIndex((p) => p.toLowerCase() === 'kategoria');
    if (katIdx >= 0 && parts[katIdx + 1]) {
        kategoria = parts[katIdx + 1].toLowerCase();
    }

    return { tabId, kategoria };
}

/** Kategoria z hash lub query (hash ma pierwszeństwo). */
function getKategoriaFromUrl() {
    const fromHash = parseDietaHash().kategoria;
    if (fromHash) return fromHash;
    const fromQuery = new URLSearchParams(window.location.search).get('kategoria');
    return fromQuery || null;
}

function buildDietaHash(tabId, kategoria) {
    const base = DIETA_TAB_TO_HASH[tabId] || 'produkty';
    if (kategoria && kategoria !== 'all') {
        return `${base}/kategoria/${encodeURIComponent(kategoria)}`;
    }
    return base;
}

function getActiveDietaTabId() {
    const active = document.querySelector('.page-with-subtabs .sub-tab-content.active');
    return active?.id || 'baza-prod';
}

function getCategorySelectForTab(tabId) {
    if (tabId === 'protein-max') return document.getElementById('categoryFilter');
    if (tabId === 'protein-price') return document.getElementById('priceCategoryFilter');
    if (tabId === 'baza-prod') return document.getElementById('bazaCategoryFilter');
    return null;
}

function getCategoryForTab(tabId) {
    const sel = getCategorySelectForTab(tabId);
    return sel?.value || 'all';
}

function setCategoryOnSelect(sel, kategoria) {
    if (!sel || !kategoria || kategoria === 'all') return false;
    const has = Array.from(sel.options).some((o) => o.value === kategoria);
    if (!has) return false;
    sel.value = kategoria;
    return true;
}

function applyCategoryToTab(tabId, kategoria) {
    if (!kategoria || kategoria === 'all') return;
    const sel = getCategorySelectForTab(tabId);
    if (!setCategoryOnSelect(sel, kategoria)) return;
    if (tabId === 'baza-prod' && typeof filterProducts === 'function') filterProducts();
    if (tabId === 'protein-max' && typeof renderProteinMaxxing === 'function') renderProteinMaxxing();
    if (tabId === 'protein-price' && typeof renderProteinPrice === 'function') renderProteinPrice();
}

function syncDietaUrl(replace = true) {
    const tabId = getActiveDietaTabId();
    const kategoria = getCategoryForTab(tabId);
    const hash = buildDietaHash(tabId, kategoria);
    const next = `${window.location.pathname}#${hash}`;
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    if (next === current) return;
    const fn = replace ? history.replaceState : history.pushState;
    fn.call(history, {}, '', next);
}

function onDietaCategoryChange(mode) {
    if (mode === 'baza' && typeof filterProducts === 'function') filterProducts();
    else if (mode === 'maxxing' && typeof renderProteinMaxxing === 'function') renderProteinMaxxing();
    else if (mode === 'price' && typeof renderProteinPrice === 'function') renderProteinPrice();
    syncDietaUrl(false);
}

/** Stare linki dieta.html#produkty/kategoria/… → osobna strona kategorii. */
function redirectDietaCategoryHashToStandalone() {
    const path = (window.location.pathname || '').replace(/\/$/, '');
    const onDieta =
        path.endsWith('dieta.html') || path === '/dieta' || path.endsWith('/dieta');
    if (!onDieta) return false;

    const { tabId, kategoria } = parseDietaHash();
    const hashRaw = (window.location.hash || '').replace(/^#/, '').trim();
    const parts = hashRaw.split('/').map((p) => decodeURIComponent(p).trim());
    const head = (parts[0] || '').toLowerCase();
    const isProductsTab =
        tabId === 'baza-prod' || head === 'produkty' || head === 'baza-prod' || !tabId;

    if (!kategoria || kategoria === 'all' || !isProductsTab) return false;

    window.location.replace(`produkty/kategoria/${encodeURIComponent(kategoria)}`);
    return true;
}

/** Stare linki dieta.html#protein-max → osobna podstrona rankingu. */
function redirectDietaRankingHashToStandalone() {
    const path = (window.location.pathname || '').replace(/\/$/, '');
    const onDieta =
        path.endsWith('dieta.html') || path === '/dieta' || path.endsWith('/dieta');
    if (!onDieta) return false;

    const { tabId, kategoria } = parseDietaHash();
    if (tabId !== 'protein-max' && tabId !== 'protein-price') return false;

    const base = tabId === 'protein-max' ? 'bialko-maxxing' : 'cena-bialka';
    const hash =
        kategoria && kategoria !== 'all'
            ? `#kategoria/${encodeURIComponent(kategoria)}`
            : '';
    window.location.replace(`${base}${hash}`);
    return true;
}

function initDietaFromUrl() {
    if (redirectDietaRankingHashToStandalone()) return;
    if (redirectDietaCategoryHashToStandalone()) return;

    const kategoria = getKategoriaFromUrl();
    const { tabId: tabFromHash } = parseDietaHash();
    const tabId = tabFromHash || getActiveDietaTabId();

    if (kategoria) {
        setCategoryOnSelect(getCategorySelectForTab(tabId), kategoria);
    }

    if (tabFromHash) {
        const parent = document.querySelector('.page-with-subtabs');
        if (parent) {
            const btn = parent.querySelector(`.btn-sub[onclick*="'${tabFromHash}'"]`);
            if (typeof switchSubTab === 'function') {
                switchSubTab(tabFromHash, btn || null, {
                    preserveCategory: Boolean(kategoria),
                    skipUrlSync: true,
                });
            }
        }
    }

    if (kategoria) applyCategoryToTab(tabId, kategoria);
    syncDietaUrl(true);
}

window.parseDietaHash = parseDietaHash;
window.getKategoriaFromUrl = getKategoriaFromUrl;
window.syncDietaUrl = syncDietaUrl;
window.onDietaCategoryChange = onDietaCategoryChange;
window.applyCategoryToTab = applyCategoryToTab;
window.initDietaFromUrl = initDietaFromUrl;

window.addEventListener('hashchange', initDietaFromUrl);
window.addEventListener('popstate', initDietaFromUrl);
