/**
 * MediaBoxy Plus + Video Box (head) + jednostka przed stopką.
 * node scripts/patch-mediaboxy.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildMediaBoxyHead } from './site-head-assets.mjs';
import { buildSiteFooter } from './site-footer-html.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP_DIRS = new Set(['node_modules', '.git', '.github', '.cursor', 'domains', 'scripts']);
const SKIP_FILES = new Set(['admin-zgloszenia.html']);
const FOOTER_RE = /<footer class="site-footer">[\s\S]*?<\/footer>/;
const UNIT_RE = /\s*<!-- MediaBoxy Start \| MediaBoxy\.pl -->[\s\S]*?<!-- MediaBoxy Stop \| MediaBoxy\.pl -->\s*/g;
const PLUS_RE =
    /\s*<!-- MediaBoxy PLUS \(head\) -->\s*<script src="https:\/\/cdn\.mediaboxy\.pl\/js\/m4plus\.js"><\/script>(?:\s*<!-- MediaBoxy\.pl - Zamykane okienko wideo -->[\s\S]*?<script async src="https:\/\/cdn\.mediaboxy\.pl\/js\/v4\.js"><\/script>)?/g;

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

let headN = 0;
let footN = 0;
const headSnippet = buildMediaBoxyHead();

for (const fp of walkHtml(root)) {
    const rel = path.relative(root, fp).replace(/\\/g, '/');
    let html = fs.readFileSync(fp, 'utf8');
    const before = html;

    if (/adsbygoogle\.js/.test(html)) {
        if (PLUS_RE.test(html)) {
            html = html.replace(PLUS_RE, `\n${headSnippet}`);
            headN += 1;
        } else if (!html.includes('cdn.mediaboxy.pl/js/v4.js')) {
            const next = html.replace(
                /(<script async src="https:\/\/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js\?client=[^"]+"\s*\r?\n\s*crossorigin="anonymous"><\/script>)/,
                `$1\n${headSnippet}`
            );
            if (next !== html) {
                html = next;
                headN += 1;
            }
        }
    }

    if (FOOTER_RE.test(html)) {
        html = html.replace(UNIT_RE, '\n');
        html = html.replace(FOOTER_RE, buildSiteFooter(prefixFor(rel)));
        footN += 1;
    }

    if (html !== before) fs.writeFileSync(fp, html);
}

console.log(`MediaBoxy head: ${headN} files; footer/unit: ${footN} files.`);
