/**
 * Buduje liste slugow "nowych" produktow (z add-products-1000.mjs + new-products-200.json),
 * dopasowujac do bazy po nazwie. Zapisuje scripts/_new-products-regen.json.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

// 1) nazwy z add-products-1000.mjs (tuple [name, ...])
const addSrc = fs.readFileSync(path.join(root, 'scripts', 'add-products-1000.mjs'), 'utf8');
const names1000 = [...addSrc.matchAll(/\['([^']+)',/g)].map((m) => m[1]);

// 2) nazwy z new-products-200.json
let names200 = [];
try {
    const j = JSON.parse(fs.readFileSync(path.join(root, 'scripts', 'new-products-200.json'), 'utf8'));
    const arr = Array.isArray(j) ? j : j.products || j.items || [];
    names200 = arr.map((x) => x.name || x).filter(Boolean);
} catch (e) {
    console.log('new-products-200.json skip:', e.message);
}

const allNewNames = new Set([...names1000, ...names200]);
console.log('unikalne nowe nazwy (raw):', allNewNames.size);

// 3) baza
const src = fs.readFileSync(path.join(root, 'js', 'products-data-raw.js'), 'utf8');
const i = src.indexOf('productsDatabaseRaw');
const raw = JSON.parse(src.slice(src.indexOf('[', i), src.lastIndexOf('];') + 1));

// dopasowanie po nazwie (normalizacja: trim, collapse whitespace)
const norm = (s) => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();
const nameToProducts = new Map();
for (const p of raw) {
    const k = norm(p.name);
    if (!nameToProducts.has(k)) nameToProducts.set(k, []);
    nameToProducts.get(k).push(p);
}

const matched = [];
const unmatched = [];
for (const n of allNewNames) {
    const hits = nameToProducts.get(norm(n));
    if (hits && hits.length) {
        for (const h of hits) matched.push({ name: h.name, slug: h.slug, category: h.category });
    } else {
        unmatched.push(n);
    }
}

// dedup po slug
const bySlug = new Map();
for (const m of matched) bySlug.set(m.slug, m);
const final = [...bySlug.values()];

console.log('dopasowane produkty (unikalnych slugow):', final.length);
console.log('niedopasowane nazwy:', unmatched.length, unmatched.slice(0, 10).join(' | '));

fs.writeFileSync(path.join(root, 'scripts', '_new-products-regen.json'), JSON.stringify(final, null, 2));
console.log('zapisano scripts/_new-products-regen.json');
