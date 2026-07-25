/**
 * Kategoria „batony” + popularne brandingowe batony.
 * node scripts/add-batony-products.mjs
 * Potem: node scripts/calculate-serving-protein-prices.mjs
 *         node scripts/build-products-lite.mjs
 *         node scripts/generate-product-pages.mjs
 *         node scripts/rebuild-all-product-photos.mjs --force-ai --slug=...
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const rawPath = path.join(root, 'js', 'products-data-raw.js');

/** Istniejące batony → kategoria batony (+ ewent. rename / slug). */
const RECATEGORIZE = [
    {
        from: 'Baton (np. Snickers)',
        to: 'Snickers',
        category: 'batony',
        slug: 'baton-np-snickers',
        extra: 'Klasyczny baton z nugatą, karmelem i orzeszkami w mlecznej czekoladzie.',
    },
    { from: 'Baton proteinowy', category: 'batony' },
    { from: 'Kinder Bueno', category: 'batony' },
    { from: 'Mars', category: 'batony' },
    { from: 'Twix', category: 'batony' },
    { from: 'Bounty', category: 'batony' },
    { from: 'Kit Kat', category: 'batony' },
    { from: 'Prince Polo', category: 'batony' },
    { from: 'Lion', category: 'batony' },
    { from: 'Milky Way', category: 'batony' },
    { from: '3 BIT', to: '3 Bit', category: 'batony', slug: '3-bit' },
];

/** Nowe popularne batony (makro orientacyjne na 100 g). */
const NEW_PRODUCTS = [
    {
        name: 'Nuts',
        emoji: '🍫',
        category: 'batony',
        servingText: 'sztuka (42g)',
        servingRatio: 0.42,
        kcal: 510,
        protein: 9,
        carbs: 52,
        fat: 29,
        satFat: 10,
        unsatFat: 19,
        micros: '-',
        extra: 'Baton Nestlé z orzechami laskowymi i karmelem w czekoladzie.',
    },
    {
        name: 'Pawełek',
        emoji: '🍫',
        category: 'batony',
        servingText: 'sztuka (45g)',
        servingRatio: 0.45,
        kcal: 480,
        protein: 5,
        carbs: 60,
        fat: 24,
        satFat: 14,
        unsatFat: 10,
        micros: '-',
        extra: 'Polski baton Wedel z nadzieniem toffi w czekoladzie.',
    },
    {
        name: 'Grześki',
        emoji: '🍫',
        category: 'batony',
        servingText: 'sztuka (36g)',
        servingRatio: 0.36,
        kcal: 530,
        protein: 6,
        carbs: 58,
        fat: 30,
        satFat: 16,
        unsatFat: 14,
        micros: '-',
        extra: 'Waflowy baton z czekoladą — klasyk polskich półek.',
    },
    {
        name: 'Knoppers',
        emoji: '🍫',
        category: 'batony',
        servingText: 'sztuka (25g)',
        servingRatio: 0.25,
        kcal: 550,
        protein: 8,
        carbs: 50,
        fat: 34,
        satFat: 18,
        unsatFat: 16,
        micros: '-',
        extra: 'Chrupiący wafelek z kremem orzechowo-mlecznym.',
    },
    {
        name: 'Duplo',
        emoji: '🍫',
        category: 'batony',
        servingText: 'sztuka (18g)',
        servingRatio: 0.18,
        kcal: 550,
        protein: 6,
        carbs: 55,
        fat: 33,
        satFat: 18,
        unsatFat: 15,
        micros: '-',
        extra: 'Podwójny wafelek Ferrero w mlecznej czekoladzie.',
    },
    {
        name: 'Kinder Maxi King',
        emoji: '🍫',
        category: 'batony',
        servingText: 'sztuka (35g)',
        servingRatio: 0.35,
        kcal: 480,
        protein: 6,
        carbs: 45,
        fat: 30,
        satFat: 14,
        unsatFat: 16,
        micros: '-',
        extra: 'Kremowy baton Kinder z orzechami i czekoladą.',
    },
    {
        name: 'Kinder Country',
        emoji: '🍫',
        category: 'batony',
        servingText: 'sztuka (24g)',
        servingRatio: 0.24,
        kcal: 470,
        protein: 7,
        carbs: 55,
        fat: 24,
        satFat: 14,
        unsatFat: 10,
        micros: '-',
        extra: 'Baton Kinder z mlekiem i chrupkami zbożowymi.',
    },
    {
        name: 'Picnic',
        emoji: '🍫',
        category: 'batony',
        servingText: 'sztuka (48g)',
        servingRatio: 0.48,
        kcal: 490,
        protein: 7,
        carbs: 55,
        fat: 26,
        satFat: 12,
        unsatFat: 14,
        micros: '-',
        extra: 'Baton z orzeszkami, rodzynkami i karmelem w czekoladzie.',
    },
    {
        name: 'Corny Big',
        emoji: '🍫',
        category: 'batony',
        servingText: 'sztuka (50g)',
        servingRatio: 0.5,
        kcal: 410,
        protein: 6,
        carbs: 65,
        fat: 14,
        satFat: 5,
        unsatFat: 9,
        micros: 'Błonnik',
        extra: 'Baton zbożowy z miodem — popularny w automatach i sklepach.',
    },
    {
        name: 'Toblerone',
        emoji: '🍫',
        category: 'batony',
        servingText: 'porcja (35g)',
        servingRatio: 0.35,
        kcal: 530,
        protein: 6,
        carbs: 60,
        fat: 30,
        satFat: 18,
        unsatFat: 12,
        micros: '-',
        extra: 'Szwajcarska czekolada z nugatą miodowo-migdałową — trójkątny baton.',
    },
    {
        name: 'Princessa',
        emoji: '🍫',
        category: 'batony',
        servingText: 'sztuka (35g)',
        servingRatio: 0.35,
        kcal: 520,
        protein: 6,
        carbs: 58,
        fat: 29,
        satFat: 15,
        unsatFat: 14,
        micros: '-',
        extra: 'Polski baton waflowy w czekoladzie — klasyk Wedla / Nestlé.',
    },
    {
        name: 'KitKat Chunky',
        emoji: '🍫',
        category: 'batony',
        servingText: 'sztuka (40g)',
        servingRatio: 0.4,
        kcal: 500,
        protein: 6,
        carbs: 62,
        fat: 25,
        satFat: 14,
        unsatFat: 11,
        micros: '-',
        extra: 'Grubszy KitKat — jeden kawałek wafla w grubej czekoladzie.',
    },
    {
        name: 'Snickers White',
        emoji: '🍫',
        category: 'batony',
        servingText: 'sztuka (49g)',
        servingRatio: 0.49,
        kcal: 510,
        protein: 8,
        carbs: 55,
        fat: 28,
        satFat: 12,
        unsatFat: 16,
        micros: '-',
        extra: 'Wariant Snickersa w białej czekoladzie z orzeszkami i karmelem.',
    },
    {
        name: 'Bounty Dark',
        emoji: '🍫',
        category: 'batony',
        servingText: 'sztuka (57g)',
        servingRatio: 0.57,
        kcal: 480,
        protein: 4,
        carbs: 52,
        fat: 28,
        satFat: 22,
        unsatFat: 6,
        micros: '-',
        extra: 'Kokosowy Bounty w gorzkiej czekoladzie.',
    },
    {
        name: 'Danusia',
        emoji: '🍫',
        category: 'batony',
        servingText: 'sztuka (40g)',
        servingRatio: 0.4,
        kcal: 500,
        protein: 5,
        carbs: 60,
        fat: 26,
        satFat: 15,
        unsatFat: 11,
        micros: '-',
        extra: 'Polski baton z nadzieniem czekoladowym — klasyk z dzieciństwa.',
    },
    {
        name: 'Nestlé Crunch',
        emoji: '🍫',
        category: 'batony',
        servingText: 'sztuka (40g)',
        servingRatio: 0.4,
        kcal: 500,
        protein: 6,
        carbs: 65,
        fat: 25,
        satFat: 15,
        unsatFat: 10,
        micros: '-',
        extra: 'Czekolada z chrupiącym ryżem — baton Nestlé Crunch.',
    },
    {
        name: 'Twix White',
        emoji: '🍫',
        category: 'batony',
        servingText: 'sztuka (46g)',
        servingRatio: 0.46,
        kcal: 505,
        protein: 5,
        carbs: 62,
        fat: 26,
        satFat: 15,
        unsatFat: 11,
        micros: '-',
        extra: 'Biszkopt z karmelem w białej czekoladzie — wariant Twixa.',
    },
    {
        name: 'Mars Protein',
        emoji: '🍫',
        category: 'batony',
        servingText: 'sztuka (57g)',
        servingRatio: 0.57,
        kcal: 350,
        protein: 20,
        carbs: 40,
        fat: 10,
        satFat: 5,
        unsatFat: 5,
        micros: '-',
        extra: 'Proteinowa wersja Marsa — więcej białka, mniej tłuszczu niż klasyczny.',
    },
    {
        name: 'Snickers Protein',
        emoji: '🍫',
        category: 'batony',
        servingText: 'sztuka (51g)',
        servingRatio: 0.51,
        kcal: 360,
        protein: 20,
        carbs: 36,
        fat: 12,
        satFat: 5,
        unsatFat: 7,
        micros: '-',
        extra: 'Baton proteinowy o smaku Snickersa — orzechy, karmel, czekolada.',
    },
    {
        name: 'Lion White',
        emoji: '🍫',
        category: 'batony',
        servingText: 'sztuka (40g)',
        servingRatio: 0.4,
        kcal: 500,
        protein: 5,
        carbs: 62,
        fat: 25,
        satFat: 15,
        unsatFat: 10,
        micros: '-',
        extra: 'Lion w białej czekoladzie z chrupkami i karmelem.',
    },
];

const text = fs.readFileSync(rawPath, 'utf8');
const m = text.match(/productsDatabaseRaw = (\[[\s\S]*\]);/);
if (!m) throw new Error('Nie znaleziono productsDatabaseRaw');
const products = JSON.parse(m[1]);
const byName = new Map(products.map((p) => [p.name, p]));

let recat = 0;
for (const rule of RECATEGORIZE) {
    const p = byName.get(rule.from);
    if (!p) {
        console.warn('Brak produktu do recategorize:', rule.from);
        continue;
    }
    p.category = rule.category;
    if (rule.to) {
        byName.delete(p.name);
        p.name = rule.to;
        byName.set(p.name, p);
    }
    if (rule.slug) p.slug = rule.slug;
    if (rule.extra) p.extra = rule.extra;
    recat += 1;
}

let added = 0;
for (const np of NEW_PRODUCTS) {
    if (byName.has(np.name)) {
        const existing = byName.get(np.name);
        existing.category = 'batony';
        console.log('Już istnieje — ustawiono batony:', np.name);
        continue;
    }
    products.push(np);
    byName.set(np.name, np);
    added += 1;
}

fs.writeFileSync(rawPath, `const productsDatabaseRaw = ${JSON.stringify(products)};\n`, 'utf8');
console.log(`OK: recategorize=${recat}, added=${added}, total=${products.length}`);
