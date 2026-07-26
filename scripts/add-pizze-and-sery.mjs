/**
 * Dodaje kategorie mrozone-pizze + sery, przenosi sery z nabiału,
 * dodaje mrożone pizze i brakujące popularne sery.
 * node scripts/add-pizze-and-sery.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const rawPath = path.join(root, 'js', 'products-data-raw.js');

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

function withServing(p) {
    const grams = p.servingGrams ?? Math.round((p.servingRatio || 1) * 100);
    const proteinInServing =
        p.proteinInServing ?? Math.round(p.protein * (grams / 100) * 100) / 100;
    const servingPricePln = p.servingPricePln ?? null;
    const pricePer100gProtein =
        p.pricePer100gProtein ??
        (servingPricePln != null && proteinInServing > 0
            ? Math.round((servingPricePln / proteinInServing) * 10000) / 100
            : null);
    return {
        ...p,
        servingGrams: grams,
        proteinInServing,
        servingPricePln,
        pricePer100gProtein,
        slug: p.slug || slugify(p.name),
    };
}

/** Sery (nie twarogi / cottage / serki śniadaniowe / WPC). */
function isCheeseName(name) {
    if (
        /twaróg|twarogowy|cottage|^serek |danio|whey|wpi|wpc|izolat|koncentrat białka/i.test(
            name
        )
    ) {
        return false;
    }
    return (
        /^ser\b/i.test(name) ||
        /^(ricotta|mascarpone)$/i.test(name.trim()) ||
        /\b(gouda|camembert|mozzarella|parmezan|feta|brie|edamski|cheddar|halloumi|emmental|provolone|oscypek|tylżycki|kozi)\b/i.test(
            name
        )
    );
}

const NEW_PIZZAS = [
    {
        name: 'Guseppe Szynka i pieczarki',
        emoji: '🍕',
        category: 'mrozone-pizze',
        servingText: '1/2 pizzy (210g)',
        servingRatio: 2.1,
        servingGrams: 210,
        kcal: 225,
        protein: 8.1,
        carbs: 30,
        fat: 7.6,
        satFat: 2.8,
        unsatFat: 4.8,
        micros: 'Sód, Wapń',
        extra: 'Dr. Oetker Guseppe — mrożona pizza, wartości na 100 g z etykiety (orientacyjnie).',
        servingPricePln: 6.5,
    },
    {
        name: 'Guseppe 4 sery',
        emoji: '🍕',
        category: 'mrozone-pizze',
        servingText: '1/4 pizzy (170g)',
        servingRatio: 1.7,
        servingGrams: 170,
        kcal: 283,
        protein: 11,
        carbs: 28,
        fat: 14,
        satFat: 7.5,
        unsatFat: 6.5,
        micros: 'Wapń, Sód',
        extra: 'Dr. Oetker Guseppe 4 sery — gęstsza kalorycznie niż wariant z szynką.',
        servingPricePln: 5.5,
    },
    {
        name: 'Guseppe Salami',
        emoji: '🍕',
        category: 'mrozone-pizze',
        servingText: '1/2 pizzy (210g)',
        servingRatio: 2.1,
        servingGrams: 210,
        kcal: 259,
        protein: 8.5,
        carbs: 29.4,
        fat: 11.6,
        satFat: 4.5,
        unsatFat: 7.1,
        micros: 'Sód, Wapń',
        extra: 'Dr. Oetker Guseppe Salami — popularna mrożona pizza w dyskontach.',
        servingPricePln: 6.5,
    },
    {
        name: 'Feliciana Margherita',
        emoji: '🍕',
        category: 'mrozone-pizze',
        servingText: 'cała pizza (315g)',
        servingRatio: 3.15,
        servingGrams: 315,
        kcal: 244,
        protein: 9.3,
        carbs: 35,
        fat: 7,
        satFat: 3.8,
        unsatFat: 3.2,
        micros: 'Wapń, Sód',
        extra: 'Dr. Oetker Feliciana Margherita — cienkie ciasto, mozzarella (dane producenta / 100 g).',
        servingPricePln: 14,
    },
    {
        name: 'Feliciana Speciale',
        emoji: '🍕',
        category: 'mrozone-pizze',
        servingText: 'cała pizza (335g)',
        servingRatio: 3.35,
        servingGrams: 335,
        kcal: 237,
        protein: 9.5,
        carbs: 33,
        fat: 7.2,
        satFat: 3.6,
        unsatFat: 3.6,
        micros: 'Wapń, Sód',
        extra: 'Dr. Oetker Feliciana Speciale — wartości na 100 g z karty produktu.',
        servingPricePln: 15,
    },
    {
        name: 'Feliciana Prosciutto e Funghi',
        emoji: '🍕',
        category: 'mrozone-pizze',
        servingText: 'cała pizza (340g)',
        servingRatio: 3.4,
        servingGrams: 340,
        kcal: 217,
        protein: 9.1,
        carbs: 33,
        fat: 5,
        satFat: 2.8,
        unsatFat: 2.2,
        micros: 'Wapń, Sód',
        extra: 'Dr. Oetker Feliciana z szynką i pieczarkami — lżejszy wariant linii.',
        servingPricePln: 15,
    },
    {
        name: 'Feliciana Quattro Formaggi',
        emoji: '🍕',
        category: 'mrozone-pizze',
        servingText: 'cała pizza (335g)',
        servingRatio: 3.35,
        servingGrams: 335,
        kcal: 237,
        protein: 9.5,
        carbs: 33,
        fat: 7.2,
        satFat: 3.6,
        unsatFat: 3.6,
        micros: 'Wapń, Sód',
        extra: 'Dr. Oetker Feliciana 4 sery — dane producenta na 100 g.',
        servingPricePln: 15,
    },
    {
        name: 'Dzik Protein Pizza Salami',
        emoji: '🍕',
        category: 'mrozone-pizze',
        servingText: 'cała pizza (320g)',
        servingRatio: 3.2,
        servingGrams: 320,
        kcal: 251,
        protein: 18.8,
        carbs: 30.5,
        fat: 5.3,
        satFat: 2.1,
        unsatFat: 3.2,
        micros: 'Wapń, Sód',
        extra: 'WK Dzik — proteinowa mrożona pizza, wysokie białko na 100 g.',
        servingPricePln: 18,
    },
    {
        name: 'Dzik Protein Pizza Capricciosa',
        emoji: '🍕',
        category: 'mrozone-pizze',
        servingText: 'cała pizza (350g)',
        servingRatio: 3.5,
        servingGrams: 350,
        kcal: 211,
        protein: 17.2,
        carbs: 28.9,
        fat: 2.4,
        satFat: 0.5,
        unsatFat: 1.9,
        micros: 'Wapń, Sód',
        extra: 'WK Dzik Capricciosa — proteinowa pizza mrożona.',
        servingPricePln: 18,
    },
    {
        name: 'Dzik Protein Pizza BBQ Chicken',
        emoji: '🍕',
        category: 'mrozone-pizze',
        servingText: 'cała pizza (350g)',
        servingRatio: 3.5,
        servingGrams: 350,
        kcal: 190,
        protein: 14.3,
        carbs: 26.2,
        fat: 2.6,
        satFat: 0.7,
        unsatFat: 1.9,
        micros: 'Wapń, Sód',
        extra: 'WK Dzik BBQ Chicken — lżejsza proteinowa pizza mrożona.',
        servingPricePln: 18,
    },
    {
        name: 'Ristorante Salami',
        emoji: '🍕',
        category: 'mrozone-pizze',
        servingText: 'cała pizza (320g)',
        servingRatio: 3.2,
        servingGrams: 320,
        kcal: 255,
        protein: 10,
        carbs: 27,
        fat: 12,
        satFat: 5,
        unsatFat: 7,
        micros: 'Wapń, Sód',
        extra: 'Dr. Oetker Ristorante Salami — cienkie ciasto, popularna mrożona pizza.',
        servingPricePln: 16,
    },
    {
        name: 'Ristorante Prosciutto',
        emoji: '🍕',
        category: 'mrozone-pizze',
        servingText: 'cała pizza (330g)',
        servingRatio: 3.3,
        servingGrams: 330,
        kcal: 230,
        protein: 10,
        carbs: 27,
        fat: 9,
        satFat: 4,
        unsatFat: 5,
        micros: 'Wapń, Sód',
        extra: 'Dr. Oetker Ristorante Prosciutto — szynka na cienkim cieście.',
        servingPricePln: 16,
    },
    {
        name: 'Ristorante Mozzarella',
        emoji: '🍕',
        category: 'mrozone-pizze',
        servingText: 'cała pizza (335g)',
        servingRatio: 3.35,
        servingGrams: 335,
        kcal: 240,
        protein: 10,
        carbs: 28,
        fat: 10,
        satFat: 5,
        unsatFat: 5,
        micros: 'Wapń, Sód',
        extra: 'Dr. Oetker Ristorante Mozzarella — klasyczna mrożona pizza serowa.',
        servingPricePln: 15,
    },
    {
        name: 'Wagner Steinofen Salami',
        emoji: '🍕',
        category: 'mrozone-pizze',
        servingText: 'cała pizza (350g)',
        servingRatio: 3.5,
        servingGrams: 350,
        kcal: 248,
        protein: 10,
        carbs: 28,
        fat: 11,
        satFat: 4.5,
        unsatFat: 6.5,
        micros: 'Wapń, Sód',
        extra: 'Wagner Steinofen — popularna mrożona pizza w polskich marketach.',
        servingPricePln: 14,
    },
    {
        name: 'Don Peppe Margherita',
        emoji: '🍕',
        category: 'mrozone-pizze',
        servingText: 'cała pizza (340g)',
        servingRatio: 3.4,
        servingGrams: 340,
        kcal: 235,
        protein: 9,
        carbs: 30,
        fat: 9,
        satFat: 4,
        unsatFat: 5,
        micros: 'Wapń, Sód',
        extra: 'Don Peppe — mrożona pizza margherita popularna w dyskontach.',
        servingPricePln: 12,
    },
];

const NEW_CHEESES = [
    {
        name: 'Oscypek',
        emoji: '🧀',
        category: 'sery',
        servingText: 'kawałek (50g)',
        servingRatio: 0.5,
        servingGrams: 50,
        kcal: 370,
        protein: 25,
        carbs: 1,
        fat: 29,
        satFat: 19,
        unsatFat: 10,
        micros: 'Wapń, Sód',
        extra: 'Tradycyjny wędzony ser owczy z Podhala — gęsty kalorycznie.',
        servingPricePln: 4.5,
    },
    {
        name: 'Ser kozi miękki',
        emoji: '🧀',
        category: 'sery',
        servingText: 'porcja (40g)',
        servingRatio: 0.4,
        servingGrams: 40,
        kcal: 280,
        protein: 18,
        carbs: 1,
        fat: 23,
        satFat: 15,
        unsatFat: 8,
        micros: 'Wapń, Witamina A',
        extra: 'Miękki ser kozi — popularny w sałatkach i na kanapkach.',
        servingPricePln: 3.2,
    },
    {
        name: 'Ser tylżycki',
        emoji: '🧀',
        category: 'sery',
        servingText: 'plaster (20g)',
        servingRatio: 0.2,
        servingGrams: 20,
        kcal: 340,
        protein: 26,
        carbs: 1,
        fat: 26,
        satFat: 17,
        unsatFat: 9,
        micros: 'Wapń, Fosfor',
        extra: 'Klasyczny ser żółty popularny w Polsce — plastry do kanapek.',
        servingPricePln: 1.1,
    },
];

const raw = fs.readFileSync(rawPath, 'utf8');
const start = raw.indexOf('[');
const end = raw.lastIndexOf('];');
const products = JSON.parse(raw.slice(start, end + 1));
const byName = new Set(products.map((p) => p.name));

let moved = 0;
for (const p of products) {
    if (p.category === 'nabial' && isCheeseName(p.name)) {
        p.category = 'sery';
        moved++;
    }
}

let added = 0;
for (const p of [...NEW_PIZZAS, ...NEW_CHEESES]) {
    if (byName.has(p.name)) {
        console.log('skip exists', p.name);
        continue;
    }
    products.push(withServing(p));
    byName.add(p.name);
    added++;
}

fs.writeFileSync(rawPath, raw.slice(0, start) + JSON.stringify(products) + raw.slice(end + 1));
fs.copyFileSync(rawPath, path.join(root, 'deploy-bundle/js/products-data-raw.js'));

const sery = products.filter((p) => p.category === 'sery');
const pizze = products.filter((p) => p.category === 'mrozone-pizze');
console.log(`moved cheeses: ${moved}`);
console.log(`added: ${added}`);
console.log(`sery: ${sery.length}`);
console.log(`mrozone-pizze: ${pizze.length}`);
console.log('sery list:', sery.map((p) => p.name).join(' | '));
console.log('pizze list:', pizze.map((p) => p.name).join(' | '));
