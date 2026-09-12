import fs from 'fs';

const s = fs.readFileSync('artykuly.html', 'utf8');
const lines = s.split(/\r?\n/);
const out = [];

// Count real tile elements in the list container.
const listStart = s.indexOf('id="artykulyList"');
out.push('listStart=' + listStart);

// Count occurrences of class="poradnik-hub-tile" (actual element openers).
const opener = /class="[^"]*\bporadnik-hub-tile\b[^"]*"/g;
out.push('tileOpeners=' + (s.match(opener) || []).length);

// Count data-category attributes (one per tile).
out.push('dataCategory=' + (s.match(/data-category="/g) || []).length);

// Show the list container region.
lines.forEach((line, i) => {
    if (/id="artykulyList"|articlesEmptyState|articlesCategories|articlesPagination|articlesSearch/.test(line)) {
        out.push((i + 1) + ': ' + line.trim().slice(0, 160));
    }
});

// Any dynamic loading of articles?
const dyn = [];
lines.forEach((line, i) => {
    if (/fetch\(|list\.php|articles-data|loadArticles|applyArticlesPagination|\.innerHTML/.test(line)) {
        dyn.push((i + 1) + ': ' + line.trim().slice(0, 160));
    }
});
out.push('--- dynamic refs ---');
out.push(dyn.join('\n'));

fs.writeFileSync('C:/Temp/ANALYZE.txt', out.join('\n') + '\n');
console.log('ok');
