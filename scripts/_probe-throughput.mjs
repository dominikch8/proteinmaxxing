/** Pomiar przepustowości Pollinations dla braków. */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const cov = JSON.parse(fs.readFileSync(path.join(root, 'scripts', '_image-coverage.json'), 'utf8'));
const sample = cov.missJpg.slice(0, 12);
const UA = 'Proteiner/1.0 (nutrition education; contact: developeranios@gmail.com)';
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

const cats = ['fresh fruit', 'fresh vegetable', 'dairy product', 'meat or fish'];

async function gen(slug, i) {
    const p = encodeURIComponent(
        `Professional e-commerce product photo of ${slug.replace(/-/g, ' ')}, ${cats[i % cats.length]}, food only, centered on pure white background, soft subtle shadow, minimalist studio lighting, photorealistic, no text, no people, no hands, no logo, no watermark, no extra props, isolated product`
    );
    const url = `https://image.pollinations.ai/prompt/${p}?width=800&height=600&nologo=true&seed=${1000 + i}`;
    const t0 = Date.now();
    try {
        const r = await fetch(url, {
            headers: { 'User-Agent': UA, Referer: 'https://proteiner.pl/' },
            signal: AbortSignal.timeout(180000)
        });
        const b = Buffer.from(await r.arrayBuffer());
        log(slug.padEnd(24), 'status', r.status, 'bytes', b.length, 'sec', ((Date.now() - t0) / 1000).toFixed(1));
        return b.length > 6000;
    } catch (e) {
        log(slug.padEnd(24), 'ERR', e.message, ((Date.now() - t0) / 1000).toFixed(1));
        return false;
    }
}

const t0 = Date.now();
const seq = [];
for (let i = 0; i < sample.length; i++) seq.push(gen(sample[i], i));
await Promise.all(seq);
log('TOTAL', ((Date.now() - t0) / 1000).toFixed(1), 's for', sample.length);
