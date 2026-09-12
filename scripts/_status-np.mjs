/** Podgląd stanu partii: new-products-200.json + _batch2.mjs. */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const arr = JSON.parse(fs.readFileSync(path.join(root, 'scripts', 'new-products-200.json'), 'utf8'));
const cat = {};
for (const p of arr) (cat[p.category] = cat[p.category] || []).push(p.name);

const b2 = fs.readFileSync(path.join(root, 'scripts', '_batch2.mjs'), 'utf8').split(/\r?\n/);
const b2cat = {};
let bad = 0;
for (const line of b2) {
    const t = line.trim().replace(/,$/, '');
    if (!t.startsWith('{"name"')) continue;
    try {
        const o = JSON.parse(t);
        (b2cat[o.category] = b2cat[o.category] || []).push(o.name);
    } catch { bad++; }
}

const lines = [];
lines.push(`# new-products-200.json: ${arr.length}`);
for (const [k, v] of Object.entries(cat)) lines.push(`## ${k} (${v.length}): ${v.join(' | ')}`);
lines.push('');
lines.push(`# _batch2.mjs: ${Object.values(b2cat).reduce((a, b) => a + b.length, 0)} (bad ${bad})`);
for (const [k, v] of Object.entries(b2cat)) lines.push(`## ${k} (${v.length}): ${v.join(' | ')}`);
fs.writeFileSync('C:/Users/Administrator xD/.cline/data/workspaces/chat/_np-status.txt', lines.join('\n'), 'utf8');
console.log(`new: ${arr.length} | batch2: ${Object.values(b2cat).reduce((a, b) => a + b.length, 0)} | bad: ${bad}`);
