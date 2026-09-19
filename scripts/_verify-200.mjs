import fs from 'fs';
const root = 'C:/Users/Administrator xD/Desktop/probystronyxd';
const s = fs.readFileSync(root + '/js/products-data-raw.js', 'utf8');
const db = JSON.parse(s.slice(s.indexOf('['), s.lastIndexOf('];') + 1));
const liteSrc = fs.readFileSync(root + '/js/products-lite.js', 'utf8');
const lite = JSON.parse(liteSrc.match(/const productsDatabaseLite = (\[[\s\S]*\]);/)[1]);
const np = JSON.parse(fs.readFileSync(root + '/scripts/new-products-200.json', 'utf8'));

const REMOVED = [
    'Gęś (mięso)', 'Chorizo', 'Królik (tuszka)', 'Jagnięcina (comber)', 'Cielęcina (sznycel)',
    'Mleko A2', 'Śmietana kremówka 36%', 'Jogurt skyr waniliowy', 'Ser Pecorino', 'Ser Lazur',
    'Bób (gotowany)', 'Koper włoski (fenkuł)', 'Szpinak mrożony', 'Persymona (kaki)',
    'Mleko migdałowe (niesłodzone)', 'Ryż jaśminowy (suchy)', 'Ryż arborio (suchy)'
];

const names = new Set(np.map((p) => p.name));
const dbNew = db.filter((p) => names.has(p.name));
const liteNames = new Set(lite.map((p) => p.name));
const liteSlugs = new Set(lite.map((p) => p.slug));

console.log('== INTEGRALNOŚĆ 200 ==');
console.log('JSON:', np.length, '| w bazie:', dbNew.length, '| w products-lite:', np.filter((p) => liteNames.has(p.name)).length);

const stillDb = REMOVED.filter((n) => db.some((p) => p.name === n));
const stillLite = REMOVED.filter((n) => liteNames.has(n));
console.log('\n== USUNIĘTE DUPLIKATY ==');
console.log('usunięto:', REMOVED.length, '| zostały w bazie:', stillDb.length, '| zostały w lite:', stillLite.length, stillDb.concat(stillLite).join(', '));

const missingPage = [], missingImg = [];
for (const r of dbNew) {
    const slug = r.slug;
    if (!fs.existsSync(`${root}/produkty/${slug}.html`)) missingPage.push(r.name);
    if (!fs.existsSync(`${root}/images/products/${slug}.jpg`)) missingImg.push(r.name);
}
console.log('\n== PLIKI 200 ==');
console.log('brak strony HTML:', missingPage.length, missingPage.join(', '));
console.log('brak grafiki JPG:', missingImg.length, missingImg.join(', '));

console.log('\n== POLA PRODUKTU ==');
const bad = dbNew.filter((p) => !(p.servingPricePln > 0) || !(p.pricePer100g > 0) || p.servingGrams == null || !p.slug || !p.microsDetail || Object.keys(p.microsDetail).length === 0);
console.log('rekordy z brakami:', bad.length, bad.map((p) => p.name).join(', '));
const keyCounts = dbNew.map((p) => Object.keys(p.microsDetail || {}).length);
const avg = Math.round((keyCounts.reduce((a, b) => a + b, 0) / keyCounts.length) * 10) / 10;
console.log(`mikroskładniki: min=${Math.min(...keyCounts)} avg=${avg} max=${Math.max(...keyCounts)} kluczy`);
const pk = dbNew.map((p) => p.pricePer100gProtein).filter((v) => v != null).sort((a, b) => a - b);
console.log(`cena białka: n=${pk.length} min=${pk[0]} med=${pk[Math.floor(pk.length / 2)]} max=${pk[pk.length - 1]} zł/100g`);
const pr = dbNew.map((p) => p.pricePer100g).sort((a, b) => a - b);
console.log(`cena produktu: min=${pr[0]} med=${pr[Math.floor(pr.length / 2)]} max=${pr[pr.length - 1]} zł/100g`);