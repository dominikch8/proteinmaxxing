/**
 * Cena za 100 g czystego białka (PLN):
 *   cena_za_100g_białka = servingPricePln × 100 / (protein × servingRatio)
 *
 * Ceny porcji z scripts/retail-prices-pl.json (średnie Biedronka / Lidl / Auchan).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const rawPath = path.join(root, 'js', 'products-data-raw.js');
const retailPath = path.join(__dirname, 'retail-prices-pl.json');

const retail = JSON.parse(fs.readFileSync(retailPath, 'utf8'));
const MIN_PROTEIN = retail.minProteinPer100g ?? 5;

const src = fs.readFileSync(rawPath, 'utf8');
const products = Function(
    `return ${src.replace(/^const productsDatabaseRaw = /, '').replace(/;\s*$/, '')}`
)();

function roundShelfPrice(pln) {
    if (pln < 0.5) return Math.max(0.29, Math.round(pln * 20) / 20);
    if (pln < 2) return Math.round(pln * 20) / 20;
    if (pln < 15) return Math.round(pln * 10) / 10 - 0.01;
    return Math.floor(pln) + 0.99;
}

function pricePerKgFromRetail(p) {
    const n = p.name.toLowerCase();
    for (const row of retail.patterns) {
        const re = new RegExp(row.re, 'i');
        if (re.test(n)) return row.pricePerKg;
    }
    let v = retail.categoryPricePerKg[p.category] ?? 15.99;
    if (p.kcal >= 520) v *= 1.12;
    else if (p.kcal >= 380) v *= 1.06;
    if (p.protein >= 24) v *= 1.02;
    if (p.protein > 0 && p.protein < 3) v *= 0.92;
    if (p.category === 'mieso' && p.fat > 20) v *= 0.92;
    return Math.round(v * 100) / 100;
}

function servingPriceFromPackage(p) {
    const grams = Math.round(p.servingRatio * 100 * 1000) / 1000;
    const pkg = (retail.standardPackages || []).find((x) => x.nameMatch === p.name);
    if (!pkg || !pkg.netGrams || !pkg.pricePln) return null;
    return roundShelfPrice(pkg.pricePln * (grams / pkg.netGrams));
}

function packMultiplier(p, st, grams, pricePerKg) {
    const n = p.name.toLowerCase();
    if (/izolat|wpi|wpc|koncentrat.*białka/i.test(n) && st.includes('miarka')) return 1;
    if (/jajko kurze/.test(n) && st.includes('sztuka')) return 1;
    if (/mleko/.test(n) && st.includes('szklanka')) return 1;
    if (st.includes('puszka') && grams >= 80) {
        return Math.max(1, 5.5 / (pricePerKg * (grams / 1000) || 1));
    }
    if (st.includes('kostka') && grams >= 150) return 1.04;
    if (st.includes('plaster') || st.includes('kromka')) return 1.08;
    if (st.includes('łyżka') || st.includes('łyżeczka')) return 1.1;
    if (st.includes('garść') && grams <= 40 && pricePerKg >= 25) return 1;
    if (st.includes('garść') && grams <= 40) return 1.05;
    if (p.category === 'fastfood') return 1.18;
    if (p.category === 'slodycze') return 1.1;
    return 1.03;
}

function fixedServingPrice(p) {
    const st = p.servingText.toLowerCase();
    for (const fix of retail.fixedServings || []) {
        if (p.name !== fix.nameMatch) continue;
        if (fix.servingMatch && !st.includes(fix.servingMatch.toLowerCase())) continue;
        return fix.servingPricePln;
    }
    return null;
}

function servingPricePln(p, pricePerKg) {
    const fromPkg = servingPriceFromPackage(p);
    if (fromPkg != null) return fromPkg;

    const fixed = fixedServingPrice(p);
    if (fixed != null) return fixed;

    const grams = Math.round(p.servingRatio * 100 * 1000) / 1000;
    const st = p.servingText.toLowerCase();
    const linear = pricePerKg * (grams / 1000);
    let price = linear * packMultiplier(p, st, grams, pricePerKg);

    if (st.includes('puszka') && grams >= 80) {
        price = Math.max(price, 5.29 + (grams - 80) * 0.012);
    }
    if (st.includes('tabliczka') && grams >= 80) price = Math.max(price, 5.49);
    if (st.includes('opakowanie') && grams >= 150) price = Math.max(price, linear * 1.06 + 0.2);

    return roundShelfPrice(price);
}

function proteinPriceFromServing(servingPrice, protein, servingRatio) {
    if (!servingPrice || !protein || protein < MIN_PROTEIN || !servingRatio || servingRatio <= 0) {
        return null;
    }
    const proteinInServing = protein * servingRatio;
    if (proteinInServing <= 0) return null;
    return Math.round(((servingPrice * 100) / proteinInServing) * 100) / 100;
}

let skippedLowProtein = 0;

for (const p of products) {
    const pricePerKg = pricePerKgFromRetail(p);
    const servingGrams = Math.round(p.servingRatio * 100 * 1000) / 1000;
    const servingPrice = servingPricePln(p, pricePerKg);
    const proteinInServing = Math.round(p.protein * p.servingRatio * 100) / 100;

    p.servingGrams = servingGrams;
    p.servingPricePln = servingPrice;
    p.proteinInServing = proteinInServing;
    p.pricePer100gProtein = proteinPriceFromServing(servingPrice, p.protein, p.servingRatio);

    if (p.protein < MIN_PROTEIN) {
        p.pricePer100gProtein = null;
        skippedLowProtein++;
    }

    delete p.pricePerKgRetail;
    delete p.pricePer100g;
}

fs.writeFileSync(rawPath, `const productsDatabaseRaw = ${JSON.stringify(products)};\n`, 'utf8');

const report = products
    .filter((p) => p.pricePer100gProtein != null)
    .sort((a, b) => a.pricePer100gProtein - b.pricePer100gProtein);

fs.writeFileSync(
    path.join(__dirname, '_protein-price-report.json'),
    JSON.stringify(
        report.map((p) => ({
            name: p.name,
            serving: p.servingText,
            servingGrams: p.servingGrams,
            servingPricePln: p.servingPricePln,
            proteinPer100g: p.protein,
            proteinInServing: p.proteinInServing,
            pricePer100gProtein: p.pricePer100gProtein,
            formula: `${p.servingPricePln} × 100 / ${p.proteinInServing} = ${p.pricePer100gProtein}`,
        })),
        null,
        2
    ),
    'utf8'
);

console.log(`Przeliczono ${products.length} produktów (ceny z ${path.basename(retailPath)}).`);
console.log(`Z ceną białka: ${report.length} | Bez (< ${MIN_PROTEIN} g białka/100 g): ${skippedLowProtein}`);
console.log(`Raport: scripts/_protein-price-report.json\n`);

const pom = products.find((x) => x.name === 'Pomidory suszone');
if (pom) {
    console.log('Pomidory suszone:', pom.servingPricePln, 'zł /', pom.servingGrams, 'g →', pom.pricePer100gProtein, 'zł / 100 g białka');
}

for (const name of ['Pierś z kurczaka', 'Twaróg chudy', 'Ser pleśniowy (blue)', 'Koncentrat białka serwatkowego (WPC)']) {
    const p = products.find((x) => x.name === name);
    if (!p || p.pricePer100gProtein == null) continue;
    console.log(`${p.name}: ${p.pricePer100gProtein} zł / 100 g białka (porcja ${p.servingPricePln} zł)`);
}
