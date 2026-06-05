/**
 * Favicon (SVG + PNG z alfą) i og-home.jpg.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { removeEdgeBackground, defringeLightHalos } from './remove-edge-background.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const assetsDir = path.join(
    process.env.CURSOR_ASSETS || path.join(process.env.USERPROFILE || '', '.cursor', 'projects'),
    'c-Users-Administrator-xD-Desktop-proby-strony-XD',
    'assets'
);

const faviconCandidates = [
    path.join(assetsDir, 'favicon-transparent-source.png'),
    path.join(assetsDir, 'favicon-source.png'),
    path.join(root, 'images', 'brand', 'favicon-source.png'),
];
const faviconSrc = faviconCandidates.find((p) => fs.existsSync(p));
const ogCandidates = [
    path.join(assetsDir, 'og-home-minimal-source.png'),
    path.join(assetsDir, 'og-home-source.png'),
    path.join(root, 'images', 'brand', 'og-home-source.png'),
];
const ogSrc = ogCandidates.find((p) => fs.existsSync(p));
const imagesDir = path.join(root, 'images');
const brandDir = path.join(imagesDir, 'brand');
const svgPath = path.join(imagesDir, 'favicon.svg');

async function faviconPipeline(inputPath) {
    const { data, info } = await sharp(inputPath)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    let cleaned = removeEdgeBackground(data, info.width, info.height, 4);
    cleaned = defringeLightHalos(cleaned, 4);

    return sharp(cleaned, {
        raw: { width: info.width, height: info.height, channels: 4 },
    })
        .png()
        .trim({ threshold: 10 });
}

async function buildFavicons() {
    if (!fs.existsSync(svgPath)) {
        console.warn('Brak images/favicon.svg — zostaw ręczny plik SVG');
    }

    if (!faviconSrc) {
        if (fs.existsSync(svgPath)) {
            await buildPngFromSvg();
            return;
        }
        console.error('Brak źródła favicon (PNG ani SVG)');
        process.exit(1);
    }

    console.log('Źródło favicon PNG:', faviconSrc);
    const master = await faviconPipeline(faviconSrc);
    if (!fs.existsSync(brandDir)) fs.mkdirSync(brandDir, { recursive: true });
    await master.clone().toFile(path.join(brandDir, 'favicon-master.png'));

    await exportSizes(master);
}

async function buildPngFromSvg() {
    console.log('Raster z SVG:', svgPath);
    const master = sharp(svgPath).resize(512, 512, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
    });
    await exportSizes(master);
}

async function exportSizes(master) {
    const sizes = [
        ['favicon-32.png', 32],
        ['favicon-192.png', 192],
        ['apple-touch-icon.png', 180],
    ];
    for (const [name, size] of sizes) {
        await master
            .clone()
            .resize(size, size, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 },
            })
            .png({ compressionLevel: 9, palette: false })
            .toFile(path.join(imagesDir, name));
        console.log('OK', name);
    }
    await master
        .clone()
        .resize(32, 32, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toFile(path.join(root, 'favicon.ico'));
    console.log('OK favicon.ico');
}

async function buildOgHome() {
    if (!fs.existsSync(ogSrc)) {
        console.warn('Pominięto og-home — brak:', ogSrc);
        return;
    }
    await sharp(ogSrc)
        .resize(1200, 630, { fit: 'cover', position: 'centre' })
        .jpeg({ quality: 88, mozjpeg: true })
        .toFile(path.join(imagesDir, 'og-home.jpg'));
    console.log('OK images/og-home.jpg');
}

if (fs.existsSync(svgPath)) {
    console.log('Raster faviconów z SVG');
    await buildPngFromSvg();
} else {
    await buildFavicons();
}
await buildOgHome();
