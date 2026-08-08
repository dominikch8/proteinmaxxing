import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { declineProductName } from './polish-cases.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'produkty');

const files = fs.readdirSync(dir).filter((f) => f.endsWith('.html') && !f.includes(path.sep));
let nomAfterTrakt = 0;
let okTrakt = 0;
const nomSamples = [];

for (const file of files) {
    const html = fs.readFileSync(path.join(dir, file), 'utf8');
    const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
    const name = titleMatch ? titleMatch[1].trim() : null;
    if (!name) continue;

    const trakt = [...html.matchAll(/traktować <span class="product-name-inline">([^<]+)<\/span>/g)];
    for (const m of trakt) {
        const expected = declineProductName(name, 'gen');
        if (m[1] === name && expected !== name) {
            nomAfterTrakt++;
            nomSamples.push(`${file}: ${m[1]} (exp ${expected})`);
        } else {
            okTrakt++;
        }
    }
}

console.log({ files: files.length, okTrakt, nomAfterTrakt });
for (const s of nomSamples) console.log(s);

// Spot-check known products
for (const slug of ['poledwica-sopocka', 'mieso-mielone-wolowe', 'barszcz-czerwony', 'bulka-kajzerka', 'ser-zolty-plastry', 'ser-zolty']) {
    const fp = path.join(dir, `${slug}.html`);
    if (!fs.existsSync(fp)) {
        console.log('missing', slug);
        continue;
    }
    const html = fs.readFileSync(fp, 'utf8');
    const spans = [...html.matchAll(/<span class="product-name-inline">([^<]+)<\/span>/g)].map((m) => m[1]);
    console.log(slug, '→', [...new Set(spans)].join(' | '));
}
