/**
 * Katalog sieci sklepów (Dieta → Sklepy).
 * Asortyment produktów — na razie pusty (do uzupełnienia później).
 */
const STORE_CATALOG = [
    { id: 'biedronka', name: 'Biedronka', emoji: '🐞', article: 'zrodla-bialka-biedronka', blurb: 'Go Active, Delikate i budżetowe klasyki.' },
    { id: 'lidl', name: 'Lidl', emoji: '🔵', article: 'zrodla-bialka-lidl', blurb: 'Pilos, High Protein i chłodnia.' },
    { id: 'delikatesy-centrum', name: 'Delikatesy Centrum', emoji: '🏪', article: null, blurb: 'Lokalna sieć — nabiał, wędliny, mięso.' },
    { id: 'stokrotka', name: 'Stokrotka', emoji: '🌼', article: null, blurb: 'Convenience + świeże mięso i nabiał.' },
    { id: 'kaufland', name: 'Kaufland', emoji: '🟧', article: null, blurb: 'Duży hipermarket — mięso, ryby, marki własne.' },
    { id: 'carrefour', name: 'Carrefour', emoji: '🔷', article: 'zrodla-bialka-carrefour', blurb: 'Carrefour Classic / Quality i chłodnia.' },
    { id: 'auchan', name: 'Auchan', emoji: '❤️', article: 'zrodla-bialka-auchan', blurb: 'Duże opakowania i dobre ceny za kg.' },
    { id: 'intermarche', name: 'Intermarché', emoji: '🔴', article: null, blurb: 'Mięso z lady i nabiał pod makro.' }
];

const STORE_ASSORTMENT = {
    biedronka: [],
    lidl: [],
    'delikatesy-centrum': [],
    stokrotka: [],
    kaufland: [],
    carrefour: [],
    auchan: [],
    intermarche: []
};

function getStoreById(id) {
    return STORE_CATALOG.find((s) => s.id === id) || STORE_CATALOG[0];
}

function getStoreAssortmentSlugs(storeId) {
    const raw = STORE_ASSORTMENT[storeId] || [];
    return [...new Set(raw.filter(Boolean))];
}
