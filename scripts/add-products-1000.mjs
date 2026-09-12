/**
 * Dodaje ~1000 popularnych polskich produktów spożywczych do bazy
 * js/products-data-raw.js. Format wpisu (krótki tuple):
 *   [name, emoji, category, servingText, servingRatio, protein, carbs, fat, satFat, extra?]
 * Makro w przeliczeniu na 100 g. kcal i unsatFat liczone automatycznie.
 *
 * Uruchom:
 *   node scripts/add-products-1000.mjs            # dry-run: raport + ostrzeżenia
 *   node scripts/add-products-1000.mjs --write    # dopisuje do bazy
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const rawPath = path.join(root, 'js', 'products-data-raw.js');

const CAT = new Set([
    'mieso', 'nabial', 'sery', 'warzywa', 'owoce', 'zboza', 'platki-sniadaniowe',
    'polskie-obiadki', 'zupy', 'orzechy', 'tluszcze', 'makarony', 'mrozone-pizze',
    'fastfood', 'slodycze', 'batony', 'batony-proteinowe', 'sosy', 'napoje',
    'alkohole', 'przyprawy'
]);

// [name, emoji, category, servingText, servingRatio, protein, carbs, fat, satFat, extra?]
const NEW = [];
/*__DATA__*/

function slugify(name) {
    return String(name)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/ą/g, 'a').replace(/ć/g, 'c').replace(/ę/g, 'e')
        .replace(/ł/g, 'l').replace(/ń/g, 'n').replace(/ó/g, 'o')
        .replace(/ś/g, 's').replace(/ź/g, 'z').replace(/ż/g, 'z')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function r1(n) { return Math.round(n * 10) / 10; }

function build(row) {
    const [name, emoji, category, servingText, servingRatio, protein, carbs, fat, satFat, extra] = row;
    const kcal = Math.round(protein * 4 + carbs * 4 + fat * 9);
    const sat = r1(satFat);
    const unsat = r1(Math.max(0, fat - satFat));
    const o = {
        name,
        emoji,
        category,
        servingText,
        servingRatio,
        kcal,
        protein: r1(protein),
        carbs: r1(carbs),
        fat: r1(fat),
        satFat: sat,
        unsatFat: unsat
    };
    if (extra) o.extra = extra;
    return o;
}

function loadDb() {
    const raw = fs.readFileSync(rawPath, 'utf8');
    const start = raw.indexOf('[');
    const end = raw.lastIndexOf('];');
    const products = JSON.parse(raw.slice(start, end + 1));
    return { raw, start, end, products };
}

const { raw, start, end, products: db } = loadDb();

const names = new Set(db.map((p) => String(p.name || '').trim().toLowerCase()));
const slugs = new Set(db.map((p) => String(p.slug || '')));
const incoming = [];
const dupes = [];
const badCat = [];
const macroWarn = [];
const seen = new Set();

for (const row of NEW) {
    if (!row || !row[0]) continue;
    const name = row[0];
    const lower = name.trim().toLowerCase();
    if (names.has(lower)) { dupes.push(`${name} (już w bazie)`); continue; }
    if (seen.has(lower)) { dupes.push(`${name} (duplikat w pliku)`); continue; }
    if (!CAT.has(row[2])) { badCat.push(`${name} → ${row[2]}`); continue; }
    seen.add(lower);

    const p = build(row);
    // unikalny slug
    let base = slugify(p.name);
    let slug = base;
    let n = 2;
    while (slugs.has(slug)) slug = `${base}-${n++}`;
    slugs.add(slug);
    p.slug = slug;

    // kontrola spójności makro (kcal wg makro, sat+unsat <= fat)
    if (p.satFat + p.unsatFat > p.fat + 0.65) {
        macroWarn.push(`${p.name}: sat+unsat ${(p.satFat + p.unsatFat).toFixed(1)} > fat ${p.fat}`);
    }

    incoming.push(p);
}

const byCat = {};
for (const p of incoming) byCat[p.category] = (byCat[p.category] || 0) + 1;

console.log(`Kandydatów: ${NEW.length} | do dopisania: ${incoming.length} | baza: ${db.length} → ${db.length + incoming.length}`);
console.log('Rozkład:', Object.keys(byCat).map((c) => `${c}=${byCat[c]}`).join(' '));
if (dupes.length) console.log(`DUPLIKATY (${dupes.length}):\n  ` + dupes.join('\n  '));
if (badCat.length) console.log(`ZŁE KATEGORIE (${badCat.length}):\n  ` + badCat.join('\n  '));
if (macroWarn.length) console.log(`OSTRZEŻENIA MAKRO (${macroWarn.length}):\n  ` + macroWarn.join('\n  '));

if (!process.argv.includes('--write')) {
    console.log('\nDry-run. Dodaj --write aby zapisać.');
    process.exit(0);
}

if (dupes.length || badCat.length) {
    console.error('\nPrzerwano: popraw duplikaty/złe kategorie.');
    process.exit(1);
}

const next = [...db, ...incoming];
const out = raw.slice(0, start) + JSON.stringify(next) + raw.slice(end + 1);
const tmp = rawPath + '.tmp';
fs.writeFileSync(tmp, out, 'utf8');
fs.renameSync(tmp, rawPath);
console.log(`\nZapisano. Baza: ${db.length} → ${next.length}`);
