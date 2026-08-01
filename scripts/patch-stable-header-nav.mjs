/**
 * Stabilizuje górną nawigację:
 * - stały slot #authNavSlot (Zaloguj) w HTML — bez skoku po JS
 * - stały przycisk .nav-toggle przed .nav-links
 *
 * node scripts/patch-stable-header-nav.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP = new Set(['node_modules', '.git', '.github', '.cursor', 'domains']);

const TOGGLE = `<button type="button" class="nav-toggle" aria-label="Otwórz menu" aria-expanded="false" aria-controls="site-nav-links"><span class="nav-toggle-bar" aria-hidden="true"></span><span class="nav-toggle-bar" aria-hidden="true"></span><span class="nav-toggle-bar" aria-hidden="true"></span></button>`;

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

function prefixFor(rel) {
    const depth = rel.split('/').length - 1;
    return depth <= 0 ? '' : '../'.repeat(depth);
}

function ensureAuthSlot(html, prefix) {
    if (html.includes('id="authNavSlot"') || html.includes("id='authNavSlot'")) return html;
    if (!html.includes('class="nav-links"')) return html;

    const href = `${prefix}logowanie`;
    const slot = `\n                <li id="authNavSlot" class="auth-nav-item"><a class="nav-link auth-nav-link" href="${href}">Zaloguj</a></li>`;

    // Przed „Dodaj produkt”, żeby Zaloguj było po lewej od niego; inaczej przed </ul>
    if (/href="[^"]*dodaj-produkt"/.test(html)) {
        return html.replace(
            /(<li[^>]*>\s*<a class="nav-link[^"]*"[^>]*href="[^"]*dodaj-produkt"[^>]*>Dodaj produkt(?:y)?<\/a>\s*<\/li>)/i,
            `${slot}\n                $1`
        );
    }

    return html.replace(
        /(<ul class="nav-links"[^>]*>[\s\S]*?)(\n\s*<\/ul>\s*\n\s*<\/nav>)/,
        (_, list, close) => {
            if (list.includes('authNavSlot')) return _;
            return `${list}${slot}${close}`;
        }
    );
}

function ensureNavToggle(html) {
    if (html.includes('class="nav-toggle"')) return html;
    if (!html.includes('class="nav-links"')) return html;

    return html.replace(
        /(<a[^>]*class="logo"[^>]*>[\s\S]*?<\/a>\s*)(\n\s*<ul class="nav-links")/,
        (_, logo, ul) => `${logo}\n            ${TOGGLE}${ul.replace('<ul class="nav-links"', '<ul class="nav-links" id="site-nav-links"')}`
    );
}

function ensureNavLinksId(html) {
    if (/<ul class="nav-links"[^>]*\bid=/.test(html)) return html;
    return html.replace('<ul class="nav-links"', '<ul class="nav-links" id="site-nav-links"');
}

let changed = 0;
for (const fp of walk(root)) {
    const rel = path.relative(root, fp).replace(/\\/g, '/');
    const prefix = prefixFor(rel);
    let html = fs.readFileSync(fp, 'utf8');
    if (!html.includes('class="nav-links"')) continue;

    const before = html;
    html = ensureAuthSlot(html, prefix);
    html = ensureNavToggle(html);
    html = ensureNavLinksId(html);

    if (html !== before) {
        fs.writeFileSync(fp, html, 'utf8');
        changed += 1;
    }
}

console.log(`Zaktualizowano nawigację w ${changed} plikach HTML.`);
