/**
 * Moves top-of-page .info-warning educational disclaimers to the bottom of main content.
 * Skips mid-page warnings (e.g. training safety in poradnik).
 *
 * node scripts/move-info-warnings-to-bottom.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP = new Set(['node_modules', '.git', '.github', '.cursor', 'domains']);
const WARN_BLOCK = /([ \t]*)<div class="info-warning">[\s\S]*?<\/div>\s*/;

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

function isTopDisclaimer(block) {
    if (/Ważne \(zdrowie i prawo\)/i.test(block)) return false;
    return true;
}

function patch(html) {
    const mainMatch = html.match(/<main[\s\S]*?<\/main>/i);
    if (!mainMatch) return { html, changed: false };
    const main = mainMatch[0];
    const mainStart = mainMatch.index;

    const head = main.slice(0, Math.min(main.length, 2800));
    const m = head.match(WARN_BLOCK);
    if (!m) return { html, changed: false };
    if (!isTopDisclaimer(m[0])) return { html, changed: false };

    const warnPos = head.indexOf(m[0]);
    const firstH2 = head.search(/<h2[\s>]/i);
    if (firstH2 !== -1 && warnPos > firstH2) return { html, changed: false };

    const indent = m[1] || '                ';
    const inner = m[0].match(/<div class="info-warning">([\s\S]*?)<\/div>/)[1].trim();
    const block = `${indent}<div class="info-warning">\n${indent}    ${inner}\n${indent}</div>\n`;

    let newMain = main.slice(0, warnPos) + main.slice(warnPos + m[0].length);

    const closePatterns = [
        '</div>\n        </main>',
        '</div>\r\n        </main>',
        '</div>\n    </main>',
        '</div>\r\n    </main>'
    ];
    let insertAt = -1;
    for (const p of closePatterns) {
        const i = newMain.lastIndexOf(p);
        if (i !== -1) {
            insertAt = i;
            break;
        }
    }

    if (insertAt !== -1) {
        newMain = newMain.slice(0, insertAt) + '\n' + block + newMain.slice(insertAt);
    } else {
        const mainClose = newMain.lastIndexOf('</main>');
        if (mainClose === -1) return { html, changed: false };
        newMain = newMain.slice(0, mainClose) + block + newMain.slice(mainClose);
    }

    const out = html.slice(0, mainStart) + newMain + html.slice(mainStart + main.length);
    return { html: out, changed: out !== html };
}

let changed = 0;
const names = [];
for (const fp of walk(root)) {
    const before = fs.readFileSync(fp, 'utf8');
    const { html, changed: c } = patch(before);
    if (c) {
        fs.writeFileSync(fp, html, 'utf8');
        changed += 1;
        names.push(path.relative(root, fp));
    }
}

console.log(`Moved info-warning to bottom in ${changed} files.`);
for (const n of names) console.log(` - ${n}`);
