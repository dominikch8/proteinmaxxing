/**
 * Lista produktów do regeneracji zdjęć (minimalistyczne białe tło jak banan.jpg).
 * node scripts/build-product-image-regen-queue.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'images', 'products');
const outPath = path.join(root, 'scripts', 'product-images-regen-queue.json');

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
        return { slug, name: p.name, emoji: p.emoji || '🍽️', category: p.category };
    });
}

const raw = JSON.parse(
    fs.readFileSync(path.join(root, 'js', 'products-data-raw.js'), 'utf8').match(/productsDatabaseRaw = (\[[\s\S]*\]);/)[1]
);
const products = enrichProducts(raw);
const sharp = (await import('sharp')).default;

const MIN_WHITE = 0.45;
const MIN_CORNERS = 4;
const need = [];
let ok = 0;

for (const p of products) {
    const fp = path.join(dir, `${p.slug}.jpg`);
    if (!fs.existsSync(fp)) {
        need.push({ ...p, reason: 'missing' });
        continue;
    }
    const { data, info } = await sharp(fp).resize(120, 90).raw().toBuffer({ resolveWithObject: true });
    const w = info.width;
    const h = info.height;
    const ch = info.channels;
    let white = 0;
    let cornerWhite = 0;
    const corners = [
        [0, 0],
        [w - 1, 0],
        [0, h - 1],
        [w - 1, h - 1]
    ];
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const i = (y * w + x) * ch;
            if (data[i] > 235 && data[i + 1] > 235 && data[i + 2] > 235) white++;
        }
    }
    for (const [x, y] of corners) {
        const i = (y * w + x) * ch;
        if (data[i] > 230 && data[i + 1] > 230 && data[i + 2] > 230) cornerWhite++;
    }
    const whiteRatio = white / (w * h);
    if (whiteRatio >= MIN_WHITE && cornerWhite >= MIN_CORNERS) {
        ok++;
    } else {
        need.push({
            ...p,
            reason: 'style',
            whitePercent: Math.round(whiteRatio * 1000) / 10,
            cornerWhite
        });
    }
}

fs.writeFileSync(outPath, JSON.stringify(need, null, 2));
console.log(`Zgodne ze stylem: ${ok}, do regeneracji: ${need.length}, razem produktów: ${products.length}`);
console.log(`Zapisano: ${path.relative(root, outPath)}`);
