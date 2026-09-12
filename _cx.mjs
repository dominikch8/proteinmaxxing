import fs from 'fs';
import path from 'path';

const out = [];
const html = fs.readFileSync('artykuly.html', 'utf8');
const lines = html.split(/\r?\n/);
lines.forEach((l, i) => {
    if (/pagin/i.test(l)) out.push('HTML ' + (i + 1) + ': ' + l.trim().slice(0, 180));
});

for (const d of ['css']) {
    for (const f of fs.readdirSync(d)) {
        if (!f.endsWith('.css')) continue;
        const s = fs.readFileSync(path.join(d, f), 'utf8');
        s.split(/\r?\n/).forEach((l, i) => {
            if (/pagin/i.test(l)) out.push('CSS ' + f + ':' + (i + 1) + ': ' + l.trim().slice(0, 180));
        });
    }
}
const j = html.indexOf('articlesPagination');
out.push('IDX articlesPagination=' + j);
if (j >= 0) out.push('CTX=' + html.slice(j - 120, j + 220).replace(/\s+/g, ' '));
fs.writeFileSync('C:/Temp/cx.txt', out.join('\n') || 'NONE');
console.log('ok', out.length);
