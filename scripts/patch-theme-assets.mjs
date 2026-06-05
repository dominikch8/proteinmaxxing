import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
    buildThemeInitScript,
    buildThemeStylesheets,
    buildThemeBodyScript
} from './site-head-assets.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function htmlFiles(dir, acc = []) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, ent.name);
        if (ent.isDirectory() && ent.name !== 'node_modules') htmlFiles(full, acc);
        else if (ent.isFile() && ent.name.endsWith('.html')) acc.push(full);
    }
    return acc;
}

function prefixFor(filePath) {
    const rel = path.relative(root, filePath);
    const depth = rel.split(path.sep).length - 1;
    return depth ? '../'.repeat(depth) : '';
}

function patchFile(filePath) {
    let html = fs.readFileSync(filePath, 'utf8');
    if (html.includes('theme-init.js')) return false;

    const prefix = prefixFor(filePath);
    let changed = false;

    if (html.includes('<meta charset="UTF-8">')) {
        html = html.replace(
            '<meta charset="UTF-8">',
            `<meta charset="UTF-8">\n${buildThemeInitScript(prefix)}`
        );
        changed = true;
    }

    const siteCssNeedle = `<link rel="stylesheet" href="${prefix}css/site.css">`;
    const productCssNeedle = `<link rel="stylesheet" href="${prefix}css/product-page.css">`;

    if (html.includes(siteCssNeedle) && !html.includes('themes.css')) {
        html = html.replace(siteCssNeedle, buildThemeStylesheets(prefix, { productPage: false }));
        changed = true;
    } else if (html.includes(productCssNeedle) && !html.includes('themes.css')) {
        html = html.replace(productCssNeedle, buildThemeStylesheets(prefix, { productPage: true }));
        changed = true;
    }

    if (!html.includes('js/theme.js')) {
        html = html.replace(/<\/body>/i, `${buildThemeBodyScript(prefix)}\n</body>`);
        changed = true;
    }

    if (!changed) return false;

    fs.writeFileSync(filePath, html, 'utf8');
    return true;
}

let n = 0;
for (const f of htmlFiles(root)) {
    if (patchFile(f)) n++;
}
console.log(`Patched ${n} HTML files with theme assets.`);
