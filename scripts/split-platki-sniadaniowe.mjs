/**
 * Wydziela płatki śniadaniowe / granolę / musli do osobnej kategorii.
 * node scripts/split-platki-sniadaniowe.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const rawPath = path.join(root, 'js', 'products-data-raw.js');
const CAT = 'platki-sniadaniowe';

const MOVE_BY_NAME = new Set([
    'Płatki owsiane',
    'Płatki Nesquik',
    'Płatki Lion',
    'Płatki Cini Minis',
    'Płatki Cookie Crisps',
    'Płatki Corn Flakes',
    'Płatki kukurydziane',
    'Płatki musli bez cukru',
    'Granola',
]);

const text = fs.readFileSync(rawPath, 'utf8');
const m = text.match(/productsDatabaseRaw = (\[[\s\S]*\]);/);
if (!m) throw new Error('Nie znaleziono productsDatabaseRaw');
const products = JSON.parse(m[1]);

let moved = 0;
for (const p of products) {
    const byName = MOVE_BY_NAME.has(p.name);
    const byPattern =
        p.category === 'zboza' &&
        (/^płatki\b/i.test(p.name) || /^granola$/i.test(p.name) || /\bmusli\b/i.test(p.name));
    if (byName || byPattern) {
        if (p.category !== CAT) {
            p.category = CAT;
            moved += 1;
            console.log('→', p.name);
        }
    }
}

fs.writeFileSync(rawPath, `const productsDatabaseRaw = ${JSON.stringify(products)};\n`, 'utf8');
console.log(`Przeniesiono ${moved} produktów do „${CAT}".`);
