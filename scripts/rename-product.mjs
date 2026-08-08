/**
 * Rename product in raw DB + files + regenerate lite/pages.
 * node scripts/rename-product.mjs --from=makaron-z-serem-kraft-styl --name="Mac n cheese (makaron z serem)"
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

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

const fromArg = process.argv.find((a) => a.startsWith('--from='))?.slice(7);
const nameArg = process.argv.find((a) => a.startsWith('--name='))?.slice(7);
if (!fromArg || !nameArg) {
    console.error('Użycie: node scripts/rename-product.mjs --from=old-slug --name="Nowa nazwa"');
    process.exit(1);
}

const oldSlug = fromArg;
const newName = nameArg;
const newSlug = slugify(newName);
console.log(oldSlug, '→', newSlug, `(${newName})`);

function patchRaw(rel) {
    const p = path.join(root, rel);
    if (!fs.existsSync(p)) return;
    const raw = fs.readFileSync(p, 'utf8');
    const start = raw.indexOf('[');
    const end = raw.lastIndexOf('];');
    const arr = JSON.parse(raw.slice(start, end + 1));
    let hit = 0;
    for (const x of arr) {
        const s = x.slug || slugify(x.name);
        if (s === oldSlug || slugify(x.name) === oldSlug) {
            x.name = newName;
            if (x.slug) x.slug = newSlug;
            hit++;
        }
    }
    if (!hit) {
        console.warn('WARN: not found in', rel);
        return;
    }
    fs.writeFileSync(p, raw.slice(0, start) + JSON.stringify(arr) + raw.slice(end + 1));
    console.log('raw', rel, 'updated', hit);
}

patchRaw('js/products-data-raw.js');

function renameImagePair(dir) {
    if (!fs.existsSync(dir)) return;
    for (const ext of ['png', 'jpg', 'webp', 'jpeg']) {
        const from = path.join(dir, `${oldSlug}.${ext}`);
        const to = path.join(dir, `${newSlug}.${ext}`);
        if (fs.existsSync(from)) {
            fs.renameSync(from, to);
            console.log('img', path.relative(root, from), '→', path.basename(to));
        }
    }
}
renameImagePair(path.join(root, 'images', 'products'));
renameImagePair(path.join(root, 'deploy-bundle', 'images', 'products'));

function renameHtml(dir) {
    if (!fs.existsSync(dir)) return;
    const from = path.join(dir, `${oldSlug}.html`);
    const to = path.join(dir, `${newSlug}.html`);
    if (fs.existsSync(from)) {
        let html = fs.readFileSync(from, 'utf8');
        html = html.split(oldSlug).join(newSlug);
        // title / name leftovers of old display name handled by regenerate
        fs.writeFileSync(to, html);
        fs.unlinkSync(from);
        console.log('html', path.basename(from), '→', path.basename(to));
    }
}
renameHtml(path.join(root, 'produkty'));
renameHtml(path.join(root, 'deploy-bundle', 'produkty'));

// sitemap
for (const rel of ['sitemap.xml', 'deploy-bundle/sitemap.xml']) {
    const p = path.join(root, rel);
    if (!fs.existsSync(p)) continue;
    let s = fs.readFileSync(p, 'utf8');
    const n = s.split(`produkty/${oldSlug}`).join(`produkty/${newSlug}`);
    if (n !== s) {
        fs.writeFileSync(p, n);
        console.log('sitemap', rel);
    }
}

// search queries map
for (const rel of ['js/product-search-queries.js', 'deploy-bundle/js/product-search-queries.js']) {
    const p = path.join(root, rel);
    if (!fs.existsSync(p)) continue;
    let s = fs.readFileSync(p, 'utf8');
    if (s.includes(`"${oldSlug}"`)) {
        s = s.replaceAll(`"${oldSlug}"`, `"${newSlug}"`);
        fs.writeFileSync(p, s);
        console.log('queries', rel);
    }
}

// cache json
for (const rel of ['js/product-images-cache.json']) {
    const p = path.join(root, rel);
    if (!fs.existsSync(p)) continue;
    const j = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (j[oldSlug]) {
        j[newSlug] = j[oldSlug];
        delete j[oldSlug];
        fs.writeFileSync(p, JSON.stringify(j, null, 2));
        console.log('cache', rel);
    }
}

execSync('node scripts/build-products-lite.mjs', { cwd: root, stdio: 'inherit' });
execSync('node scripts/generate-product-pages.mjs', { cwd: root, stdio: 'inherit' });
console.log('Done rename.');
