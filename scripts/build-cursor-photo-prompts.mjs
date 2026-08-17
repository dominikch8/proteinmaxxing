/**
 * Buduje prompty Cursor GenerateImage dla produktów bez cutoutu.
 * node scripts/build-cursor-photo-prompts.mjs > scripts/_cursor-photo-queue.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const need = JSON.parse(fs.readFileSync(path.join(root, 'scripts', '_new-photo-slugs.json'), 'utf8'));

const CAT = {
    warzywa: 'fresh vegetable edible food only',
    owoce: 'fresh fruit edible food only',
    nabial: 'dairy food product only',
    sery: 'cheese food product only',
    mieso: 'raw or cooked meat fish poultry edible food only',
    zboza: 'bread grain cereal bakery edible food only',
    napoje: 'beverage drink in clear glass, whole glass visible',
    alkohole: 'alcoholic drink in glass, whole glass visible',
    przyprawy: 'dry spice seasoning powder or herbs pile only',
    tluszcze: 'butter oil fat edible food only',
    sosy: 'sauce condiment edible food only',
    zupy: 'soup in white ceramic bowl, whole bowl visible',
    makarony: 'pasta edible food only',
    orzechy: 'nuts or seeds pile edible food only',
    slodycze: 'candy chocolate dessert edible food only',
    'platki-sniadaniowe': 'breakfast cereal edible food only',
    'polskie-obiadki': 'Polish cooked dish on plate or in bowl, vessel fully visible',
    'mrozone-pizze': 'whole round pizza edible food only',
    fastfood: 'fast food item edible only'
};

const SPECIAL = {
    nutella: 'chocolate hazelnut spread in open glass jar, blank label',
    whisky: 'amber whisky in short tumbler glass, whole glass visible',
    bulion: 'clear golden broth in white bowl, whole bowl visible, NOT lion animal',
    wodka: 'clear vodka in shot glass, whole glass visible',
    pepsi: 'dark cola soda in clear glass with ice, whole glass visible',
    'maka-pszenna-typ-550': 'small white bowl filled with fine pale wheat flour powder only, raw baking flour, NOT bread NOT loaf',
    'maka-pszenna': 'small white bowl filled with fine white wheat flour powder only, raw baking flour, NOT bread NOT loaf',
    sol: 'neat pile of white table salt crystals only, salt, NOT a vegetable'
};

function promptFor(p) {
    const special = SPECIAL[p.slug];
    const subject =
        special ||
        `${p.name.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim()}, ${CAT[p.category] || 'edible food product only'}`;
    return {
        slug: p.slug,
        name: p.name,
        category: p.category,
        description:
            `Photorealistic minimalist ecommerce food photo: ${subject}. ` +
            `Exact edible food or drink only, single neat portion, centered. ` +
            `Pure solid white background #FFFFFF, NO shadow, NO drop shadow, NO contact shadow, NO reflection, empty white margins. ` +
            `Keep entire product and vessel (bowl/glass/plate/jar) fully visible if present. Only the food and its vessel, nothing else. ` +
            `No people, no hands, no animals, no text, no logos, no watermark, sharp realistic detail.`
    };
}

const out = need.map(promptFor);
fs.writeFileSync(path.join(root, 'scripts', '_cursor-photo-queue.json'), JSON.stringify(out, null, 2));
console.log('wrote', out.length, 'prompts → scripts/_cursor-photo-queue.json');
console.log(out.slice(0, 5).map((x) => x.slug).join(', '));
