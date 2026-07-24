/**
 * Usuwa Clickio CMP/tracking i przywraca baner cookie Proteiner.
 * Uruchom: node scripts/restore-cookie-banner.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP_DIRS = new Set(['node_modules', '.git', 'domains', 'deploy-bundle']);

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

function htmlPrefix(filePath) {
    const rel = path.relative(root, filePath).replace(/\\/g, '/');
    const depth = rel.split('/').length - 1;
    return depth === 0 ? '' : '../'.repeat(depth);
}

function stripClickio(html) {
    return html
        .replace(/\s*<script[^>]*clickiocmp\.com[^>]*><\/script>\s*\n?/gi, '\n')
        .replace(/\s*<script[^>]*clickiocdn\.com[^>]*><\/script>\s*\n?/gi, '\n')
        .replace(/\n{3,}/g, '\n\n');
}

function ensureCookieBanner(html, prefix) {
    if (html.includes('cookie-banner.js')) return html;

    const insert = `    <link rel="stylesheet" href="${prefix}css/cookie-consent.css">\n    <script src="${prefix}js/cookie-banner.js"></script>\n`;
    const themeRe = new RegExp(`(<script src="${prefix.replace(/\./g, '\\.')}js/theme\\.js"><\\/script>)`);
    if (themeRe.test(html)) {
        return html.replace(themeRe, `${insert}$1`);
    }
    if (html.includes('</body>')) {
        return html.replace('</body>', `${insert}</body>`);
    }
    return html;
}

let changed = 0;
for (const fp of walkHtml(root)) {
    const prefix = htmlPrefix(fp);
    const before = fs.readFileSync(fp, 'utf8');
    let after = stripClickio(before);
    if (after.includes('consent-head.js') || after.includes('google-adsense-account')) {
        after = ensureCookieBanner(after, prefix);
    }
    if (after !== before) {
        fs.writeFileSync(fp, after, 'utf8');
        changed++;
    }
}

console.log(`Przywrócono baner cookie / usunięto Clickio w ${changed} plikach HTML.`);
