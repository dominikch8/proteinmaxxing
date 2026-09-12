import https from 'https';
import fs from 'fs';
import path from 'path';

function get(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 pgcheck', 'Cache-Control': 'no-cache' } }, (res) => {
            let d = '';
            res.on('data', (c) => (d += c));
            res.on('end', () => resolve({ status: res.statusCode, body: d }));
        }).on('error', reject);
    });
}

const out = [];
try {
    const r = await get('https://proteiner.pl/artykuly');
    out.push('LIVE status=' + r.status + ' len=' + r.body.length);
    out.push('hasBuildPageNumbers=' + r.body.includes('buildPageNumbers'));
    out.push('hasEllipsisClass=' + r.body.includes('articles-pagination-ellipsis'));
    out.push('hasEllipsisChar=' + r.body.includes('\u2026'));
    out.push('hasPreviousPage=' + r.body.includes('previousPage'));
    const i = r.body.indexOf('function buildPageNumbers');
    if (i >= 0) out.push('BODY>>>' + r.body.slice(i, i + 260).replace(/\s+/g, ' '));
    else out.push('NO buildPageNumbers function in live HTML');
    // look for the older window-around logic
    const j = r.body.indexOf('Math.max(1, safePage');
    out.push('hasMathMaxSafePage=' + (j >= 0));
    fs.writeFileSync(path.join(process.env.TEMP, 'live.html'), r.body);
} catch (e) {
    out.push('LIVE ERROR ' + e.message);
}

// Also fetch the raw file served for artykuly (maybe trailing slash variant)
try {
    const r2 = await get('https://proteiner.pl/artykuly.html');
    out.push('LIVE2 status=' + r2.status + ' len=' + r2.body.length + ' hasBuild=' + r2.body.includes('buildPageNumbers') + ' hasEllChar=' + r2.body.includes('\u2026'));
} catch (e) {
    out.push('LIVE2 ERROR ' + e.message);
}

console.log(out.join('\n'));
