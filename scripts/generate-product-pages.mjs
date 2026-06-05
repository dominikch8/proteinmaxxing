import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildSiteFooter } from './site-footer-html.mjs';
import {
    buildFaviconLinks,
    buildSocialImageMeta,
    buildThemeInitScript,
    buildThemeStylesheets,
    buildThemeBodyScript
} from './site-head-assets.mjs';
import { buildLogoMark } from './site-logo-html.mjs';
import { CATEGORY_ORDER, CATEGORY_LABELS } from './category-seo.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

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
    'polskie-obiadki':
        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Pierogi_ruskie.jpg/640px-Pierogi_ruskie.jpg',
    zupy: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Chicken_Noodle_Soup.jpg/640px-Chicken_Noodle_Soup.jpg',
    orzechy: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Walnuts.jpg/640px-Walnuts.jpg',
    tluszcze: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Olive_oil_from_Oneglia.jpg/640px-Olive_oil_from_Oneglia.jpg',
    makarony: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Spaghetti.jpg/640px-Spaghetti.jpg',
    fastfood: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Cheeseburger.jpg/640px-Cheeseburger.jpg',
    slodycze: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Chocolate_%28blue_background%29.jpg/640px-Chocolate_%28blue_background%29.jpg',
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
        let base = slugify(p.name);
        let slug = base;
        let n = 2;
        while (seen[slug]) {
            slug = `${base}-${p.category}`;
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
    'polskie-obiadki': ['Żelazo', 'Tiamina (B1)', 'Potas'],
    zupy: ['Potas', 'Witamina C', 'Żelazo'],
    orzechy: ['Magnez', 'Witamina E', 'Cynk'],
    tluszcze: ['Witamina E', 'Witamina A', 'Witamina K'],
    makarony: ['Tiamina (B1)', 'Żelazo', 'Magnez'],
    fastfood: ['Sód', 'Żelazo', 'Witamina B1'],
    slodycze: ['Magnez', 'Żelazo', 'Wapń'],
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
                    <a class="similar-product-link" href="${esc(s.slug)}.html">
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
    return `../dieta.html#produkty/kategoria/${encodeURIComponent(category)}`;
}

function buildSeoText(p) {
    const cat = CATEGORY_LABELS[p.category] || p.category;
    const ratio = p.protein > 0 ? (p.kcal / p.protein).toFixed(1) : '—';
    return `${p.name} to produkt z kategorii ${cat}. Na 100 g znajdziesz ${p.protein} g białka (proteinów), ${p.kcal} kcal kalorii, ${p.carbs} g węglowodanów oraz ${p.fat} g tłuszczu — idealne dane przy zdrowym odżywianiu, odchudzaniu lub budowie masy mięśniowej. Współczynnik ok. ${ratio} kcal na 1 g białka pomaga porównać gęstość odżywczą. ${p.extra}`;
}

function buildPage(p, similar = []) {
    const title = `${p.name} – białko, kalorie, węglowodany, tłuszcz | ProteinMaxxing.pl`;
    const desc = `${p.name}: ${p.protein}g białka, ${p.kcal} kcal, ${p.carbs}g węglowodanów, ${p.fat}g tłuszczu na 100g. Zdrowe odżywianie, proteiny, odchudzanie – makro i mikro na ProteinMaxxing.pl.`;
    const canonical = `https://proteinmaxxing.pl/produkty/${p.slug}.html`;
    const catLabel = CATEGORY_LABELS[p.category] || p.category;
    const porcjaProtein = (p.protein * p.servingRatio).toFixed(1);
    const porcjaCarbs = (p.carbs * p.servingRatio).toFixed(1);
    const porcjaFat = (p.fat * p.servingRatio).toFixed(1);
    const remoteImg = PRODUCT_IMAGE_URLS[p.slug] || PRODUCT_IMAGE_CACHE[p.slug];
    const localJpg = `../images/products/${p.slug}.jpg`;
    const localWebp = `../images/products/${p.slug}.webp`;
    const placeholder = '../images/products/placeholder.svg';
    // Najpierw Twój plik lokalny (.jpg → .webp), potem cache z internetu, na końcu placeholder
    const imgSrc = localJpg;
    const imgOnError = remoteImg
        ? `this.onerror=null;this.src='${localWebp}';this.onerror=function(){this.onerror=null;this.src='${esc(remoteImg)}';this.onerror=function(){this.onerror=null;this.src='${placeholder}';};};`
        : `this.onerror=null;this.src='${localWebp}';this.onerror=function(){this.onerror=null;this.src='${placeholder}';};`;

    const keywords = [
        p.name,
        'białko',
        'proteiny',
        'kalorie',
        'kcal',
        'węglowodany',
        'tłuszcz',
        'makro',
        'zdrowe odżywianie',
        'odchudzanie',
        'redukcja',
        'masa mięśniowa',
        catLabel
    ];

    const noteBlock = p.note
        ? `<div class="extra-box"><strong>Uwaga:</strong> ${esc(p.note)}</div>`
        : '';

    const hasLocalImg = fs.existsSync(path.join(root, 'images', 'products', `${p.slug}.jpg`));
    const ogImagePath = hasLocalImg ? `images/products/${p.slug}.jpg` : 'images/og-home.jpg';
    const headAssets = `${buildFaviconLinks('../')}
    <!-- pm:site-head -->
${buildSocialImageMeta('../', ogImagePath, { alt: p.name })}`;

    return `<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
${buildThemeInitScript('../')}
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="../js/consent-head.js"></script>
    <meta name="google-adsense-account" content="ca-pub-8540801395510703">
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8540801395510703"
        crossorigin="anonymous"></script>
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(desc)}">
    <meta name="keywords" content="${esc(keywords.join(', '))}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${esc(canonical)}">
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(desc)}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="${esc(canonical)}">
${headAssets}
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
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
    <header class="site-header">
        <nav>
            <a class="logo" href="../index.html">
                ${buildLogoMark('../')}
                <span>ProteinMaxxing.pl</span>
            </a>
            <a class="nav-back" href="../dieta.html">← Baza produktów</a>
        </nav>
    </header>

    <main class="product-page">
        <nav class="breadcrumb" aria-label="Nawigacja">
            <a href="../index.html">Strona główna</a> ›
            <a href="../dieta.html">Dieta</a> ›
            <span>${esc(p.name)}</span>
        </nav>

        <article class="product-hero-card" itemscope itemtype="https://schema.org/NutritionInformation">
            <div class="product-layout">
                <div>
                    <div class="product-image-wrap">
                        <img src="${esc(imgSrc)}" alt="${esc(p.name)} – białko ${p.protein}g, kalorie ${p.kcal} kcal, węglowodany i tłuszcz na 100g | zdrowe odżywianie" width="640" height="480" loading="lazy" referrerpolicy="no-referrer" decoding="async" onerror="${imgOnError}">
                        <span class="product-emoji-fallback" aria-hidden="true">${p.emoji}</span>
                    </div>
                </div>
                <div>
                    <a class="product-category" href="${dietaCategoryHref(p.category)}">${esc(catLabel)}</a>
                    <h1 itemprop="name">${esc(p.name)}</h1>
                    <p class="seo-lead" itemprop="description">${esc(buildSeoText(p))}</p>
                    <div class="macro-highlight">
                        <div class="macro-pill kcal-pill"><span>Kalorie</span><strong itemprop="calories">${p.kcal} kcal</strong><small>na 100 g</small></div>
                        <div class="macro-pill"><span>Białko / proteiny</span><strong itemprop="proteinContent">${p.protein} g</strong></div>
                        <div class="macro-pill"><span>Węglowodany</span><strong itemprop="carbohydrateContent">${p.carbs} g</strong></div>
                        <div class="macro-pill"><span>Tłuszcz</span><strong itemprop="fatContent">${p.fat} g</strong></div>
                        ${buildProductPricePill(p)}
                    </div>
                    ${buildProductPriceUpdatedNote(p)}
                    <p><strong>Porcja:</strong> ${esc(p.servingText)} — ${porcjaProtein} g białka, ${porcjaCarbs} g węgli, ${porcjaFat} g tłuszczu (kalorie podane wyłącznie na 100 g).${p.servingPricePln != null ? ` Cena porcji (szac.): ~${formatPlnPrice(p.servingPricePln)}.` : ''}</p>
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

        <section class="seo-block">
            <h2>${esc(p.name)} a zdrowa dieta, odchudzanie i białko</h2>
            <p>Szukając <strong>kalorii</strong>, <strong>białka</strong> i <strong>węglowodanów</strong> w jednym miejscu, warto porównać ${esc(p.name)} z innymi produktami w bazie ProteinMaxxing.pl. Przy <strong>odchudzaniu</strong> liczy się deficyt kaloryczny i sytość — stąd profil ${p.kcal} kcal i ${p.protein} g proteinów na 100 g. Przy budowie masy mięśniowej zwróć uwagę na proporcję białka do energii oraz na <strong>zdrowe</strong> źródła tłuszczu (${p.satFat} g nasyconych / ${p.unsatFat} g nienasyconych).</p>
            <p>${esc(p.extra)}</p>
            <div class="seo-keywords">
                ${['białko', 'proteiny', 'kalorie', 'kcal', 'węglowodany', 'tłuszcz', 'makro', 'mikro', 'zdrowe', 'odchudzanie', 'redukcja', 'dieta', 'odżywianie'].map((k) => `<span>${k}</span>`).join('')}
            </div>
        </section>
${buildSimilarProductsSection(p, similar)}
    </main>

${buildSiteFooter('../')}
    <link rel="stylesheet" href="../css/cookie-consent.css">
    <script src="../js/cookie-banner.js"></script>
    <link rel="stylesheet" href="../css/partner-ads.css">
    <script src="../js/partner-ads.js"></script>
${buildThemeBodyScript('../')}
</body>
</html>`;
}

const rawFile = fs.readFileSync(path.join(root, 'js', 'products-data-raw.js'), 'utf8');
const rawMatch = rawFile.match(/productsDatabaseRaw = (\[[\s\S]*\]);/);
if (!rawMatch) throw new Error('Cannot parse products-data-raw.js');
const raw = JSON.parse(rawMatch[1]);
const products = enrichProducts(raw);

/** Stare URL /produkty/kategoria/*.html → filtr na stronie Dieta */
function generateLegacyCategoryRedirects() {
    const legacyDir = path.join(root, 'produkty', 'kategoria');
    fs.mkdirSync(legacyDir, { recursive: true });
    for (const slug of CATEGORY_ORDER) {
        const label = CATEGORY_LABELS[slug] || slug;
        const target = `../../dieta.html#produkty/kategoria/${encodeURIComponent(slug)}`;
        const canonical = `https://proteinmaxxing.pl/dieta.html#produkty/kategoria/${slug}`;
        fs.writeFileSync(
            path.join(legacyDir, `${slug}.html`),
            `<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
${buildThemeInitScript('../../')}
    <meta http-equiv="refresh" content="0;url=${target}">
    <meta name="robots" content="noindex, follow">
    <link rel="canonical" href="${canonical}">
    <title>Przekierowanie: ${label} | ProteinMaxxing.pl</title>
    <script>location.replace('${target.replace(/'/g, "\\'")}');</script>
</head>
<body>
    <p>Przekierowanie do <a href="${target}">${label}</a> na stronie Dieta…</p>
${buildThemeBodyScript('../../')}
</body>
</html>`,
            'utf8'
        );
    }
}

const outDir = path.join(root, 'produkty');
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(path.join(root, 'images', 'products'), { recursive: true });

let written = 0;
for (const p of products) {
    const similar = getSimilarProducts(p, products);
    fs.writeFileSync(path.join(outDir, `${p.slug}.html`), buildPage(p, similar), 'utf8');
    written++;
}

generateLegacyCategoryRedirects();

const sitemapUrls = products.map(
    (p) => `  <url>\n    <loc>https://proteinmaxxing.pl/produkty/${p.slug}.html</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`
);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://proteinmaxxing.pl/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://proteinmaxxing.pl/dieta.html</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://proteinmaxxing.pl/bialko-maxxing.html</loc>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>https://proteinmaxxing.pl/cena-bialka.html</loc>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>https://proteinmaxxing.pl/porownaj-produkty.html</loc>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>https://proteinmaxxing.pl/trening.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://proteinmaxxing.pl/informacje.html</loc>
    <changefreq>yearly</changefreq>
    <priority>0.4</priority>
  </url>
  <url>
    <loc>https://proteinmaxxing.pl/o-mnie.html</loc>
    <changefreq>yearly</changefreq>
    <priority>0.4</priority>
  </url>
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
    <meta http-equiv="refresh" content="0;url=../dieta.html#produkty">
    <meta name="robots" content="noindex, follow">
    <link rel="canonical" href="https://proteinmaxxing.pl/dieta.html">
    <title>Przekierowanie do bazy produktów | ProteinMaxxing.pl</title>
    <script>location.replace('../dieta.html#produkty');</script>
</head>
<body>
    <p>Przekierowanie do <a href="../dieta.html#produkty">bazy produktów na stronie Dieta</a>…</p>
${buildThemeBodyScript('../')}
</body>
</html>`,
    'utf8'
);

console.log(`Generated ${written} product pages + sitemap.xml`);
