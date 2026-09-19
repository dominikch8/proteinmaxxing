import fs from 'fs';
const root = 'C:/Users/Administrator xD/Desktop/probystronyxd';
const np = JSON.parse(fs.readFileSync(root + '/scripts/new-products-200.json', 'utf8'));
const s = fs.readFileSync(root + '/js/products-data-raw.js', 'utf8');
const db = JSON.parse(s.slice(s.indexOf('['), s.lastIndexOf('];') + 1));

function norm(s) {
  return String(s)
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/ą/g, 'a').replace(/ć/g, 'c').replace(/ę/g, 'e').replace(/ł/g, 'l')
    .replace(/ń/g, 'n').replace(/ó/g, 'o').replace(/ś/g, 's').replace(/ź/g, 'z').replace(/ż/g, 'z')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^a-z0-9%]+/g, ' ')
    .trim();
}
const STOP = new Set(['z', 'ze', 'i', 'w', 'na', 'do', 'a', 'typ', 'typu', 'tłuszczu']);
const key = (x) => [...new Set(norm(x).split(' ').filter(Boolean))].sort().join(' ');
const keyNoStop = (x) => [...new Set(norm(x).split(' ').filter((t) => t && !STOP.has(t)))].sort().join(' ');

console.log('=== MOJE 200 vs CAŁA BAZA (klucz pełny lub bez spójników) ===');
let found = 0;
for (const p of np) {
  const k = key(p.name), k2 = keyNoStop(p.name);
  const hits = db.filter((d) => d.name !== p.name && (key(d.name) === k || keyNoStop(d.name) === k2));
  if (hits.length) {
    found++;
    console.log(`"${p.name}"  ==  ${hits.map((h) => `"${h.name}" [${h.category}]`).join(', ')}`);
  }
}
console.log('podejrzanych:', found);

console.log('\n=== WEWNĄTRZ MOICH 200: klucz bez spójników ===');
const byKey = {};
for (const p of np) (byKey[keyNoStop(p.name)] = byKey[keyNoStop(p.name)] || []).push(p.name);
for (const [k, v] of Object.entries(byKey)) if (v.length > 1) console.log(k, '=>', v.join(' | '));