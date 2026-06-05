import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildFaviconLinks } from './site-head-assets.mjs';
import { buildLogoMark } from './site-logo-html.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const FAVICON_BLOCK = /    <link rel="icon"[^>]*>\s*(?:    <link rel="icon"[^>]*>\s*)*(?:    <link rel="apple-touch-icon"[^>]*>\s*)?/i;
const LOGO_IMG = /<img class="logo-mark"[^>]*>/g;

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

let n = 0;
for (const file of walk(root)) {
    const rel = path.relative(root, file).replace(/\\/g, '/');
    const prefix = rel.startsWith('produkty/') ? '../' : '';
    let html = fs.readFileSync(file, 'utf8');
    const before = html;

    if (rel !== '404.html' && html.includes('favicon-32.png')) {
        if (FAVICON_BLOCK.test(html)) {
            FAVICON_BLOCK.lastIndex = 0;
            html = html.replace(FAVICON_BLOCK, `${buildFaviconLinks(prefix)}\n`);
        }
    }

    if (LOGO_IMG.test(html)) {
        LOGO_IMG.lastIndex = 0;
        html = html.replace(LOGO_IMG, buildLogoMark(prefix));
    }

    if (html !== before) {
        fs.writeFileSync(file, html, 'utf8');
        n++;
    }
}
console.log(`patch-favicon-and-logo: ${n} plików`);
