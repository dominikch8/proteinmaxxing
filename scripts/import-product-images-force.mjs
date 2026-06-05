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

const args = process.argv.slice(2).filter((a) => a !== '--assets' && !a.startsWith('--'));

let slugs = args;
if (args[0] === '--all-from-assets') {
    slugs = fs
        .readdirSync(assetsDir)
        .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
        .map((f) => f.replace(/\.(png|jpe?g|webp)$/i, ''));
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
            .resize(800, 600, { fit: 'cover', position: 'centre' })
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
