/**
 * Pobiera popularne produkty z kalkulatorkalorii.net/tabela-kalorii
 * i dodaje ~500 nowych, znanych pozycji do bazy Proteiner.
 *
 * node scripts/import-kalkulatorkalorii-batch.mjs
 * node scripts/import-kalkulatorkalorii-batch.mjs --pages=25 --target=500
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildMicrosForProduct } from './product-micros-engine.mjs';
import { microsToLabelString } from './lib/micros-shared.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const rawPath = path.join(root, 'js', 'products-data-raw.js');
const dumpPath = path.join(__dirname, '_kk-import-dump.json');

const pagesArg = process.argv.find((a) => a.startsWith('--pages='));
const targetArg = process.argv.find((a) => a.startsWith('--target='));
const PAGES = pagesArg ? Number(pagesArg.split('=')[1]) : 30;
const TARGET_ADD = targetArg ? Number(targetArg.split('=')[1]) : 500;

const UA =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 ProteinerImport/1.0';

function slugify(name) {
    return String(name)
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
        .replace(/^-+|-+$/g, '')
        .slice(0, 80);
}

function parseNum(s) {
    if (s == null) return null;
    const n = Number(String(s).trim().replace(',', '.').replace(/\s/g, ''));
    return Number.isFinite(n) ? n : null;
}

function decodeHtml(s) {
    return String(s)
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function normalizeName(name) {
    let n = decodeHtml(name)
        .replace(/\s+/g, ' ')
        .replace(/\s*\([^)]*\)\s*/g, (m) => {
            const inner = m.slice(1, -1).toLowerCase();
            // Keep useful distinctions, drop "świeży owoc" noise later via cleanup
            if (/świeży|surow|gotowan|pieczon|mrożon|bez skóry|ze skórą|w wodzie|w oleju/.test(inner)) {
                return m;
            }
            return m;
        })
        .trim();

    // Soft cleanup of very generic suffixes that duplicate our base items
    n = n
        .replace(/\s*\(świeży owoc\)\s*/gi, '')
        .replace(/\s*\(surowa?\)\s*/gi, '')
        .replace(/\s*\(śwież[ea]\)\s*/gi, '')
        .trim();

    return n;
}

function nameKey(name) {
    return normalizeName(name)
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
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

function guessCategory(name) {
    const n = name.toLowerCase();

    if (/wódka|whisky|whiskey|rum|gin|likier|piwo|wino|prosecco|cydr|cider|aperol|baileys|jägermeister|tequila|brandy|koniak|champagne|szampan|desperados|somersby|hard seltzer/.test(n)) {
        return 'alkohole';
    }
    if (/cola|pepsi|fanta|sprite|sok |nektar|napój|oranżad|lemoniad|woda |kawa |herbata|ice tea|izoton|energy|red bull|monster|tymbark|kubuś|nestea|lipton|oshee|smoothie|shake protein/.test(n)) {
        return 'napoje';
    }
    if (/pieprz|sól |oregano|bazylia|tymianek|kurkum|cynamon|curry|papryka.*miel|chili miel|majeranek|kminek|gałka|imbir miel|przypraw|vegeta|czosnek granul|zioła /.test(n)) {
        return 'przyprawy';
    }
    if (/pizza /.test(n) || /gusto|ristorante|guseppe|feliciana|wagner|dr\.?\s*oetker pizza/.test(n)) {
        return 'mrozone-pizze';
    }
    if (/baton protein|protein bar|go on protein|nick\.?s protein|f\*\*king protein|protein 33|protein 50|mars protein|snickers protein/.test(n)) {
        return 'batony-proteinowe';
    }
    if (/snickers|twix|mars\b|bounty|kit ?kat|\blion\b|milky way|3 bit|pawełek|grześki|knoppers|prince polo|princessa|danusia|\bnuts\b|duplo|kinder bueno|baton /.test(n)) {
        return 'batony';
    }
    if (/czekolad|nutella|żelki|lody |pączek|croissant|ptasie|wafel|oreo|delicje|herbatnik|ciastk|sernik|szarlot|brownie|tiramisu|chałwa|miód|cukierki|chipsy|popcorn|biszkopt|babka |makowiec|piernik/.test(n)) {
        return 'slodycze';
    }
    if (/hamburger|cheeseburger|big mac|whopper|nugget|kebab|hot dog|frytk|mcdonald|kfc|burger|shawarma|burrito|taco|fast.?food|zapiekanka/.test(n)) {
        return 'fastfood';
    }
    if (/zupa |rosół|barszcz|żurek|kapuśniak|grochówka|flaki|krupnik|pomidorowa|ogórkowa|pieczarkowa|krem |zupka chińska|ramen /.test(n)) {
        return 'zupy';
    }
    if (/pierogi|gołąbki|bigos|pyzy|kopytka|kluski|placki|naleśnik|krokiet|schabowy|kotlet|gulasz|risotto|kaszanka|flaki|golonka|karczek piecz|ziemniaki tłuczone|kasza z|ryż z|makaron z sosem/.test(n)) {
        return 'polskie-obiadki';
    }
    if (/ketchup|majonez|musztarda|sos |hummus|guacamole|tzatziki|salsa|pesto|passata|koncentrat pomidor|przecier/.test(n)) {
        return 'sosy';
    }
    if (/olej |oliwa|masło |margaryna|smalec|ghee|tłuszcz /.test(n)) {
        return 'tluszcze';
    }
    if (/migdał|orzech|nerkowiec|pistacj|sezam|siemię|nasiona|pestki|tahini|masło orzechowe|słonecznik ziarno|dynia pestki/.test(n)) {
        return 'orzechy';
    }
    if (/makaron|spaghetti|penne|fusilli|tagliatelle|ravioli|tortellini|gnocchi|lasagna|łazanki|świderki|udon/.test(n)) {
        return 'makarony';
    }
    if (/płatki |granola|musli|corn flakes|nesquik|cini minis|cheerios|fitella|płatki lion/.test(n)) {
        return 'platki-sniadaniowe';
    }
    if (/ryż |kasza |mąka |chleb |bułka |bagiet|tortilla|wafle ryż|pieczywo|pumpernikiel|kuskus|quinoa|komosa|otręb|bulgur|pęczak|amaran/.test(n)) {
        return 'zboza';
    }
    if (/ser gouda|ser edam|ser cheddar|ser mozzarella|ser feta|ser camembert|ser brie|ser parmezan|ser halloumi|ser pleśni|ser kozi|ser żółty|ser topiony|ricotta|mascarpone|oscypek|emmental|provolone|tylżycki|ser cottage/.test(n) || /^ser /.test(n)) {
        return 'sery';
    }
    if (/mleko |jogurt|skyr|kefir|maślanka|twaróg|serek |śmietan|jajko|jajo |jajeczn|omlet|budyń|danio|protein pudding|serwatk|wpc|wpi|białka jaj/.test(n)) {
        return 'nabial';
    }
    if (/kurczak|indyk|wołowin|wieprzowin|schab|karkówka|mielon|szynka|kiełbas|parówk|kabanos|salami|boczek|wątrób|filet|udko|skrzydeł|łosoś|tuńczyk|dorsz|śledź|makrela|pstrąg|krewet|kalmar|mintaj|halibut|karp|sandacz|kaczka|cielęcin|jagnięcin|królik|baleron|mortadela|pasztet|salceson|polędwic/.test(n)) {
        return 'mieso';
    }
    if (/jabł|banan|gruszk|truskawk|malin|borówk|jagod|winogron|czereśn|wiśn|śliwk|pomarańcz|mandarynk|cytryn|limon|kiwi|arbuz|melon|awokado|mango|ananas|brzoskw|nektaryn|morel|rodzyn|daktyl|żurawin|figi |kokos |granat|papaja|marakuja|pigwa/.test(n)) {
        return 'owoce';
    }
    if (/pomidor|ogórek|cebula|czosnek|marchew|ziemniak|papryka|sałata|rukola|szpinak|brokuł|kalafior|cukinia|bakłażan|dynia|kapusta|burak|seler|pietruszk|por |fasolk|groszek|szparag|pieczark|grzyb|ciecierzyc|soczewic|fasola|tofu|kukurydz|rzodkiew|batat|kalarepa|jarmuż|bruksel|bób |koperek|szczypior|chrzan|imbir śwież|oliwk/.test(n)) {
        return 'warzywa';
    }

    // Fallback by macros later
    return null;
}

function categoryByMacros(kcal, protein, carbs, fat) {
    if (fat >= 70 && carbs < 5 && protein < 5) return 'tluszcze';
    if (protein >= 15 && carbs < 5 && fat < 25) return 'mieso';
    if (protein >= 15 && carbs < 8 && fat >= 15) return 'sery';
    if (carbs >= 60 && protein < 15 && fat < 15) return 'zboza';
    if (kcal < 80 && carbs < 20 && fat < 5) return 'warzywa';
    if (carbs >= 40 && fat >= 15) return 'slodycze';
    if (kcal < 120 && protein >= 3 && fat < 8) return 'nabial';
    return 'polskie-obiadki';
}

function emojiFor(category, name) {
    const n = name.toLowerCase();
    const map = {
        mieso: '🍖',
        nabial: '🥛',
        sery: '🧀',
        warzywa: '🥦',
        owoce: '🍎',
        zboza: '🌾',
        'platki-sniadaniowe': '🥣',
        makarony: '🍝',
        orzechy: '🥜',
        tluszcze: '🧈',
        sosy: '🫙',
        slodycze: '🍪',
        batony: '🍫',
        'batony-proteinowe': '💪',
        fastfood: '🍔',
        zupy: '🍲',
        'polskie-obiadki': '🍽️',
        'mrozone-pizze': '🍕',
        napoje: '🥤',
        alkohole: '🍺',
        przyprawy: '🧂',
    };
    if (/kurczak|indyk/.test(n)) return '🍗';
    if (/jaj/.test(n)) return '🥚';
    if (/banan/.test(n)) return '🍌';
    if (/ryż/.test(n)) return '🍚';
    if (/kawa/.test(n)) return '☕';
    if (/herbata/.test(n)) return '🍵';
    if (/piwo/.test(n)) return '🍺';
    if (/wino/.test(n)) return '🍷';
    return map[category] || '🥗';
}

function servingFor(category, name) {
    const n = name.toLowerCase();
    if (/jajko|jajo /.test(n)) return { servingText: 'sztuka (50g)', servingRatio: 0.5 };
    if (category === 'napoje' || category === 'alkohole') {
        if (/piwo|wino|cola|pepsi|sok |napój|woda /.test(n)) {
            return { servingText: 'szklanka (250 ml)', servingRatio: 2.5 };
        }
        return { servingText: 'porcja (100 ml)', servingRatio: 1 };
    }
    if (category === 'przyprawy') return { servingText: 'łyżeczka (3 g)', servingRatio: 0.03 };
    if (category === 'tluszcze') return { servingText: 'łyżka (10g)', servingRatio: 0.1 };
    if (category === 'orzechy') return { servingText: 'garść (30g)', servingRatio: 0.3 };
    if (category === 'batony' || category === 'batony-proteinowe') {
        return { servingText: 'sztuka (50g)', servingRatio: 0.5 };
    }
    if (category === 'sery') return { servingText: 'plaster (30g)', servingRatio: 0.3 };
    if (category === 'slodycze') return { servingText: 'porcja (40g)', servingRatio: 0.4 };
    if (category === 'zupy' || category === 'polskie-obiadki' || category === 'fastfood') {
        return { servingText: 'porcja (300g)', servingRatio: 3 };
    }
    if (category === 'mrozone-pizze') return { servingText: '1/2 pizzy (175g)', servingRatio: 1.75 };
    if (category === 'makarony' || category === 'zboza' || category === 'platki-sniadaniowe') {
        return { servingText: 'porcja (80g)', servingRatio: 0.8 };
    }
    if (category === 'mieso') return { servingText: 'porcja (120g)', servingRatio: 1.2 };
    if (category === 'nabial') return { servingText: 'porcja (150g)', servingRatio: 1.5 };
    if (category === 'owoce' || category === 'warzywa') {
        return { servingText: 'porcja (100g)', servingRatio: 1 };
    }
    return { servingText: 'porcja (100g)', servingRatio: 1 };
}

function estimateFats(fat, category) {
    const f = Math.max(0, fat || 0);
    let satRatio = 0.35;
    if (category === 'tluszcze') satRatio = /oliwa|olej rzepak|słonecznik|awokado|lnian/.test('') ? 0.15 : 0.45;
    if (category === 'nabial' || category === 'sery') satRatio = 0.55;
    if (category === 'orzechy') satRatio = 0.15;
    if (category === 'mieso') satRatio = 0.35;
    if (category === 'owoce' || category === 'warzywa') satRatio = 0.2;
    const satFat = Math.round(f * satRatio * 10) / 10;
    const unsatFat = Math.max(0, Math.round((f - satFat) * 10) / 10);
    return { satFat, unsatFat };
}

function shouldSkip(name, kcal, protein, carbs, fat) {
    const n = name.toLowerCase();
    if (!name || name.length < 2) return true;
    if (/zgłoś|kalorii \[|białka\[|węglowodany|tłuszcze\[/.test(n)) return true;
    if (/suplement|tabletki|kapsułki|witamina c 1000|magnez b6 tabl/.test(n)) return true;
    if (/^woda$|^sól |sól biała|sól morska/.test(n) && kcal === 0 && protein === 0) return true;
    // Skip ultra-generic duplicates we'll already have
    if (/^olej$|^cukier$|^jajko$|^woda$/.test(n)) return true;
    // Skip restaurant meal combos that aren't shelf products when too vague
    if (/zestaw obiadowy|posiłek nr|dieta box|catering/.test(n)) return true;
    // Require plausible macros
    if (kcal == null || protein == null || carbs == null || fat == null) return true;
    if (kcal < 0 || kcal > 950) return true;
    if (protein < 0 || carbs < 0 || fat < 0) return true;
    if (protein + carbs + fat > 120) return true;
    return false;
}

function isLikelyKnownInPoland(name) {
    const n = name.toLowerCase();
    // Prefer recognizable Polish supermarket / home cooking items
    const brandOrClassic =
        /biedronka|lidl|auchan|carrefour|pilos|piątnica|mlekovita|mlekpol|tarczyński|wedel|goplana|nestle|danone|activia|aktyv|skyr|jogurt|twaróg|kurczak|schab|kiełbas|parówk|szynka|chleb|bułka|kasza|ryż|makaron|pierogi|gołąbki|bigos|żurek|barszcz|rosół|pomidor|ogórek|jabłko|banan|mleko|ser |masło|olej|oliwa|herbata|kawa|cola|pepsi|tymbark|kubuś|tyskie|żywiec|lech|soplica|żubrówka|prince polo|pawełek|grześki|snickers|mars|twix|kitkat|bounty|kinder|oreo|nutella|łosoś|tuńczyk|dorsz|śledź|makrela|fasola|ciecierzyca|soczewica|tofu|hummus|ketchup|majonez|musztarda|pizza|kebab|hamburger|nugget|frytk|skyr|wpc|izol|granola|musli|płatki|otręby|siemię|migdał|orzech|pestki|awokado|truskawk|malin|borówk|winogron|cytryn|pomarańcz|marchew|ziemniak|cebula|czosnek|brokuł|kalafior|szpinak|papryka|sałata|rukola|pieczark|grzyb|miód|czekolad|lody |wafel|herbatnik|ciastk|sernik|babka|makowiec|piernik|golonk|karków|udko|filet|pierś|indyk|wołow|wieprz|cielęc|kaczka|królik|krewet|kalmar|tofu|tempeh|seitan|passata|pesto|salsa|guacamole|tzatziki|vegeta|przypraw|oregano|bazylia|tymianek|kurkum|cynamon|pieprz|sól kuchen/.test(
            n
        );
    // Also allow plain food names without weird codes
    const plainFood = !/[0-9]{4,}/.test(n) && !/xyz|test produkt|sample/.test(n) && n.split(' ').length <= 8;
    return brandOrClassic || plainFood;
}

async function fetchPage(pageNum) {
    const url =
        pageNum <= 1
            ? 'https://kalkulatorkalorii.net/tabela-kalorii'
            : `https://kalkulatorkalorii.net/tabela-kalorii/${pageNum}`;
    const res = await fetch(url, {
        headers: {
            'User-Agent': UA,
            Accept: 'text/html,application/xhtml+xml',
            'Accept-Language': 'pl-PL,pl;q=0.9',
        },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return res.text();
}

function parseProductsFromHtml(html) {
    const out = [];
    const rowRe =
        /<tr>\s*<td[^>]*>\s*<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<td[^>]*>\s*([0-9]+(?:[.,][0-9]+)?)\s*<\/td>\s*<td[^>]*>\s*([0-9]+(?:[.,][0-9]+)?)\s*<\/td>\s*<td[^>]*>\s*([0-9]+(?:[.,][0-9]+)?)\s*<\/td>\s*<td[^>]*>\s*([0-9]+(?:[.,][0-9]+)?)\s*<\/td>/gi;
    let m;
    while ((m = rowRe.exec(html))) {
        const href = m[1];
        const name = normalizeName(m[2].replace(/<[^>]+>/g, ''));
        const kcal = Math.round(parseNum(m[3]));
        const protein = Math.round(parseNum(m[4]) * 10) / 10;
        const carbs = Math.round(parseNum(m[5]) * 10) / 10;
        const fat = Math.round(parseNum(m[6]) * 10) / 10;
        out.push({ href, name, kcal, protein, carbs, fat });
    }
    return out;
}

function loadDb() {
    const raw = fs.readFileSync(rawPath, 'utf8');
    const start = raw.indexOf('[');
    const end = raw.lastIndexOf('];');
    const products = JSON.parse(raw.slice(start, end + 1));
    return { products, start, end };
}

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

async function main() {
    const { products } = loadDb();
    const existingKeys = new Set(products.map((p) => nameKey(p.name)));
    const existingSlugs = new Set(products.map((p) => p.slug || slugify(p.name)));

    console.log(`Baza start: ${products.length} produktów`);
    console.log(`Pobieram do ${PAGES} stron z kalkulatorkalorii.net…`);

    const scraped = [];
    const seenScraped = new Set();

    for (let page = 1; page <= PAGES; page++) {
        try {
            const html = await fetchPage(page);
            const rows = parseProductsFromHtml(html);
            let addedPage = 0;
            for (const row of rows) {
                const key = nameKey(row.name);
                if (!key || seenScraped.has(key)) continue;
                seenScraped.add(key);
                scraped.push(row);
                addedPage++;
            }
            console.log(`  strona ${page}: +${addedPage} (łącznie unikalnych ${scraped.length})`);
            await sleep(180);
        } catch (e) {
            console.warn(`  strona ${page} błąd:`, e.message);
            await sleep(400);
        }
        if (scraped.length > TARGET_ADD * 3) break;
    }

    fs.writeFileSync(dumpPath, JSON.stringify(scraped, null, 2), 'utf8');
    console.log(`Zapisano dump: ${dumpPath} (${scraped.length})`);

    const candidates = [];
    for (const row of scraped) {
        if (shouldSkip(row.name, row.kcal, row.protein, row.carbs, row.fat)) continue;
        if (!isLikelyKnownInPoland(row.name)) continue;
        const key = nameKey(row.name);
        if (existingKeys.has(key)) continue;

        let category = guessCategory(row.name);
        if (!category) category = categoryByMacros(row.kcal, row.protein, row.carbs, row.fat);

        const { satFat, unsatFat } = estimateFats(row.fat, category);
        const serving = servingFor(category, row.name);
        let slug = slugify(row.name);
        if (!slug) continue;
        let base = slug;
        let n = 2;
        while (existingSlugs.has(slug)) {
            slug = `${base}-${n++}`;
        }

        const draft = {
            name: row.name,
            emoji: emojiFor(category, row.name),
            category,
            servingText: serving.servingText,
            servingRatio: serving.servingRatio,
            kcal: row.kcal,
            protein: row.protein,
            carbs: row.carbs,
            fat: row.fat,
            satFat,
            unsatFat,
            micros: '-',
            extra: `Wartości odżywcze na 100 g (orientacyjnie wg tabeli kalorii). Popularny produkt w Polsce.`,
            slug,
        };

        const microsDetail = buildMicrosForProduct(draft);
        draft.microsDetail = microsDetail;
        draft.micros = microsToLabelString(microsDetail) || '-';

        candidates.push(draft);
        existingKeys.add(key);
        existingSlugs.add(slug);

        if (candidates.length >= TARGET_ADD) break;
    }

    console.log(`Kandydaci do dodania: ${candidates.length}`);

    for (const p of candidates) products.push(p);

    fs.writeFileSync(rawPath, `const productsDatabaseRaw = ${JSON.stringify(products)};\n`, 'utf8');
    console.log(`Dodano ${candidates.length}. Razem w bazie: ${products.length}`);

    const byCat = {};
    for (const p of candidates) byCat[p.category] = (byCat[p.category] || 0) + 1;
    console.log('Nowe wg kategorii:', byCat);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
