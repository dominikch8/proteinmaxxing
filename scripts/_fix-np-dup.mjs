/**
 * Rozwiązuje duplikat „Ryż jaśminowy (suchy)” (2× w pliku po podmianie za
 * „Ryż dziki (suchy)”, który był już w bazie). Usuwa nadmiarowy wpis i dodaje
 * nową, unikalną pozycję — baza + plik bez duplikatów, nadal 200 pozycji.
 * Uruchom: node scripts/_fix-np-dup.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const raw = fs.readFileSync(path.join(root, 'js', 'products-data-raw.js'), 'utf8');
const db = JSON.parse(raw.slice(raw.indexOf('['), raw.lastIndexOf('];') + 1));
const baseNames = new Set(db.map((p) => p.name));

const file = path.join(root, 'scripts', 'new-products-200.json');
let arr = JSON.parse(fs.readFileSync(file, 'utf8'));

// Usuń powtórzone „Ryż jaśminowy (suchy)” — zostaw pierwszy wpis.
const DUP = 'Ryż jaśminowy (suchy)';
let first = true;
const before = arr.length;
arr = arr.filter((p) => {
    if (p.name === DUP) {
        if (first) { first = false; return true; }
        return false;
    }
    return true;
});
const removed = before - arr.length;

// Dodaj nową, unikalną pozycję.
const NEW = {
    name: 'Ryż czerwony (suchy)', emoji: '🍚', category: 'zboza',
    servingText: 'porcja (50g)', servingRatio: 0.5,
    kcal: 356, protein: 7.8, carbs: 76, fat: 2.1, satFat: 0.5, pricePerKg: 18,
    micros: { magnesium: 100, phosphorus: 250, iron: 2.5, zinc: 1.8, manganese: 2.5, copper: 300, b3: 4, b6: 0.3, potassium: 200, b1: 0.3, b9: 20, selenium: 10 },
    extra: 'Niełuskany ryż czerwony — zachowuje otręby, dlatego ma więcej magnezu i żelaza niż biały.',
};

const seen = new Set(arr.map((p) => p.name));
if (baseNames.has(NEW.name) || seen.has(NEW.name)) throw new Error('Nowa pozycja już istnieje: ' + NEW.name);
arr.push(NEW);

fs.writeFileSync(file, JSON.stringify(arr, null, 0), 'utf8');
console.log(`Usunięto ${removed} duplikat, dodano 1 nową pozycję. Razem: ${arr.length}`);

