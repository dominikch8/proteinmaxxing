/** Replikuje krok po kroku gałąź u2net z cutoutBuffer i mierzy alfa po każdym kroku. */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import * as ort from 'onnxruntime-node';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const MEAN = [0.485, 0.456, 0.406];
const STD = [0.229, 0.224, 0.225];
const SIZE = 320;

const img = process.argv.find((a) => a.startsWith('--img='))?.slice(6) || path.join(root, 'images', 'products', 'banan.jpg');
const letter = { r: 176, g: 182, b: 190, alpha: 1 };

function stat(rgba, tag) {
    let t = 0, s = 0, soft = 0;
    for (let i = 3; i < rgba.length; i += 4) {
        const a = rgba[i];
        if (a === 0) t++;
        else if (a === 255) s++;
        else soft++;
    }
    const n = rgba.length / 4;
    console.log(`${tag.padEnd(26)} transp=${(t / n * 100).toFixed(1)}% solid=${(s / n * 100).toFixed(1)}% soft=${(soft / n * 100).toFixed(1)}%`);
}

const buf = fs.readFileSync(img);
const base = await sharp(buf).resize(800, 600, { fit: 'contain', background: letter }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const { data: rgb, info } = base;
const { width, height } = info;
console.log('rgb buffer bytes =', rgb.length, 'expected =', width * height * 3, 'dims', width, height);

// --- predictMask inline ---
const sess = await ort.InferenceSession.create(path.join(root, 'scripts', 'models', 'u2net.onnx'), { executionProviders: ['cpu'] });
const resized = await sharp(rgb, { raw: { width, height, channels: 3 } }).resize(SIZE, SIZE, { fit: 'fill' }).raw().toBuffer();
console.log('resized mask-input bytes =', resized.length, 'expected =', SIZE * SIZE * 3);
const input = new Float32Array(3 * SIZE * SIZE);
for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) {
    const si = (y * SIZE + x) * 3, p = y * SIZE + x;
    input[p] = (resized[si] / 255 - MEAN[0]) / STD[0];
    input[SIZE * SIZE + p] = (resized[si + 1] / 255 - MEAN[1]) / STD[1];
    input[2 * SIZE * SIZE + p] = (resized[si + 2] / 255 - MEAN[2]) / STD[2];
}
const feeds = {}; feeds[sess.inputNames[0]] = new ort.Tensor('float32', input, [1, 3, SIZE, SIZE]);
const results = await sess.run(feeds);
const out = results[sess.outputNames[0]];
const outData = out.data;
let mask320;
if (out.dims.length === 4) {
    const c = out.dims[1], h = out.dims[2], w = out.dims[3];
    const plane = (c - 1) * h * w;
    mask320 = outData.subarray(plane, plane + h * w);
} else mask320 = outData;
let mn = Infinity, mx = -Infinity;
for (let i = 0; i < mask320.length; i++) { const v = mask320[i]; if (v < mn) mn = v; if (v > mx) mx = v; }
const span = mx - mn || 1;
const norm = new Float32Array(mask320.length);
for (let i = 0; i < mask320.length; i++) norm[i] = (mask320[i] - mn) / span;
const maskBuf = Buffer.alloc(SIZE * SIZE);
for (let i = 0; i < norm.length; i++) maskBuf[i] = Math.round(norm[i] * 255);
let mb = 0; for (let i = 0; i < maskBuf.length; i++) if (maskBuf[i] > 200) mb++;
console.log('mask320 >200 =', (mb / maskBuf.length * 100).toFixed(1), '%   min/max=', mn.toExponential(2), mx.toExponential(2));
const mask = await sharp(maskBuf, { raw: { width: SIZE, height: SIZE, channels: 1 } }).resize(width, height, { fit: 'fill' }).raw().toBuffer();
console.log('mask bytes =', mask.length, 'expected =', width * height);

// --- apply mask ---
let rgba = Buffer.alloc(width * height * 4);
for (let i = 0, p = 0; i < width * height; i++, p += 4) {
    const m = mask[i];
    rgba[p] = rgb[i * 3]; rgba[p + 1] = rgb[i * 3 + 1]; rgba[p + 2] = rgb[i * 3 + 2];
    let a = m;
    if (m < 20) a = 0; else if (m > 200) a = 255; else a = Math.round(((m - 20) / 180) * 255);
    rgba[p + 3] = a;
}
stat(rgba, 'after mask apply');
fs.writeFileSync(path.join(root, '_tmp-probe', 'dbg-1-mask.png'), await sharp(rgba, { raw: { width, height, channels: 4 } }).png().toBuffer());
