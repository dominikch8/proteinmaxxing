import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

/** Drugi zestaw png/apple zaraz po pierwszym apple-touch-icon. */
const DUP_AFTER_APPLE =
    /(<link rel="apple-touch-icon"[^>]*>\s*)(?:<link rel="icon" type="image\/png" sizes="32x32"[^>]*>\s*<link rel="icon" type="image\/png" sizes="192x192"[^>]*>\s*<link rel="apple-touch-icon"[^>]*>\s*)+/gi;

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
    const next = html.replace(DUP_AFTER_APPLE, '$1');
    if (next !== html) {
        fs.writeFileSync(file, next, 'utf8');
        n++;
    }
}
console.log(`dedupe-favicon-links: ${n} plików`);
