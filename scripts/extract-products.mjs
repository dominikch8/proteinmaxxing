import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const m = html.match(/const productsDatabase = \[([\s\S]*?)\n        \];/);
if (!m) throw new Error('productsDatabase not found');
const products = Function(`return [${m[1]}]`)();
console.log('Products:', products.length);
fs.mkdirSync(path.join(root, 'js'), { recursive: true });
fs.writeFileSync(
  path.join(root, 'js', 'products-data-raw.js'),
  `const productsDatabaseRaw = ${JSON.stringify(products)};\n`
);
