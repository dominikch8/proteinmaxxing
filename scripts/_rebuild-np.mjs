/**
 * ODBUDOWA scripts/new-products-200.json ze wszystkich źródeł:
 *  - new-products-200.jsonl
 *  - new-products-batch*.json
 *  - _np-b*.json
 *  - _batch2.mjs
 *  - _np-more.json
 * Deduplikacja po nazwie (+ względem bazy). Raport → chat/_np-rebuild.txt
 * Uruchom: node scripts/_rebuild-np.mjs [--write]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const scriptsDir = path.join(root, 'scripts');
const reportPath = 'C:/Users/Administrator xD/.cline/data/workspaces/chat/_np-rebuild.txt';

const raw = fs.readFileSync(path.join(root, 'js', 'products-data-raw.js'), 'utf8');
const db = JSON.parse(raw.slice(raw.indexOf('['), raw.lastIndexOf('];') + 1));
const existing = new Set(db.map((p) => p.name));

const out = [];
const seen = new Set();
const dupes = [];
const bySource = {};

function add(obj, src) {
    if (!obj || !obj.name || typeof obj.name !== 'string') return;
    if (obj.name === '__NEXT__') return;
    if (existing.has(obj.name)) { dupes.push(`${obj.name} (baza) <- ${src}`); return; }
    if (seen.has(obj.name)) { dupes.push(`${obj.name} (plik) <- ${src}`); return; }
    seen.add(obj.name);
    out.push(obj);
    bySource[src] = (bySource[src] || 0) + 1;
}

// 1) JSON array files
for (const f of ['new-products-200.json', 'new-products-batch02.json']) {
    const fp = path.join(scriptsDir, f);
    if (!fs.existsSync(fp)) continue;
    try {
        for (const o of JSON.parse(fs.readFileSync(fp, 'utf8'))) add(o, f);
    } catch (e) { dupes.push(`PARSE ${f}: ${e.message}`); }
}

// 2) _np-b*.json parts
for (const f of fs.readdirSync(scriptsDir).filter((x) => /^_np-b\d+\.json$/.test(x)).sort()) {
    try {
        for (const o of JSON.parse(fs.readFileSync(path.join(scriptsDir, f), 'utf8'))) add(o, f);
    } catch (e) { dupes.push(`PARSE ${f}: ${e.message}`); }
}

// 3) _np-more.json
{
    const fp = path.join(scriptsDir, '_np-more.json');
    if (fs.existsSync(fp)) {
        try {
            const j = JSON.parse(fs.readFileSync(fp, 'utf8'));
            for (const o of j) add(o, '_np-more.json');
        } catch (e) { dupes.push(`PARSE _np-more.json: ${e.message}`); }
    }
}

// 4) _batch*.mjs — linie JSON
for (const f of fs.readdirSync(scriptsDir).filter((x) => /^_batch\d+\.mjs$/.test(x)).sort()) {
    const fp = path.join(scriptsDir, f);
    for (const line of fs.readFileSync(fp, 'utf8').split(/\r?\n/)) {
        const t = line.trim().replace(/,$/, '');
        if (!t.startsWith('{"name"')) continue;
        try { add(JSON.parse(t), f); } catch { /* ignore */ }
    }
}

// 5) new-products-200.jsonl
{
    const fp = path.join(scriptsDir, 'new-products-200.jsonl');
    if (fs.existsSync(fp)) {
        for (const line of fs.readFileSync(fp, 'utf8').split(/\r?\n/)) {
            const t = line.trim();
            if (!t) continue;
            try { add(JSON.parse(t), 'new-products-200.jsonl'); } catch { /* ignore */ }
        }
    }
}

const byCat = {};
for (const p of out) byCat[p.category] = (byCat[p.category] || 0) + 1;

const rep = [];
rep.push(`SUMA odbudowanych: ${out.length}`);
rep.push(`Składniki zrodlowe: ${JSON.stringify(bySource)}`);
rep.push(`Kategorie: ${JSON.stringify(byCat)}`);
rep.push('');
for (const [k, v] of Object.entries(byCat)) {
    rep.push(`## ${k} (${v})`);
    rep.push(out.filter((p) => p.category === k).map((p) => p.name).join(' | '));
    rep.push('');
}
rep.push('POMINIETE: ' + dupes.length);
rep.push(dupes.join('\n'));
fs.writeFileSync(reportPath, rep.join('\n'), 'utf8');

if (process.argv.includes('--write')) {
    fs.writeFileSync(path.join(scriptsDir, 'new-products-200.json'), JSON.stringify(out, null, 0), 'utf8');
    rep.unshift('ZAPISANO new-products-200.json');
    fs.writeFileSync(reportPath, rep.join('\n'), 'utf8');
}
console.log('OK ' + out.length);
