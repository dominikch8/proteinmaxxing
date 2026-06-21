/**
 * Poprawia zgodność płci i wzbogaca ręczne opisy w product-editorial.json.
 * node scripts/polish-manual-editorial.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { polishEditorial } from './polish-gender.mjs';
import { generateProductEditorial } from './product-editorial-generator.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

function slugify(name) {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/ą/g, 'a')
        .replace(/ć/g, 'c')
        .replace(/ę/g, 'e')
        .replace(/ł/g, 'l')
        .replace(/ń/g, 'n')
        .replace(/ó/g, 'o')
        .replace(/ś/g, 's')
        .replace(/ź/g, 'z')
        .replace(/ż/g, 'z')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

const raw = fs.readFileSync(path.join(root, 'js/products-data-raw.js'), 'utf8');
const products = JSON.parse(raw.match(/\[.*\]/s)[0]);
const bySlug = new Map(products.map((p) => [slugify(p.name), { ...p, slug: slugify(p.name) }]));

const editorialPath = path.join(__dirname, 'product-editorial.json');
const editorial = JSON.parse(fs.readFileSync(editorialPath, 'utf8'));

let polished = 0;
let enriched = 0;

for (const [slug, entry] of Object.entries(editorial)) {
    const product = bySlug.get(slug);
    const name = product?.name || slug.replace(/-/g, ' ');

    let updated = polishEditorial(entry, name);

    // Wzbogać krótkie opisy (3 akapity, <900 znaków) o dodatkowy akapit z generatora
    const chars = updated.paragraphs.join(' ').length;
    if (product && updated.paragraphs.length <= 3 && chars < 900) {
        const gen = generateProductEditorial(product);
        const extra = gen.paragraphs[2]; // meal combo — unikalny per produkt
        if (extra && !updated.paragraphs.some((p) => p.slice(0, 60) === extra.slice(0, 60))) {
            updated.paragraphs.splice(updated.paragraphs.length - 1, 0, extra);
            enriched++;
        }
    }

    if (JSON.stringify(updated) !== JSON.stringify(entry)) {
        editorial[slug] = updated;
        polished++;
    }
}

fs.writeFileSync(editorialPath, JSON.stringify(editorial, null, 2) + '\n', 'utf8');
console.log(`Zaktualizowano ${polished} wpisów (${enriched} wzbogaconych o dodatkowy akapit). Razem: ${Object.keys(editorial).length}`);
