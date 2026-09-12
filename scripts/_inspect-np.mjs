import fs from 'fs';
const root = 'C:/Users/Administrator xD/Desktop/probystronyxd';
const j = JSON.parse(fs.readFileSync(root + '/scripts/new-products-200.json', 'utf8'));
const byCat = {};
for (const p of j) byCat[p.category] = (byCat[p.category] || 0) + 1;
console.log('TOTAL', j.length);
console.log(JSON.stringify(byCat));
// duplicates
const seen = {}, dup = [];
for (const p of j) { if (seen[p.name]) dup.push(p.name); seen[p.name] = 1; }
console.log('DUP in file:', dup.join(' | ') || 'none');
// missing fields
const bad = j.filter(p => !p.name || !p.category || p.kcal == null || p.protein == null || p.carbs == null || p.fat == null || !p.servingText || p.servingRatio == null || !p.micros || !p.extra || p.pricePerKg == null);
console.log('MISSING FIELDS:', bad.length);
for (const p of bad.slice(0, 20)) console.log('  -', p.name, Object.keys(p).join(','));
fs.writeFileSync('C:/Users/Administrator xD/.cline/data/workspaces/chat/_npnames.txt', j.map(p => p.category + '\t' + p.name).join('\n'), 'utf8');
