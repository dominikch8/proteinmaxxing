/**
 * Rozdziela batony proteinowe do osobnej kategorii.
 * node scripts/split-batony-proteinowe.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const rawPath = path.join(root, 'js', 'products-data-raw.js');

const MOVE_TO_PROTEIN = new Set([
    'Baton proteinowy',
    'Mars Protein',
    'Snickers Protein',
]);

const NEW_PROTEIN = [
    {
        name: 'Go On Protein Bar',
        emoji: '🍫',
        category: 'batony-proteinowe',
        servingText: 'sztuka (50g)',
        servingRatio: 0.5,
        kcal: 370,
        protein: 25,
        carbs: 32,
        fat: 14,
        satFat: 7,
        unsatFat: 7,
        micros: '-',
        extra: 'Popularny polski baton proteinowy — ok. 20+ g białka na sztukę.',
    },
    {
        name: 'Barebells',
        emoji: '🍫',
        category: 'batony-proteinowe',
        servingText: 'sztuka (55g)',
        servingRatio: 0.55,
        kcal: 360,
        protein: 20,
        carbs: 28,
        fat: 14,
        satFat: 7,
        unsatFat: 7,
        micros: '-',
        extra: 'Szwedzki baton proteinowy o smaku deserowym — dużo białka, mniej cukru niż klasyczny baton.',
    },
    {
        name: 'Quest Protein Bar',
        emoji: '🍫',
        category: 'batony-proteinowe',
        servingText: 'sztuka (60g)',
        servingRatio: 0.6,
        kcal: 340,
        protein: 21,
        carbs: 24,
        fat: 15,
        satFat: 5,
        unsatFat: 10,
        micros: 'Błonnik',
        extra: 'Amerykański baton proteinowy z wysoką zawartością błonnika i białka.',
    },
    {
        name: 'MyProtein Layered Bar',
        emoji: '🍫',
        category: 'batony-proteinowe',
        servingText: 'sztuka (60g)',
        servingRatio: 0.6,
        kcal: 350,
        protein: 20,
        carbs: 30,
        fat: 13,
        satFat: 6,
        unsatFat: 7,
        micros: '-',
        extra: 'Warstwowy baton proteinowy MyProtein — przekąska po treningu.',
    },
    {
        name: 'Olimp Matrix Pro',
        emoji: '🍫',
        category: 'batony-proteinowe',
        servingText: 'sztuka (80g)',
        servingRatio: 0.8,
        kcal: 355,
        protein: 25,
        carbs: 35,
        fat: 10,
        satFat: 5,
        unsatFat: 5,
        micros: '-',
        extra: 'Polski baton proteinowy Olimp — solidna porcja białka w większej sztuce.',
    },
];

const text = fs.readFileSync(rawPath, 'utf8');
const m = text.match(/productsDatabaseRaw = (\[[\s\S]*\]);/);
if (!m) throw new Error('Nie znaleziono productsDatabaseRaw');
const products = JSON.parse(m[1]);
const byName = new Map(products.map((p) => [p.name, p]));

let moved = 0;
for (const p of products) {
    if (MOVE_TO_PROTEIN.has(p.name) || /protein/i.test(p.name)) {
        if (p.category === 'batony' || MOVE_TO_PROTEIN.has(p.name)) {
            p.category = 'batony-proteinowe';
            moved += 1;
        }
    }
}

let added = 0;
for (const np of NEW_PROTEIN) {
    if (byName.has(np.name)) {
        byName.get(np.name).category = 'batony-proteinowe';
        console.log('Istnieje — ustawiono batony-proteinowe:', np.name);
        continue;
    }
    products.push(np);
    byName.set(np.name, np);
    added += 1;
}

fs.writeFileSync(rawPath, `const productsDatabaseRaw = ${JSON.stringify(products)};\n`, 'utf8');

const batony = products.filter((p) => p.category === 'batony').length;
const protein = products.filter((p) => p.category === 'batony-proteinowe').length;
console.log(`OK: moved/recat=${moved}, added=${added}, batony=${batony}, batony-proteinowe=${protein}`);
