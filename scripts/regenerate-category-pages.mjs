/**
 * Regeneruje tylko HTML stron kategorii (produkty/kategoria/*.html).
 * node scripts/regenerate-category-pages.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildCategoryPageHtml } from './category-page-html.mjs';
import { CATEGORY_ORDER } from './category-seo.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const rawFile = fs.readFileSync(path.join(root, 'js', 'products-data-raw.js'), 'utf8');
const rawMatch = rawFile.match(/productsDatabaseRaw = (\[[\s\S]*\]);/);
if (!rawMatch) throw new Error('Cannot parse products-data-raw.js');
const products = JSON.parse(rawMatch[1]);

const targets = [
    path.join(root, 'produkty', 'kategoria'),
    path.join(root, 'deploy-bundle', 'produkty', 'kategoria'),
];

for (const catDir of targets) {
    fs.mkdirSync(catDir, { recursive: true });
}

for (const slug of CATEGORY_ORDER) {
    const inCategory = products.filter((p) => p.category === slug);
    const html = buildCategoryPageHtml(slug, inCategory);
    for (const catDir of targets) {
        fs.writeFileSync(path.join(catDir, `${slug}.html`), html, 'utf8');
    }
    console.log(`${slug}: ${inCategory.length}`);
}

console.log(`Gotowe: ${CATEGORY_ORDER.length} kategorii × ${targets.length} lokalizacji`);
