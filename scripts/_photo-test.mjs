/** Test promptów: generuje kilka próbek do tmp-verify/ do oceny wizualnej. */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'tmp-verify');
fs.mkdirSync(outDir, { recursive: true });
const UA = 'Proteiner/1.0 (nutrition education; contact: developeranios@gmail.com)';

const CAT_HINT = {
    warzywa: 'fresh vegetable', owoce: 'fresh fruit', nabial: 'dairy product', sery: 'cheese',
    mieso: 'raw or cooked meat, fish or poultry', zboza: 'bread, grain or bakery product',
    napoje: 'beverage in a clear glass', alkohole: 'alcoholic drink in a glass',
    przyprawy: 'dried spice or herb', tluszcze: 'cooking fat or oil', sosy: 'sauce or condiment',
    zupy: 'soup in a white bowl', makarony: 'pasta dish', orzechy: 'nuts or seeds',
    slodycze: 'sweet dessert or candy', 'platki-sniadaniowe': 'breakfast cereal',
    'polskie-obiadki': 'Polish home-style cooked dish on a plate', fastfood: 'fast food item',
    'mrozone-pizze': 'whole round pizza', 'batoniki': 'chocolate candy bar', 'batony': 'candy bar'
};

function prompt(name, category, english) {
    const hint = CAT_HINT[category] || 'edible food product';
    const subject = english || name.replace(/\([^)]*\)/g, '').trim();
    return (
        `Photorealistic minimalist e-commerce catalog product photo of ${subject} (${hint}). ` +
        `Only the edible food or drink itself, one neat single serving, centered. ` +
        `Pure solid white background #FFFFFF, no shadow, no drop shadow, no reflection, empty white margins. ` +
        `No packaging, no plate decoration, no props, no table, no text, no logos, no watermark, no people, no hands, ` +
        `sharp realistic detail, studio lighting.`
    );
}

const samples = [
    { slug: 'kaczka-udo', name: 'Kaczka udko', category: 'mieso', english: 'roasted duck leg' },
    { slug: 'brzoskwinie', name: 'Brzoskwinie', category: 'owoce', english: 'fresh peaches' },
    { slug: 'gofry-z-owocami', name: 'Gofry z owocami', category: 'slodycze', english: 'waffles with fresh fruit' },
    { slug: 'zupa-ogorkowa', name: 'Zupa ogórkowa', category: 'zupy', english: 'Polish pickle soup with dill in a white bowl' },
    { slug: 'sok-pomaranczowy-100', name: 'Sok pomarańczowy 100%', category: 'napoje', english: 'orange juice in a clear glass' },
    { slug: 'kotlet-schabowy', name: 'Kotlet schabowy', category: 'polskie-obiadki', english: 'Polish breaded pork cutlet' }
];

for (const s of samples) {
    const p = prompt(s.name, s.category, s.english);
    const seed = crypto.createHash('md5').update(`${s.slug}:v1`).digest().readUInt32BE(0) % 2147483646;
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(p)}?width=800&height=600&nologo=true&model=flux&seed=${seed}`;
    const t0 = Date.now();
    const r = await fetch(url, { headers: { 'User-Agent': UA, Referer: 'https://proteiner.pl/' }, signal: AbortSignal.timeout(180000) });
    const buf = Buffer.from(await r.arrayBuffer());
    fs.writeFileSync(path.join(outDir, `${s.slug}.jpg`), buf);
    console.log(s.slug, r.status, buf.length, ((Date.now() - t0) / 1000).toFixed(1) + 's');
}
console.log('→', outDir);
