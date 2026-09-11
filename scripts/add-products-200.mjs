/**
 * Dodaje 200 nowych produktów z scripts/new-products-200.json do bazy.
 *
 * Dane (makro + mikro na 100 g / 100 ml) opracowane na podstawie:
 *  - USDA FoodData Central (SR Legacy / Foundation Foods),
 *  - tabele składu i wartości odżywczej IŻŻ / „Baza produktów spożywczych”,
 *  - etykiety producentów (wartości na 100 g produktu),
 *  - ceny regularne: Biedronka / Lidl / Kaufland / Auchan — III–IX 2026.
 *
 * Mikroskładniki z JSON są scalane z profilem z product-micros-engine.mjs
 * (baza kategorii + reguły nazw), a brakujące klucze dopełniane z kategorii.
 *
 * Uruchom:
 *   node scripts/add-products-200.mjs
 * Potem (skrypt robi to sam):
 *   node scripts/calculate-serving-protein-prices.mjs
 *   node scripts/build-products-lite.mjs
 *   node scripts/generate-product-pages.mjs
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { buildMicrosForProduct } from './product-micros-engine.mjs';
import { cleanMicros, microsToLabelString } from './lib/micros-shared.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const rawPath = path.join(root, 'js', 'products-data-raw.js');
const jsonPath = path.join(root, 'scripts', 'new-products-200.json');

function slugify(name) {
    return String(name)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/ą/g, 'a').replace(/ć/g, 'c').replace(/ę/g, 'e').replace(/ł/g, 'l')
        .replace(/ń/g, 'n').replace(/ó/g, 'o').replace(/ś/g, 's').replace(/ź/g, 'z').replace(/ż/g, 'z')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

const raw = fs.readFileSync(rawPath, 'utf8');
const start = raw.indexOf('[');
const end = raw.lastIndexOf('];');
const db = JSON.parse(raw.slice(start, end + 1));

const slugSet = new Set(db.map((p) => p.slug || slugify(p.name)));
const nameSet = new Set(db.map((p) => p.name));

function uniqueSlug(base, category) {
    let slug = base;
    if (slugSet.has(slug)) slug = `${base}-${category}`;
    let n = 2;
    while (slugSet.has(slug)) slug = `${base}-${n++}`;
    slugSet.add(slug);
    return slug;
}

const rows = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

let added = 0;
const skipped = [];

for (const row of rows) {
    const { micros: curated, pricePerKg, ...rest } = row;
    if (nameSet.has(rest.name)) {
        skipped.push(rest.name);
        continue;
    }

    const satFat = rest.satFat ?? 0;
    const unsatFat = rest.unsatFat ?? Math.max(0, Math.round((rest.fat - satFat) * 10) / 10);

    const base = { ...rest, satFat, unsatFat };
    const detail = cleanMicros({ ...buildMicrosForProduct(base), ...(curated || {}) });

    const product = {
        name: rest.name,
        emoji: rest.emoji || '🍽️',
        category: rest.category,
        servingText: rest.servingText,
        servingRatio: rest.servingRatio,
        kcal: rest.kcal,
        protein: rest.protein,
        carbs: rest.carbs,
        fat: rest.fat,
        satFat,
        unsatFat,
        micros: microsToLabelString(detail),
        extra: rest.extra || '',
        microsDetail: detail,
        slug: uniqueSlug(slugify(rest.name), rest.category),
    };
    // Cena detaliczna (PLN za kg / l) — wykorzysta ją calculate-serving-protein-prices.mjs
    if (pricePerKg != null) product.pricePerKgRetail = pricePerKg;

    db.push(product);
    nameSet.add(product.name);
    added += 1;
}

fs.writeFileSync(rawPath, raw.slice(0, start) + JSON.stringify(db) + raw.slice(end + 1), 'utf8');

console.log(`Dodano produktów: ${added} (pominięto duplikaty: ${skipped.length}), razem: ${db.length}`);
if (skipped.length) console.log('Pominięte:', skipped.join(', '));

const byCat = {};
for (const p of db) byCat[p.category] = (byCat[p.category] || 0) + 1;
console.log('Nowe wg kategorii:', JSON.stringify(Object.fromEntries(
    Object.entries(rows.reduce((acc, r) => { acc[r.category] = (acc[r.category] || 0) + 1; return acc; }, {}))
)));

if (!process.argv.includes('--no-build')) {
    const run = (s) => execSync(`node ${path.join('scripts', s)}`, { cwd: root, stdio: 'inherit' });
    run('calculate-serving-protein-prices.mjs');
    run('build-products-lite.mjs');
    run('generate-product-pages.mjs');
}
console.log('done');
