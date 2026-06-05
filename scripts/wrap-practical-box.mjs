import fs from 'fs';

const files = fs.readdirSync('.').filter((f) => f.startsWith('skladniki-') && f.endsWith('.html'));
const re = /(\s*)<h2>Praktyczne porady<\/h2>([\s\S]*?)(\s*)<h2>Produkty w bazie<\/h2>/;

for (const f of files) {
    let html = fs.readFileSync(f, 'utf8');
    if (html.includes('poradnik-practical-box')) {
        console.log('skip', f);
        continue;
    }
    const m = html.match(re);
    if (!m) {
        console.log('no match', f);
        continue;
    }
    const wrapped =
        `${m[1]}<div class="poradnik-practical-box">
${m[1]}    <h2>Praktyczne porady</h2>${m[2]}${m[1]}</div>${m[3]}<h2>Produkty w bazie</h2>`;
    html = html.replace(re, wrapped);
    fs.writeFileSync(f, html);
    console.log('ok', f);
}
