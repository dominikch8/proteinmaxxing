/**
 * Regeneracja WSZYSTKICH zdjęć produktów — zawsze kontekst JEDZENIA.
 * Zapytanie = nazwa EN + "food" / "chocolate bar" itd. (żeby Lion ≠ lew).
 *
 * Kolejność:
 * 1) Commons/Openverse z food-query
 * 2) Wikipedia tylko z food-specific titles
 * 3) Pollinations: "edible food product photo of …"
 *
 * node scripts/rebuild-all-product-photos.mjs
 * node scripts/rebuild-all-product-photos.mjs --keep-slugs=banan,jablko
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

const BAD_TITLE =
    /logo|icon|diagram|map|flag|coat of arms|symbol|chart|graph|list of|disambiguation|category:|svg|stamp|seal|signature|portrait|building|aircraft|vehicle|watermark|screenshot|qr|panthera|wildlife|zoo|safari|lioness|male lion|african lion|constellation|astronomy|galaxy|milky way galaxy|planet|moon|star /i;

const ANIMAL_ONLY =
    /^(lion|tiger|bear|wolf|fox|deer|eagle|hawk|owl|shark|whale|dolphin|snake|spider|ant|bee|cat|dog|horse|cow|pig|sheep|goat|rabbit|mouse|rat|monkey|ape|gorilla|elephant|giraffe|zebra|hippo|rhino|crocodile|alligator|frog|toad|lizard|turtle|penguin|parrot|crow|raven|duck|goose|swan|peacock|flamingo|kangaroo|koala|panda|sloth|otter|seal|walrus|bat|hedgehog|squirrel|chipmunk|raccoon|skunk|moose|elk|bison|buffalo|camel|llama|alpaca|donkey|mule|pony|ferret|hamster|guinea pig|chinchilla|lemur|meerkat|mongoose|hyena|cheetah|leopard|jaguar|cougar|lynx|bobcat|wildcat)$/i;

/** Jawny temat JEDZENIA (EN) — obowiązkowy kontekst food */
const FOOD_SUBJECT = {
    lion: 'Lion chocolate candy bar Nestle',
    'milky-way': 'Milky Way chocolate candy bar',
    mars: 'Mars chocolate candy bar',
    twix: 'Twix chocolate cookie candy bar',
    snickers: 'Snickers chocolate peanut candy bar',
    bounty: 'Bounty coconut chocolate candy bar',
    oreo: 'Oreo chocolate sandwich cookies',
    'kit-kat': 'Kit Kat chocolate wafer bar',
    raffaello: 'Raffaello coconut almond candy',
    '3-bit': '3 Bit Polish chocolate wafer bar',
    delicje: 'Delicje Polish jam chocolate cookies',
    'kinder-bueno': 'Kinder Bueno chocolate hazelnut bar',
    'prince-polo': 'Prince Polo chocolate wafer bar',
    'ptasie-mleczko': 'Ptasie mleczko marshmallow chocolate candy',
    'baton-proteinowy': 'protein chocolate bar food',
    'krem-czekoladowy-milka': 'Milka chocolate hazelnut spread jar food',
    'czekolada-mleczna': 'milk chocolate bar food',
    'czekolada-gorzka': 'dark chocolate bar food',
    'czekolada-100': '100 percent dark chocolate bar food',
    hamburger: 'hamburger beef burger food',
    'big-mac-styl': 'Big Mac style double burger food',
    'whopper-styl': 'Whopper style burger food',
    'hot-dog': 'hot dog sausage in bun food',
    frytki: 'french fries potato food',
    'piers-z-kurczaka': 'raw chicken breast meat food',
    'piers-z-indyka': 'raw turkey breast meat food',
    banan: 'yellow banana fruit food',
    jablko: 'red apple fruit food',
    'fasolka-szparagowa': 'fresh green beans vegetable food',
    migdaly: 'raw almonds nuts food',
    'sos-sojowy': 'soy sauce bottle food',
    cytryna: 'yellow lemon fruit food',
    pomidor: 'red tomato vegetable food',
    ogorek: 'green cucumber vegetable food',
    ketchup: 'tomato ketchup bottle food',
    majonez: 'mayonnaise jar food',
    guacamole: 'guacamole avocado dip bowl food',
    'losos-atlantycki': 'raw salmon fillet fish food',
    'twarog-chudy': 'cottage cheese curd bowl food',
    'ryz-bialy-gotowany': 'cooked white rice bowl food',
    bigos: 'Polish bigos hunter stew food',
    'pierogi-ruskie': 'Polish pierogi dumplings food',
    'rosol': 'Polish chicken broth soup food',
    'ser-mozzarella': 'mozzarella cheese ball food',
    'mleko-2': 'glass of cow milk food',
    'jajko-kurze-cale': 'brown chicken egg food',
    'orzechy-wloskie': 'walnuts nuts food',
    'orzechy-laskowe': 'hazelnuts nuts food',
    'orzechy-ziemne': 'peanuts nuts food',
    truskawki: 'fresh strawberries fruit food',
    maliny: 'fresh raspberries fruit food',
    rukola: 'fresh arugula leaves food',
    kalafior: 'cauliflower vegetable food',
    brokuly: 'broccoli vegetable food',
    ziemniaki: 'potato vegetable food',
    marchew: 'carrots vegetable food',
    salami: 'salami sausage slices food',
    ricotta: 'ricotta cheese bowl food',
    'oliwa-z-oliwek': 'olive oil bottle food',
    maslo: 'butter stick food',
    'szpinak-swiezy': 'fresh spinach leaves food',
    winogrona: 'grapes fruit food',
    'cielecina': 'veal meat food',
    'indyk-mielony': 'ground turkey meat food',
    'kurczak-mielony': 'ground chicken meat food',
    'mieso-mielone-wolowe': 'ground beef meat food'
};

/** Wikipedia titles that are food articles (never animals) */
const WIKI_TITLES = {
    lion: ['Lion (chocolate bar)'],
    'milky-way': ['Milky Way (chocolate bar)'],
    mars: ['Mars (chocolate bar)'],
    twix: ['Twix'],
    snickers: ['Snickers'],
    bounty: ['Bounty (chocolate bar)'],
    oreo: ['Oreo'],
    'kit-kat': ['Kit Kat'],
    raffaello: ['Raffaello (confection)'],
    'kinder-bueno': ['Kinder Bueno'],
    'piers-z-kurczaka': ['Chicken as food'],
    'piers-z-indyka': ['Turkey as food'],
    banan: ['Banana'],
    jablko: ['Apple'],
    'fasolka-szparagowa': ['Green bean'],
    migdaly: ['Almond'],
    hamburger: ['Hamburger'],
    frytki: ['French fries'],
    'losos-atlantycki': ['Salmon as food'],
    'twarog-chudy': ['Cottage cheese'],
    bigos: ['Bigos'],
    'pierogi-ruskie': ['Pierogi'],
    ketchup: ['Ketchup'],
    majonez: ['Mayonnaise'],
    guacamole: ['Guacamole'],
    'jajko-kurze-cale': ['Egg as food'],
    'ser-mozzarella': ['Mozzarella'],
    'mleko-2': ['Milk'],
    salami: ['Salami'],
    ricotta: ['Ricotta'],
    'oliwa-z-oliwek': ['Olive oil'],
    maslo: ['Butter'],
    truskawki: ['Strawberry'],
    maliny: ['Raspberry'],
    rukola: ['Arugula'],
    kalafior: ['Cauliflower'],
    brokuly: ['Broccoli'],
    ziemniaki: ['Potato'],
    marchew: ['Carrot'],
    pomidor: ['Tomato'],
    ogorek: ['Cucumber'],
    cytryna: ['Lemon'],
    'szpinak-swiezy': ['Spinach'],
    winogrona: ['Grape'],
    'orzechy-wloskie': ['Walnut'],
    'orzechy-laskowe': ['Hazelnut'],
    'orzechy-ziemne': ['Peanut'],
    'sos-sojowy': ['Soy sauce'],
    'ryz-bialy-gotowany': ['Cooked rice']
};

const CATEGORY_FOOD_SUFFIX = {
    mieso: 'meat food',
    nabial: 'dairy food',
    warzywa: 'vegetable food',
    owoce: 'fruit food',
    zboza: 'grain food',
    orzechy: 'nuts food',
    sosy: 'sauce food condiment',
    tluszcze: 'cooking oil fat food',
    makarony: 'pasta food',
    zupy: 'soup food',
    fastfood: 'fast food meal',
    slodycze: 'sweet candy dessert food',
    'polskie-obiadki': 'Polish food dish'
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

function keywords(q) {
    return q
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(
            (w) =>
                w.length > 2 &&
                !['food', 'fresh', 'the', 'and', 'photo', 'ingredient', 'dish', 'cooked', 'candy', 'bar', 'chocolate'].includes(w)
        );
}

/** Buduje temat jedzenia: zawsze kończy się kontekstem food */
function buildFoodSubject(p, queries) {
    if (FOOD_SUBJECT[p.slug]) return FOOD_SUBJECT[p.slug];

    const base = (queries[0] || p.name.replace(/\([^)]*\)/g, '').trim())
        .replace(/\s+food$/i, '')
        .replace(/\s+ingredient photo$/i, '')
        .trim();

    // Unikaj gołych nazw zwierząt / marek bez "food"
    if (ANIMAL_ONLY.test(base) || /^(lion|mars|bounty|turkey|apple|orange|kiwi)$/i.test(base)) {
        const suffix = CATEGORY_FOOD_SUFFIX[p.category] || 'food';
        if (/lion/i.test(base)) return 'Lion chocolate candy bar food';
        if (/mars/i.test(base)) return 'Mars chocolate candy bar food';
        if (/bounty/i.test(base)) return 'Bounty chocolate candy bar food';
        if (/turkey/i.test(base)) return 'turkey meat food';
        if (/^apple$/i.test(base)) return 'apple fruit food';
        if (/^orange$/i.test(base)) return 'orange fruit food';
        if (/^kiwi$/i.test(base)) return 'kiwi fruit food';
        return `${base} ${suffix}`;
    }

    const suffix = CATEGORY_FOOD_SUFFIX[p.category] || 'food';
    if (/\b(food|fruit|vegetable|meat|cheese|soup|candy|chocolate|bar|sauce|oil|nut|seed|bread|pasta|rice|egg|milk)\b/i.test(base)) {
        return `${base} food`.replace(/\s+food\s+food$/i, ' food');
    }
    return `${base} ${suffix}`;
}

function foodQueries(p, queries) {
    const subject = buildFoodSubject(p, queries);
    const list = [
        subject,
        `${subject} edible`,
        `${p.name.replace(/\([^)]*\)/g, '').trim()} jedzenie`,
        ...queries.map((q) => (/food|chocolate|candy|fruit|meat|cheese/i.test(q) ? q : `${q} food`))
    ];
    return [...new Set(list.filter(Boolean))];
}

function isFoodSafeWiki(data, title) {
    if (!data || data.type === 'disambiguation') return false;
    const t = `${title} ${data.title || ''} ${data.description || ''} ${data.extract || ''}`.toLowerCase();
    if (BAD_TITLE.test(t)) return false;
    if (/\b(mammal|carnivore|felidae|animal|species of|constellation|astronomy|galaxy|planet)\b/.test(t) && !/\b(food|chocolate|candy|cuisine|dish|cheese|meat|fruit|vegetable|confection|snack|bar)\b/.test(t)) {
        return false;
    }
    // Require food signal for short/ambiguous titles
    if (ANIMAL_ONLY.test(title) || /^(lion|mars|bounty|turkey)$/i.test(title)) return false;
    return true;
}

async function wikiRestImage(title) {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const res = await fetch(url, {
        headers: { 'User-Agent': UA, Accept: 'application/json' },
        signal: AbortSignal.timeout(20000)
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!isFoodSafeWiki(data, title)) return null;
    const src = data?.originalimage?.source || data?.thumbnail?.source;
    if (!src || BAD_TITLE.test(src)) return null;
    return src;
}

async function commonsBest(query) {
    const foodQuery = /food|chocolate|candy|fruit|meat|cheese|soup|sauce|vegetable/i.test(query)
        ? query
        : `${query} food`;
    const params = new URLSearchParams({
        action: 'query',
        generator: 'search',
        gsrsearch: `filetype:bitmap ${foodQuery}`,
        gsrnamespace: '6',
        gsrlimit: '12',
        prop: 'imageinfo',
        iiprop: 'url',
        iiurlwidth: '800',
        format: 'json',
        origin: '*'
    });
    const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
        headers: { 'User-Agent': UA },
        signal: AbortSignal.timeout(20000)
    });
    if (!res.ok) return null;
    const data = await res.json();
    const pages = Object.values(data?.query?.pages || {});
    const kws = keywords(foodQuery);
    let best = null;
    for (const page of pages) {
        const title = page?.title || '';
        if (BAD_TITLE.test(title)) continue;
        if (/\blion\b/i.test(title) && !/chocolate|candy|bar|nestle|confect/i.test(title)) continue;
        if (/\bmars\b/i.test(title) && !/chocolate|candy|bar|confect/i.test(title)) continue;
        const info = page?.imageinfo?.[0];
        const url = info?.thumburl || info?.url;
        if (!url || !/\.(jpg|jpeg|png|webp)/i.test(url)) continue;
        let score = 0;
        const t = title.toLowerCase();
        for (const w of kws) if (t.includes(w)) score += 15;
        if (/food|chocolate|candy|fruit|vegetable|meat|cheese|soup|sauce|bread|pasta|rice|egg|milk|nut/.test(t)) score += 10;
        if (score < 20) continue;
        if (!best || score > best.score) best = { url, score };
    }
    return best?.url || null;
}

async function openverseBest(query) {
    const foodQuery = /food|chocolate|candy/i.test(query) ? query : `${query} food`;
    const params = new URLSearchParams({
        q: foodQuery,
        page_size: '8',
        license_type: 'commercial,modification',
        extension: 'jpg,jpeg,png,webp'
    });
    const res = await fetch(`https://api.openverse.engineering/v1/images/?${params}`, {
        headers: { 'User-Agent': UA },
        signal: AbortSignal.timeout(20000)
    });
    if (!res.ok) return null;
    const data = await res.json();
    for (const hit of data?.results || []) {
        const title = `${hit?.title || ''} ${hit?.id || ''}`;
        if (BAD_TITLE.test(title)) continue;
        if (/\blion\b/i.test(title) && !/chocolate|candy|bar/i.test(title)) continue;
        const url = hit?.url || hit?.thumbnail;
        if (url && /\.(jpg|jpeg|png|webp)/i.test(url)) return url;
    }
    return null;
}

function pollinationsUrl(foodSubject, slug) {
    const subject = String(foodSubject).slice(0, 100);
    const prompt =
        `edible food product photograph of ${subject}, real food only, not an animal, ` +
        `not a person, grocery catalog, pure white background, studio lighting, photorealistic, no text, no watermark`;
    const seed = crypto.createHash('md5').update(`food-v4-${slug}`).digest().readUInt32BE(0) % 2147483646;
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=600&nologo=true&seed=${seed}`;
}

async function saveFromUrl(sharp, url, outPath) {
    let lastErr;
    for (let attempt = 0; attempt < 5; attempt++) {
        try {
            const res = await fetch(url, {
                headers: { 'User-Agent': UA },
                signal: AbortSignal.timeout(90000)
            });
            if (res.status === 429) {
                await sleep(1000 * (attempt + 1) ** 2);
                continue;
            }
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const buf = Buffer.from(await res.arrayBuffer());
            if (buf.length < 4000) throw new Error('za mały plik');
            const tmp = path.join(os.tmpdir(), `proteiner-${crypto.randomBytes(8).toString('hex')}.jpg`);
            try {
                await sharp(buf)
                    .resize(800, 600, { fit: 'contain', background: { r: 255, g: 255, b: 255 } })
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
            await sleep(400 * (attempt + 1));
        }
    }
    throw lastErr;
}

async function findImage(p, queries) {
    const fq = foodQueries(p, queries);
    const subject = buildFoodSubject(p, queries);

    // 1) Food-safe Wikipedia titles first (explicit)
    for (const title of WIKI_TITLES[p.slug] || []) {
        try {
            const url = await wikiRestImage(title);
            if (url) return { url, source: 'wiki', query: title };
        } catch {
            /* next */
        }
        await sleep(30);
    }

    // 2) Commons + Openverse with food queries
    for (const q of fq.slice(0, 4)) {
        try {
            const url = await commonsBest(q);
            if (url) return { url, source: 'commons', query: q };
        } catch {
            /* next */
        }
        try {
            const url = await openverseBest(q);
            if (url) return { url, source: 'openverse', query: q };
        } catch {
            /* next */
        }
        await sleep(40);
    }

    // 3) Generated food photo (always food-context prompt)
    return { url: pollinationsUrl(subject, p.slug), source: 'pollinations', query: subject };
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
const delayMs = parseInt(process.argv.find((a) => a.startsWith('--delay='))?.split('=')[1] || '450', 10);

let todo = products;
if (slugArgs.length) {
    const set = new Set(slugArgs);
    todo = products.filter((p) => set.has(p.slug));
}
if (keepSlugs.size) todo = todo.filter((p) => !keepSlugs.has(p.slug));
todo = todo.slice(0, maxItems);

console.log(`Regeneracja (FOOD ONLY): ${todo.length} produktów`);

let ok = 0;
let fail = 0;
const failed = [];

for (let i = 0; i < todo.length; i++) {
    const p = todo[i];
    const outPath = path.join(outDir, `${p.slug}.jpg`);
    const queries = PRODUCT_SEARCH_QUERIES[p.slug] || [p.name.replace(/\([^)]*\)/g, '').trim(), `${p.name} food`];

    process.stdout.write(`[${i + 1}/${todo.length}] ${p.slug} `);

    try {
        const hit = await findImage(p, queries);
        await saveFromUrl(sharp, hit.url, outPath);
        console.log(`✓ ${hit.source} (${String(hit.query).slice(0, 40)})`);
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
