/** Wstawia skrypty In-Page Push (Joyful + Interesting + Wise) do <head>. */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildNap5kInPagePushHead } from './site-head-assets.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const zones = {
    joyful: '11118313',
    interesting: '11118333',
    wise: '11118646'
};
const fullSnippet = buildNap5kInPagePushHead();
const wiseLine = `    <script>(function(s){s.dataset.zone='${zones.wise}',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>\n`;

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
    const has = Object.fromEntries(Object.entries(zones).map(([k, id]) => [k, html.includes(zoneMarker(id))]));

    if (has.joyful && has.interesting && has.wise) continue;

    if (has.interesting && !has.joyful) {
        const joyfulLine = fullSnippet.split('\n')[0] + '\n';
        html = html.replace(
            new RegExp(`\\s*<script>\\(function\\(s\\)\\{s\\.dataset\\.zone='${zones.interesting}'[\\s\\S]*?</script>\\s*`, 'i'),
            `${joyfulLine}$&`
        );
        has.joyful = true;
    }

    if (has.joyful && has.interesting && !has.wise) {
        html = html.replace(
            new RegExp(`(<script>\\(function\\(s\\)\\{s\\.dataset\\.zone='${zones.interesting}'[\\s\\S]*?</script>\\s*)`, 'i'),
            `$1${wiseLine}`
        );
    } else if (!has.joyful && !has.interesting && !has.wise) {
        const reQuge = /(<script src="https:\/\/quge5\.com\/88\/tag\.min\.js"[^>]*><\/script>\s*)/i;
        if (reQuge.test(html)) {
            html = html.replace(reQuge, `$1${fullSnippet}\n`);
        } else {
            const reViewport = /(<meta name="viewport"[^>]*>\s*)/i;
            if (!reViewport.test(html)) continue;
            html = html.replace(reViewport, `$1${fullSnippet}\n`);
        }
    } else {
        continue;
    }

    fs.writeFileSync(fp, html, 'utf8');
    changed++;
}

console.log(`Zaktualizowano nap5k (Joyful + Interesting + Wise) w ${changed} plikach HTML.`);
