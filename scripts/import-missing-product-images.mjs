/**
 * Importuje brakujące {slug}.png z folderu assets → images/products/{slug}.jpg
 * node scripts/import-missing-product-images.mjs [ścieżka-do-assets]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const defaultAssets = path.join(
    process.env.USERPROFILE || '',
    '.cursor',
    'projects',
    'c-Users-Administrator-xD-Desktop-proby-strony-XD',
    'assets'
);
const assetsDir = process.argv[2] || defaultAssets;
const outDir = path.join(root, 'images', 'products');

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
        return { slug };
    });
}

const raw = JSON.parse(
    fs.readFileSync(path.join(root, 'js', 'products-data-raw.js'), 'utf8').match(/productsDatabaseRaw = (\[[\s\S]*\]);/)[1]
);
const slugs = enrichProducts(raw).map((p) => p.slug);

const sharp = (await import('sharp')).default;
fs.mkdirSync(outDir, { recursive: true });

const missing = slugs.filter((s) => !fs.existsSync(path.join(outDir, `${s}.jpg`)));
let imported = 0;
const failed = [];

for (const slug of missing) {
    const candidates = [
        path.join(assetsDir, `${slug}.png`),
        path.join(assetsDir, `${slug}.jpg`),
        path.join(assetsDir, `${slug}.webp`)
    ];
    const src = candidates.find((p) => fs.existsSync(p));
    if (!src) {
        failed.push({ slug, reason: 'brak pliku w assets' });
        continue;
    }
    try {
        await sharp(src)
            .resize(800, 600, { fit: 'cover', position: 'centre' })
            .jpeg({ quality: 72, mozjpeg: true })
            .toFile(path.join(outDir, `${slug}.jpg`));
        imported++;
        console.log('OK', slug);
    } catch (e) {
        failed.push({ slug, reason: e.message });
    }
}

const stillMissing = slugs.filter((s) => !fs.existsSync(path.join(outDir, `${s}.jpg`)));
console.log(`\nZaimportowano: ${imported}`);
console.log(`Nadal brakuje: ${stillMissing.length}`);
if (stillMissing.length) stillMissing.forEach((s) => console.log('  -', s));
if (failed.length) {
    console.log('Błędy:');
    failed.forEach((f) => console.log(`  - ${f.slug}: ${f.reason}`));
}
