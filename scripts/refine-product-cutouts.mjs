/**
 * U2Net-p cutout: przezroczyste tło, wypełnione dziury wewnętrzne, bez cienia na stole.
 * Użycie:
 *   node scripts/refine-product-cutouts.mjs
 *   node scripts/refine-product-cutouts.mjs --slug=makaron-udon
 *   node scripts/refine-product-cutouts.mjs --from-file=assets/foo.png --slug=bar
 *   node scripts/refine-product-cutouts.mjs --audit-only
 */
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import * as ort from 'onnxruntime-node';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const productsDir = path.join(root, 'images', 'products');
const bundleDir = path.join(root, 'deploy-bundle', 'images', 'products');

const MEAN = [0.485, 0.456, 0.406];
const STD = [0.229, 0.224, 0.225];
const MODEL_SIZE = 320;

const args = process.argv.slice(2);
const onlySlugs = args.filter((a) => a.startsWith('--slug=')).map((a) => a.slice(7));
const fromFileArg = args.find((a) => a.startsWith('--from-file='));
const fromFile = fromFileArg ? path.resolve(fromFileArg.slice(12)) : null;
const auditOnly = args.includes('--audit-only');
const force = args.includes('--force');
const limitArg = args.find((a) => a.startsWith('--limit='));
const limit = limitArg ? Number(limitArg.slice(8)) : Infinity;
const modelArg = args.find((a) => a.startsWith('--model='));
const modelPath = path.join(
    __dirname,
    'models',
    modelArg
        ? `${modelArg.slice(8)}.onnx`
        : fs.existsSync(path.join(__dirname, 'models', 'u2net.onnx'))
          ? 'u2net.onnx'
          : 'u2netp.onnx'
);
const refineOnlyFlag = args.includes('--refine-only');
const methodArg = args.find((a) => a.startsWith('--method='));
const methodFlag = methodArg ? methodArg.slice(9) : 'auto';

let session = null;

async function getSession() {
    if (!session) {
        session = await ort.InferenceSession.create(modelPath, {
            executionProviders: ['cpu'],
            graphOptimizationLevel: 'all',
        });
    }
    return session;
}

function idx(x, y, w, c = 4) {
    return (y * w + x) * c;
}

/** Soft shadows / gray table remnants near transparent edges (not dish). */
function removeSoftEdgeShadows(data, width, height) {
    const next = Buffer.from(data);
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const i = idx(x, y, width);
            const a = data[i + 3];
            if (a < 8) continue;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const lum = (r + g + b) / 3;
            const sat = max - min;
            // gray table / soft shadow — low sat; allow lighter grays too
            const looksLikeShadow = sat <= 36 && lum >= 35 && lum <= 230;
            if (!looksLikeShadow) continue;
            let nearClear = 0;
            for (let dy = -3; dy <= 3; dy++) {
                for (let dx = -3; dx <= 3; dx++) {
                    const nx = x + dx;
                    const ny = y + dy;
                    if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
                    if (data[idx(nx, ny, width) + 3] < 20) nearClear++;
                }
            }
            // require some clear neighbors; stronger if very close to edge
            if (nearClear >= 3) next[i + 3] = 0;
        }
    }
    return next;
}

/** Usuwa jasne halo / białe frędzle. */
function defringe(data, channels = 4) {
    for (let i = 0; i < data.length; i += channels) {
        const a = data[i + 3];
        if (a === 0) continue;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const lum = (r + g + b) / 3;
        if (a < 250 && lum > 205) data[i + 3] = 0;
        else if (r > 248 && g > 248 && b > 248) data[i + 3] = 0;
        else if (r > 240 && g > 240 && b > 240 && a < 230) data[i + 3] = 0;
    }
    return data;
}

/**
 * Dziury w środku produktu (niepołączone z krawędzią) = produkt.
 * Wypełnia przezroczyste regiony nieosiągalne z brzegów kolorem sąsiadów.
 */
function fillInteriorHoles(data, width, height) {
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
            if (data[i + 3] >= 12) continue;
            if (exterior[p]) continue;
            // hole inside product → sample nearest opaque
            let best = null;
            let bestD = Infinity;
            for (let r = 1; r <= 24 && best == null; r++) {
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
                if (best != null) break;
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

/** Dodatkowo zdejmij białe tło połączone z krawędzią (gdy maska zostawiła resztki). */
function clearEdgeWhite(data, width, height, lumMin = 238, satMax = 26) {
    const visited = new Uint8Array(width * height);
    const q = [];
    const isBg = (i) => {
        if (data[i + 3] < 8) return true;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const lum = (r + g + b) / 3;
        return lum >= lumMin && max - min <= satMax;
    };
    const push = (x, y) => {
        if (x < 0 || y < 0 || x >= width || y >= height) return;
        const p = y * width + x;
        if (visited[p]) return;
        const i = idx(x, y, width);
        if (!isBg(i)) return;
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
        const i = idx(x, y, width);
        data[i + 3] = 0;
        push(x + 1, y);
        push(x - 1, y);
        push(x, y + 1);
        push(x, y - 1);
    }
    return data;
}

async function predictMask(rgbRaw, width, height) {
    const sess = await getSession();
    // resize to 320x320 float NCHW
    const resized = await sharp(rgbRaw, { raw: { width, height, channels: 3 } })
        .resize(MODEL_SIZE, MODEL_SIZE, { fit: 'fill' })
        .raw()
        .toBuffer();

    const input = new Float32Array(1 * 3 * MODEL_SIZE * MODEL_SIZE);
    for (let y = 0; y < MODEL_SIZE; y++) {
        for (let x = 0; x < MODEL_SIZE; x++) {
            const si = (y * MODEL_SIZE + x) * 3;
            const px = resized[si] / 255;
            const py = resized[si + 1] / 255;
            const pz = resized[si + 2] / 255;
            const p = y * MODEL_SIZE + x;
            input[p] = (px - MEAN[0]) / STD[0];
            input[MODEL_SIZE * MODEL_SIZE + p] = (py - MEAN[1]) / STD[1];
            input[2 * MODEL_SIZE * MODEL_SIZE + p] = (pz - MEAN[2]) / STD[2];
        }
    }

    const feeds = {};
    const inputName = sess.inputNames[0];
    feeds[inputName] = new ort.Tensor('float32', input, [1, 3, MODEL_SIZE, MODEL_SIZE]);
    const results = await sess.run(feeds);
    const out = results[sess.outputNames[0]];
    const outData = out.data;
    // take last channel / squeeze
    let mask320;
    if (out.dims.length === 4) {
        const c = out.dims[1];
        const h = out.dims[2];
        const w = out.dims[3];
        const plane = (c - 1) * h * w;
        mask320 = outData.subarray(plane, plane + h * w);
    } else {
        mask320 = outData;
    }

    // normalize 0..1
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < mask320.length; i++) {
        const v = mask320[i];
        if (v < min) min = v;
        if (v > max) max = v;
    }
    const span = max - min || 1;
    const norm = new Float32Array(mask320.length);
    for (let i = 0; i < mask320.length; i++) norm[i] = (mask320[i] - min) / span;

    const maskBuf = Buffer.alloc(MODEL_SIZE * MODEL_SIZE);
    for (let i = 0; i < norm.length; i++) maskBuf[i] = Math.round(norm[i] * 255);

    const maskFull = await sharp(maskBuf, {
        raw: { width: MODEL_SIZE, height: MODEL_SIZE, channels: 1 },
    })
        .resize(width, height, { fit: 'fill' })
        .raw()
        .toBuffer();

    return maskFull;
}

/** Usuwa tło studio (białe/szare) po kolorze z narożników + odległości RGB. */
function studioFloodCutout(data, width, height) {
    const samples = [
        idx(2, 2, width),
        idx(width - 3, 2, width),
        idx(2, height - 3, width),
        idx(width - 3, height - 3, width),
        idx(Math.floor(width / 2), 2, width),
        idx(2, Math.floor(height / 2), width),
    ];
    const bg = samples.map((i) => [data[i], data[i + 1], data[i + 2]]);
    const avg = [0, 0, 0];
    for (const c of bg) {
        avg[0] += c[0];
        avg[1] += c[1];
        avg[2] += c[2];
    }
    avg[0] /= bg.length;
    avg[1] /= bg.length;
    avg[2] /= bg.length;

    const dist = (i) => {
        const dr = data[i] - avg[0];
        const dg = data[i + 1] - avg[1];
        const db = data[i + 2] - avg[2];
        return Math.sqrt(dr * dr + dg * dg + db * db);
    };

    // adaptive threshold: bg samples should be similar; generous for soft shadows + table
    let maxSample = 0;
    for (const i of samples) maxSample = Math.max(maxSample, dist(i));
    const thr = Math.max(48, maxSample + 40);

    const visited = new Uint8Array(width * height);
    const q = [];
    const push = (x, y) => {
        if (x < 0 || y < 0 || x >= width || y >= height) return;
        const p = y * width + x;
        if (visited[p]) return;
        const i = idx(x, y, width);
        if (dist(i) > thr) return;
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
        // diagonals help close thin bridges
        push(x + 1, y + 1);
        push(x - 1, y - 1);
        push(x + 1, y - 1);
        push(x - 1, y + 1);
    }

    // Expand: any near-bg pixel touching already-cleared becomes clear (kills leftover islands of table)
    let changed = true;
    let guard = 0;
    while (changed && guard++ < 12) {
        changed = false;
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const i = idx(x, y, width);
                if (data[i + 3] < 8) continue;
                if (dist(i) > thr + 12) continue;
                let touch = false;
                for (let dy = -1; dy <= 1 && !touch; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (data[idx(x + dx, y + dy, width) + 3] < 8) touch = true;
                    }
                }
                if (touch) {
                    data[i + 3] = 0;
                    changed = true;
                }
            }
        }
    }
    return data;
}

/** Chroma key (#00B140 green) — najczystsze wycięcie dla studio z greenscreen. */
function chromaKeyCutout(data, width, height, key = [0, 177, 64], thr = 72) {
    const [kr, kg, kb] = key;
    for (let i = 0; i < data.length; i += 4) {
        const dr = data[i] - kr;
        const dg = data[i + 1] - kg;
        const db = data[i + 2] - kb;
        const d = Math.sqrt(dr * dr + dg * dg + db * db);
        // also catch near-green / lime variations
        const gDom = data[i + 1] > data[i] + 25 && data[i + 1] > data[i + 2] + 25 && data[i + 1] > 90;
        if (d < thr || (gDom && d < thr + 35)) {
            data[i + 3] = 0;
        }
    }
    // flood from edges any remaining near-key pixels
    const visited = new Uint8Array(width * height);
    const q = [];
    const nearKey = (i) => {
        const dr = data[i] - kr;
        const dg = data[i + 1] - kg;
        const db = data[i + 2] - kb;
        const d = Math.sqrt(dr * dr + dg * dg + db * db);
        const gDom = data[i + 1] > data[i] + 20 && data[i + 1] > data[i + 2] + 20;
        return data[i + 3] < 8 || d < thr + 20 || (gDom && d < thr + 45);
    };
    const push = (x, y) => {
        if (x < 0 || y < 0 || x >= width || y >= height) return;
        const p = y * width + x;
        if (visited[p]) return;
        const i = idx(x, y, width);
        if (!nearKey(i)) return;
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
    // de-spill: remove green tint on semi-edge pixels
    for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 8) continue;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        if (g > r + 15 && g > b + 15) {
            data[i + 1] = Math.round((r + b) / 2);
        }
    }
    return data;
}

export async function cutoutBuffer(inputBuf, options = {}) {
    const { refineOnly = false, method = 'auto' } = options;
    const meta = await sharp(inputBuf).metadata();
    const letter = { r: 176, g: 182, b: 190, alpha: 1 };

    const finish = async (rgba, width, height) => {
        let data = rgba;
        data = removeSoftEdgeShadows(data, width, height);
        data = defringe(data);
        data = fillInteriorHoles(data, width, height);
        data = defringe(data);
        data = removeSoftEdgeShadows(data, width, height);
        const png = await sharp(data, { raw: { width, height, channels: 4 } })
            .png({ compressionLevel: 9 })
            .toBuffer();
        const jpg = await sharp(png)
            .flatten({ background: { r: 255, g: 255, b: 255 } })
            .jpeg({ quality: 90, mozjpeg: true })
            .toBuffer();
        const webp = await sharp(png)
            .webp({ quality: 82, alphaQuality: 90, effort: 4 })
            .toBuffer();
        return { png, jpg, webp, width, height };
    };

    if (refineOnly && meta.hasAlpha) {
        const refined = await sharp(inputBuf)
            .resize(800, 600, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .ensureAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });
        let data = Buffer.from(refined.data);
        const { width, height } = refined.info;
        // mild: only defringe + light shadow trim + fill holes
        data = defringe(data);
        // gentler shadow pass
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const i = idx(x, y, width);
                if (data[i + 3] < 8) continue;
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const lum = (r + g + b) / 3;
                const sat = Math.max(r, g, b) - Math.min(r, g, b);
                if (sat > 22 || lum < 50 || lum > 200) continue;
                let near = 0;
                for (const [dx, dy] of [
                    [1, 0],
                    [-1, 0],
                    [0, 1],
                    [0, -1],
                ]) {
                    if (data[idx(x + dx, y + dy, width) + 3] < 20) near++;
                }
                if (near >= 2) data[i + 3] = 0;
            }
        }
        data = fillInteriorHoles(data, width, height);
        data = defringe(data);
        const png = await sharp(data, { raw: { width, height, channels: 4 } })
            .png({ compressionLevel: 9 })
            .toBuffer();
        const jpg = await sharp(png)
            .flatten({ background: { r: 255, g: 255, b: 255 } })
            .jpeg({ quality: 90, mozjpeg: true })
            .toBuffer();
        const webp = await sharp(png)
            .webp({ quality: 82, alphaQuality: 90, effort: 4 })
            .toBuffer();
        return { png, jpg, webp, width, height };
    }

    if (method === 'chroma' || method === 'auto') {
        // detect green-screen dominance in corners
        const probe = await sharp(inputBuf)
            .resize(80, 60, { fit: 'fill' })
            .ensureAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });
        let greenHits = 0;
        for (let i = 0; i < probe.data.length; i += 4) {
            const r = probe.data[i];
            const g = probe.data[i + 1];
            const b = probe.data[i + 2];
            if (g > r + 30 && g > b + 30 && g > 80) greenHits++;
        }
        const greenRatio = greenHits / (probe.info.width * probe.info.height);
        if (method === 'chroma' || greenRatio > 0.25) {
            const base = await sharp(inputBuf)
                .resize(800, 600, { fit: 'contain', background: { r: 0, g: 177, b: 64, alpha: 1 } })
                .ensureAlpha()
                .raw()
                .toBuffer({ resolveWithObject: true });
            let rgba = Buffer.from(base.data);
            for (let i = 0; i < rgba.length; i += 4) rgba[i + 3] = 255;
            rgba = chromaKeyCutout(rgba, base.info.width, base.info.height);
            return finish(rgba, base.info.width, base.info.height);
        }
    }

    if (method === 'studio' || method === 'auto') {
        const base = await sharp(inputBuf)
            .resize(800, 600, { fit: 'contain', background: letter })
            .ensureAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });
        let rgba = Buffer.from(base.data);
        const { width, height } = base.info;
        for (let i = 0; i < rgba.length; i += 4) rgba[i + 3] = 255;
        rgba = studioFloodCutout(rgba, width, height);
        rgba = clearEdgeWhite(rgba, width, height, 245, 18);
        return finish(rgba, width, height);
    }

    const base = await sharp(inputBuf)
        .resize(800, 600, { fit: 'contain', background: letter })
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    const { data: rgb, info } = base;
    const { width, height } = info;
    const mask = await predictMask(rgb, width, height);

    let rgba = Buffer.alloc(width * height * 4);
    for (let i = 0, p = 0; i < width * height; i++, p += 4) {
        const m = mask[i];
        rgba[p] = rgb[i * 3];
        rgba[p + 1] = rgb[i * 3 + 1];
        rgba[p + 2] = rgb[i * 3 + 2];
        // soft threshold
        let a = m;
        if (m < 20) a = 0;
        else if (m > 200) a = 255;
        else a = Math.round(((m - 20) / 180) * 255);
        rgba[p + 3] = a;
    }

    rgba = clearEdgeWhite(rgba, width, height);
    rgba = removeSoftEdgeShadows(rgba, width, height);
    rgba = defringe(rgba);
    rgba = fillInteriorHoles(rgba, width, height);
    rgba = defringe(rgba);
    // second pass shadows after hole fill
    rgba = removeSoftEdgeShadows(rgba, width, height);

    const png = await sharp(rgba, { raw: { width, height, channels: 4 } })
        .png({ compressionLevel: 9 })
        .toBuffer();

    const jpg = await sharp(png)
        .flatten({ background: { r: 255, g: 255, b: 255 } })
        .jpeg({ quality: 90, mozjpeg: true })
        .toBuffer();

    const webp = await sharp(png)
        .webp({ quality: 82, alphaQuality: 90, effort: 4 })
        .toBuffer();

    return { png, jpg, webp, width, height };
}

function auditRgba(data, width, height) {
    let transparent = 0;
    let opaque = 0;
    let whiteEdge = 0;
    let softShadowEdge = 0;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = idx(x, y, width);
            const a = data[i + 3];
            if (a < 10) {
                transparent++;
                continue;
            }
            opaque++;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const lum = (r + g + b) / 3;
            const sat = Math.max(r, g, b) - Math.min(r, g, b);
            let nearClear = false;
            for (let dy = -1; dy <= 1 && !nearClear; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    const nx = x + dx;
                    const ny = y + dy;
                    if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
                    if (data[idx(nx, ny, width) + 3] < 20) nearClear = true;
                }
            }
            if (!nearClear) continue;
            if (lum > 235 && sat < 20) whiteEdge++;
            if (sat <= 28 && lum >= 40 && lum <= 200) softShadowEdge++;
        }
    }
    const total = width * height;
    return {
        transPct: (100 * transparent) / total,
        opaquePct: (100 * opaque) / total,
        whiteEdge,
        softShadowEdge,
        ok: transparent > total * 0.08 && transparent < total * 0.97 && whiteEdge < 400 && softShadowEdge < 800,
    };
}

async function auditFile(pngPath) {
    const { data, info } = await sharp(pngPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    return auditRgba(data, info.width, info.height);
}

function writeOutputs(slug, { png, jpg, webp }) {
    const sleep = (ms) => {
        const end = Date.now() + ms;
        while (Date.now() < end) {
            /* spin */
        }
    };
    const write = (p, buf) => {
        fs.mkdirSync(path.dirname(p), { recursive: true });
        for (let i = 0; i < 8; i++) {
            try {
                fs.writeFileSync(p, buf);
                return;
            } catch {
                sleep(200 * (i + 1));
            }
        }
        const tmp = path.join(os.tmpdir(), `pmx-out-${path.basename(p)}`);
        fs.writeFileSync(tmp, buf);
        fs.copyFileSync(tmp, p);
    };
    write(path.join(productsDir, `${slug}.png`), png);
    write(path.join(productsDir, `${slug}.jpg`), jpg);
    write(path.join(productsDir, `${slug}.webp`), webp);
    if (fs.existsSync(path.dirname(bundleDir))) {
        write(path.join(bundleDir, `${slug}.png`), png);
        write(path.join(bundleDir, `${slug}.jpg`), jpg);
        write(path.join(bundleDir, `${slug}.webp`), webp);
    }
}

async function processSlug(slug, inputPath, opts = {}) {
    const buf = fs.readFileSync(inputPath);
    const out = await cutoutBuffer(buf, opts);
    writeOutputs(slug, out);
    const { data, info } = await sharp(out.png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const a = auditRgba(data, info.width, info.height);
    return a;
}

async function main() {
    if (!fs.existsSync(modelPath)) {
        console.error('Brak modelu:', modelPath);
        process.exit(1);
    }

    if (fromFile) {
        const slug = onlySlugs[0];
        if (!slug) {
            console.error('Podaj --slug= przy --from-file=');
            process.exit(1);
        }
        console.log('Cutout from file', fromFile, '→', slug, 'model=', path.basename(modelPath));
        const a = await processSlug(slug, fromFile, { refineOnly: refineOnlyFlag, method: methodFlag });
        console.log(slug, a);
        return;
    }

    let pngs = fs
        .readdirSync(productsDir)
        .filter((f) => f.endsWith('.png') && !f.startsWith('_'))
        .map((f) => f.replace(/\.png$/i, ''));

    if (onlySlugs.length) pngs = pngs.filter((s) => onlySlugs.includes(s));
    pngs = pngs.slice(0, limit);

    if (auditOnly) {
        let bad = 0;
        for (const slug of pngs) {
            const a = await auditFile(path.join(productsDir, `${slug}.png`));
            if (!a.ok) {
                bad++;
                console.log('BAD', slug, a);
            }
        }
        console.log(`Audit: ${bad}/${pngs.length} problematycznych`);
        return;
    }

    console.log(`Przetwarzam ${pngs.length} zdjęć… model=${path.basename(modelPath)} refineOnly=${refineOnlyFlag}`);
    let ok = 0;
    let fail = 0;
    const failed = [];
    const started = Date.now();

    for (let i = 0; i < pngs.length; i++) {
        const slug = pngs[i];
        const src = path.join(productsDir, `${slug}.png`);
        try {
            const a = await processSlug(slug, src, { refineOnly: refineOnlyFlag, method: methodFlag });
            ok++;
            if (!a.ok) failed.push({ slug, ...a });
            if ((i + 1) % 10 === 0 || i === pngs.length - 1) {
                const elapsed = ((Date.now() - started) / 1000).toFixed(0);
                console.log(`[${i + 1}/${pngs.length}] ${slug} trans=${a.transPct.toFixed(1)}% (${elapsed}s)`);
            }
        } catch (err) {
            fail++;
            console.error('FAIL', slug, err.message);
        }
    }

    console.log(`Done ok=${ok} fail=${fail} suspect=${failed.length} in ${((Date.now() - started) / 1000).toFixed(1)}s`);
    if (failed.length) {
        fs.writeFileSync(
            path.join(root, 'scripts', 'cutout-suspects.json'),
            JSON.stringify(failed, null, 2)
        );
        console.log('Zapisano scripts/cutout-suspects.json');
    }
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
    main().catch((e) => {
        console.error(e);
        process.exit(1);
    });
}
