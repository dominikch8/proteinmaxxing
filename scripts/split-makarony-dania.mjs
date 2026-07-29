/**
 * Zostawia w „makarony” tylko typy makaronu (suche, udon, gnocchi, tortellini, ravioli).
 * Dania makaronowe przenosi do „polskie-obiadki”.
 *
 * node scripts/split-makarony-dania.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const rawPath = path.join(root, 'js', 'products-data-raw.js');

function isPastaType(name) {
    const n = name.trim();
    if (/\(suchy\)|\(sucha\)/i.test(n)) return true;
    if (/^makaron udon$/i.test(n)) return true;
    if (/^gnocchi$/i.test(n)) return true;
    if (/^tortellini z mi/i.test(n)) return true;
    if (/^ravioli z ricott/i.test(n)) return true;
    return false;
}

const text = fs.readFileSync(rawPath, 'utf8');
const m = text.match(/productsDatabaseRaw = (\[[\s\S]*\]);/);
if (!m) throw new Error('Nie znaleziono productsDatabaseRaw');
const products = JSON.parse(m[1]);

let moved = 0;
let kept = 0;
for (const p of products) {
    if (p.category !== 'makarony') continue;
    if (isPastaType(p.name)) {
        kept += 1;
        continue;
    }
    p.category = 'polskie-obiadki';
    moved += 1;
    console.log('→ polskie-obiadki:', p.name);
}

fs.writeFileSync(rawPath, `const productsDatabaseRaw = ${JSON.stringify(products)};\n`, 'utf8');
console.log(`Zostawiono ${kept} typów makaronu, przeniesiono ${moved} dań.`);
