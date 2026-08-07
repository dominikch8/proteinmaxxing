/**
 * PNG (z alfą) → WebP z przezroczystością do dark mode (bez multiply na JPG).
 * node scripts/build-product-webp.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const dir = path.join(root, 'images', 'products');
const bundleDir = path.join(root, 'deploy-bundle', 'images', 'products');

const pngs = fs.readdirSync(dir).filter((f) => f.endsWith('.png'));
let ok = 0;
let fail = 0;
const started = Date.now();

async function convertOne(name) {
    const src = path.join(dir, name);
    const outName = name.replace(/\.png$/i, '.webp');
    const out = path.join(dir, outName);
    const buf = await sharp(src)
        .ensureAlpha()
        .webp({ quality: 80, alphaQuality: 85, effort: 4 })
        .toBuffer();
    fs.writeFileSync(out, buf);
    if (fs.existsSync(bundleDir)) {
        fs.writeFileSync(path.join(bundleDir, outName), buf);
    }
    return buf.length;
}

const concurrency = 6;
let i = 0;
async function worker() {
    while (i < pngs.length) {
        const idx = i++;
        const name = pngs[idx];
        try {
            const size = await convertOne(name);
            ok++;
            if (ok % 40 === 0 || ok === pngs.length) {
                const mb = (size / 1024).toFixed(0);
                console.log(`[${ok}/${pngs.length}] ${name} → ${(size / 1024).toFixed(0)} KB`);
            }
        } catch (err) {
            fail++;
            console.error(`FAIL ${name}:`, err.message);
        }
    }
}

await Promise.all(Array.from({ length: concurrency }, () => worker()));
const totalBytes = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.webp'))
    .reduce((s, f) => s + fs.statSync(path.join(dir, f)).size, 0);
console.log(
    `Done: ok=${ok} fail=${fail} webpTotal=${(totalBytes / 1e6).toFixed(1)} MB in ${((Date.now() - started) / 1000).toFixed(1)}s`
);
