/**
 * Zamienia „Zapiekanka z pieca” i „Zapiekanka studentska” na jeden produkt „Zapiekanka”.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const rawPath = path.join(root, 'js', 'products-data-raw.js');

const REMOVE = new Set(['Zapiekanka z pieca', 'Zapiekanka studentska']);

const ZAPIEKANKA = {
    name: 'Zapiekanka',
    emoji: '🥖',
    category: 'polskie-obiadki',
    servingText: 'sztuka (275g)',
    servingRatio: 2.75,
    kcal: 230,
    protein: 10.5,
    carbs: 31,
    fat: 7.5,
    satFat: 3.75,
    unsatFat: 3.75,
    micros: '-',
    extra: 'Polski street food — bagietka z pieca, grzyby, ser i sos.'
};

const rawFile = fs.readFileSync(rawPath, 'utf8');
const match = rawFile.match(/(const productsDatabaseRaw = )(\[[\s\S]*\])(;)/);
if (!match) throw new Error('Cannot parse products-data-raw.js');

const db = JSON.parse(match[2]);
const filtered = db.filter((p) => !REMOVE.has(p.name));
if (filtered.some((p) => p.name === 'Zapiekanka')) {
    console.log('„Zapiekanka” już jest w bazie — usunięto tylko duplikaty.');
} else {
    filtered.push(ZAPIEKANKA);
}
fs.writeFileSync(rawPath, `${match[1]}${JSON.stringify(filtered)}${match[3]}\n`, 'utf8');
console.log(`Produkty: ${db.length} → ${filtered.length}`);
