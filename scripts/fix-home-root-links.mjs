/**
 * Strona główna = proteiner.pl (/), nie /glowna.
 * node scripts/fix-home-root-links.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP = new Set(['node_modules', '.git', '.github', '.cursor', 'domains']);

function walk(dir, list = []) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) {
            if (SKIP.has(e.name)) continue;
            walk(p, list);
        } else if (e.name.endsWith('.html')) list.push(p);
    }
    return list;
}

function patchHomeLinks(html) {
    let out = html;
    out = out.replace(/href="\.\.\/\.\.\/glowna"/g, 'href="/"');
    out = out.replace(/href="\.\.\/glowna"/g, 'href="/"');
    out = out.replace(/href="glowna"/g, 'href="/"');
    out = out.replace(/href="\/glowna"/g, 'href="/"');
    return out;
}

// index.html — kanoniczny home
const indexPath = path.join(root, 'index.html');
if (fs.existsSync(indexPath)) {
    let home = fs.readFileSync(indexPath, 'utf8');
    home = patchHomeLinks(home);
    home = home
        .replace(
            /<link rel="canonical" href="https:\/\/proteiner\.pl\/(?:glowna)?">/,
            '<link rel="canonical" href="https://proteiner.pl/">'
        )
        .replace(
            /<meta property="og:url" content="https:\/\/proteiner\.pl\/(?:glowna)?">/,
            '<meta property="og:url" content="https://proteiner.pl/">'
        );
    fs.writeFileSync(indexPath, home);
}

// Usuń duplikat glowna.html — home jest pod /
for (const rel of ['glowna.html', 'deploy-bundle/glowna.html']) {
    const fp = path.join(root, rel);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
}

let n = 0;
for (const fp of walk(root)) {
    const rel = path.relative(root, fp).replace(/\\/g, '/');
    if (rel === 'index.html') continue;
    const before = fs.readFileSync(fp, 'utf8');
    const after = patchHomeLinks(before);
    if (after !== before) {
        fs.writeFileSync(fp, after);
        n += 1;
    }
}

console.log(`Home links → / in ${n} HTML files (+ index.html). Removed glowna.html.`);
