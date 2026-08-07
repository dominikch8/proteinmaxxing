/**
 * Fix Główna nav: use /glowna (bypasses cached 301 / → /dieta).
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

// Build / sync glowna.html from index.html
let home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
home = home
    .replace(
        /<link rel="canonical" href="https:\/\/proteiner\.pl\/(?:glowna)?">/,
        '<link rel="canonical" href="https://proteiner.pl/">'
    )
    .replace(
        /href="\/"(?= aria-current="page">Główna)/g,
        'href="glowna"'
    )
    .replace(/href="\/"(?=>Główna)/g, 'href="glowna"')
    .replace(/(<a href=")\/(" class="logo")/g, '$1glowna$2')
    .replace(/(<a class="logo" href=")\/(")/g, '$1glowna$2');
fs.writeFileSync(path.join(root, 'glowna.html'), home);
fs.writeFileSync(path.join(root, 'index.html'), home);
console.log('Wrote glowna.html + updated index.html logos/nav');

let n = 0;
for (const fp of walk(root)) {
    const rel = path.relative(root, fp).replace(/\\/g, '/');
    if (rel === 'index.html' || rel === 'glowna.html') continue;
    if (rel === 'deploy-bundle/index.html' || rel === 'deploy-bundle/glowna.html') continue;

    let html = fs.readFileSync(fp, 'utf8');
    const before = html;
    const p = prefixFor(rel);
    const target = `${p}glowna`;

    html = html.replace(
        /(<a class="nav-link(?: active)?" href=")(?:\/|\.\.\/(?:\.\.\/)?|index\.html)?("(?: aria-current="page")?>Główna<\/a>)/g,
        `$1${target}$2`
    );
    html = html.replace(
        /(<a class="nav-link(?: active)?" href=")(?:\/|index\.html)("(?: aria-current="page")?>Główna<\/a>)/g,
        `$1${target}$2`
    );

    // Logos that go to / or dieta → glowna (pages with full nav)
    if (html.includes('nav-links')) {
        html = html.replace(/(<a href=")(?:\/|dieta|index\.html)(" class="logo")/g, `$1${target}$2`);
        html = html.replace(/(<a class="logo" href=")(?:\/|dieta|index\.html)(")/g, `$1${target}$2`);
        html = html.replace(/(<a href=")(?:\.\.\/(?:\.\.\/)?)(" class="logo")/g, `$1${target}$2`);
        html = html.replace(/(<a class="logo" href=")(?:\.\.\/(?:\.\.\/)?)(")/g, `$1${target}$2`);
        html = html.replace(/(<a href=")[^"]*glowna(" class="logo")/g, `$1${target}$2`);
        html = html.replace(/(<a class="logo" href=")[^"]*glowna(")/g, `$1${target}$2`);
    }

    if (html !== before) {
        fs.writeFileSync(fp, html);
        n += 1;
    }
}
console.log(`Retargeted Główna links in ${n} HTML files.`);
