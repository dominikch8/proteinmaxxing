/**
 * W napojach: usuń marki wody, zostaw jedną pozycję „Woda”.
 * node scripts/consolidate-woda.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const REMOVE = new Set(['Żywiec Zdrój niegazowana', 'Cisowianka niegazowana']);
const REMOVE_SLUGS = ['zywiec-zdroj-niegazowana', 'cisowianka-niegazowana'];

const WODA = {
    name: 'Woda',
    emoji: '💧',
    category: 'napoje',
    servingText: 'szklanka (250 ml)',
    servingRatio: 2.5,
    kcal: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    satFat: 0,
    unsatFat: 0,
    micros: '-',
    extra: 'Podstawowy napój bez kalorii — nawodnienie bez wpływu na bilans makro.',
    servingGrams: 250,
    servingPricePln: 0,
    proteinInServing: 0,
    pricePer100gProtein: null,
};

function patchRaw(rel) {
    const p = path.join(root, rel);
    if (!fs.existsSync(p)) return;
    const raw = fs.readFileSync(p, 'utf8');
    const start = raw.indexOf('[');
    const end = raw.lastIndexOf('];');
    const arr = JSON.parse(raw.slice(start, end + 1));
    const filtered = arr.filter((x) => !REMOVE.has(x.name) && x.name !== 'Woda');
    // wstaw Wodę w miejscu pierwszej usuniętej wody / na końcu napojów
    const firstNapoje = filtered.findIndex((x) => x.category === 'napoje');
    let insertAt = filtered.length;
    if (firstNapoje >= 0) {
        // po Monster Energy / przed sokami — szukaj Kubuś lub Oshee
        const kubus = filtered.findIndex((x) => x.name === 'Kubuś jabłkowy');
        insertAt = kubus >= 0 ? kubus : firstNapoje + 1;
    }
    filtered.splice(insertAt, 0, { ...WODA });
    fs.writeFileSync(p, raw.slice(0, start) + JSON.stringify(filtered) + raw.slice(end + 1));
    console.log(rel, '→', filtered.length, 'products (added Woda)');
}

function unlinkGlob(relDir, slug) {
    const dir = path.join(root, relDir);
    if (!fs.existsSync(dir)) return;
    for (const ext of ['html', 'png', 'jpg', 'webp', 'svg']) {
        const candidates =
            ext === 'html'
                ? [path.join(dir, `${slug}.html`)]
                : [path.join(dir, `${slug}.${ext}`)];
        for (const fp of candidates) {
            if (fs.existsSync(fp)) {
                fs.unlinkSync(fp);
                console.log('del', path.relative(root, fp));
            }
        }
    }
}

patchRaw('js/products-data-raw.js');
patchRaw('deploy-bundle/js/products-data-raw.js');

for (const slug of REMOVE_SLUGS) {
    unlinkGlob('produkty', slug);
    unlinkGlob('deploy-bundle/produkty', slug);
    unlinkGlob('images/products', slug);
    unlinkGlob('deploy-bundle/images/products', slug);
}

// product pages live under produkty/; images under images/products/
for (const slug of REMOVE_SLUGS) {
    for (const base of ['produkty', 'deploy-bundle/produkty']) {
        const fp = path.join(root, base, `${slug}.html`);
        if (fs.existsSync(fp)) {
            fs.unlinkSync(fp);
            console.log('del', path.relative(root, fp));
        }
    }
    for (const base of ['images/products', 'deploy-bundle/images/products']) {
        for (const ext of ['png', 'jpg', 'webp', 'svg']) {
            const fp = path.join(root, base, `${slug}.${ext}`);
            if (fs.existsSync(fp)) {
                fs.unlinkSync(fp);
                console.log('del', path.relative(root, fp));
            }
        }
    }
}

// patch add-napoje script source list
const addPath = path.join(root, 'scripts/add-napoje-category.mjs');
let addSrc = fs.readFileSync(addPath, 'utf8');
addSrc = addSrc.replace(
    /\{\s*name: 'Żywiec Zdrój niegazowana',[\s\S]*?\},\s*\{\s*name: 'Cisowianka niegazowana',[\s\S]*?\},/,
    `{
        name: 'Woda',
        emoji: '💧',
        category: 'napoje',
        servingText: 'szklanka (250 ml)',
        servingRatio: 2.5,
        kcal: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        satFat: 0,
        unsatFat: 0,
        micros: '-',
        extra: 'Podstawowy napój bez kalorii — nawodnienie bez wpływu na bilans makro.',
    },`
);
fs.writeFileSync(addPath, addSrc);
console.log('updated add-napoje-category.mjs');

// htaccess redirects
const ht = path.join(root, '.htaccess');
let htaccess = fs.readFileSync(ht, 'utf8');
const rules = [
    'RewriteRule ^produkty/zywiec-zdroj-niegazowana/?$ /produkty/woda [R=301,L]',
    'RewriteRule ^produkty/cisowianka-niegazowana/?$ /produkty/woda [R=301,L]',
];
for (const rule of rules) {
    if (!htaccess.includes(rule)) {
        htaccess = htaccess.replace(
            '# Usunięty produkt Olimp Matrix Pro',
            `${rule}\n# Usunięty produkt Olimp Matrix Pro`
        );
        if (!htaccess.includes(rule)) {
            htaccess = htaccess.replace(
                'RewriteRule ^produkty/olimp-matrix-pro/?$ /dieta [R=301,L]',
                `${rule}\nRewriteRule ^produkty/olimp-matrix-pro/?$ /dieta [R=301,L]`
            );
        }
    }
}
fs.writeFileSync(ht, htaccess);
console.log('htaccess redirects OK');

function run(cmd) {
    console.log('>', cmd);
    const r = spawnSync(cmd, { shell: true, cwd: root, encoding: 'utf8' });
    if (r.stdout) process.stdout.write(r.stdout);
    if (r.stderr) process.stderr.write(r.stderr);
    if (r.status !== 0) process.exit(r.status || 1);
}

run('node scripts/calculate-serving-protein-prices.mjs');
run('node scripts/build-products-lite.mjs');
run('node scripts/generate-product-pages.mjs');
