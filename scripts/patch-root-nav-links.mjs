/**
 * Zamienia linki nawigacji na ścieżki od root (/dieta zamiast dieta.html).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP_DIRS = new Set(['node_modules', '.git', 'deploy-bundle', 'domains']);

const REPLACEMENTS = [
    [/href="(?:\.\.\/)*index\.html"/g, 'href="/"'],
    [/href="(?:\.\.\/)*dieta\.html#produkty"/g, 'href="/dieta#produkty"'],
    [/href="(?:\.\.\/)*dieta\.html"/g, 'href="/dieta"'],
    [/href="(?:\.\.\/)*porownaj-produkty\.html"/g, 'href="/porownaj-produkty"'],
    [/href="(?:\.\.\/)*dodaj-produkt\.html"/g, 'href="/dodaj-produkt"'],
    [/href="(?:\.\.\/)*poradnik-zywienia\.html"/g, 'href="/poradnik-zywienia"'],
    [/href="(?:\.\.\/)*informacje\.html"/g, 'href="/informacje"'],
    [/href="(?:\.\.\/)*o-mnie\.html"/g, 'href="/o-mnie"'],
    [/href="(?:\.\.\/)*bialko-maxxing\.html/g, 'href="/bialko-maxxing'],
    [/href="(?:\.\.\/)*cena-bialka\.html/g, 'href="/cena-bialka'],
    [/href="(?:\.\.\/)*trening\.html"/g, 'href="/trening"']
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
