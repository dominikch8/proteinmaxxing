/**
 * Mocny detektor duplikatów „miękkich” (l. mnoga, nawiasy, kolejność, warianty)
 * między scripts/new-products-200.json a bazą js/products-data-raw.js.
 * Raport → chat/_dupcore.txt
 * Uruchom: node scripts/_dupcheck.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const arr = JSON.parse(fs.readFileSync(path.join(root, 'scripts', 'new-products-200.json'), 'utf8'));
const raw = fs.readFileSync(path.join(root, 'js', 'products-data-raw.js'), 'utf8');
const db = JSON.parse(raw.slice(raw.indexOf('['), raw.lastIndexOf('];') + 1));

const DIACRITICS = /[\u0300-\u036f]/g;

function fold(s) {
    return String(s).toLowerCase().normalize('NFD').replace(DIACRITICS, '')
        .replace(/ł/g, 'l').replace(/ą/g, 'a').replace(/ć/g, 'c').replace(/ę/g, 'e')
        .replace(/ń/g, 'n').replace(/ó/g, 'o').replace(/ś/g, 's').replace(/ź/g, 'z').replace(/ż/g, 'z');
}

/** Kandydaci na formę pojedynczą (heurystyka PL). */
function singular(t) {
    const out = new Set([t]);
    const add = (x) => out.add(x);
    if (t.endsWith('ie')) add(t.slice(0, -2) + 'a');
    if (t.endsWith('i')) add(t.slice(0, -1));
    if (t.endsWith('y')) add(t.slice(0, -1));
    if (t.endsWith('e')) add(t.slice(0, -1));
    if (t.endsWith('a')) add(t.slice(0, -1));
    if (t.endsWith('ki')) add(t.slice(0, -2) + 'ek');
    if (t.endsWith('ki')) add(t.slice(0, -2) + 'ka');
    return [...out];
}

/** Zbiór tokenów rdzenia + tokeny z nawiasów; dodatkowo każdy token w wariantach. */
function norm(name) {
    const folded = fold(name);
    const parens = [...folded.matchAll(/\(([^)]*)\)/g)].map((m) => m[1]).join(' ');
    const core = folded.replace(/\([^)]*\)/g, ' ');
    const toks = core.replace(/[^a-z0-9%,]+/g, ' ').split(/\s+/).filter(Boolean);
    const parenToks = parens.replace(/[^a-z0-9%,]+/g, ' ').split(/\s+/).filter(Boolean);
    return { core, toks, parenToks };
}

function overlap(a, b) {
    const A = new Set(a), B = new Set(b);
    let inter = 0;
    for (const t of A) if (B.has(t)) inter++;
    const union = new Set([...A, ...B]).size || 1;
    return inter / union;
}

/** Czy tokeny pasują (identyczne albo jedna forma jest wariantem plur/sing drugiej). */
function tokEq(a, b) {
    if (a === b) return true;
    const sa = singular(a), sb = singular(b);
    return sa.some((x) => sb.includes(x));
}

function sameSet(a, b) {
    if (a.length !== b.length) return false;
    const B = new Set(b);
    return a.every((t) => B.has(t));
}

const baseIndex = db.map((p) => ({ name: p.name, n: norm(p.name) }));

const rows = [];
for (const p of arr) {
    const e = norm(p.name);
    const hits = [];
    for (const b of baseIndex) {
        const s = b.n;
        // 1) identyczne rdzenie
        if (sameSet(e.toks, s.toks)) { hits.push(['IDENTYCZNY-RDZEN', b.name]); continue; }
        // 2) jeden rdzeń zawiera drugi (podzbiór tokenów)
        const eSub = e.toks.every((t) => s.toks.some((x) => tokEq(t, x)));
        const sSub = s.toks.every((t) => e.toks.some((x) => tokEq(t, x)));
        if (eSub || sSub) { hits.push(['PODZBIOR', b.name]); continue; }
        // 3) wysoka zbieżność tokenów
        if (overlap(e.toks, s.toks) >= 0.6) { hits.push(['PODOBNY', b.name]); continue; }
    }
    if (hits.length) rows.push({ name: p.name, category: p.category, hits });
}

const lines = [`# Kolizje z bazą: ${rows.length} / ${arr.length}`, ''];
for (const r of rows) {
    lines.push(`${r.category}\t${r.name}`);
    for (const [kind, b] of r.hits.slice(0, 4)) lines.push(`    [${kind}] ${b}`);
}
fs.writeFileSync('C:/Users/Administrator xD/.cline/data/workspaces/chat/_dupcore.txt', lines.join('\n'), 'utf8');
console.log(`Kolizje: ${rows.length} / ${arr.length}`);
