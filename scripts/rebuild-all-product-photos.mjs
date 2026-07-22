/**
 * Pełna regeneracja zdjęć produktów — rozpoznawalne fotki, białe tło.
 * 1) Wikipedia REST (thumbnail artykułu)
 * 2) Wikimedia Commons (tytuł musi pasować do zapytania)
 * 3) Pollinations (tylko gdy brak sieciowego dopasowania)
 *
 * node scripts/rebuild-all-product-photos.mjs
 * node scripts/rebuild-all-product-photos.mjs --limit=30
 * node scripts/rebuild-all-product-photos.mjs --slug=banan --slug=jablko
 * node scripts/rebuild-all-product-photos.mjs --from-file=scripts/rebuild-failed.txt
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
    /logo|icon|diagram|map|flag|coat of arms|symbol|chart|graph|list of|disambiguation|category:|svg|stamp|seal|signature|person|portrait|building|aircraft|vehicle|watermark|screenshot|qr/i;

/** Wikipedia article titles (English) for products where auto-query is weak */
const WIKI_TITLES = {
    'piers-z-kurczaka': ['Chicken as food', 'Chicken meat'],
    'piers-z-indyka': ['Turkey as food', 'Turkey meat'],
    'wolowina-poledwica': ['Beef tenderloin', 'Filet mignon'],
    'wieprzowina-schab-bez-kosci': ['Pork loin', 'Pork'],
    'szynka-wieprzowa-wedlina': ['Ham'],
    salami: ['Salami'],
    'parowki-wieprzowe': ['Hot dog', 'Frankfurter Würstchen'],
    'kielbasa-slaska': ['Kielbasa'],
    kabanosy: ['Kabanos'],
    'dorsz-swiezy': ['Cod'],
    'losos-atlantycki': ['Atlantic salmon', 'Salmon'],
    'tunczyk-w-wodzie': ['Canned tuna', 'Tuna'],
    pstrag: ['Trout'],
    'karp-smazony': ['Carp'],
    'sledz-marynowany': ['Herring', 'Pickled herring'],
    'makrela-wedzona': ['Mackerel'],
    sandacz: ['Zander'],
    mintaj: ['Alaska pollock'],
    'krewetki-gotowane': ['Shrimp'],
    banan: ['Banana'],
    jablko: ['Apple'],
    'fasolka-szparagowa': ['Green bean'],
    migdaly: ['Almond'],
    cytryna: ['Lemon'],
    pomidor: ['Tomato'],
    ogorek: ['Cucumber'],
    ziemniaki: ['Potato'],
    brokuly: ['Broccoli'],
    kalafior: ['Cauliflower'],
    marchew: ['Carrot'],
    cebula: ['Onion'],
    czosnek: ['Garlic'],
    'szpinak-swiezy': ['Spinach'],
    rukola: ['Arugula'],
    'sos-sojowy': ['Soy sauce'],
    ketchup: ['Ketchup'],
    majonez: ['Mayonnaise'],
    musztarda: ['Mustard (condiment)'],
    'jogurt-naturalny': ['Yogurt'],
    'twarog-chudy': ['Cottage cheese', 'Quark (dairy product)'],
    'jajko-kurze-cale': ['Egg as food', 'Chicken egg'],
    'mleko-2': ['Milk'],
    'ser-gouda': ['Gouda cheese'],
    'ser-mozzarella': ['Mozzarella'],
    'orzechy-wloskie': ['Walnut'],
    'orzechy-laskowe': ['Hazelnut'],
    'orzechy-ziemne': ['Peanut'],
    'orzechy-nerkowca': ['Cashew'],
    'awokado': ['Avocado'],
    'truskawki': ['Strawberry'],
    'borowki': ['Blueberry'],
    guacamole: ['Guacamole'],
    'oliwa-z-oliwek': ['Olive oil'],
    'olej-rzepakowy': ['Rapeseed oil', 'Canola'],
    maslo: ['Butter'],
    'ryz-bialy-gotowany': ['White rice', 'Cooked rice'],
    'kasza-gryczana': ['Buckwheat'],
    'chleb-zytni-pelnoziarnisty': ['Rye bread'],
    'hamburger': ['Hamburger'],
    'frytki': ['French fries'],
    'pizza-margherita': ['Pizza Margherita'],
    'pierogi-ruskie': ['Pierogi'],
    bigos: ['Bigos'],
    'rosol': ['Rosół', 'Chicken soup']
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

function titleCaseQuery(q) {
    return q
        .replace(/\s+food$/i, '')
        .replace(/\s+ingredient photo$/i, '')
        .trim()
        .split(/\s+/)
        .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
        .join(' ');
}

function keywords(q) {
    return q
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 2 && !['food', 'fresh', 'the', 'and', 'photo', 'ingredient', 'dish', 'cooked'].includes(w));
}

async function wikiRestImage(title) {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const res = await fetch(url, {
        headers: { 'User-Agent': UA, Accept: 'application/json' },
        signal: AbortSignal.timeout(20000)
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.type === 'disambiguation') return null;
    const src = data?.originalimage?.source || data?.thumbnail?.source;
    if (!src || BAD_TITLE.test(src)) return null;
    return src;
}

async function commonsBest(query) {
    const params = new URLSearchParams({
        action: 'query',
        generator: 'search',
        gsrsearch: `filetype:bitmap ${query}`,
        gsrnamespace: '6',
        gsrlimit: '10',
        prop: 'imageinfo',
        iiprop: 'url',
        iiurlwidth: '1000',
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
    const kws = keywords(query);
    let best = null;
    for (const page of pages) {
        const title = page?.title || '';
        if (BAD_TITLE.test(title)) continue;
        const info = page?.imageinfo?.[0];
        const url = info?.thumburl || info?.url;
        if (!url || !/\.(jpg|jpeg|png|webp)/i.test(url)) continue;
        let score = 0;
        const t = title.toLowerCase();
        for (const w of kws) if (t.includes(w)) score += 15;
        if (score < 15) continue;
        if (!best || score > best.score) best = { url, score };
    }
    return best?.url || null;
}

function pollinationsUrl(englishSubject, slug) {
    const subject = String(englishSubject).slice(0, 80);
    const prompt = `photo of ${subject} on white background, realistic food, studio lighting, no text`;
    const seed = crypto.createHash('md5').update(`v3-${slug}`).digest().readUInt32BE(0) % 2147483646;
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
    const titles = [...(WIKI_TITLES[p.slug] || [])];
    for (const q of queries.slice(0, 3)) {
        const tc = titleCaseQuery(q);
        if (tc && !titles.includes(tc)) titles.push(tc);
    }

    for (const title of titles) {
        try {
            const url = await wikiRestImage(title);
            if (url) return { url, source: 'wiki', query: title };
        } catch {
            /* next */
        }
        await sleep(40);
    }

    for (const q of queries.slice(0, 3)) {
        try {
            const url = await commonsBest(q);
            if (url) return { url, source: 'commons', query: q };
        } catch {
            /* next */
        }
        await sleep(40);
    }

    const subject = queries[0] || p.name;
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
const limitArg = process.argv.find((a) => a.startsWith('--limit='));
const maxItems = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity;
const delayMs = parseInt(process.argv.find((a) => a.startsWith('--delay='))?.split('=')[1] || '500', 10);

let todo = products;
if (slugArgs.length) {
    const set = new Set(slugArgs);
    todo = products.filter((p) => set.has(p.slug));
}
todo = todo.slice(0, maxItems);

console.log(`Regeneracja: ${todo.length} produktów`);

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
        console.log(`✓ ${hit.source}`);
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
