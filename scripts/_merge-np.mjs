/**
 * Scala partie scripts/_batch*.mjs do scripts/new-products-200.json
 * (deduplikacja po nazwie, także względem bazy products-data-raw.js).
 * Uruchom: node scripts/_merge-np.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const rawPath = path.join(root, 'js', 'products-data-raw.js');
const outPath = path.join(root, 'scripts', 'new-products-200.json');

const raw = fs.readFileSync(rawPath, 'utf8');
const db = JSON.parse(raw.slice(raw.indexOf('['), raw.lastIndexOf('];') + 1));
const existing = new Set(db.map((p) => p.name));

const out = JSON.parse(fs.readFileSync(outPath, 'utf8'));
const seen = new Set(out.map((p) => p.name));
const skipped = [];

const batchFiles = fs.readdirSync(path.join(root, 'scripts'))
    .filter((f) => /^_batch\d+\.mjs$/.test(f))
    .sort();
let addedBatch = 0;
for (const bf of batchFiles) {
    const b2 = fs.readFileSync(path.join(root, 'scripts', bf), 'utf8');
    for (const line of b2.split(/\r?\n/)) {
        const t = line.trim().replace(/,$/, '');
        if (!t.startsWith('{"name"')) continue;
        let obj;
        try { obj = JSON.parse(t); } catch { skipped.push('BLAD JSON(' + bf + '): ' + t.slice(0, 40)); continue; }
        if (existing.has(obj.name) || seen.has(obj.name)) { skipped.push(obj.name); continue; }
        seen.add(obj.name);
        out.push(obj);
        addedBatch++;
    }
}

fs.writeFileSync(outPath, '[\n' + out.map((p) => JSON.stringify(p)).join(',\n') + '\n]\n', 'utf8');

const byCat = {};
for (const p of out) byCat[p.category] = (byCat[p.category] || 0) + 1;
console.log('Razem w JSON: ' + out.length + ' (+' + addedBatch + ' z _batch*)');
console.log('Kategorie: ' + JSON.stringify(byCat));
if (skipped.length) console.log('Pominiete: ' + skipped.join(' | '));
