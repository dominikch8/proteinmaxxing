/**
 * Usuwa produkt ze źródeł danych, stron, sitemap i obrazków.
 * node scripts/remove-product.mjs olimp-matrix-pro
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const slug = (process.argv[2] || '').trim();
if (!slug) {
    console.error('Użycie: node scripts/remove-product.mjs <slug>');
    process.exit(1);
}

function exists(rel) {
    return fs.existsSync(path.join(root, rel));
}

function unlink(rel) {
    const p = path.join(root, rel);
    if (fs.existsSync(p)) {
        fs.unlinkSync(p);
        console.log('del', rel);
    }
}

function slugify(name) {
    return String(name || '')
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

function productMatches(x) {
    if (x.slug === slug) return true;
    return slugify(x.name) === slug;
}

function removeFromRaw(rel) {
    const p = path.join(root, rel);
    if (!fs.existsSync(p)) return;
    const raw = fs.readFileSync(p, 'utf8');
    const start = raw.indexOf('[');
    const end = raw.lastIndexOf('];');
    const arr = JSON.parse(raw.slice(start, end + 1));
    const before = arr.length;
    const filtered = arr.filter((x) => !productMatches(x));
    if (filtered.length === before) {
        console.log('WARN: not in', rel);
        return;
    }
    fs.writeFileSync(p, raw.slice(0, start) + JSON.stringify(filtered) + raw.slice(end + 1));
    console.log('raw', rel, before, '->', filtered.length);
}

function cleanSitemap(rel) {
    const p = path.join(root, rel);
    if (!fs.existsSync(p)) return;
    let s = fs.readFileSync(p, 'utf8');
    const re = new RegExp(
        `\\s*<url>\\s*<loc>https://proteiner\\.pl/produkty/${slug}</loc>[\\s\\S]*?</url>`,
        'g'
    );
    const n = s.replace(re, '');
    if (n !== s) {
        fs.writeFileSync(p, n);
        console.log('sitemap', rel);
    }
}

function cleanEditorial() {
    const p = path.join(root, 'scripts/product-editorial.json');
    if (!fs.existsSync(p)) return;
    const j = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (j[slug]) {
        delete j[slug];
        fs.writeFileSync(p, JSON.stringify(j, null, 2) + '\n');
        console.log('editorial key removed');
    }
}

function cleanPrompts() {
    const p = path.join(root, 'scripts/product-photo-prompts.json');
    if (!fs.existsSync(p)) return;
    const j = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (!Array.isArray(j)) return;
    const before = j.length;
    const filtered = j.filter((x) => x.slug !== slug);
    if (filtered.length !== before) {
        fs.writeFileSync(p, JSON.stringify(filtered, null, 4) + '\n');
        console.log('prompts', before, '->', filtered.length);
    }
}

function cleanQueries(rel) {
    const p = path.join(root, rel);
    if (!fs.existsSync(p)) return;
    let s = fs.readFileSync(p, 'utf8');
    const re = new RegExp(`\\n\\s*"${slug}":\\s*\\[[\\s\\S]*?\\],?`, 'g');
    const n = s.replace(re, '\n');
    if (n !== s) {
        fs.writeFileSync(p, n);
        console.log('queries', rel);
    }
}

function stripSimilarLinks() {
    const dirs = [
        path.join(root, 'produkty'),
        path.join(root, 'deploy-bundle', 'produkty'),
    ];
    let changed = 0;
    for (const dir of dirs) {
        if (!fs.existsSync(dir)) continue;
        for (const file of fs.readdirSync(dir)) {
            if (!file.endsWith('.html')) continue;
            const fp = path.join(dir, file);
            let html = fs.readFileSync(fp, 'utf8');
            const before = html;
            // similar product card block
            html = html.replace(
                new RegExp(
                    `\\s*<li>\\s*<a class="similar-product-link" href="${slug}">[\\s\\S]*?</a>\\s*</li>`,
                    'g'
                ),
                ''
            );
            if (html !== before) {
                fs.writeFileSync(fp, html);
                changed++;
            }
        }
    }
    console.log('similar links updated in', changed, 'files');
}

removeFromRaw('js/products-data-raw.js');
removeFromRaw('deploy-bundle/js/products-data-raw.js');
unlink(`produkty/${slug}.html`);
unlink(`deploy-bundle/produkty/${slug}.html`);
for (const dir of ['images/products', 'deploy-bundle/images/products']) {
    for (const ext of ['png', 'jpg', 'webp', 'svg']) {
        unlink(path.join(dir, `${slug}.${ext}`));
    }
}
cleanSitemap('sitemap.xml');
cleanSitemap('deploy-bundle/sitemap.xml');
cleanEditorial();
cleanPrompts();
cleanQueries('js/product-search-queries.js');
cleanQueries('deploy-bundle/js/product-search-queries.js');
stripSimilarLinks();

console.log('OK removed', slug);
