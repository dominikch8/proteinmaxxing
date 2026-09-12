/**
 * Scala scripts/new-products-200.json (partia bazowa) z scripts/_np-more.json
 * w finalny scripts/new-products-200.json (deduplikacja po nazwie, też względem bazy).
 * Uruchom: node scripts/_merge-np.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const rawPath = path.join(root, 'js', 'products-data-raw.js');
const basePath = path.join(root, 'scripts', 'new-products-200.json');
const morePath = path.join(root, 'scripts', '_np-more.json');

const raw = fs.readFileSync(rawPath, 'utf8');
const db = JSON.parse(raw.slice(raw.indexOf('['), raw.lastIndexOf('];') + 1));
const existing = new Set(db.map((p) => p.name));

const out = JSON.parse(fs.readFileSync(basePath, 'utf8'));
const seen = new Set(out.map((p) => p.name));
const skipped = [];

let added = 0;
if (fs.existsSync(morePath)) {
    const more = JSON.parse(fs.readFileSync(morePath, 'utf8'));
    for (const obj of more) {
        if (!obj || !obj.name) continue;
        if (existing.has(obj.name) || seen.has(obj.name)) { skipped.push(obj.name); continue; }
        seen.add(obj.name);
        out.push(obj);
        added++;
    }
}

fs.writeFileSync(basePath, JSON.stringify(out, null, 0).replace(/\},\{/g, '},\n{'), 'utf8');

const byCat = {};
for (const p of out) byCat[p.category] = (byCat[p.category] || 0) + 1;
console.log(`Razem w JSON: ${out.length} (+${added} z _np-more)`);
console.log('Kategorie:', JSON.stringify(byCat));
if (skipped.length) console.log('Pominięte duplikaty:', skipped.join(' | '));
