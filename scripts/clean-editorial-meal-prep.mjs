/**
 * Usuwa akapity „Typowy posiłek z…” / „Meal prep z…” i wzmianki o meal prep.
 * node scripts/clean-editorial-meal-prep.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const editorialPath = path.join(__dirname, 'product-editorial.json');
const editorial = JSON.parse(fs.readFileSync(editorialPath, 'utf8'));

function shouldDropParagraph(p) {
    return (
        /^Typowy posiłek z/i.test(p) ||
        /^Meal prep z/i.test(p) ||
        /^Meal prep na/i.test(p)
    );
}

function cleanInline(text) {
    return text
        .replace(/Świetny na meal prep zimą/gi, 'Świetny na zimę')
        .replace(/Świetna na zimę i meal prep/gi, 'Świetna na zimę')
        .replace(/\s+lub meal prep\b/gi, ' obok')
        .replace(/meal prep na 2 dni/gi, 'drugi dzień w lodówce')
        .replace(/to szybki meal prep/gi, 'to szybki dodatek do obiadu')
        .replace(/to pełny meal prep/gi, 'to pełny obiad')
        .replace(/to modny meal prep/gi, 'to wygodna baza obiadu')
        .replace(/warzywo do meal prep/gi, 'warzywo do obiadu')
        .replace(/meal prep/gi, '')
        .replace(/\s{2,}/g, ' ')
        .replace(/\s+—/g, ' —')
        .trim();
}

let changed = 0;

for (const [slug, entry] of Object.entries(editorial)) {
    const before = JSON.stringify(entry);
    entry.title = cleanInline(entry.title || '');
    entry.paragraphs = entry.paragraphs
        .filter((p) => !shouldDropParagraph(p))
        .map(cleanInline)
        .filter(Boolean);
    if (JSON.stringify(entry) !== before) {
        editorial[slug] = entry;
        changed++;
    }
}

fs.writeFileSync(editorialPath, JSON.stringify(editorial, null, 2) + '\n', 'utf8');
console.log(`Wyczyszczono ${changed} wpisów w product-editorial.json`);
