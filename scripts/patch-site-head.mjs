/**
 * Wstrzykuje favicon + og:image do istniejących HTML (bez duplikatów).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildDefaultSiteHead, buildFaviconLinks, buildSocialImageMeta } from './site-head-assets.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const MARKER = '<!-- pm:site-head -->';

function injectAfterOgUrl(html, block) {
    if (html.includes(MARKER) || html.includes('og:image')) return html;
    const re = /(<meta property="og:url"[^>]*>\s*)/i;
    if (re.test(html)) return html.replace(re, `$1${MARKER}\n${block}\n`);
    const reCanon = /(<link rel="canonical"[^>]*>\s*)/i;
    if (reCanon.test(html)) return html.replace(reCanon, `$1${MARKER}\n${block}\n`);
    const reTitle = /(<title>[^<]*<\/title>\s*)/i;
    if (reTitle.test(html)) return html.replace(reTitle, `$1${MARKER}\n${block}\n`);
    return html;
}

function injectFaviconOnly(html, prefix) {
    if (html.includes('favicon-32.png')) return html;
    const block = buildFaviconLinks(prefix);
    const reViewport = /(<meta name="viewport"[^>]*>\s*)/i;
    if (reViewport.test(html)) return html.replace(reViewport, `$1${block}\n`);
    const reCharset = /(<meta charset="UTF-8">\s*)/i;
    if (reCharset.test(html)) return html.replace(reCharset, `$1${block}\n`);
    return html;
}

function walk(dir, files = []) {
    for (const name of fs.readdirSync(dir)) {
        const full = path.join(dir, name);
        if (name === 'node_modules') continue;
        const st = fs.statSync(full);
        if (st.isDirectory()) walk(full, files);
        else if (name.endsWith('.html')) files.push(full);
    }
    return files;
}

let patched = 0;
let skipped = 0;

for (const file of walk(root)) {
    const rel = path.relative(root, file).replace(/\\/g, '/');
    if (rel === '404.html') {
        skipped++;
        continue;
    }
    let html = fs.readFileSync(file, 'utf8');
    const prefix = rel.startsWith('produkty/') ? '../' : '';
    const before = html;

    if (rel === 'index.html' || rel === 'dieta.html' || rel === 'trening.html' || rel === 'informacje.html' || rel === 'o-mnie.html') {
        html = injectAfterOgUrl(html, buildDefaultSiteHead(prefix));
    } else if (rel === 'produkty/index.html') {
        // przekierowanie — bez dodatkowych meta OG
    } else if (rel.startsWith('produkty/')) {
        html = injectFaviconOnly(html, prefix);
        if (!html.includes('og:image')) {
            const slug = path.basename(file, '.html');
            const imgRel = `images/products/${slug}.jpg`;
            const imgExists = fs.existsSync(path.join(root, imgRel));
            const ogPath = imgExists ? imgRel : 'images/og-home.jpg';
            const titleMatch = html.match(/<title>([^<]*)<\/title>/);
            const alt = titleMatch ? titleMatch[1].replace(/\s*\|\s*ProteinMaxxing\.pl\s*$/i, '').trim() : slug;
            html = injectAfterOgUrl(
                html,
                buildSocialImageMeta(prefix, ogPath, { alt })
            );
        }
    } else {
        html = injectFaviconOnly(html, prefix);
    }

    if (html !== before) {
        fs.writeFileSync(file, html, 'utf8');
        patched++;
    } else {
        skipped++;
    }
}

console.log(`patch-site-head: ${patched} zaktualizowanych, ${skipped} bez zmian`);
