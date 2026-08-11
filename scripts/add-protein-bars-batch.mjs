/**
 * Dodaje batony proteinowe: WK DZIK, Nick's, F**king Protein, Protein 33/50%, Go On Crisp.
 * node scripts/add-protein-bars-batch.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const rawPath = path.join(root, 'js', 'products-data-raw.js');

function slugify(name) {
    return String(name)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/ą/g, 'a')
        .replace(/ć/g, 'c')
        .replace(/ę/g, 'e')
        .replace(/ł/g, 'l')
        .replace(/ń/g, 'n')
        .replace(/ó/g, 'o')
        .replace(/ś/g, 's')
        .replace(/ź/g, 'z')
        .replace(/ż/g, 'z')
        .replace(/\*/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

const NEW = [
    {
        name: 'WK DZIK baton proteinowy',
        emoji: '🍫',
        category: 'batony-proteinowe',
        servingText: 'sztuka (73g)',
        servingRatio: 0.73,
        servingGrams: 73,
        kcal: 392,
        protein: 41,
        carbs: 26,
        fat: 14,
        satFat: 7.8,
        unsatFat: 6.2,
        micros: 'Wapń, Magnez, Fosfor',
        extra: 'Baton WK DZIK — ok. 30 g białka na sztukę (73 g), niska zawartość cukru.',
    },
    {
        name: "Nick's Protein Bar",
        emoji: '🍫',
        category: 'batony-proteinowe',
        servingText: 'sztuka (50g)',
        servingRatio: 0.5,
        servingGrams: 50,
        kcal: 380,
        protein: 30,
        carbs: 28,
        fat: 18.4,
        satFat: 9.6,
        unsatFat: 8.8,
        micros: 'Wapń, Magnez',
        extra: 'Szwedzki baton Nick’s — bez dodatku cukru, ok. 15 g białka na sztukę.',
    },
    {
        name: 'F**king Protein',
        emoji: '🍫',
        category: 'batony-proteinowe',
        servingText: 'sztuka (55g)',
        servingRatio: 0.55,
        servingGrams: 55,
        kcal: 382,
        protein: 36,
        carbs: 35,
        fat: 15,
        satFat: 9.3,
        unsatFat: 5.7,
        micros: 'Wapń, Żelazo',
        extra: 'Allnutrition F**king Delicious Protein — ok. 20 g białka i mało cukru na baton.',
    },
    {
        name: 'Protein 33%',
        emoji: '🍫',
        category: 'batony-proteinowe',
        servingText: 'sztuka (50g)',
        servingRatio: 0.5,
        servingGrams: 50,
        kcal: 391,
        protein: 33,
        carbs: 21,
        fat: 19,
        satFat: 9.3,
        unsatFat: 9.7,
        micros: 'Witamina C, Witamina E, Witamina B6, Magnez',
        extra: 'Go On / Sante Protein 33% — ok. 16–17 g białka na sztukę, z witaminami.',
    },
    {
        name: 'Protein 50%',
        emoji: '🍫',
        category: 'batony-proteinowe',
        servingText: 'sztuka (40g)',
        servingRatio: 0.4,
        servingGrams: 40,
        kcal: 403,
        protein: 50,
        carbs: 22,
        fat: 16,
        satFat: 6.9,
        unsatFat: 9.1,
        micros: 'Wapń, Magnez',
        extra: 'Go On Protein 50% — aż 20 g białka w 40 g batonie, bez dodatku cukru.',
    },
    {
        name: 'Go On Protein Crisp',
        emoji: '🍫',
        category: 'batony-proteinowe',
        servingText: 'sztuka (50g)',
        servingRatio: 0.5,
        servingGrams: 50,
        kcal: 421,
        protein: 20,
        carbs: 53,
        fat: 16,
        satFat: 9.6,
        unsatFat: 6.4,
        micros: 'Wapń, Żelazo',
        extra: 'Chrupiący Go On Protein Crisp — ok. 10 g białka WPC na sztukę.',
    },
];

const text = fs.readFileSync(rawPath, 'utf8');
const m = text.match(/productsDatabaseRaw = (\[[\s\S]*\]);/);
if (!m) throw new Error('Nie znaleziono productsDatabaseRaw');
const products = JSON.parse(m[1]);
const bySlug = new Set(products.map((p) => p.slug || slugify(p.name)));
const byName = new Set(products.map((p) => p.name.toLowerCase()));

let added = 0;
for (const np of NEW) {
    const slug = slugify(np.name);
    if (byName.has(np.name.toLowerCase()) || bySlug.has(slug)) {
        console.log('skip exists', np.name);
        continue;
    }
    products.push({ ...np, slug });
    bySlug.add(slug);
    byName.add(np.name.toLowerCase());
    added += 1;
    console.log('+', np.name, '→', slug);
}

fs.writeFileSync(rawPath, `const productsDatabaseRaw = ${JSON.stringify(products)};\n`, 'utf8');
fs.copyFileSync(rawPath, path.join(root, 'deploy-bundle/js/products-data-raw.js'));
console.log('added', added);

execSync('node scripts/calculate-serving-protein-prices.mjs', { cwd: root, stdio: 'inherit' });
execSync('node scripts/build-products-lite.mjs', { cwd: root, stdio: 'inherit' });
try {
    execSync('node scripts/build-product-micros.mjs', { cwd: root, stdio: 'inherit' });
} catch {
    console.warn('micros build skipped/failed');
}
execSync('node scripts/generate-product-pages.mjs', { cwd: root, stdio: 'inherit' });

// sync lite to deploy
for (const f of ['products-lite.js', 'products-data-raw.js']) {
    const src = path.join(root, 'js', f);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(root, 'deploy-bundle/js', f));
}

console.log('done');
