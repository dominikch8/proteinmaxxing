/**
 * Import Cursor assets → adaptive edge-cutout → images/products
 * node scripts/import-asset-slugs.mjs slug1 slug2 ...
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { removeEdgeBackground, removeConnectedShadows } from './remove-edge-background.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'images', 'products');
const assetsDir = path.join(
    process.env.USERPROFILE || '',
    '.cursor',
    'projects',
    'c-Users-Administrator-xD-Desktop-probystronyxd',
    'assets'
);
const slugs = process.argv.slice(2).filter((a) => !a.startsWith('-'));
if (!slugs.length) {
    console.error('Usage: node scripts/import-asset-slugs.mjs slug1 slug2 ...');
    process.exit(1);
}

const sharp = (await import('sharp')).default;

async function toTransparentPng(inputBuf) {
    const resized = await sharp(inputBuf)
        .resize(800, 600, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
    const { data: raw, info } = resized;
    const w = info.width;
    const h = info.height;
    const sample = (x, y) => {
        const i = (y * w + x) * 4;
        return (raw[i] + raw[i + 1] + raw[i + 2]) / 3;
    };
    const cornerLum =
        (sample(2, 2) + sample(w - 3, 2) + sample(2, h - 3) + sample(w - 3, h - 3)) / 4;
    const lumMin = cornerLum >= 245 ? 248 : cornerLum >= 220 ? 232 : 210;
    const satMax = cornerLum >= 245 ? 18 : 28;
    let data = removeEdgeBackground(raw, w, h, 4, { lumMin, satMax });
    data = removeConnectedShadows(data, w, h, 4);
    for (let i = 0; i < data.length; i += 4) {
        const a = data[i + 3];
        if (a === 0 || a >= 250) continue;
        const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
        if (a < 160 && lum > Math.max(240, lumMin - 2)) data[i + 3] = 0;
    }
    return sharp(data, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
}

for (const slug of slugs) {
    const candidates = ['.png', '.jpg', '.jpeg', '.webp'].map((ext) => path.join(assetsDir, slug + ext));
    const src = candidates.find((p) => fs.existsSync(p));
    if (!src) {
        console.error('brak assetu', slug);
        continue;
    }
    const png = await toTransparentPng(fs.readFileSync(src));
    fs.writeFileSync(path.join(outDir, `${slug}.png`), png);
    await sharp(png)
        .flatten({ background: { r: 255, g: 255, b: 255 } })
        .jpeg({ quality: 90, mozjpeg: true })
        .toFile(path.join(outDir, `${slug}.jpg`));
    await sharp(png)
        .webp({ quality: 82, alphaQuality: 90, effort: 4 })
        .toFile(path.join(outDir, `${slug}.webp`));
    console.log('✓', slug);
}
