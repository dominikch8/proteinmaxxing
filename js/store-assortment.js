/**
 * Typowy asortyment high-protein w sieciach (orientacyjny — oferty się zmieniają).
 * Slugi muszą istnieć w bazie produktów Proteiner.
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

const STORE_CORE_SLUGS = [
    'piers-z-kurczaka',
    'piers-z-indyka',
    'jajko-kurze-cale',
    'bialka-jaj',
    'twarog-chudy',
    'twarog-poltlusty',
    'serek-wiejski',
    'ser-cottage',
    'skyr-naturalny',
    'jogurt-naturalny',
    'protein-pudding',
    'tunczyk-w-wodzie',
    'mintaj',
    'dorsz-swiezy',
    'szynka-drobiowa',
    'szynka-gotowana',
    'indyk-mielony',
    'kurczak-mielony',
    'tofu-naturalne',
    'fasola-biala-gotowana',
    'soczewica-czerwona-gotowana',
    'kabanosy',
    'hummus',
    'ser-zolty-plastry'
];

const STORE_ASSORTMENT = {
    biedronka: [
        ...STORE_CORE_SLUGS,
        'protein-pudding',
        'szynka-drobiowa',
        'mintaj',
        'jogurt-pitny',
        'tunczyk-w-oleju',
        'poledwica-sopocka'
    ],
    lidl: [
        ...STORE_CORE_SLUGS,
        'skyr-naturalny',
        'protein-pudding',
        'bialka-jaj',
        'poledwica-lososiowa',
        'losos-atlantycki',
        'krewetki-gotowane',
        'tofu-naturalne'
    ],
    'delikatesy-centrum': [
        ...STORE_CORE_SLUGS,
        'szynka-gotowana',
        'kielbasa-slaska',
        'ser-gouda',
        'twarog-wiejski',
        'wieprzowina-schab-bez-kosci',
        'poledwica-sopocka',
        'kielbasa-krakowska'
    ],
    stokrotka: [
        ...STORE_CORE_SLUGS,
        'szynka-gotowana',
        'ser-cottage',
        'jogurt-naturalny',
        'tunczyk-w-oleju',
        'kabanosy',
        'ser-gouda'
    ],
    kaufland: [
        ...STORE_CORE_SLUGS,
        'wolowina-poledwica',
        'indyk-mielony',
        'losos-atlantycki',
        'krewetki-gotowane',
        'ser-halloumi',
        'skyr-naturalny',
        'losos-wedzony'
    ],
    carrefour: [
        ...STORE_CORE_SLUGS,
        'skyr-naturalny',
        'ser-cottage',
        'losos-wedzony',
        'szynka-gotowana',
        'krewetki-gotowane',
        'tofu-naturalne'
    ],
    auchan: [
        ...STORE_CORE_SLUGS,
        'indyk-mielony',
        'dorsz-swiezy',
        'krewetki-gotowane',
        'wolowina-poledwica',
        'serek-wiejski',
        'losos-atlantycki'
    ],
    intermarche: [
        ...STORE_CORE_SLUGS,
        'wieprzowina-schab-bez-kosci',
        'indyk-mielony',
        'szynka-gotowana',
        'dorsz-swiezy',
        'kielbasa-krakowska',
        'ser-gouda'
    ]
};

function getStoreById(id) {
    return STORE_CATALOG.find((s) => s.id === id) || STORE_CATALOG[0];
}

function getStoreAssortmentSlugs(storeId) {
    const raw = STORE_ASSORTMENT[storeId] || STORE_CORE_SLUGS;
    return [...new Set(raw.filter(Boolean))];
}
