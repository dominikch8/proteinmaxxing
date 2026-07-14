/**
 * Zamienia linki nawigacji na ścieżki od root z .html (najpewniejsze na LH.pl).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP_DIRS = new Set(['node_modules', '.git', 'deploy-bundle', 'domains']);

const REPLACEMENTS = [
    [/href="\/"/g, 'href="/index.html"'],
    [/href="(?:\.\.\/)*index\.html"/g, 'href="/index.html"'],
    [/href="\/dieta#produkty"/g, 'href="/dieta.html#produkty"'],
    [/href="(?:\.\.\/)*dieta\.html#produkty"/g, 'href="/dieta.html#produkty"'],
    [/href="\/dieta"/g, 'href="/dieta.html"'],
    [/href="(?:\.\.\/)*dieta\.html"/g, 'href="/dieta.html"'],
    [/href="\/porownaj-produkty"/g, 'href="/porownaj-produkty.html"'],
    [/href="(?:\.\.\/)*porownaj-produkty\.html"/g, 'href="/porownaj-produkty.html"'],
    [/href="\/dodaj-produkt"/g, 'href="/dodaj-produkt.html"'],
    [/href="(?:\.\.\/)*dodaj-produkt\.html"/g, 'href="/dodaj-produkt.html"'],
    [/href="\/poradnik-zywienia"/g, 'href="/poradnik-zywienia.html"'],
    [/href="(?:\.\.\/)*poradnik-zywienia\.html"/g, 'href="/poradnik-zywienia.html"'],
    [/href="\/informacje"/g, 'href="/informacje.html"'],
    [/href="(?:\.\.\/)*informacje\.html"/g, 'href="/informacje.html"'],
    [/href="\/o-mnie"/g, 'href="/o-mnie.html"'],
    [/href="(?:\.\.\/)*o-mnie\.html"/g, 'href="/o-mnie.html"'],
    [/href="\/bialko-maxxing/g, 'href="/bialko-maxxing.html'],
    [/href="(?:\.\.\/)*bialko-maxxing\.html/g, 'href="/bialko-maxxing.html'],
    [/href="\/cena-bialka/g, 'href="/cena-bialka.html'],
    [/href="(?:\.\.\/)*cena-bialka\.html/g, 'href="/cena-bialka.html'],
    [/href="\/trening"/g, 'href="/trening.html"'],
    [/href="(?:\.\.\/)*trening\.html"/g, 'href="/trening.html"']
];

function walkHtml(dir, list = []) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) {
            if (SKIP_DIRS.has(e.name)) continue;
            walkHtml(p, list);
        } else if (e.name.endsWith('.html')) {
            list.push(p);
        }
    }
    return list;
}

let changed = 0;
for (const fp of walkHtml(root)) {
    let html = fs.readFileSync(fp, 'utf8');
    const before = html;
    for (const [re, to] of REPLACEMENTS) {
        html = html.replace(re, to);
    }
    if (html !== before) {
        fs.writeFileSync(fp, html, 'utf8');
        changed++;
    }
}

console.log(`Naprawiono linki nawigacji w ${changed} plikach HTML.`);
