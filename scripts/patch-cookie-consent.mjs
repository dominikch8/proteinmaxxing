import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const HEAD_MARKER = '<meta name="google-adsense-account"';
const HEAD_ROOT = '    <script src="js/consent-head.js"></script>\n    ';
const HEAD_PROD = '    <script src="../js/consent-head.js"></script>\n    ';

const FOOT_ROOT = `    <link rel="stylesheet" href="css/cookie-consent.css">\n    <script src="js/cookie-banner.js"></script>\n`;
const FOOT_PROD = `    <link rel="stylesheet" href="../css/cookie-consent.css">\n    <script src="../js/cookie-banner.js"></script>\n`;

function patchHead(html, isProduct) {
    if (html.includes('consent-head.js')) return html;
    const insert = isProduct ? HEAD_PROD : HEAD_ROOT;
    if (!html.includes(HEAD_MARKER)) return null;
    return html.replace(HEAD_MARKER, insert + HEAD_MARKER);
}

function patchFoot(html, isProduct) {
    if (html.includes('cookie-banner.js')) return html;
    const insert = isProduct ? FOOT_PROD : FOOT_ROOT;
    return html.replace('</body>', `${insert}</body>`);
}

function patchFile(filePath, isProduct) {
    let html = fs.readFileSync(filePath, 'utf8');
    const before = html;
    html = patchHead(html, isProduct);
    if (html === null) return { filePath, ok: false, reason: 'no adsense meta' };
    html = patchFoot(html, isProduct);
    if (html !== before) {
        fs.writeFileSync(filePath, html, 'utf8');
        return { filePath, ok: true };
    }
    return { filePath, ok: true, reason: 'already patched' };
}

const rootPages = ['index.html', 'dieta.html', 'trening.html', 'informacje.html', 'o-mnie.html'];
const results = [];

for (const name of rootPages) {
    results.push(patchFile(path.join(root, name), false));
}

const produktyDir = path.join(root, 'produkty');
for (const name of fs.readdirSync(produktyDir)) {
    if (!name.endsWith('.html')) continue;
    results.push(patchFile(path.join(produktyDir, name), true));
}

const changed = results.filter((r) => r.ok && !r.reason).length;
const skipped = results.filter((r) => r.reason === 'already patched').length;
console.log(`Patched ${changed} files, ${skipped} already had consent, ${results.filter((r) => !r.ok).length} failed.`);
