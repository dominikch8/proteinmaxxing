import fs from 'fs';

const len = (s) => [...s].length;
const pages = [
    'index.html',
    'dieta.html',
    'trening.html',
    'informacje.html',
    'o-mnie.html',
];

for (const p of pages) {
    const h = fs.readFileSync(p, 'utf8');
    const t = h.match(/property="og:title" content="([^"]+)"/)?.[1];
    const d = h.match(/property="og:description" content="([^"]+)"/)?.[1];
    const m = h.match(/name="description" content="([^"]+)"/)?.[1];
    console.log(`${p}:`);
    console.log(`  og:title: ${len(t)}`);
    console.log(`  og:desc:  ${len(d)}`);
    console.log(`  meta desc: ${len(m)} | ${m}`);
}

const ph = fs.readFileSync('produkty/krupnik.html', 'utf8');
const pt = ph.match(/property="og:title" content="([^"]+)"/)?.[1];
const pd = ph.match(/property="og:description" content="([^"]+)"/)?.[1];
const pm = ph.match(/name="description" content="([^"]+)"/)?.[1];
console.log('produkty/krupnik.html (przykład):');
console.log(`  og:title: ${len(pt)}`);
console.log(`  og:desc:  ${len(pd)}`);
console.log(`  meta desc: ${len(pm)} | ${pm}`);
