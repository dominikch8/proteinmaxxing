/**
 * Ustawia category: "polskie-obiadki" dla wybranych dań w products-data-raw.js
 * Uruchom: node scripts/categorize-polskie-obiadki.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const rawPath = path.join(root, 'js', 'products-data-raw.js');

const POLSKIE_OBIADKI_NAMES = new Set([
    'Pierogi ruskie (8 szt.)',
    'Pierogi z mięsem',
    'Pierogi z kapustą i grzybami',
    'Kopytka',
    'Kluski śląskie',
    'Placki ziemniaczane',
    'Pomidorowa z ryżem',
    'Makaron łazanki (suchy)',
    'Gulasz wołowy z makaronem',
    'Rosół z makaronem',
    'Zapiekanka makaronowa (gotowiec)',
    'Golonka wieprzowa',
    'Żeberka wieprzowe',
    'Kotlet mielony (wieprzowo-wołowy)',
    'Schabowy (panierowany)',
    'Zapiekanka',
    'Zupa jarzynowa',
    'Zupa pomidorowa',
    'Zupa pieczarkowa',
    'Zupa ogórkowa',
    'Barszcz czerwony',
    'Żurek',
    'Kapuśniak',
    'Grochówka',
    'Flaki',
    'Gołąbki',
    'Bigos',
    'Pyzy z mięsem',
    'Naleśniki z twarogiem',
    'Naleśniki z dżemem'
]);

const rawFile = fs.readFileSync(rawPath, 'utf8');
const match = rawFile.match(/(const productsDatabaseRaw = )(\[[\s\S]*\])(;)/);
if (!match) throw new Error('Cannot parse products-data-raw.js');

const db = JSON.parse(match[2]);
let updated = 0;
for (const p of db) {
    if (!POLSKIE_OBIADKI_NAMES.has(p.name)) continue;
    if (p.category !== 'polskie-obiadki') {
        p.category = 'polskie-obiadki';
        updated++;
    }
}

const missing = [...POLSKIE_OBIADKI_NAMES].filter((n) => !db.some((p) => p.name === n));
if (missing.length) {
    console.warn('Brak w bazie:', missing.join(', '));
}

fs.writeFileSync(rawPath, `${match[1]}${JSON.stringify(db)}${match[3]}\n`, 'utf8');
console.log(`Zaktualizowano ${updated} produktów → polskie-obiadki`);
