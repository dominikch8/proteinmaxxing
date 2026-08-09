/**
 * Lekko rozmywa kontury alfa (soft edge / fade) na wszystkich PNG produktów.
 * node scripts/feather-product-edges.mjs
 * node scripts/feather-product-edges.mjs --slug=makaron-udon
 * node scripts/feather-product-edges.mjs --sigma=1.6
 */
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const dir = path.join(root, 'images', 'products');
const bundleDir = path.join(root, 'deploy-bundle', 'images', 'products');

const args = process.argv.slice(2);
const onlySlugs = args.filter((a) => a.startsWith('--slug=')).map((a) => a.slice(7));
const sigmaArg = args.find((a) => a.startsWith('--sigma='));
/** Softness of edge fade (1.2–2.2 looks natural). */
const SIGMA = sigmaArg ? Number(sigmaArg.slice(8)) : 1.55;

function sleep(ms) {
    const end = Date.now() + ms;
    while (Date.now() < end) {
        /* spin */
    }
}

function writeRetry(p, buf) {
    fs.mkdirSync(path.dirname(p), { recursive: true });
    for (let i = 0; i < 8; i++) {
        try {
            fs.writeFileSync(p, buf);
            return;
        } catch {
            sleep(180 * (i + 1));
        }
    }
    const tmp = path.join(os.tmpdir(), `pmx-feather-${path.basename(p)}`);
    fs.writeFileSync(tmp, buf);
    fs.copyFileSync(tmp, p);
}

/**
 * Softens hard cutout edges: slight pre-shrink of opaque core + gaussian blur on alpha.
 */
async function featherPng(inputBuf) {
    const { data, info } = await sharp(inputBuf)
        .ensureAlpha()
        .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
        .raw()
        .toBuffer({ resolveWithObject: true });

    const { width, height } = info;
    const n = width * height;
    const alpha = Buffer.alloc(n);
    for (let i = 0; i < n; i++) alpha[i] = data[i * 4 + 3];

    // Mild erode: if a pixel is opaque but has a transparent neighbor, pull alpha down a bit
    // so the blur creates a fade instead of a thick halo of full opacity.
    const eroded = Buffer.from(alpha);
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const p = y * width + x;
            if (alpha[p] < 200) continue;
            let minN = 255;
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    const v = alpha[(y + dy) * width + (x + dx)];
                    if (v < minN) minN = v;
                }
            }
            if (minN < 40) eroded[p] = Math.min(alpha[p], 160);
            else if (minN < 120) eroded[p] = Math.min(alpha[p], 210);
        }
    }

    const blurred = await sharp(eroded, { raw: { width, height, channels: 1 } })
        .blur(SIGMA)
        .raw()
        .toBuffer();

    const out = Buffer.from(data);
    for (let i = 0; i < n; i++) {
        // Keep RGB; use softened alpha. Never raise alpha where original was fully clear.
        const a0 = alpha[i];
        const a1 = blurred[i];
        out[i * 4 + 3] = a0 === 0 ? 0 : Math.min(a0, a1);
    }

    const png = await sharp(out, { raw: { width, height, channels: 4 } })
        .png({ compressionLevel: 9 })
        .toBuffer();

    const jpg = await sharp(png)
        .flatten({ background: { r: 255, g: 255, b: 255 } })
        .jpeg({ quality: 90, mozjpeg: true })
        .toBuffer();

    const webp = await sharp(png)
        .webp({ quality: 82, alphaQuality: 92, effort: 4 })
        .toBuffer();

    return { png, jpg, webp };
}

let slugs = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.png') && !f.startsWith('_') && !f.startsWith('.'))
    .map((f) => f.replace(/\.png$/i, ''));

if (onlySlugs.length) slugs = slugs.filter((s) => onlySlugs.includes(s));

console.log(`Feather edges: ${slugs.length} products, sigma=${SIGMA}`);
const started = Date.now();
let ok = 0;
let fail = 0;

for (let i = 0; i < slugs.length; i++) {
    const slug = slugs[i];
    try {
        const src = fs.readFileSync(path.join(dir, `${slug}.png`));
        const out = await featherPng(src);
        writeRetry(path.join(dir, `${slug}.png`), out.png);
        writeRetry(path.join(dir, `${slug}.jpg`), out.jpg);
        writeRetry(path.join(dir, `${slug}.webp`), out.webp);
        if (fs.existsSync(path.dirname(bundleDir))) {
            writeRetry(path.join(bundleDir, `${slug}.png`), out.png);
            writeRetry(path.join(bundleDir, `${slug}.jpg`), out.jpg);
            writeRetry(path.join(bundleDir, `${slug}.webp`), out.webp);
        }
        ok++;
        if ((i + 1) % 40 === 0 || i === slugs.length - 1) {
            console.log(`[${i + 1}/${slugs.length}] ${slug} (${((Date.now() - started) / 1000).toFixed(0)}s)`);
        }
    } catch (err) {
        fail++;
        console.error('FAIL', slug, err.message);
    }
}

console.log(`Done ok=${ok} fail=${fail} in ${((Date.now() - started) / 1000).toFixed(1)}s`);
