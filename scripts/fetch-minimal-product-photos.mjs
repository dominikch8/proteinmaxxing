/**
 * Generuje zdjęcia produktów: fotorealistyczne na białym tle (Pollinations).
 * node scripts/fetch-minimal-product-photos.mjs --all
 * node scripts/fetch-minimal-product-photos.mjs --queue
 * node scripts/fetch-minimal-product-photos.mjs --slug=banan --slug=jablko
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import os from 'os';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'images', 'products');
const queuePath = path.join(root, 'scripts', 'product-images-regen-queue.json');

const UA = 'Proteiner/1.0 (nutrition education; contact: dominikchw1@gmail.com)';

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
        let base = slugify(p.name);
        let slug = base;
        let n = 2;
        while (seen[slug]) {
            slug = `${base}-${p.category}`;
            if (seen[slug]) slug = `${base}-${n++}`;
        }
        seen[slug] = true;
        return { slug, name: p.name, category: p.category, emoji: p.emoji || '🍽️' };
    });
}

function seedFromSlug(slug) {
    const h = crypto.createHash('md5').update(slug).digest();
    return h.readUInt32BE(0) % 2147483646;
}

function buildPrompt(name) {
    const clean = name.replace(/\([^)]*\)/g, '').trim();
    return (
        `Professional e-commerce product photo of ${clean}, food item only, centered on pure white background, ` +
        `soft subtle shadow underneath, minimalist studio lighting, photorealistic, no text, no people, no hands, no logo, no packaging labels`
    );
}

function buildMinimalSvg(emoji) {
    const e = escXml(emoji || '🍽️');
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="#ffffff"/>
  <ellipse cx="400" cy="430" rx="120" ry="18" fill="#000000" fill-opacity="0.06"/>
  <text x="400" y="340" text-anchor="middle" font-size="160">${e}</text>
</svg>`;
}

function escXml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

async function writeProductJpeg(sharp, outPath, bufferOrSvg) {
    const tmpPath = path.join(os.tmpdir(), `proteiner-${crypto.randomBytes(8).toString('hex')}.jpg`);
    try {
        if (Buffer.isBuffer(bufferOrSvg)) {
            await sharp(bufferOrSvg)
                .resize(800, 600, { fit: 'contain', background: { r: 255, g: 255, b: 255 } })
                .jpeg({ quality: 80, mozjpeg: true })
                .toFile(tmpPath);
        } else {
            await sharp(Buffer.from(bufferOrSvg)).jpeg({ quality: 92 }).toFile(tmpPath);
        }
        const data = fs.readFileSync(tmpPath);
        fs.writeFileSync(outPath, data);
    } finally {
        try {
            fs.unlinkSync(tmpPath);
        } catch {
            /* ignore */
        }
    }
}

const raw = JSON.parse(
    fs.readFileSync(path.join(root, 'js', 'products-data-raw.js'), 'utf8').match(/productsDatabaseRaw = (\[[\s\S]*\]);/)[1]
);
const allProducts = enrichProducts(raw);
const sharp = (await import('sharp')).default;
fs.mkdirSync(outDir, { recursive: true });

const slugArgs = process.argv.filter((a) => a.startsWith('--slug=')).map((a) => a.slice(7));
let todo = allProducts;

if (slugArgs.length) {
    const set = new Set(slugArgs);
    todo = allProducts.filter((p) => set.has(p.slug));
} else if (process.argv.includes('--queue')) {
    if (!fs.existsSync(queuePath)) {
        console.error('Brak', queuePath, '— uruchom build-product-image-regen-queue.mjs');
        process.exit(1);
    }
    const queue = JSON.parse(fs.readFileSync(queuePath, 'utf8'));
    const set = new Set(queue.map((q) => q.slug));
    todo = allProducts.filter((p) => set.has(p.slug));
} else if (process.argv.includes('--all')) {
    todo = allProducts;
} else {
    console.error('Użyj --all, --queue lub --slug=nazwa');
    process.exit(1);
}

const skipExisting = process.argv.includes('--skip-ok');
const delayMs = parseInt(process.argv.find((a) => a.startsWith('--delay='))?.split('=')[1] || '800', 10);

console.log(`Do wygenerowania: ${todo.length} zdjęć`);

let ok = 0;
let fail = 0;

for (let i = 0; i < todo.length; i++) {
    const p = todo[i];
    const outPath = path.join(outDir, `${p.slug}.jpg`);

    if (skipExisting && fs.existsSync(outPath)) {
        try {
            const { data, info } = await sharp(outPath).resize(120, 90).raw().toBuffer({ resolveWithObject: true });
            const w = info.width;
            const h = info.height;
            const ch = info.channels;
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
                    const idx = (y * w + x) * ch;
                    if (data[idx] > 235 && data[idx + 1] > 235 && data[idx + 2] > 235) white++;
                }
            }
            for (const [x, y] of corners) {
                const idx = (y * w + x) * ch;
                if (data[idx] > 230 && data[idx + 1] > 230 && data[idx + 2] > 230) cornerWhite++;
            }
            if (white / (w * h) >= 0.45 && cornerWhite >= 4) {
                continue;
            }
        } catch {
            /* regenerate */
        }
    }

    const prompt = encodeURIComponent(buildPrompt(p.name));
    const seed = seedFromSlug(p.slug);
    const url = `https://image.pollinations.ai/prompt/${prompt}?width=800&height=600&nologo=true&seed=${seed}`;

    process.stdout.write(`[${i + 1}/${todo.length}] ${p.slug} … `);

    try {
        if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
    } catch {
        /* ignore */
    }

    let lastErr = null;
    for (let attempt = 0; attempt < 4; attempt++) {
        if (attempt > 0) await sleep(3000 * attempt);
        try {
            const res = await fetch(url, {
                headers: { 'User-Agent': UA },
                signal: AbortSignal.timeout(120000)
            });
            if (res.status === 429) throw new Error('HTTP 429');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const buf = Buffer.from(await res.arrayBuffer());
            if (buf.length < 5000) throw new Error('za mały plik');
            await writeProductJpeg(sharp, outPath, buf);
            console.log(attempt ? `OK (retry ${attempt})` : 'OK');
            ok++;
            lastErr = null;
            break;
        } catch (e) {
            lastErr = e;
        }
    }

    if (lastErr) {
        try {
            await writeProductJpeg(sharp, outPath, buildMinimalSvg(p.emoji));
            console.log(`fallback emoji (${lastErr.message})`);
            ok++;
        } catch (e2) {
            console.log(`FAIL (${e2.message})`);
            fail++;
        }
    }

    if (i < todo.length - 1) await sleep(delayMs);
}

console.log(`\nGotowe: ${ok} OK, ${fail} błędów → ${outDir}`);
