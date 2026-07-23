/**
 * Pakuje pliki do wgrania na LH.pl (FTP / menedżer plików).
 * Uruchom: node scripts/pack-for-hosting.mjs
 * Wynik: folder deploy-bundle/ — wgraj całą zawartość do /public_html/proteiner.pl/
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'deploy-bundle');
const SKIP_DIRS = new Set(['node_modules', '.git', '.github', '.cursor', 'deploy-bundle', 'domains']);

const SKIP_FILES = new Set([
    'sw.js',
    'package.json',
    'package-lock.json'
]);

// Admin panel i API PHP mają być w deploy-bundle (auth + zgłoszenia).
const SKIP_PREFIXES = ['scripts/', 'js/products-data-raw.js'];

function shouldSkip(rel) {
    const norm = rel.replace(/\\/g, '/');
    const parts = norm.split('/');
    if (parts.some((p) => SKIP_DIRS.has(p))) return true;
    if (SKIP_FILES.has(parts[parts.length - 1])) return true;
    if (norm.startsWith('scripts/')) return true;
    if (/\.(mjs|ts)$/i.test(norm)) return true;
    for (const prefix of SKIP_PREFIXES) {
        if (norm.startsWith(prefix) || norm.includes(`/${prefix}`)) return true;
    }
    if (norm === 'js/products-data-raw.js') return true;
    return false;
}

function copyTree(src, dest, rel = '') {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const e of entries) {
        const relPath = rel ? `${rel}/${e.name}` : e.name;
        if (shouldSkip(relPath.replace(/\\/g, '/'))) continue;
        const from = path.join(src, e.name);
        const to = path.join(dest, e.name);
        if (e.isDirectory()) {
            fs.mkdirSync(to, { recursive: true });
            copyTree(from, to, relPath);
        } else {
            fs.mkdirSync(path.dirname(to), { recursive: true });
            fs.copyFileSync(from, to);
        }
    }
}

if (fs.existsSync(out)) fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
copyTree(root, out);

const count = (function walk(d) {
    let n = 0;
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const p = path.join(d, e.name);
        n += e.isDirectory() ? walk(p) : 1;
    }
    return n;
})(out);

console.log(`Gotowe: ${out}`);
console.log(`Plików: ${count}`);
console.log('Wgraj CAŁĄ zawartość deploy-bundle/ do /public_html/proteiner.pl/ (nadpisz istniejące).');
