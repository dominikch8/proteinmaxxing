/** Pomiar czasu i jakości cutoutu: u2net (duży) vs u2netp (mały). */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { cutoutBuffer } from './refine-product-cutouts.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const sharp = (await import('sharp')).default;

async function stats(png) {
    const { data } = await sharp(png).resize(100, 75).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let t = 0, solid = 0;
    const total = data.length / 4;
    for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 16) t++;
        else if (data[i + 3] > 240) solid++;
    }
    return { transp: (t / total) * 100, solid: (solid / total) * 100 };
}

const raws = [
    ['banan', 'images/products/banan.jpg'],
    ['krolik-udziec', '_tmp-probe/krolik-udziec-raw.jpg'],
    ['jezyny', '_tmp-probe/jezyny-raw.jpg'],
    ['bulgur-suchy', '_tmp-probe/bulgur-suchy-raw.jpg']
];

for (const model of ['u2net', 'u2netp']) {
    console.log(`\n===== model=${model} =====`);
    for (const [name, rel] of raws) {
        const fp = path.join(root, rel);
        if (!fs.existsSync(fp)) { console.log(name, 'BRAK', rel); continue; }
        const buf = fs.readFileSync(fp);
        const t0 = Date.now();
        try {
            const cut = await cutoutBuffer(buf, { refineOnly: false, method: 'u2net', model });
            const dt = Date.now() - t0;
            const s = await stats(cut.png);
            console.log(`${name.padEnd(16)} ${dt}ms  transp=${s.transp.toFixed(1)}%  solid=${s.solid.toFixed(1)}%`);
        } catch (e) {
            console.log(`${name.padEnd(16)} ERR ${e.message} (${Date.now() - t0}ms)`);
        }
    }
}
