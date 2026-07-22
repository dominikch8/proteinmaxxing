/**
 * Generuje WSZYSTKIE zdjęcia produktów (bez Wikimedia/Openverse).
 * Tylko AI: białe tło + kontekst JEDZENIA.
 *
 * node scripts/rebuild-all-product-photos.mjs
 * node scripts/rebuild-all-product-photos.mjs --keep-slugs=banan,lion
 * node scripts/rebuild-all-product-photos.mjs --slug=lion --slug=mars
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import os from 'os';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'images', 'products');
const queriesPath = path.join(root, 'js', 'product-search-queries.js');
const UA = 'Proteiner/1.0 (nutrition education; contact: dominikchw1@gmail.com)';

/** Jawny temat JEDZENIA (EN) — nigdy zwierzę / planeta / galaktyka */
const FOOD_SUBJECT = {
    lion: 'Lion Nestle chocolate candy bar wafer caramel cereal',
    'milky-way': 'Milky Way chocolate nougat candy bar',
    mars: 'Mars chocolate nougat caramel candy bar',
    twix: 'Twix chocolate cookie caramel candy bars',
    snickers: 'Snickers chocolate peanut nougat candy bar',
    bounty: 'Bounty coconut chocolate candy bar',
    oreo: 'Oreo chocolate cream sandwich cookies',
    'kit-kat': 'Kit Kat chocolate wafer candy bar',
    raffaello: 'Raffaello white coconut almond candy balls',
    '3-bit': '3 Bit Polish chocolate wafer candy bar',
    delicje: 'Delicje Polish jam filled chocolate cookies',
    'kinder-bueno': 'Kinder Bueno chocolate hazelnut wafer bar',
    'prince-polo': 'Prince Polo chocolate wafer bar',
    'ptasie-mleczko': 'Ptasie mleczko marshmallow chocolate candy',
    'baton-proteinowy': 'protein chocolate candy bar',
    'krem-czekoladowy-milka': 'chocolate hazelnut spread in glass jar',
    'czekolada-mleczna': 'milk chocolate bar',
    'czekolada-gorzka': 'dark chocolate bar',
    'czekolada-100': '100 percent dark chocolate bar',
    hamburger: 'beef hamburger burger with bun',
    'big-mac-styl': 'double cheeseburger Big Mac style',
    'whopper-styl': 'flame grilled burger Whopper style',
    'hot-dog': 'hot dog sausage in bun',
    frytki: 'french fries potato chips',
    'piers-z-kurczaka': 'raw chicken breast fillets',
    'piers-z-indyka': 'raw turkey breast fillet meat',
    banan: 'ripe yellow banana fruit',
    jablko: 'red apple fruit',
    'fasolka-szparagowa': 'fresh green beans vegetable',
    migdaly: 'raw whole almonds nuts',
    'sos-sojowy': 'dark soy sauce in clear glass bottle',
    cytryna: 'yellow lemon citrus fruit',
    pomidor: 'red tomato vegetable',
    ogorek: 'green cucumber vegetable',
    ketchup: 'tomato ketchup in bottle',
    majonez: 'mayonnaise in glass jar',
    guacamole: 'guacamole avocado dip in bowl',
    'losos-atlantycki': 'raw salmon fillet fish',
    'twarog-chudy': 'cottage cheese curds in bowl',
    'ryz-bialy-gotowany': 'cooked white rice in bowl',
    bigos: 'Polish bigos hunter stew cabbage meat',
    'pierogi-ruskie': 'Polish pierogi dumplings',
    rosol: 'Polish chicken broth clear soup',
    'ser-mozzarella': 'fresh mozzarella cheese ball',
    'mleko-2': 'glass of white cow milk',
    'jajko-kurze-cale': 'brown chicken egg',
    'orzechy-wloskie': 'walnuts nuts',
    'orzechy-laskowe': 'hazelnuts nuts',
    'orzechy-ziemne': 'peanuts nuts',
    truskawki: 'fresh red strawberries',
    maliny: 'fresh red raspberries',
    rukola: 'fresh arugula salad leaves',
    kalafior: 'white cauliflower head',
    brokuly: 'green broccoli head',
    ziemniaki: 'brown potato vegetable',
    marchew: 'orange carrots vegetable',
    salami: 'salami sausage slices',
    ricotta: 'ricotta cheese in bowl',
    'oliwa-z-oliwek': 'olive oil in clear glass bottle',
    maslo: 'yellow butter stick',
    'szpinak-swiezy': 'fresh spinach leaves',
    winogrona: 'purple grapes fruit',
    cielecina: 'raw veal meat',
    'indyk-mielony': 'raw ground turkey meat',
    'kurczak-mielony': 'raw ground chicken meat',
    'mieso-mielone-wolowe': 'raw ground beef meat'
};

const CATEGORY_FOOD_SUFFIX = {
    mieso: 'meat food',
    nabial: 'dairy food',
    warzywa: 'vegetable food',
    owoce: 'fruit food',
    zboza: 'grain cereal food',
    orzechy: 'nuts seeds food',
    sosy: 'sauce condiment food',
    tluszcze: 'cooking oil fat food',
    makarony: 'pasta food',
    zupy: 'soup food',
    fastfood: 'fast food meal',
    slodycze: 'sweet candy dessert food',
    'polskie-obiadki': 'Polish cooked food dish'
};

const ANIMAL_OR_AMBIGUOUS = /^(lion|mars|bounty|turkey|apple|orange|kiwi|mercury|venus|earth|jupiter|saturn|neptune|pluto)$/i;

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
        return { ...p, slug };
    });
}

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

function buildFoodSubject(p, queries) {
    if (FOOD_SUBJECT[p.slug]) return FOOD_SUBJECT[p.slug];

    let base = (queries[0] || p.name.replace(/\([^)]*\)/g, '').trim())
        .replace(/\s+food$/i, '')
        .replace(/\s+ingredient photo$/i, '')
        .trim();

    if (ANIMAL_OR_AMBIGUOUS.test(base)) {
        if (/lion/i.test(base)) return 'Lion Nestle chocolate candy bar';
        if (/mars/i.test(base)) return 'Mars chocolate candy bar';
        if (/bounty/i.test(base)) return 'Bounty coconut chocolate candy bar';
        if (/turkey/i.test(base)) return 'raw turkey breast meat';
        if (/^apple$/i.test(base)) return 'red apple fruit';
        if (/^orange$/i.test(base)) return 'orange citrus fruit';
        if (/^kiwi$/i.test(base)) return 'kiwi fruit';
    }

    const suffix = CATEGORY_FOOD_SUFFIX[p.category] || 'food';
    if (/\b(food|fruit|vegetable|meat|cheese|soup|candy|chocolate|bar|sauce|oil|nut|seed|bread|pasta|rice|egg|milk|cookie|wafer)\b/i.test(base)) {
        return base;
    }
    return `${base} ${suffix}`;
}

function pollinationsUrl(foodSubject, slug) {
    const subject = String(foodSubject).slice(0, 110);
    const prompt =
        `Professional e-commerce product photo of edible food: ${subject}. ` +
        `This is FOOD only, never an animal, never a planet, never a person. ` +
        `Centered on pure seamless white background, soft subtle shadow, ` +
        `minimalist studio lighting, photorealistic, no text, no watermark, no logo print`;
    const seed = crypto.createHash('md5').update(`gen-white-v5-${slug}`).digest().readUInt32BE(0) % 2147483646;
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=600&nologo=true&seed=${seed}`;
}

async function saveGenerated(sharp, url, outPath) {
    let lastErr;
    for (let attempt = 0; attempt < 5; attempt++) {
        try {
            const res = await fetch(url, {
                headers: { 'User-Agent': UA },
                signal: AbortSignal.timeout(120000)
            });
            if (res.status === 429) {
                await sleep(1500 * (attempt + 1) ** 2);
                continue;
            }
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const buf = Buffer.from(await res.arrayBuffer());
            if (buf.length < 4000) throw new Error('za mały plik');
            const tmp = path.join(os.tmpdir(), `proteiner-${crypto.randomBytes(8).toString('hex')}.jpg`);
            try {
                await sharp(buf)
                    .resize(800, 600, { fit: 'contain', background: { r: 255, g: 255, b: 255 } })
                    .flatten({ background: { r: 255, g: 255, b: 255 } })
                    .jpeg({ quality: 88, mozjpeg: true })
                    .toFile(tmp);
                fs.writeFileSync(outPath, fs.readFileSync(tmp));
            } finally {
                try {
                    fs.unlinkSync(tmp);
                } catch {
                    /* ignore */
                }
            }
            return;
        } catch (e) {
            lastErr = e;
            await sleep(600 * (attempt + 1));
        }
    }
    throw lastErr;
}

// --- main ---
let PRODUCT_SEARCH_QUERIES = {};
if (fs.existsSync(queriesPath)) {
    const mod = await import(pathToFileURL(queriesPath).href);
    PRODUCT_SEARCH_QUERIES = mod.PRODUCT_SEARCH_QUERIES || {};
}

const raw = JSON.parse(
    fs.readFileSync(path.join(root, 'js', 'products-data-raw.js'), 'utf8').match(/productsDatabaseRaw = (\[[\s\S]*\]);/)[1]
);
const products = enrichProducts(raw);
const sharp = (await import('sharp')).default;
fs.mkdirSync(outDir, { recursive: true });

const slugArgs = [];
for (let i = 0; i < process.argv.length; i++) {
    if (process.argv[i] === '--slug' && process.argv[i + 1]) slugArgs.push(process.argv[++i]);
    else if (process.argv[i].startsWith('--slug=')) slugArgs.push(process.argv[i].slice(7));
}
const fromFile = process.argv.find((a) => a.startsWith('--from-file='));
if (fromFile) {
    const fp = path.resolve(root, fromFile.split('=')[1]);
    slugArgs.push(
        ...fs
            .readFileSync(fp, 'utf8')
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter(Boolean)
    );
}
const keepArg = process.argv.find((a) => a.startsWith('--keep-slugs='));
const keepSlugs = new Set(
    (keepArg?.split('=')[1] || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
);
const limitArg = process.argv.find((a) => a.startsWith('--limit='));
const maxItems = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity;
const delayMs = parseInt(process.argv.find((a) => a.startsWith('--delay='))?.split('=')[1] || '1800', 10);

let todo = products;
if (slugArgs.length) {
    const set = new Set(slugArgs);
    todo = products.filter((p) => set.has(p.slug));
}
if (keepSlugs.size) todo = todo.filter((p) => !keepSlugs.has(p.slug));
todo = todo.slice(0, maxItems);

console.log(`GENERACJA (tylko AI, białe tło, FOOD): ${todo.length} produktów`);

let ok = 0;
let fail = 0;
const failed = [];

for (let i = 0; i < todo.length; i++) {
    const p = todo[i];
    const outPath = path.join(outDir, `${p.slug}.jpg`);
    const queries = PRODUCT_SEARCH_QUERIES[p.slug] || [p.name.replace(/\([^)]*\)/g, '').trim()];
    const subject = buildFoodSubject(p, queries);
    const url = pollinationsUrl(subject, p.slug);

    process.stdout.write(`[${i + 1}/${todo.length}] ${p.slug} … `);

    try {
        await saveGenerated(sharp, url, outPath);
        console.log(`OK (${subject.slice(0, 42)})`);
        ok++;
    } catch (e) {
        console.log(`✗ ${e.message}`);
        fail++;
        failed.push(p.slug);
    }
    if (i < todo.length - 1) await sleep(delayMs);
}

if (failed.length) {
    fs.writeFileSync(path.join(root, 'scripts', 'rebuild-failed.txt'), failed.join('\n'));
}
console.log(`\nGotowe: ${ok} OK, ${fail} błędów`);
