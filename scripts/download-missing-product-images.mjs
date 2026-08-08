/**
 * Pobiera brakujące zdjęcia produktów → images/products/{slug}.jpg
 * 1) Wikipedia / Commons / Openverse
 * 2) Zdjęcie kategorii (Wikimedia)
 * 3) Minimalistyczna karta (białe tło, emoji — jak zapasowe karty)
 *
 * node scripts/download-missing-product-images.mjs
 * node scripts/download-missing-product-images.mjs --limit=20
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'images', 'products');
const queriesPath = path.join(root, 'js', 'product-search-queries.js');

const UA = 'Proteiner/1.0 (nutrition education; contact: developeranios@gmail.com)';

const CATEGORY_FALLBACK = {
    mieso: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Good_Food_Display_-_NCI_Visuals_Online.jpg/800px-Good_Food_Display_-_NCI_Visuals_Online.jpg',
    nabial: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Egg.jpg/800px-Egg.jpg',
    warzywa: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/CSA_vegetables.jpg/800px-CSA_vegetables.jpg',
    owoce: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Various_fruits.jpg/800px-Various_fruits.jpg',
    zboza: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Various_grains.jpg/800px-Various_grains.jpg',
    'polskie-obiadki': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Pierogi_ruskie.jpg/800px-Pierogi_ruskie.jpg',
    zupy: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Chicken_Noodle_Soup.jpg/800px-Chicken_Noodle_Soup.jpg',
    orzechy: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Walnuts.jpg/800px-Walnuts.jpg',
    tluszcze: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Olive_oil_from_Oneglia.jpg/800px-Olive_oil_from_Olive_oil_from_Oneglia.jpg',
    makarony: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Spaghetti.jpg/800px-Spaghetti.jpg',
    fastfood: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Cheeseburger.jpg/800px-Cheeseburger.jpg',
    slodycze: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Chocolate_%28blue_background%29.jpg/800px-Chocolate_%28blue_background%29.jpg',
    sosy: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Ketchup.jpg/800px-Ketchup.jpg',
    napoje: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Coca_Cola_can.jpg/800px-Coca_Cola_can.jpg',
    alkohole: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Pilsner_Urquell_glass.jpg/800px-Pilsner_Urquell_glass.jpg',
    przyprawy: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Spices.jpg/800px-Spices.jpg'
};

// poprawka literówki w URL oliwy
CATEGORY_FALLBACK.tluszcze = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Olive_oil_from_Oneglia.jpg/800px-Olive_oil_from_Oneglia.jpg';

const EXTRA_QUERIES = {
    'tiramisu': ['tiramisu dessert', 'tiramisu cake', 'Tiramisu'],
    'placki-po-wegiersku': ['Hungarian goulash pancake', 'placki po wegiersku', 'potato pancake goulash'],
    'cheesecake': ['cheesecake slice', 'New York cheesecake'],
    'gnocchi': ['gnocchi pasta', 'potato gnocchi'],
    'pierogi-leniwe': ['leniwe pierogi', 'lazy pierogi curd'],
    'kinder-bueno': ['Kinder Bueno chocolate', 'hazelnut chocolate bar'],
    'kit-kat': ['Kit Kat chocolate bar'],
    'oreo': ['Oreo cookie'],
    'twix': ['Twix chocolate bar'],
    'mars': ['Mars chocolate bar'],
    'bounty': ['Bounty chocolate coconut'],
    'donut-z-lukrem': ['glazed donut', 'donut icing'],
    'falafel-smazony': ['falafel', 'fried falafel'],
    'guacamole': ['guacamole bowl', 'avocado guacamole'],
    'sushi-maki-z-lososiem': ['salmon maki sushi', 'sushi roll salmon'],
    'pad-thai-z-kurczakiem': ['pad thai chicken', 'pad thai'],
    'burrito-z-kurczakiem': ['chicken burrito', 'burrito'],
    'quesadilla-z-kurczakiem': ['chicken quesadilla'],
    'tacos-z-wolowina': ['beef tacos', 'tacos'],
    'shawarma-w-picie': ['shawarma wrap', 'chicken shawarma'],
    'curry-kurczak': ['chicken curry', 'curry dish'],
    'risotto-z-grzybami': ['mushroom risotto', 'risotto'],
    'lasagne-warzywna': ['vegetable lasagna', 'lasagne'],
    'zupa-tom-yum': ['tom yum soup', 'tom yum goong'],
    'tatar-wolowy': ['beef tartare', 'steak tartare'],
    'nalesniki-z-serem': ['cheese crepes', 'naleśniki'],
    'jajecznica-na-masle': ['scrambled eggs butter', 'jajecznica'],
    'omlet': ['omelette', 'plain omelet'],
    'mizeria': ['mizeria cucumber salad', 'Polish cucumber salad'],
    'bigos': ['bigos Polish stew', 'hunter stew'],
    'klopsiki-w-sosie-pomidorowym': ['meatballs tomato sauce', 'klopsiki'],
    'kotlet-de-volaille': ['chicken kiev cutlet', 'de volaille'],
    'sznycel-po-wiedensku': ['wiener schnitzel', 'breaded cutlet'],
    'zapiekanka': ['Polish zapiekanka baguette', 'zapiekanka food'],
    'krokiety-z-miesem': ['Polish croquettes meat', 'krokiet'],
    'kaszanka': ['blood sausage', 'kaszanka'],
    'pasztetowa': ['liver pate', 'pasztet'],
    'salceson': ['head cheese meat', 'salceson'],
    'cytryna': ['lemon fruit', 'fresh lemon'],
    'limonka': ['lime fruit', 'fresh lime'],
    'bazylia-swieza': ['fresh basil leaves', 'basil herb'],
    'szczypiorek': ['chives herb', 'fresh chives'],
    'roszponka': ['lamb lettuce', 'corn salad greens'],
    'kalarepa': ['kohlrabi vegetable', 'kohlrabi'],
    'bataty': ['sweet potato', 'batata'],
    'figi-suszone': ['dried figs', 'fig fruit dried'],
    'suszone-morele': ['dried apricots'],
    'wafle-ryzowe-naturalne': ['rice cakes plain', 'rice cracker'],
    'otreby-pszenne': ['wheat bran', 'bran cereal'],
    'platki-kukurydziane': ['cornflakes cereal', 'corn flakes'],
    'herbatniki-digestive': ['digestive biscuits', 'wholegrain biscuits'],
    'paluszki-slone': ['breadsticks salted', 'grissini'],
    'krakersy-solone': ['salted crackers', 'crackers'],
    'chipsy-nachos': ['nachos chips', 'tortilla chips'],
    'lody-magnum-classic': ['Magnum ice cream', 'chocolate ice cream bar'],
    'mcflurry-oreo': ['McFlurry Oreo', 'ice cream cup'],
    'galaretka-owocowa': ['fruit jelly dessert', 'galaretka'],
    'brownie-czekoladowe': ['chocolate brownie', 'brownie cake'],
    'biszkopty': ['ladyfinger biscuits', 'sponge fingers'],
    'wafel-tortowy': ['wafer cake', 'layered wafer'],
    'tortellini-z-miesem': ['tortellini meat', 'tortellini pasta'],
    'ravioli-z-ricotta': ['ricotta ravioli', 'ravioli'],
    'makaron-udon': ['udon noodles', 'udon soup'],
    'makaron-chinski-gotowy': ['chow mein noodles', 'Chinese noodles'],
    'ryz-do-sushi': ['sushi rice', 'Japanese rice'],
    'ziemniaki-gotowane': ['boiled potatoes', 'cooked potatoes'],
    'kasza-gryczana-z-jajkiem': ['buckwheat with egg', 'kasza gryczana'],
    'ryz-z-warzywami': ['rice with vegetables', 'fried rice vegetables'],
    'salatka-cezar-z-kurczakiem': ['chicken caesar salad', 'caesar salad'],
    'salatka-grecka': ['Greek salad', 'horiatiki salad'],
    'salatka-z-tunczykiem': ['tuna salad', 'tuna salad plate'],
    'filet-o-fish-styl': ['fish fillet sandwich', 'fried fish burger'],
    'cheeseburger-podwojny': ['double cheeseburger', 'cheeseburger'],
    'pizza-capricciosa': ['pizza capricciosa', 'Italian pizza'],
    'pizza-quattro-formaggi': ['quattro formaggi pizza', 'four cheese pizza'],
    'losos-wedzony': ['smoked salmon', 'lox salmon'],
    'pstrag-wedzony': ['smoked trout', 'trout fish'],
    'krewetki-smazone': ['fried shrimp', 'sauteed prawns'],
    'antrykot-wolowy': ['beef entrecote steak', 'ribeye steak'],
    'biftek-wolowy': ['beef steak', 'sirloin steak'],
    'mieso-mielone-wolowe': ['ground beef', 'minced beef'],
    'karkowka-pieczona': ['roasted pork neck', 'pork roast'],
    'cwiartka-kurczaka': ['roasted chicken quarter', 'chicken leg quarter'],
    'kotlet-z-piersi-indyka': ['turkey cutlet', 'turkey schnitzel'],
    'kotlety-mielone-drobiowe': ['chicken patties', 'ground chicken cutlet'],
    'rolada-wieprzowa': ['pork roulade', 'meat roulade'],
    'zrazy-zawijane': ['beef roulade zrazy', 'beef rolls'],
    'zupa-dyniowa': ['pumpkin soup', 'cream pumpkin soup'],
    'zupa-grzybowa': ['mushroom soup', 'cream mushroom soup'],
    'zupa-krem-szpinakowy': ['spinach cream soup', 'cream of spinach'],
    'zupa-pomidorowa-kremowa': ['tomato cream soup', 'tomato soup'],
    'zupa-z-soczewicy': ['lentil soup', 'lentil stew'],
    'zupa-gulaszowa': ['goulash soup', 'Hungarian goulash soup'],
    'zupa-kalafiorowa': ['cauliflower soup', 'cream cauliflower'],
    'surowka-z-bialej-kapusty': ['coleslaw cabbage', 'white cabbage salad'],
    'surowka-z-marchewki': ['carrot salad', 'grated carrot salad'],
    'pieczarki-marynowane': ['marinated mushrooms', 'pickled mushrooms'],
    'korniszony': ['pickles gherkins', 'cornichons'],
    'kapusta-wloska': ['savoy cabbage', 'cabbage vegetable'],
    'pomidorki-koktajlowe': ['cherry tomatoes', 'cocktail tomatoes'],
    'jogurt-kokosowy': ['coconut yogurt', 'plant yogurt'],
    'mleko-bez-laktozy-2': ['lactose free milk', 'milk carton'],
    'ser-cheddar': ['cheddar cheese', 'cheddar block'],
    'ser-emmental': ['Emmental cheese', 'Swiss cheese'],
    'ser-provolone': ['provolone cheese'],
    'ser-wedzony': ['smoked cheese', 'oscypek cheese'],
    'ser-cottage': ['cottage cheese bowl'],
    'chleb-gryczany': ['buckwheat bread', 'dark bread loaf'],
    'chleb-orkiszowy': ['spelt bread', 'bread loaf'],
    'bulka-kajzerka': ['kaiser roll', 'bread roll'],
    'bulka-wiejska': ['rustic bread roll', 'country roll'],
    'pistacje-prazone-solone': ['roasted pistachios', 'salted pistachios'],
    'orzechy-laskowe-prazone': ['roasted hazelnuts', 'hazelnuts'],
    'salsa-meksykanska': ['salsa mexicana', 'tomato salsa'],
    'sos-sriracha': ['sriracha sauce bottle', 'sriracha'],
    'sos-sweet-chilli': ['sweet chili sauce', 'chili sauce'],
    'sos-curry-pasta': ['curry paste', 'Thai curry paste'],
    'tofu-naturalne': ['tofu block', 'silken tofu'],
    '3-bit': ['3 Bit chocolate bar Polish'],
    'delicje': ['Delicje cookies', 'chocolate covered biscuit'],
    'lion': ['Lion chocolate bar'],
    'milky-way': ['Milky Way chocolate bar'],
    'prince-polo': ['Prince Polo wafer', 'chocolate wafer'],
    'krem-czekoladowy-milka': ['Milka chocolate spread', 'chocolate spread'],
    'poledwica-lososiowa': ['salmon loin', 'smoked salmon slice'],
    'szynka-gotowana': ['boiled ham', 'cooked ham slice'],
    'pasztet-rzymski': ['pate roman style', 'meat pate'],
    'ryba-w-panierce': ['breaded fish', 'fried fish fillet'],
    'salatka-jarzynowa': ['vegetable salad Polish', 'salad vegetables'],
    'salatka-waldorf': ['Waldorf salad', 'apple celery salad'],
    'salatka-z-makaronem': ['pasta salad', 'macaroni salad'],
    'placki-po-wegiersku': ['Hungarian potato pancakes goulash', 'placki z gulaszem'],
    'fasolka-szparagowa': ['green beans fresh pile', 'French beans vegetable', 'haricots verts'],
    migdaly: ['raw almonds nuts', 'almonds whole shelled', 'almond nuts']
};

const BAD_IMAGE = /logo|icon|banner|sprite|button|avatar|stamp|seal/i;
const BAD_TITLE = /logo|icon|diagram|map|flag|coat of arms|symbol|chart|graph|list of|disambiguation|category:/i;

function slugify(name) {
    return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/ą/g, 'a').replace(/ć/g, 'c').replace(/ę/g, 'e').replace(/ł/g, 'l')
        .replace(/ń/g, 'n').replace(/ó/g, 'o').replace(/ś/g, 's').replace(/ź/g, 'z').replace(/ż/g, 'z')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function enrichProducts(raw) {
    const seen = {};
    return raw.map((p) => {
        let base = slugify(p.name);
        let slug = base, n = 2;
        while (seen[slug]) { slug = `${base}-${p.category}`; if (seen[slug]) slug = `${base}-${n++}`; }
        seen[slug] = true;
        return { ...p, slug };
    });
}

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

function escXml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildMinimalSvg(p) {
    const emoji = escXml(p.emoji || '🍽️');
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="#ffffff"/>
  <ellipse cx="400" cy="430" rx="120" ry="18" fill="#000000" fill-opacity="0.06"/>
  <text x="400" y="340" text-anchor="middle" font-size="160">${emoji}</text>
</svg>`;
}

async function fetchWikipedia(query) {
    const params = new URLSearchParams({
        action: 'query', generator: 'search', gsrsearch: query, gsrlimit: '5',
        prop: 'pageimages', piprop: 'thumbnail', pithumbsize: '900', format: 'json', origin: '*'
    });
    const res = await fetch(`https://en.wikipedia.org/w/api.php?${params}`, { headers: { 'User-Agent': UA } });
    if (!res.ok) return null;
    const data = await res.json();
    for (const page of Object.values(data?.query?.pages || {})) {
        if (BAD_TITLE.test(page.title || '')) continue;
        const src = page.thumbnail?.source;
        if (src && !BAD_IMAGE.test(src)) return src;
    }
    return null;
}

async function fetchCommons(query) {
    const params = new URLSearchParams({
        action: 'query', generator: 'search', gsrsearch: `filetype:bitmap ${query}`,
        gsrnamespace: '6', gsrlimit: '8', prop: 'imageinfo', iiprop: 'url', iiurlwidth: '900',
        format: 'json', origin: '*'
    });
    const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, { headers: { 'User-Agent': UA } });
    if (!res.ok) return null;
    const data = await res.json();
    for (const page of Object.values(data?.query?.pages || {})) {
        if (BAD_TITLE.test(page?.title || '')) continue;
        const info = page?.imageinfo?.[0];
        const url = info?.thumburl || info?.url;
        if (url && /\.(jpg|jpeg|png|webp)/i.test(url) && !BAD_IMAGE.test(url)) return url;
    }
    return null;
}

async function fetchOpenverse(query) {
    const params = new URLSearchParams({
        q: query, page_size: '6', license_type: 'commercial,modification', extension: 'jpg,jpeg,png,webp'
    });
    const res = await fetch(`https://api.openverse.engineering/v1/images/?${params}`, { headers: { 'User-Agent': UA } });
    if (!res.ok) return null;
    const data = await res.json();
    for (const hit of data?.results || []) {
        const url = hit?.url || hit?.thumbnail;
        if (url && !BAD_IMAGE.test(url)) return url;
    }
    return null;
}

async function findImageUrl(p, queryList) {
    const sources = [fetchWikipedia, fetchCommons, fetchOpenverse];
    for (const q of queryList) {
        for (const fn of sources) {
            try {
                const url = await fn(q);
                if (url) return url;
            } catch { /* next */ }
            await sleep(50);
        }
    }
    return null;
}

async function saveJpgFromUrl(sharp, url, outPath) {
    const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(25000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await sharp(buf)
        .resize(800, 600, { fit: 'contain', background: { r: 255, g: 255, b: 255 } })
        .jpeg({ quality: 88, mozjpeg: true })
        .toFile(outPath);
}

async function saveMinimalSvg(sharp, p, outPath) {
    const svg = buildMinimalSvg(p);
    await sharp(Buffer.from(svg)).jpeg({ quality: 92 }).toFile(outPath);
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

const limitArg = process.argv.find((a) => a.startsWith('--limit='));
const maxItems = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity;

const missing = products.filter((p) => !fs.existsSync(path.join(outDir, `${p.slug}.jpg`)));
const todo = missing.slice(0, maxItems);

console.log(`Brakujących zdjęć: ${missing.length}, do pobrania teraz: ${todo.length}`);

let okFetch = 0, okSvg = 0, fail = 0;

for (let i = 0; i < todo.length; i++) {
    const p = todo[i];
    const outPath = path.join(outDir, `${p.slug}.jpg`);
    const queries = EXTRA_QUERIES[p.slug] || PRODUCT_SEARCH_QUERIES[p.slug] || [
        p.name,
        `${p.name} food`,
        `${p.name} dish`,
        p.name.replace(/\([^)]*\)/g, '').trim()
    ];

    process.stdout.write(`[${i + 1}/${todo.length}] ${p.slug} `);

    try {
        const url = await findImageUrl(p, queries);
        if (url) {
            await saveJpgFromUrl(sharp, url, outPath);
            console.log('✓ fetch');
            okFetch++;
            await sleep(150);
            continue;
        }

        await saveMinimalSvg(sharp, p, outPath);
        console.log('✓ minimal');
        okSvg++;
    } catch (e) {
        try {
            await saveMinimalSvg(sharp, p, outPath);
            console.log('✓ svg (po błędzie)');
            okSvg++;
        } catch {
            console.log(`✗ ${e.message}`);
            fail++;
        }
    }
}

const stillMissing = products.filter((p) => !fs.existsSync(path.join(outDir, `${p.slug}.jpg`))).length;
console.log(`\nPobrano z sieci: ${okFetch}, wygenerowano minimal: ${okSvg}, błędy: ${fail}`);
console.log(`Nadal brakuje: ${stillMissing}`);
