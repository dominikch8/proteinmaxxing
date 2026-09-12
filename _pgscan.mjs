import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const root = process.cwd();
const lines = [];
const log = (s) => lines.push(s);

function pagSection(p) {
    if (!fs.existsSync(p)) return 'MISSING ' + p;
    const h = fs.readFileSync(p, 'utf8');
    const out = [];
    out.push('file=' + p + ' len=' + h.length);
    out.push('hasBuildPageNumbers=' + h.includes('buildPageNumbers'));
    out.push('hasEllipsisClass=' + h.includes('articles-pagination-ellipsis'));
    out.push('hasEllipsisChar=' + h.includes('\u2026'));
    out.push('hasPreviousPage=' + h.includes('previousPage'));
    // print buildPageNumbers body
    const i = h.indexOf('function buildPageNumbers');
    if (i >= 0) out.push('BODY>>>' + h.slice(i, i + 260).replace(/\s+/g, ' '));
    const k = h.indexOf('.forEach((pageNumber)');
    if (k >= 0) out.push('USE>>>' + h.slice(k - 120, k + 120).replace(/\s+/g, ' '));
    return out.join('\n');
}

log('=== LOCAL artykuly.html ===');
log(pagSection(path.join(root, 'artykuly.html')));
log('=== BUNDLE deploy-bundle/artykuly.html ===');
log(pagSection(path.join(root, 'deploy-bundle', 'artykuly.html')));

// Files referencing the pagination id anywhere (excluding node_modules, .git)
function walk(dir, acc) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        if (['node_modules', '.git', '.github', 'deploy-bundle', 'domains'].includes(e.name)) continue;
        const fp = path.join(dir, e.name);
        if (e.isDirectory()) walk(fp, acc);
        else if (/\.(html|js|mjs|php)$/i.test(e.name)) acc.push(fp);
    }
    return acc;
}
log('=== FILES mentioning articlesPagination ===');
for (const f of walk(root, [])) {
    const t = fs.readFileSync(f, 'utf8');
    if (t.includes('articlesPagination')) log('  ' + path.relative(root, f));
}

log('=== GIT ===');
try {
    log(execSync('git --no-pager log --oneline -8', { cwd: root }).toString());
    log('STATUS:\n' + execSync('git --no-pager status --porcelain=v1', { cwd: root }).toString());
    log('DIVERGE:\n' + execSync('git --no-pager rev-list --left-right --count origin/main...HEAD', { cwd: root }).toString());
} catch (e) {
    log('git err ' + e.message);
}

fs.writeFileSync(path.join(process.env.TEMP, 'pgscan.txt'), lines.join('\n') + '\n');
console.log('written');
