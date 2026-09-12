/** Tymczasowy raport pokrycia zdjęć produktów. node scripts/_image-coverage.mjs */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'images', 'products');

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

function enrichProducts(raw) {
    const seen = {};
    return raw.map((p) => {
        let base = slugify(p.name);
        let slug = base;
        let n = 2;
        while (seen[slug]) {
            slug = `${base}-${p.category}`;
            if (seen[slug]) slug = `${base}-${n++}`;
        }
        seen[slug] = true;
        return { slug, name: p.name, category: p.category };
    });
}

const raw = JSON.parse(
    fs.readFileSync(path.join(root, 'js', 'products-data-raw.js'), 'utf8').match(/productsDatabaseRaw = (\[[\s\S]*\]);/)[1]
);
const products = enrichProducts(raw);
const files = new Set(fs.readdirSync(dir));

let missAll = [];
let missJpg = [];
let hasPngNoJpg = [];
let hasAll = 0;
for (const p of products) {
    const hasPng = files.has(`${p.slug}.png`);
    const hasJpg = files.has(`${p.slug}.jpg`);
    const hasWebp = files.has(`${p.slug}.webp`);
    if (hasPng && hasJpg && hasWebp) hasAll++;
    else missAll.push(p.slug);
    if (!hasJpg) missJpg.push(p.slug);
    if (hasPng && !hasJpg) hasPngNoJpg.push(p.slug);
}
console.log('products              :', products.length);
console.log('full set png+jpg+webp :', hasAll);
console.log('missing any           :', missAll.length);
console.log('missing jpg           :', missJpg.length);
console.log('has png but no jpg    :', hasPngNoJpg.length);
console.log('\nmissing-any sample    :', missAll.slice(0, 25).join(', '));
console.log('\nhasPngNoJpg sample    :', hasPngNoJpg.slice(0, 25).join(', '));
const byCat = {};
for (const p of products) {
    if (missAll.includes(p.slug)) byCat[p.category] = (byCat[p.category] || 0) + 1;
}
console.log('\nmissing by category   :', JSON.stringify(byCat));
fs.writeFileSync(path.join(root, 'scripts', '_image-coverage.json'), JSON.stringify({ missAll, missJpg, hasPngNoJpg }, null, 2));
