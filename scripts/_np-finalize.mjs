/**
 * Finalizacja partii: poprawia 4 wyjątki makro (tolerancja kcal vs 4/4/9)
 * i dokłada 8 produktów, aby uzyskać równe 200 pozycji.
 * Uruchom: node scripts/_np-finalize.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.join(root, 'scripts', 'new-products-200.json');
const arr = JSON.parse(fs.readFileSync(file, 'utf8'));

/** Korekty wartości (mieszczą się w zakresie spotykanym na etykietach / USDA). */
const PATCH = {
    'Chipsy bananowe': { carbs: 57, fat: 33 },
    'Otręby żytnie': { carbs: 54 },
    'Ser Mozzarella di bufala': { protein: 16.5 },
    'Banan suszony': { carbs: 85 },
};

let patched = 0;
for (const p of arr) {
    if (PATCH[p.name]) {
        Object.assign(p, PATCH[p.name]);
        patched++;
    }
}

/** 8 nowych produktów — źródła: USDA FoodData Central, tabele IŻŻ, etykiety producentów. */
const EXTRA = [
    {
        name: 'Ryż dziki (suchy)', emoji: '🍚', category: 'zboza',
        servingText: 'porcja (50g)', servingRatio: 0.5,
        kcal: 357, protein: 14.7, carbs: 74.9, fat: 1.1, satFat: 0.2, pricePerKg: 45,
        micros: { magnesium: 177, phosphorus: 433, zinc: 6, iron: 1.96, manganese: 1.33, copper: 524, b3: 6.73, b6: 0.51, potassium: 427, b1: 0.12, b9: 95, selenium: 2.2 },
        extra: 'Dziki ryż to trawa wodna — więcej białka i magnezu niż biały ryż, z orzechowym posmakiem.',
    },
    {
        name: 'Topinambur', emoji: '🌻', category: 'warzywa',
        servingText: 'porcja (100g)', servingRatio: 1,
        kcal: 73, protein: 2, carbs: 17.4, fat: 0.1, satFat: 0, pricePerKg: 12,
        micros: { potassium: 429, iron: 3.4, magnesium: 17, phosphorus: 78, vitC: 4, b1: 0.2, b6: 0.08, copper: 140, manganese: 0.06, b9: 13 },
        extra: 'Słonecznik bulwiasty — źródło inuliny, prebiotyku wspierającego mikrobiom jelitowy.',
    },
    {
        name: 'Fasola mung (gotowana)', emoji: '🫘', category: 'warzywa',
        servingText: 'porcja (150g)', servingRatio: 1.5,
        kcal: 105, protein: 7, carbs: 19.2, fat: 0.4, satFat: 0.1, pricePerKg: 15,
        micros: { magnesium: 48, iron: 1.4, phosphorus: 99, potassium: 266, zinc: 0.84, b9: 159, manganese: 0.3, copper: 156, b1: 0.16, b3: 0.6 },
        extra: 'Zielona fasola mung po ugotowaniu — dobra roślinnie, bogata w foliany i magnez.',
    },
    {
        name: 'Sos BBQ', emoji: '🥫', category: 'sosy',
        servingText: 'porcja (30g)', servingRatio: 0.3,
        kcal: 130, protein: 0.8, carbs: 31, fat: 0.4, satFat: 0.1, pricePerKg: 20,
        micros: { sodium: 1000, potassium: 200, vitC: 1, calcium: 15, iron: 0.4 },
        extra: 'Sos barbecue to głównie cukier i ocet — licz łyżkę, bo łatwo dodać 100+ kcal do grilla.',
    },
    {
        name: 'Kasztany jadalne', emoji: '🌰', category: 'orzechy',
        servingText: 'porcja (50g)', servingRatio: 0.5,
        kcal: 245, protein: 3.2, carbs: 53, fat: 2.2, satFat: 0.4, pricePerKg: 40,
        micros: { potassium: 715, magnesium: 32, iron: 1.2, vitC: 26, b1: 0.2, b6: 0.4, copper: 450, manganese: 0.9, b9: 60, phosphorus: 100 },
        extra: 'W przeciwieństwie do innych orzechów kasztany to głównie skrobia, nie tłuszcz — dużo witaminy C.',
    },
    {
        name: 'Daktyle', emoji: '🌴', category: 'owoce',
        servingText: 'porcja (40g)', servingRatio: 0.4,
        kcal: 277, protein: 1.8, carbs: 72, fat: 0.2, satFat: 0.03, pricePerKg: 25,
        micros: { potassium: 696, magnesium: 54, copper: 362, iron: 0.9, b6: 0.17, manganese: 0.3, calcium: 64, b3: 1.6, b9: 19 },
        extra: 'Naturalnie bardzo słodkie — świetne jako zdrowa przekąska lub zamiennik cukru w deserach.',
    },
    {
        name: 'Olej z awokado', emoji: '🥑', category: 'tluszcze',
        servingText: 'porcja (10g)', servingRatio: 0.1,
        kcal: 884, protein: 0, carbs: 0, fat: 100, satFat: 11.6, pricePerKg: 60,
        micros: { vitE: 15.4, vitK: 21 },
        extra: 'Ma wysoką temperaturę dymienia i neutralny smak — dobry do smażenia jako alternatywa dla oliwy.',
    },
    {
        name: 'Makaron razowy (suchy)', emoji: '🍝', category: 'makarony',
        servingText: 'porcja (80g)', servingRatio: 0.8,
        kcal: 352, protein: 13.4, carbs: 71.5, fat: 2.5, satFat: 0.5, pricePerKg: 9,
        micros: { magnesium: 118, iron: 3.6, phosphorus: 300, zinc: 2.2, manganese: 2.9, selenium: 60, b1: 0.4, b3: 6, b9: 30, copper: 400, potassium: 350 },
        extra: 'Z pełnego ziarna — więcej błonnika, magnezu i żelaza niż w klasycznym makaronie pszennym.',
    },
];

const names = new Set(arr.map((p) => p.name));
let added = 0;
for (const e of EXTRA) {
    if (names.has(e.name)) continue;
    names.add(e.name);
    arr.push(e);
    added++;
}

fs.writeFileSync(file, JSON.stringify(arr, null, 0), 'utf8');
console.log(`Poprawiono: ${patched} | Dodano: ${added} | Razem: ${arr.length}`);
