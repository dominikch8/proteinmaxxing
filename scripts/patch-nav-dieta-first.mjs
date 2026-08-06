/**
 * Nav: Dieta first, rename Kalkulator → Kalkulator BMI.
 * node scripts/patch-nav-dieta-first.mjs
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

/** Swap adjacent Kalkulator / Dieta <li> so Dieta is first; rename label. */
function patchNav(html) {
    let out = html;

    // Exact two-item swap (Kalkulator then Dieta) — any href/attrs
    out = out.replace(
        /(<li>\s*<a class="nav-link[^"]*"[^>]*>)Kalkulator(<\/a>\s*<\/li>)\s*(<li>\s*<a class="nav-link[^"]*"[^>]*>Dieta<\/a>\s*<\/li>)/g,
        '$3\n                $1Kalkulator BMI$2'
    );

    // If already swapped or Dieta first with Kalkulator after — just rename remaining
    out = out.replace(
        /(<a class="nav-link[^"]*"[^>]*>)Kalkulator(<\/a>)/g,
        '$1Kalkulator BMI$2'
    );

    // Avoid double rename
    out = out.replace(/Kalkulator BMI BMI/g, 'Kalkulator BMI');

    return out;
}

let n = 0;
for (const fp of walkHtml(root)) {
    const before = fs.readFileSync(fp, 'utf8');
    if (!before.includes('nav-links') || !before.includes('Kalkulator')) continue;
    const after = patchNav(before);
    if (after !== before) {
        fs.writeFileSync(fp, after);
        n += 1;
    }
}

console.log(`Updated nav in ${n} HTML files.`);
