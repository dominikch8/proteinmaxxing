/** Dodaje partner-ads.css + partner-ads.js do publicznych stron HTML. */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const SKIP = new Set(['admin-zgloszenia.html']);

const SNIPPET_ROOT = `
    <link rel="stylesheet" href="css/partner-ads.css">
    <script src="js/partner-ads.js"></script>`;

const SNIPPET_PRODUCT = `
    <link rel="stylesheet" href="../css/partner-ads.css">
    <script src="../js/partner-ads.js"></script>`;

function walkHtml(dir, list = []) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) {
            if (e.name === 'node_modules') continue;
            walkHtml(p, list);
        } else if (e.name.endsWith('.html')) {
            list.push(p);
        }
    }
    return list;
}

let n = 0;
for (const fp of walkHtml(root)) {
    const rel = path.relative(root, fp).replace(/\\/g, '/');
    if (SKIP.has(rel)) continue;

    let html = fs.readFileSync(fp, 'utf8');
    if (html.includes('partner-ads.js')) continue;
    if (!html.includes('cookie-banner.js') && !html.includes('consent-head.js')) continue;

    const inProducts = rel.startsWith('produkty/');
    const snippet = inProducts ? SNIPPET_PRODUCT : SNIPPET_ROOT;

    if (html.includes('<script src="js/cookie-banner.js"></script>')) {
        html = html.replace(
            '<script src="js/cookie-banner.js"></script>',
            `<script src="js/cookie-banner.js"></script>${snippet}`
        );
    } else if (html.includes('<script src="../js/cookie-banner.js"></script>')) {
        html = html.replace(
            '<script src="../js/cookie-banner.js"></script>',
            `<script src="../js/cookie-banner.js"></script>${snippet}`
        );
    } else if (html.includes('</body>')) {
        html = html.replace('</body>', `${snippet}\n</body>`);
    } else {
        continue;
    }

    fs.writeFileSync(fp, html, 'utf8');
    n++;
}

console.log(`Dodano partner-ads do ${n} plików HTML.`);
