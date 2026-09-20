/**
 * PILOT regeneracji zdjęć nowych produktów (poprawa jakości + precyzyjny prompt EN + U2Net cutout).
 * Zapisywane: jpg + webp (webp z przezroczystym tłem). Bez PNG (aplikacja go nie używa).
 * node scripts/_pilot-regenerate.mjs
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { cutoutBuffer } from './refine-product-cutouts.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'images', 'products');
const bundleDir = path.join(root, 'deploy-bundle', 'images', 'products');
const UA = 'Proteiner/1.0 (nutrition education; contact: developeranios@gmail.com)';
const MODEL = 'flux';

// Ręczna, precyzyjna mapa EN dla pilota (15 najgorszych przypadków).
const PILOT = [
    ['parowki-z-indyka', 'sliced turkey frankfurter sausages on a small white plate'],
    ['galaretka-brzoskwiniowa', 'peach fruit jelly dessert in a small glass bowl'],
    ['kielbasa-slaska', 'thick white silesian kielbasa sausage, whole link visible'],
    ['kielbasa-zywiecka', 'cooked polish zywiecka pork sausage, whole link visible'],
    ['kielbasa-krakowska-sucha', 'sliced dry cracovian smoked sausage'],
    ['kabanosy', 'thin dry smoked polish kabanos sausage sticks'],
    ['kabanosy-drobiowe', 'thin dry smoked poultry kabanos sausage sticks'],
    ['kaszanka', 'polish blood sausage kielbasa, sliced, on a small plate'],
    ['salceson', 'polish head cheese brawn deli meat, sliced'],
    ['szynka-konserwowa', 'canned ham luncheon meat, pale pink slices'],
    ['mieso-mielone-wieprzowo-wolowe', 'raw minced beef and pork ground meat on a white plate'],
    ['pieczen-rzymska', 'polish meatloaf roast, sliced, on a small white plate'],
    ['flaki-wolowe', 'polish beef tripe soup in a white bowl, whole bowl visible'],
    ['zoladek-wieprzowy', 'raw pork stomach offal on a white plate'],
    ['pasztet', 'liver pate spread, sliced block on a white plate'],
];

function buildPrompt(subject, category) {
    const catHint = {
        mieso: 'meat or cold cuts deli product',
        slodycze: 'sweet dessert',
        zupy: 'soup in a bowl',
        fastfood: 'cooked dish',
        'polskie-obiadki': 'cooked dish',
    }[category] || '';
    const hint = catHint ? ` (${catHint})` : '';
    return (
        `Ultra realistic minimalist ecommerce catalog food photo of ${subject}${hint}. ` +
        `Single food product only, centered, soft natural contact shadow under the product. ` +
        `Large empty pure solid white background #FFFFFF margins on all sides, product fills at most 60% of frame. ` +
        `Studio product shot on seamless white paper, no gray, no textured backdrop. ` +
        `Photorealistic, sharp focus, correct anatomy. ` +
        `Keep plate, bowl or glass fully visible if present, do not crop the vessel. ` +
        `No text, no people, no hands, no animals, no logo, no watermark, no packaging, no extra props.`
    );
}

function seedFromSlug(slug) {
    const h = crypto.createHash('md5').update(`new1000-fix-v1:${slug}`).digest();
    return h.readUInt32BE(0) % 2147483646;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchImage(prompt, slug, attempt) {
    const seed = seedFromSlug(slug) + attempt * 9973;
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=600&nologo=true&model=${MODEL}&seed=${seed}`;
    const res = await fetch(url, {
        headers: { 'User-Agent': UA, Referer: 'https://proteiner.pl/' },
        signal: AbortSignal.timeout(180000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 3000) throw new Error(`plik za mały (${buf.length}b)`);
    return buf;
}

// walidacja wyciętego webp: narożniki przezroczyste + udział "solid"
async function auditCutout(sharp, webpBuf) {
    const { data, info } = await sharp(webpBuf).resize(100, 75).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const w = info.width;
    const h = info.height;
    let solid = 0;
    const total = w * h;
    for (let i = 0; i < data.length; i += 4) if (data[i + 3] > 240) solid++;
    const corners = [[1, 1], [w - 2, 1], [1, h - 2], [w - 2, h - 2]];
    let cornerClear = 0;
    for (const [x, y] of corners) {
        const i = (y * w + x) * 4;
        if (data[i + 3] < 10) cornerClear++;
    }
    return { solidPct: (solid / total) * 100, cornerClear };
}

const src = fs.readFileSync(path.join(root, 'js', 'products-data-raw.js'), 'utf8');
const i0 = src.indexOf('productsDatabaseRaw');
const raw = JSON.parse(src.slice(src.indexOf('[', i0), src.lastIndexOf('];') + 1));
const bySlug = new Map(raw.map((p) => [p.slug, p]));

const sharp = (await import('sharp')).default;
fs.mkdirSync(outDir, { recursive: true });

const missing = PILOT.filter(([slug]) => !bySlug.has(slug));
if (missing.length) {
    console.log('Uwaga — brak slugów w bazie:', missing.map((m) => m[0]).join(', '));
}

console.log(`PILOT: ${PILOT.length} produktów (model=${MODEL}, cutout=u2net)`);

let ok = 0;
let fail = 0;
const failed = [];
const started = Date.now();

for (let idx = 0; idx < PILOT.length; idx++) {
    const [slug, subject] = PILOT[idx];
    const p = bySlug.get(slug);
    if (!p) {
        console.log(`[${idx + 1}/${PILOT.length}] SKIP ${slug} (brak w bazie)`);
        failed.push(slug);
        continue;
    }
    const prompt = buildPrompt(subject, p.category);
    process.stdout.write(`[${idx + 1}/${PILOT.length}] ${slug} … `);

    let lastErr = null;
    for (let attempt = 0; attempt < 3; attempt++) {
        if (attempt > 0) await sleep(3000 * attempt);
        try {
            const buf = await fetchImage(prompt, slug, attempt);
            const cut = await cutoutBuffer(buf, { method: 'u2net' });
            const audit = await auditCutout(sharp, cut.webp);

            fs.writeFileSync(path.join(outDir, `${slug}.jpg`), cut.jpg);
            fs.writeFileSync(path.join(outDir, `${slug}.webp`), cut.webp);
            if (fs.existsSync(path.dirname(bundleDir))) {
                fs.writeFileSync(path.join(bundleDir, `${slug}.jpg`), cut.jpg);
                fs.writeFileSync(path.join(bundleDir, `${slug}.webp`), cut.webp);
            }
            console.log(`OK (attempt ${attempt}, solid=${audit.solidPct.toFixed(1)}%, corners=${audit.cornerClear}/4)`);
            ok++;
            lastErr = null;
            break;
        } catch (e) {
            lastErr = e instanceof Error ? e : new Error(String(e));
        }
    }
    if (lastErr) {
        console.log(`FAIL (${lastErr.message})`);
        fail++;
        failed.push(`${slug}: ${lastErr.message}`);
    }

    if (idx < PILOT.length - 1) await sleep(1500);
}

console.log(`\nPILOT gotowe: ok=${ok}, fail=${fail}, czas=${((Date.now() - started) / 1000).toFixed(0)}s`);
if (failed.length) {
    fs.writeFileSync(path.join(root, 'scripts', '_pilot-failed.txt'), failed.join('\n'));
    console.log('Zapisano scripts/_pilot-failed.txt');
}
