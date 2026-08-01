/**
 * Wspólne tagi <head>: favicon + Open Graph / Twitter.
 * prefix: '' (root) lub '../' (produkty/)
 */

const SITE = 'https://proteiner.pl';
/** Bump when shipping CSS/JS changes (long browser cache + immutable). */
export const ASSET_V = '20260801j';

function asset(prefix, path) {
    return `${prefix}${path}?v=${ASSET_V}`;
}

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

export function buildFontLinks(prefix = '') {
    const fontCss =
        'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=Encode+Sans:wght@600;700;800&display=swap';
    return `    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preload" as="style" href="${fontCss}">
    <link href="${fontCss}" rel="stylesheet">`;
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
    return `    <script src="${asset(prefix, 'js/theme-init.js')}"></script>`;
}

/** Google Consent Mode v2 — przed AdSense. */
export function buildConsentHeadScript(prefix = '') {
    return `    <script src="${prefix}js/consent-head.js"></script>`;
}

/** Google AdSense — meta + loader script (after viewport). */
export function buildAdSenseHead() {
    return `    <meta name="google-adsense-account" content="ca-pub-8540801395510703">
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8540801395510703"
        crossorigin="anonymous"></script>`;
}

/** MediaBoxy Plus — sticky footer + modal + manual units. */
export function buildMediaBoxyHead() {
    return `    <!-- MediaBoxy PLUS (head) -->
    <script src="https://cdn.mediaboxy.pl/js/m4plus.js"></script>
    <!-- MediaBoxy.pl - Zamykane okienko wideo -->
    <script>
    window.a1video = window.a1video || [];
    window.a1video.push({
        publisher: "P44448-497e74779620"
    });
    </script>
    <script async src="https://cdn.mediaboxy.pl/js/v4.js"></script>`;
}

/** MediaBoxy unit (step 6) — can be repeated. */
export function buildMediaBoxyUnit() {
    return `    <!-- MediaBoxy Start | MediaBoxy.pl -->
    <div class="pm-mediaboxy-slot" data-mediaboxy="P44448-497e74779620" data-types="box,banner,product,motion,links,form,text"></div>
    <!-- MediaBoxy Stop | MediaBoxy.pl -->`;
}

/** 300×600 under product image (left column gap). */
export function buildMediaBoxyProductInline() {
    return `                    <!-- MediaBoxy Start | product under-image -->
                    <div class="pm-product-inline-ad" data-mediaboxy="P44448-497e74779620" data-types="banner" data-sizes="4"></div>
                    <!-- MediaBoxy Stop | product under-image -->`;
}

/** 300×600 skyscraper rails — left/right of content (desktop only via CSS). */
export function buildMediaBoxySideRails() {
    const unit =
        '<div data-mediaboxy="P44448-497e74779620" data-types="banner" data-sizes="4"></div>';
    return `    <!-- MediaBoxy side rails | 300x600 -->
    <aside class="pm-side-rail pm-side-rail--left" aria-label="Reklama">
        ${unit}
    </aside>
    <aside class="pm-side-rail pm-side-rail--right" aria-label="Reklama">
        ${unit}
    </aside>`;
}

/** Baner cookie Proteiner — CSS + JS przed skryptami motywu. */
export function buildCookieConsentBody(prefix = '') {
    return `    <link rel="stylesheet" href="${asset(prefix, 'css/cookie-consent.css')}">
    <script src="${asset(prefix, 'js/cookie-banner.js')}"></script>`;
}

/**
 * themes.css + main stylesheet + theme-switch.css
 * @param {string} prefix — '' lub '../' / '../../'
 * @param {{ productPage?: boolean }} [opts]
 */
export function buildThemeStylesheets(prefix = '', opts = {}) {
    const main = opts.productPage ? 'product-page.css' : 'site.css';
    return `    <link rel="stylesheet" href="${asset(prefix, 'css/themes.css')}">
    <link rel="stylesheet" href="${asset(prefix, `css/${main}`)}">
    <link rel="stylesheet" href="${asset(prefix, 'css/theme-switch.css')}">
    <link rel="stylesheet" href="${asset(prefix, 'css/site-motion.css')}">
    <link rel="stylesheet" href="${asset(prefix, 'css/brand-text.css')}">`;
}

export function buildThemeBodyScript(prefix = '') {
    return `    <script src="${asset(prefix, 'js/auth-ui.js')}"></script>
    <script src="${asset(prefix, 'js/theme.js')}"></script>
    <script src="${asset(prefix, 'js/site-motion.js')}"></script>`;
}

export function buildThemeAssets(prefix = '', opts = {}) {
    return {
        init: buildThemeInitScript(prefix),
        styles: buildThemeStylesheets(prefix, opts),
        body: buildThemeBodyScript(prefix)
    };
}
