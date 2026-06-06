import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

let trening;
try {
    trening = execSync('git show HEAD:trening.html', { encoding: 'utf8', cwd: root });
} catch {
    trening = fs.readFileSync(path.join(root, 'trening.source.html'), 'utf8');
}

const poradnikPath = path.join(root, 'poradnik-zywienia.html');
let poradnik = fs.readFileSync(poradnikPath, 'utf8');
const lines = trening.split(/\r?\n/);

const prIdx = lines.findIndex((l) => l.includes('id="trening-przewodnik"'));
const mityIdx = lines.findIndex((l) => l.includes('id="trening-mity"'));

if (prIdx === -1 || mityIdx === -1) {
    console.error('Could not find trening section markers');
    process.exit(1);
}

const przewodnikInner = lines.slice(prIdx + 1, mityIdx - 1).join('\n').trim();
const mityInner = lines
    .slice(mityIdx + 1)
    .join('\n')
    .replace(/\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/main>[\s\S]*$/, '')
    .trim();

const treningBlock = `                <div id="poradnik-trening" class="sub-tab-content">
                    <div class="page-with-subtabs page-with-subtabs--nested">
                        <nav class="sub-nav" aria-label="Sekcje treningu">
                            <button class="btn-sub active" type="button" onclick="switchSubTab('trening-przewodnik', this)">💪 Przewodnik treningowy</button>
                            <button class="btn-sub" type="button" onclick="switchSubTab('trening-mity', this)">🧪 Obalanie mitów</button>
                        </nav>

                        <div id="trening-przewodnik" class="sub-tab-content active">
${przewodnikInner}
                        </div>

                        <div id="trening-mity" class="sub-tab-content">
${mityInner}
                        </div>
                    </div>
                </div>
`;

if (poradnik.includes('id="poradnik-trening"')) {
    poradnik = poradnik.replace(
        /<div id="poradnik-trening" class="sub-tab-content">[\s\S]*?<\/div>\s*(?=\s*<\/div>\s*<\/main>)/,
        treningBlock.trimEnd()
    );
    console.log('Replaced poradnik-trening');
} else {
    poradnik = poradnik.replace(
        /(\s*<\/div>\s*<\/div>\s*<\/main>)/,
        `\n${treningBlock}            </div>\n        </main>`
    );
    console.log('Inserted poradnik-trening');
}

if (!poradnik.includes('data-tab="poradnik-trening"')) {
    poradnik = poradnik.replace(
        /(<button class="btn-sub" type="button" data-tab="poradnik-tipy"[^>]*>💡 Tipy<\/button>)/,
        `$1
                    <button class="btn-sub" type="button" data-tab="poradnik-trening" onclick="switchSubTab('poradnik-trening', this)">💪 Trening</button>`
    );
}

if (!poradnik.includes('poradnik-hub-tile-title">Trening')) {
    poradnik = poradnik.replace(
        /(<button type="button" class="poradnik-hub-tile" onclick="switchSubTab\('poradnik-tipy'[\s\S]*?<\/button>)\s*(<\/div>\s*\n\s*<div class="info-callout">)/,
        `$1
                            <button type="button" class="poradnik-hub-tile" onclick="switchSubTab('poradnik-trening', document.querySelector('.btn-sub[data-tab=poradnik-trening]'))">
                                <span class="poradnik-hub-tile-emoji" aria-hidden="true">💪</span>
                                <span class="poradnik-hub-tile-title">Trening</span>
                                <span class="poradnik-hub-tile-desc">Plan siłowy, białko po wysiłku, regeneracja i obalanie mitów ze siłowni.</span>
                            </button>
                        $2`
    );
}

poradnik = poradnik.replace(
    '<title>Poradnik żywienia — składniki, dieta i tipy | Proteiner</title>',
    '<title>Poradnik — składniki, dieta, tipy i trening | Proteiner</title>'
);
poradnik = poradnik.replace(
    'content="Encyklopedia składników odżywczych, zasady zdrowego odżywiania i praktyczne tipy — białko, tłuszcze, węglowodany, mikroelementy i nawyki na co dzień."',
    'content="Składniki odżywcze, zdrowe odżywianie, tipy i przewodnik treningowy — białko, makro, siłownia i obalanie mitów."'
);

fs.writeFileSync(poradnikPath, poradnik, 'utf8');
console.log('Done.');
