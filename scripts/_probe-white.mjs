/**
 * Sonda: który model/prompt daje CZYSTO BIAŁE tło (rawWhite >= 45%, corners 4/4)?
 * node scripts/_probe-white.mjs > _tmp-probe/white.log 2>&1
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, '_tmp-probe');
fs.mkdirSync(outDir, { recursive: true });
const sharp = (await import('sharp')).default;
const UA = 'Proteiner/1.0 (nutrition education; contact: developeranios@gmail.com)';

async function whiteStats(buf) {
    const { data, info } = await sharp(buf).resize(120, 90).raw().toBuffer({ resolveWithObject: true });
    const { width: w, height: h, channels: ch } = info;
    let white = 0;
    for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
            const i = (y * w + x) * ch;
            if (data[i] > 235 && data[i + 1] > 235 && data[i + 2] > 235) white++;
        }
    const corners = [[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1]];
    let cw = 0;
    for (const [x, y] of corners) {
        const i = (y * w + x) * ch;
        if (data[i] > 230 && data[i + 1] > 230 && data[i + 2] > 230) cw++;
    }
    return { white: white / (w * h), corners: cw };
}

const SUBJECT = { 'jezyny': 'fresh blackberries', 'krolik-udziec': 'raw rabbit leg meat', 'bulgur-suchy': 'dry bulgur wheat in a small white bowl' };
const STYLE_A = ', centered on pure solid white background, no shadow, minimalist studio product photo, photorealistic, no text, no logo, isolated product';
const STYLE_B = ', isolated on seamless white studio background, high-key, white background fills entire frame edge to edge';

const models = ['flux', 'turbo', 'sana'];
const results = [];
for (const slug of Object.keys(SUBJECT)) {
    for (const model of models) {
        for (const style of ['A', 'B']) {
            const prompt = `${SUBJECT[slug]}${style === 'A' ? STYLE_A : STYLE_B}`;
            const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=600&nologo=true&model=${model}&seed=12345`;
            const t0 = Date.now();
            try {
                const r = await fetch(url, { headers: { 'User-Agent': UA, Referer: 'https://proteiner.pl/' }, signal: AbortSignal.timeout(120000) });
                if (!r.ok) { console.log(`${slug} ${model} ${style} HTTP ${r.status}`); continue; }
                const buf = Buffer.from(await r.arrayBuffer());
                fs.writeFileSync(path.join(outDir, `${slug}-${model}-${style}.jpg`), buf);
                const s = await whiteStats(buf);
                const line = `${slug.padEnd(16)} ${model.padEnd(6)} ${style} white ${(s.white * 100).toFixed(0)}% corners ${s.corners}/4 bytes ${(buf.length / 1024 | 0)}KB ${((Date.now() - t0) / 1000).toFixed(1)}s`;
                console.log(line);
                results.push({ slug, model, style, ...s });
            } catch (e) {
                console.log(`${slug} ${model} ${style} ERR ${e.message}`);
            }
        }
    }
}
const best = results.filter((r) => r.white >= 0.4);
console.log(`\nPASS (white>=40%): ${best.length}/${results.length}`);
for (const b of best) console.log(' ', b.slug, b.model, b.style, (b.white * 100).toFixed(0) + '%', b.corners + '/4');
