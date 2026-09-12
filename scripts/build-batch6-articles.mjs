/**
 * Generuje artykuły — batch 6 (odżywianie, 20 szt.).
 * Produkuje scripts/hardcore-articles-batch6.json.
 * node scripts/build-batch6-articles.mjs
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function noteTable(rows) {
    const trs = rows.map(([k, v]) => `                        <tr><th>${k}</th><td>${v}</td></tr>`).join('\n');
    return `                <div class="poradnik-table-wrap">
                    <table class="poradnik-intake-table">
                        <tbody>
${trs}
                        </tbody>
                    </table>
                </div>`;
}

function buildArticle(a) {
    const sections = a.sections.map((s) => `<h2>${s.h2}</h2>\n\n<p>${s.p}</p>`).join('\n\n');
    const bullets = a.bullets.map((b) => `                    <li>${b}</li>`).join('\n');
    const tableHtml = a.table ? noteTable(a.table) : '';
    return {
        slug: a.slug,
        emoji: a.emoji,
        title: a.title,
        subtitle: a.subtitle,
        meta: a.meta,
        crumb: a.crumb || a.title,
        category: a.category,
        relatedHtml: a.relatedHtml || '<a href="artykuly">artykuły</a> · <a href="poradnik-zywienia">poradnik</a>',
        bodyHtml: `<p>${a.lead}</p>\n\n${sections}\n\n${tableHtml}\n\n<h2>Praktyczny plan</h2>\n<div class="poradnik-practical-box">\n<ul>\n${bullets}\n</ul>\n</div>\n\n<h2>Na co uważać</h2>\n<p>${a.uwaga}</p>\n\n<h2>Co dalej</h2>\n<p>${a.coDalej}</p>`
    };
}

const defs = [];

//_A1_
//_A2_
//_A3_
//_A4_
//_A5_
//_A6_
//_A7_
//_A8_
//_A9_
//_A10_

const articles = defs.map(buildArticle);
const out = path.join(__dirname, 'hardcore-articles-batch6.json');
writeFileSync(out, JSON.stringify(articles, null, 2) + '\n');
console.log(`Zapisano ${articles.length} artykułów -> ${out}`);
