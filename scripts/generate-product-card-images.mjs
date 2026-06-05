/**
 * Generuje proste karty produktów 800×600 JPG → images/products/{slug}.jpg
 * Uruchom: node scripts/generate-product-card-images.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'images', 'products');
const require = createRequire(import.meta.url);

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

function escXml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function wrapText(name, maxChars = 22) {
    const words = name.split(/\s+/);
    const lines = [];
    let line = '';
    for (const w of words) {
        const test = line ? `${line} ${w}` : w;
        if (test.length > maxChars && line) {
            lines.push(line);
            line = w;
        } else {
            line = test;
        }
    }
    if (line) lines.push(line);
    return lines.slice(0, 3);
}

function buildSvg(p) {
    const lines = wrapText(p.name);
    const lineEls = lines
        .map((ln, i) => `<text x="400" y="${248 + i * 42}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="32" font-weight="700" fill="#0f172a">${escXml(ln)}</text>`)
        .join('\n');
    const emoji = escXml(p.emoji || '🍽️');

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f8fafc"/>
      <stop offset="50%" style="stop-color:#ecfdf5"/>
      <stop offset="100%" style="stop-color:#f0f9ff"/>
    </linearGradient>
    <linearGradient id="bar" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#14b8a6"/>
      <stop offset="100%" style="stop-color:#0f766e"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#bg)"/>
  <rect width="800" height="6" fill="url(#bar)"/>
  <rect x="40" y="40" width="720" height="520" rx="24" fill="#ffffff" fill-opacity="0.92"/>
  <text x="400" y="175" text-anchor="middle" font-size="110">${emoji}</text>
  ${lineEls}
  <text x="400" y="${248 + lines.length * 42 + 28}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="22" fill="#64748b">wartości na 100 g</text>
  <rect x="120" y="400" width="560" height="1" fill="#e2e8f0"/>
  <text x="400" y="455" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="36" font-weight="800" fill="#0f766e">${p.kcal} kcal</text>
  <text x="400" y="500" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="22" fill="#334155">
    Białko <tspan font-weight="700">${p.protein} g</tspan>  ·  Węgle <tspan font-weight="700">${p.carbs} g</tspan>  ·  Tłuszcz <tspan font-weight="700">${p.fat} g</tspan>
  </text>
  <text x="400" y="545" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="14" fill="#94a3b8">ProteinMaxxing.pl</text>
</svg>`;
}

const raw = JSON.parse(
    fs.readFileSync(path.join(root, 'js', 'products-data-raw.js'), 'utf8').match(/productsDatabaseRaw = (\[[\s\S]*\]);/)[1]
);
const products = enrichProducts(raw);

let sharp;
try {
    sharp = (await import('sharp')).default;
} catch {
    console.error('Instaluj sharp: npm install sharp');
    process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

const onlyMissing = process.argv.includes('--only-missing');

let done = 0;
for (const p of products) {
    const outPath = path.join(outDir, `${p.slug}.jpg`);
    if (onlyMissing && fs.existsSync(outPath)) continue;
    const svg = buildSvg(p);
    await sharp(Buffer.from(svg)).resize(800, 600).jpeg({ quality: 90 }).toFile(outPath);
    done++;
    if (done % 50 === 0) console.log(`… ${done}/${products.length}`);
}

console.log(`Gotowe: ${done} plików JPG w images/products/`);
