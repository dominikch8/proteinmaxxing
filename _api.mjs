const out = [];
try {
    const r = await fetch('https://proteiner.pl/api/articles/list.php', { headers: { Accept: 'application/json', 'cache-control': 'no-cache' } });
    out.push('status=' + r.status);
    const t = await r.text();
    out.push('len=' + t.length);
    out.push('head=' + t.slice(0, 300));
    let j = null;
    try { j = JSON.parse(t); } catch (e) { out.push('jsonErr=' + e.message); }
    if (j) {
        out.push('type=' + (Array.isArray(j) ? 'array' : typeof j));
        const arr = Array.isArray(j) ? j : (j.articles || j.items || j.data || []);
        out.push('count=' + (Array.isArray(arr) ? arr.length : 'n/a'));
        out.push('keys=' + JSON.stringify(Object.keys(arr[0] || j)));
    }
} catch (e) {
    out.push('ERR ' + (e && e.message));
}
(await import('fs')).writeFileSync('C:/Temp/API.txt', out.join('\n') + '\n');
