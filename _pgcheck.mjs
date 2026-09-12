import fs from 'fs';
import http from 'http';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';

const ROOT = process.cwd();
const HTML = fs.readFileSync(path.join(ROOT, 'artykuly.html'), 'utf8');
const anchors = (HTML.match(/class="poradnik-hub-tile"/g) || []).length;
const anyTile = (HTML.match(/poradnik-hub-tile/g) || []).length;

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png' };

const server = http.createServer((req, res) => {
    const u = decodeURIComponent(req.url.split('?')[0]);
    // Stub the articles API so the static tile count is the real input.
    if (u.startsWith('/api/articles/list.php')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ articles: [] }));
        return;
    }
    let f = u === '/' ? '/artykuly.html' : u;
    f = f.replace(/^\/artykul\//, '/');
    const full = path.join(ROOT, f.replace(/^\//, ''));
    fs.readFile(full, (err, data) => {
        if (err) { res.writeHead(404); res.end('nf'); return; }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(full).toLowerCase()] || 'application/octet-stream' });
        res.end(data);
    });
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const CHROME = ['C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe', 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'].find((p) => fs.existsSync(p));
const dbgPort = 9700 + Math.floor(Math.random() * 200);
const profile = path.join(os.tmpdir(), 'pgchk-' + Date.now());
const url = 'http://127.0.0.1:' + port + '/artykuly.html';
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--remote-debugging-port=' + dbgPort, '--user-data-dir=' + profile, '--window-size=1200,1000', url], { stdio: 'ignore' });

async function pageWs() {
    for (let i = 0; i < 80; i++) {
        try {
            const r = await fetch('http://127.0.0.1:' + dbgPort + '/json/list');
            const list = await r.json();
            const p = list.find((t) => t.type === 'page' && /artykuly/.test(t.url));
            if (p) return p.webSocketDebuggerUrl;
        } catch (e) { /* retry */ }
        await new Promise((r) => setTimeout(r, 500));
    }
    throw new Error('no page');
}

const ws = new WebSocket(await pageWs());
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let seq = 0;
const pending = new Map();
ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
const send = (method, params = {}) => { const i = ++seq; return new Promise((res) => { pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); }); };
async function evaluate(expression) {
    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (r.result && r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails));
    return r.result.result.value;
}
await send('Runtime.enable');
await new Promise((r) => setTimeout(r, 1500));

const info = await evaluate(`(function(){
    var root = document.getElementById('articlesPagination');
    var btns = Array.prototype.map.call(root.querySelectorAll('button'), function(b){return b.textContent;});
    return JSON.stringify({
        staticTilesInHtml: ${anchors},
        tilesInDom: document.querySelectorAll('.poradnik-hub-tile').length,
        paginationButtons: btns.length,
        labels: btns.join(','),
        hasEllipsisSpan: !!root.querySelector('.articles-pagination-ellipsis'),
        activeLabel: (root.querySelector('button.is-active')||{}).textContent
    });
})()`);

const shot = await send('Page.captureScreenshot', { format: 'png' });
const shotPath = path.join(os.tmpdir(), 'pgshot.png');
if (shot.result && shot.result.data) fs.writeFileSync(shotPath, Buffer.from(shot.result.data, 'base64'));

const out = ['anchors=' + anchors, 'anyTileMentions=' + anyTile, 'DOM ' + info, 'shot=' + shotPath];
fs.writeFileSync(path.join(os.tmpdir(), 'pgout.txt'), out.join('\n') + '\n');
ws.close(); chrome.kill(); server.close(); process.exit(0);
