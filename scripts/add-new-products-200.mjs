/**
 * Dodaje partię nowych produktów z scripts/new-products-200.json do js/products-data-raw.js.
 * Makro (kcal/białko/węgle/tłuszcz), mikro (obiekt micros) i cena są podane ręcznie
 * dla każdego produktu (pricePerKgRetail → pricePerKg w bazie).
 *
 * Uruchom:
 *   node scripts/_merge-np.mjs           # scala partie _np-*.json → new-products-200.json
 *   node scripts/add-new-products-200.mjs  # dopisuje do products-data-raw.js
 *   node scripts/calculate-serving-protein-prices.mjs
 *   node scripts/build-products-lite.mjs
 *   node scripts/generate-product-card-images.mjs --only-missing
 *   node scripts/build-product-webp.mjs
 *   node scripts/generate-product-pages.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const rawPath = path.join(root, 'js', 'products-data-raw.js');
const jsonPath = path.join(root, 'scripts', 'new-products-200.json');

const rawFile = fs.readFileSync(rawPath, 'utf8');
const prefix = rawFile.slice(0, rawFile.indexOf('['));
const suffix = rawFile.slice(rawFile.lastIndexOf('];'));
const db = JSON.parse(rawFile.slice(rawFile.indexOf('['), rawFile.lastIndexOf('];') + 1));

const existing = new Set(db.map((p) => p.name));
const incoming = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const VALID_CATEGORIES = new Set([
    'mieso', 'nabial', 'sery', 'warzywa', 'owoce', 'zboza', 'platki-sniadaniowe',
    'polskie-obiadki', 'zupy', 'orzechy', 'tluszcze', 'makarony', 'mrozone-pizze',
    'fastfood', 'slodycze', 'batony', 'batony-proteinowe', 'sosy', 'napoje',
    'alkohole', 'przyprawy'
]);

const problems = [];
let added = 0;
let skipped = 0;

for (const p of incoming) {
    if (!p || !p.name) continue;
    if (existing.has(p.name)) { skipped++; continue; }

    if (!VALID_CATEGORIES.has(p.category)) problems.push(`${p.name}: nieznana kategoria ${p.category}`);
    for (const f of ['kcal', 'protein', 'carbs', 'fat']) {
        if (typeof p[f] !== 'number' || p[f] < 0) problems.push(`${p.name}: brak/nieprawidłowe ${f}`);
    }
    if (typeof p.servingRatio !== 'number' || p.servingRatio <= 0) problems.push(`${p.name}: zły servingRatio`);
    if (!p.servingText) problems.push(`${p.name}: brak servingText`);
    if (typeof p.pricePerKg !== 'number' || p.pricePerKg <= 0) problems.push(`${p.name}: brak ceny`);
    if (!p.micros || typeof p.micros !== 'object') problems.push(`${p.name}: brak mikro`);

    db.push({
        name: p.name,
        emoji: p.emoji || '🍽️',
        category: p.category,
        servingText: p.servingText,
        servingRatio: p.servingRatio,
        kcal: p.kcal,
        protein: p.protein,
        carbs: p.carbs,
        fat: p.fat,
        satFat: p.satFat ?? 0,
        pricePerKgRetail: p.pricePerKg,
        micros: p.micros || {},
        extra: p.extra || ''
    });
    existing.add(p.name);
    added++;
}

if (problems.length) {
    console.error('Problemy w danych (napraw przed zapisem):');
    for (const msg of problems) console.error(' - ' + msg);
    process.exit(1);
}

fs.writeFileSync(rawPath, prefix + JSON.stringify(db, null, 2) + suffix, 'utf8');

const byCat = {};
for (const p of incoming) {
    if (!p || !p.name) continue;
    byCat[p.category] = (byCat[p.category] || 0) + 1;
}
console.log(`Dodano: ${added} | pominięto istniejące: ${skipped}`);
console.log('Razem w bazie:', db.length);
console.log('Kategorie nowych:', JSON.stringify(byCat));
