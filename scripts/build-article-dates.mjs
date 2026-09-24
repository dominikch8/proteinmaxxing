/**
 * Generuje scripts/article-dates.json — mapę slug -> data powstania (YYYY-MM-DD).
 * Data brana jest z pierwszego commita pliku <slug>.html (data dodania artykułu).
 * Uruchom: node scripts/build-article-dates.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

function gitFirstAddDate(slug) {
    try {
        const out = execFileSync(
            'git',
            ['log', '--diff-filter=A', '--format=%ad', '--date=short', '-1', '--', `${slug}.html`],
            { cwd: root, encoding: 'utf8' }
        );
        return out.trim().split('\n')[0] || null;
    } catch {
        return null;
    }
}

const slugs = new Set();

// 1. Wszystkie artykuły z batchy hardcore.
for (const f of fs.readdirSync(path.join(__dirname))) {
    if (!f.startsWith('hardcore-articles-') || !f.endsWith('.json')) continue;
    if (f === 'hardcore-articles-100.json') continue;
    const arr = JSON.parse(fs.readFileSync(path.join(__dirname, f), 'utf8'));
    for (const a of arr) if (a && a.slug) slugs.add(a.slug);
}
// 2. Artykuły bazowe (articles-base.json).
if (fs.existsSync(path.join(__dirname, 'articles-base.json'))) {
    const base = JSON.parse(fs.readFileSync(path.join(__dirname, 'articles-base.json'), 'utf8'));
    for (const a of base) if (a && a.slug) slugs.add(a.slug);
}
// 3. Wszystkie kafelki z artykuly.html (łapiemy też slugi spoza JSON).
const hub = fs.readFileSync(path.join(root, 'artykuly.html'), 'utf8');
for (const m of hub.matchAll(/class="poradnik-hub-tile"[^>]*href="([a-z0-9-]+)"/g)) slugs.add(m[1]);

const dates = {};
let fallback = 0;
for (const slug of slugs) {
    const d = gitFirstAddDate(slug) || new Date().toISOString().slice(0, 10);
    dates[slug] = d;
    if (!gitFirstAddDate(slug)) fallback++;
}

const out = path.join(__dirname, 'article-dates.json');
fs.writeFileSync(out, JSON.stringify(dates, null, 2) + '\n');
console.log(`Zapisano daty dla ${Object.keys(dates).length} artykułów -> article-dates.json (fallback: ${fallback})`);
