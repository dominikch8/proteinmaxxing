import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';

const ROOT = process.cwd();
const OUT = path.join(os.tmpdir(), 'pgverify.txt');
const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.ico': 'image/x-icon'
};

const MOCK_COUNT = 200;
const now = Date.now();
const mock = {
    articles: Array.from({ length: MOCK_COUNT }, (_, i) => ({
        slug: 'mock-' + (i + 1),
        url: 'artykul/mock-' + (i + 1),
        emoji: '📝',
        title: 'Mock artykuł numer ' + (i + 1),
        subtitle: 'Opis testowy ' + (i + 1),
        date: now - i * 86400000
    }))
};

const server = http.createServer((req, res) => {
    let u = decodeURIComponent(req.url.split('?')[0]);
    if (u === '/api/articles/list.php') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify(mock));
        return;
    }
    if (u === '/') u = '/artykuly.html';
    const f = path.join(ROOT, u.replace(/^\//, ''));
    fs.readFile(f, (err, data) => {
        if (err) { res.writeHead(404); res.end('nf'); return; }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream' });
        res.end(data);
    });
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const CHROME_CANDIDATES = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
];
const CHROME = CHROME_CANDIDATES.find((p) => fs.existsSync(p));
const dbgPort = 9500 + Math.floor(Math.random() * 400);
const profile = path.join(os.tmpdir(), 'pgverify-' + Date.now());
const pageUrl = 'http://127.0.0.1:' + port + '/artykuly.html';

const chrome = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--disable-extensions', '--remote-debugging-port=' + dbgPort,
    '--user-data-dir=' + profile, '--window-size=1280,900', pageUrl
], { stdio: 'ignore' });

async function pageWs() {
    for (let i = 0; i < 80; i++) {
        try {
            const r = await fetch('http://127.0.0.1:' + dbgPort + '/json/list');
            const list = await r.json();
            const p = list.find((t) => t.type === 'page' && /artykuly/.test(t.url));
            if (p && p.webSocketDebuggerUrl) return p.webSocketDebuggerUrl;
        } catch (e) { /* retry */ }
        await new Promise((r) => setTimeout(r, 500));
    }
    throw new Error('no devtools page');
}

const ws = new WebSocket(await pageWs());
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let seq = 0;
const pending = new Map();
ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
};
function send(method, params = {}) {
    const i = ++seq;
    return new Promise((res) => { pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
}
async function evaluate(expression) {
    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (r.result && r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails));
    return r.result.result.value;
}
await send('Runtime.enable');

const out = [];
for (let i = 0; i < 80; i++) {
    const ready = await evaluate(`(function(){var p=document.getElementById('articlesPagination');return !!(p && p.querySelectorAll('.btn').length>1 && document.querySelectorAll('#artykulyList .poradnik-hub-tile').length>${MOCK_COUNT - 1});})()`);
    if (ready) break;
    await new Promise((r) => setTimeout(r, 400));
}

const report = await evaluate(`(function(){
    var p = document.getElementById('articlesPagination');
    var btns = Array.prototype.slice.call(p.querySelectorAll('.btn'));
    var nums = btns.map(function(b){return b.textContent.trim();});
    var ell = p.querySelectorAll('.articles-pagination-ellipsis').length;
    var tops = {};
    btns.forEach(function(b){ var t=Math.round(b.getBoundingClientRect().top); tops[t]=(tops[t]||0)+1; });
    var rows = Object.keys(tops).length;
    var pr = p.getBoundingClientRect();
    var search = document.querySelector('.articles-search').getBoundingClientRect();
    return JSON.stringify({
        tileCount: document.querySelectorAll('#artykulyList .poradnik-hub-tile').length,
        buttonCount: btns.length,
        numbers: nums.join(' '),
        expectedNumbers: Array.from({length: Math.ceil(${MOCK_COUNT}/16)}, function(_,i){return String(i+1);}).join(' '),
        ellipsis: ell,
        buttonRows: rows,
        paginationWidth: Math.round(pr.width),
        paginationTop: Math.round(pr.top),
        searchTop: Math.round(search.top),
        paginationBelowSearch: pr.top > search.bottom - 2,
        activeCount: p.querySelectorAll('.btn.is-active').length,
        activeText: (p.querySelector('.btn.is-active')||{}).textContent
    });
})()`);
out.push('DESKTOP ' + report);

await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 820, deviceScaleFactor: 1, mobile: true });
await new Promise((r) => setTimeout(r, 600));
const mobile = await evaluate(`(function(){
    var p = document.getElementById('articlesPagination');
    var btns = Array.prototype.slice.call(p.querySelectorAll('.btn'));
    var rowsSet = {};
    btns.forEach(function(b){ rowsSet[Math.round(b.getBoundingClientRect().top)]=1; });
    var pr = p.getBoundingClientRect();
    return JSON.stringify({ buttonCount: btns.length, rows: Object.keys(rowsSet).length, width: Math.round(pr.width), fitsViewport: pr.width <= 390 });
})()`);
out.push('MOBILE ' + mobile);

fs.writeFileSync(OUT, out.join('\n') + '\n');
ws.close();
chrome.kill();
server.close();
process.exit(0);
