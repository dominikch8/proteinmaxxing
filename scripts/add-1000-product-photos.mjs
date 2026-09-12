/**
 * Generuje brakujące zdjęcia produktów w stylu bazy: minimalistyczne,
 * fotorealistyczne, z wyciętym tłem (przezroczysty PNG + JPG na białym + WebP).
 *
 * Silnik: Pollinations (Flux) → white-bg photo → cutoutBuffer (auto, flood-fill).
 *
 * node scripts/add-1000-product-photos.mjs --report          # tylko lista braków
 * node scripts/add-1000-product-photos.mjs --limit=5         # test na 5 pozycjach
 * node scripts/add-1000-product-photos.mjs                   # wszystkie brakujące
 * node scripts/add-1000-product-photos.mjs --slug=kaczka-udo # pojedyncze slugi
 * node scripts/add-1000-product-photos.mjs --concurrency=6 --delay=0
 * node scripts/add-1000-product-photos.mjs --force           # nadpisz istniejące
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { cutoutBuffer } from './refine-product-cutouts.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'images', 'products');
const bundleDir = path.join(root, 'deploy-bundle', 'images', 'products');
const UA = 'Proteiner/1.0 (nutrition education; contact: developeranios@gmail.com)';

const args = process.argv.slice(2);
const report = args.includes('--report');
const force = args.includes('--force');
const onlySlugs = args.filter((a) => a.startsWith('--slug=')).map((a) => a.slice(7));
const limitArg = args.find((a) => a.startsWith('--limit='));
const limit = limitArg ? Number(limitArg.slice(8)) : Infinity;
const concArg = args.find((a) => a.startsWith('--concurrency='));
const concurrency = concArg ? Math.max(1, Number(concArg.slice(14))) : 6;
const delayArg = args.find((a) => a.startsWith('--delay='));
const delayMs = delayArg ? Number(delayArg.slice(8)) : 0;

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
        return { slug, name: p.name, category: p.category, emoji: p.emoji || '🍽️' };
    });
}
