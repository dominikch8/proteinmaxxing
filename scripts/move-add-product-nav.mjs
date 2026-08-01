/**
 * Przenosi „Dodaj produkty” na prawo od #authNavSlot i oznacza link klasą .nav-link--subtle.
 *
 * node scripts/move-add-product-nav.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP = new Set(['node_modules', '.git', '.github', '.cursor', 'domains']);

const ADD_LI_RE =
    /<li>\s*<a class="nav-link([^"]*)"([^>]*)href="([^"]*dodaj-produkt)"([^>]*)>Dodaj produkty<\/a>\s*<\/li>\s*/i;

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

function buildAddLi(classTail, beforeHref, href, afterHref) {
    let classes = `nav-link${classTail || ''}`;
    if (!/\bnav-link--subtle\b/.test(classes)) {
        classes += ' nav-link--subtle';
    }
    return `<li class=" produkt</li>`;
}

function patch(html) {
    if (!html.includes('class="nav-links"') || !html.includes('dodaj-produkt')) return html;
    if (!ADD_LI_RE.test(html)) return html;

    const match = html.match(ADD_LI_RE);
    if (!match) return html;

    const addLi = buildAddLi(match[1], match[2], match[3], match[4]);
    let next = html.replace(ADD_LI_RE, '');

    if (/id="authNavSlot"/.test(next)) {
        next = next.replace(
            /(<li[^>]*id="authNavSlot"[^>]*>[\s\S]*?<\/li>)/,
            `$1\n                ${addLi}`
        );
    } else {
        next = next.replace(
            /(\n\s*<\/ul>\s*\n\s*<\/nav>)/,
            `\n                ${addLi}$1`
        );
    }

    return next;
}

let changed = 0;
for (const fp of walk(root)) {
    const before = fs.readFileSync(fp, 'utf8');
    const after = patch(before);
    if (after !== before) {
        fs.writeFileSync(fp, after, 'utf8');
        changed += 1;
    }
}

console.log(`Przeniesiono „Dodaj produkty” w ${changed} plikach HTML.`);
