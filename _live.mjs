const url = 'https://proteiner.pl/artykuly';
const out = [];
try {
    const r = await fetch(url, { headers: { 'cache-control': 'no-cache' } });
    const t = await r.text();
    out.push('status=' + r.status);
    out.push('len=' + t.length);
    out.push('hasBuildPageNumbers=' + t.includes('buildPageNumbers'));
    out.push('hasEllipsisSpanCreate=' + t.includes("class = 'articles-pagination-ellipsis'"));
    out.push('tileOpeners=' + ((t.match(/class="[^"]*\bporadnik-hub-tile\b[^"]*"/g) || []).length));
    out.push('dataCategory=' + ((t.match(/data-category="/g) || []).length));
    const m = t.match(/function buildPageNumbers[\s\S]{0,400}/);
    out.push('--- fn ---');
    out.push(m ? m[0].slice(0, 400) : 'NOT FOUND');
} catch (e) {
    out.push('ERR ' + (e && e.message));
}
import('fs').then((fs) => fs.writeFileSync('C:/Temp/LIVE.txt', out.join('\n') + '\n'));
