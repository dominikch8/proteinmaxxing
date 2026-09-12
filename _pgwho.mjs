import fs from 'fs';
import path from 'path';

const root = process.cwd();
const out = [];
const SKIP = new Set(['node_modules', '.git', '.github', 'domains']);

function walk(dir, acc) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        if (SKIP.has(e.name)) continue;
        const fp = path.join(dir, e.name);
        if (e.isDirectory()) walk(fp, acc);
        else acc.push(fp);
    }
    return acc;
}

const files = walk(root, []);

// 1) Any script that WRITES an HTML file (writeFileSync with .html) — regeneration risk
out.push('=== WRITERS of .html ===');
for (const f of files) {
    if (!/\.(mjs|js|cjs)$/i.test(f)) continue;
    if (/\.min\.js$/i.test(f)) continue;
    let t = '';
    try { t = fs.readFileSync(f, 'utf8'); } catch { continue; }
    if (/writeFileSync\([^\n]*\.html/i.test(t) || /\.html['"`]\s*,\s*(html|content|body|page)/i.test(t)) {
        const rel = path.relative(root, f);
        const hits = (t.match(/writeFileSync[^\n]*\.html/gi) || []).length;
        out.push('  ' + rel + '  (writeFileSync(.html) x' + hits + ')');
    }
}

// 2) Any file containing pagination-ish strings
out.push('=== FILES with pagination markers ===');
const marks = ['pagination', 'articlesPagination', 'ellipsis', '\u2026', 'Strona ', 'pageNumber', 'currentPage'];
for (const f of files) {
    if (!/\.(mjs|js|cjs|html|php|css)$/i.test(f)) continue;
    if (f.includes('node_modules')) continue;
    let t = '';
    try { t = fs.readFileSync(f, 'utf8'); } catch { continue; }
    const found = marks.filter((m) => t.includes(m));
    if (found.length) out.push('  ' + path.relative(root, f) + ' -> ' + found.join(','));
}

fs.writeFileSync(path.join(process.env.TEMP, 'pgwho.txt'), out.join('\n') + '\n');
console.log(out.join('\n'));
