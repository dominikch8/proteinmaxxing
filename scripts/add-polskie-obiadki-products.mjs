/**
 * Dodaje polskie dania / zupy i przypisuje kategorię polskie-obiadki.
 * Uruchom: node scripts/add-polskie-obiadki-products.mjs
 * Potem: node scripts/calculate-serving-protein-prices.mjs && node scripts/generate-product-pages.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const rawPath = path.join(root, 'js', 'products-data-raw.js');

/** Istniejące produkty — tylko zmiana kategorii (i ewent. nazwy). */
const RECATEGORIZE = [
    { from: 'Naleśnik z Nutellą', to: 'Naleśniki z dżemem', category: 'polskie-obiadki', extra: 'Cienkie naleśniki z konfiturą — domowy deser.' }
];

const POLSKIE_OBIADKI_NAMES = new Set([
    'Pierogi ruskie (8 szt.)',
    'Pierogi z mięsem',
    'Pierogi z kapustą i grzybami',
    'Kopytka',
    'Kluski śląskie',
    'Placki ziemniaczane',
    'Pomidorowa z ryżem',
    'Makaron łazanki (suchy)',
    'Gulasz wołowy z makaronem',
    'Rosół z makaronem',
    'Zapiekanka makaronowa (gotowiec)',
    'Golonka wieprzowa',
    'Żeberka wieprzowe',
    'Kotlet mielony (wieprzowo-wołowy)',
    'Schabowy (panierowany)',
    'Zapiekanka',
    'Zupa jarzynowa',
    'Zupa pomidorowa',
    'Zupa pieczarkowa',
    'Zupa ogórkowa',
    'Barszcz czerwony',
    'Żurek',
    'Kapuśniak',
    'Grochówka',
    'Flaki',
    'Gołąbki',
    'Bigos',
    'Pyzy z mięsem',
    'Naleśniki z twarogiem',
    'Naleśniki z dżemem'
]);

/** Nowe wpisy (makro na 100 g — szacunek kuchni domowej / restauracyjnej). */
const NEW_PRODUCTS = [
    {
        name: 'Pierogi z kapustą i grzybami',
        emoji: '🥟',
        category: 'polskie-obiadki',
        servingText: 'porcja (280g)',
        servingRatio: 2.8,
        kcal: 165,
        protein: 5,
        carbs: 26,
        fat: 4,
        satFat: 1.5,
        unsatFat: 2.5,
        micros: 'Błonnik',
        extra: 'Klasyczne pierogi wigilijne — kapusta kiszona i grzyby.'
    },
    {
        name: 'Zupa jarzynowa',
        emoji: '🍲',
        category: 'polskie-obiadki',
        servingText: 'miska (350g)',
        servingRatio: 3.5,
        kcal: 32,
        protein: 1.2,
        carbs: 5,
        fat: 0.8,
        satFat: 0.2,
        unsatFat: 0.6,
        micros: 'Witamina A, Potas',
        extra: 'Lekki bulion z marchewką, porem i ziemniakiem.'
    },
    {
        name: 'Zupa pomidorowa',
        emoji: '🍅',
        category: 'polskie-obiadki',
        servingText: 'miska (350g)',
        servingRatio: 3.5,
        kcal: 42,
        protein: 1.5,
        carbs: 6,
        fat: 1.2,
        satFat: 0.4,
        unsatFat: 0.8,
        micros: 'Likopen, Witamina C',
        extra: 'Kremowa zupa pomidorowa — bez ryżu w porcji.'
    },
    {
        name: 'Zupa pieczarkowa',
        emoji: '🍄',
        category: 'polskie-obiadki',
        servingText: 'miska (350g)',
        servingRatio: 3.5,
        kcal: 48,
        protein: 2,
        carbs: 5,
        fat: 2.5,
        satFat: 1.2,
        unsatFat: 1.3,
        micros: 'Selen, Witamina D',
        extra: 'Krem z pieczarek ze śmietanką.'
    },
    {
        name: 'Zupa ogórkowa',
        emoji: '🥒',
        category: 'polskie-obiadki',
        servingText: 'miska (350g)',
        servingRatio: 3.5,
        kcal: 46,
        protein: 2,
        carbs: 4,
        fat: 2.2,
        satFat: 1.3,
        unsatFat: 0.9,
        micros: 'Potas',
        extra: 'Na kwasie lub ogórkach kiszonych — często z ziemniakami.'
    },
    {
        name: 'Barszcz czerwony',
        emoji: '🫕',
        category: 'polskie-obiadki',
        servingText: 'miska (300g)',
        servingRatio: 3,
        kcal: 38,
        protein: 1.2,
        carbs: 7,
        fat: 0.5,
        satFat: 0.1,
        unsatFat: 0.4,
        micros: 'Błonnik, Foliany',
        extra: 'Z buraków — jasny lub zabielany, często z uszkami.'
    },
    {
        name: 'Żurek',
        emoji: '🍲',
        category: 'polskie-obiadki',
        servingText: 'miska (350g)',
        servingRatio: 3.5,
        kcal: 58,
        protein: 3.5,
        carbs: 5,
        fat: 2.8,
        satFat: 1.2,
        unsatFat: 1.6,
        micros: 'Probiotyki',
        extra: 'Na zakwasie żytnim — często z białą kiełbasą i jajkiem.'
    },
    {
        name: 'Kapuśniak',
        emoji: '🥬',
        category: 'polskie-obiadki',
        servingText: 'miska (350g)',
        servingRatio: 3.5,
        kcal: 52,
        protein: 2.5,
        carbs: 6,
        fat: 2,
        satFat: 0.8,
        unsatFat: 1.2,
        micros: 'Witamina C, Błonnik',
        extra: 'Z kapusty kiszonej — często z mięsem lub grzybami.'
    },
    {
        name: 'Grochówka',
        emoji: '🫘',
        category: 'polskie-obiadki',
        servingText: 'miska (350g)',
        servingRatio: 3.5,
        kcal: 88,
        protein: 6,
        carbs: 11,
        fat: 2.5,
        satFat: 0.8,
        unsatFat: 1.7,
        micros: 'Błonnik, Żelazo',
        extra: 'Gęsta zupa z grochu — często z wędzonym mięsem.'
    },
    {
        name: 'Flaki',
        emoji: '🍲',
        category: 'polskie-obiadki',
        servingText: 'miska (350g)',
        servingRatio: 3.5,
        kcal: 82,
        protein: 11,
        carbs: 3,
        fat: 3.5,
        satFat: 1.5,
        unsatFat: 2,
        micros: 'Żelazo, Cynk',
        extra: 'Tradycyjna zupa z wołowych flaków w rosołach.'
    },
    {
        name: 'Gołąbki',
        emoji: '🥬',
        category: 'polskie-obiadki',
        servingText: 'porcja (250g)',
        servingRatio: 2.5,
        kcal: 118,
        protein: 6,
        carbs: 14,
        fat: 4.5,
        satFat: 1.8,
        unsatFat: 2.7,
        micros: 'Witamina C',
        extra: 'Liście kapusty z farszem ryżowo-mięsnym w sosie.'
    },
    {
        name: 'Bigos',
        emoji: '🥘',
        category: 'polskie-obiadki',
        servingText: 'porcja (300g)',
        servingRatio: 3,
        kcal: 108,
        protein: 7,
        carbs: 8,
        fat: 5.5,
        satFat: 2.2,
        unsatFat: 3.3,
        micros: 'Witamina C, Błonnik',
        extra: 'Kapusta kiszona z mięsem i wędliną — długo duszony.'
    },
    {
        name: 'Pyzy z mięsem',
        emoji: '🥔',
        category: 'polskie-obiadki',
        servingText: 'porcja (250g)',
        servingRatio: 2.5,
        kcal: 158,
        protein: 8,
        carbs: 22,
        fat: 4,
        satFat: 1.5,
        unsatFat: 2.5,
        micros: '-',
        extra: 'Kluski ziemniaczane z farszem mięsnym.'
    },
    {
        name: 'Naleśniki z twarogiem',
        emoji: '🥞',
        category: 'polskie-obiadki',
        servingText: 'porcja (200g)',
        servingRatio: 2,
        kcal: 168,
        protein: 9,
        carbs: 20,
        fat: 5.5,
        satFat: 2.5,
        unsatFat: 3,
        micros: 'Wapń',
        extra: 'Naleśniki z serem twarogowym — słodkie lub z cukrem pudrem.'
    }
];

const rawFile = fs.readFileSync(rawPath, 'utf8');
const match = rawFile.match(/(const productsDatabaseRaw = )(\[[\s\S]*\])(;)/);
if (!match) throw new Error('Cannot parse products-data-raw.js');

const db = JSON.parse(match[2]);
const names = new Set(db.map((p) => p.name));

let added = 0;
let recategorized = 0;

for (const row of RECATEGORIZE) {
    const p = db.find((x) => x.name === row.from);
    if (!p) {
        console.warn('Brak produktu do przeniesienia:', row.from);
        continue;
    }
    if (row.to) p.name = row.to;
    p.category = row.category;
    if (row.extra) p.extra = row.extra;
    names.delete(row.from);
    names.add(p.name);
    recategorized++;
}

for (const np of NEW_PRODUCTS) {
    if (names.has(np.name)) {
        const ex = db.find((p) => p.name === np.name);
        if (ex.category !== 'polskie-obiadki') {
            ex.category = 'polskie-obiadki';
            recategorized++;
        }
        continue;
    }
    db.push(np);
    names.add(np.name);
    added++;
}

for (const p of db) {
    if (!POLSKIE_OBIADKI_NAMES.has(p.name)) continue;
    if (p.category !== 'polskie-obiadki') {
        p.category = 'polskie-obiadki';
        recategorized++;
    }
}

fs.writeFileSync(rawPath, `${match[1]}${JSON.stringify(db)}${match[3]}\n`, 'utf8');
console.log(`Dodano ${added} produktów, kategoria zaktualizowana (${recategorized} zmian nazwy/kategorii). Razem: ${db.length}.`);
