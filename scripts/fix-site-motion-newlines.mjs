import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP = new Set(['node_modules', '.git', '.github', '.cursor', 'deploy-bundle', 'domains']);

function walk(dir, out = []) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
        if (SKIP.has(ent.name)) continue;
        const full = path.join(dir, ent.name);
        if (ent.isDirectory()) walk(full, out);
        else if (ent.name.endsWith('.html')) out.push(full);
    }
    return out;
}

let n = 0;
for (const file of walk(root)) {
    let html = fs.readFileSync(file, 'utf8');
    const original = html;
    html = html.replace(/site-motion\.css">(?=\S)/g, 'site-motion.css">\n    ');
    html = html.replace(/site-motion\.js"><\/script>(?=\S)/g, 'site-motion.js"></script>\n');
    if (html !== original) {
        fs.writeFileSync(file, html);
        n += 1;
    }
}
console.log(`fixed newlines in ${n} files`);
