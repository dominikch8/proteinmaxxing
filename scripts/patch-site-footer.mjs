/**
 * Podmienia stopkę we wszystkich plikach HTML.
 * Uruchom: node scripts/patch-site-footer.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildSiteFooter } from './site-footer-html.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const FOOTER_RE = /<footer class="site-footer">[\s\S]*?<\/footer>/;

function walkHtml(dir, list = []) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) {
            if (e.name === 'node_modules' || e.name === '.git') continue;
            walkHtml(p, list);
        } else if (e.name.endsWith('.html')) {
            list.push(p);
        }
    }
    return list;
}

let count = 0;
for (const filePath of walkHtml(root)) {
    const rel = path.relative(root, filePath).replace(/\\/g, '/');
    const prefix = rel.startsWith('produkty/') ? '../' : '';
    let html = fs.readFileSync(filePath, 'utf8');
    if (!FOOTER_RE.test(html)) {
        console.warn('Brak stopki:', rel);
        continue;
    }
    html = html.replace(FOOTER_RE, buildSiteFooter(prefix));
    fs.writeFileSync(filePath, html, 'utf8');
    count++;
}

console.log(`Zaktualizowano stopkę w ${count} plikach HTML.`);
