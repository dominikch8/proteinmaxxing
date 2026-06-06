import fs from 'fs';
import path from 'path';

function walk(dir, list = []) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        if (e.name === 'node_modules') continue;
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p, list);
        else if (e.name.endsWith('.html')) list.push(p);
    }
    return list;
}

const BASE = 'https://proteiner.pl';

function fileToUrl(filePath) {
    const p = filePath.replace(/\\/g, '/');
    if (p === 'index.html') return `${BASE}/`;
    return `${BASE}/${p}`;
}

const files = walk('.').sort();
const rows = [];
for (const f of files) {
    const html = fs.readFileSync(f, 'utf8');
    const title = html.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim() ?? '';
    const desc =
        html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i)?.[1]?.trim() ??
        html.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i)?.[1]?.trim() ??
        '';
    const path = f.replace(/\\/g, '/');
    rows.push({ path, url: fileToUrl(f), title, desc });
}

const root = rows.filter((r) => !r.path.startsWith('produkty/'));
const products = rows.filter((r) => r.path.startsWith('produkty/'));
const missing = rows.filter((r) => !r.title || !r.desc);

const withBoth = rows.filter((r) => r.title && r.desc);
const rootBoth = root.filter((r) => r.title && r.desc);
const productsBoth = products.filter((r) => r.title && r.desc);

fs.writeFileSync(
    'scripts/seo-meta-inventory.md',
    [
        '# SEO: title + meta description',
        '',
        `Wygenerowano: ${new Date().toISOString().slice(0, 10)}`,
        '',
        `- Wszystkich plików HTML: **${rows.length}**`,
        `- Z osobnym \`title\` i \`meta description\`: **${withBoth.length}**`,
        `- Tylko \`title\` (brak description): **${rows.filter((r) => r.title && !r.desc).length}**`,
        '',
        '## Strony główne i poradnik',
        '',
        '| URL | Title | Meta description |',
        '|-----|-------|------------------|',
        ...rootBoth.map(
            (r) =>
                `| ${r.url} | ${r.title.replace(/\|/g, '\\|')} | ${r.desc.replace(/\|/g, '\\|')} |`
        ),
        '',
        '## Produkty (`produkty/*.html`)',
        '',
        `**${productsBoth.length}** kart produktów — każda ma unikalny title i description (makro w opisie).`,
        '',
        '**Wzór title:** `{Nazwa} – białko, kalorie, węglowodany, tłuszcz | Proteiner`',
        '',
        '**Wzór description:** `{Nazwa}: {białko}g białka, {kcal} kcal, {węgle}g węglowodanów, {tłuszcz}g tłuszczu na 100g. Zdrowe odżywianie, proteiny, odchudzanie – makro i mikro na Proteiner.`',
        '',
        '<details><summary>Pełna lista slugów produktów</summary>',
        '',
        ...productsBoth.map((r) => `- ${r.url}`),
        '',
        '</details>',
        '',
        '## Bez meta description (tylko title lub przekierowanie)',
        '',
        ...missing.map((r) => `- \`${r.path}\` — **title:** ${r.title || '(brak)'}`),
        ''
    ].join('\n'),
    'utf8'
);

fs.writeFileSync(
    'scripts/seo-meta-urls.txt',
    withBoth.map((r) => r.url).join('\n') + '\n',
    'utf8'
);

fs.writeFileSync(
    'scripts/seo-meta-urls-full.md',
    withBoth
        .map(
            (r) =>
                `## ${r.url}\n\n- **Title:** ${r.title}\n- **Description:** ${r.desc}\n`
        )
        .join('\n'),
    'utf8'
);

console.log(
    `OK: ${withBoth.length}/${rows.length} → seo-meta-inventory.md, seo-meta-urls.txt, seo-meta-urls-full.md`
);
