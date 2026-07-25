/**
 * Podpina css/brand-text.css we wszystkich HTML (po site-motion.css).
 * Uruchom: node scripts/patch-brand-text.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP_DIRS = new Set(['node_modules', '.git', '.github', '.cursor', 'deploy-bundle', 'domains']);

let patched = 0;
let skipped = 0;

function walk(dir, out = []) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
        if (SKIP_DIRS.has(ent.name)) continue;
        const full = path.join(dir, ent.name);
        if (ent.isDirectory()) walk(full, out);
        else if (ent.name.endsWith('.html')) out.push(full);
    }
    return out;
}

function patchFile(file) {
    let html = fs.readFileSync(file, 'utf8');
    const original = html;

    if (html.includes('brand-text.css')) {
        skipped += 1;
        return;
    }

    // Prefer after site-motion.css
    if (/css\/site-motion\.css/.test(html)) {
        html = html.replace(
            /(<link rel="stylesheet" href="([^"]*?)css\/site-motion\.css">)/,
            `$1\n    <link rel="stylesheet" href="$2css/brand-text.css">`
        );
    } else if (/css\/theme-switch\.css/.test(html)) {
        html = html.replace(
            /(<link rel="stylesheet" href="([^"]*?)css\/theme-switch\.css">)/,
            `$1\n    <link rel="stylesheet" href="$2css/brand-text.css">`
        );
    } else {
        skipped += 1;
        return;
    }

    if (html === original) {
        skipped += 1;
        return;
    }

    fs.writeFileSync(file, html);
    patched += 1;
}

const files = walk(root);
for (const f of files) patchFile(f);

console.log(`patch-brand-text: patched ${patched}, skipped ${skipped}, scanned ${files.length}`);
