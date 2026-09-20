/**
 * Wykrywa stare karty-placeholdery (generate-product-card-images.mjs):
 * sygnatura = teal pasek na gorze kadru + tekst z nazwa/kaloriami.
 *
 * Rozroznia:
 *  - produkty, ktorych zdjecie (slug aplikacji) to nadal karta -> wymagaja generacji
 *  - osierocone karty (nazwane slugiem generatora, nieuzywane przez apke) -> smieci
 *
 * node scripts/audit-product-image-placeholders.mjs
 * node scripts/audit-product-image-placeholders.mjs --remove-orphans
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'images', 'products');
const bundleDir = path.join(root, 'deploy-bundle', 'images', 'products');
const removeOrphans = process.argv.includes('--remove-orphans');

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

const src = fs.readFileSync(path.join(root, 'js', 'products-data-raw.js'), 'utf8');
const i = src.indexOf('productsDatabaseRaw');
const raw = JSON.parse(src.slice(src.indexOf('[', i), src.lastIndexOf('];') + 1));

// slug aplikacji (product-utils.js: base = p.slug || slugify(name))
const seen = {};
const appSlugs = raw.map((p) => {
    const base = p.slug && String(p.slug).trim() ? String(p.slug).trim() : slugify(p.name);
    let slug = base;
    let n = 2;
    while (seen[slug]) {
        slug = `${base}-${p.category || 'x'}`;
        if (seen[slug]) slug = `${base}-${n++}`;
    }
    seen[slug] = true;
    return slug;
});
const appSet = new Set(appSlugs);

const sharp = (await import('sharp')).default;

/** Karta = teal pasek przez cala szerokosc w pierwszym wierszu (zdjecia maja tam biel). */
async function isCard(slug) {
    const file = path.join(dir, `${slug}.jpg`);
    if (!fs.existsSync(file)) return null;
    const { data, info } = await sharp(file).resize(80, 60).raw().toBuffer({ resolveWithObject: true });
    const w = info.width;
    const ch = info.channels;
    let bar = 0;
    for (let x = 0; x < w; x++) {
        const k = x * ch;
        const r = data[k];
        const g = data[k + 1];
        const b = data[k + 2];
        if (g > 150 && b > 140 && r < 180 && g > r + 30) bar++;
    }
    return bar / w > 0.8;
}

const productsWithCard = [];
for (const slug of appSlugs) {
    if ((await isCard(slug)) === true) productsWithCard.push(slug);
}

const jpgs = fs.readdirSync(dir).filter((f) => f.endsWith('.jpg'));
const orphans = [];
for (const f of jpgs) {
    const slug = f.replace(/\.jpg$/, '');
    if (appSet.has(slug)) continue;
    if ((await isCard(slug)) === true) orphans.push(slug);
}

console.log(`Produkty z karta-placeholderem: ${productsWithCard.length} / ${appSlugs.length}`);
for (const s of productsWithCard) console.log('  ', s);
console.log(`Osierocone karty (smieci): ${orphans.length}`);
for (const s of orphans) console.log('  ', s);

if (removeOrphans && orphans.length) {
    let removed = 0;
    for (const slug of orphans) {
        for (const d of [dir, bundleDir]) {
            for (const e of ['.jpg', '.webp', '.png']) {
                const p = path.join(d, `${slug}${e}`);
                if (fs.existsSync(p)) {
                    fs.unlinkSync(p);
                    removed++;
                }
            }
        }
    }
    console.log(`Usunieto ${removed} plikow osieroconych kart.`);
}
