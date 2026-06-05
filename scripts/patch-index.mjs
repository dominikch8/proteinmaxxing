import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const start = html.indexOf('        // BAZA DANYCH GIGANT');
const end = html.indexOf('        ];', start) + '        ];'.length;
if (start === -1 || end === -1) throw new Error('database block not found');

const replacement = `        // Baza produktów: js/products-data-raw.js + slugi`;

html = html.slice(0, start) + replacement + html.slice(end);
fs.writeFileSync(path.join(root, 'index.html'), html);
console.log('Removed inline productsDatabase from index.html');
