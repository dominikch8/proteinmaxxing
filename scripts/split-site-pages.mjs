import fs from 'fs';
import path from 'path';
import { buildAdSenseHead } from './site-head-assets.mjs';

const root = path.resolve(import.meta.dirname, '..');
const srcPath = path.join(root, 'index.html');
const html = fs.readFileSync(srcPath, 'utf8');

function extractStyle() {
    const m = html.match(/<style>([\s\S]*?)<\/style>/);
    if (!m) throw new Error('No <style> block');
    let css = m[1];
    const navLinkCss = `
        .nav-links a.nav-link {
            display: inline-block;
            text-decoration: none;
            background: transparent;
            border: none;
            color: var(--text-muted);
            font-size: 0.875rem;
            font-weight: 600;
            font-family: inherit;
            padding: 10px 16px;
            cursor: pointer;
            border-radius: var(--radius-sm);
            transition: color var(--transition), background var(--transition), box-shadow var(--transition);
            white-space: nowrap;
        }
        .nav-links a.nav-link:hover {
            color: var(--primary-dark);
            background: rgba(13, 148, 136, 0.08);
        }
        .nav-links a.nav-link.active {
            color: var(--white);
            background: linear-gradient(135deg, var(--primary-light) 0%, var(--primary-dark) 100%);
            box-shadow: 0 4px 12px var(--primary-glow);
        }
        .page-with-subtabs .sub-tab-content { display: none; animation: fadeIn 0.35s ease; }
        .page-with-subtabs .sub-tab-content.active { display: block; }
        a.logo { text-decoration: none; color: inherit; }
`;
    css = css.replace(
        /\.nav-links button:hover/g,
        '.nav-links button:hover, .nav-links a.nav-link:hover'
    );
    css = css.replace(
        /\.nav-links button\.active/g,
        '.nav-links button.active, .nav-links a.nav-link.active'
    );
    css = css.replace(
        /\.nav-links button \{/g,
        '.nav-links button, .nav-links a.nav-link {'
    );
    css = css.replace(
        /\.nav-links button \{/g,
        '.nav-links button, .nav-links a.nav-link {'
    );
    return css + navLinkCss;
}

function extractSection(id) {
    const open = html.indexOf(`<div id="${id}" class="tab-content`);
    if (open < 0) throw new Error(`Section ${id} not found`);
    const innerStart = html.indexOf('>', open) + 1;
    let depth = 1;
    let i = innerStart;
    while (depth > 0 && i < html.length) {
        const nextOpen = html.indexOf('<div', i);
        const nextClose = html.indexOf('</div>', i);
        if (nextClose < 0) break;
        if (nextOpen !== -1 && nextOpen < nextClose) {
            depth++;
            i = nextOpen + 4;
        } else {
            depth--;
            i = nextClose + 6;
        }
    }
    return html.slice(innerStart, i - 6).trim();
}

function extractInlineScript() {
    const m = html.match(/<script src="js\/products-data\.js"><\/script>\s*<script>([\s\S]*?)<\/script>\s*<\/body>/);
    if (!m) throw new Error('Inline script not found');
    return m[1];
}

function buildSubtabsJs() {
    return `function switchSubTab(subTabId, btn) {
    const target = document.getElementById(subTabId);
    if (!target) return;
    const parent = target.closest('.page-with-subtabs');
    if (!parent) return;
    parent.querySelectorAll('.sub-tab-content').forEach((content) => content.classList.remove('active'));
    parent.querySelectorAll('.btn-sub').forEach((b) => b.classList.remove('active'));
    target.classList.add('active');
    if (btn) btn.classList.add('active');
    if (subTabId === 'protein-max') {
        const catSel = document.getElementById('categoryFilter');
        if (catSel) catSel.value = 'all';
        const pmSearch = document.getElementById('proteinMaxSearch');
        if (pmSearch) pmSearch.value = '';
        if (typeof renderProteinMaxxing === 'function') renderProteinMaxxing();
    }
    if (subTabId === 'protein-price') {
        const priceCat = document.getElementById('priceCategoryFilter');
        if (priceCat) priceCat.value = 'all';
        const ppSearch = document.getElementById('proteinPriceSearch');
        if (ppSearch) ppSearch.value = '';
        if (typeof renderProteinPrice === 'function') renderProteinPrice();
    }
    if (subTabId === 'baza-prod' && typeof renderRandomProducts === 'function') renderRandomProducts();
}
`;
}

function splitAppScript(full) {
    const withoutSwitchTab = full
        .replace(/function switchTab\([\s\S]*?\n        \}\n\n/, '')
        .replace(/function switchSubTab\([\s\S]*?\n        \}\n\n/, '');

    const initLine = '        renderRandomProducts();\n';
    const dietaBody = withoutSwitchTab.replace(initLine, `        if (document.getElementById('productsGrid')) renderRandomProducts();\n`);

    const calcMarkers = {
        start: 'function pickRandomN(',
        shopEnd: 'function renderRandomProducts()',
        calcStart: 'function calculateEverything()',
    };
    const pickStart = withoutSwitchTab.indexOf('function pickRandomN(');
    const renderProductsStart = withoutSwitchTab.indexOf('function renderProductsList(');
    const calcStart = withoutSwitchTab.indexOf('function calculateEverything()');
    const scriptEnd = withoutSwitchTab.lastIndexOf('}') + 1;

    const sharedPick = withoutSwitchTab.slice(pickStart, withoutSwitchTab.indexOf('function getShopPool('));
    const shopBlock = withoutSwitchTab.slice(
        withoutSwitchTab.indexOf('function getShopPool('),
        renderProductsStart
    );
    const calcBlock = withoutSwitchTab.slice(calcStart, scriptEnd);

    const dietaBlock = withoutSwitchTab.slice(renderProductsStart, calcStart);

    const calculatorJs = `// Kalkulator — wymaga productsDatabase (js/products-data.js)
${sharedPick}${shopBlock}${calcBlock}
`;

    const dietaBlockClean = dietaBlock.replace(/\n\s*renderRandomProducts\(\);\s*\n/g, '\n');
    const pickRandomFns = `function pickRandomN(items, count) {
    const pool = [...items];
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, count);
}

`;
    const dietaJs = `// Dieta — rankingi i baza produktów
${pickRandomFns}${dietaBlockClean}
if (document.getElementById('productsGrid')) renderRandomProducts();
`;

    return { calculatorJs, dietaJs, dietaBody: withoutSwitchTab };
}

const NAV_ITEMS = [
    { id: 'home', href: 'index.html', label: 'Główna' },
    { id: 'dieta', href: 'dieta.html', label: 'Dieta' },
    { id: 'kalkulator', href: 'kalkulator-bmi.html', label: 'Kalkulator BMI' },
    { id: 'trening', href: 'trening.html', label: 'Trening' },
    { id: 'informacje', href: 'informacje.html', label: 'Informacje' },
    { id: 'o-mnie', href: 'o-mnie.html', label: 'O mnie' },
];

function buildNav(activeId) {
    const links = NAV_ITEMS.map(
        (item) =>
            `<li><a class="nav-link${item.id === activeId ? ' active' : ''}" href="${item.href}">${item.label}</a></li>`
    ).join('\n                ');
    return `    <header class="site-header">
        <nav>
            <a href="index.html" class="logo">
                <div class="logo-mark">P</div>
                <span>Proteiner</span>
            </a>
            <button type="button" class="nav-toggle" aria-label="Otwórz menu" aria-expanded="false" aria-controls="site-nav-links"><span class="nav-toggle-bar" aria-hidden="true"></span><span class="nav-toggle-bar" aria-hidden="true"></span><span class="nav-toggle-bar" aria-hidden="true"></span></button>
            <ul class="nav-links" id="site-nav-links">
                ${links}
                <li id="authNavSlot" class="auth-nav-item"><a class="nav-link auth-nav-link" href="logowanie">Zaloguj</a></li>
            </ul>
        </nav>
    </header>`;
}

const FOOTER = `    <footer class="site-footer">
        <p><strong>Proteiner</strong> — kalkulator dietetyczny i baza produktów</p>
        <p style="margin-top: 8px;">&copy; 2026 Wszelkie prawa zastrzeżone.</p>
    </footer>`;

const FONTS = `    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=Encode+Sans:wght@600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/site.css">`;

function pageShell({ title, description, canonical, ogTitle, ogDesc, activeNav, body, scripts = [] }) {
    const scriptTags = scripts.map((s) => `    <script src="${s}"></script>`).join('\n');
    return `<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
${buildAdSenseHead()}
    <title>${title}</title>
    <meta name="description" content="${description}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${canonical}">
    <meta property="og:title" content="${ogTitle}">
    <meta property="og:description" content="${ogDesc}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${canonical}">
${FONTS}
</head>
<body>
${buildNav(activeNav)}

    <div class="page-container">
        <main class="main-content">
${body}
        </main>
    </div>

${FOOTER}
${scriptTags}
</body>
</html>
`;
}

function patchSubTabButtons(sectionHtml) {
    return sectionHtml.replace(
        /onclick="switchSubTab\('([^']+)'\)"/g,
        "onclick=\"switchSubTab('$1', this)\""
    );
}

function patchTreningLinks(sectionHtml) {
    return sectionHtml
        .replace(/zakładce <strong>Dieta → Białko Maxxing<\/strong>/g, 'stronie <a href="dieta.html"><strong>Dieta → Białko Maxxing</strong></a>')
        .replace(/zakładce <strong>głównej<\/strong>/g, 'stronie <a href="index.html"><strong>Kalkulator</strong></a>')
        .replace(/użyj <strong>kalkulatora<\/strong> w zakładce głównej/g, 'użyj <a href="index.html"><strong>kalkulatora</strong></a>');
}

const sections = {
    kalkulator: extractSection('kalkulator'),
    dieta: patchSubTabButtons(extractSection('dieta')),
    trening: patchSubTabButtons(patchTreningLinks(extractSection('trening'))),
    informacje: extractSection('informacje'),
    'o-mnie': extractSection('o-mnie'),
};

const inlineScript = extractInlineScript();
const { calculatorJs, dietaJs } = splitAppScript(inlineScript);

fs.mkdirSync(path.join(root, 'css'), { recursive: true });
fs.mkdirSync(path.join(root, 'js'), { recursive: true });
fs.writeFileSync(path.join(root, 'css', 'site.css'), extractStyle(), 'utf8');
fs.writeFileSync(path.join(root, 'js', 'subtabs.js'), buildSubtabsJs(), 'utf8');
fs.writeFileSync(path.join(root, 'js', 'calculator.js'), calculatorJs, 'utf8');
fs.writeFileSync(path.join(root, 'js', 'dieta.js'), dietaJs, 'utf8');

const productScripts = [
    'js/products-data-raw.js',
    'js/product-utils.js',
    'js/products-data.js',
];

fs.writeFileSync(
    path.join(root, 'index.html'),
    pageShell({
        title: 'Kalkulator Dietetyczny & BMI | Proteiner',
        description:
            'Kalkulator TDEE, BMI, makro, wody, witamin i minerałów. Oblicz kalorie, białko, tłuszcze i węglowodany pod swój cel: redukcję i odchudzanie lub masę',
        canonical: 'https://proteiner.pl/',
        ogTitle: 'Kalkulator dietetyczny | Proteiner',
        ogDesc: 'TDEE, BMI i białko pod cel: redukcja, masa lub utrzymanie wagi',
        activeNav: 'kalkulator',
        body: sections.kalkulator,
        scripts: [...productScripts, 'js/calculator.js'],
    }),
    'utf8'
);

fs.writeFileSync(
    path.join(root, 'dieta.html'),
    pageShell({
        title: 'Dieta — baza produktów i rankingi białka | Proteiner',
        description:
            'Wartości odżywcze 342 produktów. Ranking Białko Maxxing i Top 10: kalorie i cena na 100 g białka. Idealne przy odchudzaniu lub budowaniu masy mięśniowej',
        canonical: 'https://proteiner.pl/dieta.html',
        ogTitle: 'Baza produktów i rankingi białka | Proteiner',
        ogDesc: '342 produkty, białko maxxing, cena za 100 g białka - porównaj składniki odżywcze i ceny',
        activeNav: 'dieta',
        body: `<div class="page-with-subtabs">\n${sections.dieta}\n</div>`,
        scripts: [...productScripts, 'js/dieta.js', 'js/subtabs.js'],
    }),
    'utf8'
);

fs.writeFileSync(
    path.join(root, 'trening.html'),
    pageShell({
        title: 'Trening siłowy — przewodnik i mity | Proteiner',
        description:
            'Przewodnik po treningu siłowym: objętość, progresja, białko po treningu, regeneracja. Sekcja obalania mitów ze siłowni.',
        canonical: 'https://proteiner.pl/trening.html',
        ogTitle: 'Trening i odżywianie | Proteiner',
        ogDesc: 'Plan treningowy, białko po wysiłku, regeneracja — edukacyjnie, bez zastępowania trenera.',
        activeNav: 'trening',
        body: `<div class="page-with-subtabs">\n${sections.trening}\n</div>`,
        scripts: ['js/subtabs.js'],
    }),
    'utf8'
);

fs.writeFileSync(
    path.join(root, 'informacje.html'),
    pageShell({
        title: 'Informacje — polityka prywatności | Proteiner',
        description:
            'Polityka prywatności i pliki cookie na Proteiner.',
        canonical: 'https://proteiner.pl/informacje.html',
        ogTitle: 'Informacje i polityka prywatności | Proteiner',
        ogDesc: 'Polityka prywatności i prawa użytkownika.',
        activeNav: 'informacje',
        body: sections.informacje,
        scripts: [],
    }),
    'utf8'
);

fs.writeFileSync(
    path.join(root, 'o-mnie.html'),
    pageShell({
        title: 'O mnie — kontakt | Proteiner',
        description: 'Kontakt, wsparcie i sugestie dotyczące Proteiner.',
        canonical: 'https://proteiner.pl/o-mnie.html',
        ogTitle: 'O mnie | Proteiner',
        ogDesc: 'Napisz z pytaniem lub sugestią ulepszenia strony.',
        activeNav: 'o-mnie',
        body: sections['o-mnie'],
        scripts: [],
    }),
    'utf8'
);

console.log('Created: index.html, dieta.html, trening.html, informacje.html, o-mnie.html');
console.log('Created: css/site.css, js/subtabs.js, js/calculator.js, js/dieta.js');
