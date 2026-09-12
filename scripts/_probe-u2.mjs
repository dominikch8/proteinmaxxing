/**
 * Sonda: U2Net na surowych obrazach fluxa — pomiar + zapis do wizualnej oceny.
 * node scripts/_probe-u2.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { cutoutBuffer } from './refine-product-cutouts.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, '_tmp-probe');
const sharp = (await import('sharp')).default;

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

const slugs = ['jezyny', 'krolik-udziec', 'jagniecina-comber', 'bulgur-suchy'];
for (const slug of slugs) {
    const raw = fs.readFileSync(path.join(outDir, `${slug}-raw.jpg`));
    for (const method of ['u2net', 'studio']) {
        try {
            const t0 = Date.now();
            const cut = await cutoutBuffer(raw, { refineOnly: false, method });
            const r = await ratioOf(cut.png);
            fs.writeFileSync(path.join(outDir, `${slug}-${method}-final.png`), cut.png);
            fs.writeFileSync(path.join(outDir, `${slug}-${method}-final.jpg`), cut.jpg);
            console.log(`${slug.padEnd(18)} ${method.padEnd(7)} transp ${(r.transp * 100).toFixed(0)}% solid ${(r.solid * 100).toFixed(0)}% ${((Date.now() - t0) / 1000).toFixed(1)}s`);
        } catch (e) {
            console.log(`${slug} ${method} ERR ${e.message}`);
        }
    }
}
