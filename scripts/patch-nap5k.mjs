/** Wstawia In-Page Push (Interesting) do <head>. Joyful + Wise są w bocznych slotach. */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildNap5kInPagePushHead } from './site-head-assets.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const interesting = "s.dataset.zone='11118333'";
const fullSnippet = buildNap5kInPagePushHead();

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

function zoneMarker(id) {
    return `s.dataset.zone='${id}'`;
}

let changed = 0;
for (const fp of walkHtml(root)) {
    let html = fs.readFileSync(fp, 'utf8');
    if (html.includes(interesting)) continue;

    const reQuge = /(<script src="https:\/\/quge5\.com\/88\/tag\.min\.js"[^>]*><\/script>\s*)/i;
    if (reQuge.test(html)) {
        html = html.replace(reQuge, `$1${fullSnippet}\n`);
    } else {
        const reViewport = /(<meta name="viewport"[^>]*>\s*)/i;
        if (!reViewport.test(html)) continue;
        html = html.replace(reViewport, `$1${fullSnippet}\n`);
    }

    fs.writeFileSync(fp, html, 'utf8');
    changed++;
}

console.log(`Zaktualizowano nap5k (Interesting w head) w ${changed} plikach HTML.`);
