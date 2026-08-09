/**
 * Generuje zdjęcia produktów: fotorealistyczne na białym tle (Pollinations).
 * node scripts/fetch-minimal-product-photos.mjs --all
 * node scripts/fetch-minimal-product-photos.mjs --category=napoje,alkohole,przyprawy
 * node scripts/fetch-minimal-product-photos.mjs --queue
 * node scripts/fetch-minimal-product-photos.mjs --slug=banan --slug=jablko
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import os from 'os';
import { fileURLToPath, pathToFileURL } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'images', 'products');
const queuePath = path.join(root, 'scripts', 'product-images-regen-queue.json');
const queriesPath = path.join(root, 'js', 'product-search-queries.js');

const UA = 'Proteiner/1.0 (nutrition education; contact: developeranios@gmail.com)';

/** Angielskie nazwy dla nowych kategorii (lepsze prompty). */
const CATEGORY_EN = {
    'sol-kuchenna': 'table salt',
    'pieprz-czarny-mielony': 'ground black pepper',
    'papryka-slodka-mielona': 'sweet paprika powder',
    'papryka-ostra-mielona': 'hot paprika powder',
    majeranek: 'dried marjoram',
    oregano: 'dried oregano',
    'bazylia-suszona': 'dried basil',
    kminek: 'caraway seeds',
    'lisc-laurowy': 'bay leaves',
    'ziele-angielskie': 'allspice berries',
    kurkuma: 'turmeric powder',
    'cynamon-mielony': 'ground cinnamon',
    'czosnek-granulowany': 'garlic granules',
    'ziola-prowansalskie': 'herbes de Provence',
    tymianek: 'dried thyme',
    'chili-mielone': 'chili powder',
    'imbir-mielony': 'ground ginger',
    'galka-muszkatolowa': 'nutmeg',
    'przyprawa-do-kurczaka': 'chicken seasoning blend',
    vegeta: 'vegetable seasoning powder',
    'garage-hard-lemon-4-6': 'lemon flavored beer',
    'tyskie-gronie': 'lager beer',
    'zywiec-jasne-pelne': 'lager beer',
    'lech-premium': 'lager beer',
    'okocim-o-k-beer': 'lager beer',
    'harnas-jasne': 'lager beer',
    desperados: 'tequila flavored beer',
    'somersby-jablkowy': 'apple cider',
    heineken: 'lager beer',
    'corona-extra': 'lager beer with lime',
    'wyborowa-wodka': 'vodka',
    'soplica-czysta': 'vodka',
    'zubrowka-bison-grass': 'bison grass vodka',
    'soplica-wisniowa': 'cherry liqueur',
    'krupnik-tradycyjny': 'honey vodka',
    jagermeister: 'herbal liqueur',
    'baileys-original': 'Irish cream liqueur',
    'wino-czerwone-wytrawne': 'dry red wine',
    'wino-biale-polslodkie': 'semi-sweet white wine',
    prosecco: 'prosecco sparkling wine',
    'coca-cola': 'cola soft drink',
    'coca-cola-zero': 'diet cola soft drink',
    pepsi: 'cola soft drink',
    sprite: 'lemon lime soda',
    'fanta-pomaranczowa': 'orange soda',
    mirinda: 'orange soda',
    'lipton-ice-tea-brzoskwinia': 'peach iced tea',
    'nestea-cytryna': 'lemon iced tea',
    'red-bull': 'energy drink',
    'tiger-energy-drink': 'energy drink',
    'black-energy-drink': 'energy drink',
    'monster-energy': 'energy drink',
    woda: 'still water',
    'kubus-jablkowy': 'apple juice',
    'tymbark-jablko': 'apple juice',
    'sok-pomaranczowy-100': 'orange juice',
    'herbata-czarna-napar': 'black tea',
    'kawa-czarna-parzona': 'black coffee',
    'oshee-izotoniczny': 'isotonic sports drink'
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
        return { slug, name: p.name, category: p.category, emoji: p.emoji || '🍽️' };
    });
}

function seedFromSlug(slug) {
    const h = crypto.createHash('md5').update(`${slug}:v3`).digest();
    return h.readUInt32BE(0) % 2147483646;
}

function buildPrompt(p, englishName) {
    const en = englishName || p.name.replace(/\([^)]*\)/g, '').trim();
    const lower = `${en} ${p.name}`.toLowerCase();
    let subject = en;
    if (/oliwa|olej|oil|ghee|tluszcz|tłuszcz|smalec|maslo klarowane/i.test(lower)) {
        subject = `${en}, clear glass bottle with golden liquid, blank label area`;
    } else if (/masło|maslo|butter|margaryna/i.test(lower) && !/orzechow/i.test(lower)) {
        subject = `${en}, stick or wrapped block`;
    } else if (/sos |ketchup|mayo|musztard|pesto|sriracha|sojow|barbecue|teriyaki|tzatziki|hummus/i.test(lower)) {
        subject = `${en}, small bowl or bottle without readable text`;
    } else if (/zupa|soup|rosol|minestrone|barszcz|krem /i.test(lower)) {
        subject = `${en}, white ceramic bowl`;
    } else if (/protein|whey|wpc|wpi|izolat|koncentrat bialka/i.test(lower)) {
        subject = `${en}, protein powder in scoop`;
    } else if (/pizza|burger|kebab|wrap|frytk|nugget|mcchicken|big mac|hot dog/i.test(lower)) {
        subject = `${en}, single serving portion`;
    } else if (
        p.category === 'przyprawy' ||
        /przypraw|pieprz|papryk|oregano|bazyl|kminek|cynamon|kurkum|chili|majeran|tymian|imbir|gałk|galka|czosnek granul|liść laur|lisc laur|ziele angiel|vegeta|sól|sol /i.test(
            lower
        )
    ) {
        if (/sól|sol |salt/i.test(lower)) subject = `fine table salt crystals in a small clear glass pile`;
        else if (/pieprz|pepper/i.test(lower)) subject = `ground black pepper powder small mound`;
        else if (/liść|lisc|bay/i.test(lower)) subject = `dried bay leaves stacked`;
        else if (/ziele angiel|allspice/i.test(lower)) subject = `whole dried allspice berries`;
        else if (/gałk|galka|nutmeg/i.test(lower)) subject = `whole nutmeg and grated nutmeg`;
        else if (/vegeta|seasoning mix|przyprawa do/i.test(lower))
            subject = `seasoning powder in a small ceramic spoon, spice blend`;
        else subject = `${en} dried spice or herb, small neat pile or loose leaves`;
    } else if (
        p.category === 'alkohole' ||
        /piwo|wódka|wodka|wino|prosecco|likier|beer|wine|vodka|whisky|jägermeister|jagermeister|baileys|somersby|desperados|heineken|corona/i.test(
            lower
        )
    ) {
        if (/wino czerw|red wine/i.test(lower)) subject = `red wine in a clear wine glass`;
        else if (/wino biał|wino bial|white wine/i.test(lower)) subject = `white wine in a clear wine glass`;
        else if (/prosecco|champagne|sparkling/i.test(lower)) subject = `prosecco sparkling wine in a flute glass`;
        else if (/baileys|cream liqueur/i.test(lower)) subject = `Irish cream liqueur in a short glass`;
        else if (/jägermeister|jagermeister|herbal liqueur/i.test(lower))
            subject = `dark herbal liqueur in a small shot glass`;
        else if (/wódka|wodka|vodka|soplica|żubrówka|zubrowka|wyborowa|krupnik/i.test(lower))
            subject = `clear spirit in a small shot glass`;
        else if (/somersby|cider/i.test(lower)) subject = `apple cider in a pint glass`;
        else subject = `beer in a clean pint glass with light foam, no brand logo`;
    } else if (
        p.category === 'napoje' ||
        /cola|pepsi|sprite|fanta|mirinda|red bull|monster|tiger|energy|ice tea|nestea|lipton|kubuś|kubus|tymbark|oshee|herbata|kawa|sok |woda/i.test(
            lower
        )
    ) {
        if (/still water|^woda$|mineral water/i.test(lower) && !/tonic|soda|energy|soft|cola/i.test(lower))
            subject =
                'plain colorless transparent still drinking water in a clear tumbler glass, no ice color, no blue tint';
        else if (/kawa|coffee/i.test(lower)) subject = `black coffee in a white ceramic cup`;
        else if (/herbata|tea/i.test(lower) && !/ice tea|nestea|lipton/i.test(lower))
            subject = `black tea in a clear glass cup`;
        else if (/sok|juice|kubuś|kubus|tymbark|pomarańcz/i.test(lower))
            subject = `fruit juice in a clear glass`;
        else if (/ice tea|nestea|lipton/i.test(lower)) subject = `iced tea in a tall clear glass with ice`;
        else if (/energy|red bull|monster|tiger|black energy|oshee/i.test(lower))
            subject = `energy drink poured in a tall glass with ice, no brand logo`;
        else if (/cola|pepsi/i.test(lower))
            subject =
                'classic dark brown cola soft drink in a clear glass with ice cubes and bubbles, caramel color, no can, no brand logo';
        else if (/sprite|lemon lime/i.test(lower))
            subject = `clear lemon-lime soda in a tall glass with ice and bubbles, pale green tint, no can`;
        else if (/fanta|mirinda|orange soda/i.test(lower))
            subject = `bright orange soda in a clear glass with ice and bubbles, no can`;
        else subject = `${en} beverage in a clear glass`;
    }
    const catHint = {
        warzywa: 'fresh vegetable',
        owoce: 'fresh fruit',
        mieso: 'meat or fish',
        nabial: 'dairy product',
        zboza: 'grain or bakery product',
        orzechy: 'nuts or seeds',
        sosy: 'condiment',
        tluszcze: 'cooking fat or oil',
        makarony: 'pasta dish',
        zupy: 'soup',
        fastfood: 'fast food item',
        slodycze: 'sweet snack',
        'polskie-obiadki': 'Polish home-style dish',
        przyprawy: 'culinary spice',
        alkohole: 'drink serving',
        napoje: 'beverage'
    }[p.category];
    const hint = catHint ? `, ${catHint}` : '';
    return (
        `Professional e-commerce product photo of ${subject}${hint}, food or drink only, centered on pure white background, ` +
        `soft subtle shadow, minimalist studio lighting, photorealistic, no text, no people, no hands, no logo, ` +
        `no watermark, no extra props, no confusing labels, isolated product`
    );
}

function buildMinimalSvg(emoji) {
    const e = escXml(emoji || '🍽️');
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="#ffffff"/>
  <ellipse cx="400" cy="430" rx="120" ry="18" fill="#000000" fill-opacity="0.06"/>
  <text x="400" y="340" text-anchor="middle" font-size="160">${e}</text>
</svg>`;
}

function escXml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

async function writeProductJpeg(sharp, outPath, bufferOrSvg) {
    const tmpPath = path.join(os.tmpdir(), `proteiner-${crypto.randomBytes(8).toString('hex')}.jpg`);
    try {
        if (Buffer.isBuffer(bufferOrSvg)) {
            await sharp(bufferOrSvg)
                .resize(800, 600, { fit: 'contain', background: { r: 255, g: 255, b: 255 } })
                .jpeg({ quality: 80, mozjpeg: true })
                .toFile(tmpPath);
        } else {
            await sharp(Buffer.from(bufferOrSvg)).jpeg({ quality: 92 }).toFile(tmpPath);
        }
        const data = fs.readFileSync(tmpPath);
        fs.writeFileSync(outPath, data);
    } finally {
        try {
            fs.unlinkSync(tmpPath);
        } catch {
            /* ignore */
        }
    }
}

const raw = JSON.parse(
    fs.readFileSync(path.join(root, 'js', 'products-data-raw.js'), 'utf8').match(/productsDatabaseRaw = (\[[\s\S]*\]);/)[1]
);
const allProducts = enrichProducts(raw);
const sharp = (await import('sharp')).default;
fs.mkdirSync(outDir, { recursive: true });

let PRODUCT_SEARCH_QUERIES = {};
if (fs.existsSync(queriesPath)) {
    const mod = await import(pathToFileURL(queriesPath).href);
    PRODUCT_SEARCH_QUERIES = mod.PRODUCT_SEARCH_QUERIES || {};
}

const slugArgs = process.argv.filter((a) => a.startsWith('--slug=')).map((a) => a.slice(7));
const catArgs = process.argv
    .filter((a) => a.startsWith('--category='))
    .flatMap((a) =>
        a
            .slice(11)
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
    );
const keepArg = process.argv.find((a) => a.startsWith('--keep-slugs='));
const keepSlugs = new Set(
    (keepArg?.split('=')[1] || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
);
let todo = allProducts;

if (slugArgs.length) {
    const set = new Set(slugArgs);
    todo = allProducts.filter((p) => set.has(p.slug));
} else if (catArgs.length) {
    const set = new Set(catArgs);
    todo = allProducts.filter((p) => set.has(p.category));
} else if (process.argv.includes('--from-audit')) {
    const auditPath = path.join(root, 'scripts', 'product-images-to-fix.json');
    if (!fs.existsSync(auditPath)) {
        console.error(
            'Brak',
            auditPath,
            '— uruchom: node scripts/audit-product-image-style.mjs --json > scripts/product-images-to-fix.json'
        );
        process.exit(1);
    }
    const flagged = JSON.parse(fs.readFileSync(auditPath, 'utf8').replace(/^\uFEFF/, ''));
    const set = new Set(flagged.map((f) => f.slug));
    todo = allProducts.filter((p) => set.has(p.slug));
} else if (process.argv.includes('--queue')) {
    if (!fs.existsSync(queuePath)) {
        console.error('Brak', queuePath, '— uruchom build-product-image-regen-queue.mjs');
        process.exit(1);
    }
    const queue = JSON.parse(fs.readFileSync(queuePath, 'utf8'));
    const set = new Set(queue.map((q) => q.slug));
    todo = allProducts.filter((p) => set.has(p.slug));
} else if (process.argv.includes('--all')) {
    todo = allProducts;
} else {
    console.error('Użyj --all, --category=napoje,alkohole, --queue, --from-audit lub --slug=nazwa');
    process.exit(1);
}

if (keepSlugs.size) todo = todo.filter((p) => !keepSlugs.has(p.slug));

const skipExisting = process.argv.includes('--skip-ok');
const noEmojiFallback = process.argv.includes('--no-emoji-fallback') || process.argv.includes('--from-audit');
const delayMs = parseInt(process.argv.find((a) => a.startsWith('--delay='))?.split('=')[1] || '800', 10);

console.log(`Do wygenerowania: ${todo.length} zdjęć`);

let ok = 0;
let fail = 0;

for (let i = 0; i < todo.length; i++) {
    const p = todo[i];
    const outPath = path.join(outDir, `${p.slug}.jpg`);

    if (skipExisting && fs.existsSync(outPath)) {
        try {
            const { data, info } = await sharp(outPath).resize(120, 90).raw().toBuffer({ resolveWithObject: true });
            const w = info.width;
            const h = info.height;
            const ch = info.channels;
            let white = 0;
            let cornerWhite = 0;
            const corners = [
                [0, 0],
                [w - 1, 0],
                [0, h - 1],
                [w - 1, h - 1]
            ];
            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    const idx = (y * w + x) * ch;
                    if (data[idx] > 235 && data[idx + 1] > 235 && data[idx + 2] > 235) white++;
                }
            }
            for (const [x, y] of corners) {
                const idx = (y * w + x) * ch;
                if (data[idx] > 230 && data[idx + 1] > 230 && data[idx + 2] > 230) cornerWhite++;
            }
            if (white / (w * h) >= 0.45 && cornerWhite >= 4) {
                continue;
            }
        } catch {
            /* regenerate */
        }
    }

    const english = PRODUCT_SEARCH_QUERIES[p.slug]?.[0] || CATEGORY_EN[p.slug];
    const prompt = encodeURIComponent(buildPrompt(p, english));
    const seed = seedFromSlug(p.slug);
    const url = `https://image.pollinations.ai/prompt/${prompt}?width=800&height=600&nologo=true&seed=${seed}`;

    process.stdout.write(`[${i + 1}/${todo.length}] ${p.slug} … `);

    let lastErr = null;
    for (let attempt = 0; attempt < 4; attempt++) {
        if (attempt > 0) await sleep(3000 * attempt);
        try {
            const res = await fetch(url, {
                headers: { 'User-Agent': UA },
                signal: AbortSignal.timeout(120000)
            });
            if (res.status === 429) throw new Error('HTTP 429');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const buf = Buffer.from(await res.arrayBuffer());
            if (buf.length < 5000) throw new Error('za mały plik');
            if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
            await writeProductJpeg(sharp, outPath, buf);
            console.log(attempt ? `OK (retry ${attempt})` : 'OK');
            ok++;
            lastErr = null;
            break;
        } catch (e) {
            lastErr = e;
        }
    }

    if (lastErr) {
        if (noEmojiFallback) {
            console.log(`FAIL (${lastErr.message}) — zostawiam poprzednie`);
            fail++;
        } else {
            try {
                await writeProductJpeg(sharp, outPath, buildMinimalSvg(p.emoji));
                console.log(`fallback emoji (${lastErr.message})`);
                ok++;
            } catch (e2) {
                console.log(`FAIL (${e2.message})`);
                fail++;
            }
        }
    }

    if (i < todo.length - 1) await sleep(delayMs);
}

console.log(`\nGotowe: ${ok} OK, ${fail} błędów → ${outDir}`);
