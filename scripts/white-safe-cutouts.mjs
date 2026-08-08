/**
 * White-safe cutouts for products that got over-erased.
 * node scripts/white-safe-cutouts.mjs slug1 slug2 ...
 */
import fs from 'fs';
import path from 'path';
import os from 'os';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'images', 'products');
const bundle = path.join(root, 'deploy-bundle', 'images', 'products');

function idx(x, y, w) {
    return (y * w + x) * 4;
}

function clearEdgeWhite(data, width, height, lumMin = 246, satMax = 16) {
    const visited = new Uint8Array(width * height);
    const q = [];
    const isBg = (i) => {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        return (r + g + b) / 3 >= lumMin && max - min <= satMax;
    };
    const push = (x, y) => {
        if (x < 0 || y < 0 || x >= width || y >= height) return;
        const p = y * width + x;
        if (visited[p]) return;
        if (!isBg(idx(x, y, width))) return;
        visited[p] = 1;
        q.push(x, y);
    };
    for (let x = 0; x < width; x++) {
        push(x, 0);
        push(x, height - 1);
    }
    for (let y = 0; y < height; y++) {
        push(0, y);
        push(width - 1, y);
    }
    for (let qi = 0; qi < q.length; qi += 2) {
        const x = q[qi];
        const y = q[qi + 1];
        data[idx(x, y, width) + 3] = 0;
        push(x + 1, y);
        push(x - 1, y);
        push(x, y + 1);
        push(x, y - 1);
    }
    return data;
}

function fillHoles(data, width, height) {
    const exterior = new Uint8Array(width * height);
    const q = [];
    const push = (x, y) => {
        if (x < 0 || y < 0 || x >= width || y >= height) return;
        const p = y * width + x;
        if (exterior[p]) return;
        if (data[idx(x, y, width) + 3] >= 12) return;
        exterior[p] = 1;
        q.push(x, y);
    };
    for (let x = 0; x < width; x++) {
        push(x, 0);
        push(x, height - 1);
    }
    for (let y = 0; y < height; y++) {
        push(0, y);
        push(width - 1, y);
    }
    for (let qi = 0; qi < q.length; qi += 2) {
        const x = q[qi];
        const y = q[qi + 1];
        push(x + 1, y);
        push(x - 1, y);
        push(x, y + 1);
        push(x, y - 1);
    }
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const p = y * width + x;
            const i = idx(x, y, width);
            if (data[i + 3] >= 12 || exterior[p]) continue;
            let best = null;
            let bestD = 1e9;
            for (let r = 1; r <= 16 && best == null; r++) {
                for (let dy = -r; dy <= r; dy++) {
                    for (let dx = -r; dx <= r; dx++) {
                        if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
                        const nx = x + dx;
                        const ny = y + dy;
                        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
                        const ni = idx(nx, ny, width);
                        if (data[ni + 3] < 200) continue;
                        const d = dx * dx + dy * dy;
                        if (d < bestD) {
                            bestD = d;
                            best = ni;
                        }
                    }
                }
            }
            if (best != null) {
                data[i] = data[best];
                data[i + 1] = data[best + 1];
                data[i + 2] = data[best + 2];
                data[i + 3] = 255;
            }
        }
    }
    return data;
}

async function writeRetry(p, buf) {
    fs.mkdirSync(path.dirname(p), { recursive: true });
    for (let i = 0; i < 10; i++) {
        try {
            fs.writeFileSync(p, buf);
            return;
        } catch {
            await new Promise((r) => setTimeout(r, 250 * (i + 1)));
        }
    }
    const tmp = path.join(os.tmpdir(), `pmx-${path.basename(p)}`);
    fs.writeFileSync(tmp, buf);
    fs.copyFileSync(tmp, p);
}

async function cut(slug) {
    const jpg = path.join(dir, `${slug}.jpg`);
    const pngp = path.join(dir, `${slug}.png`);
    const src = fs.existsSync(jpg) ? jpg : pngp;
    const base = await sharp(fs.readFileSync(src))
        .resize(800, 600, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
    let data = Buffer.from(base.data);
    const { width, height } = base.info;
    for (let i = 0; i < data.length; i += 4) data[i + 3] = 255;
    data = clearEdgeWhite(data, width, height);
    for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] === 0) continue;
        const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
        if (data[i + 3] < 230 && lum > 230) data[i + 3] = 0;
        if (data[i] > 250 && data[i + 1] > 250 && data[i + 2] > 250) data[i + 3] = 0;
    }
    data = fillHoles(data, width, height);
    const outPng = await sharp(data, { raw: { width, height, channels: 4 } }).png().toBuffer();
    const outJpg = await sharp(outPng).flatten({ background: '#fff' }).jpeg({ quality: 90 }).toBuffer();
    const outWebp = await sharp(outPng).webp({ quality: 82, alphaQuality: 90 }).toBuffer();
    await writeRetry(pngp, outPng);
    await writeRetry(jpg, outJpg);
    await writeRetry(path.join(dir, `${slug}.webp`), outWebp);
    await writeRetry(path.join(bundle, `${slug}.png`), outPng);
    await writeRetry(path.join(bundle, `${slug}.jpg`), outJpg);
    await writeRetry(path.join(bundle, `${slug}.webp`), outWebp);
    let t = 0;
    for (let i = 0; i < data.length; i += 4) if (data[i + 3] < 10) t++;
    console.log(slug, 'trans%', ((100 * t) / (width * height)).toFixed(1));
}

const slugs = process.argv.slice(2);
for (const s of slugs) {
    try {
        await cut(s);
    } catch (e) {
        console.error('FAIL', s, e.message);
    }
}
