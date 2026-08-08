/**
 * Fix Główna nav: strona główna = / (proteiner.pl).
 * node scripts/fix-glowna-links.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP = new Set(['node_modules', '.git', '.github', '.cursor', 'domains']);

function walk(dir, list = []) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) {
            if (SKIP.has(e.name)) continue;
            walk(p, list);
        } else if (e.name.endsWith('.html')) list.push(p);
    }
    return list;
}

function prefixFor(rel) {
    if (rel.includes('/produkty/kategoria/') || rel.startsWith('produkty/kategoria/')) return '../../';
    if (rel.includes('/produkty/') || rel.startsWith('produkty/')) return '../';
    return '';
}

// index.html — home pod /
let home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
home = home
    .replace(
        /<link rel="canonical" href="https:\/\/proteiner\.pl\/(?:glowna)?">/,
        '<link rel="canonical" href="https://proteiner.pl/">'
    )
    .replace(/href="glowna"/g, 'href="/"')
    .replace(/href="\/glowna"/g, 'href="/"')
    .replace(/(<a href=")\/(" class="logo")/g, '$1/$2')
    .replace(/(<a class="logo" href=")\/(")/g, '$1/$2');
fs.writeFileSync(path.join(root, 'index.html'), home);

for (const rel of ['glowna.html', 'deploy-bundle/glowna.html']) {
    const fp = path.join(root, rel);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
}
console.log('Updated index.html; removed glowna.html');

let n = 0;
for (const fp of walk(root)) {
    const rel = path.relative(root, fp).replace(/\\/g, '/');
    if (rel === 'index.html') continue;

    let html = fs.readFileSync(fp, 'utf8');
    const before = html;
    const target = '/';

    html = html.replace(
        /(<a class="nav-link(?: active)?" href=")(?:\/|\.\.\/(?:\.\.\/)?|index\.html|glowna|\/glowna)?("(?: aria-current="page")?>Główna<\/a>)/g,
        `$1${target}$2`
    );

    if (html.includes('nav-links')) {
        html = html.replace(/(<a href=")(?:\/|dieta|index\.html|glowna|\/glowna|\.\.\/(?:\.\.\/)?)(" class="logo")/g, `$1${target}$2`);
        html = html.replace(/(<a class="logo" href=")(?:\/|dieta|index\.html|glowna|\/glowna|\.\.\/(?:\.\.\/)?)(")/g, `$1${target}$2`);
    }

    html = html.replace(/(<a href=")(?:\.\.\/\.\.\/|\.\.\/)?glowna(">Strona główna<\/a>)/g, `$1${target}$2');

    if (html !== before) {
        fs.writeFileSync(fp, html);
        n += 1;
    }
}
console.log(`Retargeted Główna links in ${n} HTML files.`);
