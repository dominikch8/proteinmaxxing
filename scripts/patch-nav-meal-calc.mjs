/**
 * Dodaje zakładkę „Kalkulator posiłków” po „Kalkulator BMI” we wszystkich HTML.
 * Uruchom: node scripts/patch-nav-meal-calc.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP_DIRS = new Set(['node_modules', '.git', '.github', '.cursor', 'domains']);

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

function hasNavMeal(html) {
    return /href="[^"]*kalkulator-posilkow[^"]*"[^>]*>Kalkulator posiłków</.test(html);
}

function patchNav(html) {
    if (hasNavMeal(html)) return html;

    const bmiLiRe =
        /(<li><a class="nav-link(?: active)?" href="((?:\/|\.\.\/)*)(kalkulator-bmi(?:\.html)?)"([^>]*)>Kalkulator BMI<\/a><\/li>)/;

    if (!bmiLiRe.test(html)) return html;

    return html.replace(bmiLiRe, (match, full, prefix, page) => {
        const href = `${prefix}kalkulator-posilkow${page.endsWith('.html') ? '.html' : ''}`;
        return `${full}\n                <li><a class="nav-link" href="${href}">Kalkulator posiłków</a></li>`;
    });
}

let changed = 0;
for (const fp of walkHtml(root)) {
    const before = fs.readFileSync(fp, 'utf8');
    const after = patchNav(before);
    if (after !== before) {
        fs.writeFileSync(fp, after, 'utf8');
        changed++;
    }
}

console.log(`Dodano „Kalkulator posiłków” do nawigacji w ${changed} plikach HTML.`);
