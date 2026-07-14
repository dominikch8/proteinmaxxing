/**
 * Lekka baza produktów bez długich pól (extra) — szybsze ładowanie list i kalkulatora.
 * Uruchamiane z scripts/build-deploy.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const rawPath = path.join(root, 'js', 'products-data-raw.js');
const outPath = path.join(root, 'js', 'products-lite.js');

const LITE_FIELDS = [
    'name', 'emoji', 'category', 'servingText', 'servingRatio', 'servingGrams',
    'kcal', 'protein', 'carbs', 'fat', 'satFat', 'unsatFat', 'micros', 'note',
    'pricePer100gProtein', 'servingPricePln', 'proteinInServing'
];

const rawFile = fs.readFileSync(rawPath, 'utf8');
const match = rawFile.match(/productsDatabaseRaw = (\[[\s\S]*\]);/);
if (!match) throw new Error('Cannot parse products-data-raw.js');

const db = JSON.parse(match[1]);
const lite = db.map((p) => {
    const row = {};
    for (const key of LITE_FIELDS) {
        if (p[key] !== undefined) row[key] = p[key];
    }
    return row;
});

fs.writeFileSync(outPath, `const productsDatabaseLite = ${JSON.stringify(lite)};\n`, 'utf8');

const rawKb = Math.round(fs.statSync(rawPath).size / 1024);
const liteKb = Math.round(fs.statSync(outPath).size / 1024);
console.log(`products-lite.js: ${lite.length} produktów (${liteKb} KB, raw: ${rawKb} KB)`);
