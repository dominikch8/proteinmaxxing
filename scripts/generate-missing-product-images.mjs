/**
 * Generuje zdjęcia dla produktów, które nie mają jeszcze grafiki.
 * Styl: minimalistyczne, fotorealistyczne, czyste białe tło #FFFFFF + wycięte tło
 *       (przezroczysty PNG + biały JPG + WebP), spójne z resztą bazy.
 *
 * Model: Pollinations (Flux domyślnie) — anonimowo, z odpytywaniem po Referer.
 * Wznawialny: pomija produkty, które już mają {slug}.jpg.
 *
 * Użycie:
 *   node scripts/generate-missing-product-images.mjs --pilot --limit=3
 *   node scripts/generate-missing-product-images.mjs --missing --limit=50
 *   node scripts/generate-missing-product-images.mjs --missing           # wszyscy bez grafiki
 *   node scripts/generate-missing-product-images.mjs --slug=kaczka-udo
 *   node scripts/generate-missing-product-images.mjs --category=mieso,sery --missing
 *   node scripts/generate-missing-product-images.mjs --force --model=flux --delay=5500
 *
 * Flagi:
 *   --missing            tylko produkty bez {slug}.jpg (domyślnie, gdy brak --slug/--category)
 *   --all                wszystkie produkty (z --force nadpisze istniejące)
 *   --slug=a --slug=b    wybrane slugi
 *   --category=mieso,sery
 *   --limit=N            maksymalna liczba w tej sesji
 *   --model=flux|turbo   model Pollinations (domyślnie flux)
 *   --delay=ms           przerwa między żądaniami (domyślnie 5500 ms)
 *   --force              nadpisz istniejące pliki
 *   --pilot              zapis do scripts/_imgpreview (nie rusza właściwych katalogów)
 *   --no-webp            pomiń generowanie WebP
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { removeEdgeBackground, defringeLightHalos } from './remove-edge-background.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const productsDir = path.join(root, 'images', 'products');
const bundleDir = path.join(root, 'deploy-bundle', 'images', 'products');
const previewDir = path.join(__dirname, '_imgpreview');
const logPath = path.join(__dirname, '_img-gen-log.txt');

const UA = 'Proteiner/1.0 (nutrition education; contact: developeranios@gmail.com)';
const REFERER = 'https://proteiner.pl/';

/* ── Argumenty ─────────────────────────────────────────────────────────── */
const args = process.argv.slice(2);
const hasFlag = (f) => args.includes(f);
const argVal = (name) => {
    const a = args.find((x) => x.startsWith(`--${name}=`));
    return a ? a.slice(name.length + 3) : null;
};
const slugArgs = args.filter((a) => a.startsWith('--slug=')).map((a) => a.slice(7));
const catArgs = (argVal('category') || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
const limit = argVal('limit') ? Number(argVal('limit')) : Infinity;
const model = argVal('model') || 'flux';
const delayMs = argVal('delay') !== null ? Number(argVal('delay')) : 5500;
const force = hasFlag('--force');
const pilot = hasFlag('--pilot');
const wantWebp = !hasFlag('--no-webp');
const OUT_DIR = pilot ? previewDir : productsDir;

/* ── FOOD_SUBJECT (nadpisania promptów) z rebuild-all-product-photos.mjs ─ */
let FOOD_SUBJECT = {};
try {
    const src = fs.readFileSync(path.join(__dirname, 'rebuild-all-product-photos.mjs'), 'utf8');
    const m = src.match(/const FOOD_SUBJECT = \{([\s\S]*?)\n\};/);
    if (m) FOOD_SUBJECT = Function(`"use strict";return {${m[1]}}`)();
} catch {
    /* opcjonalne */
}

/* ── Słownik PL → EN (subject promptu) ─────────────────────────────────── */
const DICT = {
    'szynka wieprzowa': 'cooked pork ham',
    'szynka z kurczaka': 'sliced chicken ham',
    'szynka konserwowa': 'canned pork ham',
    poledwica: 'pork loin cold cut',
    kielbasa: 'Polish sausage',
    parowki: 'Polish frankfurter sausages',
    pasztet: 'meat pate',
    boczek: 'pork bacon belly',
    kaszanka: 'Polish blood sausage kashanka',
    skrzydelka: 'chicken wings',
    serce: 'poultry heart',
    zoladek: 'pork stomach',
    flaki: 'Polish beef tripe stew',
    serca: 'pork hearts',
    nerki: 'pork kidneys',
    'mieso mielone': 'ground minced meat',
    schabowe: 'pork loin cutlet',
    lopatka: 'pork shoulder',
    kotlet: 'pork cutlet schnitzel',
    klopsiki: 'meatballs',
    morszczuk: 'hake fish fillet',
    pstrag: 'trout fish',
    karp: 'carp fish',
    okon: 'perch fish fillet',
    pangasius: 'pangasius catfish fillet',
    miruna: 'blue whiting fish fillet',
    sardynki: 'sardines in tomato sauce',
    szprotki: 'smoked sprats',
    losos: 'salmon',
    tunczyk: 'tuna steak',
    krewetki: 'shrimp prawns',
    osmiornica: 'octopus',
    malze: 'mussels',
    ostrygi: 'oysters',
    kawior: 'black caviar',
    sledz: 'herring fish',
    'ryba po grecku': 'Polish fish in tomato vegetable sauce',
    mleko: 'milk',
    maslanka: 'buttermilk',
    kefir: 'kefir',
    jogurt: 'yogurt',
    skyr: 'skyr yogurt',
    serek: 'cream cheese spread',
    twarog: 'cottage cheese',
    smietana: 'sour cream',
    kakao: 'cocoa drink',
    'napoj proteinowy': 'protein shake drink',
    'bialko serwatkowe': 'whey protein shake',
    jajko: 'egg',
    jajecznica: 'scrambled eggs',
    omlet: 'omelette',
    'jaja sadzone': 'fried eggs',
    majonez: 'mayonnaise',
    ser: 'cheese',
    gouda: 'gouda cheese',
    mazdamer: 'maasdam cheese',
    tylzycki: 'tylzycki cheese',
    szwajcarski: 'swiss cheese',
    mozzarella: 'mozzarella cheese',
    feta: 'feta cheese',
    balkanski: 'balkan white cheese',
    kozi: 'goat cheese',
    owczy: 'sheep cheese',
    oscypek: 'Polish oscypek smoked cheese',
    topiony: 'processed cheese',
    smazony: 'fried cheese',
    golka: 'cooked ham hock',
    gorgonzola: 'gorgonzola blue cheese',
};

const delayMs = argVal('delay') !== null ? Number(argVal('delay')) : 5500;
const force = hasFlag('--force');
const pilot = hasFlag('--pilot');
const wantWebp = !hasFlag('--no-webp');
const OUT_DIR = pilot ? previewDir : productsDir;
    gorgonzola: 'gorgonzola blue cheese',
};

/* ── Wskazówki kategorii (angielskie) ──────────────────────────────────── */
const CAT_HINT = {
    warzywa: 'fresh vegetable',
    owoce: 'fresh fruit',
    nabial: 'dairy product',
    sery: 'cheese product',
    mieso: 'meat or fish food product',
    zboza: 'grain bakery cereal product',
    'platki-sniadaniowe': 'breakfast cereal',
    makarony: 'pasta dish',
    zupy: 'soup in white bowl',
    orzechy: 'nuts or seeds',
    tluszcze: 'cooking fat or oil',
    sosy: 'sauce condiment',
    przyprawy: 'dry spice seasoning',
    napoje: 'beverage drink in glass',
    alkohole: 'alcoholic drink in glass',
    slodycze: 'sweet snack dessert',
    batony: 'chocolate candy bar',
    'batony-proteinowe': 'protein bar',
    'polskie-obiadki': 'Polish cooked dish on plate',
    'mrozone-pizze': 'whole round pizza',
    fastfood: 'fast food item',
};

/* ── Narzędzia tekstowe ────────────────────────────────────────────────── */
function deaccent(s) {
    return String(s)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/ł/g, 'l');
}

/** Zamienia polską nazwę na w miarę sensowny angielski subject. */
function englishSubject(name) {
    const raw = name.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
    const lower = deaccent(raw);
    const parts = [];
    const used = new Set();
    const keys = Object.keys(DICT).sort((a, b) => b.length - a.length);
    for (const key of keys) {
        if (lower.includes(key)) {
            parts.push(DICT[key]);
            used.add(key);
        }
    }
    if (!parts.length) return raw;
    let rest = lower;
    for (const key of used) rest = rest.split(key).join(' ');
    const extra = rest
        .split(/[\s,/-]+/)
        .filter((w) => w.length > 2)
        .slice(0, 4)
        .join(' ')
        .trim();
    return extra ? `${parts.join(' ')} (${extra})` : parts.join(' ');
}

function buildPrompt(p) {
    const override = FOOD_SUBJECT[p.slug];
    const subject = override || englishSubject(p.name);
    const hint = override ? '' : `, ${CAT_HINT[p.category] || 'food product'}`;
    return (
        `Photorealistic minimalist e-commerce food photo of ${subject}${hint}. ` +
        `Exact edible food or drink product only, single neat portion, centered. ` +
        `Pure solid white background #FFFFFF, no shadow, no drop shadow, no reflection, empty white margins. ` +
        `If a bowl, glass, plate or jar is shown keep the whole vessel fully visible. ` +
        `No text, no labels, no logos, no watermark, no people, no hands, no animals, no busy props. ` +
        `Sharp realistic detail, correct anatomy, no AI deformities.`
    );
}

function seedFromSlug(slug) {
    return crypto.createHash('md5').update(`proteiner-v1-${slug}`).digest().readUInt32BE(0) % 2147483646;
}
/* ── Pobieranie z Pollinations (z backoffem na 429) ────────────────────── */
async function fetchPollinations(prompt, slug) {
    const enc = encodeURIComponent(prompt.slice(0, 700));
    const seed = seedFromSlug(slug);
    const url = `https://image.pollinations.ai/prompt/${enc}?width=800&height=600&nologo=true&model=${model}&seed=${seed}`;
    let lastErr;
    for (let attempt = 0; attempt < 5; attempt++) {
        if (attempt > 0) await sleep(4000 * attempt);
        try {
            const res = await fetch(url, {
                headers: { 'User-Agent': UA, Referer: REFERER },
                signal: AbortSignal.timeout(120000),
                redirect: 'follow',
            });
            if (res.status === 429) throw new Error('HTTP 429 (rate limit)');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const buf = Buffer.from(await res.arrayBuffer());
            if (buf.length < 4000) throw new Error('plik za mały');
            return buf;
        } catch (e) {
            lastErr = e;
        }
    }
    throw lastErr;
}

/* ── Wycięcie tła + zapis PNG/JPG/WebP ─────────────────────────────────── */
async function toCutoutPng(sharp, inputBuf) {
    const resized = await sharp(inputBuf)
        .resize(800, 600, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
    let data = removeEdgeBackground(resized.data, resized.info.width, resized.info.height, 4, {
        lumMin: 236,
        satMax: 32,
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
    return sharp(data, {
        raw: { width: resized.info.width, height: resized.info.height, channels: 4 },
    })
        .png({ compressionLevel: 9 })
        .toBuffer();
}

async function writeProduct(sharp, slug, inputBuf) {
    const png = await toCutoutPng(sharp, inputBuf);
    const jpg = await sharp(png)
        .flatten({ background: { r: 255, g: 255, b: 255 } })
        .jpeg({ quality: 90, mozjpeg: true })
        .toBuffer();
    const webp = wantWebp
        ? await sharp(png).webp({ quality: 82, alphaQuality: 90, effort: 4 }).toBuffer()
        : null;

    const targets = pilot
        ? [previewDir]
        : [productsDir, ...(fs.existsSync(path.dirname(bundleDir)) ? [bundleDir] : [])];

    for (const dir of targets) {
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, `${slug}.png`), png);
        fs.writeFileSync(path.join(dir, `${slug}.jpg`), jpg);
        if (webp) fs.writeFileSync(path.join(dir, `${slug}.webp`), webp);
    }
}


function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

function log(msg) {
    const line = `[${new Date().toISOString()}] ${msg}`;
    console.log(line);
    try {
        fs.appendFileSync(logPath, line + '\n');
    } catch {
        /* ignore */
    }
}

/* ── Główna pętla ──────────────────────────────────────────────────────── */
const raw = JSON.parse(
    fs.readFileSync(path.join(root, 'js', 'products-data-raw.js'), 'utf8').match(
        /productsDatabaseRaw = (\[[\s\S]*\]);/
    )[1]
);
const products = raw.map((p) => ({
    ...p,
    slug: p.slug && String(p.slug).trim() ? String(p.slug).trim() : slugify(p.name),
}));

const sharp = (await import('sharp')).default;
if (pilot) fs.mkdirSync(previewDir, { recursive: true });

const existsAnywhere = (slug) =>
    fs.existsSync(path.join(productsDir, `${slug}.jpg`)) ||
    fs.existsSync(path.join(productsDir, `${slug}.png`));

let todo = products;

if (slugArgs.length) {
    const set = new Set(slugArgs);
    todo = products.filter((p) => set.has(p.slug));
} else if (catArgs.length) {
    const set = new Set(catArgs);
    todo = products.filter((p) => set.has(p.category));
} else {
    todo = products.filter((p) => !existsAnywhere(p.slug));
}

if (!force) todo = todo.filter((p) => !existsAnywhere(p.slug));
todo = todo.slice(0, limit);

log(
    `Start: model=${model} delay=${delayMs}ms pilot=${pilot} | do wygenerowania: ${todo.length} ` +
        `(baza: ${products.length})`
);

let ok = 0;
let fail = 0;
const failed = [];
const started = Date.now();

for (let i = 0; i < todo.length; i++) {
    const p = todo[i];
    const prompt = buildPrompt(p);
    process.stdout.write(`[${i + 1}/${todo.length}] ${p.slug} … `);
    try {
        const buf = await fetchPollinations(prompt, p.slug);
        await writeProduct(sharp, p.slug, buf);
        ok++;
        console.log('OK');
    } catch (e) {
        fail++;
        failed.push(`${p.slug}\t${e.message}`);
        console.log(`FAIL (${e.message})`);
    }
    if ((i + 1) % 25 === 0 || i === todo.length - 1) {
        const mins = ((Date.now() - started) / 60000).toFixed(1);
        log(`Postęp: ${i + 1}/${todo.length} (OK=${ok} FAIL=${fail}, ${mins} min)`);
    }
    if (i < todo.length - 1) await sleep(delayMs);
}

log(`Gotowe: ${ok} OK, ${fail} błędów, ${((Date.now() - started) / 60000).toFixed(1)} min → ${OUT_DIR}`);
if (failed.length) {
    const p = path.join(__dirname, '_img-gen-failed.txt');
    fs.writeFileSync(p, failed.join('\n'));
    log(`Zapisano listę błędów: ${path.relative(root, p)}`);
}

