import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawn } from 'child_process';

const CHROME = ['C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'].find((p) => fs.existsSync(p));
const dbg = 9500 + Math.floor(Math.random() * 400);
const profile = path.join(os.tmpdir(), 'lv-' + Date.now());
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--disable-extensions', '--remote-debugging-port=' + dbg, '--user-data-dir=' + profile,
    '--window-size=1280,1000', 'https://proteiner.pl/artykuly'], { stdio: 'ignore' });

async function pageWs() {
    for (let i = 0; i < 90; i++) {
        try {
            const r = await fetch('http://127.0.0.1:' + dbg + '/json/list');
            const l = await r.json();
            const p = l.find((t) => t.type === 'page' && /artykuly/.test(t.url));
            if (p) return p.webSocketDebuggerUrl;
        } catch (e) { /* retry */ }
        await new Promise((r) => setTimeout(r, 500));
    }
    throw new Error('no page');
}
const ws = new WebSocket(await pageWs());
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let seq = 0; const pending = new Map();
ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
function send(method, params = {}) { const i = ++seq; return new Promise((res) => { pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); }); }
async function ev(expression) {
    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (r.result && r.result.exceptionDetails) return 'EXC ' + JSON.stringify(r.result.exceptionDetails).slice(0, 300);
    return r.result.result.value;
}
await send('Runtime.enable');
await new Promise((r) => setTimeout(r, 6000));

const out = [];
out.push('URL ' + (await ev('location.href')));
out.push('TILES ' + (await ev(`document.querySelectorAll('#artykulyList .poradnik-hub-tile').length`)));
out.push('TILES_VISIBLE ' + (await ev(`Array.from(document.querySelectorAll('#artykulyList .poradnik-hub-tile')).filter(function(t){return t.style.display!=='none';}).length`)));
out.push('BUTTONS ' + (await ev(`document.querySelectorAll('#articlesPagination .btn').length`)));
out.push('LABELS "' + (await ev(`Array.from(document.querySelectorAll('#articlesPagination .btn')).map(function(b){return b.textContent.trim();}).join(' ')`)) + '"' );
out.push('ELLIPSIS ' + (await ev(`document.querySelectorAll('#articlesPagination .articles-pagination-ellipsis').length`)));
out.push('ACTIVE ' + (await ev(`(document.querySelector('#articlesPagination .btn.is-active')||{}).textContent`)));
out.push('FN "' + (await ev(`(window.applyArticlesPagination||function(){}).toString().slice(0,320)`)) + '"');
out.push('IMG_ERR ' + (await ev(`Array.from(document.images).filter(function(i){return i.complete&&i.naturalWidth===0;}).length`)));

fs.writeFileSync('C:/Temp/live_render.txt', out.join('\n'));
ws.close(); chrome.kill();
process.exit(0);
