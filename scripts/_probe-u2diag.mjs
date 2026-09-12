/** Diagnostyka U2Net: nazwy wejść/wyjść, wymiary, statystyki surowego wyjścia. */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import * as ort from 'onnxruntime-node';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const MEAN = [0.485, 0.456, 0.406];
const STD = [0.229, 0.224, 0.225];
const SIZE = 320;

const modelArg = process.argv.find((a) => a.startsWith('--model='));
const modelPath = path.join(root, 'scripts', 'models', modelArg ? `${modelArg.slice(8)}.onnx` : 'u2net.onnx');

const imgArg = process.argv.find((a) => a.startsWith('--img='));
const imgPath = imgArg ? path.resolve(imgArg.slice(6)) : path.join(root, 'images', 'products', 'banan.jpg');

const sess = await ort.InferenceSession.create(modelPath, { executionProviders: ['cpu'] });
console.log('model:', path.basename(modelPath));
console.log('inputs:', sess.inputNames);
console.log('outputs:', sess.outputNames);

const resized = await sharp(imgPath).resize(SIZE, SIZE, { fit: 'fill' }).removeAlpha().raw().toBuffer();
const input = new Float32Array(3 * SIZE * SIZE);
for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
        const si = (y * SIZE + x) * 3;
        const p = y * SIZE + x;
        input[p] = (resized[si] / 255 - MEAN[0]) / STD[0];
        input[SIZE * SIZE + p] = (resized[si + 1] / 255 - MEAN[1]) / STD[1];
        input[2 * SIZE * SIZE + p] = (resized[si + 2] / 255 - MEAN[2]) / STD[2];
    }
}
const feeds = {};
feeds[sess.inputNames[0]] = new ort.Tensor('float32', input, [1, 3, SIZE, SIZE]);
const results = await sess.run(feeds);

for (const name of sess.outputNames) {
    const o = results[name];
    if (!o) continue;
    const d = o.data;
    let min = Infinity, max = -Infinity, sum = 0;
    for (let i = 0; i < d.length; i++) {
        const v = d[i];
        if (v < min) min = v;
        if (v > max) max = v;
        sum += v;
    }
    // fraction above 0.5
    let above = 0;
    for (let i = 0; i < d.length; i++) if (d[i] > 0.5) above++;
    console.log(`${name}\tdims=[${o.dims}]\tmin=${min.toExponential(3)}\tmax=${max.toExponential(3)}\tmean=${(sum / d.length).toExponential(3)}\tabove0.5=${(above / d.length * 100).toFixed(1)}%`);
}
