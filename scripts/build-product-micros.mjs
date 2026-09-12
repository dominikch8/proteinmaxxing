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

/** Mapowanie nutriments OFF → nasze klucze (wartości na 100 g, z konwersją jednostek). */
const MICRO_UNIT = {
    vitA: 'µg', vitC: 'mg', vitD: 'µg', vitE: 'mg', vitK: 'µg',
    b1: 'mg', b2: 'mg', b3: 'mg', b5: 'mg', b6: 'mg', b9: 'µg', b12: 'µg',
    choline: 'mg', calcium: 'mg', iron: 'mg', magnesium: 'mg', phosphorus: 'mg',
    potassium: 'mg', zinc: 'mg', selenium: 'µg', copper: 'µg', manganese: 'mg',
    iodine: 'µg', sodium: 'mg',
};

const OFF_FIELD = {
    vitA: ['vitamin-a', 'vitamin-a_100g'],
    vitC: ['vitamin-c', 'vitamin-c_100g'],
    vitD: ['vitamin-d', 'vitamin-d_100g'],
    vitE: ['vitamin-e', 'vitamin-e_100g'],
    vitK: ['vitamin-k', 'vitamin-k_100g'],
    b1: ['vitamin-b1', 'vitamin-b1_100g'],
    b2: ['vitamin-b2', 'vitamin-b2_100g'],
    b3: ['vitamin-pp', 'vitamin-pp_100g', 'vitamin-b3', 'vitamin-b3_100g'],
    b5: ['pantothenic-acid', 'pantothenic-acid_100g'],
    b6: ['vitamin-b6', 'vitamin-b6_100g'],
    b9: ['vitamin-b9', 'vitamin-b9_100g', 'folates', 'folates_100g'],
    b12: ['vitamin-b12', 'vitamin-b12_100g'],
    choline: ['choline', 'choline_100g'],
    calcium: ['calcium', 'calcium_100g'],
    iron: ['iron', 'iron_100g'],
    magnesium: ['magnesium', 'magnesium_100g'],
    phosphorus: ['phosphorus', 'phosphorus_100g'],
    potassium: ['potassium', 'potassium_100g'],
    zinc: ['zinc', 'zinc_100g'],
    selenium: ['selenium', 'selenium_100g'],
    copper: ['copper', 'copper_100g'],
    manganese: ['manganese', 'manganese_100g'],
    iodine: ['iodine', 'iodine_100g'],
    sodium: ['sodium', 'sodium_100g'],
};

function toGrams(value, unit) {
    if (value == null) return null;
    if (!unit) return null; // brak jednostki — bezpieczniej pominąć niż zgadywać skalę
    const u = String(unit).toLowerCase().trim();
    if (u === 'g') return value;
    if (u === 'mg') return value / 1000;
    if (u === 'µg' || u === 'ug' || u === 'mcg') return value / 1e6;
    if (u === 'iu') return value; // IU — obsłużone osobno dla wit A poniżej
    return null;
}

function mapOffNutriments(n) {
    if (!n || typeof n !== 'object') return null;
    const out = {};
    for (const [key, fields] of Object.entries(OFF_FIELD)) {
        let raw = null;
        let unit = null;
        for (const f of fields) {
            if (typeof n[f] === 'number' && !Number.isNaN(n[f])) {
                raw = n[f];
                unit = n[f + '_unit'] || n[f.replace(/_100g$/, '') + '_unit'] || null;
                break;
            }
        }
        if (raw == null) continue;
        const baseGrams = toGrams(raw, unit);
        if (baseGrams == null || baseGrams < 0) continue;
        const value = MICRO_UNIT[key] === 'µg' ? baseGrams * 1e6 : baseGrams * 1000;
        out[key] = value;
    }
    // Wit. A: OFF bywa w IU — przybliżenie IU → µg RAE (÷3.33)
    if (out.vitA != null && out.vitA > 5000) out.vitA = out.vitA / 3.33;
    return Object.keys(out).length ? out : null;
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
    const report = { total: products.length, withKeys: 0, fromOff: 0, avgKeys: 0, thin: [], sources: {} };
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

        const smart = buildMicrosSmart(p);
        let micros;
        let source;
        if (p.microsDetailOverride && Object.keys(p.microsDetailOverride).length) {
            micros = cleanMicros(p.microsDetailOverride);
            source = 'override';
        } else if (off && Object.keys(off).length >= 3) {
            const offClean = cleanMicros(off);
            if (smart.source === 'curated' || smart.source === 'lean') {
                // Profil zweryfikowany wygrywa z (nieraz błędnym) OFF; OFF tylko uzupełnia braki.
                const merged = { ...smart.micros };
                for (const [k, v] of Object.entries(offClean)) {
                    if (merged[k] == null) merged[k] = v;
                }
                micros = cleanMicros(merged);
                source = smart.source;
            } else {
                // Szacunek jest gruby — realne dane z internetu mają pierwszeństwo.
                const merged = { ...smart.micros };
                for (const [k, v] of Object.entries(offClean)) merged[k] = v;
                micros = cleanMicros(merged);
                source = 'off';
            }
        } else {
            micros = smart.micros || {};
            source = Object.keys(micros).length ? smart.source : 'none';
        }
        bySlug[slug] = micros;
        p.microsDetail = Object.keys(micros).length ? micros : {};
        p.microsSource = source;
        p.micros = microsToLabelString(micros);
        report.sources[source] = (report.sources[source] || 0) + 1;

        const kc = Object.keys(micros).length;
        keySum += kc;
        if (kc >= 8) report.withKeys++;
        else report.thin.push({ slug, keys: kc, source });
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

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
