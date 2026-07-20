/**
 * Importuje {slug}.png|jpg|webp z assets → images/products/{slug}.jpg (nadpisuje).
 * node scripts/import-product-images-force.mjs slug1 slug2 ...
 * node scripts/import-product-images-force.mjs --all-from-assets
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
const assetsDir = process.argv.includes('--assets')
    ? process.argv[process.argv.indexOf('--assets') + 1]
    : defaultAssets;
const outDir = path.join(root, 'images', 'products');

const args = process.argv.slice(2).filter((a) => a !== '--assets' && (a === '--all-from-assets' || !a.startsWith('--')));

let slugs = args;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function productSlugsSet() {
    const raw = fs.readFileSync(path.join(root, 'js', 'products-data-raw.js'), 'utf8');
    const list = JSON.parse(raw.match(/productsDatabaseRaw = (\[[\s\S]*\]);/)[1]);
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
    const seen = {};
    const slugs = new Set();
    for (const p of list) {
        let base = slugify(p.name);
        let slug = base;
        let n = 2;
        while (seen[slug]) {
            slug = `${base}-${n++}`;
        }
        seen[slug] = true;
        slugs.add(slug);
    }
    return slugs;
}

if (args[0] === '--all-from-assets') {
    const valid = productSlugsSet();
    slugs = fs
        .readdirSync(assetsDir)
        .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
        .map((f) => f.replace(/\.(png|jpe?g|webp)$/i, ''))
        .filter((slug) => SLUG_RE.test(slug) && valid.has(slug));
}

if (!slugs.length) {
    console.error('Użycie: node scripts/import-product-images-force.mjs slug1 slug2 ...');
    process.exit(1);
}

const sharp = (await import('sharp')).default;
fs.mkdirSync(outDir, { recursive: true });

let ok = 0;
const failed = [];

for (const slug of slugs) {
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
            .resize(800, 600, { fit: 'contain', background: { r: 255, g: 255, b: 255 } })
            .jpeg({ quality: 72, mozjpeg: true })
            .toFile(path.join(outDir, `${slug}.jpg`));
        ok++;
        console.log('OK', slug);
    } catch (e) {
        failed.push({ slug, reason: e.message });
    }
}

console.log(`\nZaimportowano (nadpisano): ${ok}/${slugs.length}`);
if (failed.length) {
    failed.forEach((f) => console.log(`FAIL ${f.slug}: ${f.reason}`));
    process.exit(1);
}
