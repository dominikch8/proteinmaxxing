/**
 * Decydujący test: czy U2Net działa na ZNANYM-DOBRYM obrazie (banan.jpg = banan na białym)?
 * Jeśli tak → kod OK, problemem są surowe obrazy fluxa.
 * Jeśli nie → kod U2Net jest zepsuty.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { cutoutBuffer } from './refine-product-cutouts.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

async function stats(pngBuffer) {
    const { data } = await sharp(pngBuffer).resize(100, 75).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const total = data.length / 4;
    let transp = 0, solid = 0;
    for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 16) transp++;
        else if (data[i + 3] > 200) solid++;
    }
    return { transp: (transp / total) * 100, solid: (solid / total) * 100 };
}

const tests = [
    ['banan.jpg (znany-dobry, banan na białym)', 'images/products/banan.jpg'],
    ['krolik-udziec-raw.jpg (flux)', '_tmp-probe/krolik-udziec-raw.jpg'],
    ['jezyny-raw.jpg (flux)', '_tmp-probe/jezyny-raw.jpg']
];

for (const label of ['u2net', 'studio']) {
    console.log(`\n===== METHOD: ${label} =====`);
    for (const [name, rel] of tests) {
        const fp = path.join(root, rel);
        if (!fs.existsSync(fp)) { console.log(`${name}: BRAK PLIKU`); continue; }
        try {
            const buf = fs.readFileSync(fp);
            const out = await cutoutBuffer(buf, { refineOnly: false, method: label });
            const s = await stats(out.png);
            console.log(`${name}: transp=${s.transp.toFixed(1)}% solid=${s.solid.toFixed(1)}%`);
        } catch (e) {
            console.log(`${name}: ERR ${e.message}`);
        }
    }
}
