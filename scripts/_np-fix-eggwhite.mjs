/**
 * Poprawka: Białko jaj w proszku — makra zgodne z 4/4/9 (376 kcal).
 * Uruchom: node scripts/_np-fix-eggwhite.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const jsonPath = path.join(root, 'scripts', 'new-products-200.json');
const rawPath = path.join(root, 'js', 'products-data-raw.js');

const NAME = 'Białko jaj w proszku';
const FIX = { protein: 83, carbs: 10 };

const rows = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const row = rows.find((r) => r.name === NAME);
if (!row) { console.error('Brak w JSON:', NAME); process.exit(1); }
Object.assign(row, FIX);
fs.writeFileSync(jsonPath, JSON.stringify(rows, null, 0).replace(/\},\{/g, '},\n{'), 'utf8');

const raw = fs.readFileSync(rawPath, 'utf8');
const start = raw.indexOf('[');
const end = raw.lastIndexOf('];');
const db = JSON.parse(raw.slice(start, end + 1));
const p = db.find((x) => x.name === NAME);
if (!p) { console.error('Brak w bazie:', NAME); process.exit(1); }
Object.assign(p, FIX);
fs.writeFileSync(rawPath, `const productsDatabaseRaw = ${JSON.stringify(db)};\n`, 'utf8');

// karta produktu pokazuje makra → wymuś ponowne wygenerowanie grafiki
const slug = p.slug;
let deleted = [];
for (const rel of [`images/products/${slug}.jpg`, `images/products/${slug}.webp`]) {
    const fp = path.join(root, rel);
    if (fs.existsSync(fp)) { fs.unlinkSync(fp); deleted.push(rel); }
}

console.log(`JSON + baza: ${NAME} → białko ${FIX.protein} g, węgle ${FIX.carbs} g`);
console.log(`4/4/9 = ${4 * p.protein + 4 * p.carbs + 9 * p.fat} kcal (deklarowane ${p.kcal})`);
console.log(`Usunięto grafiki: ${deleted.join(', ') || 'brak'}`);