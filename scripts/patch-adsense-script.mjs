/** Dodaje meta AdSense + skrypt adsbygoogle.js do publicznych stron HTML. */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildAdSenseHead } from './site-head-assets.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const snippet = buildAdSenseHead();
const marker = '<meta name="google-adsense-account"';

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

let changed = 0;
for (const fp of walkHtml(root)) {
    let html = fs.readFileSync(fp, 'utf8');
    if (html.includes(marker)) continue;

    const reViewport = /(<meta name="viewport"[^>]*>\s*)/i;
    if (!reViewport.test(html)) continue;

    html = html.replace(reViewport, `$1${snippet}\n`);
    fs.writeFileSync(fp, html, 'utf8');
    changed++;
}

console.log(`Dodano AdSense do ${changed} plików HTML.`);
