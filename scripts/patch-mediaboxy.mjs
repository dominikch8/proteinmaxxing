/**
 * MediaBoxy Plus (head) + jednostka przed stopką.
 * node scripts/patch-mediaboxy.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildMediaBoxyHead, buildMediaBoxyUnit } from './site-head-assets.mjs';
import { buildSiteFooter } from './site-footer-html.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP_DIRS = new Set(['node_modules', '.git', '.github', '.cursor', 'domains', 'scripts']);
const SKIP_FILES = new Set(['admin-zgloszenia.html']);
const FOOTER_RE = /<footer class="site-footer">[\s\S]*?<\/footer>/;
const UNIT_RE = /\s*<!-- MediaBoxy Start \| MediaBoxy\.pl -->[\s\S]*?<!-- MediaBoxy Stop \| MediaBoxy\.pl -->\s*/g;
const HEAD_MARKER = 'cdn.mediaboxy.pl/js/m4plus.js';

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
    if (rel.startsWith('produkty/kategoria/')) return '../../';
    if (rel.startsWith('produkty/') || rel.startsWith('deploy-bundle/produkty/kategoria/')) {
        if (rel.includes('/kategoria/')) return '../../';
        return '../';
    }
    if (rel.startsWith('deploy-bundle/produkty/')) return '../';
    return '';
}

let headN = 0;
let footN = 0;

for (const fp of walkHtml(root)) {
    const rel = path.relative(root, fp).replace(/\\/g, '/');
    let html = fs.readFileSync(fp, 'utf8');
    const before = html;

    if (!html.includes(HEAD_MARKER) && /adsbygoogle\.js/.test(html)) {
        const next = html.replace(
            /(<script async src="https:\/\/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js\?client=[^"]+"\s*\r?\n\s*crossorigin="anonymous"><\/script>)/,
            `$1\n${buildMediaBoxyHead()}`
        );
        if (next !== html) {
            html = next;
            headN += 1;
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
