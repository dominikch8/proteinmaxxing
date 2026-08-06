/**
 * Point brand logo to Dieta; rename leftover "Kalkulator" body links.
 * node scripts/patch-logo-dieta-home.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP = new Set(['node_modules', '.git', '.github', '.cursor', 'domains']);

function walkHtml(dir, list = []) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) {
            if (SKIP.has(e.name)) continue;
            walkHtml(p, list);
        } else if (e.name.endsWith('.html')) list.push(p);
    }
    return list;
}

function patch(html, rel) {
    let out = html;

    out = out.replace(/(<a href="\/">)Kalkulator(<\/a>)/g, '$1Kalkulator BMI$2');

    const isCat =
        rel.includes('/produkty/kategoria/') || rel.startsWith('produkty/kategoria/');
    const isProduct =
        (rel.includes('/produkty/') || rel.startsWith('produkty/')) && !isCat;

    if (isCat) {
        out = out.replace(
            /(<a href=")(\.\.\/\.\.\/)(" class="logo")/g,
            '$1../../dieta$3'
        );
        out = out.replace(
            /(<a class="logo" href=")(\.\.\/\.\.\/)(")/g,
            '$1../../dieta$3'
        );
    } else if (isProduct) {
        out = out.replace(/(<a class="logo" href=")(\.\.\/)(")/g, '$1../dieta$3');
        out = out.replace(/(<a href=")(\.\.\/)(" class="logo")/g, '$1../dieta$3');
    } else if (out.includes('class="nav-links"') || out.includes("class='nav-links'")) {
        out = out.replace(/(<a href=")\/(" class="logo")/g, '$1dieta$2');
        out = out.replace(/(<a class="logo" href=")\/(")/g, '$1dieta$2');
        out = out.replace(/(<a href=")index\.html(" class="logo")/g, '$1dieta$2');
        out = out.replace(/(<a class="logo" href=")index\.html(")/g, '$1dieta$2');
    }

    return out;
}

let n = 0;
for (const fp of walkHtml(root)) {
    const rel = path.relative(root, fp).replace(/\\/g, '/');
    const before = fs.readFileSync(fp, 'utf8');
    const after = patch(before, rel);
    if (after !== before) {
        fs.writeFileSync(fp, after);
        n += 1;
    }
}

console.log(`Updated logo/home links in ${n} HTML files.`);
