/**
 * Dodaje nowe produkty do js/products-data-raw.js z plików scripts/new-products-200.json
 * oraz scripts/new-products-batch*.json (deduplikacja po nazwie).
 *
 * Uruchom:
 *   node scripts/add-200-products.mjs            # dry-run — tylko raport
 *   node scripts/add-200-products.mjs --write    # dopisuje do bazy
 * Potem:
 *   node scripts/calculate-serving-protein-prices.mjs
 *   node scripts/build-products-lite.mjs
 *   node scripts/generate-product-card-images.mjs --only-missing
 *   node scripts/build-product-webp.mjs
 *   node scripts/generate-product-pages.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CATEGORY_ORDER } from './category-seo.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const rawPath = path.join(root, 'js', 'products-data-raw.js');
const scriptsDir = path.join(root, 'scripts');

const raw = fs.readFileSync(rawPath, 'utf8');
const prefix = raw.slice(0, raw.indexOf('['));
const dbText = raw.slice(raw.indexOf('['), raw.lastIndexOf('];') + 1);
const db = JSON.parse(dbText);

const files = fs.readdirSync(scriptsDir)
    .filter((f) => f === 'new-products-200.json' || /^new-products-batch.*\.json$/.test(f))
    .sort();

const existing = new Map(db.map((p) => [p.name, p]));
const incoming = [];
const dupes = [];
const badCat = [];
const seen = new Set();

for (const f of files) {
    const arr = JSON.parse(fs.readFileSync(path.join(scriptsDir, f), 'utf8'));
    for (const p of arr) {
        if (!p || !p.name) continue;
        if (existing.has(p.name)) { dupes.push(`${p.name} (baza) ← ${f}`); continue; }
        if (seen.has(p.name)) { dupes.push(`${p.name} (plik) ← ${f}`); continue; }
        if (!CATEGORY_ORDER.includes(p.category)) { badCat.push(`${p.name} → ${p.category}`); }
        seen.add(p.name);
        incoming.push(p);
    }
}

const byCat = {};
for (const p of incoming) byCat[p.category] = (byCat[p.category] || 0) + 1;

console.log(`Pliki: ${files.join(', ')}`);
console.log(`Nowych produktów: ${incoming.length} (baza: ${db.length})`);
console.log('Rozkład:', CATEGORY_ORDER.map((c) => `${c}=${byCat[c] || 0}`).join(' '));
if (dupes.length) console.log(`DUPLIKATY (${dupes.length}):\n  ` + dupes.join('\n  '));
if (badCat.length) console.log(`ZŁE KATEGORIE (${badCat.length}):\n  ` + badCat.join('\n  '));

// Proste kontrole spójności makro
const macroWarn = [];
for (const p of incoming) {
    const calc = p.protein * 4 + p.carbs * 4 + p.fat * 9;
    if (p.kcal < calc - 25 || p.kcal > calc + 25) macroWarn.push(`${p.name}: kcal ${p.kcal} vs makro ${calc}`);
    if (p.satFat + p.unsatFat > p.fat + 0.6) macroWarn.push(`${p.name}: sat+unsat ${p.satFat + p.unsatFat} > fat ${p.fat}`);
}
if (macroWarn.length) console.log(`OSTRZEŻENIA MAKRO (${macroWarn.length}):\n  ` + macroWarn.join('\n  '));

if (!process.argv.includes('--write')) {
    console.log('\nDry-run. Dodaj --write aby zapisać.');
    process.exit(0);
}

if (dupes.length || badCat.length) {
    console.error('\nPrzerwano: popraw duplikaty/złe kategorie.');
    process.exit(1);
}

// Ujednolicenie pól do formatu bazy
const normalized = incoming.map((p) => ({
    name: p.name,
    emoji: p.emoji,
    category: p.category,
    servingText: p.servingText,
    servingRatio: p.servingRatio,
    kcal: p.kcal,
    protein: p.protein,
    carbs: p.carbs,
    fat: p.fat,
    satFat: p.satFat,
    unsatFat: p.unsatFat,
    micros: p.micros,
    extra: p.extra,
    ...(p.pricePerKg ? { pricePerKgRetail: p.pricePerKg } : {}),
}));

const newDbText = JSON.stringify([...db, ...normalized], null, 4);
fs.writeFileSync(rawPath, prefix + newDbText + ';\n', 'utf8');
console.log(`\nZapisano. Baza: ${db.length} → ${db.length + normalized.length}`);
