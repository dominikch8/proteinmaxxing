/**
 * Podmienia duplikat „Ryż dziki (suchy)” (jest już w bazie) na nową pozycję.
 * Uruchom: node scripts/_fix-np-dup.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.join(root, 'scripts', 'new-products-200.json');
const arr = JSON.parse(fs.readFileSync(file, 'utf8'));

const DUP = 'Ryż dziki (suchy)';
const NEW = {
    name: 'Ryż jaśminowy (suchy)', emoji: '🍚', category: 'zboza',
    servingText: 'porcja (50g)', servingRatio: 0.5,
    kcal: 356, protein: 7, carbs: 79, fat: 0.6, satFat: 0.2, pricePerKg: 12,
    micros: { magnesium: 25, phosphorus: 115, zinc: 1.1, iron: 0.8, manganese: 1.1, copper: 220, b3: 1.6, b5: 1.0, b6: 0.16, potassium: 115, b1: 0.07, b9: 9, selenium: 15 },
    extra: 'Długoziarnisty ryż jaśminowy — puszysty i aromatyczny, głównie skrobia, do dań azjatyckich.',
};

let replaced = 0;
for (let i = 0; i < arr.length; i++) {
    if (arr[i].name === DUP) { arr[i] = NEW; replaced++; }
}
if (!replaced) throw new Error('Nie znaleziono duplikatu: ' + DUP);

fs.writeFileSync(file, JSON.stringify(arr, null, 0), 'utf8');
console.log(`Podmieniono ${replaced} pozycję. Razem: ${arr.length}`);
