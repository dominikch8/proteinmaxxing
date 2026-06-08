/**
 * Boczne sloty reklam + layout 3-kolumnowy.
 * Uruchom: node scripts/patch-ad-rails.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildSiteLayoutOpen, buildSiteLayoutClose, buildAdRailsScript } from './site-ad-rails-html.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const LAYOUT_MARKER = 'class="site-layout"';
const HEAD_ZONES_TO_REMOVE = ['11118313', '11118646'];

const SKIP_FILES = new Set(['admin-zgloszenia.html', 'informacje.html']);
const SKIP_DIRS = new Set(['node_modules', '.git', 'domains']);

function walkHtml(dir, list = []) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) {
            if (SKIP_DIRS.has(e.name)) continue;
            walkHtml(p, list);
        } else if (e.name.endsWith('.html')) {
            list.push(p);
        }
    }
    return list;
}

function stripHeadRailZones(html) {
    let out = html;
    for (const zone of HEAD_ZONES_TO_REMOVE) {
        const re = new RegExp(
            `\\s*<script>\\(function\\(s\\)\\{s\\.dataset\\.zone='${zone}'[\\s\\S]*?</script>\\s*`,
            'gi'
        );
        out = out.replace(re, '\n');
    }
    return out;
}

function ensureAdRailsCss(html) {
    if (html.includes('site-ad-rails.css')) return html;
    return html.replace(
        /(<link rel="stylesheet" href="(?:\.\.\/)?css\/(?:site|product-page)\.css">\s*)/i,
        `$1    <link rel="stylesheet" href="${
            html.includes('../css/site.css') || html.includes('../css/product-page.css') ? '../' : ''
        }css/site-ad-rails.css">\n`
    );
}

function ensureAdRailsScript(html, prefix) {
    if (html.includes('site-ad-rails.js')) return html;
    const snippet = buildAdRailsScript(prefix);
    if (html.includes(`${prefix}js/theme.js`)) {
        return html.replace(`<script src="${prefix}js/theme.js"></script>`, `${snippet}\n<script src="${prefix}js/theme.js"></script>`);
    }
    return html.replace('</body>', `${snippet}\n</body>`);
}

function wrapContent(html) {
    if (html.includes(LAYOUT_MARKER)) return html;

    const open = buildSiteLayoutOpen();
    const close = buildSiteLayoutClose();

    if (/<div class="page-container">/i.test(html)) {
        html = html.replace(/(\s*)<div class="page-container">/i, `${open}$1<div class="page-container">`);
    } else if (/<main class="product-page">/i.test(html)) {
        html = html.replace(/(\s*)<main class="product-page">/i, `${open}$1<main class="product-page">`);
    } else {
        return null;
    }

    const footerRe = /(<footer class="site-footer">[\s\S]*?<\/footer>)/i;
    if (!footerRe.test(html)) return null;
    html = html.replace(footerRe, `$1\n${close}`);
    return html;
}

let changed = 0;
let skipped = 0;

for (const fp of walkHtml(root)) {
    const rel = path.relative(root, fp).replace(/\\/g, '/');
    if (SKIP_FILES.has(rel)) {
        skipped++;
        continue;
    }

    let html = fs.readFileSync(fp, 'utf8');
    const prefix = rel.startsWith('produkty/') ? '../' : '';

    const before = html;
    html = stripHeadRailZones(html);
    html = ensureAdRailsCss(html);
    const wrapped = wrapContent(html);
    if (wrapped === null) {
        console.warn('Pominięto (brak page-container/product-page lub stopki):', rel);
        skipped++;
        continue;
    }
    html = wrapped;
    html = ensureAdRailsScript(html, prefix);

    if (html !== before) {
        fs.writeFileSync(fp, html, 'utf8');
        changed++;
    }
}

console.log(`Boczne sloty reklam: zaktualizowano ${changed} plików, pominięto ${skipped}.`);
