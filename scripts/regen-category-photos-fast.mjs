/**
 * Szybka regeneracja zdjęć kategorii: 1× Pollinations + wycięcie tła → białe JPG/PNG.
 * node scripts/regen-category-photos-fast.mjs --category=przyprawy,alkohole,napoje
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import os from 'os';
import { fileURLToPath, pathToFileURL } from 'url';
import { removeEdgeBackground, defringeLightHalos } from './remove-edge-background.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'images', 'products');
const UA = 'Proteiner/1.0 (nutrition education; contact: developeranios@gmail.com)';

// Reuse FOOD_SUBJECT from rebuild by extracting via dynamic import of a tiny shared map
const rebuildPath = path.join(__dirname, 'rebuild-all-product-photos.mjs');
const rebuildSrc = fs.readFileSync(rebuildPath, 'utf8');
const foodMatch = rebuildSrc.match(/const FOOD_SUBJECT = \{([\s\S]*?)\n\};/);
if (!foodMatch) throw new Error('FOOD_SUBJECT not found');
const FOOD_SUBJECT = Function(`return {${foodMatch[1]}}`)();

const CATEGORY_SUFFIX = {
    napoje: 'beverage drink in glass on white background',
    alkohole: 'alcoholic drink poured in glass on white background',
    przyprawy: 'dry spice herbs seasoning powder pile on white background'
};

function slugify(name) {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/ą/g, 'a')
        .replace(/ć/g, 'c')
        .replace(/ę/g, 'e')
        .replace(/ł/g, 'l')
        .replace(/ń/g, 'n')
        .replace(/ó/g, 'o')
        .replace(/ś/g, 's')
        .replace(/ź/g, 'z')
        .replace(/ż/g, 'z')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function enrichProducts(raw) {
    const seen = {};
    return raw.map((p) => {
        let base = p.slug && String(p.slug).trim() ? String(p.slug).trim() : slugify(p.name);
        let slug = base;
        let n = 2;
        while (seen[slug]) {
            slug = `${base}-${p.category}`;
            if (seen[slug]) slug = `${base}-${n++}`;
        }
        seen[slug] = true;
        return { ...p, slug };
    });
}

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

function subjectFor(p) {
    if (FOOD_SUBJECT[p.slug]) return FOOD_SUBJECT[p.slug];
    const suffix = CATEGORY_SUFFIX[p.category] || 'food product';
    return `${p.name.replace(/\([^)]*\)/g, '').trim()} ${suffix}`;
}

function buildPrompt(subject) {
    return (
        `Photorealistic ecommerce food photo: ${subject}. Exact edible food or drink product only, single item or small neat portion, centered. ` +
        `Pure solid white background #FFFFFF. Soft subtle shadow. Minimalist studio lighting. ` +
        `No text, no logos, no watermark, no people, no hands, no busy props, no gray background, no black background. ` +
        `Sharp realistic detail, correct anatomy, no AI deformities.`
    );
}

function seedFromSlug(slug) {
    return crypto.createHash('md5').update(`spice-drink-fast-v1-${slug}`).digest().readUInt32BE(0) % 2147483646;
}

async function fetchBuffer(url) {
    let lastErr;
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const res = await fetch(url, {
                headers: { 'User-Agent': UA },
                signal: AbortSignal.timeout(90000),
                redirect: 'follow'
            });
            if (res.status === 429) {
                await sleep(2000 * (attempt + 1));
                continue;
            }
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const buf = Buffer.from(await res.arrayBuffer());
            if (buf.length < 3000) throw new Error('za mały plik');
            return buf;
        } catch (e) {
            lastErr = e;
            await sleep(800 * (attempt + 1));
        }
    }
    throw lastErr;
}

async function toWhiteJpg(sharp, inputBuf, slug) {
    const resized = await sharp(inputBuf)
        .resize(800, 600, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    let data = removeEdgeBackground(resized.data, resized.info.width, resized.info.height, 4, {
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
        else if (r > 242 && g > 242 && b > 242) {
            const whiteness = (r + g + b) / 3;
            data[i + 3] = Math.max(0, Math.min(255, Math.round((255 - whiteness) * 10)));
        }
    }

    const pngBuf = await sharp(data, {
        raw: { width: resized.info.width, height: resized.info.height, channels: 4 }
    })
        .png()
        .toBuffer();

    const pngPath = path.join(outDir, `${slug}.png`);
    const jpgPath = path.join(outDir, `${slug}.jpg`);
    const tmpPng = path.join(os.tmpdir(), `proteiner-${crypto.randomBytes(6).toString('hex')}.png`);
    const tmpJpg = path.join(os.tmpdir(), `proteiner-${crypto.randomBytes(6).toString('hex')}.jpg`);
    try {
        fs.writeFileSync(tmpPng, pngBuf);
        fs.copyFileSync(tmpPng, pngPath);
        await sharp(pngBuf)
            .flatten({ background: { r: 255, g: 255, b: 255 } })
            .jpeg({ quality: 90, mozjpeg: true })
            .toFile(tmpJpg);
        fs.copyFileSync(tmpJpg, jpgPath);
    } finally {
        try {
            fs.unlinkSync(tmpPng);
        } catch {
            /* ignore */
        }
        try {
            fs.unlinkSync(tmpJpg);
        } catch {
            /* ignore */
        }
    }
}

const raw = JSON.parse(
    fs.readFileSync(path.join(root, 'js', 'products-data-raw.js'), 'utf8').match(/productsDatabaseRaw = (\[[\s\S]*\]);/)[1]
);
const products = enrichProducts(raw);
const sharp = (await import('sharp')).default;
fs.mkdirSync(outDir, { recursive: true });

const catArgs = process.argv
    .filter((a) => a.startsWith('--category='))
    .flatMap((a) =>
        a
            .slice(11)
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
    );
const slugArgs = process.argv.filter((a) => a.startsWith('--slug=')).map((a) => a.slice(7));
const delayMs = parseInt(process.argv.find((a) => a.startsWith('--delay='))?.split('=')[1] || '700', 10);

let todo = products;
if (slugArgs.length) todo = products.filter((p) => slugArgs.includes(p.slug));
else if (catArgs.length) todo = products.filter((p) => catArgs.includes(p.category));
else {
    console.error('Użyj --category=... lub --slug=...');
    process.exit(1);
}

console.log(`Szybka regeneracja: ${todo.length} zdjęć`);
let ok = 0;
let fail = 0;

for (let i = 0; i < todo.length; i++) {
    const p = todo[i];
    const subject = subjectFor(p);
    const prompt = encodeURIComponent(buildPrompt(subject).slice(0, 480));
    const seed = seedFromSlug(p.slug);
    const url = `https://image.pollinations.ai/prompt/${prompt}?width=800&height=600&nologo=true&seed=${seed}`;

    process.stdout.write(`[${i + 1}/${todo.length}] ${p.slug} … `);
    try {
        const buf = await fetchBuffer(url);
        await toWhiteJpg(sharp, buf, p.slug);
        console.log('OK');
        ok++;
    } catch (e) {
        console.log(`FAIL (${e.message})`);
        fail++;
    }
    if (i < todo.length - 1) await sleep(delayMs);
}

console.log(`\nGotowe: ${ok} OK, ${fail} błędów → ${outDir}`);
