/** Sekwencyjny pomiar przepustowości Pollinations (zgodność z rate limitem). */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const cov = JSON.parse(fs.readFileSync(path.join(root, 'scripts', '_image-coverage.json'), 'utf8'));
const sample = cov.missJpg.slice(0, 20);
const UA = 'Proteiner/1.0 (nutrition education; contact: developeranios@gmail.com)';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const delay = Number(process.argv.find((a) => a.startsWith('--delay='))?.split('=')[1] || 2000);

let ok = 0;
let fail = 0;
const t0 = Date.now();
for (let i = 0; i < sample.length; i++) {
    const slug = sample[i];
    const p = encodeURIComponent(
        `Professional e-commerce product photo of ${slug.replace(/-/g, ' ')}, food only, centered on pure white background, soft subtle shadow, minimalist studio lighting, photorealistic, no text, no people, no hands, no logo, no watermark, isolated product`
    );
    const url = `https://image.pollinations.ai/prompt/${p}?width=800&height=600&nologo=true&seed=${2000 + i}`;
    let status = 'err';
    const ts = Date.now();
    for (let a = 0; a < 5; a++) {
        try {
            const r = await fetch(url, {
                headers: { 'User-Agent': UA, Referer: 'https://proteiner.pl/' },
                signal: AbortSignal.timeout(120000)
            });
            status = r.status;
            const b = Buffer.from(await r.arrayBuffer());
            if (r.status === 200 && b.length > 6000) {
                ok++;
                console.log(`${i + 1}/${sample.length} ${slug} OK ${(b.length / 1024) | 0}KB ${((Date.now() - ts) / 1000).toFixed(1)}s`);
                break;
            }
            if (r.status === 429) await sleep(4000 * (a + 1));
        } catch (e) {
            status = e.message;
        }
    }
    if (status !== 200) {
        fail++;
        console.log(`${i + 1}/${sample.length} ${slug} FAIL ${status}`);
    }
    if (i < sample.length - 1) await sleep(delay);
}
console.log(`\nok=${ok} fail=${fail} total=${((Date.now() - t0) / 1000).toFixed(1)}s avg=${((Date.now() - t0) / 1000 / sample.length).toFixed(1)}s delay=${delay}`);
