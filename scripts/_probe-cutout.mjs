/**
 * Sonda: surowy obraz z fluxa → pomiar bieli tła → porównanie metod cutoutu.
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { removeEdgeBackground, defringeLightHalos } from './remove-edge-background.mjs';
import { cutoutBuffer } from './refine-product-cutouts.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, '_tmp-probe');
fs.mkdirSync(outDir, { recursive: true });
const sharp = (await import('sharp')).default;

const CASES = [
    { slug: 'krolik-udziec', prompt: 'raw rabbit leg meat, fresh meat or poultry' },
    { slug: 'jezyny', prompt: 'fresh blackberries, fresh fruit' },
    { slug: 'jagniecina-comber', prompt: 'raw lamb saddle cut, fresh meat' },
    { slug: 'bulgur-suchy', prompt: 'dry bulgur wheat groats in a small bowl, grain product' }
];

function seedFromSlug(slug) {
    const h = crypto.createHash('md5').update(`${slug}:v3`).digest();
    return h.readUInt32BE(0) % 2147483646;
}

async function cornerWhite(buf) {
    const { data, info } = await sharp(buf).resize(120, 90).raw().toBuffer({ resolveWithObject: true });
    const { width: w, height: h, channels: ch } = info;
    let white = 0;
    for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
            const i = (y * w + x) * ch;
            if (data[i] > 235 && data[i + 1] > 235 && data[i + 2] > 235) white++;
        }
    const corners = [[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1]];
    let cw = 0;
    for (const [x, y] of corners) {
        const i = (y * w + x) * ch;
        if (data[i] > 230 && data[i + 1] > 230 && data[i + 2] > 230) cw++;
    }
    return { white: white / (w * h), corners: cw };
}

async function ratioOf(png) {
    const { data, info } = await sharp(png).resize(100, 75).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let t = 0, solid = 0;
    const total = info.width * info.height;
    for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 16) t++;
        else if (data[i + 3] > 240) solid++;
    }
    return { transp: t / total, solid: solid / total };
}

async function floodCutout(buf) {
    const r = await sharp(buf).resize(800, 600, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let data = removeEdgeBackground(r.data, r.info.width, r.info.height, 4, { lumMin: 236, satMax: 32 });
    data = defringeLightHalos(data, 4);
    return sharp(data, { raw: { width: r.info.width, height: r.info.height, channels: 4 } }).png().toBuffer();
}

for (const c of CASES) {
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(c.prompt + ', centered on pure white background, soft shadow, minimalist studio product photo, photorealistic, no text, no logo')}?width=800&height=600&nologo=true&model=flux&seed=${seedFromSlug(c.slug)}`;
    process.stdout.write(`${c.slug} … `);
    const res = await fetch(url, { headers: { 'User-Agent': 'Proteiner/1.0', Referer: 'https://proteiner.pl/' }, signal: AbortSignal.timeout(120000) });
    if (!res.ok) { console.log('HTTP', res.status); continue; }
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(path.join(outDir, `${c.slug}-raw.jpg`), buf);
    const bg = await cornerWhite(buf);
    const u2 = await cutoutBuffer(buf, { refineOnly: false, method: 'auto' });
    const u2r = await ratioOf(u2.png);
    const fl = await floodCutout(buf);
    const flr = await ratioOf(fl);
    fs.writeFileSync(path.join(outDir, `${c.slug}-u2.png`), u2.png);
    fs.writeFileSync(path.join(outDir, `${c.slug}-flood.png`), fl);
    console.log(`rawWhite ${(bg.white * 100).toFixed(0)}% corners ${bg.corners}/4 | U2Net transp ${(u2r.transp * 100).toFixed(0)}% solid ${(u2r.solid * 100).toFixed(0)}% | Flood transp ${(flr.transp * 100).toFixed(0)}% solid ${(flr.solid * 100).toFixed(0)}%`);
}
console.log('saved to', outDir);
