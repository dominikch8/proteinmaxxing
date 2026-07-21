/**
 * Nadpisuje zdjęcia produktów zdjęciami z Wikipedia / Commons / Openverse.
 * Bez emoji i bez generycznych „zdjęć kategorii” — przy braku dopasowania plik zostaje.
 *
 * node scripts/refresh-all-product-photos.mjs
 * node scripts/refresh-all-product-photos.mjs --limit=50
 * node scripts/refresh-all-product-photos.mjs --slug=migdaly --slug=fasolka-szparagowa
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'images', 'products');
const queriesPath = path.join(root, 'js', 'product-search-queries.js');

const UA = 'Proteiner/1.0 (nutrition education; contact: dominikchw1@gmail.com)';
const BAD_IMAGE = /logo|icon|banner|sprite|button|avatar|stamp|seal|qr|barcode/i;
const BAD_TITLE = /logo|icon|diagram|map|flag|coat of arms|symbol|chart|graph|list of|disambiguation|category:|svg|stamp|seal|signature|portrait|person|building|aircraft|vehicle/i;

/** Lepsze zapytania niż automatyczne tokeny */
const EXTRA_QUERIES = {
    'fasolka-szparagowa': [
        'green beans fresh pile',
        'French beans vegetable',
        'haricots verts',
        'Phaseolus vulgaris pods'
    ],
    migdaly: ['raw almonds nuts', 'almonds whole shelled', 'Mandel almonds food'],
    'migdaly-blanszowane': ['blanched almonds', 'peeled almonds'],
    'migdaly-platkowane': ['sliced almonds', 'almond flakes'],
    'orzechy-ziemne': ['peanuts nuts', 'peanuts in shell'],
    'orzechy-wloskie': ['walnuts nuts', 'walnut halves'],
    'orzechy-laskowe': ['hazelnuts', 'filberts nuts'],
    'orzechy-nerkowca': ['cashew nuts', 'cashews'],
    'orzechy-pistacjowe': ['pistachios nuts', 'pistachio'],
    'pestki-dyni': ['pumpkin seeds', 'pepitas'],
    'pestki-slonecznika': ['sunflower seeds', 'sunflower seed kernels'],
    szpinak: ['fresh spinach leaves', 'spinach vegetable'],
    'sos-sojowy': ['soy sauce bottle', 'shoyu sauce'],
    'sos-ketchup': ['ketchup bottle', 'tomato ketchup'],
    'sos-mayonez': ['mayonnaise jar', 'mayonnaise'],
    banan: ['banana fruit', 'ripe banana'],
    jablko: ['red apple fruit', 'apple fruit'],
    'piers-z-kurczaka': ['raw chicken breast', 'chicken breast fillet'],
    'bialka-jaj': ['egg white liquid', 'egg whites bowl']
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

function queryKeywords(q) {
    return q
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 2 && !['food', 'fresh', 'the', 'and', 'photo', 'ingredient'].includes(w));
}

function scoreCommonsPage(title, query) {
    const t = (title || '').toLowerCase();
    if (BAD_TITLE.test(t)) return -100;
    let score = 0;
    for (const w of queryKeywords(query)) {
        if (t.includes(w)) score += 12;
    }
    if (/\.(jpg|jpeg|png|webp)/i.test(t)) score += 1;
    if (/salad|soup|stew|pizza|burger|sandwich|plate|dish|meal/.test(t)) score += 3;
    if (/nut|fruit|vegetable|meat|cheese|bread|rice|pasta|bean|seed|oil|sauce/.test(t)) score += 2;
    if (/raw|fresh|cooked|roasted|dried|sliced/.test(t)) score += 1;
    return score;
}

async function fetchCommonsCandidates(query) {
    const params = new URLSearchParams({
        action: 'query',
        generator: 'search',
        gsrsearch: `filetype:bitmap ${query}`,
        gsrnamespace: '6',
        gsrlimit: '12',
        prop: 'imageinfo',
        iiprop: 'url',
        iiurlwidth: '1000',
        format: 'json',
        origin: '*'
    });
    const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
        headers: { 'User-Agent': UA }
    });
    if (!res.ok) return [];
    const data = await res.json();
    const pages = Object.values(data?.query?.pages || {});
    const ranked = pages
        .map((page) => {
            const info = page?.imageinfo?.[0];
            const url = info?.thumburl || info?.url;
            if (!url || !/\.(jpg|jpeg|png|webp)/i.test(url) || BAD_IMAGE.test(url)) return null;
            return { url, title: page?.title || '', score: scoreCommonsPage(page?.title, query) };
        })
        .filter(Boolean)
        .sort((a, b) => b.score - a.score);
    return ranked;
}

async function fetchWikipediaThumb(query) {
    const params = new URLSearchParams({
        action: 'query',
        generator: 'search',
        gsrsearch: query,
        gsrlimit: '6',
        prop: 'pageimages',
        piprop: 'thumbnail',
        pithumbsize: '1000',
        format: 'json',
        origin: '*'
    });
    const res = await fetch(`https://en.wikipedia.org/w/api.php?${params}`, {
        headers: { 'User-Agent': UA }
    });
    if (!res.ok) return null;
    const data = await res.json();
    for (const page of Object.values(data?.query?.pages || {})) {
        if (BAD_TITLE.test(page.title || '')) continue;
        const src = page.thumbnail?.source;
        if (src && !BAD_IMAGE.test(src)) return src;
    }
    return null;
}

async function fetchOpenverse(query) {
    const params = new URLSearchParams({
        q: query,
        page_size: '8',
        license_type: 'commercial,modification',
        extension: 'jpg,jpeg,png,webp'
    });
    const res = await fetch(`https://api.openverse.engineering/v1/images/?${params}`, {
        headers: { 'User-Agent': UA }
    });
    if (!res.ok) return null;
    const data = await res.json();
    for (const hit of data?.results || []) {
        const url = hit?.url || hit?.thumbnail;
        if (url && !BAD_IMAGE.test(url)) return url;
    }
    return null;
}

async function findBestUrl(p, queryList) {
    for (const q of queryList) {
        const commons = await fetchCommonsCandidates(q);
        const best = commons.find((c) => c.score >= 8);
        if (best) return { url: best.url, source: 'commons', query: q };

        const wiki = await fetchWikipediaThumb(q);
        if (wiki) return { url: wiki, source: 'wiki', query: q };

        const ov = await fetchOpenverse(q);
        if (ov) return { url: ov, source: 'openverse', query: q };

        await sleep(60);
    }
    return null;
}

async function saveJpgFromUrl(sharp, url, outPath) {
    let lastErr;
    for (let attempt = 0; attempt < 6; attempt++) {
        try {
            const res = await fetch(url, {
                headers: { 'User-Agent': UA },
                signal: AbortSignal.timeout(45000)
            });
            if (res.status === 429) {
                await sleep(800 * (attempt + 1) ** 2);
                continue;
            }
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const buf = Buffer.from(await res.arrayBuffer());
            await sharp(buf)
                .resize(800, 600, { fit: 'contain', background: { r: 255, g: 255, b: 255 } })
                .jpeg({ quality: 88, mozjpeg: true })
                .toFile(outPath);
            return;
        } catch (e) {
            lastErr = e;
            await sleep(400 * (attempt + 1));
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
}
const fromFileArg = process.argv.find((a) => a.startsWith('--from-file='));
if (fromFileArg) {
    const fp = path.resolve(root, fromFileArg.split('=')[1]);
    const lines = fs.readFileSync(fp, 'utf8').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    slugArgs.push(...lines);
}
const limitArg = process.argv.find((a) => a.startsWith('--limit='));
const maxItems = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity;

let todo = products;
if (slugArgs.length) todo = products.filter((p) => slugArgs.includes(p.slug));
todo = todo.slice(0, maxItems);

console.log(`Odświeżanie zdjęć: ${todo.length} produktów`);

let ok = 0;
let skip = 0;
let fail = 0;

for (let i = 0; i < todo.length; i++) {
    const p = todo[i];
    const outPath = path.join(outDir, `${p.slug}.jpg`);
    const queries = EXTRA_QUERIES[p.slug] ||
        PRODUCT_SEARCH_QUERIES[p.slug] || [p.name.replace(/\([^)]*\)/g, '').trim(), `${p.name} food`];

    process.stdout.write(`[${i + 1}/${todo.length}] ${p.slug} `);

    try {
        const hit = await findBestUrl(p, queries);
        if (!hit) {
            console.log('— brak (zostawiam)');
            skip++;
            await sleep(80);
            continue;
        }
        await saveJpgFromUrl(sharp, hit.url, outPath);
        console.log(`✓ ${hit.source}`);
        ok++;
    } catch (e) {
        console.log(`✗ ${e.message}`);
        fail++;
    }
    await sleep(280);
}

console.log(`\nZaktualizowano: ${ok}, bez zmian: ${skip}, błędy: ${fail}`);
