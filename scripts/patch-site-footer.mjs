/**
 * Podmienia stopkę we wszystkich plikach HTML.
 * Uruchom: node scripts/patch-site-footer.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildSiteFooter } from './site-footer-html.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const FOOTER_RE = /<footer class="site-footer">[\s\S]*?<\/footer>/;
const UNIT_RE = /\s*<!-- MediaBoxy Start \| MediaBoxy\.pl -->[\s\S]*?<!-- MediaBoxy Stop \| MediaBoxy\.pl -->\s*/g;
const SIDE_RAIL_RE =
    /\s*<!-- MediaBoxy side rails[\s\S]*?-->\s*<aside class="pm-side-rail[\s\S]*?<\/aside>\s*<aside class="pm-side-rail[\s\S]*?<\/aside>\s*/g;

function walkHtml(dir, list = []) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) {
            if (e.name === 'node_modules' || e.name === '.git') continue;
            walkHtml(p, list);
        } else if (e.name.endsWith('.html')) {
            list.push(p);
        }
    }
    return list;
}

function prefixFor(rel) {
    if (rel.includes('/produkty/kategoria/') || rel.startsWith('produkty/kategoria/')) return '../../';
    if (rel.includes('/produkty/') || rel.startsWith('produkty/')) return '../';
    return '';
}

let count = 0;
for (const filePath of walkHtml(root)) {
    const rel = path.relative(root, filePath).replace(/\\/g, '/');
    const prefix = prefixFor(rel);
    let html = fs.readFileSync(filePath, 'utf8');
    if (!FOOTER_RE.test(html)) {
        console.warn('Brak stopki:', rel);
        continue;
    }
    html = html.replace(SIDE_RAIL_RE, '\n');
    html = html.replace(UNIT_RE, '\n');
    html = html.replace(FOOTER_RE, buildSiteFooter(prefix));
    fs.writeFileSync(filePath, html, 'utf8');
    count++;
}

console.log(`Zaktualizowano stopkę w ${count} plikach HTML.`);
