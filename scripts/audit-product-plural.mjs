/**
 * Audit product pages for singular/plural verb agreement.
 * node scripts/audit-product-plural.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { detectGender } from './polish-gender.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'produkty');

const plForms = new Set([
    'mają', 'bywają', 'są', 'wymagają', 'dają', 'mogą', 'pasują', 'pomagają', 'kryją',
    'łączą', 'dostarczają', 'pokazują', 'wpisują się', 'pojawiają się', 'wyróżniają się',
    'lądują', 'sprawdzają się', 'mieszczą się', 'pozwalają',
]);
const sgForms = new Set([
    'ma', 'bywa', 'jest', 'wymaga', 'daje', 'może', 'pasuje', 'pomaga', 'kryje',
    'łączy', 'dostarcza', 'pokazuje', 'wpisuje się', 'pojawia się', 'wyróżnia się',
    'ląduje', 'sprawdza się', 'mieści się', 'pozwala',
]);

const verbRe =
    /<span class="product-name-inline">([^<]+)<\/span>(\s+)(nie\s+)?(mają|ma|bywają|bywa|są|jest|wymagają|wymaga|dają|daje|mogą|może|pasują|pasuje|pomagają|pomaga|kryją|kryje|łączą|łączy|dostarczają|dostarcza|pokazują|pokazuje|wpisują się|wpisuje się|pojawiają się|pojawia się|wyróżniają się|wyróżnia się|lądują|ląduje|sprawdzają się|sprawdza się|mieszczą się|mieści się|pozwalają|pozwala)\b/g;

const issues = [];
for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.html'))) {
    const html = fs.readFileSync(path.join(dir, file), 'utf8');
    const h1 = html.match(/<h1[^>]*itemprop="name">([^<]+)<\/h1>/)?.[1]?.trim()
        || html.match(/<h1[^>]*>([^<]+)<\/h1>/)?.[1]?.trim();
    if (!h1) continue;
    const pageGender = detectGender(h1);
    let m;
    verbRe.lastIndex = 0;
    while ((m = verbRe.exec(html))) {
        const verb = m[4];
        const neg = m[3] || '';
        const shouldPl = pageGender === 'pl';
        const verbIsPl = plForms.has(verb);
        const verbIsSg = sgForms.has(verb);
        // Odmienione formy w span (dopełniacz itd.) — płeć bierz z nominatiwu strony
        if (shouldPl && verbIsSg) {
            issues.push({ file, name: h1, span: m[1], gender: pageGender, verb: `${neg}${verb}`, expect: 'PL' });
        } else if (!shouldPl && verbIsPl) {
            issues.push({ file, name: h1, span: m[1], gender: pageGender, verb: `${neg}${verb}`, expect: 'SG' });
        }
    }
}

console.log(`Issues: ${issues.length}`);
for (const i of issues) {
    console.log(`${i.expect} | ${i.file} | ${i.name} | ${i.verb} | gender=${i.gender}`);
}
