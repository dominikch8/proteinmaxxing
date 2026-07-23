/**
 * Dokleja js/auth-ui.js przed theme.js na stronach z pełną nawigacją.
 * Uruchom: node scripts/patch-auth-ui.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP_DIRS = new Set(['node_modules', '.git', '.github', '.cursor', 'deploy-bundle', 'domains']);

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

function prefixFor(rel) {
    const depth = rel.split('/').length - 1;
    if (depth <= 0) return '';
    return '../'.repeat(depth);
}

let changed = 0;
for (const fp of walkHtml(root)) {
    const rel = path.relative(root, fp).replace(/\\/g, '/');
    let html = fs.readFileSync(fp, 'utf8');
    if (!html.includes('class="nav-links"')) continue;
    if (html.includes('auth-ui.js')) continue;

    const prefix = prefixFor(rel);
    const tag = `<script src="${prefix}js/auth-ui.js"></script>`;

    let next = html;
    if (html.includes(`src="${prefix}js/theme.js"`)) {
        next = html.replace(
            `<script src="${prefix}js/theme.js"></script>`,
            `${tag}\n<script src="${prefix}js/theme.js"></script>`
        );
    } else if (html.includes('src="js/theme.js"')) {
        next = html.replace(
            '<script src="js/theme.js"></script>',
            `${tag}\n<script src="js/theme.js"></script>`
        );
    } else if (html.includes('</body>')) {
        next = html.replace('</body>', `${tag}\n</body>`);
    }

    if (next !== html) {
        fs.writeFileSync(fp, next, 'utf8');
        changed++;
    }
}

console.log(`Dodano auth-ui.js w ${changed} plikach HTML.`);
