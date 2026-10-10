/**
 * Dodaje link "Ustawienia cookies" do stopki (umożliwia wycofanie zgody).
 *   node scripts/patch-cookie-settings-link.mjs --report
 *   node scripts/patch-cookie-settings-link.mjs --write
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const write = process.argv.includes('--write');
const SKIP_DIRS = new Set(['node_modules', '.git', '.github', '.cursor', 'domains', 'deploy-bundle']);

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
    return depth === 0 ? '' : '../'.repeat(depth);
}

const NAV_RE = /(<nav class="site-footer-nav"[^>]*>)([\s\S]*?)(<\/nav>)/;

let changed = 0;
let skipped = 0;
let noFooter = 0;

for (const fp of walkHtml(root)) {
    const rel = path.relative(root, fp).replace(/\\/g, '/');
    let html = fs.readFileSync(fp, 'utf8');

    if (!NAV_RE.test(html)) {
        noFooter++;
        continue;
    }
    if (html.includes('data-pm-cookie-settings')) {
        skipped++;
        continue;
    }

    const prefix = prefixFor(rel);
    const link = `\n            <span aria-hidden="true">·</span>\n            <a href="${prefix}informacje" data-pm-cookie-settings>Ustawienia cookies</a>`;

    const next = html.replace(NAV_RE, (m, open, inner, close) => `${open}${inner.replace(/\s*$/, '')}${link}\n        ${close}`);
    if (next !== html) {
        if (write) fs.writeFileSync(fp, next, 'utf8');
        changed++;
    }
}

console.log(`${write ? 'ZAPISANO' : 'DRY-RUN'} — dodano link: ${changed}, już ma: ${skipped}, brak stopki: ${noFooter}`);
