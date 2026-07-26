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
