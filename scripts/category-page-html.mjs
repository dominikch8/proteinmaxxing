import { CATEGORY_EDITORIAL } from './category-editorial.mjs';
import {
    CATEGORY_ORDER,
    CATEGORY_LABELS,
    CATEGORY_INTRO,
    CATEGORY_META_PHRASE,
    CATEGORY_TIPS,
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

function linkifyEditorial(text) {
    return text
        .replace(/\.\.\/porownaj-produkty\.html/g, `${PREFIX}porownaj-produkty`)
        .replace(/\.\.\/index\.html/g, `${PREFIX}`)
        .replace(/\.\.\/dieta\.html/g, `${PREFIX}dieta`);
}

function proteinKcalRatio(p) {
    return p.protein > 0 ? p.kcal / p.protein : Infinity;
}

function buildTopProductsHtml(products, category) {
    const top = [...products]
        .sort((a, b) => proteinKcalRatio(a) - proteinKcalRatio(b))
        .slice(0, 8);
    if (!top.length) return '';
    const items = top
        .map(
            (p) => `                        <li>
                            <a href="../${esc(p.slug)}" class="category-top-link">
                                <span class="category-top-emoji" aria-hidden="true">${p.emoji}</span>
                                <span class="category-top-text">
                                    <span class="category-top-name">${esc(p.name)}</span>
                                    <span class="category-top-meta">${p.protein} g białka · ${p.kcal} kcal / 100 g</span>
                                </span>
                            </a>
                        </li>`
        )
        .join('\n');
    return `                    <section class="category-top-products" aria-labelledby="category-top-heading">
                        <h2 id="category-top-heading">Wysokie białko, mniej kcal — przykłady</h2>
                        <p class="category-top-lead">Produkty z tej kategorii z korzystnym stosunkiem kalorii do białka (orientacyjnie):</p>
                        <ul class="category-top-list">
${items}
                        </ul>
                    </section>`;
}

function buildOtherCategoriesNav(current) {
    const links = CATEGORY_ORDER.filter((id) => id !== current)
        .map(
            (id) =>
                `                        <a class="category-nav-chip" href="${esc(id)}">${esc(CATEGORY_LABELS[id] || id)}</a>`
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

function buildTipsHtml(category) {
    const tips = CATEGORY_TIPS[category];
    if (!tips?.length) return '';
    const items = tips.map((t) => `                            <li>${esc(t)}</li>`).join('\n');
    return `                        <ul class="category-tips-list">
${items}
                        </ul>`;
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
    const editorial = CATEGORY_EDITORIAL[category] || '';
    const metaPhrase = CATEGORY_META_PHRASE[category] || 'kalorie i makro na 100 g';
    const title = `${label} — ${metaPhrase} | Proteiner`;
    const description = `${label}: ${countLabel} w bazie Proteiner. ${intro.slice(0, 140)}… Kalorie, białko, węglowodany i tłuszcz na 100 g.`;
    const canonical = `https://proteiner.pl/produkty/kategoria/${category}`;

    const editorialLinked = editorial ? linkifyEditorial(editorial) : '';

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
            <ul class="nav-links">
                <li><a class="nav-link" href="${PREFIX}">Kalkulator</a></li>
                <li><a class="nav-link active" href="${PREFIX}dieta" aria-current="page">Dieta</a></li>
                <li><a class="nav-link" href="${PREFIX}porownaj-produkty">Porównaj produkty</a></li>
                <li><a class="nav-link" href="${PREFIX}dodaj-produkt">Dodaj produkty</a></li>
                <li><a class="nav-link" href="${PREFIX}poradnik-zywienia">Poradnik</a></li>
                <li><a class="nav-link" href="${PREFIX}informacje">Informacje</a></li>
                <li><a class="nav-link" href="${PREFIX}o-mnie">O mnie</a></li>
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

            <section class="editorial-intro category-editorial">
                <h2>Jak korzystać z tej kategorii?</h2>
                ${editorialLinked ? `<p>${editorialLinked}</p>` : ''}
                ${buildTipsHtml(category)}
                <p class="category-cta-links">
                    <a href="${PREFIX}bialko-maxxing#kategoria/${encodeURIComponent(category)}">Ranking Białko maxxing</a>
                    ·
                    <a href="${PREFIX}cena-bialka#kategoria/${encodeURIComponent(category)}">Cena za 100 g białka</a>
                    ·
                    <a href="${PREFIX}">Kalkulator TDEE</a>
                </p>
            </section>

${buildTopProductsHtml(categoryProducts, category)}

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
                            <option value="ratio-asc">Białko / kcal (najlepiej)</option>
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
