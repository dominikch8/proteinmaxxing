/**
 * Buduje microsDetail dla wszystkich produktów:
 * 1) silnik curated (USDA/literatura)
 * 2) opcjonalnie Open Food Facts (+ cache)
 * 3) zapis js/product-micros-data.js + aktualizacja products-data-raw.js
 *
 * node scripts/build-product-micros.mjs
 * node scripts/build-product-micros.mjs --fetch-off
 * node scripts/build-product-micros.mjs --fetch-off --limit=50
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildMicrosForProduct, buildMicrosSmart } from './product-micros-engine.mjs';
import {
    MICRO_KEYS_ORDER,
    microsToLabelString,
    cleanMicros,
    roundMicro,
} from './lib/micros-shared.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const rawPath = path.join(root, 'js', 'products-data-raw.js');
const outJsPath = path.join(root, 'js', 'product-micros-data.js');
const cachePath = path.join(root, 'data', 'off-micros-cache.json');
const reportPath = path.join(root, 'data', 'micros-build-report.json');

const fetchOff = process.argv.includes('--fetch-off');
const limitArg = process.argv.find((a) => a.startsWith('--limit='));
const limit = limitArg ? Number(limitArg.split('=')[1]) : Infinity;

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
        .replace(/^-+|-+$/g, '');
}

function loadProducts() {
    const raw = fs.readFileSync(rawPath, 'utf8');
    const start = raw.indexOf('[');
    const end = raw.lastIndexOf('];');
    const products = JSON.parse(raw.slice(start, end + 1));
    return { raw, start, end, products };
}

/** Mapowanie nutriments OFF → nasze klucze (wartości na 100 g). */
function mapOffNutriments(n) {
    if (!n || typeof n !== 'object') return null;
    const get = (...keys) => {
        for (const k of keys) {
            const v = n[k];
            if (typeof v === 'number' && !Number.isNaN(v) && v >= 0) return v;
        }
        return null;
    };

    // Wit. A: OFF często w µg lub IU; preferuj _100g w µg
    let vitA = get('vitamin-a_100g', 'vitamin-a');
    if (vitA != null && vitA > 5000) vitA = vitA / 3.33; // przybliżenie IU→µg RAE

    const out = {
        vitA,
        vitC: get('vitamin-c_100g', 'vitamin-c'),
        vitD: get('vitamin-d_100g', 'vitamin-d'),
        vitE: get('vitamin-e_100g', 'vitamin-e'),
        vitK: get('vitamin-k_100g', 'vitamin-k'),
        b1: get('vitamin-b1_100g', 'vitamin-b1'),
        b2: get('vitamin-b2_100g', 'vitamin-b2'),
        b3: get('vitamin-pp_100g', 'vitamin-pp', 'vitamin-b3_100g'),
        b5: get('pantothenic-acid_100g', 'pantothenic-acid'),
        b6: get('vitamin-b6_100g', 'vitamin-b6'),
        b9: get('vitamin-b9_100g', 'vitamin-b9', 'folates_100g'),
        b12: get('vitamin-b12_100g', 'vitamin-b12'),
        calcium: get('calcium_100g', 'calcium'),
        iron: get('iron_100g', 'iron'),
        magnesium: get('magnesium_100g', 'magnesium'),
        phosphorus: get('phosphorus_100g', 'phosphorus'),
        potassium: get('potassium_100g', 'potassium'),
        zinc: get('zinc_100g', 'zinc'),
        selenium: get('selenium_100g', 'selenium'),
        copper: get('copper_100g', 'copper'),
        manganese: get('manganese_100g', 'manganese'),
        iodine: get('iodine_100g', 'iodine'),
        sodium: get('sodium_100g', 'sodium'),
    };

    // Miedź w OFF często w mg → µg
    if (out.copper != null && out.copper < 50) out.copper = out.copper * 1000;
    // Selen czasem w mg
    if (out.selenium != null && out.selenium < 1) out.selenium = out.selenium * 1000;

    const cleaned = {};
    for (const [k, v] of Object.entries(out)) {
        if (v == null) continue;
        cleaned[k] = v;
    }
    return Object.keys(cleaned).length ? cleaned : null;
}

async function fetchOffForName(name) {
    const q = encodeURIComponent(name);
    const urls = [
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${q}&search_simple=1&action=process&json=1&page_size=5`,
        `https://pl.openfoodfacts.org/cgi/search.pl?search_terms=${q}&search_simple=1&action=process&json=1&page_size=5`,
    ];
    for (const url of urls) {
        try {
            const res = await fetch(url, {
                headers: { 'User-Agent': 'ProteinerMicrosBot/1.0 (proteiner.pl; research)' },
            });
            if (!res.ok) continue;
            const data = await res.json();
            const products = data.products || [];
            let best = null;
            let bestCount = 0;
            for (const p of products) {
                const mapped = mapOffNutriments(p.nutriments);
                if (!mapped) continue;
                const count = Object.keys(mapped).length;
                if (count > bestCount) {
                    bestCount = count;
                    best = mapped;
                }
            }
            if (best && bestCount >= 3) return best;
        } catch {
            /* next */
        }
    }
    return null;
}

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

function mergePreferHigherConfidence(base, off) {
    if (!off) return base;
    const out = { ...base };
    for (const [k, v] of Object.entries(off)) {
        if (typeof v !== 'number') continue;
        // OFF nadpisuje tylko gdy mamy sensowną wartość i brakuje lub jest „goła” kategoria
        if (out[k] == null || out[k] === 0) out[k] = v;
        else {
            // uśrednij lekko z OFF jeśli blisko (nie psuj curated)
            const ratio = v / out[k];
            if (ratio > 0.4 && ratio < 2.5) {
                out[k] = (out[k] * 0.65 + v * 0.35);
            }
        }
    }
    return cleanMicros(out);
}

async function main() {
    const { raw, start, end, products } = loadProducts();
    fs.mkdirSync(path.join(root, 'data'), { recursive: true });

    let cache = {};
    if (fs.existsSync(cachePath)) {
        cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    }

    const bySlug = {};
    const report = { total: products.length, withKeys: 0, fromOff: 0, avgKeys: 0, thin: [] };
    let keySum = 0;
    let fetched = 0;

    for (let i = 0; i < products.length; i++) {
        const p = products[i];
        const slug = p.slug || slugify(p.name);
        p.slug = slug;

        let off = cache[slug];
        if (off === undefined) off = null;
        if (fetchOff && fetched < limit) {
            // Brak wpisu w cache → fetch; {} oznacza „już sprawdzone, brak danych”
            if (!(slug in cache)) {
                process.stdout.write(`OFF ${i + 1}/${products.length} ${slug}\n`);
                try {
                    off = await fetchOffForName(p.name);
                } catch (err) {
                    console.warn('OFF error', slug, err.message || err);
                    off = null;
                }
                cache[slug] = off || {};
                if (off && Object.keys(off).length) report.fromOff++;
                fetched++;
                await sleep(1100);
                if (fetched % 15 === 0) {
                    fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));
                }
            } else if (off && Object.keys(off).length) {
                report.fromOff++;
            }
            if (off && !Object.keys(off).length) off = null;
        }

        const micros = mergePreferHigherConfidence(
            buildMicrosForProduct(p, p.microsDetailOverride || null),
            off
        );
        // Zapewnij pełniejszy profil: dopełnij zerami tylko sensownie — nie;
        // zamiast tego: minimum 8 kluczowych składników z kategorii jeśli brak
        const filled = ensureMinimumCoverage(p, micros);
        bySlug[slug] = filled;
        p.microsDetail = filled;
        p.micros = microsToLabelString(filled);

        const kc = Object.keys(filled).length;
        keySum += kc;
        if (kc >= 8) report.withKeys++;
        else report.thin.push({ slug, keys: kc });
    }

    report.avgKeys = Math.round((keySum / products.length) * 10) / 10;

    fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    const jsOut =
        '/** Auto-generated: mikroskładniki na 100 g (slug → wartości). */\n' +
        'window.PRODUCT_MICROS_DATA = ' +
        JSON.stringify(bySlug) +
        ';\n';
    fs.writeFileSync(outJsPath, jsOut);

    // products-data-raw z microsDetail (atomowy zapis — unika locków Windows)
    const next = raw.slice(0, start) + JSON.stringify(products) + raw.slice(end + 1);
    const tmpRaw = rawPath + '.tmp';
    fs.writeFileSync(tmpRaw, next);
    fs.renameSync(tmpRaw, rawPath);
    fs.copyFileSync(rawPath, path.join(root, 'deploy-bundle/js/products-data-raw.js'));
    fs.copyFileSync(outJsPath, path.join(root, 'deploy-bundle/js/product-micros-data.js'));

    console.log('Done.', report);
}

/** Uzupełnij typowe minerały jeśli profil jest zbyt ubogi. */
function ensureMinimumCoverage(product, micros) {
    const base = buildMicrosForProduct(product);
    const out = { ...base, ...micros };
    return cleanMicros(out);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
