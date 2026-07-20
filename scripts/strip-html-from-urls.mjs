/**
 * Usuwa .html z linków w HTML/JS/XML (strony + frontend).
 * node scripts/strip-html-from-urls.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { stripHtmlExtensionsInContent } from './clean-url.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const SKIP_DIRS = new Set(['node_modules', '.git', 'domains', 'scripts', 'data']);
const EXT = new Set(['.html', '.xml']);

function walk(dir, files = []) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        if (e.name.startsWith('.') && e.name !== '.htaccess') continue;
        const full = path.join(dir, e.name);
        if (e.isDirectory()) {
            if (SKIP_DIRS.has(e.name)) continue;
            walk(full, files);
        } else if (EXT.has(path.extname(e.name))) {
            // Skip raw data / loaders that aren't URL builders... still process all js under js/
            files.push(full);
        }
    }
    return files;
}

let changed = 0;
const files = walk(root);
// also deploy-bundle
const deploy = path.join(root, 'deploy-bundle');
if (fs.existsSync(deploy)) walk(deploy, files);

for (const file of files) {
    // Don't rewrite products-data or huge data files incorrectly
    const base = path.basename(file);
    if (base.includes('products-data') || base.endsWith('-raw.js')) continue;

    const before = fs.readFileSync(file, 'utf8');
    if (!before.includes('.html')) continue;
    const after = stripHtmlExtensionsInContent(before);
    if (after !== before) {
        fs.writeFileSync(file, after, 'utf8');
        changed++;
    }
}

console.log(`Zaktualizowano ${changed} plików (linki bez .html).`);
