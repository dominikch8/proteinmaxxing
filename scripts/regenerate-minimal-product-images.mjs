/**
 * Regeneruje zdjęcia produktów: białe tło + emoji (spójny minimalizm bez zewn. zdjęć).
 * node scripts/regenerate-minimal-product-images.mjs
 * node scripts/regenerate-minimal-product-images.mjs --all
 * node scripts/regenerate-minimal-product-images.mjs --queue
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'images', 'products');
const queuePath = path.join(root, 'scripts', 'product-images-regen-queue.json');

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

function enrichProducts(raw) {
    const seen = {};
    return raw.map((p) => {
        let base = slugify(p.name);
        let slug = base;
        let n = 2;
        while (seen[slug]) {
            slug = `${base}-${p.category}`;
            if (seen[slug]) slug = `${base}-${n++}`;
        }
        seen[slug] = true;
        return { slug, name: p.name, emoji: p.emoji || '🍽️' };
    });
}

function escXml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/** Białe tło, duże emoji — ten sam styl co zapasowe karty w download-missing. */
function buildMinimalSvg(p) {
    const emoji = escXml(p.emoji || '🍽️');
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="#ffffff"/>
  <ellipse cx="400" cy="430" rx="120" ry="18" fill="#000000" fill-opacity="0.06"/>
  <text x="400" y="340" text-anchor="middle" font-size="160">${emoji}</text>
</svg>`;
}

const raw = JSON.parse(
    fs.readFileSync(path.join(root, 'js', 'products-data-raw.js'), 'utf8').match(/productsDatabaseRaw = (\[[\s\S]*\]);/)[1]
);
const allProducts = enrichProducts(raw);
const sharp = (await import('sharp')).default;
fs.mkdirSync(outDir, { recursive: true });

let todo = allProducts;
if (process.argv.includes('--queue') && fs.existsSync(queuePath)) {
    const queue = JSON.parse(fs.readFileSync(queuePath, 'utf8'));
    const slugs = new Set(queue.map((q) => q.slug));
    todo = allProducts.filter((p) => slugs.has(p.slug));
} else if (!process.argv.includes('--all')) {
    console.error('Użyj --all (cała baza) lub --queue (plik product-images-regen-queue.json).');
    process.exit(1);
}

let done = 0;
for (const p of todo) {
    const outPath = path.join(outDir, `${p.slug}.jpg`);
    try {
        if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
    } catch {
        /* ignore */
    }
    const svg = buildMinimalSvg(p);
    await sharp(Buffer.from(svg)).jpeg({ quality: 92 }).toFile(path.join(outDir, `${p.slug}.jpg`));
    done++;
    if (done % 100 === 0) console.log(`… ${done}/${todo.length}`);
}

console.log(`Wygenerowano ${done} JPG → images/products/`);
