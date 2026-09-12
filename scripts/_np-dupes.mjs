/**
 * Wykrywa duplikaty „miękkie” (case, nawiasy, kolejność słów) w new-products-200.json
 * oraz kolizje z bazą. Raport → chat/_np-soft-dupes.txt
 * Uruchom: node scripts/_np-dupes.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const arr = JSON.parse(fs.readFileSync(path.join(root, 'scripts', 'new-products-200.json'), 'utf8'));
const raw = fs.readFileSync(path.join(root, 'js', 'products-data-raw.js'), 'utf8');
const db = JSON.parse(raw.slice(raw.indexOf('['), raw.lastIndexOf('];') + 1));

function norm(name) {
    let s = String(name)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/ą/g, 'a').replace(/ć/g, 'c').replace(/ę/g, 'e').replace(/ł/g, 'l')
        .replace(/ń/g, 'n').replace(/ó/g, 'o').replace(/ś/g, 's').replace(/ź/g, 'z').replace(/ż/g, 'z');
    s = s.replace(/\([^)]*\)/g, ' ');           // usuń nawiasy
    s = s.replace(/[^a-z0-9]+/g, ' ');          // interpunkcja → spacja
    const toks = s.split(/\s+/).filter(Boolean).sort();
    return toks.join(' ');
}

const byNorm = new Map();
for (const p of arr) {
    const k = norm(p.name);
    if (!byNorm.has(k)) byNorm.set(k, []);
    byNorm.get(k).push(p);
}

const baseNorm = new Map();
for (const p of db) {
    const k = norm(p.name);
    if (!baseNorm.has(k)) baseNorm.set(k, []);
    baseNorm.get(k).push(p);
}

const lines = [];
lines.push('== Duplikaty miękkie w pliku ==');
for (const [k, list] of byNorm) {
    if (list.length > 1) lines.push(list.map((p) => p.name).join('  <=>  '));
}
lines.push('');
lines.push('== Kolizje z bazą (miękkie) ==');
for (const p of arr) {
    const k = norm(p.name);
    if (baseNorm.has(k)) lines.push(`${p.name}  <=>  ${baseNorm.get(k).map((x) => x.name).join(', ')}`);
}
lines.push('');
lines.push('== Podejrzane pary (wspólny pierwszy token, oba w pliku) ==');
const firstTok = new Map();
for (const p of arr) {
    const t = norm(p.name).split(' ')[0];
    if (!firstTok.has(t)) firstTok.set(t, []);
    firstTok.get(t).push(p.name);
}
for (const [t, list] of firstTok) {
    if (list.length > 1) lines.push(`${t}: ${list.join(' | ')}`);
}

const out = lines.join('\n');
fs.writeFileSync('C:/Users/Administrator xD/.cline/data/workspaces/chat/_np-soft-dupes.txt', out, 'utf8');
console.log(out);
