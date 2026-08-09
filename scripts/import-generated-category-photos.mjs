/**
 * Import generated Cursor assets → images/products JPG+PNG (białe tło).
 * node scripts/import-generated-category-photos.mjs
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import os from 'os';
import { fileURLToPath } from 'url';
import { removeEdgeBackground, defringeLightHalos } from './remove-edge-background.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'images', 'products');
const deployDir = path.join(root, 'deploy-bundle', 'images', 'products');
const assetsDir = path.join(
    os.homedir(),
    '.cursor',
    'projects',
    'c-Users-Administrator-xD-Desktop-probystronyxd',
    'assets'
);

const SLUGS = [
    'sol-kuchenna',
    'pieprz-czarny-mielony',
    'papryka-slodka-mielona',
    'papryka-ostra-mielona',
    'majeranek',
    'oregano',
    'bazylia-suszona',
    'kminek',
    'lisc-laurowy',
    'ziele-angielskie',
    'kurkuma',
    'cynamon-mielony',
    'czosnek-granulowany',
    'ziola-prowansalskie',
    'tymianek',
    'chili-mielone',
    'imbir-mielony',
    'galka-muszkatolowa',
    'przyprawa-do-kurczaka',
    'vegeta',
    'garage-hard-lemon-4-6',
    'tyskie-gronie',
    'zywiec-jasne-pelne',
    'lech-premium',
    'okocim-o-k-beer',
    'harnas-jasne',
    'desperados',
    'somersby-jablkowy',
    'heineken',
    'corona-extra',
    'wyborowa-wodka',
    'soplica-czysta',
    'zubrowka-bison-grass',
    'soplica-wisniowa',
    'krupnik-tradycyjny',
    'jagermeister',
    'baileys-original',
    'wino-czerwone-wytrawne',
    'wino-biale-polslodkie',
    'prosecco',
    'coca-cola',
    'coca-cola-zero',
    'pepsi',
    'sprite',
    'fanta-pomaranczowa',
    'mirinda',
    'lipton-ice-tea-brzoskwinia',
    'nestea-cytryna',
    'red-bull',
    'tiger-energy-drink',
    'black-energy-drink',
    'monster-energy',
    'woda',
    'kubus-jablkowy',
    'tymbark-jablko',
    'sok-pomaranczowy-100',
    'herbata-czarna-napar',
    'kawa-czarna-parzona',
    'oshee-izotoniczny'
];

const sharp = (await import('sharp')).default;
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(deployDir, { recursive: true });

async function processOne(srcPath, slug) {
    const input = await sharp(srcPath)
        .resize(800, 600, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    let data = removeEdgeBackground(input.data, input.info.width, input.info.height, 4, {
        lumMin: 236,
        satMax: 32
    });
    data = defringeLightHalos(data, 4);

    for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] === 0) continue;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        if (r >= 250 && g >= 250 && b >= 250) data[i + 3] = 0;
    }

    const pngBuf = await sharp(data, {
        raw: { width: input.info.width, height: input.info.height, channels: 4 }
    })
        .png()
        .toBuffer();

    const tmpPng = path.join(os.tmpdir(), `proteiner-${crypto.randomBytes(6).toString('hex')}.png`);
    const tmpJpg = path.join(os.tmpdir(), `proteiner-${crypto.randomBytes(6).toString('hex')}.jpg`);
    try {
        fs.writeFileSync(tmpPng, pngBuf);
        fs.copyFileSync(tmpPng, path.join(outDir, `${slug}.png`));
        await sharp(pngBuf)
            .flatten({ background: { r: 255, g: 255, b: 255 } })
            .jpeg({ quality: 90, mozjpeg: true })
            .toFile(tmpJpg);
        fs.copyFileSync(tmpJpg, path.join(outDir, `${slug}.jpg`));
        fs.copyFileSync(path.join(outDir, `${slug}.jpg`), path.join(deployDir, `${slug}.jpg`));
        if (fs.existsSync(path.join(outDir, `${slug}.png`))) {
            fs.copyFileSync(path.join(outDir, `${slug}.png`), path.join(deployDir, `${slug}.png`));
        }
    } finally {
        try {
            fs.unlinkSync(tmpPng);
        } catch {
            /* */
        }
        try {
            fs.unlinkSync(tmpJpg);
        } catch {
            /* */
        }
    }
}

let ok = 0;
let miss = 0;
for (const slug of SLUGS) {
    let src = path.join(assetsDir, `${slug}.png`);
    if (slug === 'woda' && !fs.existsSync(src)) {
        src = path.join(assetsDir, 'woda-test.png');
    }
    if (!fs.existsSync(src)) {
        // already in products?
        if (fs.existsSync(path.join(outDir, `${slug}.jpg`))) {
            fs.copyFileSync(path.join(outDir, `${slug}.jpg`), path.join(deployDir, `${slug}.jpg`));
            console.log(`skip/sync ${slug}`);
            ok++;
            continue;
        }
        console.log(`MISSING asset ${slug}`);
        miss++;
        continue;
    }
    await processOne(src, slug);
    console.log(`OK ${slug}`);
    ok++;
}
console.log(`\nImported ${ok}, missing ${miss}`);
