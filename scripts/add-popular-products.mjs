/**
 * Dodaje popularne produkty z new-popular-products.json do bazy (cel: 500 pozycji).
 * Uruchom: node scripts/add-popular-products.mjs
 * Potem: node scripts/calculate-serving-protein-prices.mjs && node scripts/generate-product-pages.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const rawPath = path.join(root, 'js', 'products-data-raw.js');
const newPath = path.join(root, 'scripts', 'new-popular-products.json');

const TARGET_TOTAL = 500;
const incoming = JSON.parse(fs.readFileSync(newPath, 'utf8'));

const rawFile = fs.readFileSync(rawPath, 'utf8');
const match = rawFile.match(/(const productsDatabaseRaw = )(\[[\s\S]*\])(;)/);
if (!match) throw new Error('Cannot parse products-data-raw.js');

const db = JSON.parse(match[2]);
const names = new Set(db.map((p) => p.name.toLowerCase()));

let added = 0;
for (const np of incoming) {
    if (names.has(np.name.toLowerCase())) {
        console.warn('Pominięto (już w bazie):', np.name);
        continue;
    }
    if (db.length >= TARGET_TOTAL) break;
    db.push(np);
    names.add(np.name.toLowerCase());
    added++;
}

fs.writeFileSync(rawPath, `${match[1]}${JSON.stringify(db)}${match[3]}\n`, 'utf8');
console.log(`Dodano ${added} produktów. Razem w bazie: ${db.length} (cel: ${TARGET_TOTAL}).`);

if (db.length < TARGET_TOTAL) {
    console.warn(`Brakuje ${TARGET_TOTAL - db.length} produktów do celu ${TARGET_TOTAL}.`);
}
