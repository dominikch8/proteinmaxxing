/**
 * Remove all MediaBoxy markup/scripts from HTML.
 * node scripts/patch-mediaboxy.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildSiteFooter } from './site-footer-html.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP_DIRS = new Set(['node_modules', '.git', '.github', '.cursor', 'domains', 'scripts']);
const SKIP_FILES = new Set(['admin-zgloszenia.html']);
const FOOTER_RE = /<footer class="site-footer">[\s\S]*?<\/footer>/;
const UNIT_RE = /\s*<!-- MediaBoxy Start[\s\S]*?<!-- MediaBoxy Stop[\s\S]*?-->\s*/g;
const SIDE_RAIL_RE =
    /\s*<!-- MediaBoxy side rails[\s\S]*?-->\s*<aside class="pm-side-rail[\s\S]*?<\/aside>\s*<aside class="pm-side-rail[\s\S]*?<\/aside>\s*/g;
const INLINE_AD_RE =
    /\s*<!-- MediaBoxy Start \| product under-image -->[\s\S]*?<!-- MediaBoxy Stop \| product under-image -->\s*/g;
const INLINE_DIV_RE =
    /\s*<div class="pm-product-inline-ad"[^>]*>[\s\S]*?<\/div>\s*/g;

function walkHtml(dir, list = []) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) {
            if (SKIP_DIRS.has(e.name)) continue;
            walkHtml(p, list);
        } else if (e.name.endsWith('.html') && !SKIP_FILES.has(e.name)) {
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

function stripMediaBoxyHead(html) {
    let out = html;
    out = out.replace(
        /\s*<!-- MediaBoxy[^>]*-->\s*<script src="https:\/\/cdn\.mediaboxy\.pl\/js\/m4plus\.js"><\/script>/g,
        ''
    );
    out = out.replace(
        /\s*<!-- MediaBoxy\.pl - Zamykane okienko wideo -->\s*<script>\s*window\.a1video[\s\S]*?<\/script>\s*<script async src="https:\/\/cdn\.mediaboxy\.pl\/js\/v4\.js"><\/script>/g,
        ''
    );
    out = out.replace(/\s*<script src="https:\/\/cdn\.mediaboxy\.pl\/js\/m4plus\.js"><\/script>/g, '');
    out = out.replace(/\s*<script async src="https:\/\/cdn\.mediaboxy\.pl\/js\/v4\.js"><\/script>/g, '');
    out = out.replace(
        /\s*<script>\s*window\.a1video\s*=\s*window\.a1video\s*\|\|\s*\[\];\s*window\.a1video\.push\(\{\s*publisher:\s*"P44448-497e74779620"\s*\}\);\s*<\/script>/g,
        ''
    );
    return out;
}

let n = 0;
for (const fp of walkHtml(root)) {
    const rel = path.relative(root, fp).replace(/\\/g, '/');
    let html = fs.readFileSync(fp, 'utf8');
    const before = html;

    html = stripMediaBoxyHead(html);
    html = html.replace(SIDE_RAIL_RE, '\n');
    html = html.replace(UNIT_RE, '\n');
    html = html.replace(INLINE_AD_RE, '\n');
    html = html.replace(INLINE_DIV_RE, '\n');

    if (FOOTER_RE.test(html)) {
        html = html.replace(FOOTER_RE, buildSiteFooter(prefixFor(rel)));
    }

    if (html !== before) {
        fs.writeFileSync(fp, html);
        n += 1;
    }
}

console.log(`MediaBoxy removed from ${n} HTML files.`);
