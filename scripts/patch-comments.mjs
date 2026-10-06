/**
 * Wstrzykuje sekcję komentarzy do stron produktów i artykułów.
 *   node scripts/patch-comments.mjs --report   # dry-run, lista celów
 *   node scripts/patch-comments.mjs --write    # zapis zmian
 *
 * Reguły:
 *   - produkty/*.html  -> entity_type=product, slug = nazwa pliku
 *   - root *.html z markerem article-byline lub prefiksem art- -> entity_type=article
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const write = process.argv.includes('--write');

function collectTargets() {
    const targets = [];

    // produkty
    const prodDir = path.join(root, 'produkty');
    if (fs.existsSync(prodDir)) {
        for (const f of fs.readdirSync(prodDir)) {
            if (!f.endsWith('.html')) continue;
            targets.push({
                fp: path.join(prodDir, f),
                rel: 'produkty/' + f,
                type: 'product',
                slug: f.replace(/\.html$/, ''),
                prefix: '../'
            });
        }
    }

    // artykuły w root
    for (const f of fs.readdirSync(root)) {
        if (!f.endsWith('.html')) continue;
        const fp = path.join(root, f);
        const html = fs.readFileSync(fp, 'utf8');
        const isArticle = html.includes('article-byline') || f.startsWith('art-');
        if (!isArticle) continue;
        targets.push({ fp, rel: f, type: 'article', slug: f.replace(/\.html$/, ''), prefix: '' });
    }

    return targets;
}

const targets = collectTargets();

let changed = 0;
let skipped = 0;
const rows = [];

for (const t of targets) {
    const html = fs.readFileSync(t.fp, 'utf8');

    if (html.includes('id="comments"')) {
        skipped++;
        continue;
    }

    const cssLink = `<link rel="stylesheet" href="${t.prefix}css/comments.css">`;
    const container = `<div id="comments" class="comments" data-entity-type="${t.type}" data-entity-slug="${t.slug}"></div>`;
    const scriptTag = `<script src="${t.prefix}js/comments.js"></script>`;

    let next = html;
    if (!next.includes('comments.css')) {
        next = next.replace('</head>', cssLink + '\n</head>');
    }
    if (next.includes('</main>')) {
        next = next.replace('</main>', container + '\n</main>');
    } else {
        next = next.replace('</body>', container + '\n</body>');
    }
    if (!next.includes('comments.js')) {
        next = next.replace('</body>', scriptTag + '\n</body>');
    }

    if (next !== html) {
        rows.push(t.rel + '\t' + t.type + '\t' + t.slug);
        if (write) fs.writeFileSync(t.fp, next, 'utf8');
        changed++;
    }
}

console.log(`${write ? 'ZAPISANO' : 'DRY-RUN'} — cele: ${targets.length}, do zmiany: ${changed}, pominięte (już mają): ${skipped}`);
if (!write) {
    console.log('Przykładowe cele (pierwsze 25):');
    for (const r of rows.slice(0, 25)) console.log('  ' + r);
    console.log(`\nŁącznie ${rows.length} stron do zmiany. Uruchom z --write, aby zapisać.`);
}
