/**
 * Normalize MediaBoxy head to a single Plus + Video block.
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

/** Any MediaBoxy head junk between AdSense and <title> / next meta. */
const HEAD_JUNK_RE =
    /\s*(?:<!-- MediaBoxy[^>]*-->\s*)?(?:<script>\s*window\.a1video[\s\S]*?<\/script>\s*)?(?:<script[^>]*cdn\.mediaboxy\.pl\/js\/(?:m4plus|v4)\.js[^>]*><\/script>\s*)+/g;

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
    // Remove known comment+script clusters repeatedly
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

let headN = 0;
let footN = 0;
const headSnippet = buildMediaBoxyHead();

for (const fp of walkHtml(root)) {
    const rel = path.relative(root, fp).replace(/\\/g, '/');
    let html = fs.readFileSync(fp, 'utf8');
    const before = html;

    if (/adsbygoogle\.js/.test(html)) {
        html = stripMediaBoxyHead(html);
        const next = html.replace(
            /(<script async src="https:\/\/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js\?client=[^"]+"\s*\r?\n\s*crossorigin="anonymous"><\/script>)/,
            `$1\n${headSnippet}`
        );
        if (next !== html || before.includes('m4plus.js')) {
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

console.log(`MediaBoxy head normalized: ${headN}; footer/unit: ${footN}`);
