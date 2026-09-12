/**
 * Buduje artykuły hardcore z JSON → HTML + hub + home + sitemap + deploy-bundle.
 * node scripts/build-hardcore-articles.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const templatePath = path.join(__dirname, 'article-stub-template.html');

const batches = [
    'hardcore-articles-flagship.json',
    'hardcore-articles-batch1.json',
    'hardcore-articles-batch2.json',
    'hardcore-articles-batch3.json',
    'hardcore-articles-batch4.json',
    'hardcore-articles-leki.json',
    'hardcore-articles-tematyczne.json',
    'hardcore-articles-batch5.json',
    'hardcore-articles-batch6.json',
    'hardcore-articles-batch7.json',
    'hardcore-articles-batch8.json',
    'hardcore-articles-batch9.json'
];

// Mapa kategorii dla istniejących artykułów (slug -> kategoria)
const CATEGORY_MAP = {
    'zageszczone-soki-owocowe-a-witaminy': 'odzywianie',
    'deficyt-kaloryczny-praktyka': 'odchudzanie',
    'planowanie-posilkow': 'odzywianie',
    'produkty-bialkowe-czy-oplacalne': 'bialko',
    'mleko-bialkowe-a-kalorie': 'bialko',
    'najlepsze-zrodla-bialka-biedronka-lidl-auchan-carrefour': 'bialko',
    'zrodla-bialka-biedronka': 'bialko',
    'zrodla-bialka-lidl': 'bialko',
    'zrodla-bialka-auchan': 'bialko',
    'zrodla-bialka-carrefour': 'bialko',
    'ile-bialka-na-dzien': 'bialko',
    'wegetarianskie-zrodla-bialka': 'bialko',
    'ekstremalnie-szybkie-odchudzanie-bez-farmazonow': 'odchudzanie',
    'sila-na-redukcji-dlaczego-nie-tylko-cardio': 'cwiczenia',
    'progresja-obciazenia-bez-pierdolenia': 'cwiczenia',
    'volume-eating-jak-jesc-duzo-i-chudnac': 'odchudzanie',
    'plateau-wagi-co-robic-gdy-stoi': 'odchudzanie',
    'alkohol-a-odchudzanie': 'odchudzanie',
    'sen-stres-i-waga': 'odchudzanie',
    'kreatyna-kofeina-bialko-co-warto': 'bialko',
    'cut-agresywny-vs-umiarkowany': 'odchudzanie',
    'budowanie-miesni-minimalny-plan': 'cwiczenia',
    'neat-kroki-wiecej-niz-silownia': 'cwiczenia',
    'ile-serii-i-powtorzen-na-mase': 'cwiczenia',
    'refeed-i-diet-break': 'odchudzanie',
    'tracking-kalorii-bez-obsesji': 'odchudzanie',
    'utrata-miesni-na-redukcji': 'cwiczenia',
    'przedtreningowka-czy-wystarczy-kawa': 'cwiczenia',
    'cheat-meal-czy-rekompensata': 'odchudzanie',
    'dlaczego-waga-skacze-o-2kg': 'odchudzanie',
    'bialko-przed-snem-czy-warto': 'bialko',
    'kobiety-redukcja-bez-bzdury': 'odchudzanie',
    'bulk-brudny-vs-czysty': 'odchudzanie'
};

function categoryOf(a) {
    return a.category || CATEGORY_MAP[a.slug] || 'inne';
}

function loadArticles() {
    const all = [];
    const seen = new Set();
    for (const name of batches) {
        const fp = path.join(__dirname, name);
        if (!fs.existsSync(fp)) {
            console.warn('Brak', name);
            continue;
        }
        const arr = JSON.parse(fs.readFileSync(fp, 'utf8'));
        for (const a of arr) {
            if (seen.has(a.slug)) {
                console.warn('Duplikat slug, pomijam:', a.slug);
                continue;
            }
            seen.add(a.slug);
            all.push(a);
        }
    }
    return all;
}

function renderArticle(a, template) {
    const disclaimer =
        a.disclaimerHtml ||
        'Artykuł ma charakter edukacyjny. Nie zastępuje porady lekarza ani dietetyka klinicznego. Przy chorobach przewlekłych, zaburzeniach odżywiania, ciąży lub lekach skonsultuj plan ze specjalistą.';

    let html = template
        .replaceAll('{{TITLE}}', a.title)
        .replaceAll('{{META}}', a.meta)
        .replaceAll('{{SLUG}}', a.slug)
        .replaceAll('{{CRUMB}}', a.crumb || a.title)
        .replaceAll('{{SUBTITLE}}', a.subtitle)
        .replaceAll('{{RELATED}}', a.relatedHtml || '<a href="artykuly">artykuły</a>');

    // stub template has {{INTRO}} + {{SECTIONS}} — we put full body in SECTIONS and clear INTRO
    html = html.replace('<p>{{INTRO}}</p>', '');
    html = html.replace('{{SECTIONS}}', a.bodyHtml);

    html = html.replace(
        /<div class="info-warning">[\s\S]*?<\/div>/,
        `<div class="info-warning">\n                    ${disclaimer}\n                </div>`
    );

    // byline: personal for flagship, redakcja otherwise
    if (a.slug === 'ekstremalnie-szybkie-odchudzanie-bez-farmazonow') {
        html = html.replace(
            '<p class="article-byline"><strong>Autorzy:</strong> redakcja</p>',
            '<p class="article-byline"><strong>Autor:</strong> Proteiner — z doświadczenia, nie z gabinetu</p>'
        );
    }

    return html;
}

function tileHtml(a) {
    return `                    <a class="poradnik-hub-tile" data-category="${categoryOf(a)}" href="${a.slug}" role="listitem">
                        <span class="poradnik-hub-tile-emoji" aria-hidden="true">${a.emoji || '📝'}</span>
                        <span class="poradnik-hub-tile-title">${a.title}</span>
                        <span class="poradnik-hub-tile-desc">${a.subtitle}</span>
                    </a>`;
}

// Usuwa testowy kafelek "Lala" i pilnuje, żeby każdy kafelek miał data-category
function ensureTiles(artykulyPath, articles) {
    let html = fs.readFileSync(artykulyPath, 'utf8');
    const before = html;

    // usuń testowy kafelek lala
    html = html.replace(/\s*<a class="poradnik-hub-tile" href="lala" role="listitem">[\s\S]*?<\/a>/, '');

    // pilnuj data-category na wszystkich kafelkach
    for (const a of articles) {
        const cat = categoryOf(a);
        // kafelek z href slug bez data-category
        const re = new RegExp(`<a class="poradnik-hub-tile" (?!data-category)(href="${a.slug}")`, 'g');
        html = html.replace(re, `<a class="poradnik-hub-tile" data-category="${cat}" $1`);
    }

    if (html !== before) fs.writeFileSync(artykulyPath, html);
}

function upsertHub(artykulyPath, articles) {
    let html = fs.readFileSync(artykulyPath, 'utf8');
    for (const a of articles) {
        if (html.includes(`href="${a.slug}"`)) continue;
        const tile = tileHtml(a);
        // insert before closing hub grid
        html = html.replace(
            /(\s*)<\/div>\s*\n\s*<div class="info-callout">/,
            `\n${tile}$1</div>\n\n                <div class="info-callout">`
        );
    }
    fs.writeFileSync(artykulyPath, html);
    ensureTiles(artykulyPath, articles);
}

function upsertHome(homePath, articles) {
    let src = fs.readFileSync(homePath, 'utf8');
    // parse array roughly
    const m = src.match(/window\.HOME_ARTICLES\s*=\s*(\[[\s\S]*?\]);/);
    if (!m) throw new Error('HOME_ARTICLES not found');
    const list = JSON.parse(m[1]);
    const existing = new Set(list.map((x) => x.slug));
    for (const a of articles) {
        if (existing.has(a.slug)) continue;
        list.push({
            slug: a.slug,
            emoji: a.emoji || '📝',
            title: a.title,
            subtitle: a.subtitle
        });
    }
    const out = `window.HOME_ARTICLES = ${JSON.stringify(list, null, 2)};\n`;
    fs.writeFileSync(homePath, out);
}

function upsertSitemap(sitemapPath, articles) {
    let xml = fs.readFileSync(sitemapPath, 'utf8');
    const today = new Date().toISOString().slice(0, 10);
    for (const a of articles) {
        const loc = `https://proteiner.pl/${a.slug}`;
        if (xml.includes(`<loc>${loc}</loc>`)) continue;
        const entry = `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
        xml = xml.replace('</urlset>', entry + '</urlset>');
    }
    fs.writeFileSync(sitemapPath, xml);
}

const template = fs.readFileSync(templatePath, 'utf8');
const articles = loadArticles();
console.log(`Artykułów do zbudowania: ${articles.length}`);

for (const a of articles) {
    const html = renderArticle(a, template);
    const out = path.join(root, `${a.slug}.html`);
    fs.writeFileSync(out, html);
    const deploy = path.join(root, 'deploy-bundle', `${a.slug}.html`);
    fs.mkdirSync(path.dirname(deploy), { recursive: true });
    fs.writeFileSync(deploy, html);
    console.log('OK', a.slug);
}

upsertHub(path.join(root, 'artykuly.html'), articles);
upsertHub(path.join(root, 'deploy-bundle', 'artykuly.html'), articles);
upsertHome(path.join(root, 'js', 'home-articles.js'), articles);
upsertHome(path.join(root, 'deploy-bundle', 'js', 'home-articles.js'), articles);
upsertSitemap(path.join(root, 'sitemap.xml'), articles);
upsertSitemap(path.join(root, 'deploy-bundle', 'sitemap.xml'), articles);

console.log(`\nGotowe: ${articles.length} artykułów + hub/home/sitemap`);
