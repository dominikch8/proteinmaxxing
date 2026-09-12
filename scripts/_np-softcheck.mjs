/** Wykrywa kolizje case-insensitive i near-duplikaty nowych produktów z bazą i w pliku. */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const arr = JSON.parse(fs.readFileSync(path.join(root, 'scripts', 'new-products-200.json'), 'utf8'));
const raw = fs.readFileSync(path.join(root, 'js', 'products-data-raw.js'), 'utf8');
const db = JSON.parse(raw.slice(raw.indexOf('['), raw.lastIndexOf('];') + 1));

const norm = (s) => String(s).toLowerCase().replace(/\s+/g, ' ').trim();
const strip = (s) => norm(s).replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s+/g, ' ').trim();

const baseNames = new Map(db.map((p) => [norm(p.name), p.name]));
const baseStrip = new Map();
for (const p of db) baseStrip.set(strip(p.name), p.name);

console.log('== Kolizje dokładne case-insensitive z bazą ==');
for (const p of arr) if (baseNames.has(norm(p.name))) console.log(` ${p.name} <=> ${baseNames.get(norm(p.name))}`);

console.log('\n== Kolizje po usunięciu nawiasów z bazą ==');
for (const p of arr) if (baseStrip.has(strip(p.name))) console.log(` ${p.name} <=> ${baseStrip.get(strip(p.name))}`);

console.log('\n== Kolizje po usunięciu nawiasów w pliku ==');
const byStrip = new Map();
for (const p of arr) {
    const k = strip(p.name);
    if (byStrip.has(k)) console.log(` ${p.name} <=> ${byStrip.get(k)}`);
    else byStrip.set(k, p.name);
}
