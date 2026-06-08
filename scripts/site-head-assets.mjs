/**
 * Wspólne tagi <head>: favicon + Open Graph / Twitter.
 * prefix: '' (root) lub '../' (produkty/)
 */

const SITE = 'https://proteiner.pl';

export function buildFaviconLinks(prefix = '') {
    const p = prefix;
    return `    <link rel="icon" href="${p}images/favicon.svg" type="image/svg+xml">
    <link rel="icon" type="image/png" sizes="32x32" href="${p}images/favicon-32.png">
    <link rel="icon" type="image/png" sizes="192x192" href="${p}images/favicon-192.png">
    <link rel="apple-touch-icon" href="${p}images/apple-touch-icon.png">`;
}

/**
 * @param {string} prefix — '' lub '../'
 * @param {string} imagePath — ścieżka względem root (np. images/og-home.jpg) lub pełny URL
 * @param {{ width?: number, height?: number, alt?: string }} [opts]
 */
export function buildSocialImageMeta(prefix, imagePath, opts = {}) {
    const { width = 1200, height = 630, alt = 'Proteiner — kalkulator dietetyczny i baza białka' } = opts;
    const rel = imagePath.startsWith('http') ? imagePath : `${SITE}/${imagePath.replace(/^\//, '')}`;
    return `    <meta property="og:image" content="${rel}">
    <meta property="og:image:width" content="${width}">
    <meta property="og:image:height" content="${height}">
    <meta property="og:image:alt" content="${alt.replace(/"/g, '&quot;')}">
    <meta property="og:locale" content="pl_PL">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="${rel}">`;
}

export function buildDefaultSiteHead(prefix = '') {
    return `${buildFaviconLinks(prefix)}
${buildSocialImageMeta(prefix, 'images/og-home.jpg')}`;
}

export function productOgImagePath(slug) {
    return `images/products/${slug}.jpg`;
}

/** Early theme flash prevention — load immediately after charset. */
export function buildThemeInitScript(prefix = '') {
    return `    <script src="${prefix}js/theme-init.js"></script>`;
}

/** Google AdSense — meta + loader script (after viewport). */
export function buildAdSenseHead() {
    return `    <meta name="google-adsense-account" content="ca-pub-8540801395510703">
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8540801395510703"
        crossorigin="anonymous"></script>`;
}

/** Multitag (quge5.com) — zaraz po otwarciu head / viewport. */
export function buildMultitagHead() {
    return `    <script src="https://quge5.com/88/tag.min.js" data-zone="247555" async data-cfasync="false"></script>`;
}

function buildZoneLoaderScript(zone, src) {
    return `    <script>(function(s){s.dataset.zone='${zone}',s.src='${src}'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>`;
}

/** In-Page Push (nap5k.com) — Joyful + Interesting + Wise. */
export function buildNap5kInPagePushHead() {
    return `${buildZoneLoaderScript('11118313', 'https://nap5k.com/tag.min.js')}
${buildZoneLoaderScript('11118333', 'https://nap5k.com/tag.min.js')}
${buildZoneLoaderScript('11118646', 'https://nap5k.com/tag.min.js')}`;
}

/** Vignette (n6wxm.com) — Perfect tag. */
export function buildN6wxmVignetteHead() {
    return buildZoneLoaderScript('11118551', 'https://n6wxm.com/vignette.min.js');
}

/**
 * themes.css + main stylesheet + theme-switch.css
 * @param {string} prefix — '' lub '../' / '../../'
 * @param {{ productPage?: boolean }} [opts]
 */
export function buildThemeStylesheets(prefix = '', opts = {}) {
    const main = opts.productPage ? 'product-page.css' : 'site.css';
    return `    <link rel="stylesheet" href="${prefix}css/themes.css">
    <link rel="stylesheet" href="${prefix}css/${main}">
    <link rel="stylesheet" href="${prefix}css/theme-switch.css">`;
}

export function buildThemeBodyScript(prefix = '') {
    return `    <script src="${prefix}js/theme.js"></script>`;
}

export function buildThemeAssets(prefix = '', opts = {}) {
    return {
        init: buildThemeInitScript(prefix),
        styles: buildThemeStylesheets(prefix, opts),
        body: buildThemeBodyScript(prefix)
    };
}
