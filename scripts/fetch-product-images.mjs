/**
 * Dopasowuje zdjęcia do produktów (Wikipedia → Openverse → Commons).
 * node scripts/build-search-queries.mjs   (opcjonalnie, odśwież zapytania)
 * node scripts/fetch-product-images.mjs --force
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const cachePath = path.join(root, 'js', 'product-images-cache.json');
const queriesPath = path.join(root, 'js', 'product-search-queries.js');

const UA = 'Proteiner/1.0 (nutrition education; contact: dominikchw1@gmail.com)';

const BAD_TITLE = /logo|icon|diagram|map|flag|coat of arms|symbol|chart|graph|list of|disambiguation|category:/i;
const BAD_IMAGE = /logo|icon|banner|sprite|button|avatar|stamp|seal/i;

function slugify(name) {
    return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/ą/g, 'a').replace(/ć/g, 'c').replace(/ę/g, 'e').replace(/ł/g, 'l')
        .replace(/ń/g, 'n').replace(/ó/g, 'o').replace(/ś/g, 's').replace(/ź/g, 'z').replace(/ż/g, 'z')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function enrichProducts(raw) {
    const seen = {};
    return raw.map((p) => {
        let base = slugify(p.name);
        let slug = base, n = 2;
        while (seen[slug]) { slug = `${base}-${p.category}`; if (seen[slug]) slug = `${base}-${n++}`; }
        seen[slug] = true;
        return { ...p, slug };
    });
}

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

async function validateImageUrl(url) {
    if (!url || !/^https?:\/\//i.test(url)) return false;
    try {
        const res = await fetch(url, {
            method: 'GET',
            headers: { 'User-Agent': UA, Range: 'bytes=0-2048' },
            signal: AbortSignal.timeout(12000)
        });
        if (!res.ok) return false;
        const ct = (res.headers.get('content-type') || '').toLowerCase();
        return ct.includes('image');
    } catch {
        return false;
    }
}

async function fetchWikipedia(query) {
    const params = new URLSearchParams({
        action: 'query',
        generator: 'search',
        gsrsearch: query,
        gsrlimit: '4',
        prop: 'pageimages',
        piprop: 'thumbnail',
        pithumbsize: '800',
        format: 'json',
        origin: '*'
    });
    const res = await fetch(`https://en.wikipedia.org/w/api.php?${params}`, { headers: { 'User-Agent': UA } });
    if (!res.ok) return null;
    const data = await res.json();
    const pages = data?.query?.pages;
    if (!pages) return null;
    for (const page of Object.values(pages)) {
        if (BAD_TITLE.test(page.title || '')) continue;
        const src = page.thumbnail?.source;
        if (src && !BAD_IMAGE.test(src)) return src;
    }
    return null;
}

async function fetchOpenverse(query) {
    const params = new URLSearchParams({
        q: query,
        page_size: '6',
        license_type: 'commercial,modification',
        extension: 'jpg,jpeg,png,webp'
    });
    const res = await fetch(`https://api.openverse.engineering/v1/images/?${params}`, {
        headers: { 'User-Agent': UA }
    });
    if (!res.ok) return null;
    const data = await res.json();
    for (const hit of data?.results || []) {
        const url = hit?.url || hit?.thumbnail;
        if (url && !BAD_IMAGE.test(url)) return url;
    }
    return null;
}

async function fetchCommons(query) {
    const params = new URLSearchParams({
        action: 'query',
        generator: 'search',
        gsrsearch: `filetype:bitmap ${query}`,
        gsrnamespace: '6',
        gsrlimit: '6',
        prop: 'imageinfo',
        iiprop: 'url',
        iiurlwidth: '800',
        format: 'json',
        origin: '*'
    });
    const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
        headers: { 'User-Agent': UA }
    });
    if (!res.ok) return null;
    const data = await res.json();
    const pages = data?.query?.pages;
    if (!pages) return null;
    for (const page of Object.values(pages)) {
        const title = page?.title || '';
        if (BAD_TITLE.test(title)) continue;
        const info = page?.imageinfo?.[0];
        const url = info?.thumburl || info?.url;
        if (url && /\.(jpg|jpeg|png|webp)/i.test(url) && !BAD_IMAGE.test(url)) return url;
    }
    return null;
}

async function findImageForProduct(p, queryList) {
    const sources = [
        { name: 'wiki', fn: fetchWikipedia },
        { name: 'openverse', fn: fetchOpenverse },
        { name: 'commons', fn: fetchCommons }
    ];

    for (const q of queryList) {
        for (const src of sources) {
            try {
                const url = await src.fn(q);
                if (url && (await validateImageUrl(url))) {
                    return { url, source: src.name, query: q };
                }
            } catch { /* next */ }
            await sleep(60);
        }
    }
    return null;
}

// --- main ---
if (!fs.existsSync(queriesPath)) {
    await import('./build-search-queries.mjs');
}

const queriesMod = await import(pathToFileURL(queriesPath).href);
const PRODUCT_SEARCH_QUERIES = queriesMod.PRODUCT_SEARCH_QUERIES;

const raw = JSON.parse(
    fs.readFileSync(path.join(root, 'js', 'products-data-raw.js'), 'utf8').match(/productsDatabaseRaw = (\[[\s\S]*\]);/)[1]
);
const products = enrichProducts(raw);
const force = process.argv.includes('--force');
const limitArg = process.argv.find((a) => a.startsWith('--limit='));
const maxItems = limitArg ? parseInt(limitArg.split('=')[1], 10) : products.length;
let cache = force ? {} : (fs.existsSync(cachePath) ? JSON.parse(fs.readFileSync(cachePath, 'utf8')) : {});

let ok = 0, fail = 0;

for (let i = 0; i < Math.min(products.length, maxItems); i++) {
    const p = products[i];
    if (cache[p.slug] && !force) continue;

    const queryList = PRODUCT_SEARCH_QUERIES[p.slug] || [p.name, `${p.name} food`];
    process.stdout.write(`[${i + 1}/${products.length}] ${p.slug} `);

    const hit = await findImageForProduct(p, queryList);
    if (hit) {
        cache[p.slug] = hit.url;
        console.log(`✓ ${hit.source} (${hit.query.slice(0, 40)})`);
        ok++;
    } else {
        delete cache[p.slug];
        console.log('✗ brak');
        fail++;
    }
    await sleep(120);
}

fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), 'utf8');
console.log(`\nGotowe: ${ok} zdjęć, ${fail} bez dopasowania, cache: ${Object.keys(cache).length} wpisów.`);
