/**
 * Dodaje zakładkę „Artykuły” do nawigacji i stopki we wszystkich HTML.
 * Uruchom: node scripts/patch-nav-artykuly.mjs
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

function hasNavArtykuly(html) {
    return /class="nav-link[^"]*"[^>]*>Artykuły</.test(html);
}

function hasFooterArtykuly(html) {
    return /site-footer-nav[\s\S]{0,800}>Artykuły</.test(html);
}

function patchNav(html) {
    if (hasNavArtykuly(html)) return html;

    const poradnikLiRe =
        /(<li><a class="nav-link(?: active)?" href="((?:\/|\.\.\/)*)(poradnik-zywienia(?:\.html)?)"([^>]*)>Poradnik<\/a><\/li>)/;

    if (!poradnikLiRe.test(html)) return html;

    return html.replace(poradnikLiRe, (match, full, prefix, page) => {
        const href = `${prefix}artykuly${page.endsWith('.html') ? '.html' : ''}`;
        return `${full}\n                <li><a class="nav-link" href="${href}">Artykuły</a></li>`;
    });
}

function patchFooter(html) {
    if (hasFooterArtykuly(html)) return html;

    const footerPoradnikRe =
        /(<a href="((?:\/|\.\.\/)*)(poradnik-zywienia(?:\.html)?)">Poradnik<\/a>)(\s*<\/nav>)/;

    if (!footerPoradnikRe.test(html)) return html;

    return html.replace(footerPoradnikRe, (match, link, prefix, page, closing) => {
        const href = `${prefix}artykuly${page.endsWith('.html') ? '.html' : ''}`;
        return `${link}\n            <span aria-hidden="true">·</span>\n            <a href="${href}">Artykuły</a>${closing}`;
    });
}

function patchBreadcrumb(html, rel) {
    if (rel !== 'deficyt-kaloryczny-praktyka.html' && rel !== 'planowanie-posilkow.html') {
        return html;
    }
    return html.replace(
        /<a href="((?:\/|\.\.\/)*)poradnik-zywienia(?:\.html)?">Poradnik<\/a>(\s*›)/,
        '<a href="$1artykuly">Artykuły</a>$2'
    );
}

let changed = 0;
for (const fp of walkHtml(root)) {
    const rel = path.relative(root, fp).replace(/\\/g, '/');
    const before = fs.readFileSync(fp, 'utf8');
    let after = patchNav(before);
    after = patchFooter(after);
    after = patchBreadcrumb(after, rel);
    if (after !== before) {
        fs.writeFileSync(fp, after, 'utf8');
        changed++;
    }
}

console.log(`Zaktualizowano nawigację/stopkę Artykuły w ${changed} plikach HTML.`);
