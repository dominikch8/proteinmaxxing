import https from 'https';
import fs from 'fs';
import path from 'path';

function get(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 pgcheck', 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' } }, (res) => {
            let d = '';
            res.on('data', (c) => (d += c));
            res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: d }));
        }).on('error', reject);
    });
}

const out = [];
const live = await get('https://proteiner.pl/artykuly');
const local = fs.readFileSync('artykuly.html', 'utf8');

out.push('=== LIVE HEADERS ===');
for (const k of ['cache-control', 'etag', 'last-modified', 'age', 'content-length', 'server', 'x-cache', 'cf-cache-status', 'vary']) {
    if (live.headers[k] !== undefined) out.push('  ' + k + ': ' + live.headers[k]);
}

function region(html) {
    const i = html.indexOf('window.applyArticlesPagination');
    if (i < 0) return null;
    const j = html.indexOf('</script>', i);
    return html.slice(i, j);
}
const rl = region(live.body);
const rlo = region(local);
out.push('liveRegionLen=' + (rl ? rl.length : 'null') + ' localRegionLen=' + (rlo ? rlo.length : 'null'));
out.push('regionIdentical=' + (rl === rlo));

// Diff lines of the region
if (rl && rlo) {
    const a = rl.split(/\r?\n/);
    const b = rlo.split(/\r?\n/);
    out.push('liveLines=' + a.length + ' localLines=' + b.length);
    const n = Math.max(a.length, b.length);
    let shown = 0;
    for (let i = 0; i < n && shown < 40; i++) {
        if (a[i] !== b[i]) { out.push('  DIFF@' + i + '\n    LIVE : ' + (a[i] || '<none>') + '\n    LOCAL: ' + (b[i] || '<none>')); shown++; }
    }
    if (!shown) out.push('  no line diffs');
}

// Count article tiles on live (static) and pagination-related markup
const cnt = (live.body.match(/class="article-card/g) || []).length;
out.push('liveArticleCardCount=' + cnt);

fs.writeFileSync(path.join(process.env.TEMP, 'pglive2.txt'), out.join('\n') + '\n');
console.log('ok');
