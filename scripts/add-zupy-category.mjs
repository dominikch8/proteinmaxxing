/**
 * Kategoria „zupy” — przeniesienie istniejących zup i dodanie popularnych.
 * Uruchom: node scripts/add-zupy-category.mjs
 * Potem: node scripts/calculate-serving-protein-prices.mjs && node scripts/generate-product-pages.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const rawPath = path.join(root, 'js', 'products-data-raw.js');

const MOVE_TO_ZUPY = new Set([
    'Rosół z makaronem',
    'Pomidorowa z ryżem',
    'Zupa jarzynowa',
    'Zupa pomidorowa',
    'Zupa pieczarkowa',
    'Zupa ogórkowa',
    'Barszcz czerwony',
    'Żurek',
    'Kapuśniak',
    'Grochówka',
    'Flaki',
    'Zupa chińska instant',
    'Ramen instant (zupka)',
    'Ramen z bulionem (miska)'
]);

const NEW_ZUPY = [
    {
        name: 'Krupnik',
        emoji: '🍲',
        category: 'zupy',
        servingText: 'miska (350g)',
        servingRatio: 3.5,
        kcal: 72,
        protein: 4,
        carbs: 9,
        fat: 2.5,
        satFat: 1,
        unsatFat: 1.5,
        micros: 'Błonnik, Żelazo',
        extra: 'Zupa na bulionie z kaszą jęczmienną i warzywami korzeniowymi.'
    },
    {
        name: 'Zupa fasolowa',
        emoji: '🫘',
        category: 'zupy',
        servingText: 'miska (350g)',
        servingRatio: 3.5,
        kcal: 78,
        protein: 5,
        carbs: 10,
        fat: 2,
        satFat: 0.6,
        unsatFat: 1.4,
        micros: 'Błonnik, Potas',
        extra: 'Gęsta zupa z białej fasoli — często z wędzonym mięsem.'
    },
    {
        name: 'Barszcz biały',
        emoji: '🍲',
        category: 'zupy',
        servingText: 'miska (300g)',
        servingRatio: 3,
        kcal: 42,
        protein: 2,
        carbs: 5,
        fat: 1.8,
        satFat: 0.8,
        unsatFat: 1,
        micros: 'Witamina C',
        extra: 'Zabielany barszcz na zakwasie — często z białą kiełbasą.'
    },
    {
        name: 'Zupa szczawiowa',
        emoji: '🥬',
        category: 'zupy',
        servingText: 'miska (350g)',
        servingRatio: 3.5,
        kcal: 48,
        protein: 2.5,
        carbs: 5,
        fat: 2.2,
        satFat: 1.2,
        unsatFat: 1,
        micros: 'Witamina A, Żelazo',
        extra: 'Kwaśna zupa ze szczawiu — często z jajkiem na twardo.'
    },
    {
        name: 'Zupa cebulowa',
        emoji: '🧅',
        category: 'zupy',
        servingText: 'miska (350g)',
        servingRatio: 3.5,
        kcal: 55,
        protein: 3,
        carbs: 7,
        fat: 2,
        satFat: 1.2,
        unsatFat: 0.8,
        micros: '-',
        extra: 'Karmelizowana cebula w bulionie — często z grzanką i serem.'
    },
    {
        name: 'Krem brokułowy',
        emoji: '🥦',
        category: 'zupy',
        servingText: 'miska (350g)',
        servingRatio: 3.5,
        kcal: 52,
        protein: 2.5,
        carbs: 6,
        fat: 2.5,
        satFat: 1.5,
        unsatFat: 1,
        micros: 'Witamina C, Kwas foliowy',
        extra: 'Kremowa zupa z brokułów ze śmietanką.'
    },
    {
        name: 'Minestrone',
        emoji: '🍅',
        category: 'zupy',
        servingText: 'miska (350g)',
        servingRatio: 3.5,
        kcal: 45,
        protein: 2,
        carbs: 7,
        fat: 1.2,
        satFat: 0.3,
        unsatFat: 0.9,
        micros: 'Witamina C, Likopen',
        extra: 'Włoska zupa warzywna z makaronem i fasolką.'
    },
    {
        name: 'Pho (zupa ryżowa)',
        emoji: '🍜',
        category: 'zupy',
        servingText: 'miska (450g)',
        servingRatio: 4.5,
        kcal: 55,
        protein: 4,
        carbs: 8,
        fat: 1.2,
        satFat: 0.4,
        unsatFat: 0.8,
        micros: '-',
        extra: 'Wietnamski bulion z wołowiną, ryżowym makaronem i ziołami.'
    }
];

const rawFile = fs.readFileSync(rawPath, 'utf8');
const match = rawFile.match(/(const productsDatabaseRaw = )(\[[\s\S]*\])(;)/);
if (!match) throw new Error('Cannot parse products-data-raw.js');

const db = JSON.parse(match[2]);
const names = new Set(db.map((p) => p.name));
let moved = 0;
let added = 0;

for (const p of db) {
    if (!MOVE_TO_ZUPY.has(p.name)) continue;
    if (p.category !== 'zupy') {
        p.category = 'zupy';
        moved++;
    }
}

for (const np of NEW_ZUPY) {
    if (names.has(np.name)) continue;
    db.push(np);
    names.add(np.name);
    added++;
}

fs.writeFileSync(rawPath, `${match[1]}${JSON.stringify(db)}${match[3]}\n`, 'utf8');
console.log(`Przeniesiono do zupy: ${moved}, dodano nowych: ${added}, produktów razem: ${db.length}`);
