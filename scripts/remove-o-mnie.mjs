import fs from 'fs';
import path from 'path';

const ROOTS = [
    path.resolve('.'),
    path.resolve('deploy-bundle'),
];

function walkHtml(dir, out = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === 'node_modules' || entry.name === '.git') continue;
            walkHtml(full, out);
        } else if (entry.name.endsWith('.html')) {
            out.push(full);
        }
    }
    return out;
}

function patchHtml(content, filePath) {
    let next = content;
    const base = path.basename(filePath);

    if (base === 'o-mnie.html') {
        return null;
    }

    next = next.replace(/\s*<li><a class="nav-link(?: active)?" href="(?:\.\.\/)+o-mnie">O mnie<\/a><\/li>\s*/g, '\n                ');
    next = next.replace(/\s*<li><a class="nav-link(?: active)?" href="o-mnie">O mnie<\/a><\/li>\s*/g, '\n                ');

    next = next.replace(/\s*<span aria-hidden="true">·<\/span>\s*<a href="(?:\.\.\/)+o-mnie">O mnie<\/a>/g, '');
    next = next.replace(/\s*<span aria-hidden="true">·<\/span>\s*<a href="o-mnie">O mnie<\/a>/g, '');

    const informacjeHref = (depth) => `${'../'.repeat(depth)}informacje#kontakt`;

    next = next.replace(/<a href="((?:\.\.\/)+)o-mnie">([^<]+)<\/a>/g, (_, prefix, label) => {
        const depth = (prefix.match(/\.\.\//g) || []).length;
        const href = informacjeHref(depth);
        if (label === 'O autorze' || label === 'Źródła i autor') return `<a href="${href}">Kontakt</a>`;
        if (label === 'O mnie') return `<a href="${href}">Informacje</a>`;
        return `<a href="${href}">${label}</a>`;
    });

    next = next.replace(/<a href="o-mnie">([^<]+)<\/a>/g, (_, label) => {
        if (label === 'O autorze' || label === 'Źródła i autor') return '<a href="informacje#kontakt">Kontakt</a>';
        if (label === 'O mnie') return '<a href="informacje#kontakt">Informacje</a>';
        return `<a href="informacje#kontakt">${label}</a>`;
    });

    next = next.replace(
        /Autor strony opisany jest na <a href="o-mnie">O mnie<\/a>\./g,
        'Kontakt i wsparcie znajdziesz w sekcji poniżej.'
    );

    next = next.replace(/na stronie <a href="o-mnie">O mnie<\/a>/g, 'w sekcji <a href="informacje#kontakt">Kontakt i wsparcie</a>');

    return next === content ? null : next;
}

function patchInformacje(content) {
    if (!content.includes('id="kontakt"')) {
        const contactBlock = `
                    <h2 id="kontakt">Kontakt i wsparcie</h2>
                    <p><strong>E-mail:</strong> <a href="mailto:developeranios@gmail.com">developeranios@gmail.com</a></p>
                    <p>Chętnie odpowiem na pytania i przyjmę sugestie ulepszeń. Możesz też wesprzeć rozwój strony na <a href="https://ko-fi.com/baniosdeveloperanios" target="_blank" rel="noopener noreferrer">Ko-fi</a> — środki przeznaczam na hosting i dalszy rozwój projektu.</p>
`;
        content = content.replace(/\n\s*<\/div>\s*\n\s*<\/main>/, `${contactBlock}\n                </div>\n        </main>`);
    }

    content = content.replace(
        /<p class="subtitle">Polityka prywatności, regulamin, pliki cookie i reklamy<\/p>/,
        '<p class="subtitle">Polityka prywatności, regulamin, pliki cookie, reklamy i kontakt</p>'
    );

    return content;
}

function patchSitemap(content) {
    return content.replace(/\s*<url>\s*<loc>https:\/\/proteiner\.pl\/o-mnie<\/loc>[\s\S]*?<\/url>\s*/g, '\n');
}

const redirectHtml = `<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="0; url=informacje#kontakt">
    <link rel="canonical" href="https://proteiner.pl/informacje#kontakt">
    <title>Przekierowanie… | Proteiner</title>
    <script>location.replace('informacje#kontakt');</script>
</head>
<body>
    <p>Ta strona została przeniesiona. <a href="informacje#kontakt">Przejdź do Informacji</a>.</p>
</body>
</html>
`;

let changed = 0;
for (const root of ROOTS) {
    if (!fs.existsSync(root)) continue;

    for (const file of walkHtml(root)) {
        const rel = path.relative(root, file).replace(/\\/g, '/');
        let content = fs.readFileSync(file, 'utf8');
        let patched = patchHtml(content, file);

        if (rel === 'informacje.html') {
            patched = patchInformacje(patched ?? content);
        }

        if (patched) {
            fs.writeFileSync(file, patched, 'utf8');
            changed += 1;
        }
    }

    for (const sitemap of ['sitemap.xml']) {
        const sitemapPath = path.join(root, sitemap);
        if (!fs.existsSync(sitemapPath)) continue;
        const original = fs.readFileSync(sitemapPath, 'utf8');
        const patched = patchSitemap(original);
        if (patched !== original) {
            fs.writeFileSync(sitemapPath, patched, 'utf8');
            changed += 1;
        }
    }

    const oMniePath = path.join(root, 'o-mnie.html');
    fs.writeFileSync(oMniePath, redirectHtml, 'utf8');
    changed += 1;
}

console.log(`Updated ${changed} files.`);
