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

function patchFile(filePath, prefix) {
    let html = fs.readFileSync(filePath, 'utf8');
    if (!FOOTER_RE.test(html)) {
        console.warn('Brak stopki:', filePath);
        return false;
    }
    html = html.replace(FOOTER_RE, buildSiteFooter(prefix));
    fs.writeFileSync(filePath, html, 'utf8');
    return true;
}

function walkHtml(dir, prefix) {
    let n = 0;
    for (const name of fs.readdirSync(dir)) {
        const full = path.join(dir, name);
        if (name.endsWith('.html')) {
            if (patchFile(full, prefix)) n++;
        }
    }
    return n;
}

const rootPages = ['index.html', 'dieta.html', 'trening.html', 'informacje.html', 'o-mnie.html'];
let count = 0;
for (const f of rootPages) {
    if (patchFile(path.join(root, f), '')) count++;
}
count += walkHtml(path.join(root, 'produkty'), '../');
console.log(`Zaktualizowano stopkę w ${count} plikach HTML.`);
