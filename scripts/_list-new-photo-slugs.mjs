import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const raw = fs.readFileSync(path.join(root, 'js', 'products-data-raw.js'), 'utf8');
const products = JSON.parse(raw.slice(raw.indexOf('['), raw.lastIndexOf('];') + 1));
const dir = path.join(root, 'images', 'products');

function fileSize(p) {
    try {
        return fs.statSync(p).size;
    } catch {
        return 0;
    }
}

const need = [];
const haveCutout = [];
for (const p of products) {
    const slug = p.slug;
    const png = path.join(dir, `${slug}.png`);
    const webp = path.join(dir, `${slug}.webp`);
    const jpg = path.join(dir, `${slug}.jpg`);
    const pngSz = fileSize(png);
    const webpSz = fileSize(webp);
    const jpgSz = fileSize(jpg);
    // Real cutouts are usually PNG with alpha or webp from pipeline; card placeholders are small-ish JPGs from sharp SVG (~20-80KB often)
    const hasPng = pngSz > 20000;
    const hasWebp = webpSz > 15000;
    if (hasPng || hasWebp) {
        haveCutout.push(slug);
    } else {
        need.push({ slug, name: p.name, category: p.category, jpgSz, pngSz, webpSz });
    }
}

console.log('total', products.length);
console.log('have cutout-ish', haveCutout.length);
console.log('need photos', need.length);
console.log('sample need', need.slice(0, 20));
fs.writeFileSync(path.join(root, 'scripts', '_new-photo-slugs.json'), JSON.stringify(need, null, 2));
console.log('wrote scripts/_new-photo-slugs.json');
