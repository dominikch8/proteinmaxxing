/** Test cutoutBuffer bezpośrednio: statystyki alfa dla metod u2net/studio na banan + surowym flux. */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { cutoutBuffer } from './refine-product-cutouts.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, '_tmp-probe');
fs.mkdirSync(outDir, { recursive: true });

function stats(rgba, w, h) {
    let t = 0, s = 0, soft = 0;
    for (let i = 3; i < rgba.length; i += 4) {
        const a = rgba[i];
        if (a === 0) t++;
        else if (a === 255) s++;
        else soft++;
    }
    const n = w * h;
    return `transp=${(t / n * 100).toFixed(1)}% solid=${(s / n * 100).toFixed(1)}% soft=${(soft / n * 100).toFixed(1)}%`;
}

const targets = [
    ['banan', path.join(root, 'images', 'products', 'banan.jpg')],
    ['krolik-raw', path.join(root, '_tmp-probe', 'krolik-udziec-raw.jpg')],
    ['jezyny-raw', path.join(root, '_tmp-probe', 'jezyny-raw.jpg')],
];

for (const [name, file] of targets) {
    if (!fs.existsSync(file)) { console.log('skip (brak):', file); continue; }
    const buf = fs.readFileSync(file);
    for (const method of ['u2net', 'studio']) {
        const out = await cutoutBuffer(buf, { method });
        const { data, info } = await sharp(out.png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
        console.log(`${name.padEnd(12)} ${method.padEnd(7)} ${stats(data, info.width, info.height)}`);
        fs.writeFileSync(path.join(outDir, `${name}-${method}.png`), out.png);
    }
}
console.log('zapisano →', outDir);
