/**
 * Generuje scripts/hardcore-articles-100.json — 100 zwięzłych, konkretnych
 * artykułów (białko / odżywianie / odchudzanie / ćwiczenia) z meta description.
 * node scripts/build-100-articles.mjs
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function buildArticle(a) {
    const sections = a.sections
        .map((s) => `<h2>${s.h2}</h2>\n\n<p>${s.p}</p>`)
        .join('\n\n');
    const bullets = a.bullets.map((b) => `                    <li>${b}</li>`).join('\n');
    return {
        slug: a.slug,
        emoji: a.emoji,
        title: a.title,
        subtitle: a.subtitle,
        meta: a.meta,
        crumb: a.crumb || a.title,
        category: a.category,
        relatedHtml: a.relatedHtml || '<a href="artykuly">artykuły</a> · <a href="poradnik-zywienia">poradnik</a>',
        bodyHtml: `<p>${a.lead}</p>\n\n${sections}\n\n<h2>Praktyczny plan</h2>\n<div class="poradnik-practical-box">\n<ul>\n${bullets}\n</ul>\n</div>\n\n<h2>Na co uważać</h2>\n<p>${a.uwaga}</p>\n\n<h2>Co dalej</h2>\n<p>${a.coDalej}</p>`
    };
}

const defs = [
    {
        slug: 'jajka-twarde-czy-sadzone-bialko',
        emoji: '🍳',
        title: 'Jajka na twardo czy sadzone — czy białko się zmienia?',
        subtitle: 'Gotowanie jajka zmienia jego białko w mniej niż 5%. Liczy się, ile ich zjesz, a nie jak je zrobisz.',
        meta: 'Czy gotowanie jajka zmienia ilość białka? Jajka na twardo, sadzone i jajecznica — ile białka i kalorii ma jedno jajko i który sposób na diecie jest najlepszy.',
        category: 'bialko',
        lead: 'Jedno średnie jajko (ok. 55 g) to ~6 g białka i ~78 kcal — i ta liczba prawie się nie zmienia, czy zjesz je na twardo, sadzone czy w jajecznicy.',
        sections: [
            { h2: 'Co robi temperatura z białkiem', p: 'Podgrzanie denaturuje białko — ścina je, ale nie niszczy aminokwasów. Organizm trawi jajko gotowane niemal tak samo dobrze jak smażone, a surowe nawet gorzej.' },
            { h2: 'Jajecznica a kalorie', p: 'Różnicę robi dodatek: masło, olej czy śmietana potrafią dołożyć 50–100 kcal na porcję. Samo jajko zostaje bez zmian.' },
            { h2: 'Które wybrać na diecie', p: 'Na redukcji wybieraj gotowane (zero tłuszczu z patelni) albo sadzone na teflonie. Jajecznica na maśle to inna kaloryczność — nie błąd, tylko wybór.' }
        ],
        bullets: ['<strong>1 jajko ≈ 6 g białka</strong> — niezależnie od sposobu.', '<strong>Na twardo</strong> — zero tłuszczu, świetne na przekąskę.', '<strong>Na patelni</strong> — licz tłuszcz, nie samo jajko.'],
        uwaga: 'Nie pij surowych jaj „dla białka” — surowe białko wchłania się gorzej, a ryzyko salmonelli zostaje.',
        coDalej: 'Zobacz <a href="bialko-na-sniadanie-jajka-czy-platki">co lepsze na śniadanie</a> i <a href="ile-bialka-na-dzien">ile białka dziennie</a>.'
    },
    {
        slug: 'serwatka-czy-kazeina-na-noc',
        emoji: '🥛',
        title: 'Serwatka czy kazeina przed snem — co realnie wygrywa',
        subtitle: 'Kazeina trawi się wolno, serwatka szybko. Czy przed snem to w ogóle ma znaczenie?',
        meta: 'Serwatka vs kazeina na noc: różnica w tempie wchłaniania, ile białka przed snem ma sens i czy warto kupować osobny proszek na noc.',
        category: 'bialko',
        lead: 'Kazeina to „wolne” białko z mleka, serwatka „szybkie”. Teoria mówi: przed snem kazeina. W praktyce liczy się, czy domknąłeś dzienną pulę — nie pora.',
        sections: [
            { h2: 'Tempo wchłaniania', p: 'Serwatka podnosi aminokwasy we krwi w ~1 h, kazeina uwalnia je przez 5–7 h. Przez 8 h snu organizm i tak korzysta z tego, co zjadłeś cały dzień.' },
            { h2: 'Czy kazeina buduje więcej mięśni', p: 'Badania pokazują minimalną różnicę przy domkniętym dziennym białku. Kazeina to wygoda, nie przewaga — chyba że jesz za mało białka.' },
            { h2: 'Co jeść zamiast proszku', p: 'Twaróg, jogurt grecki i serek wiejski to naturalna kazeina. Porcja twarogu (200 g) daje ~36 g białka wolno trawionego — taniej niż odżywka.' }
        ],
        bullets: ['<strong>Domknij dzienną pulę</strong> — to 90% sukcesu.', '<strong>Przed snem</strong> — twaróg lub kazeina, jeśli brakuje białka.', '<strong>Nie musisz</strong> — serwatka wieczorem też jest OK.'],
        uwaga: 'Ogromna porcja tuż przed snem może utrudnić zasypianie i dać refluks — mniejsza porcja późnym wieczorem jest bezpieczniejsza.',
        coDalej: 'Zobacz <a href="bialko-przed-snem-czy-warto">białko przed snem</a> i <a href="produkty-bialkowe-czy-oplacalne">czy produkty białkowe się opłacają</a>.'
    },
    {
        slug: 'rozgotowany-kurczak-ile-bialka',
        emoji: '🍗',
        title: 'Ile białka tracisz, rozgotowując kurczaka',
        subtitle: 'Smażenie i pieczenie odparowuje wodę, nie białko. Wartości w tabelach bywają liczone na surowo — stąd zamieszanie.',
        meta: 'Ile białka ma rozgotowany kurczak? Różnica surowe vs pieczone, dlaczego waga spada po obróbce i jak liczyć makro kurczaka bez błędu.',
        category: 'bialko',
        lead: 'Pierś z kurczaka ma ~23 g białka na 100 g — na surowo. Po upieczeniu 100 g surowego robi się z ~70 g, ale białka w środku zostaje tyle samo.',
        sections: [
            { h2: 'Dlaczego waga spada', p: 'Obróbka termiczna odparowuje wodę (pierś to ~75% wody). Mięso robi się „gęstsze w makro” na 100 g, ale nie tracisz grama białka.' },
            { h2: 'Surowe vs pieczone na 100 g', p: '100 g pieczonej piersi ma ~31 g białka — nie dlatego, że go przybyło, tylko że w 100 g jest mniej wody. Stąd różnice w aplikacjach.' },
            { h2: 'Jak liczyć bez błędu', p: 'Waż przed obróbką i licz z surowego, albo przyjmij ~30 g białka na 100 g pieczonego. Nie mieszaj obu systemów w jednym dniu.' }
        ],
        bullets: ['<strong>Waż surowe</strong> — najprostszy sposób na spójność.', '<strong>Pieczone ~30 g/100 g</strong> — przybliżenie bez wagi surowej.', '<strong>Białka nie ubywa</strong> — tylko woda paruje.'],
        uwaga: 'Przypalanie i mocne smażenie tworzy akrylamid i niszczy część witamin, ale to problem zdrowotny, nie białkowy.',
        coDalej: 'Sprawdź <a href="porownaj-produkty">kurczaka w porównywarce</a> i <a href="bialko-maxxing">ranking białko maxxing</a>.'
    },
// @@MORE@@
