import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const rawPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'js', 'products-data-raw.js');
let s = fs.readFileSync(rawPath, 'utf8');

if (s.endsWith('];\\n')) {
    s = s.slice(0, -4) + '];\n';
    console.log('Removed literal \\n suffix');
}

if (!s.trimEnd().endsWith('];')) {
    throw new Error('Unexpected file ending: ' + JSON.stringify(s.slice(-20)));
}

const json = s.replace(/^const productsDatabaseRaw = /, '').replace(/;\s*$/, '');
const products = JSON.parse(json);
fs.writeFileSync(rawPath, `const productsDatabaseRaw = ${JSON.stringify(products)};\n`, 'utf8');
console.log(`Fixed ${rawPath} — ${products.length} products, valid JSON.`);
