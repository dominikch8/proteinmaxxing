/**
 * Scala linie z scripts/_batch2.mjs do scripts/new-products-200.json
 * (deduplikacja po nazwie — względem bazy i już zapisanych wpisów).
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

const out = fs.existsSync(outPath) ? JSON.parse(fs.readFileSync(outPath, 'utf8')) : [];
const seen = new Set(out.map((p) => p.name));

const batch = fs.readFileSync(path.join(root, 'scripts', '_batch2.mjs'), 'utf8');
let added = 0;
const skipped = [];
for (const line of batch.split(/\r?\n/)) {
    const t = line.trim().replace(/,$/, '');
    if (!t.startsWith('{"name"')) continue;
    let obj;
    try { obj = JSON.parse(t); } catch { skipped.push('BŁĄD JSON: ' + t.slice(0, 50)); continue; }
    if (existing.has(obj.name) || seen.has(obj.name)) { skipped.push(obj.name); continue; }
    seen.add(obj.name);
    out.push(obj);
    added += 1;
}

fs.writeFileSync(outPath, JSON.stringify(out, null, 0).replace(/\},\{/g, '},\n{'), 'utf8');

const byCat = {};
for (const p of out) byCat[p.category] = (byCat[p.category] || 0) + 1;
console.log(`Razem w JSON: ${out.length} (+${added} nowych)`);
console.log('Kategorie:', JSON.stringify(byCat));
if (skipped.length) console.log('Pominięte:', skipped.join(' | '));
