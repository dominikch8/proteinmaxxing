/**
 * Wykrywa zdjęcia produktów bez minimalistycznego białego tła (jak większość bazy).
 * node scripts/audit-product-image-style.mjs
 * node scripts/audit-product-image-style.mjs --json > scripts/product-images-to-fix.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'images', 'products');
const asJson = process.argv.includes('--json');

const MIN_WHITE = 0.45;
const MIN_CORNERS = 4;

const sharp = (await import('sharp')).default;
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.jpg'));
const flagged = [];

for (const f of files) {
    const slug = f.replace(/\.jpg$/i, '');
    const fp = path.join(dir, f);
    const stat = fs.statSync(fp);
    const { data, info } = await sharp(fp).resize(120, 90).raw().toBuffer({ resolveWithObject: true });
    const w = info.width;
    const h = info.height;
    const ch = info.channels;
    let sum = 0;
    let white = 0;
    let cornerWhite = 0;
    const corners = [
        [0, 0],
        [w - 1, 0],
        [0, h - 1],
        [w - 1, h - 1]
    ];
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const i = (y * w + x) * ch;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            sum += r + g + b;
            if (r > 235 && g > 235 && b > 235) white++;
        }
    }
    for (const [x, y] of corners) {
        const i = (y * w + x) * ch;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        if (r > 230 && g > 230 && b > 230) cornerWhite++;
    }
    const mean = sum / (w * h * ch);
    const whiteRatio = white / (w * h);
    const needsFix = whiteRatio < MIN_WHITE || cornerWhite < MIN_CORNERS || mean < 25;
    if (needsFix) {
        flagged.push({
            slug,
            meanBrightness: Math.round(mean),
            whitePercent: Math.round(whiteRatio * 1000) / 10,
            cornerWhite,
            bytes: stat.size
        });
    }
}

flagged.sort((a, b) => a.meanBrightness - b.meanBrightness || a.whitePercent - b.whitePercent);

if (asJson) {
    console.log(JSON.stringify(flagged, null, 2));
} else {
    console.log(`Do poprawy (heurystyka stylu): ${flagged.length} / ${files.length}`);
    for (const row of flagged) {
        console.log(
            `${row.slug}\tmean=${row.meanBrightness}\twhite=${row.whitePercent}%\tcorners=${row.cornerWhite}\t${row.bytes}b`
        );
    }
}
