/**
 * Pobiera zdjęcia z Wikimedia Commons (cache w js/product-images-cache.json).
 * Uruchom: node scripts/fetch-wikimedia-images.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const cachePath = path.join(root, 'js', 'product-images-cache.json');

const CATEGORY_IMAGES = {
    mieso: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Good_Food_Display_-_NCI_Visuals_Online.jpg/640px-Good_Food_Display_-_NCI_Visuals_Online.jpg',
    nabial: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Egg.jpg/640px-Egg.jpg',
    warzywa: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/CSA_vegetables.jpg/640px-CSA_vegetables.jpg',
    owoce: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Various_fruits.jpg/640px-Various_fruits.jpg',
    zboza: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Various_grains.jpg/640px-Various_grains.jpg',
    'polskie-obiadki':
        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Pierogi_ruskie.jpg/640px-Pierogi_ruskie.jpg',
    zupy: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Chicken_Noodle_Soup.jpg/640px-Chicken_Noodle_Soup.jpg',
    orzechy: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Walnuts.jpg/640px-Walnuts.jpg',
    tluszcze: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Olive_oil_from_Oneglia.jpg/640px-Olive_oil_from_Oneglia.jpg',
    makarony: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Spaghetti.jpg/640px-Spaghetti.jpg',
    fastfood: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Cheeseburger.jpg/640px-Cheeseburger.jpg',
    slodycze: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Chocolate_%28blue_background%29.jpg/640px-Chocolate_%28blue_background%29.jpg',
    sosy: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Ketchup.jpg/640px-Ketchup.jpg'
};

const SEARCH_OVERRIDES = {
    'piers-z-kurczaka': 'chicken breast food',
    'jajko-kurze-cale': 'chicken egg',
    'losos-atlantycki': 'salmon fillet',
    'tunczyk-w-wodzie': 'canned tuna',
    'twarog-chudy': 'cottage cheese',
    'banan': 'banana fruit',
    'jablko': 'red apple fruit',
    'pomidor': 'tomato',
    'ogorek': 'cucumber',
    'ziemniaki': 'potato',
    'brokuly': 'broccoli',
    'ryz-bialy-gotowany': 'white rice cooked',
    'owsianka-na-mleku': 'oatmeal porridge',
    'pizza-margherita': 'pizza margherita',
    'kebab': 'kebab food',
    'frytki': 'french fries'
};

function slugify(name) {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/ą/g, 'a').replace(/ć/g, 'c').replace(/ę/g, 'e')
        .replace(/ł/g, 'l').replace(/ń/g, 'n').replace(/ó/g, 'o')
        .replace(/ś/g, 's').replace(/ź/g, 'z').replace(/ż/g, 'z')
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

function buildSearchQuery(p) {
    if (SEARCH_OVERRIDES[p.slug]) return SEARCH_OVERRIDES[p.slug];
    let q = p.name
        .replace(/\([^)]*\)/g, '')
        .replace(/[,]/g, ' ')
        .trim();
    q = q + ' food';
    return q;
}

async function fetchCommonsImage(search) {
    const queries = [search, search.replace(/\s+food$/, ''), `${search.split(' ')[0]} food`];
    for (const q of queries) {
        const img = await fetchCommonsImageOnce(q);
        if (img) return img;
        await sleep(80);
    }
    return null;
}

async function fetchCommonsImageOnce(search) {
    const params = new URLSearchParams({
        action: 'query',
        generator: 'search',
        gsrsearch: search,
        gsrnamespace: '6',
        gsrlimit: '5',
        prop: 'imageinfo',
        iiprop: 'url',
        iiurlwidth: '640',
        format: 'json',
        origin: '*'
    });
    const url = `https://commons.wikimedia.org/w/api.php?${params}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'ProteinMaxxing.pl/1.0 (educational nutrition site)' } });
    if (!res.ok) return null;
    const data = await res.json();
    const pages = data?.query?.pages;
    if (!pages) return null;
    for (const id of Object.keys(pages)) {
        const page = pages[id];
        const title = (page?.title || '').toLowerCase();
        if (/logo|icon|diagram|map|flag|svg|coat|symbol/.test(title)) continue;
        const info = page?.imageinfo?.[0];
        if (info?.thumburl) return info.thumburl;
        if (info?.url && /\.(jpg|jpeg|png|webp)$/i.test(info.url)) return info.url;
    }
    return null;
}

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

const rawFile = fs.readFileSync(path.join(root, 'js', 'products-data-raw.js'), 'utf8');
const raw = JSON.parse(rawFile.match(/productsDatabaseRaw = (\[[\s\S]*\]);/)[1]);
const products = enrichProducts(raw);

const force = process.argv.includes('--force');
let cache = {};
if (fs.existsSync(cachePath) && !force) {
    cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
}

let fetched = 0;
let skipped = 0;

for (let i = 0; i < products.length; i++) {
    const p = products[i];
    if (cache[p.slug] && !force) {
        skipped++;
        continue;
    }
    const query = buildSearchQuery(p);
    process.stdout.write(`[${i + 1}/${products.length}] ${p.slug} … `);
    try {
        const img = await fetchCommonsImage(query);
        cache[p.slug] = img || CATEGORY_IMAGES[p.category] || null;
        console.log(img ? 'OK' : 'kategoria');
        if (img) fetched++;
    } catch (e) {
        cache[p.slug] = CATEGORY_IMAGES[p.category];
        console.log('fallback');
    }
    await sleep(180);
}

for (const p of products) {
    if (!cache[p.slug]) cache[p.slug] = CATEGORY_IMAGES[p.category];
}

fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), 'utf8');
console.log(`\nZapisano ${Object.keys(cache).length} wpisów do product-images-cache.json (${fetched} nowych z Commons).`);
