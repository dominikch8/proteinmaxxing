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
