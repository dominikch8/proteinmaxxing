import fs from 'fs';
import path from 'path';

function slugify(name) {
    return name
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
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

const raw = fs.readFileSync('js/products-data-raw.js', 'utf8');
const a = JSON.parse(raw.slice(raw.indexOf('['), raw.lastIndexOf('];') + 1));
const pasta = a.filter(
    (p) =>
        p.category === 'makarony' &&
        /makaron/i.test(p.name) &&
        /\(suchy\)|\(sucha\)/i.test(p.name)
);

let patched = 0;
for (const p of pasta) {
    const slug = p.slug || slugify(p.name);
    for (const dir of ['produkty', 'deploy-bundle/produkty']) {
        const fp = path.join(dir, `${slug}.html`);
        if (!fs.existsSync(fp)) {
            console.log('missing', fp);
            continue;
        }
        let html = fs.readFileSync(fp, 'utf8');
        const before = html;
        html = html
            .replaceAll('dieta#produkty/kategoria/zboza', 'dieta#produkty/kategoria/makarony')
            .replaceAll('>Zboża i kasze<', '>Makarony<')
            .replaceAll('Kategoria: Zboża i kasze', 'Kategoria: Makarony')
            .replaceAll('href="kategoria/zboza"', 'href="kategoria/makarony"');
        if (html !== before) {
            fs.writeFileSync(fp, html);
            patched++;
            console.log('patched', fp);
        } else {
            console.log('no change', fp);
        }
    }
}
console.log('patched files', patched);
