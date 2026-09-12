/**
 * Generuje brakujące zdjęcia produktów w stylu reszty bazy:
 * minimalistyczne, fotorealistyczne, z WYCIĘTYM tłem
 * (przezroczysty PNG → WebP z alfą + JPG na białym tle).
 *
 * node scripts/generate-missing-product-photos.mjs --limit=5
 * node scripts/generate-missing-product-photos.mjs --slug=bulgur-suchy
 * node scripts/generate-missing-product-photos.mjs --all --delay=400
 * node scripts/generate-missing-product-photos.mjs --formats=jpg,webp,png
 * node scripts/generate-missing-product-photos.mjs --force --slug=ryz
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath, pathToFileURL } from 'url';
import { removeEdgeBackground, defringeLightHalos } from './remove-edge-background.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'images', 'products');
const bundleDir = path.join(root, 'deploy-bundle', 'images', 'products');
const queriesPath = path.join(root, 'js', 'product-search-queries.js');
const UA = 'Proteiner/1.0 (nutrition education; contact: developeranios@gmail.com)';

/** Angielskie nazwy kategorii (lepsze prompty). */
const CATEGORY_EN = {
    warzywa: 'fresh vegetable',
    owoce: 'fresh fruit',
    nabial: 'dairy food product',
    sery: 'cheese',
    mieso: 'meat, fish or poultry',
    zboza: 'grain, bread or bakery product',
    napoje: 'beverage in a clear glass',
    alkohole: 'alcoholic drink in a glass',
    przyprawy: 'dry spice or herb',
    tluszcze: 'butter or cooking oil',
    sosy: 'sauce or condiment',
    zupy: 'soup in a white ceramic bowl',
    makarony: 'pasta dish',
    orzechy: 'nuts or seeds pile',
    slodycze: 'candy, chocolate or dessert',
    'platki-sniadaniowe': 'breakfast cereal',
    'polskie-obiadki': 'Polish home-style cooked dish on a plate or in a bowl',
    'mrozone-pizze': 'whole round pizza',
    fastfood: 'fast food item',
    batony: 'candy bar'
};

function buildPrompt(p, englishName) {
    const en = englishName || p.name.replace(/\([^)]*\)/g, '').trim();
    const lower = `${en} ${p.name}`.toLowerCase();
    let subject = en;

    if (/oliwa|olej|oil|ghee|smalec|mas[lł]o klarowane/i.test(lower)) {
        subject = `${en}, clear glass bottle with golden liquid, blank label`;
    } else if (/mas[lł]o|butter|margaryna/i.test(lower) && !/orzechow/i.test(lower)) {
        subject = `${en}, block or stick of butter`;
    } else if (/zupa|soup|ros[oó][lł]|barszcz|[zż]urek|krem /i.test(lower)) {
        subject = `${en}, white ceramic bowl, whole bowl visible`;
    } else if (/sos |ketchup|majonez|mayo|musztard|pesto|sriracha|sojow|barbecue|teriyaki|tzatziki|hummus/i.test(lower)) {
        subject = `${en}, small bowl or glass jar without readable text`;
    } else if (/protein|whey|wpc|wpi|izolat|koncentrat bia[lł]ka/i.test(lower)) {
        subject = `${en}, protein powder in a scoop`;
    } else if (/pizza|burger|kebab|wrap|frytk|nugget|hot ?dog|taco|sushi|ramen/i.test(lower)) {
        subject = `${en}, single serving portion`;
    } else if (p.category === 'przyprawy' || /przypraw|pieprz|papryk|oregano|bazyl|kminek|cynamon|kurkum|chili|majeran|tymian|imbir|ga[lł]k|czosnek|li[sś][cć] laur|ziele angiel|vegeta|s[oó]l\b/i.test(lower)) {
        if (/s[oó]l\b|salt/i.test(lower)) subject = `fine table salt crystals in a small neat pile`;
        else if (/pieprz|pepper/i.test(lower)) subject = `ground black pepper powder in a small mound`;
        else if (/li[sś][cć]|bay/i.test(lower)) subject = `dried bay leaves stacked`;
        else subject = `${en}, dried spice or herb, small neat pile or loose leaves`;
    } else if (p.category === 'alkohole' || /piwo|w[oó]dka|wino|prosecco|likier|beer|wine|vodka|whisky|jagermeister|baileys|somersby|desperados|heineken|corona/i.test(lower)) {
        if (/wino czerw|red wine/i.test(lower)) subject = `red wine in a clear wine glass`;
        else if (/wino bia[lł]|white wine/i.test(lower)) subject = `white wine in a clear wine glass`;
        else if (/prosecco|sparkling/i.test(lower)) subject = `sparkling wine in a flute glass`;
        else if (/w[oó]dka|vodka|soplica|zubr[oó]wka|[zż]ubr[oó]wka|wyborowa|krupnik/i.test(lower)) subject = `clear spirit in a small shot glass`;
        else if (/baileys|cream liqueur/i.test(lower)) subject = `cream liqueur in a short glass`;
        else if (/jagermeister|j[aä]germeister|herbal liqueur/i.test(lower)) subject = `dark herbal liqueur in a small shot glass`;
        else subject = `beer in a clean pint glass with light foam, no brand logo`;
    } else if (p.category === 'napoje' || /cola|pepsi|sprite|fanta|mirinda|red bull|monster|energy|ice tea|lipton|kubu[sś]|tymbark|herbata|kawa|sok|woda/i.test(lower)) {
        if (/still water|^woda|mineral water/i.test(lower) && !/tonic|soda|energy|cola/i.test(lower))
            subject = `plain colorless still drinking water in a clear glass`;
        else if (/kawa|coffee/i.test(lower)) subject = `black coffee in a white ceramic cup`;
        else if (/herbata|tea/i.test(lower) && !/ice tea|lipton/i.test(lower)) subject = `tea in a clear glass cup`;
        else if (/sok|juice|kubu[sś]|tymbark|pomara[nń]cz/i.test(lower)) subject = `fruit juice in a clear glass`;
        else if (/ice tea|lipton/i.test(lower)) subject = `iced tea in a tall clear glass with ice`;
        else if (/energy|red bull|monster/i.test(lower)) subject = `energy drink in a tall glass with ice, no brand logo`;
        else if (/cola|pepsi/i.test(lower)) subject = `dark cola soft drink in a clear glass with ice and bubbles, no can, no brand logo`;
        else if (/sprite|lemon lime|7up/i.test(lower)) subject = `clear lemon-lime soda in a tall glass with ice and bubbles, no can`;
        else if (/fanta|mirinda|orange soda/i.test(lower)) subject = `bright orange soda in a clear glass with ice and bubbles, no can`;
        else subject = `${en} beverage in a clear glass`;
    }

    const catHint = CATEGORY_EN[p.category] ? `, ${CATEGORY_EN[p.category]}` : '';
    return (
        `Professional e-commerce product photo of ${subject}${catHint}, exact edible food or drink only, single neat portion, centered, ` +
        `pure solid white background #FFFFFF, no shadow, no reflection, minimalist studio lighting, photorealistic, sharp realistic detail, ` +
        `no text, no people, no hands, no animals, no logo, no watermark, no extra props, isolated product`
    );
}

function seedFromSlug(slug) {
    const h = crypto.createHash('md5').update(`${slug}:gen1`).digest();
    return h.readUInt32BE(0) % 2147483646;
}

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

/** Białe tło → przezroczysty PNG (cut-out, styl reszty bazy). */
async function toCutoutPng(sharp, inputBuf) {
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
        .png({ compressionLevel: 9, palette: true, quality: 90 })
        .toBuffer();
}

function slugify(name) {
    return String(name)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/ą/g, 'a').replace(/ć/g, 'c').replace(/ę/g, 'e').replace(/ł/g, 'l')
        .replace(/ń/g, 'n').replace(/ó/g, 'o').replace(/ś/g, 's').replace(/ź/g, 'z').replace(/ż/g, 'z')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function enrichProducts(list) {
    const seen = {};
    return list.map((p) => {
        let base = p.slug && String(p.slug).trim() ? String(p.slug).trim() : slugify(p.name);
        let slug = base;
        let n = 2;
        while (seen[slug]) {
            slug = `${base}-${p.category || 'x'}`;
            if (seen[slug]) slug = `${base}-${n++}`;
        }
        seen[slug] = true;
        return { slug, name: p.name, category: p.category };
    });
}

const raw = JSON.parse(
    fs.readFileSync(path.join(root, 'js', 'products-data-raw.js'), 'utf8').match(/productsDatabaseRaw = (\[[\s\S]*\]);/)[1]
);
const products = enrichProducts(raw);
const sharp = (await import('sharp')).default;
fs.mkdirSync(outDir, { recursive: true });

let PRODUCT_SEARCH_QUERIES = {};
if (fs.existsSync(queriesPath)) {
    const mod = await import(pathToFileURL(queriesPath).href);
    PRODUCT_SEARCH_QUERIES = mod.PRODUCT_SEARCH_QUERIES || {};
}

const formatsArg = process.argv.find((a) => a.startsWith('--formats='));
const formats = new Set(
    (formatsArg ? formatsArg.split('=')[1] : 'jpg,webp,png').split(',').map((s) => s.trim()).filter(Boolean)
);
const slugArgs = process.argv.filter((a) => a.startsWith('--slug=')).map((a) => a.slice(7));
const limitArg = process.argv.find((a) => a.startsWith('--limit='));
const limit = limitArg ? Number(limitArg.split('=')[1]) : Infinity;
const delayMs = parseInt(process.argv.find((a) => a.startsWith('--delay='))?.split('=')[1] || '400', 10);
const force = process.argv.includes('--force');

function hasFiles(slug) {
    return fs.existsSync(path.join(outDir, `${slug}.jpg`)) && fs.existsSync(path.join(outDir, `${slug}.webp`));
}

let todo = products;
if (slugArgs.length) {
    const set = new Set(slugArgs);
    todo = products.filter((p) => set.has(p.slug));
} else if (!force) {
    todo = products.filter((p) => !hasFiles(p.slug));
}
if (limit !== Infinity) todo = todo.slice(0, limit);

console.log(`Produktów: ${products.length} | do wygenerowania: ${todo.length} | formaty: ${[...formats].join(',')}`);
if (!todo.length) process.exit(0);

async function writeSet(slug, pngBuffer) {
    if (formats.has('png')) fs.writeFileSync(path.join(outDir, `${slug}.png`), pngBuffer);
    const jpg = await sharp(pngBuffer)
        .flatten({ background: { r: 255, g: 255, b: 255 } })
        .jpeg({ quality: 88, mozjpeg: true })
        .toBuffer();
    fs.writeFileSync(path.join(outDir, `${slug}.jpg`), jpg);
    const webp = await sharp(pngBuffer)
        .ensureAlpha()
        .webp({ quality: 80, alphaQuality: 85, effort: 4 })
        .toBuffer();
    fs.writeFileSync(path.join(outDir, `${slug}.webp`), webp);

    if (fs.existsSync(bundleDir)) {
        if (formats.has('png')) fs.writeFileSync(path.join(bundleDir, `${slug}.png`), pngBuffer);
        fs.writeFileSync(path.join(bundleDir, `${slug}.jpg`), jpg);
        fs.writeFileSync(path.join(bundleDir, `${slug}.webp`), webp);
    }
}

let ok = 0;
let fail = 0;
const failed = [];

for (let i = 0; i < todo.length; i++) {
    const p = todo[i];
    const english = PRODUCT_SEARCH_QUERIES[p.slug]?.[0];
    const prompt = encodeURIComponent(buildPrompt(p, english));
    const seed = seedFromSlug(p.slug);
    const url = `https://image.pollinations.ai/prompt/${prompt}?width=800&height=600&nologo=true&model=flux&seed=${seed}`;

    process.stdout.write(`[${i + 1}/${todo.length}] ${p.slug} … `);
    let lastErr = null;
    for (let attempt = 0; attempt < 4; attempt++) {
        if (attempt > 0) await sleep(3000 * attempt);
        try {
            const res = await fetch(url, {
                headers: { 'User-Agent': UA, Referer: 'https://proteiner.pl/' },
                signal: AbortSignal.timeout(120000)
            });
            if (res.status === 429) throw new Error('HTTP 429');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const buf = Buffer.from(await res.arrayBuffer());
            if (buf.length < 5000) throw new Error('za mały plik');
            const png = await toCutoutPng(sharp, buf);
            await writeSet(p.slug, png);
            console.log(attempt ? `OK (retry ${attempt})` : 'OK');
            ok++;
            lastErr = null;
            break;
        } catch (e) {
            lastErr = e;
        }
    }
    if (lastErr) {
        console.log(`FAIL (${lastErr.message})`);
        fail++;
        failed.push({ slug: p.slug, error: lastErr.message });
    }
    if (i < todo.length - 1) await sleep(delayMs);
}

console.log(`\nGotowe: ${ok} OK, ${fail} błędów → ${outDir}`);
if (failed.length) {
    fs.writeFileSync(path.join(root, 'scripts', 'generate-missing-photos-failed.json'), JSON.stringify(failed, null, 2));
    console.log('Zapisano scripts/generate-missing-photos-failed.json');
}
