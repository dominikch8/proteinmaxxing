import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function walk(dir, out = []) {
    for (const name of fs.readdirSync(dir)) {
        const fp = path.join(dir, name);
        if (fs.statSync(fp).isDirectory()) {
            if (name === 'node_modules' || name === 'scripts') continue;
            walk(fp, out);
        } else if (name.endsWith('.html')) out.push(fp);
    }
    return out;
}

const patterns = [
    /\s*<li><a class="nav-link active" href="trening\.html">Trening<\/a><\/li>/g,
    /\s*<li><a class="nav-link" href="trening\.html">Trening<\/a><\/li>/g,
    /\s*<li><a class="nav-link active" href="\.\.\/trening\.html">Trening<\/a><\/li>/g,
    /\s*<li><a class="nav-link" href="\.\.\/trening\.html">Trening<\/a><\/li>/g
];

let n = 0;
for (const fp of walk(root)) {
    let html = fs.readFileSync(fp, 'utf8');
    const before = html;
    for (const re of patterns) {
        html = html.replace(re, '');
    }
    html = html.replace(/href="trening\.html"/g, 'href="poradnik-zywienia.html#trening"');
    html = html.replace(/href="\.\.\/trening\.html"/g, 'href="../poradnik-zywienia.html#trening"');
    if (html !== before) {
        fs.writeFileSync(fp, html, 'utf8');
        n++;
    }
}
console.log(`Updated ${n} HTML files.`);
