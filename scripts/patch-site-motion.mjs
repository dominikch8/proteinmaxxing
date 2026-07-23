/**
 * Podpina css/site-motion.css + js/site-motion.js we wszystkich HTML.
 * Uruchom: node scripts/patch-site-motion.mjs
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

    if (!html.includes('theme-switch.css') && !html.includes('theme.js')) {
        skipped += 1;
        return;
    }

    // CSS after theme-switch.css (any relative prefix)
    html = html.replace(
        /(<link rel="stylesheet" href="([^"]*?)css\/theme-switch\.css">)\s*(?![\s\S]{0,120}site-motion\.css)/g,
        (match, tag, prefix) => {
            if (html.includes(`${prefix}css/site-motion.css`)) return match;
            return `${tag}\n    <link rel="stylesheet" href="${prefix}css/site-motion.css">`;
        }
    );

    // JS after theme.js
    html = html.replace(
        /(<script src="([^"]*?)js\/theme\.js"><\/script>)\s*(?![\s\S]{0,80}site-motion\.js)/g,
        (match, tag, prefix) => {
            if (html.includes(`${prefix}js/site-motion.js`)) return match;
            return `${tag}\n<script src="${prefix}js/site-motion.js"></script>`;
        }
    );

    if (html === original) {
        skipped += 1;
        return;
    }

    fs.writeFileSync(file, html);
    patched += 1;
}

const files = walk(root);
for (const f of files) patchFile(f);

console.log(`patch-site-motion: patched ${patched}, skipped ${skipped}, scanned ${files.length}`);
