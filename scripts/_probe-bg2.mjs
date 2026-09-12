/**
 * Sonda: charakterystyka tła fluxa + adaptacyjny flood-fill (magic wand).
 * node scripts/_probe-bg2.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const sharp = (await import('sharp')).default;

function idx(x, y, w) { return (y * w + x) * 4; }

/** Mediana koloru pikseli na ramce (grubość t). */
function borderMedian(data, w, h, t = 8) {
    const px = [[], [], []];
    const add = (x, y) => { const i = idx(x, y, w); px[0].push(data[i]); px[1].push(data[i + 1]); px[2].push(data[i + 2]); };
    for (let x = 0; x < w; x++) for (let y = 0; y < t; y++) { add(x, y); add(x, h - 1 - y); }
    for (let y = 0; y < h; y++) for (let x = 0; x < t; x++) { add(x, y); add(w - 1 - x, y); }
    const med = (arr) => { arr.sort((a, b) => a - b); return arr[arr.length >> 1]; };
    return [med(px[0]), med(px[1]), med(px[2])];
}

/** BFS od krawędzi: piksel tła jeśli dist(col, ref) <= tol; zwraca nową alfę. */
function adaptiveFlood(data, w, h, ref, tol) {
    const out = Buffer.from(data);
    const visited = new Uint8Array(w * h);
    const qx = new Int32Array(w * h), qy = new Int32Array(w * h);
    let qh = 0, qt = 0;
    const near = (i) => {
        const dr = out[i] - ref[0], dg = out[i + 1] - ref[1], db = out[i + 2] - ref[2];
        return Math.sqrt(dr * dr + dg * dg + db * db) <= tol;
    };
    const push = (x, y) => {
        if (x < 0 || y < 0 || x >= w || y >= h) return;
        const p = y * w + x;
        if (visited[p]) return;
        if (!near(idx(x, y, w))) return;
        visited[p] = 1; qx[qt] = x; qy[qt] = y; qt++;
    };
    for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
    for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
    while (qh < qt) {
        const x = qx[qh], y = qy[qh]; qh++;
        out[idx(x, y, w) + 3] = 0;
        push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1);
    }
    return out;
}

function stats(data) {
    let t = 0, solid = 0;
    const total = data.length / 4;
    for (let i = 0; i < data.length; i += 4) { if (data[i + 3] < 16) t++; else if (data[i + 3] > 240) solid++; }
    return { transp: (t / total * 100), solid: (solid / total * 100) };
}

const files = process.argv.slice(2);
const raws = files.length ? files : ['krolik-udziec-raw', 'jezyny-raw', 'jagniecina-comber-raw', 'bulgur-suchy-raw'];
const ref = path.join(root, 'images', 'products', 'banan.jpg');

// Referencja: banan.jpg (styl domu)
{
    const { data, info } = await sharp(ref).resize(400, 300, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const refc = borderMedian(data, info.width, info.height, 6);
    const a = adaptiveFlood(data, info.width, info.height, refc, 60);
    console.log(`banan.jpg      border=[${refc}] adaptive(tol60)`, JSON.stringify(stats(a)));
}

for (const name of raws) {
    const fp = path.join(root, '_tmp-probe', `${name}.jpg`);
    if (!fs.existsSync(fp)) { console.log(name, 'BRAK'); continue; }
    const { data, info } = await sharp(fp).resize(400, 300, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const w = info.width, h = info.height;
    const refc = borderMedian(data, w, h, 6);
    let line = `${name.padEnd(26)} border=[${refc.map(Math.round)}]`;
    for (const tol of [30, 45, 60, 80, 100]) {
        const a = adaptiveFlood(data, w, h, refc, tol);
        const s = stats(a);
        line += ` | t${tol}:${s.transp.toFixed(0)}/${s.solid.toFixed(0)}`;
    }
    console.log(line);
}
