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
const NEW = [
    ['Szynka wieprzowa gotowana', '🍖', 'mieso', 'plaster (20g)', 0.2, 21, 1, 6, 2.2, 'Uniwersalna wędlina do kanapek.'],
    ['Szynka z indyka', '🦃', 'mieso', 'plaster (20g)', 0.2, 21, 1, 2, 0.7, 'Chudsza alternatywa dla wieprzowiny.'],
    ['Polędwica sopocka', '🍖', 'mieso', 'plaster (20g)', 0.2, 21, 1, 7, 2.8, 'Delikatna wędlina wieprzowa.'],
    ['Polędwica z kurczaka', '🍗', 'mieso', 'plaster (20g)', 0.2, 19, 2, 2.5, 0.8, 'Pieczona polędwica drobiowa.'],
    ['Szynka konserwowa', '🥫', 'mieso', 'plaster (20g)', 0.2, 16, 2, 4, 1.4, 'Szynka w puszce, drobno mielona.'],
    ['Kiełbasa szynkowa', '🌭', 'mieso', 'plaster (30g)', 0.3, 16, 2, 20, 7.5, 'Kiełbasa o wysokiej zawartości mięsa.'],
    ['Kiełbasa śląska', '🌭', 'mieso', 'sztuka (100g)', 1, 14, 2, 26, 10, 'Klasyczna biała kiełbasa śląska.'],
    ['Kiełbasa żywiecka', '🌭', 'mieso', 'sztuka (100g)', 1, 15, 2, 24, 9.5, 'Pieczona kiełbasa wieprzowa.'],
    ['Kiełbasa krakowska sucha', '🌭', 'mieso', 'plaster (25g)', 0.25, 20, 2, 33, 12, 'Sucha kiełbasa krakowska.'],
    ['Kiełbasa toruńska', '🌭', 'mieso', 'plaster (25g)', 0.25, 18, 2, 30, 11, 'Mielona kiełbasa toruńska.'],
    ['Kiełbasa jałowcowa', '🌭', 'mieso', 'plaster (25g)', 0.25, 17, 2, 28, 10, 'Wędzona kiełbasa z jałowcem.'],
    ['Kiełbasa myśliwska', '🌭', 'mieso', 'plaster (25g)', 0.25, 18, 1, 31, 11.5, 'Twarda kiełbasa myśliwska.'],
    ['Kiełbasa biała surowa', '🌭', 'mieso', 'sztuka (100g)', 1, 15, 2, 24, 9.5, 'Surowa biała kiełbasa na wielkanoc.'],
    ['Parówki wieprzowe', '🌭', 'mieso', 'sztuka (40g)', 0.4, 12, 3, 22, 8.5, 'Parówki parzone wieprzowe.'],
    ['Parówki z szynki', '🌭', 'mieso', 'sztuka (40g)', 0.4, 13, 2, 18, 7, 'Parówki z dodatkiem szynki.'],
    ['Parówki drobiowe', '🐔', 'mieso', 'sztuka (40g)', 0.4, 12, 3, 15, 5.5, 'Lżejsze parówki z kurczaka.'],
    ['Kabanosy', '🌭', 'mieso', 'sztuka (25g)', 0.25, 19, 2, 32, 12, 'Cienkie suszone kiełbaski.'],
    ['Kabanosy drobiowe', '🐔', 'mieso', 'sztuka (25g)', 0.25, 20, 2, 22, 8, 'Kabanosy z mięsa kurczaka.'],
    ['Mortadela', '🍖', 'mieso', 'plaster (25g)', 0.25, 12, 3, 25, 9, 'Mielona wędlina zbliżona do parówkowej.'],
    ['Pasztet wieprzowy', '🥫', 'mieso', 'plaster (30g)', 0.3, 10, 8, 24, 8.5, 'Pieczony pasztet z mięsa.'],
    ['Pasztet drobiowy', '🐔', 'mieso', 'plaster (30g)', 0.3, 11, 7, 20, 7, 'Pasztet z mięsa drobiowego.'],
    ['Pasztet z dziczyzny', '🦌', 'mieso', 'plaster (30g)', 0.3, 12, 6, 21, 7.5, 'Pasztet z dzika lub jelenia.'],
    ['Baleron', '🍖', 'mieso', 'plaster (25g)', 0.25, 21, 1, 8, 3, 'Pieczona wędlina z szynki.'],
    ['Boczek wędzony parzony', '🥓', 'mieso', 'plaster (30g)', 0.3, 9, 1, 53, 20, 'Tłusta wędlina z boczku.'],
    ['Boczek pieczony', '🥓', 'mieso', 'plaster (30g)', 0.3, 25, 1, 20, 7.5, 'Upieczony boczek, chudszy po wytopieniu.'],
    ['Kaszanka', '🍖', 'mieso', 'sztuka (150g)', 1.5, 12, 15, 25, 9, 'Kasza gryczana z krwią i podrobami.'],
    ['Kaszanka z wątróbką', '🍖', 'mieso', 'sztuka (150g)', 1.5, 13, 14, 24, 8.5, 'Kaszanka wzbogacona wątróbką.'],
    ['Salceson', '🍖', 'mieso', 'plaster (30g)', 0.3, 14, 4, 22, 8, 'Mielona wędlina z podrobami.'],
    ['Szynka z kurczaka (plastry)', '🍗', 'mieso', 'plaster (20g)', 0.2, 17, 2, 3, 0.9, 'Plastry szynki z piersi kurczaka.'],
    ['Szynka drobiowa', '🐔', 'mieso', 'plaster (20g)', 0.2, 17, 1, 3, 1, 'Drobna wędlina drobiowa.'],
    ['Chrupiące skrzydełka z kurczaka', '🍗', 'mieso', 'sztuka (100g)', 1, 22, 8, 14, 4, 'Skrzydełka w panierce lub marynacie.'],
    ['Skrzydełka z kurczaka', '🍗', 'mieso', 'sztuka (150g)', 1.5, 19, 0, 15, 4.5, 'Surowa porcja skrzydełek ze skórą.'],
    ['Serce drobiowe', '🐔', 'mieso', 'porcja (150g)', 1.5, 18, 1, 9, 2.8, 'Podroby bogate w żelazo.'],
    ['Żołądek wieprzowy', '🐷', 'mieso', 'porcja (150g)', 1.5, 16, 1, 8, 2.5, 'Tradycyjny polski podrób.'],
    ['Flaki wołowe', '🐄', 'mieso', 'porcja (150g)', 1.5, 15, 1, 10, 4, 'Podstawa tradycyjnej zupy flaki.'],
    ['Serca wieprzowe', '🐷', 'mieso', 'porcja (150g)', 1.5, 17, 1, 5, 1.8, 'Chude podroby wieprzowe.'],
    ['Nerki wieprzowe', '🐷', 'mieso', 'porcja (150g)', 1.5, 16, 1, 5, 1.8, 'Podroby o intensywnym smaku.'],
    ['Mięso mielone wieprzowo-wołowe', '🥩', 'mieso', 'porcja (150g)', 1.5, 18, 0, 20, 8, 'Mieszanka mielona na kotlety.'],
    ['Mięso mielone z indyka', '🦃', 'mieso', 'porcja (150g)', 1.5, 19, 0, 8, 2.5, 'Chude mielone z indyka.'],
    ['Mięso drobiowe mielone', '🐔', 'mieso', 'porcja (150g)', 1.5, 18, 0, 10, 3, 'Mielone z kurczaka.'],
/*__DATA__*/
];

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
