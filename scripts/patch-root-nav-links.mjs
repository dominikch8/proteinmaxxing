/**
 * Linki nawigacji — względne ścieżki .html (najpewniejsze na LH.pl).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP_DIRS = new Set(['node_modules', '.git', 'deploy-bundle', 'domains']);

const ROOT_PAGES = [
    ['index.html', 'index.html'],
    ['dieta.html#produkty', 'dieta.html#produkty'],
    ['dieta.html', 'dieta.html'],
    ['porownaj-produkty.html', 'porownaj-produkty.html'],
    ['dodaj-produkt.html', 'dodaj-produkt.html'],
    ['poradnik-zywienia.html', 'poradnik-zywienia.html'],
    ['artykuly.html', 'artykuly.html'],
    ['logowanie.html', 'logowanie.html'],
    ['rejestracja.html', 'rejestracja.html'],
    ['konto.html', 'konto.html'],
    ['admin-zgloszenia.html', 'admin-zgloszenia.html'],
    ['informacje.html', 'informacje.html'],
    ['o-mnie.html', 'o-mnie.html'],
    ['bialko-maxxing.html', 'bialko-maxxing.html'],
    ['cena-bialka.html', 'cena-bialka.html'],
    ['trening.html', 'trening.html'],
    ['deficyt-kaloryczny-praktyka.html', 'deficyt-kaloryczny-praktyka.html'],
    ['planowanie-posilkow.html', 'planowanie-posilkow.html']
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

function prefixFor(rel) {
    const depth = rel.split('/').length - 1;
    if (depth <= 0) return '';
    return '../'.repeat(depth);
}

function patchNavLinks(html, rel) {
    const prefix = prefixFor(rel);
    let out = html;

    for (const [page, target] of ROOT_PAGES) {
        const bare = page.replace('.html', '').replace('#produkty', '');
        const patterns = [
            new RegExp(`href="/${page.replace('.', '\\.')}"`, 'g'),
            new RegExp(`href="/${bare}"`, 'g'),
            new RegExp(`href="(?:\\.\\./)*${page.replace('.', '\\.')}"`, 'g')
        ];
        const replacement = `href="${prefix}${target}"`;
        for (const re of patterns) {
            out = out.replace(re, replacement);
        }
    }

    return out;
}

let changed = 0;
for (const fp of walkHtml(root)) {
    const rel = path.relative(root, fp).replace(/\\/g, '/');
    const before = fs.readFileSync(fp, 'utf8');
    const after = patchNavLinks(before, rel);
    if (after !== before) {
        fs.writeFileSync(fp, after, 'utf8');
        changed++;
    }
}

console.log(`Naprawiono linki nawigacji w ${changed} plikach HTML.`);
