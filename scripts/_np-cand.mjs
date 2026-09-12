/** Sprawdza kandydatów na zamienniki: czy istnieją w bazie lub w new-products-200.json. */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const raw = fs.readFileSync(path.join(root, 'js', 'products-data-raw.js'), 'utf8');
const db = JSON.parse(raw.slice(raw.indexOf('['), raw.lastIndexOf('];') + 1));
const np = JSON.parse(fs.readFileSync(path.join(root, 'scripts', 'new-products-200.json'), 'utf8'));

const cand = process.argv.slice(2);
const norm = (s) => String(s).toLowerCase().trim();
const baseMap = new Map(db.map((p) => [norm(p.name), p.name]));
const npSet = new Set(np.map((p) => norm(p.name)));

for (const c of cand) {
    const k = norm(c);
    console.log(`${c}\tbase:${baseMap.get(k) || '-'}\tnew200:${npSet.has(k) ? 'TAK' : '-'}`);
}
// też pokaż istniejące nazwy zawierające token
console.log('\n-- pasujące w bazie --');
for (const c of cand) {
    const tok = norm(c).split(/\s+/)[0];
    const hits = db.filter((p) => norm(p.name).includes(tok)).map((p) => p.name);
    console.log(`${c} -> ${hits.slice(0, 12).join(' | ') || 'brak'}`);
}
