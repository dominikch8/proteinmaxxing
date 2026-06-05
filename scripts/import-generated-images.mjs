/**
 * Kompresuje JPG z folderu assets Cursor → images/products/{slug}.jpg (800×600, ~100–150 KB)
 * Użycie: node scripts/import-generated-images.mjs [ścieżka-do-assets]
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

const sharp = (await import('sharp')).default;
fs.mkdirSync(outDir, { recursive: true });

if (!fs.existsSync(assetsDir)) {
    console.error('Brak folderu assets:', assetsDir);
    process.exit(1);
}

const files = fs.readdirSync(assetsDir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
if (!files.length) {
    console.log('Brak plików do importu w', assetsDir);
    process.exit(0);
}

let done = 0;
for (const f of files) {
    const src = path.join(assetsDir, f);
    const base = f.replace(/\.(jpe?g|png|webp)$/i, '');
    const dest = path.join(outDir, `${base}.jpg`);
    await sharp(src)
        .resize(800, 600, { fit: 'cover', position: 'centre' })
        .jpeg({ quality: 72, mozjpeg: true })
        .toFile(dest);
    fs.unlinkSync(src);
    done++;
}

console.log(`Zaimportowano i skompresowano: ${done} → ${outDir}`);
