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
