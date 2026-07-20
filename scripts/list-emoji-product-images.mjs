/**
 * Wykrywa czarne ikony/emoji zamiast fotek i buduje kolejkę regeneracji.
 * node scripts/list-emoji-product-images.mjs
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

async function isSilhouetteOrMissing(sharp, fp) {
    if (!fs.existsSync(fp)) return { need: true, reason: 'missing' };
    const { data, info } = await sharp(fp).resize(80, 60).raw().toBuffer({ resolveWithObject: true });
    const w = info.width;
    const h = info.height;
    const ch = info.channels;
    let white = 0;
    let black = 0;
    let colorful = 0;
    for (let i = 0; i < w * h; i++) {
        const o = i * ch;
        const r = data[o];
        const g = data[o + 1];
        const b = data[o + 2];
        if (r > 235 && g > 235 && b > 235) white++;
        else if (r < 45 && g < 45 && b < 45) black++;
        else if (Math.max(r, g, b) - Math.min(r, g, b) > 35) colorful++;
    }
    const total = w * h;
    const whiteR = white / total;
    const blackR = black / total;
    const colorR = colorful / total;
    // Czarna ikona na białym: bardzo dużo bieli, prawie zero chromatycznych kolorów
    // (antyaliasing ikon daje szarości, nie czyste czernie)
    if (whiteR > 0.93 && colorR < 0.04) {
        return { need: true, reason: 'silhouette', whiteR, blackR, colorR };
    }
    return { need: false, whiteR, blackR, colorR };
}

const raw = JSON.parse(
    fs.readFileSync(path.join(root, 'js', 'products-data-raw.js'), 'utf8').match(/productsDatabaseRaw = (\[[\s\S]*\]);/)[1]
);
const products = enrichProducts(raw);
const sharp = (await import('sharp')).default;
const need = [];

for (const p of products) {
    const fp = path.join(dir, `${p.slug}.jpg`);
    const res = await isSilhouetteOrMissing(sharp, fp);
    if (res.need) need.push({ ...p, ...res });
}

need.sort((a, b) => {
    const oilA = a.category === 'tluszcze' || /olej|oliwa|maslo|tluszcz|ghee/i.test(a.slug) ? 0 : 1;
    const oilB = b.category === 'tluszcze' || /olej|oliwa|maslo|tluszcz|ghee/i.test(b.slug) ? 0 : 1;
    return oilA - oilB || a.slug.localeCompare(b.slug);
});

fs.writeFileSync(outPath, JSON.stringify(need, null, 2));
const oils = need.filter((p) => p.category === 'tluszcze' || /olej|oliwa|maslo|tluszcz|ghee/i.test(p.slug));
console.log(`Do fotki (sylwetki/brak): ${need.length} / ${products.length}`);
console.log('Oleje/tłuszcze nadal:', oils.map((o) => o.slug).join(', ') || '(wszystkie OK)');
console.log(`Zapisano: ${path.relative(root, outPath)}`);
