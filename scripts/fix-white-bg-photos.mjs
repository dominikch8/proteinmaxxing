/**
 * Audit + regeneracja zdjęć bez białego tła (styl jak banan).
 * node scripts/fix-white-bg-photos.mjs --category=przyprawy,alkohole,napoje
 * node scripts/fix-white-bg-photos.mjs --slug=woda --slug=coca-cola
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
const UA = 'Proteiner/1.0 (nutrition education; contact: developeranios@gmail.com)';

const rebuildSrc = fs.readFileSync(path.join(__dirname, 'rebuild-all-product-photos.mjs'), 'utf8');
const foodMatch = rebuildSrc.match(/const FOOD_SUBJECT = \{([\s\S]*?)\n\};/);
if (!foodMatch) throw new Error('FOOD_SUBJECT not found');
const FOOD_SUBJECT = Function(`return {${foodMatch[1]}}`)();

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
    return `${p.name.replace(/\([^)]*\)/g, '').trim()} food product`;
}

function buildPrompt(subject) {
    return (
        `Ultra realistic minimalist ecommerce catalog food photo: ${subject}. ` +
        `Single product only, centered, soft natural shadow. ` +
        `Pure solid white background #FFFFFF, no gray, no black, no textured backdrop, no wooden table. ` +
        `Photorealistic, sharp focus, no text, no logos, no watermark, no people, no hands.`
    );
}

async function cornersAreWhite(sharp, buf) {
    const { data, info } = await sharp(buf).resize(100, 75).raw().toBuffer({ resolveWithObject: true });
    const w = info.width;
    const h = info.height;
    const ch = info.channels;
    const pts = [
        [2, 2],
        [w - 3, 2],
        [2, h - 3],
        [w - 3, h - 3],
        [Math.floor(w / 2), 2],
        [2, Math.floor(h / 2)],
        [w - 3, Math.floor(h / 2)],
        [Math.floor(w / 2), h - 3]
    ];
    let white = 0;
    for (const [x, y] of pts) {
        const i = (y * w + x) * ch;
        if (data[i] > 238 && data[i + 1] > 238 && data[i + 2] > 238) white++;
    }
    return white >= 5;
}

async function fetchBuffer(url) {
    let lastErr;
    for (let attempt = 0; attempt < 4; attempt++) {
        try {
            const res = await fetch(url, {
                headers: { 'User-Agent': UA },
                signal: AbortSignal.timeout(90000),
                redirect: 'follow'
            });
            if (res.status === 429) {
                await sleep(2500 * (attempt + 1));
                continue;
            }
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const buf = Buffer.from(await res.arrayBuffer());
            if (buf.length < 3000) throw new Error('za mały');
            return buf;
        } catch (e) {
            lastErr = e;
            await sleep(1000 * (attempt + 1));
        }
    }
    throw lastErr;
}

async function saveWhite(sharp, inputBuf, slug) {
    const resized = await sharp(inputBuf)
        .resize(800, 600, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    let data = removeEdgeBackground(resized.data, resized.info.width, resized.info.height, 4, {
        lumMin: 200,
        satMax: 40
    });
    data = defringeLightHalos(data, 4);

    for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] === 0) continue;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        if (r >= 248 && g >= 248 && b >= 248) data[i + 3] = 0;
        else if (r > 235 && g > 235 && b > 235) {
            const whiteness = (r + g + b) / 3;
            data[i + 3] = Math.max(0, Math.min(255, Math.round((255 - whiteness) * 12)));
        }
    }

    const pngBuf = await sharp(data, {
        raw: { width: resized.info.width, height: resized.info.height, channels: 4 }
    })
        .png()
        .toBuffer();

    const jpgPath = path.join(outDir, `${slug}.jpg`);
    const pngPath = path.join(outDir, `${slug}.png`);
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
            /* */
        }
        try {
            fs.unlinkSync(tmpJpg);
        } catch {
            /* */
        }
    }
}

const raw = JSON.parse(
    fs.readFileSync(path.join(root, 'js', 'products-data-raw.js'), 'utf8').match(/productsDatabaseRaw = (\[[\s\S]*\]);/)[1]
);
const products = enrichProducts(raw);
const sharp = (await import('sharp')).default;

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
const auditOnly = process.argv.includes('--audit-only');
const delayMs = parseInt(process.argv.find((a) => a.startsWith('--delay='))?.split('=')[1] || '800', 10);
const maxAttempts = parseInt(process.argv.find((a) => a.startsWith('--attempts='))?.split('=')[1] || '4', 10);

let pool = products;
if (slugArgs.length) pool = products.filter((p) => slugArgs.includes(p.slug));
else if (catArgs.length) pool = products.filter((p) => catArgs.includes(p.category));

const bad = [];
for (const p of pool) {
    const jpg = path.join(outDir, `${p.slug}.jpg`);
    if (!fs.existsSync(jpg)) {
        bad.push(p);
        continue;
    }
    const ok = await cornersAreWhite(sharp, fs.readFileSync(jpg));
    if (!ok) bad.push(p);
}

console.log(`Do poprawy (brak białego tła): ${bad.length}/${pool.length}`);
if (auditOnly) {
    console.log(bad.map((p) => p.slug).join('\n'));
    process.exit(0);
}

let ok = 0;
let fail = 0;
for (let i = 0; i < bad.length; i++) {
    const p = bad[i];
    const subject = subjectFor(p);
    process.stdout.write(`[${i + 1}/${bad.length}] ${p.slug} … `);

    let saved = false;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const seed =
            (crypto.createHash('md5').update(`whitefix-v2-${p.slug}-${attempt}`).digest().readUInt32BE(0) +
                attempt * 9973) %
            2147483646;
        const prompt = encodeURIComponent(buildPrompt(subject).slice(0, 450));
        const url = `https://image.pollinations.ai/prompt/${prompt}?width=800&height=600&nologo=true&enhance=true&model=flux&seed=${seed}`;
        try {
            const buf = await fetchBuffer(url);
            await saveWhite(sharp, buf, p.slug);
            const check = await cornersAreWhite(sharp, fs.readFileSync(path.join(outDir, `${p.slug}.jpg`)));
            if (check) {
                console.log(attempt ? `OK (try ${attempt + 1})` : 'OK');
                ok++;
                saved = true;
                break;
            }
            process.stdout.write(`try${attempt + 1}… `);
        } catch (e) {
            process.stdout.write(`err${attempt + 1}… `);
        }
        await sleep(400);
    }
    if (!saved) {
        console.log('FAIL (zostawiam ostatnią próbę)');
        fail++;
    }
    if (i < bad.length - 1) await sleep(delayMs);
}

console.log(`\nGotowe: ${ok} OK, ${fail} bez pewnego białego tła`);
