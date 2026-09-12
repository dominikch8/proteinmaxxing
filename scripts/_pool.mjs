/**
 * Inwentaryzacja puli kandydatów (do zamiany duplikatów) — ile unikalnych
 * względem bazy i względem new-products-200.json.
 * Raport → chat/_pool.txt
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const sd = path.join(root, 'scripts');

const raw = fs.readFileSync(path.join(root, 'js', 'products-data-raw.js'), 'utf8');
const db = JSON.parse(raw.slice(raw.indexOf('['), raw.lastIndexOf('];') + 1));
const baseNames = new Set(db.map((p) => p.name));

const current = JSON.parse(fs.readFileSync(path.join(sd, 'new-products-200.json'), 'utf8'));
const curNames = new Set(current.map((p) => p.name));

function fold(s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/ł/g, 'l').replace(/ą/g, 'a').replace(/ć/g, 'c').replace(/ę/g, 'e')
        .replace(/ń/g, 'n').replace(/ó/g, 'o').replace(/ś/g, 's').replace(/ź/g, 'z').replace(/ż/g, 'z');
}
function key(name) {
    const f = fold(name).replace(/\([^)]*\)/g, ' ');
    const toks = f.replace(/[^a-z0-9%]+/g, ' ').split(/\s+/).filter(Boolean).map((t) => {
        let x = t;
        if (x.endsWith('ie')) x = x.slice(0, -2) + 'a';
        else if (/[iy]$/.test(x)) x = x.slice(0, -1);
        else if (x.endsWith('e')) x = x.slice(0, -1);
        return x;
    }).sort();
    return toks.join(' ');
}
const baseKeys = new Set(db.map((p) => key(p.name)));
const curKeys = new Set(current.map((p) => key(p.name)));

const pools = fs.readdirSync(sd).filter((f) => /^(_batch\d+\.mjs|_np-more\.json|new-products-batch.*\.json|_np-b\d+\.json|new-products-200\.jsonl)$/.test(f));
const lines = [];
const all = [];

for (const f of pools) {
    let objs = [];
    const txt = fs.readFileSync(path.join(sd, f), 'utf8');
    if (f.endsWith('.json')) {
        try { objs = JSON.parse(txt); } catch { lines.push(`PARSE FAIL ${f}`); continue; }
    } else if (f.endsWith('.jsonl')) {
        objs = txt.split(/\r?\n/).filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
    } else {
        for (const line of txt.split(/\r?\n/)) {
            const t = line.trim().replace(/,$/, '');
            if (!t.startsWith('{"name"')) continue;
            try { objs.push(JSON.parse(t)); } catch { /* */ }
        }
    }
    const uniq = [];
    for (const o of objs) {
        if (!o || !o.name || o.name === '__NEXT__') continue;
        if (baseNames.has(o.name) || curNames.has(o.name)) continue;
        if (baseKeys.has(key(o.name)) || curKeys.has(key(o.name))) continue;
        uniq.push(o);
    }
    lines.push(`${f}: total ${objs.length}, unikalne-vs-baza-i-200: ${uniq.length}`);
    for (const o of uniq) all.push({ src: f, ...o });
}

// dedup wśród puli
const seen = new Set();
const finalPool = [];
for (const o of all) {
    const k = key(o.name);
    if (seen.has(k)) continue;
    seen.add(k);
    finalPool.push(o);
}

lines.push('');
lines.push(`== UNIKALNA PULA RAZEM: ${finalPool.length} ==`);
for (const o of finalPool) lines.push(`${o.src}\t${o.category}\t${o.name}`);

fs.writeFileSync('C:/Users/Administrator xD/.cline/data/workspaces/chat/_pool.txt', lines.join('\n'), 'utf8');
console.log(`Pula: ${finalPool.length}`);
