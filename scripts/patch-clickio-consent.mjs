/**
 * Clickio CMP: dodaje skrypt consent_249709.js po consent-head.js; usuwa stary baner Proteiner.
 * Uruchom: node scripts/patch-clickio-consent.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP_DIRS = new Set(['node_modules', '.git', 'domains']);
const CLICKIO =
    '<script async type="text/javascript" src="//clickiocmp.com/t/consent_249709.js"></script>';

function walkHtml(dir, list = []) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) {
            if (SKIP_DIRS.has(e.name)) continue;
            walkHtml(p, list);
        } else if (e.name.endsWith('.html')) {
            list.push(p);
        }
    }
    return list;
}

function patch(html) {
    let out = html;
    if (!out.includes('consent_249709.js') && out.includes('consent-head.js')) {
        out = out.replace(
            /(<script src="[^"]*consent-head\.js"><\/script>)/,
            `$1\n    ${CLICKIO}`
        );
    }
    out = out.replace(/\s*<link rel="stylesheet" href="[^"]*cookie-consent\.css">\s*\n?/g, '\n');
    out = out.replace(/\s*<script src="[^"]*cookie-banner\.js"><\/script>\s*\n?/g, '\n');
    return out;
}

let changed = 0;
for (const fp of walkHtml(root)) {
    const before = fs.readFileSync(fp, 'utf8');
    const after = patch(before);
    if (after !== before) {
        fs.writeFileSync(fp, after, 'utf8');
        changed++;
    }
}

console.log(`Clickio consent: zaktualizowano ${changed} plików HTML.`);
