import fs from 'fs';
const root = 'C:/Users/Administrator xD/Desktop/probystronyxd';
const s = fs.readFileSync(root + '/js/products-data-raw.js', 'utf8');
const db = JSON.parse(s.slice(s.indexOf('['), s.lastIndexOf('];') + 1));

function norm(x) {
  return String(x).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/ą/g, 'a').replace(/ć/g, 'c').replace(/ę/g, 'e').replace(/ł/g, 'l')
    .replace(/ń/g, 'n').replace(/ó/g, 'o').replace(/ś/g, 's').replace(/ź/g, 'z').replace(/ż/g, 'z')
    .replace(/[^a-z0-9]+/g, ' ').trim();
}
const core = (x) => [...new Set(norm(x).split(' ').filter((t) => t && !['z', 'ze', 'i', 'w', 'na', 'do', 'a', 'typ', 'typu'].includes(t)))].sort().join(' ');
const coreSet = db.map((p) => core(p.name));

const cands = process.argv.slice(2);
for (const c of cands) {
  const k = core(c);
  const exact = db.find((p) => p.name === c);
  const hit = db.filter((p, i) => i < coreSet.length && (coreSet[i] === k || norm(p.name) === norm(c) || coreSet[i].includes(k) || k.includes(coreSet[i])));
  const related = db.filter((p) => {
    const a = new Set(norm(p.name).split(' ')), b = new Set(norm(c).split(' '));
    const common = [...a].filter((t) => b.has(t)).length;
    return common >= Math.min(a.size, b.size) - 1 && common >= 1;
  }).slice(0, 4).map((p) => p.name);
  console.log(`${(exact ? 'EXACT-DUP' : hit.length ? 'DUP?     ' : 'FREE     ')}  "${c}"${hit.length ? '  -> ' + hit.map((h) => h.name).join(', ') : ''}${related.length ? '   ~ ' + related.join(', ') : ''}`);
}