import fs from 'fs';
import path from 'path';

const root = process.cwd();
const skip = new Set(['node_modules', '.git', '.github', '.cursor', 'domains', 'deploy-bundle']);
const out = [];

function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        if (skip.has(e.name)) continue;
        const p = path.join(d, e.name);
        if (e.isDirectory()) { walk(p); continue; }
        if (!/\.(html|js|mjs|php)$/.test(e.name)) continue;
        let s = '';
        try { s = fs.readFileSync(p, 'utf8'); } catch { continue; }
        if (/articles-pagination|buildPageNumbers|articlesPagination/.test(s)) {
            out.push('=== ' + path.relative(root, p).replace(/\\/g, '/'));
            s.split(/\r?\n/).forEach((line, i) => {
                if (/buildPageNumbers|ellipsis|previousPage|articles-pagination|articlesPagination/.test(line)) {
                    out.push((i + 1) + ': ' + line.trim().slice(0, 160));
                }
            });
        }
    }
}
walk(root);
fs.writeFileSync('C:/Temp/SCAN.txt', out.join('\n') + '\n');
console.log('done ' + out.length);
