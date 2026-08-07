/**
 * Patch Open Graph brand meta across HTML:
 * - og:site_name = Proteiner
 * - cache-bust og-home.jpg / twitter:image
 * node scripts/patch-og-brand.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ASSET_V } from './site-head-assets.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP = new Set(['node_modules', '.git', '.github', '.cursor', 'domains']);

function walk(dir, list = []) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) {
            if (SKIP.has(e.name)) continue;
            walk(p, list);
        } else if (e.name.endsWith('.html')) list.push(p);
    }
    return list;
}

function patch(html) {
    let out = html;

    // Ensure og:site_name
    if (!/property="og:site_name"/.test(out)) {
        out = out.replace(
            /(<meta property="og:title"[^>]*>)/,
            `$1\n    <meta property="og:site_name" content="Proteiner">`
        );
    } else {
        out = out.replace(
            /<meta property="og:site_name" content="[^"]*">/g,
            '<meta property="og:site_name" content="Proteiner">'
        );
    }

    // Cache-bust shared OG home image
    out = out.replace(
        /(content="https:\/\/proteiner\.pl\/images\/og-home\.jpg)(?:\?[^"]*)?(")/g,
        `$1?v=${ASSET_V}$2`
    );
    out = out.replace(
        /(content="https:\/\/proteiner\.pl\/images\/og-home\.jpg)(?:\?[^"]*)?(")/g,
        `$1?v=${ASSET_V}$2`
    );

    // Old brand leftovers in visible copy / URLs (do NOT touch JS ids like renderProteinMaxxing)
    out = out.replace(/„protein maxxingową”\s*/gi, '');
    out = out.replace(/ProteinMaxxing\.pl/gi, 'Proteiner.pl');
    out = out.replace(/https:\/\/(?:www\.)?proteinmaxxing\.pl/gi, 'https://proteiner.pl');
    out = out.replace(/\| ProteinMaxxing</g, '| Proteiner<');
    out = out.replace(/\[ProteinMaxxing\]/g, '[Proteiner]');

    return out;
}

let n = 0;
for (const fp of walk(root)) {
    const before = fs.readFileSync(fp, 'utf8');
    const after = patch(before);
    if (after !== before) {
        fs.writeFileSync(fp, after);
        n += 1;
    }
}
console.log(`OG/brand patched in ${n} HTML files (ASSET_V=${ASSET_V}).`);
