import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.join(root, 'index.html');
let h = fs.readFileSync(file, 'utf8');

const dbStart = '        // BAZA DANYCH GIGANT\n        const productsDatabase = [';
const dbEnd = '        ];\n\n        function pickRandomSix';
if (h.includes(dbStart)) {
    const i0 = h.indexOf(dbStart);
    const i1 = h.indexOf(dbEnd);
    h =
        h.slice(0, i0) +
        '        // Baza produktów: js/products-data-raw.js → products-data.js\n\n        function pickRandomSix' +
        h.slice(i1 + '        ];\n\n        function pickRandomSix'.length);
}

if (!h.includes('products-data-raw.js')) {
    h = h.replace(
        '<script>\n        function switchTab(tabId)',
        `<script src="js/products-data-raw.js"></script>
    <script src="js/product-utils.js"></script>
    <script src="js/products-data.js"></script>
    <script>
        function switchTab(tabId)`
    );
}

fs.writeFileSync(file, h);
console.log('DB strip + scripts OK');
