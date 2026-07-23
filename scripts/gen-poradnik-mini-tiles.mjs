import fs from 'fs';

const products = JSON.parse(
    fs.readFileSync('js/products-data-raw.js', 'utf8').match(/const productsDatabaseRaw = (\[.*\]);/s)[1]
);

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

const seen = {};
const byName = {};
for (const p of products) {
    let slug = slugify(p.name);
    const base = slug;
    let n = 2;
    while (seen[slug]) slug = `${base}-${n++}`;
    seen[slug] = true;
    byName[p.name] = { ...p, slug };
}

function tile(name, value) {
    const p = byName[name];
    if (!p) throw new Error(`Unknown product: ${name}`);
    const val = value ? `\n                            <span class="poradnik-product-mini-value">${value}</span>` : '';
    return `                        <a href="produkty/${p.slug}.html" class="poradnik-product-mini">
                            <span class="poradnik-product-mini-emoji" aria-hidden="true">${p.emoji}</span>
                            <span class="poradnik-product-mini-name">${p.name}</span>${val}
                        </a>`;
}

function block(labelMost, most, labelLeast, least) {
    const mostTiles = most.map(([n, v]) => tile(n, v)).join('\n');
    const leastTiles = least.map(([n, v]) => tile(n, v)).join('\n');
    return `                <h2>Produkty w bazie</h2>
                <div class="poradnik-product-ranks">
                    <div class="poradnik-product-rank-group">
                        <p class="poradnik-product-rank-label">${labelMost}</p>
                        <div class="poradnik-product-mini-grid">
${mostTiles}
                        </div>
                    </div>
                    <div class="poradnik-product-rank-group">
                        <p class="poradnik-product-rank-label">${labelLeast}</p>
                        <div class="poradnik-product-mini-grid">
${leastTiles}
                        </div>
                    </div>
                </div>`;
}

const blocks = {
    kalorie: block(
        'Najwięcej kcal na 100 g',
        [
            ['Smalec', '902 kcal'],
            ['Masło klarowane (ghee)', '900 kcal'],
            ['Oliwa z oliwek', '884 kcal']
        ],
        'Najmniej',
        [
            ['Kiszony ogórek', '11 kcal'],
            ['Ogórek', '14 kcal'],
            ['Sałata masłowa', '14 kcal']
        ]
    ),
    bialko: block(
        'Najwięcej białka na 100 g',
        [
            ['Izolat Białka (WPI)', '85 g'],
            ['Koncentrat białka serwatkowego (WPC)', '75 g'],
            ['Ser Parmezan', '38 g']
        ],
        'Najmniej',
        [
            ['Ogórek', '0,7 g'],
            ['Jabłko', '0,3 g'],
            ['Miód', '0,3 g']
        ]
    ),
    weglowodany: block(
        'Najwięcej węglowodanów na 100 g',
        [
            ['Płatki Corn Flakes', '84 g'],
            ['Makaron ryżowy (suchy)', '84 g'],
            ['Żurawina suszona', '82 g']
        ],
        'Najmniej',
        [
            ['Pierś z kurczaka', '0 g'],
            ['Dorsz świeży', '0 g'],
            ['Wołowina (polędwica)', '0 g']
        ]
    ),
    tluszcz: block(
        'Najwięcej tłuszczu na 100 g',
        [
            ['Oliwa z oliwek', '100 g'],
            ['Olej rzepakowy', '100 g'],
            ['Smalec', '100 g']
        ],
        'Najmniej',
        [
            ['Skyr naturalny', '0 g'],
            ['Sos sojowy', '0 g'],
            ['Żelki', '0 g']
        ]
    ),
    nasycone: block(
        'Najwięcej tłuszczów nasyconych na 100 g',
        [
            ['Olej kokosowy', '87 g'],
            ['Masło klarowane (ghee)', '63 g'],
            ['Kokos suszony (wiórki)', '57 g']
        ],
        'Najmniej',
        [
            ['Skyr naturalny', '0 g'],
            ['Białka jaj', '0 g'],
            ['Ogórek', '0 g']
        ]
    ),
    nienasycone: block(
        'Najwięcej tłuszczów nienasyconych na 100 g',
        [
            ['Olej rzepakowy', '93 g'],
            ['Olej lniany', '91 g'],
            ['Olej słonecznikowy', '90 g']
        ],
        'Najmniej',
        [
            ['Skyr naturalny', '0 g'],
            ['Sos sojowy', '0 g'],
            ['Żelki', '0 g']
        ]
    ),
    blonnik: block(
        'Najwięcej błonnika (wg opisu w bazie)',
        [
            ['Maliny', null],
            ['Nasiona chia', null],
            ['Kasza gryczana', null]
        ],
        'Najmniej',
        [
            ['Pierś z kurczaka', null],
            ['Dorsz świeży', null],
            ['Oliwa z oliwek', null]
        ]
    ),
    witaminy: block(
        'Najbogatsze (wg opisu w bazie)',
        [
            ['Papryka czerwona', null],
            ['Szpinak świeży', null],
            ['Brokuły', null]
        ],
        'Najuboższe',
        [
            ['Oliwa z oliwek', null],
            ['Nuggetsy z kurczaka', null],
            ['Budyń na mleku', null]
        ]
    ),
    mineraly: block(
        'Najbogatsze (wg opisu w bazie)',
        [
            ['Wołowina (polędwica)', null],
            ['Amarantus', null],
            ['Migdały', null]
        ],
        'Najuboższe',
        [
            ['Ogórek', null],
            ['Kiszony ogórek', null],
            ['Oliwa z oliwek', null]
        ]
    )
};

const fileMap = {
    kalorie: 'skladniki-kalorie.html',
    bialko: 'skladniki-bialko.html',
    weglowodany: 'skladniki-weglowodany.html',
    tluszcz: 'skladniki-tluszcz.html',
    nasycone: 'skladniki-tluszcze-nasycone.html',
    nienasycone: 'skladniki-tluszcze-nienasycone.html',
    blonnik: 'skladniki-blonnik.html',
    witaminy: 'skladniki-witaminy.html',
    mineraly: 'skladniki-mineraly.html'
};

const listRe =
    /<h2>Produkty w bazie<\/h2>\s*<ul>[\s\S]*?<\/ul>/;

for (const [key, file] of Object.entries(fileMap)) {
    const path = file;
    let html = fs.readFileSync(path, 'utf8');
    if (!listRe.test(html)) {
        console.error('No match:', path);
        continue;
    }
    html = html.replace(listRe, blocks[key]);
    fs.writeFileSync(path, html);
    console.log('Updated', path);
}
