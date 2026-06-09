/**
 * Usuwa wszystkie tagi Monetag z HTML; zostawia AdSense.
 * Uruchom: node scripts/remove-monetag.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildSiteFooter } from './site-footer-html.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
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

function stripMonetag(html) {
    let out = html;

    out = out.replace(/\s*<script src="https:\/\/quge5\.com\/[^"]*"[^>]*><\/script>\s*/gi, '\n');
    out = out.replace(
        /\s*<script>\(function\(s\)\{s\.dataset\.zone='[^']*',s\.src='https:\/\/(?:nap5k|n6wxm)\.com\/[^']*'\}\)\([^<]*<\/script>\s*/gi,
        '\n'
    );

    out = out.replace(/\s*<link rel="stylesheet" href="(?:\.\.\/)?css\/site-ad-rails\.css">\s*/g, '\n');
    out = out.replace(/\s*<script src="(?:\.\.\/)?js\/site-ad-rails\.js"><\/script>\s*/g, '\n');

    out = out.replace(
        /\s*<span aria-hidden="true">·<\/span>\s*<a class="site-footer-partner"[^>]*>Oferty partnerskie<\/a>/gi,
        ''
    );

    return out;
}

let changed = 0;
for (const fp of walkHtml(root)) {
    const rel = path.relative(root, fp).replace(/\\/g, '/');
    const prefix = rel.startsWith('produkty/') ? '../' : '';
    let html = fs.readFileSync(fp, 'utf8');
    const before = html;

    html = stripMonetag(html);

    if (html.includes('<footer class="site-footer">')) {
        html = html.replace(/<footer class="site-footer">[\s\S]*?<\/footer>/, buildSiteFooter(prefix));
    }

    if (html !== before) {
        fs.writeFileSync(fp, html, 'utf8');
        changed++;
    }
}

console.log(`Usunięto Monetag z ${changed} plików HTML (AdSense bez zmian).`);
