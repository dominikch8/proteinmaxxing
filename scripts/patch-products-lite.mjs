/**
 * Podmienia products-data-raw.js → products-lite.js w HTML
 * oraz usuwa sw.js z deploy-bundle jeśli istnieje.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP_DIRS = new Set(['node_modules', '.git', 'deploy-bundle', 'domains']);

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

let changed = 0;
for (const fp of walkHtml(root)) {
    let html = fs.readFileSync(fp, 'utf8');
    const before = html;

    html = html.replace(
        /<script src="(\.\.\/)*js\/products-data-raw\.js"><\/script>\s*/g,
        (m) => m.replace('products-data-raw.js', 'products-lite.js')
    );

    // index.html — lazy load zamiast pełnej bazy na starcie
    if (path.basename(fp) === 'index.html' && !path.dirname(fp).includes('produkty')) {
        html = html.replace(
            /<script src="js\/products-lite\.js"><\/script>\s*<script src="js\/product-utils\.js"><\/script>\s*<script src="js\/products-data\.js"><\/script>/,
            '<script src="js/product-utils.js"></script>\n<script src="js/products-loader.js"></script>'
        );
    }

    if (html !== before) {
        fs.writeFileSync(fp, html, 'utf8');
        changed++;
    }
}

const swPath = path.join(root, 'deploy-bundle', 'sw.js');
if (fs.existsSync(swPath)) fs.unlinkSync(swPath);

console.log(`Zaktualizowano ${changed} plików HTML (products-lite + loader).`);
