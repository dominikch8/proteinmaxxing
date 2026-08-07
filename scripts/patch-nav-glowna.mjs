/**
 * Insert "Główna" as first nav item; point logos/nav to /glowna
 * (dedicated URL — bypasses browsers that cached old 301 / → /dieta).
 * node scripts/patch-nav-glowna.mjs
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

function homeHref(prefix) {
    return `${prefix}glowna`;
}

function glownaLi(prefix, active) {
    const href = homeHref(prefix);
    if (active) {
        return `<li><a class="nav-link active" href="${href}" aria-current="page">Główna</a></li>`;
    }
    return `<li><a class="nav-link" href="${href}">Główna</a></li>`;
}

function patch(html, rel) {
    let out = html;
    const prefix = prefixFor(rel);
    const isHome =
        rel === 'index.html' ||
        rel === 'glowna.html' ||
        rel === 'deploy-bundle/index.html' ||
        rel === 'deploy-bundle/glowna.html';
    const isProduct = (rel.includes('/produkty/') || rel.startsWith('produkty/')) && !rel.includes('/kategoria/');
    const home = homeHref(prefix);

    // Logo → Główna (/glowna)
    if (isProduct) {
        out = out.replace(/(<a class="logo" href=")[^"]*(")/g, `$1../glowna$2`);
        out = out.replace(/(<a href=")[^"]*(" class="logo")/g, `$1../glowna$2`);
    } else if (prefix === '../../') {
        out = out.replace(/(<a href=")[^"]*(" class="logo")/g, `$1../../glowna$2`);
        out = out.replace(/(<a class="logo" href=")[^"]*(")/g, `$1../../glowna$2`);
    } else if (prefix === '../') {
        out = out.replace(/(<a href=")[^"]*(" class="logo")/g, `$1../glowna$2`);
        out = out.replace(/(<a class="logo" href=")[^"]*(")/g, `$1../glowna$2`);
    } else {
        out = out.replace(/(<a href=")(?:dieta|\/|index\.html|glowna)(" class="logo")/g, `$1${home}$2`);
        out = out.replace(/(<a class="logo" href=")(?:dieta|\/|index\.html|glowna)(")/g, `$1${home}$2`);
    }

    if (!out.includes('class="nav-links"') && !out.includes("class='nav-links'")) {
        return out;
    }

    // Already has Główna?
    if (/nav-link[^>]*>Główna<\/a>/.test(out)) {
        // ensure order: Główna before Dieta
        out = out.replace(
            /(<li>\s*<a class="nav-link[^"]*"[^>]*>Dieta<\/a>\s*<\/li>)\s*(<li>\s*<a class="nav-link[^"]*"[^>]*>Główna<\/a>\s*<\/li>)/g,
            '$2\n                $1'
        );
        return out;
    }

    // Insert Główna before Dieta nav item
    out = out.replace(
        /(<ul class="nav-links"[^>]*>)\s*(<li>\s*<a class="nav-link[^"]*"[^>]*>Dieta<\/a>\s*<\/li>)/,
        `$1\n                ${glownaLi(prefix, isHome)}\n                $2`
    );

    // Fallback: before first nav-link li
    if (!/nav-link[^>]*>Główna<\/a>/.test(out)) {
        out = out.replace(
            /(<ul class="nav-links"[^>]*>)\s*(<li>)/,
            `$1\n                ${glownaLi(prefix, isHome)}\n                $2`
        );
    }

    return out;
}

let n = 0;
for (const fp of walk(root)) {
    const rel = path.relative(root, fp).replace(/\\/g, '/');
    if (rel === 'index.html' || rel === 'deploy-bundle/index.html') continue; // already correct
    const before = fs.readFileSync(fp, 'utf8');
    const after = patch(before, rel);
    if (after !== before) {
        fs.writeFileSync(fp, after);
        n += 1;
    }
}
console.log(`Inserted Główna nav / home logos in ${n} HTML files.`);
