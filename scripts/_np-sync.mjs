/**
 * Synchronizuje bazę (js/products-data-raw.js) z scripts/new-products-200.json:
 *  - usuwa produkty, które mają pricePerKgRetail, ale zniknęły z JSON (duplikaty),
 *    wraz z ich stronami (produkty/*.html) i grafikami (images/products/*),
 *  - dodaje brakujące produkty z JSON,
 *  - nadpisuje makra, mikro, porcje i opis dla wszystkich 200 (nadpisuje dane z JSON).
 * Uruchom: node scripts/_np-sync.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildMicrosForProduct } from './product-micros-engine.mjs';
import { cleanMicros, microsToLabelString } from './lib/micros-shared.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const rawPath = path.join(root, 'js', 'products-data-raw.js');
const jsonPath = path.join(root, 'scripts', 'new-products-200.json');

function slugify(name) {
    return String(name).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/ą/g, 'a').replace(/ć/g, 'c').replace(/ę/g, 'e').replace(/ł/g, 'l')
        .replace(/ń/g, 'n').replace(/ó/g, 'o').replace(/ś/g, 's').replace(/ź/g, 'z').replace(/ż/g, 'z')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

const raw = fs.readFileSync(rawPath, 'utf8');
const start = raw.indexOf('[');
const end = raw.lastIndexOf('];');
const db = JSON.parse(raw.slice(start, end + 1));
const rows = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const wanted = new Set(rows.map((r) => r.name));

// ── 1. Usuń z bazy produkty z tej partii, których nie ma już w JSON ──────────
const toDelete = db.filter((p) => p.pricePerKgRetail != null && !wanted.has(p.name));
const delNames = toDelete.map((p) => p.name);
const delSlugs = new Set(toDelete.map((p) => p.slug || slugify(p.name)));
const keptDb = db.filter((p) => !delNames.includes(p.name));

const removedFiles = [];
for (const slug of delSlugs) {
    for (const rel of [
        `produkty/${slug}.html`,
        `images/products/${slug}.jpg`,
        `images/products/${slug}.webp`,
        `images/products/${slug}.png`,
        `deploy-bundle/produkty/${slug}.html`,
        `deploy-bundle/images/products/${slug}.jpg`,
        `deploy-bundle/images/products/${slug}.webp`,
        `deploy-bundle/images/products/${slug}.png`
    ]) {
        const fp = path.join(root, rel);
        if (fs.existsSync(fp)) { fs.unlinkSync(fp); removedFiles.push(rel); }
    }
}

// ── 2. Dodaj / zsynchronizuj 200 produktów z JSON ───────────────────────────
const slugSet = new Set(keptDb.map((p) => p.slug || slugify(p.name)));
const nameIndex = new Map(keptDb.map((p, i) => [p.name, i]));

function uniqueSlug(base, category) {
    let slug = base;
    if (slugSet.has(slug)) slug = `${base}-${category}`;
    let n = 2;
    while (slugSet.has(slug)) slug = `${base}-${n++}`;
    slugSet.add(slug);
    return slug;
}

let updated = 0, inserted = 0;
for (const row of rows) {
    const { micros: curated, pricePerKg, ...rest } = row;
    const satFat = rest.satFat ?? 0;
    const unsatFat = rest.unsatFat ?? Math.max(0, Math.round((rest.fat - satFat) * 10) / 10);
    const detail = cleanMicros({ ...buildMicrosForProduct({ ...rest, satFat, unsatFat }), ...(curated || {}) });

    const idx = nameIndex.get(rest.name);
    const target = idx != null ? keptDb[idx] : null;
    if (target) {
        target.emoji = rest.emoji || target.emoji;
        target.category = rest.category;
        target.servingText = rest.servingText;
        target.servingRatio = rest.servingRatio;
        target.kcal = rest.kcal;
        target.protein = rest.protein;
        target.carbs = rest.carbs;
        target.fat = rest.fat;
        target.satFat = satFat;
        target.unsatFat = unsatFat;
        target.micros = microsToLabelString(detail);
        target.microsDetail = detail;
        if (rest.extra) target.extra = rest.extra;
        if (pricePerKg != null) target.pricePerKgRetail = pricePerKg;
        updated++;
    } else {
        const product = {
            name: rest.name,
            emoji: rest.emoji || '🍽️',
            category: rest.category,
            servingText: rest.servingText,
            servingRatio: rest.servingRatio,
            kcal: rest.kcal,
            protein: rest.protein,
            carbs: rest.carbs,
            fat: rest.fat,
            satFat,
            unsatFat,
            micros: microsToLabelString(detail),
            extra: rest.extra || '',
            microsDetail: detail,
            slug: uniqueSlug(slugify(rest.name), rest.category)
        };
        if (pricePerKg != null) product.pricePerKgRetail = pricePerKg;
        keptDb.push(product);
        nameIndex.set(product.name, keptDb.length - 1);
        inserted++;
    }
}

fs.writeFileSync(rawPath, `const productsDatabaseRaw = ${JSON.stringify(keptDb)};\n`, 'utf8');

console.log(`Usunięto z bazy: ${toDelete.length}` + (delNames.length ? `\n  ${delNames.join(', ')}` : ''));
console.log(`Usunięto plików: ${removedFiles.length}`);
console.log(`Zaktualizowano (sync): ${updated}, dodano: ${inserted}`);
console.log(`Baza teraz: ${keptDb.length}`);