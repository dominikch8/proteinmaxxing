/** Walidacja scripts/new-products-200.json: JSON, duplikaty, makra vs kcal, ceny. */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const arr = JSON.parse(fs.readFileSync(path.join(root, 'scripts', 'new-products-200.json'), 'utf8'));

const raw = fs.readFileSync(path.join(root, 'js', 'products-data-raw.js'), 'utf8');
const db = JSON.parse(raw.slice(raw.indexOf('['), raw.lastIndexOf('];') + 1));
const existing = new Set(db.map((p) => p.name));

const byCat = {};
const seen = new Set();
let dupIn = [], dupDb = [], macroIssues = [], noPrice = [], noServing = [];

for (const p of arr) {
    byCat[p.category] = (byCat[p.category] || 0) + 1;
    if (seen.has(p.name)) dupIn.push(p.name);
    seen.add(p.name);
    if (existing.has(p.name)) dupDb.push(p.name);

    const calc = 4 * p.protein + 4 * p.carbs + 9 * p.fat;
    if (Math.abs(calc - p.kcal) > 22) macroIssues.push(`${p.name}: kcal=${p.kcal} vs 4/4/9=${Math.round(calc)}`);
    if (typeof p.pricePerKg !== 'number') noPrice.push(p.name);
    if (typeof p.servingRatio !== 'number' || !p.servingText) noServing.push(p.name);
}

console.log('SUMA:', arr.length);
console.log('Kategorie:', JSON.stringify(byCat));
console.log('Duplikaty w pliku:', dupIn.length, dupIn.join(' | '));
console.log('Duplikaty z bazą:', dupDb.length, dupDb.join(' | '));
console.log('Makra poza tolerancją:', macroIssues.length);
macroIssues.forEach((m) => console.log('  ' + m));
console.log('Bez ceny:', noPrice.join(' | ') || 'brak');
console.log('Bez porcji:', noServing.join(' | ') || 'brak');

fs.writeFileSync(
    'C:/Users/Administrator xD/.cline/data/workspaces/chat/_val-report.txt',
    [
        `SUMA: ${arr.length}`,
        `Kategorie: ${JSON.stringify(byCat)}`,
        `Duplikaty w pliku: ${dupIn.length} ${dupIn.join(' | ')}`,
        `Duplikaty z bazą: ${dupDb.length} ${dupDb.join(' | ')}`,
        `Makra poza tolerancją: ${macroIssues.length}`,
        ...macroIssues.map((m) => '  ' + m),
        `Bez ceny: ${noPrice.join(' | ') || 'brak'}`,
        `Bez porcji: ${noServing.join(' | ') || 'brak'}`,
    ].join('\n'),
    'utf8'
);
