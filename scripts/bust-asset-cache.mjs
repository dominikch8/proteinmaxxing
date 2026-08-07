import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ASSET_V } from './site-head-assets.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP = new Set(['node_modules', '.git', '.github', '.cursor', 'domains']);

const FILES = [
    'css/themes.css',
    'css/site.css',
    'css/product-page.css',
    'css/theme-switch.css',
    'css/site-motion.css',
    'css/brand-text.css',
    'css/cookie-consent.css',
    'css/home.css',
    'js/theme-init.js',
    'js/theme.js',
    'js/auth-ui.js',
    'js/site-motion.js',
    'js/cookie-banner.js',
    'js/info-tiles.js',
    'js/home.js',
    'js/home-articles.js',
];

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

let changed = 0;
for (const fp of walk(root)) {
    let html = fs.readFileSync(fp, 'utf8');
    const before = html;
    for (const file of FILES) {
        const re = new RegExp(
            `((?:href|src)="(?:\\.\\./)*)(${file.replace(/\./g, '\\.')})(?:\\?[^"]*)?"`,
            'g'
        );
        html = html.replace(re, `$1$2?v=${ASSET_V}"`);
    }
    if (html !== before) {
        fs.writeFileSync(fp, html);
        changed += 1;
    }
}

console.log(`Cache-busted assets (?v=${ASSET_V}) in ${changed} HTML files.`);
