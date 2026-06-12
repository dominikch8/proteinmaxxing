/**
 * Dodaje Google Consent Mode (consent-head.js) przed AdSense oraz baner cookie przed </body>.
 * Uruchom: node scripts/patch-cookie-consent.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP_DIRS = new Set(['node_modules', '.git', 'domains']);
const HEAD_MARKER = '<meta name="google-adsense-account"';

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

function patchHead(html, prefix) {
    if (html.includes('consent-head.js')) return html;
    if (!html.includes(HEAD_MARKER)) return null;
    const insert = `    <script src="${prefix}js/consent-head.js"></script>\n    `;
    return html.replace(HEAD_MARKER, insert + HEAD_MARKER);
}

function patchFoot(html, prefix) {
    if (html.includes('cookie-banner.js')) return html;
    const insert = `    <link rel="stylesheet" href="${prefix}css/cookie-consent.css">\n    <script src="${prefix}js/cookie-banner.js"></script>\n`;
    const themeRe = new RegExp(`(<script src="${prefix.replace(/\./g, '\\.')}js/theme\\.js"><\\/script>)`);
    if (themeRe.test(html)) {
        return html.replace(themeRe, `${insert}$1`);
    }
    return html.replace('</body>', `${insert}</body>`);
}

let changed = 0;
let skipped = 0;
let noAdsense = 0;

for (const fp of walkHtml(root)) {
    const prefix = htmlPrefix(fp);
    let html = fs.readFileSync(fp, 'utf8');
    const before = html;

    html = patchHead(html, prefix);
    if (html === null) {
        noAdsense++;
        continue;
    }
    html = patchFoot(html, prefix);

    if (html !== before) {
        fs.writeFileSync(fp, html, 'utf8');
        changed++;
    } else {
        skipped++;
    }
}

console.log(`Cookie consent: zaktualizowano ${changed}, bez zmian ${skipped}, pominięto (brak AdSense) ${noAdsense}.`);
