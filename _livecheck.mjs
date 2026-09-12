import fs from 'fs';

const out = [];
const r = await fetch('https://proteiner.pl/artykuly', { headers: { 'cache-control': 'no-cache' } });
const html = await r.text();
out.push('HTTP ' + r.status + ' bytes=' + html.length);

const tiles = (html.match(/poradnik-hub-tile/g) || []).length;
out.push('tileMarkerCount=' + tiles);

out.push('hasBuildPageNumbers=' + html.includes('buildPageNumbers'));
out.push('hasEllipsisSpan=' + html.includes('articles-pagination-ellipsis'));
out.push('hasOldSlice=' + /currentPage\s*[-+]\s*2/.test(html));
out.push('perPage=' + (/perPage\s*=\s*(\d+)/.exec(html) || [])[1]);

const idx = html.indexOf('buildPageNumbers');
out.push('CONTEXT_START');
out.push(html.slice(Math.max(0, idx - 900), idx + 500));

// API
try {
    const a = await fetch('https://proteiner.pl/api/articles/list.php', { headers: { 'cache-control': 'no-cache' } });
    const txt = await a.text();
    out.push('API status=' + a.status + ' bytes=' + txt.length + ' ct=' + a.headers.get('content-type'));
    out.push('API head: ' + txt.slice(0, 400));
} catch (e) {
    out.push('API err ' + e.message);
}

fs.writeFileSync('C:/Temp/live_check.txt', out.join('\n'));
console.log('done');
