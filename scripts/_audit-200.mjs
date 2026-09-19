import fs from 'fs';
const root = 'C:/Users/Administrator xD/Desktop/probystronyxd';
const s = fs.readFileSync(root + '/js/products-data-raw.js', 'utf8');
const db = JSON.parse(s.slice(s.indexOf('['), s.lastIndexOf('];') + 1));
const np = JSON.parse(fs.readFileSync(root + '/scripts/new-products-200.json', 'utf8'));
const names = new Set(np.map((p) => p.name));
const added = db.filter((p) => names.has(p.name));

const keys = {};
for (const p of added) {
  for (const [k, v] of Object.entries(p.microsDetail || {})) {
    (keys[k] = keys[k] || []).push(Number(v));
  }
}
console.log('=== ODCHYLENIA kcal (4/4/9) > 10 ===');
const devs = added
  .map((p) => ({ n: p.name, kcal: p.kcal, calc: Math.round(4 * p.protein + 4 * p.carbs + 9 * p.fat), d: Math.round((4 * p.protein + 4 * p.carbs + 9 * p.fat - p.kcal) * 10) / 10 }))
  .filter((x) => Math.abs(x.d) > 10)
  .sort((a, b) => Math.abs(b.d) - Math.abs(a.d));
for (const x of devs) console.log(`${x.n.padEnd(30)} kcal=${x.kcal} 4/4/9=${x.calc} d=${x.d}`);

console.log('\n=== 3 produkty z mało mikro ===');
for (const n of ['Olej z orzechów włoskich', 'Olej z pestek dyni', 'Smalec gęsi']) {
  const p = added.find((x) => x.name === n);
  console.log(n, JSON.stringify(p.microsDetail));
}

console.log('\n=== TOP 10 pricePer100gProtein ===');
added.filter((p) => p.pricePer100gProtein).sort((a, b) => b.pricePer100gProtein - a.pricePer100gProtein).slice(0, 10)
  .forEach((p) => console.log(`${p.name.padEnd(32)} ${p.pricePer100gProtein} zł/100g białka (${p.pricePer100g}/100g)`));

console.log('\n=== produkty bez ceny białka ===');
console.log(added.filter((p) => p.pricePer100gProtein == null).map((p) => p.name).join(' | '));