import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const COMPARE_ITEM =
    '<li><a class="nav-link" href="porownaj-produkty.html">Porównaj produkty</a></li>';
const NAV_PATTERNS = [
    '<li><a class="nav-link" href="dieta.html">Dieta</a></li>',
    '<li><a class="nav-link active" href="dieta.html">Dieta</a></li>'
];

const ROOT_PAGES = [
    'index.html',
    'dieta.html',
    'bialko-maxxing.html',
    'cena-bialka.html',
    'trening.html',
    'informacje.html',
    'o-mnie.html',
    '404.html'
];

let n = 0;
for (const file of ROOT_PAGES) {
    const fp = path.join(root, file);
    if (!fs.existsSync(fp)) continue;
    let html = fs.readFileSync(fp, 'utf8');
    if (html.includes('porownaj-produkty.html')) continue;
    const needle = NAV_PATTERNS.find((p) => html.includes(p));
    if (!needle) {
        console.warn(`Skip ${file}: nav needle not found`);
        continue;
    }
    html = html.replace(needle, `${needle}\n                ${COMPARE_ITEM}`);
    fs.writeFileSync(fp, html, 'utf8');
    n++;
}
console.log(`Updated nav in ${n} pages.`);
