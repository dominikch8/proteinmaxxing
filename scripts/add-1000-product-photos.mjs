/**
 * Generuje brakujące zdjęcia produktów w stylu bazy: minimalistyczne,
 * fotorealistyczne, z wyciętym tłem (przezroczysty PNG + JPG na białym + WebP).
 *
 * Silnik: Pollinations (Flux) → white-bg photo → cutoutBuffer (auto, flood-fill).
 *
 * node scripts/add-1000-product-photos.mjs --report          # tylko lista braków
 * node scripts/add-1000-product-photos.mjs --limit=5         # test na 5 pozycjach
 * node scripts/add-1000-product-photos.mjs                   # wszystkie brakujące
 * node scripts/add-1000-product-photos.mjs --slug=kaczka-udo # pojedyncze slugi
 * node scripts/add-1000-product-photos.mjs --concurrency=6 --delay=0
 * node scripts/add-1000-product-photos.mjs --force           # nadpisz istniejące
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

const args = process.argv.slice(2);
const report = args.includes('--report');
const force = args.includes('--force');
const onlySlugs = args.filter((a) => a.startsWith('--slug=')).map((a) => a.slice(7));
const limitArg = args.find((a) => a.startsWith('--limit='));
const limit = limitArg ? Number(limitArg.slice(8)) : Infinity;
const concArg = args.find((a) => a.startsWith('--concurrency='));
const concurrency = concArg ? Math.max(1, Number(concArg.slice(14))) : 6;
const delayArg = args.find((a) => a.startsWith('--delay='));
const delayMs = delayArg ? Number(delayArg.slice(8)) : 0;

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

/** Angielskie wskazówki kategorii dla lepszych promptów. */
const CATEGORY_EN = {
    warzywa: 'fresh raw vegetable, edible food only',
    owoce: 'fresh ripe fruit, edible food only',
    nabial: 'dairy product, edible food only',
    sery: 'cheese, edible food only',
    mieso: 'raw or cooked meat, fish or poultry, edible food only',
    zboza: 'grain, flour, bread or bakery product, edible food only',
    orzechy: 'nuts or seeds, edible food only',
    sosy: 'sauce or condiment, edible food only',
    tluszcze: 'butter, oil or cooking fat, edible food only',
    makarony: 'pasta or noodles, edible food only',
    zupy: 'soup served in a white ceramic bowl, edible food only',
    fastfood: 'fast food item, edible food only',
    slodycze: 'sweet candy or chocolate dessert, edible food only',
    batony: 'chocolate candy bar, edible food only',
    'batony-proteinowe': 'protein bar, edible food only',
    'polskie-obiadki': 'Polish home-style cooked dish on a plate, edible food only',
    przyprawy: 'dry culinary spice or dried herbs, small neat pile, edible food only',
    alkohole: 'alcoholic drink served in a clear glass, whole glass visible',
    napoje: 'beverage served in a clear glass, whole glass visible',
    'platki-sniadaniowe': 'breakfast cereal flakes, edible food only',
    'mrozone-pizze': 'whole round pizza, edible food only',
    'dania-gotowe': 'ready meal on a plate, edible food only'
};

/** Miejsca, w których Flux ma tendencję do dokładania opakowań/etykiet — doprecyzowanie. */
function subjectFor(p, catEn) {
    const en = catEn || 'edible food or drink product only';
    const lower = `${p.name} ${p.category}`.toLowerCase();
    if (/sok|napój|napoje|kubuś|tymbark|cola|pepsi|fanta|sprite|mirinda|woda|piwo|wino|wódka|whisky|likier|prosecco|energy/i.test(lower)) {
        return `${p.name}, ${en}, in/with a clear glass, no bottle, no can, no label`;
    }
    if (/zupa|barszcz|rosół|krem|żurek|chłodnik/i.test(lower)) {
        return `${p.name}, ${en}, in a white ceramic bowl, whole bowl visible`;
    }
    if (/sos|ketchup|majonez|musztard|pesto|hummus|dip/i.test(lower)) {
        return `${p.name}, ${en}, in a small white bowl, no jar, no label`;
    }
    return `${p.name}, ${en}`;
}

function buildPrompt(p) {
    const catEn = CATEGORY_EN[p.category];
    const subject = subjectFor(p, catEn);
    return (
        `Photorealistic minimalist e-commerce food photo of ${subject}. ` +
        `Single neat portion, perfectly centered on a pure solid white background #FFFFFF, ` +
        `soft subtle shadow, bright studio lighting, isolated product, sharp realistic detail. ` +
        `Only the edible food or drink, nothing else. ` +
        `No people, no hands, no animals, no text, no logos, no watermark, no readable packaging, no props.`
    );
}

function seedFromSlug(slug) {
    const h = crypto.createHash('md5').update(`${slug}:photo1`).digest();
    return h.readUInt32BE(0) % 2147483646;
}

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

const raw = JSON.parse(
    fs.readFileSync(path.join(root, 'js', 'products-data-raw.js'), 'utf8').match(/productsDatabaseRaw = ([\s\S]*\]);/)[1]
);
const allProducts = enrichProducts(raw);

function haveExt(slug, ext) {
    return fs.existsSync(path.join(outDir, `${slug}.${ext}`));
}
function isComplete(slug) {
    return haveExt(slug, 'webp') && haveExt(slug, 'jpg') && haveExt(slug, 'png');
}

async function fetchPollinations(p, attempt) {
    const prompt = encodeURIComponent(buildPrompt(p));
    const seed = seedFromSlug(p.slug) + attempt * 1013;
    const url = `https://image.pollinations.ai/prompt/${prompt}?width=800&height=600&nologo=true&model=flux&seed=${seed}`;
    const res = await fetch(url, {
        headers: { 'User-Agent': UA, Referer: 'https://proteiner.pl/' },
        signal: AbortSignal.timeout(180000)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 3000) throw new Error(`plik za mały (${buf.length}b)`);
    return buf;
}

function writeOutputs(slug, out) {
    fs.writeFileSync(path.join(outDir, `${slug}.png`), out.png);
    fs.writeFileSync(path.join(outDir, `${slug}.jpg`), out.jpg);
    fs.writeFileSync(path.join(outDir, `${slug}.webp`), out.webp);
    if (fs.existsSync(path.dirname(bundleDir))) {
        fs.mkdirSync(bundleDir, { recursive: true });
        fs.writeFileSync(path.join(bundleDir, `${slug}.png`), out.png);
        fs.writeFileSync(path.join(bundleDir, `${slug}.jpg`), out.jpg);
        fs.writeFileSync(path.join(bundleDir, `${slug}.webp`), out.webp);
    }
}

async function processOne(p) {
    let lastErr = null;
    for (let attempt = 0; attempt < 3; attempt++) {
        if (attempt > 0) await sleep(2500 * attempt);
        try {
            const buf = await fetchPollinations(p, attempt);
            const out = await cutoutBuffer(buf, { method: 'auto' });
            writeOutputs(p.slug, out);
            return { ok: true };
        } catch (e) {
            lastErr = e;
        }
    }
    return { ok: false, error: lastErr ? lastErr.message : 'unknown' };
}

let todo = allProducts;
if (onlySlugs.length) {
    const set = new Set(onlySlugs);
    todo = allProducts.filter((p) => set.has(p.slug));
} else if (!force) {
    todo = allProducts.filter((p) => !isComplete(p.slug));
}
if (limit !== Infinity) todo = todo.slice(0, limit);

if (report) {
    const byCat = {};
    for (const p of todo) byCat[p.category] = (byCat[p.category] || 0) + 1;
    console.log(`Produkty: ${allProducts.length}, brakujące (niekompletne): ${todo.length}`);
    console.log('Wg kategorii:');
    Object.entries(byCat)
        .sort((a, b) => b[1] - a[1])
        .forEach(([c, n]) => console.log(`  ${c}: ${n}`));
    console.log('\nPrzykłady:');
    todo.slice(0, 20).forEach((p) => console.log(`  ${p.slug}\t${p.name}\t${p.category}`));
    process.exit(0);
}

if (!todo.length) {
    console.log('Wszystkie produkty mają komplet zdjęć. Nic do zrobienia.');
    process.exit(0);
}

fs.mkdirSync(outDir, { recursive: true });
console.log(`Do wygenerowania: ${todo.length} zdjęć (concurrency=${concurrency}, model=flux)`);

let ok = 0;
let fail = 0;
const failed = [];
const started = Date.now();
let cursor = 0;

async function worker(id) {
    while (cursor < todo.length) {
        const p = todo[cursor++];
        const idx = cursor;
        const t0 = Date.now();
        const res = await processOne(p);
        if (res.ok) {
            ok++;
            console.log(`[${idx}/${todo.length}] ✓ ${p.slug} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
        } else {
            fail++;
            failed.push({ slug: p.slug, error: res.error });
            console.log(`[${idx}/${todo.length}] ✗ ${p.slug} — ${res.error}`);
        }
        if (delayMs) await sleep(delayMs);
    }
}

await Promise.all(Array.from({ length: Math.min(concurrency, todo.length) }, (_, i) => worker(i)));

if (failed.length) {
    fs.writeFileSync(path.join(root, 'scripts', 'product-photos-failed.json'), JSON.stringify(failed, null, 2));
}
console.log(
    `\nGotowe: ok=${ok}, fail=${fail}, czas=${((Date.now() - started) / 1000).toFixed(0)}s → ${outDir}`
);

