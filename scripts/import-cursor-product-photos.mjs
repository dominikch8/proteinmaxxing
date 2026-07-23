/**
 * Importuje wygenerowane zdjęcia z assets/ (Cursor) do images/products/
 * z przezroczystym PNG + JPG na białym tle.
 *
 * node scripts/import-cursor-product-photos.mjs
 * node scripts/import-cursor-product-photos.mjs --dir="C:/path/to/assets"
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { removeEdgeBackground, defringeLightHalos } from './remove-edge-background.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'images', 'products');
const defaultAssets = path.join(
    process.env.USERPROFILE || '',
    '.cursor',
    'projects',
    'c-Users-Administrator-xD-Desktop-probystronyxd',
    'assets'
);
const dirArg = process.argv.find((a) => a.startsWith('--dir='));
const assetsDir = dirArg ? path.resolve(dirArg.split('=')[1]) : defaultAssets;

const prompts = JSON.parse(fs.readFileSync(path.join(root, 'scripts', 'product-photo-prompts.json'), 'utf8'));
const slugSet = new Set(prompts.map((p) => p.slug));

const sharp = (await import('sharp')).default;

async function toTransparentPng(inputBuf) {
    const resized = await sharp(inputBuf)
        .resize(800, 600, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
    let data = removeEdgeBackground(resized.data, resized.info.width, resized.info.height, 4, {
        lumMin: 236,
        satMax: 32
    });
    data = defringeLightHalos(data, 4);
    for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] === 0) continue;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        if (r >= 250 && g >= 250 && b >= 250) data[i + 3] = 0;
        else if (r > 242 && g > 242 && b > 242) {
            const whiteness = (r + g + b) / 3;
            data[i + 3] = Math.max(0, Math.min(255, Math.round((255 - whiteness) * 10)));
        }
    }
    return sharp(data, {
        raw: { width: resized.info.width, height: resized.info.height, channels: 4 }
    })
        .png()
        .toBuffer();
}

if (!fs.existsSync(assetsDir)) {
    console.error('Brak katalogu assets:', assetsDir);
    process.exit(1);
}

const files = fs.readdirSync(assetsDir).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));
let ok = 0;
for (const file of files) {
    const slug = file.replace(/\.(png|jpe?g|webp)$/i, '');
    if (!slugSet.has(slug)) continue;
    const buf = fs.readFileSync(path.join(assetsDir, file));
    const png = await toTransparentPng(buf);
    fs.writeFileSync(path.join(outDir, `${slug}.png`), png);
    await sharp(png)
        .flatten({ background: { r: 255, g: 255, b: 255 } })
        .jpeg({ quality: 90, mozjpeg: true })
        .toFile(path.join(outDir, `${slug}.jpg`));
    ok++;
    console.log('✓', slug);
}
console.log(`Zaimportowano ${ok} zdjęć → ${outDir}`);
