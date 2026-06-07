/** Usuwa wszystkie wstawki reklamowe i baner cookie z plików HTML. */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function walkHtml(dir, list = []) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) {
            if (e.name === 'node_modules' || e.name === '.git') continue;
            walkHtml(p, list);
        } else if (e.name.endsWith('.html')) {
            list.push(p);
        }
    }
    return list;
}

function stripAdsFromHtml(html) {
    let out = html;

    out = out.replace(/\s*<script src="(\.\.\/)?js\/consent-head\.js"><\/script>\s*/g, '\n');
    out = out.replace(/\s*<link rel="stylesheet" href="(\.\.\/)?css\/cookie-consent\.css">\s*/g, '\n');
    out = out.replace(/\s*<script src="(\.\.\/)?js\/cookie-banner\.js"><\/script>\s*/g, '\n');
    out = out.replace(/\s*<link rel="stylesheet" href="(\.\.\/)?css\/partner-ads\.css">\s*/g, '\n');
    out = out.replace(/\s*<script src="(\.\.\/)?js\/partner-ads\.js"><\/script>\s*/g, '\n');

    return out;
}

let changed = 0;
for (const fp of walkHtml(root)) {
    const before = fs.readFileSync(fp, 'utf8');
    const after = stripAdsFromHtml(before);
    if (after !== before) {
        fs.writeFileSync(fp, after, 'utf8');
        changed++;
    }
}

console.log(`Usunięto reklamy z ${changed} plików HTML.`);
