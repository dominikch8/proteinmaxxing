import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildSiteFooter } from './site-footer-html.mjs';
import { buildHealthDisclaimer } from './site-legal-html.mjs';
import {
    buildCategoryEditorialHtml,
    productHasRichContent,
    MIN_EXTRA_FOR_INDEX
} from './category-editorial.mjs';
import {
    generateProductEditorial,
    generatedEditorialIsRich
} from './product-editorial-generator.mjs';
import { polishEditorial } from './polish-gender.mjs';
import {
    applyProductNameCases,
    renderEditorialFragment
} from './polish-cases.mjs';
import {
    buildFaviconLinks,
    buildSocialImageMeta,
    buildThemeInitScript,
    buildConsentHeadScript,
    buildAdSenseHead,
    buildCookieConsentBody,
    buildThemeStylesheets,
    buildThemeBodyScript,
    buildFontLinks
} from './site-head-assets.mjs';
import { buildLogoMark } from './site-logo-html.mjs';
import { buildServingTableHtml } from './serving-table-html.mjs';
import { CATEGORY_ORDER, CATEGORY_LABELS } from './category-seo.mjs';
import { buildCategoryPageHtml } from './category-page-html.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const editorialBySlug = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'product-editorial.json'), 'utf8')
);

const retailPath = path.join(__dirname, 'retail-prices-pl.json');
const retailMeta = fs.existsSync(retailPath)
    ? JSON.parse(fs.readFileSync(retailPath, 'utf8'))
    : { updated: '2026-05' };

const MONTHS_PL = [
    'styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec',
    'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'
];

function formatPriceUpdatedLabel(isoYm) {
    const m = String(isoYm || '2026-05').match(/^(\d{4})-(\d{2})$/);
    if (!m) return String(isoYm || 'maj 2026');
    const month = MONTHS_PL[parseInt(m[2], 10) - 1] || m[2];
    return `${month} ${m[1]}`;
}

const PRICE_UPDATED_LABEL = formatPriceUpdatedLabel(retailMeta.updated);

const cachePath = path.join(root, 'js', 'product-images-cache.json');
let PRODUCT_IMAGE_CACHE = {};
if (fs.existsSync(cachePath)) {
    PRODUCT_IMAGE_CACHE = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
}

const CATEGORY_IMAGES = {
    mieso: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Good_Food_Display_-_NCI_Visuals_Online.jpg/640px-Good_Food_Display_-_NCI_Visuals_Online.jpg',
    nabial: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Egg.jpg/640px-Egg.jpg',
    warzywa: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/CSA_vegetables.jpg/640px-CSA_vegetables.jpg',
    owoce: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Various_fruits.jpg/640px-Various_fruits.jpg',
    zboza: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Various_grains.jpg/640px-Various_grains.jpg',
    'platki-sniadaniowe':
        'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Oatmeal.jpg/640px-Oatmeal.jpg',
    'polskie-obiadki':
        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Pierogi_ruskie.jpg/640px-Pierogi_ruskie.jpg',
    zupy: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Chicken_Noodle_Soup.jpg/640px-Chicken_Noodle_Soup.jpg',
    orzechy: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Walnuts.jpg/640px-Walnuts.jpg',
    tluszcze: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Olive_oil_from_Oneglia.jpg/640px-Olive_oil_from_Oneglia.jpg',
    makarony: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Spaghetti.jpg/640px-Spaghetti.jpg',
    fastfood: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Cheeseburger.jpg/640px-Cheeseburger.jpg',
    slodycze: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Chocolate_%28blue_background%29.jpg/640px-Chocolate_%28blue_background%29.jpg',
    batony: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Chocolate_%28blue_background%29.jpg/640px-Chocolate_%28blue_background%29.jpg',
    'batony-proteinowe':
        'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Chocolate_%28blue_background%29.jpg/640px-Chocolate_%28blue_background%29.jpg',
    sosy: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Ketchup.jpg/640px-Ketchup.jpg'
};

const PRODUCT_IMAGE_URLS = {
    'piers-z-kurczaka': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Chicken_breast_on_plate.jpg/640px-Chicken_breast_on_plate.jpg',
    'jajko-kurze-cale': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Egg.jpg/640px-Egg.jpg',
    'losos-atlantycki': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Salmon_fillet.jpg/640px-Salmon_fillet.jpg',
    'tunczyk-w-wodzie': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Canned_tuna.jpg/640px-Canned_tuna.jpg',
    'twarog-chudy': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Cottage_cheese.jpg/640px-Cottage_cheese.jpg',
    'brokuly': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Broccoli_stalks.jpg/640px-Broccoli_stalks.jpg',
    'banan': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Banana-Single.jpg/640px-Banana-Single.jpg',
    'jablko': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Red_Apple.jpg/640px-Red_Apple.jpg',
    'ryz-bialy-gotowany': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/White_rice.jpg/640px-White_rice.jpg',
    'owsianka-na-mleku': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Oatmeal.jpg/640px-Oatmeal.jpg',
    'awokado': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Avocado.jpg/640px-Avocado.jpg',
    'orzechy-wloskie': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Walnuts.jpg/640px-Walnuts.jpg',
    'oliwa-z-oliwek': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Olive_oil_from_Oneglia.jpg/640px-Olive_oil_from_Oneglia.jpg',
    'spaghetti-gotowane': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Spaghetti.jpg/640px-Spaghetti.jpg',
    'pizza-margherita': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Pizza_Margherita_stu_spivack.jpg/640px-Pizza_Margherita_stu_spivack.jpg',
    'burger-z-wolowina': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Cheeseburger.jpg/640px-Cheeseburger.jpg',
    'czekolada-mleczna': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Chocolate_%28blue_background%29.jpg/640px-Chocolate_%28blue_background%29.jpg'
};

function slugify(name) {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/ą/g, 'a').replace(/ć/g, 'c').replace(/ę/g, 'e')
        .replace(/ł/g, 'l').replace(/ń/g, 'n').replace(/ó/g, 'o')
        .replace(/ś/g, 's').replace(/ź/g, 'z').replace(/ż/g, 'z')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function enrichProducts(raw) {
    const seen = {};
    return raw.map((p) => {
        let base = p.slug && String(p.slug).trim() ? String(p.slug).trim() : slugify(p.name);
        let slug = base;
        let n = 2;
        while (seen[slug]) {
            slug = `${base}-${p.category || 'x'}`;
            if (seen[slug]) slug = `${base}-${n++}`;
        }
        seen[slug] = true;
        return { ...p, slug };
    });
}

function esc(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function fmt(n) {
    return Number(n).toFixed(1).replace(/\.0$/, (m) => (m ? '' : n));
}

function formatPlnPrice(value) {
    return `${Number(value).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł`;
}

function estimateFoodPricePer100g(p) {
    const grams = p.servingGrams > 0 ? p.servingGrams : p.servingRatio > 0 ? p.servingRatio * 100 : 0;
    if (grams > 0 && p.servingPricePln != null && p.servingPricePln >= 0) {
        return Math.round((p.servingPricePln / grams) * 10000) / 100;
    }
    return null;
}

function estimateProteinPricePer100g(p) {
    if (p.pricePer100gProtein != null && p.pricePer100gProtein > 0) return p.pricePer100gProtein;
    if (p.servingPricePln && p.protein > 0 && p.servingRatio > 0) {
        return Math.round(((p.servingPricePln * 100) / (p.protein * p.servingRatio)) * 100) / 100;
    }
    return null;
}

function buildProductPriceTableRows(p) {
    const food = estimateFoodPricePer100g(p);
    const protein = estimateProteinPricePer100g(p);
    let rows = '';
    if (food != null) {
        rows += `<tr><th>Cena produktu (szac. za 100 g)</th><td>~${formatPlnPrice(food)}</td></tr>`;
    }
    if (protein != null) {
        rows += `<tr><th>Cena za 100 g białka (szac.)</th><td>~${formatPlnPrice(protein)}</td></tr>`;
    }
    return rows;
}

function buildProductPricePill(p) {
    const food = estimateFoodPricePer100g(p);
    if (food == null) return '';
    return `<div class="macro-pill product-price-pill"><span>Cena (szac.)</span><strong>~${formatPlnPrice(food)}</strong><small>za 100 g</small></div>`;
}

function productHasPriceData(p) {
    return (
        estimateFoodPricePer100g(p) != null ||
        estimateProteinPricePer100g(p) != null ||
        (p.servingPricePln != null && p.servingPricePln >= 0)
    );
}

function buildProductPriceUpdatedNote(p) {
    if (!productHasPriceData(p)) return '';
    return `<p class="product-price-updated">Ceny zaktualizowano: <strong>${esc(PRICE_UPDATED_LABEL)}</strong> (szacunek — ceny w popularnych supermarketach)</p>`;
}

const CATEGORY_MICRO_FALLBACKS = {
    mieso: ['Żelazo', 'Cynk', 'Witamina B12'],
    nabial: ['Wapń', 'Witamina B2', 'Fosfor'],
    warzywa: ['Witamina C', 'Kwas foliowy', 'Potas'],
    owoce: ['Witamina C', 'Potas', 'Mangan'],
    zboza: ['Magnez', 'Tiamina (B1)', 'Żelazo'],
    'platki-sniadaniowe': ['Żelazo', 'Magnez', 'Tiamina (B1)'],
    'polskie-obiadki': ['Żelazo', 'Tiamina (B1)', 'Potas'],
    zupy: ['Potas', 'Witamina C', 'Żelazo'],
    orzechy: ['Magnez', 'Witamina E', 'Cynk'],
    tluszcze: ['Witamina E', 'Witamina A', 'Witamina K'],
    makarony: ['Tiamina (B1)', 'Żelazo', 'Magnez'],
    fastfood: ['Sód', 'Żelazo', 'Witamina B1'],
    slodycze: ['Magnez', 'Żelazo', 'Wapń'],
    batony: ['Magnez', 'Żelazo', 'Wapń'],
    'batony-proteinowe': ['Magnez', 'Żelazo', 'Wapń'],
    sosy: ['Sód', 'Potas', 'Witamina C']
};

const NON_MICRO_KEYWORDS = /^(probiotyk|błonnik|antyoksydant|azotan|allicyn|kapsaicyn|resweratrol|polifenol|komplet aminokwas|fortyfikac|bazylia|naturalny antybiotyk|wysoka zawartość soli)$/i;

function normalizeMicroLabel(item) {
    let s = item.trim();
    if (/^wit\.?\s/i.test(s)) s = s.replace(/^wit\.?\s*/i, 'Witamina ');
    if (/^b(\d+)$/i.test(s)) return `Witamina B${s.match(/^b(\d+)$/i)[1]}`;
    if (/^b(\d+)$/i.test(s.replace(/\s/g, ''))) return `Witamina B${s.replace(/\s/g, '').slice(1)}`;
    if (/^witamina\s/i.test(s) || /^kwas\s/i.test(s) || /^beta-/i.test(s) || /^likopen/i.test(s) || /^omega/i.test(s)) return s;
    if (/^(żelazo|cynk|wapń|wapn|selen|jod|miedź|miedz|potas|fosfor|magnez|sód|sod)$/i.test(s)) return s.charAt(0).toUpperCase() + s.slice(1).replace('wapn', 'wapń').replace('miedz', 'miedź').replace('sod', 'sód');
    return s;
}

function parseMicrosList(micros) {
    if (!micros || micros === '-') return [];
    return micros
        .split(/[,;]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .map(normalizeMicroLabel)
        .filter((s) => !NON_MICRO_KEYWORDS.test(s));
}

function getTopMicros(p, count = 3) {
    const parsed = parseMicrosList(p.micros);
    const fallbacks = CATEGORY_MICRO_FALLBACKS[p.category] || ['Potas', 'Magnez', 'Witamina C'];
    const merged = [];
    const seen = new Set();
    for (const item of [...parsed, ...fallbacks]) {
        const key = item.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        merged.push(item);
        if (merged.length >= count) break;
    }
    return merged;
}

function formatMicrosLine(p) {
    return getTopMicros(p, 3).join(', ');
}

const SIMILAR_LIMIT = 6;

function getSimilarProducts(current, all, limit = SIMILAR_LIMIT) {
    const pool = all.filter((x) => x.slug !== current.slug);
    const byDistance = (list) =>
        list
            .map((x) => ({
                p: x,
                d:
                    Math.abs(x.protein - current.protein) * 3 +
                    Math.abs(x.kcal - current.kcal) * 0.08 +
                    Math.abs(x.carbs - current.carbs) * 0.05
            }))
            .sort((a, b) => a.d - b.d)
            .map((x) => x.p);

    const picked = [];
    const sameCat = pool.filter((x) => x.category === current.category);
    for (const p of byDistance(sameCat)) {
        if (picked.length >= limit) break;
        picked.push(p);
    }
    if (picked.length < limit) {
        const rest = pool.filter((x) => x.category !== current.category);
        for (const p of byDistance(rest)) {
            if (picked.length >= limit) break;
            picked.push(p);
        }
    }
    return picked;
}

function buildSimilarProductsSection(p, similar) {
    if (!similar.length) return '';
    const catLabel = CATEGORY_LABELS[p.category] || p.category;
    const items = similar
        .map(
            (s) => `                <li>
                    <a class="similar-product-link" href="${esc(s.slug)}">
                        <span class="similar-product-emoji" aria-hidden="true">${s.emoji}</span>
                        <span class="similar-product-text">
                            <span class="similar-product-name">${esc(s.name)}</span>
                            <span class="similar-product-meta">${s.protein} g białka · ${s.kcal} kcal / 100 g</span>
                        </span>
                    </a>
                </li>`
        )
        .join('\n');

    return `
        <section class="similar-products" aria-labelledby="similar-products-heading">
            <h2 id="similar-products-heading">Podobne produkty</h2>
            <p class="similar-products-lead">Inne z kategorii <strong>${esc(catLabel)}</strong> o zbliżonym profilu makro:</p>
            <ul class="similar-products-list">
${items}
            </ul>
            <p class="similar-products-more">
                <a href="${dietaCategoryHref(p.category)}">Zobacz całą kategorię ${esc(catLabel)} →</a>
            </p>
        </section>`;
}

function dietaCategoryHref(category) {
    return `../dieta#produkty/kategoria/${encodeURIComponent(category)}`;
}

function buildSeoLead(p) {
    const cat = CATEGORY_LABELS[p.category] || p.category;
    return `${p.name}: ${p.protein} g białka, ${p.kcal} kcal, ${p.carbs} g węglowodanów i ${p.fat} g tłuszczu na 100 g. Kategoria: ${cat}.`;
}

function getProductEditorial(p) {
    if (editorialBySlug[p.slug]?.paragraphs?.length) {
        return polishEditorial(editorialBySlug[p.slug], p.name);
    }
    return generateProductEditorial(p);
}

function renderEditorialParagraph(para, productName) {
    const withCases = applyProductNameCases(para, productName);
    return withCases
        .split(/(<[^>]+>)/)
        .map((part) => (part.startsWith('<') ? part : renderEditorialFragment(part, esc)))
        .join('');
}

function buildProductGuideSection(p) {
    const ed = getProductEditorial(p);
    if (ed?.paragraphs?.length) {
        const titleHtml = renderEditorialParagraph(ed.title || p.name, p.name);
        const paras = ed.paragraphs
            .map((para) => `            <p>${renderEditorialParagraph(para, p.name)}</p>`)
            .join('\n');
        return `        <section class="product-guide">
            <h2>${titleHtml}</h2>
${paras}
        </section>`;
    }
    const extra = (p.extra || '').trim();
    if (extra.length >= MIN_EXTRA_FOR_INDEX) {
        return `        <section class="product-guide">
            <h2>Praktyczne wskazówki</h2>
            <p>${esc(extra)}</p>
        </section>`;
    }
    return buildCategoryEditorialHtml(p.category, '../');
}

function buildPage(p, similar = []) {
    const title = `${p.name} – białko, kalorie, węglowodany, tłuszcz | Proteiner`;
    const desc = `${p.name}: ${p.protein}g białka, ${p.kcal} kcal, ${p.carbs}g węglowodanów, ${p.fat}g tłuszczu na 100g. Zdrowe odżywianie, proteiny, odchudzanie – makro i mikro na Proteiner.`;
    const canonical = `https://proteiner.pl/produkty/${p.slug}`;
    const catLabel = CATEGORY_LABELS[p.category] || p.category;
    const servingTableHtml = buildServingTableHtml(p, {
        esc,
        formatPrice: formatPlnPrice
    });
    const localPng = `../images/products/${p.slug}.png`;
    const localJpg = `../images/products/${p.slug}.jpg`;
    const localWebp = `../images/products/${p.slug}.webp`;
    const placeholder = '../images/products/placeholder.svg';
    const hasPng = fs.existsSync(path.join(root, 'images', 'products', `${p.slug}.png`));
    const hasJpg = fs.existsSync(path.join(root, 'images', 'products', `${p.slug}.jpg`));
    // Prefer JPG: product PNGs are excluded from FTP deploy (see deploy.yml).
    const imgSrc = hasJpg ? localJpg : localPng;
    const imgOnError = hasJpg
        ? `this.onerror=null;this.src='${localWebp}';this.onerror=function(){this.onerror=null;this.src='${placeholder}';};`
        : hasPng
          ? `this.onerror=null;this.src='${localJpg}';this.onerror=function(){this.onerror=null;this.src='${localWebp}';this.onerror=function(){this.onerror=null;this.src='${placeholder}';};};`
          : `this.onerror=null;this.src='${localWebp}';this.onerror=function(){this.onerror=null;this.src='${placeholder}';};`;

    const noteBlock = p.note
        ? `<div class="extra-box"><strong>Uwaga:</strong> ${esc(p.note)}</div>`
        : '';

    const indexable = productHasRichContent(p, editorialBySlug) || generatedEditorialIsRich(p);
    const robotsMeta = indexable ? 'index, follow' : 'noindex, follow';

    const hasLocalImg = hasPng || hasJpg;
    const ogImagePath = hasJpg
        ? `images/products/${p.slug}.jpg`
        : hasPng
          ? `images/products/${p.slug}.png`
          : 'images/og-home.jpg';
    const headAssets = `${buildFaviconLinks('../')}
    <!-- pm:site-head -->
${buildSocialImageMeta('../', ogImagePath, { alt: p.name })}`;

    return `<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
${buildThemeInitScript('../')}
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
${buildConsentHeadScript('../')}
${buildAdSenseHead()}
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(desc)}">
    <meta name="robots" content="${robotsMeta}">
    <link rel="canonical" href="${esc(canonical)}">
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(desc)}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="${esc(canonical)}">
${headAssets}
${buildFontLinks('../')}
${buildThemeStylesheets('../', { productPage: true })}
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "NutritionInformation",
        "name": ${JSON.stringify(p.name)},
        "servingSize": ${JSON.stringify(p.servingText)},
        "calories": "${p.kcal} kcal na 100 g",
        "proteinContent": "${p.protein} g",
        "carbohydrateContent": "${p.carbs} g",
        "fatContent": "${p.fat} g"
    }
    </script>
</head>
<body>
${buildCookieConsentBody('../')}
    <header class="site-header">
        <nav>
            <a class="logo" href="../">
                ${buildLogoMark('../')}
                <span>Proteiner</span>
            </a>
            <a class="nav-back" href="../dieta">← Baza produktów</a>
        </nav>
    </header>

    <main class="product-page">
        <nav class="breadcrumb" aria-label="Nawigacja">
            <a href="../">Strona główna</a> ›
            <a href="../dieta">Dieta</a> ›
            <span>${esc(p.name)}</span>
        </nav>

        <article class="product-hero-card" itemscope itemtype="https://schema.org/NutritionInformation">
            <div class="product-layout">
                <div class="product-media-col">
                    <div class="product-image-wrap">
                        <img src="${esc(imgSrc)}" alt="${esc(p.name)} – białko ${p.protein}g, kalorie ${p.kcal} kcal, węglowodany i tłuszcz na 100g | zdrowe odżywianie" width="640" height="480" loading="lazy" referrerpolicy="no-referrer" decoding="async" onerror="${imgOnError}">
                        <span class="product-emoji-fallback" aria-hidden="true">${p.emoji}</span>
                    </div>
                </div>
                <div>
                    <a class="product-category" href="${dietaCategoryHref(p.category)}">${esc(catLabel)}</a>
                    <h1 itemprop="name">${esc(p.name)}</h1>
                    <p class="seo-lead" itemprop="description">${esc(buildSeoLead(p))}</p>
                    <div class="macro-highlight">
                        <div class="macro-pill kcal-pill"><span>Kalorie</span><strong itemprop="calories">${p.kcal} kcal</strong><small>na 100 g</small></div>
                        <div class="macro-pill"><span>Białko / proteiny</span><strong itemprop="proteinContent">${p.protein} g</strong></div>
                        <div class="macro-pill"><span>Węglowodany</span><strong itemprop="carbohydrateContent">${p.carbs} g</strong></div>
                        <div class="macro-pill"><span>Tłuszcz</span><strong itemprop="fatContent">${p.fat} g</strong></div>
                        ${buildProductPricePill(p)}
                    </div>
                    ${buildProductPriceUpdatedNote(p)}
                    ${servingTableHtml}
                    ${noteBlock}
                </div>
            </div>

            <section class="nutrition-section">
                <h2>Szczegółowe składniki odżywcze na 100 g</h2>
                <table class="nutrition-table">
                    <tbody>
                        <tr><th>Wartość energetyczna (kalorie)</th><td>${p.kcal} kcal</td></tr>
                        <tr><th>Białko (proteiny)</th><td>${p.protein} g</td></tr>
                        <tr><th>Węglowodany</th><td>${p.carbs} g</td></tr>
                        <tr><th>Tłuszcz</th><td>${p.fat} g</td></tr>
                        <tr><th>Tłuszcze nasycone</th><td>${p.satFat} g</td></tr>
                        <tr><th>Tłuszcze nienasycone</th><td>${p.unsatFat} g</td></tr>
                        <tr><th>Witaminy i minerały</th><td>${esc(formatMicrosLine(p))}</td></tr>
                        <tr><th>Współczynnik kcal / 1 g białka</th><td>${p.protein > 0 ? (p.kcal / p.protein).toFixed(1) : '—'}</td></tr>
                        ${buildProductPriceTableRows(p)}
                    </tbody>
                </table>
            </section>
        </article>

${buildProductGuideSection(p)}
${buildSimilarProductsSection(p, similar)}

${buildHealthDisclaimer('../', { compact: true })}
    </main>

${buildSiteFooter('../')}
${buildThemeBodyScript('../')}
</body>
</html>`;
}

const rawFile = fs.readFileSync(path.join(root, 'js', 'products-data-raw.js'), 'utf8');
const rawMatch = rawFile.match(/productsDatabaseRaw = (\[[\s\S]*\]);/);
if (!rawMatch) throw new Error('Cannot parse products-data-raw.js');
const raw = JSON.parse(rawMatch[1]);
const products = enrichProducts(raw);

/** Pełne strony kategorii z tekstem redakcyjnym i listą produktów. */
function generateCategoryPages(allProducts) {
    const catDir = path.join(root, 'produkty', 'kategoria');
    fs.mkdirSync(catDir, { recursive: true });
    for (const slug of CATEGORY_ORDER) {
        const inCategory = allProducts.filter((p) => p.category === slug);
        fs.writeFileSync(
            path.join(catDir, `${slug}.html`),
            buildCategoryPageHtml(slug, inCategory),
            'utf8'
        );
    }
}

const outDir = path.join(root, 'produkty');
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(path.join(root, 'images', 'products'), { recursive: true });

let written = 0;
let indexedCount = 0;
for (const p of products) {
    const similar = getSimilarProducts(p, products);
    fs.writeFileSync(path.join(outDir, `${p.slug}.html`), buildPage(p, similar), 'utf8');
    written++;
    if (productHasRichContent(p, editorialBySlug) || generatedEditorialIsRich(p)) indexedCount++;
}

generateCategoryPages(products);

const STATIC_SITEMAP_ENTRIES = [
    { loc: 'https://proteiner.pl/', changefreq: 'weekly', priority: '1.0' },
    { loc: 'https://proteiner.pl/dieta', changefreq: 'weekly', priority: '0.9' },
    { loc: 'https://proteiner.pl/bialko-maxxing', changefreq: 'weekly', priority: '0.85' },
    { loc: 'https://proteiner.pl/cena-bialka', changefreq: 'weekly', priority: '0.85' },
    { loc: 'https://proteiner.pl/porownaj-produkty', changefreq: 'weekly', priority: '0.85' },
    { loc: 'https://proteiner.pl/poradnik-zywienia', changefreq: 'weekly', priority: '0.9' },
    { loc: 'https://proteiner.pl/artykuly', changefreq: 'weekly', priority: '0.9' },
    { loc: 'https://proteiner.pl/deficyt-kaloryczny-praktyka', changefreq: 'monthly', priority: '0.85' },
    { loc: 'https://proteiner.pl/planowanie-posilkow', changefreq: 'monthly', priority: '0.85' },
    { loc: 'https://proteiner.pl/najlepsze-zrodla-bialka-biedronka-lidl-auchan-carrefour', changefreq: 'monthly', priority: '0.85' },
    { loc: 'https://proteiner.pl/zrodla-bialka-biedronka', changefreq: 'monthly', priority: '0.85' },
    { loc: 'https://proteiner.pl/zrodla-bialka-lidl', changefreq: 'monthly', priority: '0.85' },
    { loc: 'https://proteiner.pl/zrodla-bialka-auchan', changefreq: 'monthly', priority: '0.85' },
    { loc: 'https://proteiner.pl/zrodla-bialka-carrefour', changefreq: 'monthly', priority: '0.85' },
    { loc: 'https://proteiner.pl/logowanie', changefreq: 'yearly', priority: '0.3' },
    { loc: 'https://proteiner.pl/rejestracja', changefreq: 'yearly', priority: '0.3' },
    { loc: 'https://proteiner.pl/dodaj-produkt', changefreq: 'monthly', priority: '0.5' },
    { loc: 'https://proteiner.pl/trening', changefreq: 'monthly', priority: '0.8' },
    { loc: 'https://proteiner.pl/informacje', changefreq: 'yearly', priority: '0.4' },
    { loc: 'https://proteiner.pl/o-mnie', changefreq: 'yearly', priority: '0.4' },
    { loc: 'https://proteiner.pl/skladniki-kalorie', changefreq: 'monthly', priority: '0.8' },
    { loc: 'https://proteiner.pl/skladniki-bialko', changefreq: 'monthly', priority: '0.8' },
    { loc: 'https://proteiner.pl/skladniki-weglowodany', changefreq: 'monthly', priority: '0.8' },
    { loc: 'https://proteiner.pl/skladniki-tluszcz', changefreq: 'monthly', priority: '0.8' },
    { loc: 'https://proteiner.pl/skladniki-tluszcze-nasycone', changefreq: 'monthly', priority: '0.75' },
    { loc: 'https://proteiner.pl/skladniki-tluszcze-nienasycone', changefreq: 'monthly', priority: '0.75' },
    { loc: 'https://proteiner.pl/skladniki-blonnik', changefreq: 'monthly', priority: '0.75' },
    { loc: 'https://proteiner.pl/skladniki-witaminy', changefreq: 'monthly', priority: '0.75' },
    { loc: 'https://proteiner.pl/skladniki-mineraly', changefreq: 'monthly', priority: '0.75' },
    { loc: 'https://proteiner.pl/skladniki-mikroelementy', changefreq: 'monthly', priority: '0.75' }
];

function sitemapUrlEntry({ loc, changefreq, priority }) {
    return `  <url>\n    <loc>${loc}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

const categorySitemapUrls = CATEGORY_ORDER.map(
    (slug) =>
        `  <url>\n    <loc>https://proteiner.pl/produkty/kategoria/${slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`
);

const staticSitemapUrls = STATIC_SITEMAP_ENTRIES.map(sitemapUrlEntry);

const sitemapUrls = products
    .filter((p) => productHasRichContent(p, editorialBySlug) || generatedEditorialIsRich(p))
    .map(
    (p) => `  <url>\n    <loc>https://proteiner.pl/produkty/${p.slug}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`
);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticSitemapUrls.join('\n')}
${categorySitemapUrls.join('\n')}
${sitemapUrls.join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(root, 'sitemap.xml'), sitemap, 'utf8');

// Stary URL /produkty/index.html — przekierowanie na bazę w zakładce Dieta
fs.writeFileSync(
    path.join(root, 'produkty', 'index.html'),
    `<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
${buildThemeInitScript('../')}
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="refresh" content="0;url=../dieta#produkty">
    <meta name="robots" content="noindex, follow">
    <link rel="canonical" href="https://proteiner.pl/dieta">
    <title>Przekierowanie do bazy produktów | Proteiner</title>
    <script>location.replace('../dieta#produkty');</script>
</head>
<body>
    <p>Przekierowanie do <a href="../dieta#produkty">bazy produktów na stronie Dieta</a>…</p>
${buildThemeBodyScript('../')}
</body>
</html>`,
    'utf8'
);

console.log(`Generated ${written} product pages (${indexedCount} indexable, ${written - indexedCount} noindex) + sitemap.xml`);
