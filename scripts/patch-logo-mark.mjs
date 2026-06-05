import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildLogoMark } from './site-logo-html.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const OLD = /<(?:div|span) class="logo-mark">P<\/(?:div|span)>/g;

function walk(dir, files = []) {
    for (const name of fs.readdirSync(dir)) {
        const full = path.join(dir, name);
        if (name === 'node_modules') continue;
        const st = fs.statSync(full);
        if (st.isDirectory()) walk(full, files);
        else if (name.endsWith('.html')) files.push(full);
    }
    return files;
}

let n = 0;
for (const file of walk(root)) {
    let html = fs.readFileSync(file, 'utf8');
    if (!OLD.test(html)) continue;
    OLD.lastIndex = 0;
    const rel = path.relative(root, file).replace(/\\/g, '/');
    const prefix = rel.startsWith('produkty/') ? '../' : '';
    const next = html.replace(OLD, buildLogoMark(prefix));
    if (next !== html) {
        fs.writeFileSync(file, next, 'utf8');
        n++;
    }
}
console.log(`patch-logo-mark: ${n} plików`);
