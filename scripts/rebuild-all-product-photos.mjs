/**
 * Research → realistyczne minimalistyczne zdjęcia produktów (FOOD ONLY).
 *
 * 1) Szuka 2–3 referencji w internecie (Commons/Openverse) — potwierdza, że to jedzenie
 * 2) Preferuje pobranie prawdziwego zdjęcia na jasnym/białym tle + wycięcie tła
 * 3) Fallback: generacja Pollinations (Flux) — minimalizm, izolowany produkt
 * 4) Zapisuje PNG (przezroczyste tło) + JPG na białym
 *
 * node scripts/rebuild-all-product-photos.mjs
 * node scripts/rebuild-all-product-photos.mjs --slug=lion --slug=banan
 * node scripts/rebuild-all-product-photos.mjs --limit=20 --delay=2000
 * node scripts/rebuild-all-product-photos.mjs --force-ai   # tylko generacja AI
 * node scripts/rebuild-all-product-photos.mjs --prefer-photo  # domyślnie: real photo first
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import os from 'os';
import { fileURLToPath, pathToFileURL } from 'url';
import { removeEdgeBackground, defringeLightHalos } from './remove-edge-background.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'images', 'products');
const queriesPath = path.join(root, 'js', 'product-search-queries.js');
const researchLogPath = path.join(root, 'scripts', 'product-photo-research-log.json');
const UA = 'Proteiner/1.0 (nutrition education; contact: developeranios@gmail.com)';

const BAD =
    /logo|icon|diagram|map|flag|coat|symbol|chart|graph|list of|disambiguation|category:|svg|stamp|seal|portrait|building|aircraft|vehicle|panthera|wildlife|zoo|safari|lioness|galaxy|constellation|astronomy|planet|moon|person|people|selfie|hatching|spiral egg cup|soup|smoothie|salad bowl|pizza with|platter|buffet/i;

/** Precyzyjne opisy — unikają mylenia z zwierzętami/planetami/innymi produktami */
const FOOD_SUBJECT = {
    lion: 'Lion Nestle Polish chocolate candy wafer bar with caramel cereal filling, wrapped snack bar shape',
    'milky-way': 'Milky Way chocolate nougat candy bar',
    mars: 'Mars chocolate candy bar with caramel nougat',
    twix: 'Twix chocolate caramel cookie bars',
    snickers: 'Snickers chocolate peanut candy bar',
    bounty: 'Bounty coconut chocolate candy bar',
    oreo: 'stack of Oreo chocolate sandwich cookies',
    'kit-kat': 'Kit Kat chocolate wafer bar broken sticks',
    raffaello: 'Raffaello white coconut almond candy balls',
    '3-bit': '3 Bit Polish chocolate wafer bar',
    delicje: 'Delicje Polish jam chocolate cookies',
    'kinder-bueno': 'Kinder Bueno chocolate hazelnut wafer bar',
    'prince-polo': 'Prince Polo chocolate wafer bar',
    'ptasie-mleczko': 'Ptasie mleczko Polish chocolate-covered marshmallow candy pieces',
    'baton-np-snickers': 'classic Snickers style chocolate peanut caramel nougat candy bar unwrapped',
    'baton-proteinowy': 'plain chocolate protein bar without readable brand text',
    '3-bit': '3 Bit Polish chocolate wafer candy bar unwrapped',
    nuts: 'Nuts Nestle hazelnut caramel chocolate candy bar unwrapped',
    pawelek: 'Pawelek Polish toffee chocolate candy bar unwrapped',
    grzeski: 'Grzeski Polish chocolate wafer candy bar unwrapped',
    knoppers: 'Knoppers hazelnut cream wafer candy bar unwrapped',
    duplo: 'Duplo Ferrero chocolate wafer candy bar unwrapped',
    'kinder-maxi-king': 'Kinder Maxi King cream chocolate hazelnut candy bar unwrapped',
    'kinder-country': 'Kinder Country milk cereal chocolate candy bar unwrapped',
    picnic: 'Picnic peanut raisin caramel chocolate candy bar unwrapped',
    'corny-big': 'Corny Big cereal honey granola candy bar unwrapped',
    toblerone: 'Toblerone triangular honey almond nougat chocolate bar pieces',
    princessa: 'Princessa Polish chocolate wafer candy bar unwrapped',
    'kitkat-chunky': 'KitKat Chunky thick chocolate wafer candy bar unwrapped',
    'snickers-white': 'white chocolate peanut caramel nougat candy bar like Snickers White unwrapped',
    'bounty-dark': 'Bounty Dark coconut chocolate candy bar in dark chocolate unwrapped',
    danusia: 'Danusia Polish chocolate filled candy bar unwrapped',
    'nestle-crunch': 'Nestle Crunch crispy rice milk chocolate candy bar unwrapped',
    'twix-white': 'Twix White biscuit caramel white chocolate candy bars unwrapped',
    'mars-protein': 'Mars Protein chocolate caramel protein candy bar unwrapped',
    'snickers-protein': 'Snickers Protein peanut caramel chocolate protein bar unwrapped',
    'lion-white': 'Lion White white chocolate caramel cereal candy bar unwrapped',
    'kinder-bueno': 'Kinder Bueno chocolate hazelnut wafer bar unwrapped',
    'prince-polo': 'Prince Polo chocolate wafer bar unwrapped',
    mars: 'Mars chocolate candy bar with caramel nougat unwrapped',
    twix: 'Twix chocolate caramel cookie bars unwrapped',
    bounty: 'Bounty coconut chocolate candy bar unwrapped',
    'kit-kat': 'Kit Kat chocolate wafer bar sticks unwrapped',
    lion: 'Lion Nestle chocolate caramel cereal candy bar unwrapped',
    'milky-way': 'Milky Way chocolate nougat candy bar unwrapped',
    snickers: 'Snickers chocolate peanut candy bar unwrapped',
    'krem-czekoladowy-milka': 'chocolate hazelnut spread in open glass jar',
    'czekolada-mleczna': 'milk chocolate bar broken squares',
    'czekolada-gorzka-80': 'dark 80 percent chocolate bar squares',
    'czekolada-100': '100 percent dark chocolate bar',
    hamburger: 'classic beef hamburger with bun lettuce tomato',
    'big-mac-styl': 'double cheeseburger with sesame bun',
    'whopper-styl': 'flame grilled beef burger',
    'hot-dog': 'hot dog sausage in bun with mustard',
    frytki: 'portion of golden french fries',
    'piers-z-kurczaka': 'two raw pale pink skinless boneless chicken breast fillets, poultry meat only, NOT fish, NOT salmon',
    'piers-z-indyka': 'raw turkey breast fillet pale meat',
    banan: 'ONE single ripe yellow banana with ONE stem, Cavendish banana fruit',
    jablko: 'one whole red apple fruit',
    'fasolka-szparagowa': 'fresh green beans pile',
    migdaly: 'raw whole almonds pile',
    'sos-sojowy': 'soy sauce in clear glass bottle blank label',
    cytryna: 'one whole yellow lemon',
    pomidor: 'one ripe red tomato',
    ogorek: 'one green cucumber',
    ketchup: 'tomato ketchup in glass bottle blank label',
    majonez: 'mayonnaise in glass jar blank label',
    guacamole: 'guacamole dip in small white bowl',
    'losos-atlantycki': 'one raw Atlantic salmon fillet orange-pink with white fat lines',
    'twarog-chudy': 'plain white cottage cheese in bowl',
    'ryz-bialy': 'uncooked white rice grains',
    'ryz-bialy-gotowany': 'cooked white rice in white bowl',
    bigos: 'Polish bigos hunter stew in bowl',
    'pierogi-ruskie': 'Polish pierogi ruskie dumplings on plate',
    rosol: 'clear Polish chicken broth soup with noodles in white bowl',
    'pomidorowa-z-ryzem': 'Polish tomato soup pomidorowa with rice in white bowl, bright red-orange tomato broth, visible white rice grains floating in soup, zupa pomidorowa z ryżem, tomato soup NOT plain rice bowl, NOT dry rice only, NOT risotto plate',
    'zupa-szczawiowa': 'Polish sorrel soup zupa szczawiowa in white bowl, bright green broth, chopped sorrel leaves, halved hard boiled egg visible, creamy green soup, NOT tripe, NOT flaki, NOT beef intestine, NO organ meat',
    'zupa-grzybowa': 'Polish mushroom soup zupa grzybowa in white bowl, creamy beige broth, sliced forest mushrooms and parsley, mushroom cream soup, NOT tripe, NOT flaki, NOT beef intestine',
    'zupa-ogorkowa': 'Polish pickle soup zupa ogórkowa in white bowl, pale yellow broth, diced pickled cucumber and dill, sour pickle soup, NOT tripe, NOT flaki, NOT beef intestine',
    'zupa-fasolowa': 'Polish bean soup zupa fasolowa in white bowl, white navy beans in clear broth, carrot pieces, bean soup, NOT tripe, NOT flaki, NOT beef intestine',
    'zupa-jarzynowa': 'Polish vegetable soup zupa jarzynowa in white bowl, clear golden broth, diced carrots potato celery peas, colorful vegetable soup, NOT tripe, NOT flaki, NOT beef intestine',
    'zupa-tom-yum': 'Thai tom yum soup in white bowl, orange-red spicy broth, shrimp lemongrass lime leaves chili, tom yum goong, NOT tripe, NOT flaki, NOT beef intestine',
    'zupa-dyniowa': 'Polish pumpkin soup zupa dyniowa in white bowl, smooth bright orange creamy pumpkin puree soup, NOT tripe, NOT flaki, NOT beef intestine',
    'pho-zupa-ryzowa': 'Vietnamese pho noodle soup in white bowl, clear aromatic beef broth, flat rice noodles, fresh basil lime bean sprouts, pho bo style, NOT tripe, NOT flaki, NOT beef intestine strips',
    'zupa-gulaszowa': 'Hungarian goulash soup zupa gulaszowa in white bowl, deep red paprika broth, beef cubes potato carrot, goulash soup, NOT tripe, NOT flaki, NOT beef intestine',
    'zupa-z-soczewicy': 'Polish lentil soup zupa z soczewicy in white bowl, golden orange broth, red lentils and carrot pieces, lentil soup, NOT tripe, NOT flaki, NOT beef intestine',
    'zupa-cebulowa': 'French onion soup in white ceramic bowl, golden brown broth, visible caramelized onion rings, melted cheese crust on top, bread crouton, Polish zupa cebulowa, NOT tripe, NOT flaki, NOT beef intestine, NO organ meat',
    'ser-mozzarella': 'two or three fresh white mozzarella cheese balls ciliegine, smooth wet surface, mozzarella only, NO packaging',
    'mleko-2': 'glass of white cow milk',
    'jajko-kurze-cale': 'ONE whole intact brown chicken egg with unbroken shell, whole egg only, NOT cracked, NOT open, NOT yolk',
    'skyr-naturalny': 'plain natural skyr Icelandic yogurt pure white thick cream in small white bowl, NO chocolate, NO toppings, NO sauce swirl',
    'orzechy-wloskie': 'shelled walnuts pile',
    'orzechy-laskowe': 'hazelnuts pile',
    'orzechy-ziemne': 'roasted peanuts pile',
    'orzechy-pekan': 'pecan nuts pile',
    'orzechy-pistacjowe': 'shelled green pistachio nuts pile, bright green pistachio kernels only',
    'pistacje-prazone-solone': 'roasted salted pistachios in shells, pile of open cracked pistachio nuts with green kernels and beige shells, pistachio nuts only, NOT peanuts, NOT walnuts, NOT almonds, NOT hazelnuts',
    truskawki: 'fresh red strawberries',
    maliny: 'fresh red raspberries',
    rukola: 'fresh arugula leaves',
    kalafior: 'one white cauliflower head',
    brokuly: 'one green broccoli head',
    ziemniaki: 'raw potatoes',
    marchew: 'fresh orange carrots',
    salami: 'salami sausage slices',
    ricotta: 'creamy white ricotta cheese in a small white bowl, soft curds, ricotta only',
    'oliwa-z-oliwek': 'extra virgin olive oil in green glass bottle with blank label, NOT bowl',
    'olej-rzepakowy': 'canola rapeseed cooking oil in clear glass bottle with blank label, NOT bowl',
    'olej-slonecznikowy': 'sunflower cooking oil in clear glass bottle with blank label, NOT bowl',
    'olej-kokosowy': 'refined coconut oil in glass jar or bottle with blank label, NOT bowl',
    'olej-lniany': 'flaxseed linseed oil in dark glass bottle with blank label, NOT bowl',
    'olej-sezamowy': 'sesame oil in clear glass bottle with blank label, NOT bowl',
    smalec: 'authentic Polish smalec ze skwarkami, rough crumbly rendered pork fat spread in small bowl with many small crispy golden-brown pork cracklings embedded, pale ivory-beige greasy texture, NOT mashed potatoes NOT butter NOT smooth cream',
    maslo: 'butter stick or block',
    'maslo-ekstra-82': 'butter stick wrapped or block',
    'szpinak-swiezy': 'fresh spinach leaves',
    winogrona: 'bunch of grapes',
    cielecina: 'raw veal meat',
    'indyk-mielony': 'raw ground turkey meat',
    'kurczak-mielony': 'raw ground chicken meat',
    'mieso-mielone-wolowe': 'raw ground beef',
    awokado: 'Hass avocado half with pit and one whole avocado',
    'jogurt-grecki-naturalny': 'plain Greek yogurt white in bowl no toppings',
    'jogurt-naturalny': 'plain natural yogurt white in bowl no toppings',
    'serek-wiejski': 'Polish cottage cheese serek wiejski in bowl',
    'protein-pudding': 'smooth vanilla protein pudding only in small cup, creamy pudding surface, NO chocolate drizzle, NO toppings, NO spoon clutter',
    'ser-gouda': 'young Dutch Gouda cheese wedge, pale yellow interior, thin yellow wax rind, smooth mild cheese, absolutely NOT smoked, NO dark brown rind, NO orange smoked coating',
    omlet: 'simple plain folded omelette on white plate, yellow egg omelette only, NO toppings, NO cheese pile, NO vegetables',
    'jogurt-owocowy': 'fruit yogurt in small white bowl, soft pink-peach fruit yogurt color, smooth dairy, NO whole fruit chunks dominating, NO chocolate',
    'mleko-bez-laktozy-2': 'clear glass of white lactose-free cow milk, plain white milk only, NO chocolate, NO cereal, NO cookies around',
    'jajecznica-na-masle': 'classic soft scrambled eggs cooked in butter on a white plate, fluffy yellow scrambled eggs only',
    'smietana-12': 'liquid pourable sour cream 12 percent in clear drinking glass, white cream filling glass like a drink, flat liquid surface, NOT whipped peaks, NOT stiff cream',
    'mleko-0': 'clear glass of skim white cow milk 0 percent fat, pure white milk only, NO chocolate rim, NO cocoa powder, NO cookies',
    'ser-plesniowy-blue': 'wedge of blue cheese Roquefort style with blue-green mold veins, cheese only, NO fruit, NO honey, NO crackers',
    'ser-cheddar': 'bright orange cheddar cheese block wedge, solid orange cheddar color throughout, cheddar cheese only, absolutely NO blue mold, NO green veins, NOT Roquefort, NOT blue cheese',
    'ser-cottage': 'cottage cheese with soft white curds in a small white bowl, cottage cheese only',
    'smietana-18': 'liquid pourable cream 18 percent filling a clear glass, white liquid cream with flat surface like milk, NOT whipped cream, NO stiff peaks',
    'smietanka-30': 'liquid heavy cream 30 percent filling a clear glass cup, pourable white cream liquid surface, NOT whipped cream peaks, NOT stiff meringue texture',
    'mleko-roslinne-owsiane': 'glass of oat plant milk, beige-white oat milk, plain drink only, NO oats flakes pile dominating, NO cereal bowl',
    'ser-zolty-plastry': 'stack of yellow cheese slices, thin square sandwich cheese slices, sliced cheese only',
    'izolat-bialka-wpi': 'loose mound of white whey protein isolate powder directly on white surface, powder only, NO bowl, NO dish, NO cup, NO container',
    'twarog-sernikowy': 'smooth cream cheese style twaróg sernikowy for cheesecake, dense white creamy cheese block or bowl resembling cheesecake filling',
    'ser-twarogowy-tlusty': 'full-fat Polish twaróg quark cheese white block or crumbled in bowl, fresh white cheese',
    'jogurt-kokosowy': 'coconut yogurt in a small white ceramic bowl, white creamy yogurt, NOT inside a coconut shell, NO whole coconut fruit',
    'serek-homogenizowany-danio': 'small plastic yogurt cup filled with thick creamy homogenized yogurt cheese like Polish Danio, cup packaging dairy dessert, smooth cream top',
    'ser-mascarpone': 'mascarpone cheese in a small white bowl, smooth thick Italian cream cheese',
    'mleko-skondensowane-slodzone': 'metal squeeze tube of sweetened condensed milk with thick white milk coming from the nozzle, aluminum tube dairy product, condensed milk tube, NOT a bowl',
    'ser-emmental': 'Swiss Emmental cheese wedge with characteristic large round holes, pale yellow cheese',
    'twarog-wiejski': 'Polish twaróg wiejski country cottage cheese with soft white curds in bowl',
    'ser-wedzony': 'smoked cheese round or block with dark brown smoked outer rind and pale interior, clearly smoked cheese look',
    'ser-topiony-plastry': 'stack of processed melting cheese slices, individually separated style yellow cheese slices for toast',
    'papryka-zielona': 'ONE whole ripe GREEN bell pepper, bright fresh green skin, green stem, green capsicum only, NOT red, NOT yellow',
    'papryka-zolta': 'ONE whole ripe YELLOW bell pepper, bright golden yellow skin, green stem, yellow capsicum only, NOT red',
    'papryka-czerwona': 'ONE whole ripe RED bell pepper, deep glossy red skin, green stem',
    pieczarka: 'ONE fresh white button mushroom Agaricus, pale grayish-white cap, short white stem, classic white pieczarka, NOT brown cremini',
    'tofu-naturalne': 'plain firm white tofu block with a few tofu cubes, tofu only, NO herbs, NO parsley, NO greens',
    'kukurydza-konserwowa': 'open metal can of canned sweet corn with yellow corn kernels in brine, canned corn product',
    'ziemniaki-tluczone': 'creamy mashed potatoes puree in a small white bowl, ziemniaki tłuczone, smooth mashed potato only, NOT whole raw potato',
    'maka-pszenna-typ-500': 'soft mound of fine white wheat flour powder only, raw flour pile, NOT bread, NOT loaf, NOT dough',
    'komosa-ryzowa-quinoa': 'pile of dry uncooked white quinoa seeds, loose tiny round beige grains, NOT bread, NOT cooked mush',
    'kasza-quinoa-gotowana': 'small mound of cooked fluffy quinoa grains with tiny seed rings, cooked kasza only, NOT bread',
    amarantus: 'pile of dry uncooked tiny cream-gold amaranth seeds, loose grain kasza, NOT snack bar, NOT puffed bar, NOT bread'
};

const CATEGORY_SUFFIX = {
    mieso: 'raw meat or fish food product',
    nabial: 'dairy food product',
    warzywa: 'fresh vegetable',
    owoce: 'fresh fruit',
    zboza: 'grain cereal or bakery food',
    'platki-sniadaniowe': 'breakfast cereal flakes granola bowl food',
    orzechy: 'nuts or seeds food',
    sosy: 'sauce or condiment food',
    tluszcze: 'cooking oil or fat food',
    makarony: 'pasta food dish',
    zupy: 'soup in bowl food',
    fastfood: 'fast food item',
    slodycze: 'candy chocolate dessert food',
    batony: 'chocolate candy bar snack food',
    'batony-proteinowe': 'protein candy bar high protein snack food',
    'polskie-obiadki': 'Polish traditional food dish'
};

const NEGATIVE =
    'no people, no hands, no animals, no wildlife, no lion animal, no planet Mars, no text, no watermark, no logo, no barcode, no brand name readable, no plate clutter, no busy props, no gray background, no black background, no gradient background, no AI artifacts, no deformed anatomy';

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
        let base = p.slug && String(p.slug).trim() ? String(p.slug).trim() : slugify(p.name);
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

function foodSubject(p, queries) {
    if (FOOD_SUBJECT[p.slug]) return FOOD_SUBJECT[p.slug];
    let base = (queries[0] || p.name.replace(/\([^)]*\)/g, '').trim())
        .replace(/\s+food$/i, '')
        .replace(/\s+ingredient photo$/i, '')
        .trim();
    if (/^(lion|mars|bounty|turkey)$/i.test(base)) {
        if (/lion/i.test(base)) return 'Lion chocolate candy bar Nestle';
        if (/mars/i.test(base)) return 'Mars chocolate candy bar';
        if (/bounty/i.test(base)) return 'Bounty chocolate candy bar';
        if (/turkey/i.test(base)) return 'turkey breast meat food';
    }
    const suffix = CATEGORY_SUFFIX[p.category] || 'food product';
    if (/\b(food|fruit|meat|cheese|candy|chocolate|soup|sauce|oil|nut|pasta|rice|egg|milk)\b/i.test(base)) {
        return base;
    }
    return `${base} ${suffix}`;
}

function researchQueries(subject, p) {
    const short = subject.split(',')[0].trim();
    return [
        `${short} white background`,
        `${short} isolated food`,
        `${short} food photography`,
        `${p.name.replace(/\([^)]*\)/g, '').trim()} jedzenie`,
        `${short} product photo`
    ];
}

function scoreRef(title, query, subject) {
    const t = `${title} ${query}`.toLowerCase();
    let score = 0;
    if (/food|fruit|vegetable|meat|cheese|chocolate|candy|egg|milk|nut|fish|bread|pasta|rice|cookie|burger|oil|butter|yogurt|skyr|chicken|pork|beef|salmon|banana|avocado/i.test(t))
        score += 3;
    if (/white background|isolated|studio|cutout|transparent/i.test(t)) score += 4;
    if (BAD.test(title)) score -= 20;
    // subject tokens
    for (const tok of subject.toLowerCase().split(/\s+/).filter((w) => w.length > 3).slice(0, 4)) {
        if (t.includes(tok)) score += 1;
    }
    // known false friends
    if (/\blion\b/i.test(t) && !/chocolate|candy|bar|nestle|wafer/i.test(t)) score -= 15;
    if (/\bmars\b/i.test(t) && !/chocolate|candy|bar/i.test(t)) score -= 15;
    if (/hatching|chick|incubator/i.test(t)) score -= 10;
    if (/soup|smoothie/i.test(t) && /avocado/i.test(subject)) score -= 8;
    if (/flaki|tripe|intestine|offal|beef stomach|organ meat/i.test(t) && !/flaki|tripe/i.test(subject)) score -= 20;
    return score;
}

async function searchCommons(query) {
    const params = new URLSearchParams({
        action: 'query',
        generator: 'search',
        gsrsearch: `filetype:bitmap ${query}`,
        gsrnamespace: '6',
        gsrlimit: '10',
        prop: 'imageinfo',
        iiprop: 'url|extmetadata|size',
        iiurlwidth: '800',
        format: 'json',
        origin: '*'
    });
    const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
        headers: { 'User-Agent': UA },
        signal: AbortSignal.timeout(20000)
    });
    if (!res.ok) return [];
    const data = await res.json();
    const out = [];
    for (const page of Object.values(data?.query?.pages || {})) {
        const title = page?.title || '';
        if (BAD.test(title)) continue;
        const info = page?.imageinfo?.[0];
        const url = info?.thumburl || info?.url;
        if (!url || !/\.(jpg|jpeg|png|webp)/i.test(url)) continue;
        out.push({ source: 'commons', title: title.replace(/^File:/, ''), url });
    }
    return out;
}

async function searchOpenverse(query) {
    const params = new URLSearchParams({
        q: query,
        page_size: '8',
        license_type: 'commercial,modification',
        extension: 'jpg,jpeg,png,webp'
    });
    const res = await fetch(`https://api.openverse.engineering/v1/images/?${params}`, {
        headers: { 'User-Agent': UA },
        signal: AbortSignal.timeout(20000)
    });
    if (!res.ok) return [];
    const data = await res.json();
    const out = [];
    for (const hit of data?.results || []) {
        const title = hit?.title || '';
        if (BAD.test(title)) continue;
        const url = hit?.url || hit?.thumbnail;
        if (!url) continue;
        out.push({ source: 'openverse', title, url });
    }
    return out;
}

async function researchProduct(subject, p) {
    const refs = [];
    const seen = new Set();
    for (const q of researchQueries(subject, p)) {
        for (const fn of [searchCommons, searchOpenverse]) {
            try {
                const hits = await fn(q);
                for (const h of hits) {
                    const key = h.url.split('?')[0];
                    if (seen.has(key)) continue;
                    seen.add(key);
                    const score = scoreRef(h.title, q, subject);
                    if (score < 1) continue;
                    refs.push({ ...h, query: q, score });
                }
            } catch {
                /* next */
            }
            await sleep(40);
        }
    }
    refs.sort((a, b) => b.score - a.score);
    return refs.slice(0, 5);
}

function buildPrompt(subject, refs) {
    const clues = refs
        .slice(0, 3)
        .map((r) => r.title.replace(/\.[a-z0-9]+$/i, '').replace(/[_-]+/g, ' '))
        .filter(Boolean)
        .join('; ');
    const lookLike = clues ? ` Look exactly like real edible food (reference names: ${clues.slice(0, 140)}).` : '';
    return (
        `Ultra realistic minimalist ecommerce catalog food photo: ${subject}.` +
        lookLike +
        ` Single product only, centered, soft natural shadow.` +
        ` Pure solid white background #FFFFFF, no gray, no black, no textured backdrop.` +
        ` Photorealistic, sharp focus, correct anatomy, ${NEGATIVE}`
    );
}

function pollinationsUrl(prompt, slug, attempt = 0) {
    const seed =
        (crypto.createHash('md5').update(`dairy-fix-v4-${slug}-${attempt}`).digest().readUInt32BE(0) +
            attempt * 9973) %
        2147483646;
    const enc = encodeURIComponent(prompt.slice(0, 480));
    return `https://image.pollinations.ai/prompt/${enc}?width=800&height=600&nologo=true&enhance=true&model=flux&seed=${seed}`;
}

async function cornersAreWhite(sharp, buf) {
    const { data, info } = await sharp(buf).resize(100, 75).raw().toBuffer({ resolveWithObject: true });
    const w = info.width;
    const h = info.height;
    const ch = info.channels;
    const pts = [
        [2, 2],
        [w - 3, 2],
        [2, h - 3],
        [w - 3, h - 3],
        [Math.floor(w / 2), 2],
        [2, Math.floor(h / 2)],
        [w - 3, Math.floor(h / 2)],
        [Math.floor(w / 2), h - 3]
    ];
    let white = 0;
    for (const [x, y] of pts) {
        const i = (y * w + x) * ch;
        if (data[i] > 238 && data[i + 1] > 238 && data[i + 2] > 238) white++;
    }
    return white >= 5;
}

/** Edge flood-fill + soft threshold → przezroczyste PNG */
async function toTransparentPng(sharp, inputBuf) {
    const resized = await sharp(inputBuf)
        .resize(800, 600, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    let data = removeEdgeBackground(resized.data, resized.info.width, resized.info.height, 4, {
        lumMin: 236,
        satMax: 32
    });
    data = defringeLightHalos(data, 4);

    // dodatkowe wybielenie prawie białych
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
        raw: { width: resized.info.width, height: resized.info.height, channels: 4 }
    })
        .png()
        .toBuffer();
}

async function saveProductImages(sharp, generatedBuf, slug) {
    const pngBuf = await toTransparentPng(sharp, generatedBuf);
    const pngPath = path.join(outDir, `${slug}.png`);
    const jpgPath = path.join(outDir, `${slug}.jpg`);
    const tmpPng = path.join(os.tmpdir(), `proteiner-${crypto.randomBytes(6).toString('hex')}.png`);
    const tmpJpg = path.join(os.tmpdir(), `proteiner-${crypto.randomBytes(6).toString('hex')}.jpg`);

    try {
        fs.writeFileSync(tmpPng, pngBuf);
        fs.copyFileSync(tmpPng, pngPath);

        await sharp(pngBuf)
            .flatten({ background: { r: 255, g: 255, b: 255 } })
            .jpeg({ quality: 90, mozjpeg: true })
            .toFile(tmpJpg);
        fs.copyFileSync(tmpJpg, jpgPath);
    } finally {
        try {
            fs.unlinkSync(tmpPng);
        } catch {
            /* ignore */
        }
        try {
            fs.unlinkSync(tmpJpg);
        } catch {
            /* ignore */
        }
    }
}

async function fetchBuffer(url) {
    let lastErr;
    for (let attempt = 0; attempt < 5; attempt++) {
        try {
            const res = await fetch(url, {
                headers: { 'User-Agent': UA },
                signal: AbortSignal.timeout(120000),
                redirect: 'follow'
            });
            if (res.status === 429) {
                await sleep(1500 * (attempt + 1) ** 2);
                continue;
            }
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const buf = Buffer.from(await res.arrayBuffer());
            if (buf.length < 3000) throw new Error('za mały plik');
            return buf;
        } catch (e) {
            lastErr = e;
            await sleep(700 * (attempt + 1));
        }
    }
    throw lastErr;
}

async function tryRealPhoto(sharp, refs) {
    for (const ref of refs.slice(0, 4)) {
        try {
            const buf = await fetchBuffer(ref.url);
            // wymuś białe marginesy contain, potem sprawdź czy tło da się wyciąć
            const onWhite = await sharp(buf)
                .resize(800, 600, { fit: 'contain', background: { r: 255, g: 255, b: 255 } })
                .jpeg({ quality: 92 })
                .toBuffer();
            // akceptuj jeśli narożniki białe LUB oryginał ma dość jasne tło
            if (await cornersAreWhite(sharp, onWhite)) {
                return { buf: onWhite, via: `photo:${ref.source}` };
            }
            // nawet bez idealnych narożników — jeśli score wysoki i white-background w query
            if (ref.score >= 6 && /white|isolated/i.test(ref.query || '')) {
                return { buf: onWhite, via: `photo-soft:${ref.source}` };
            }
        } catch {
            /* next ref */
        }
    }
    return null;
}

async function generateAi(sharp, subject, refs, slug) {
    const prompt = buildPrompt(subject, refs);
    let buf = null;
    for (let attempt = 0; attempt < 5; attempt++) {
        const url = pollinationsUrl(prompt, slug, attempt);
        const candidate = await fetchBuffer(url);
        if (await cornersAreWhite(sharp, candidate)) {
            buf = candidate;
            break;
        }
        // spróbuj wymusić białe tło przez contain
        const forced = await sharp(candidate)
            .resize(800, 600, { fit: 'contain', background: { r: 255, g: 255, b: 255 } })
            .jpeg({ quality: 90 })
            .toBuffer();
        if (await cornersAreWhite(sharp, forced)) {
            buf = forced;
            break;
        }
        await sleep(350);
    }
    if (!buf) {
        const url = pollinationsUrl(prompt + ' white seamless background only', slug, 11);
        buf = await sharp(await fetchBuffer(url))
            .resize(800, 600, { fit: 'contain', background: { r: 255, g: 255, b: 255 } })
            .jpeg({ quality: 90 })
            .toBuffer();
    }
    return buf;
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
const skipResearch = process.argv.includes('--skip-research');
const forceAi = process.argv.includes('--force-ai');

let todo = products;
if (slugArgs.length) {
    const set = new Set(slugArgs);
    todo = products.filter((p) => set.has(p.slug));
}
if (keepSlugs.size) todo = todo.filter((p) => !keepSlugs.has(p.slug));
todo = todo.slice(0, maxItems);

console.log(`Research + realistyczne zdjęcia (PNG alpha): ${todo.length}`);

let ok = 0;
let fail = 0;
const failed = [];
const researchLog = {};

for (let i = 0; i < todo.length; i++) {
    const p = todo[i];
    const queries = PRODUCT_SEARCH_QUERIES[p.slug] || [p.name.replace(/\([^)]*\)/g, '').trim()];
    const subject = foodSubject(p, queries);

    process.stdout.write(`[${i + 1}/${todo.length}] ${p.slug} `);

    try {
        let refs = [];
        if (!skipResearch) {
            refs = await researchProduct(subject, p);
            researchLog[p.slug] = {
                subject,
                refs: refs.map((r) => ({ source: r.source, title: r.title, query: r.query, score: r.score }))
            };
            process.stdout.write(`refs=${refs.length} `);
        }

        let buf = null;
        let via = 'ai';

        if (!forceAi && refs.length) {
            const photo = await tryRealPhoto(sharp, refs);
            if (photo) {
                buf = photo.buf;
                via = photo.via;
            }
        }

        if (!buf) {
            buf = await generateAi(sharp, subject, refs, p.slug);
            via = 'ai';
        }

        await saveProductImages(sharp, buf, p.slug);
        console.log(`✓ ${via}`);
        ok++;
    } catch (e) {
        console.log(`✗ ${e.message}`);
        fail++;
        failed.push(p.slug);
    }

    if (i < todo.length - 1) await sleep(delayMs);

    if ((i + 1) % 25 === 0) {
        fs.writeFileSync(researchLogPath, JSON.stringify(researchLog, null, 2));
    }
}

fs.writeFileSync(researchLogPath, JSON.stringify(researchLog, null, 2));
if (failed.length) {
    fs.writeFileSync(path.join(root, 'scripts', 'rebuild-failed.txt'), failed.join('\n'));
}
console.log(`\nGotowe: ${ok} OK, ${fail} błędów → PNG+JPG w ${outDir}`);
console.log(`Research log: ${researchLogPath}`);
