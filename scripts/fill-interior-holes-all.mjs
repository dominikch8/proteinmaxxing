/**
 * Wypełnia dziury wewnątrz produktów (przezroczyste regiony niepołączone z brzegiem).
 * node scripts/fill-interior-holes-all.mjs
 * node scripts/fill-interior-holes-all.mjs --min=50
 */
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const productsDir = path.join(root, 'images', 'products');
const bundleDir = path.join(root, 'deploy-bundle', 'images', 'products');
const minArg = process.argv.find((a) => a.startsWith('--min='));
const minHoles = minArg ? Number(minArg.slice(6)) : 40;

function idx(x, y, w) {
    return (y * w + x) * 4;
}

async function writeRetry(p, buf) {
    fs.mkdirSync(path.dirname(p), { recursive: true });
    for (let i = 0; i < 10; i++) {
        try {
            fs.writeFileSync(p, buf);
            return;
        } catch {
            await new Promise((r) => setTimeout(r, 200 * (i + 1)));
        }
    }
    const tmp = path.join(os.tmpdir(), `pmx-${path.basename(p)}`);
    fs.writeFileSync(tmp, buf);
    fs.copyFileSync(tmp, p);
}

/** Wypełnia tylko małe dziury (nie otwór w uchwycie kubka). */
function fillInteriorHoles(data, width, height, maxHolePx = 2200) {
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

    const seen = new Uint8Array(width * height);
    let filled = 0;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const p = y * width + x;
            const i = idx(x, y, width);
            if (data[i + 3] >= 12 || exterior[p] || seen[p]) continue;
            const stack = [x, y];
            const cells = [];
            seen[p] = 1;
            while (stack.length) {
                const cy = stack.pop();
                const cx = stack.pop();
                cells.push(cx, cy);
                for (const [dx, dy] of [
                    [1, 0],
                    [-1, 0],
                    [0, 1],
                    [0, -1],
                ]) {
                    const nx = cx + dx;
                    const ny = cy + dy;
                    if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
                    const np = ny * width + nx;
                    if (seen[np] || exterior[np]) continue;
                    if (data[idx(nx, ny, width) + 3] >= 12) continue;
                    seen[np] = 1;
                    stack.push(nx, ny);
                }
            }
            if (cells.length / 2 > maxHolePx) continue;
            for (let ci = 0; ci < cells.length; ci += 2) {
                const cx = cells[ci];
                const cy = cells[ci + 1];
                const ii = idx(cx, cy, width);
                let best = null;
                let bestD = Infinity;
                for (let r = 1; r <= 28 && best == null; r++) {
                    for (let dy = -r; dy <= r; dy++) {
                        for (let dx = -r; dx <= r; dx++) {
                            if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
                            const nx = cx + dx;
                            const ny = cy + dy;
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
                    data[ii] = data[best];
                    data[ii + 1] = data[best + 1];
                    data[ii + 2] = data[best + 2];
                    data[ii + 3] = 255;
                    filled++;
                }
            }
        }
    }
    return filled;
}

function countInteriorHoles(data, width, height) {
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
    let holePx = 0;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const p = y * width + x;
            if (exterior[p]) continue;
            if (data[idx(x, y, width) + 3] < 12) holePx++;
        }
    }
    return holePx;
}

const files = fs.readdirSync(productsDir).filter((f) => f.endsWith('.png'));
let fixed = 0;
let totalFilled = 0;
for (const f of files) {
    const slug = f.replace(/\.png$/i, '');
    const pngPath = path.join(productsDir, f);
    try {
        const base = await sharp(fs.readFileSync(pngPath)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
        const { width, height } = base.info;
        const data = Buffer.from(base.data);
        const before = countInteriorHoles(data, width, height);
        if (before < minHoles) continue;
        const filled = fillInteriorHoles(data, width, height);
        if (filled < 10) continue;
        const after = countInteriorHoles(data, width, height);
        const png = await sharp(data, { raw: { width, height, channels: 4 } }).png().toBuffer();
        const jpg = await sharp(png).flatten({ background: '#fff' }).jpeg({ quality: 90 }).toBuffer();
        const webp = await sharp(png).webp({ quality: 82, alphaQuality: 90 }).toBuffer();
        for (const dir of [productsDir, bundleDir]) {
            await writeRetry(path.join(dir, `${slug}.png`), png);
            await writeRetry(path.join(dir, `${slug}.jpg`), jpg);
            await writeRetry(path.join(dir, `${slug}.webp`), webp);
        }
        fixed++;
        totalFilled += filled;
        console.log(`${slug}: holes ${before}→${after} filled=${filled}`);
    } catch (e) {
        console.error('FAIL', slug, e.message);
    }
}
console.log(`Done. Fixed ${fixed} products, filled ${totalFilled} pixels.`);
