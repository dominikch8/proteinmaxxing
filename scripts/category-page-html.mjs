import {
    CATEGORY_ORDER,
    CATEGORY_LABELS,
    CATEGORY_INTRO,
    CATEGORY_META_PHRASE,
    CATEGORY_FAQ,
    formatProductCount,
} from './category-seo.mjs';
import { buildSiteFooter } from './site-footer-html.mjs';
import { buildHealthDisclaimer } from './site-legal-html.mjs';
import {
    buildFaviconLinks,
    buildSocialImageMeta,
    buildThemeInitScript,
    buildConsentHeadScript,
    buildAdSenseHead,
    buildCookieConsentBody,
    buildThemeStylesheets,
    buildThemeBodyScript,
    buildFontLinks,
} from './site-head-assets.mjs';
import { buildLogoMark } from './site-logo-html.mjs';

const PREFIX = '../../';

function esc(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function buildOtherCategoriesNav(current) {
    const links = CATEGORY_ORDER.filter((id) => id !== current)
        .map(
            (id) =>
                `                        <a class="category-nav-chip" href="${PREFIX}dieta#produkty/kategoria/${esc(id)}">${esc(CATEGORY_LABELS[id] || id)}</a>`
        )
        .join('\n');
    return `                    <nav class="category-nav-other" aria-label="Inne kategorie">
                        <h2 class="category-nav-other-title">Inne kategorie</h2>
                        <div class="category-nav-chips">
${links}
                        </div>
                    </nav>`;
}

function buildFaqHtml(category) {
    const faq = CATEGORY_FAQ[category];
    if (!faq?.length) return '';
    const items = faq
        .map(
            ([q, a]) => `                        <div class="category-faq-item">
                            <h3>${esc(q)}</h3>
                            <p>${esc(a)}</p>
                        </div>`
        )
        .join('\n');
    return `                    <section class="category-faq" aria-labelledby="category-faq-heading">
                        <h2 id="category-faq-heading">Częste pytania</h2>
${items}
                    </section>`;
}

/**
 * @param {string} category
 * @param {object[]} categoryProducts — produkty z tej kategorii (ze slug)
 */
export function buildCategoryPageHtml(category, categoryProducts) {
    const label = CATEGORY_LABELS[category] || category;
    const count = categoryProducts.length;
    const countLabel = formatProductCount(count);
    const intro = CATEGORY_INTRO[category] || '';
    const metaPhrase = CATEGORY_META_PHRASE[category] || 'kalorie i makro na 100 g';
    const title = `${label} — ${metaPhrase} | Proteiner`;
    const description = `${label}: ${countLabel} w bazie Proteiner. ${intro.slice(0, 140)}… Kalorie, białko, węglowodany i tłuszcz na 100 g.`;
    const canonical = `https://proteiner.pl/produkty/kategoria/${category}`;

    return `<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
${buildThemeInitScript(PREFIX)}
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

${buildConsentHeadScript(PREFIX)}
${buildAdSenseHead()}
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${canonical}">
    <meta property="og:title" content="${esc(label)} — baza makro | Proteiner">
    <meta property="og:description" content="${esc(intro)}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${canonical}">
${buildFaviconLinks(PREFIX)}
${buildSocialImageMeta(PREFIX, 'images/og-home.jpg')}
${buildFontLinks(PREFIX)}
${buildThemeStylesheets(PREFIX)}
    <link rel="stylesheet" href="${PREFIX}css/category-page.css">
</head>
<body class="category-page" data-category="${esc(category)}">
${buildCookieConsentBody(PREFIX)}
    <header class="site-header">
        <nav>
            <a href="${PREFIX}" class="logo">
                ${buildLogoMark(PREFIX)}
                <span>Proteiner</span>
            </a>
            <button type="button" class="nav-toggle" aria-label="Otwórz menu" aria-expanded="false" aria-controls="site-nav-links"><span class="nav-toggle-bar" aria-hidden="true"></span><span class="nav-toggle-bar" aria-hidden="true"></span><span class="nav-toggle-bar" aria-hidden="true"></span></button>
            <ul class="nav-links" id="site-nav-links">
                <li><a class="nav-link" href="${PREFIX}">Główna</a></li>
                <li><a class="nav-link active" href="${PREFIX}dieta" aria-current="page">Dieta</a></li>
                <li><a class="nav-link" href="${PREFIX}kalkulator-bmi">Kalkulator BMI</a></li>
                <li><a class="nav-link" href="${PREFIX}porownaj-produkty">Porównaj produkty</a></li>
                <li><a class="nav-link" href="${PREFIX}dodaj-produkt">Dodaj produkt</a></li>
                <li><a class="nav-link" href="${PREFIX}poradnik-zywienia">Poradnik</a></li>
                <li><a class="nav-link" href="${PREFIX}artykuly">Artykuły</a></li>
                <li><a class="nav-link" href="${PREFIX}informacje">Informacje</a></li>
                <li><a class="nav-link" href="${PREFIX}o-mnie">O mnie</a></li>
                <li id="authNavSlot" class="auth-nav-item"><a class="nav-link auth-nav-link" href="${PREFIX}logowanie">Zaloguj</a></li>
            </ul>
        </nav>
    </header>

    <div class="page-container">
        <main class="main-content category-main">
            <nav class="breadcrumb category-breadcrumb" aria-label="Nawigacja">
                <a href="${PREFIX}">Strona główna</a> ›
                <a href="${PREFIX}dieta#produkty">Dieta</a> ›
                <span>${esc(label)}</span>
            </nav>

            <div class="page-hero category-hero">
                <h1>${esc(label)}</h1>
                <p class="subtitle">${esc(intro)}</p>
                <p class="category-count-badge">${countLabel} w bazie</p>
            </div>

            <section class="category-products-section" aria-labelledby="category-products-heading">
                <h2 id="category-products-heading">Wszystkie produkty — ${esc(label)}</h2>
                <div class="category-toolbar">
                    <div class="search-bar">
                        <input type="search" id="categorySearch" placeholder="Szukaj w kategorii…" aria-label="Szukaj produktu">
                    </div>
                    <div class="input-group pm-category-select">
                        <select id="categorySort" aria-label="Sortowanie">
                            <option value="name-asc">Nazwa (A–Z)</option>
                            <option value="protein-desc">Białko (najwięcej)</option>
                            <option value="kcal-asc">Kalorie (najmniej)</option>
                            <option value="ratio-asc">Białko / 100 kcal (najlepiej)</option>
                        </select>
                    </div>
                </div>
                <div class="products-grid" id="categoryProductsGrid"></div>
                <div class="products-show-more-wrap" id="categoryShowMoreWrap" hidden>
                    <button type="button" class="btn-show-more" id="categoryShowMoreBtn">Pokaż więcej</button>
                </div>
            </section>

${buildFaqHtml(category)}

${buildOtherCategoriesNav(category)}

${buildHealthDisclaimer(PREFIX, { compact: true })}
        </main>
    </div>

${buildSiteFooter(PREFIX)}
    <script src="${PREFIX}js/product-utils.js"></script>
    <script src="${PREFIX}js/products-loader.js"></script>
    <script src="${PREFIX}js/category-page.js"></script>
${buildThemeBodyScript(PREFIX)}
</body>
</html>`;
}
