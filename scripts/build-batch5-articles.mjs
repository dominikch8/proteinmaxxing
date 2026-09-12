/**
 * Generuje artykuły — batch 5 (białko, 20 szt.).
 * Produkuje scripts/hardcore-articles-batch5.json.
 * node scripts/build-batch5-articles.mjs
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

defs.push({
    slug: 'wpc-vs-wpi-vs-hydrolizat',
    emoji: '🥛',
    title: 'WPC vs WPI vs hydrolizat — które wybrać',
    subtitle: 'Czym różnią się odżywki serwatkowe i czy przepłacanie za hydrolizat ma sens.',
    meta: 'WPC, WPI i hydrolizat białka serwatkowego: różnice, cena i czy warto przepłacać.',
    crumb: 'WPC vs WPI vs hydrolizat',
    category: 'bialko',
    relatedHtml: '<a href="cena-bialka">cena białka</a> · <a href="suplementacja-bialka-czy-wpc-wpi-potrzebne">czy WPC/WPI potrzebne</a> · <a href="artykuly">artykuły</a>',
    lead: 'Odżywka serwatkowa występuje jako koncentrat (WPC), izolat (WPI) i hydrolizat. Różnią się zawartością białka i ceną — a różnica w efektach jest mniejsza niż na cenniku.',
    sections: [
        { h2: 'WPC — koncentrat', p: 'Zwykle 70–80% białka, reszta to laktoza i trochę tłuszczu. Najtańszy i dla niemal każdego w pełni wystarczający. Bez nietolerancji laktozy to rozsądny domyślny wybór.' },
        { h2: 'WPI — izolat', p: 'Ponad 90% białka i śladowa laktoza. Przydaje się przy nietolerancji i przy pilnowaniu makro. Dla zdrowych różnica w budowaniu mięśni vs WPC jest praktycznie zerowa.' },
        { h2: 'Hydrolizat', p: 'Wstępnie „pocięte” białko — szybciej się wchłania, ale buduje mięśnie tak samo. Płacisz głównie za krótsze wchłanianie i mniejsze ryzyko wzdęć.' }
    ],
    bullets: [
        '<strong>Bez nietolerancji:</strong> WPC wystarczy.',
        '<strong>Nietolerancja laktozy:</strong> WPI albo izolat.',
        '<strong>Hydrolizat:</strong> tylko gdy zwykły ci „burczy”.'
    ],
    uwaga: 'Kluczowa jest suma białka w ciągu dnia, nie rodzaj odżywki. Różnice między typami to detal, nie przełom.',
    coDalej: 'Sprawdź <a href="suplementacja-bialka-czy-wpc-wpi-potrzebne">czy potrzebujesz odżywki</a> i policz <a href="cena-bialka">koszt za 100 g białka</a>.'
});
defs.push({
    slug: 'leucyna-prog-anaboliczny',
    emoji: '🧬',
    title: 'Leucyna i próg anaboliczny — ile białka na porcję',
    subtitle: 'Dlaczego 20–40 g białka w posiłku „włącza” syntezę mięśni i jaką rolę gra leucyna.',
    meta: 'Leucyna, próg anaboliczny i synteza białek mięśniowych: ile gramów białka na porcję.',
    crumb: 'Leucyna i próg anaboliczny',
    category: 'bialko',
    relatedHtml: '<a href="ile-bialka-na-dzien">ile białka dziennie</a> · <a href="bialko-przed-snem-czy-warto">białko przed snem</a> · <a href="artykuly">artykuły</a>',
    lead: 'Synteza białek mięśniowych „włącza się” po przekroczeniu pewnego progu — a kluczowym sygnałem jest aminokwas leucyna.',
    sections: [
        { h2: 'Co robi leucyna', p: 'Leucyna najsilniej pobudza szlak mTOR odpowiadający za budowę mięśni. Działającą dawkę (ok. 2–3 g leucyny) masz w porcji 0,3–0,4 g białka na kg masy ciała.' },
        { h2: 'Ile to w praktyce', p: 'Dla osoby 70–80 kg to 20–40 g białka w posiłku. Większa porcja syntezy nie podbije — nadmiar pójdzie na energię. Dlatego lepiej rozłożyć białko na 3–5 porcji.' },
        { h2: 'Skąd brać leucynę', p: 'Najwięcej leucyny mają białka zwierzęce i serwatka. W białkach roślinnych jest jej mniej na gram, więc veganin potrzebuje większych porcji albo mixu źródeł.' }
    ],
    bullets: [
        '<strong>Porcja:</strong> 20–40 g białka na posiłek.',
        '<strong>Rozkład:</strong> 3–5 porcji zamiast jednej wielkiej.',
        '<strong>Roślinnie:</strong> łącz strączki ze zbożami.',
    ],
    uwaga: 'Próg dotyczy optymalizacji mięśni — dla zdrowia i sytości liczy się całkowita ilość białka, nie tylko timing.',
    coDalej: 'Policz swój cel w <a href="ile-bialka-na-dzien">ile białka dziennie</a> i domknij go z <a href="dieta#produkty">bazy Proteiner</a>.'
});
defs.push({
    slug: 'bialko-a-nerki-co-mowia-badania',
    emoji: '🫘',
    title: 'Białko a nerki — co naprawdę mówią badania',
    subtitle: 'Czy wysokobiałkowa dieta „niszczy nerki” u zdrowych? Sprawdzamy dane.',
    meta: 'Białko a nerki: czy dieta wysokobiałkowa szkodzi zdrowym, kto powinien uważać i co mówią metaanalizy.',
    crumb: 'Białko a nerki',
    category: 'bialko',
    relatedHtml: '<a href="ile-bialka-na-dzien">ile białka</a> · <a href="suplementacja-bialka-czy-wpc-wpi-potrzebne">suplementacja</a> · <a href="artykuly">artykuły</a>',
    lead: 'Mit „dużo białka niszczy nerki” pochodzi z badań na osobach z chorobami nerek. U zdrowych ludzi sytuacja wygląda inaczej.',
    sections: [
        { h2: 'Skąd ten mit', p: 'U pacjentów z przewlekłą chorobą nerek ograniczenie białka faktycznie spowalnia postęp choroby. Stąd wniosek uogólniono na wszystkich — niesłusznie.' },
        { h2: 'Co mówią dane', p: 'Według <a href="https://jissn.biomedcentral.com/articles/10.1186/s12970-017-0177-8" target="_blank" rel="noopener">stanowiska ISSN</a> typowe zakresy sportowe (1,6–2,2 g/kg) nie szkodzą nerkom zdrowych. Badania długoterminowe nie pokazują pogorszenia filtracji.' },
        { h2: 'Kto powinien uważać', p: 'Osoby z rozpoznaną chorobą nerek, kamieniami i wybranymi schorzeniami metabolicznymi — tu dawka białka to decyzja lekarza, nie bloga.' }
    ],
    bullets: [
        '<strong>Zdrowi:</strong> 1,6–2,2 g/kg jest w normie.',
        '<strong>Choroby nerek:</strong> dawka z lekarzem.',
        '<strong>Nawodnienie:</strong> pij płyny przy dużym białku.',
    ],
    uwaga: 'Jeśli masz jedną nerkę, kamicę lub chorobę nerek w rodzinie, zanim skoczysz na 2 g/kg — skonsultuj się z nefrologiem.',
    coDalej: 'Zobacz <a href="ile-bialka-na-dzien">ile białka jeść</a> i <a href="mity-o-bialku">mity o białku</a>.'
});
defs.push({
    slug: 'bialko-a-kosci-i-wapn',
    emoji: '🦴',
    title: 'Białko a kości — czy wypłukuje wapń?',
    subtitle: 'Czy dużo białka odwapnia kości, czy wręcz przeciwnie — wspiera gęstość mineralną.',
    meta: 'Białko a kości i wapń: kwasowość diety, gęstość mineralna i co realnie chroni szkielet.',
    crumb: 'Białko a kości',
    category: 'bialko',
    relatedHtml: '<a href="ile-bialka-na-dzien">ile białka</a> · <a href="mity-o-bialku">mity</a> · <a href="artykuly">artykuły</a>',
    lead: 'Przez lata straszono, że białko „zakwasza” i wypłukuje wapń z kości. Nowoczesne badania wskazują coś odwrotnego.',
    sections: [
        { h2: 'Teoria kwasowości', p: 'Stara hipoteza głosiła, że białko zwiększa kwasowość, a organizm neutralizuje ją wapniem z kości. Dziś wiemy, że mechanizm ma znikomy wpływ przy realnych dawkach.' },
        { h2: 'Co chroni kości', p: 'Paradoksalnie wyższe białko (z wapniem i treningiem siłowym) wiąże się z lepszą gęstością mineralną i mniejszym ryzykiem złamań, zwłaszcza u starszych.' },
        { h2: 'Praktyka', p: 'Zamiast bać się białka, zadbaj o pełen zestaw: białko, wapń (nabiał, wody mineralne, tofu) i obciążanie mechaniczne kości ruchem.' }
    ],
    bullets: [
        '<strong>Białko:</strong> 1,4–1,8 g/kg wspiera szkielet.',
        '<strong>Wapń:</strong> nabiał, tofu, woda mineralna.',
        '<strong>Ruch:</strong> marsz, schody, siłownia.',
    ],
    uwaga: 'Osteoporoza to choroba wieloczynnikowa. Białko jej nie powoduje — kość słabnie przy braku wapnia i ruchu niezależnie od białka.',
    coDalej: 'Poznaj <a href="bialko-a-starzenie-sarkopenia">rolę białka w starzeniu</a> i <a href="dieta#produkty">produkty bogate w białko</a>.'
});
defs.push({
    slug: 'kolagen-czy-liczy-sie-do-bialka',
    emoji: '✨',
    title: 'Kolagen — czy liczy się do dziennego białka?',
    subtitle: 'Dlaczego kolagen ma słaby profil aminokwasowy i czemu nie zastąpi pełnowartościowego białka.',
    meta: 'Kolagen a białko: profil aminokwasowy, czy buduje mięśnie i jak go rozliczać w diecie.',
    crumb: 'Kolagen a białko',
    category: 'bialko',
    relatedHtml: '<a href="bialko-roslinne-kompletne-aminokwasy">aminokwasy</a> · <a href="ile-bialka-na-dzien">ile białka</a> · <a href="artykuly">artykuły</a>',
    lead: 'Kolagen to białko, ale o bardzo nierównym profilu — praktycznie bez tryptofanu i uboższe w leucynę. Do budowy mięśni liczy się tylko częściowo.',
    sections: [
        { h2: 'Czym jest kolagen', p: 'To główne białko strukturalne skóry, chrząstek i ścięgien. Suplementy kolagenowe są popularne, ale jako „białko treningowe” są kiepskie.' },
        { h2: 'Profil aminokwasów', p: 'Brakuje mu aminokwasów egzogennych potrzebnych do syntezy mięśni — zwłaszcza tryptofanu. Ma za to dużo glicyny i proliny, które wspierają struktury łączne.' },
        { h2: 'Jak to rozliczać', p: 'Kolagenu nie wliczaj w pełni do celu białkowego na mięśnie. Traktuj go jako dodatek, a bazę buduj na białkach pełnowartościowych.' }
    ],
    bullets: [
        '<strong>Do mięśni:</strong> nie zastąpi serwatki, jaj, mięsa.',
        '<strong>Do stawów:</strong> dowody są mieszane.',
        '<strong>Rozliczanie:</strong> licz egzogenne, nie gramy.',
    ],
    uwaga: 'Kolagen dla skóry i stawów — OK. Tylko nie traktuj go jako głównego źródła dziennego białka, bo policzysz za dużo.',
    coDalej: 'Zobacz <a href="bialko-roslinne-kompletne-aminokwasy">jak kompletować aminokwasy</a> i <a href="produkty-bialkowe-czy-oplacalne">opłacalne źródła</a>.'
});
defs.push({
    slug: 'bialko-a-starzenie-sarkopenia',
    emoji: '👴',
    title: 'Białko po 50. — jak chronić mięśnie',
    subtitle: 'Sarkopenia, oporność anaboliczna i dlaczego z wiekiem potrzeba więcej białka na porcję.',
    meta: 'Białko i sarkopenia: dlaczego po 50. roku życia więcej białka na porcję chroni mięśnie.',
    crumb: 'Białko po 50.',
    category: 'bialko',
    relatedHtml: '<a href="ile-bialka-na-dzien">ile białka</a> · <a href="bialko-a-kosci-i-wapn">kości</a> · <a href="artykuly">artykuły</a>',
    lead: 'Po 50. roku życia mięśnie łatwiej tracić, a trudniej odbudować. Jednym z głównych narzędzi ochrony jest odpowiednia dawka białka.',
    sections: [
        { h2: 'Czym jest sarkopenia', p: 'To postępująca utrata masy i siły mięśni z wiekiem. Zwiększa ryzyko upadków, złamań i utraty samodzielności. Dotyka też osób, które „nie wyglądają staro”.' },
        { h2: 'Oporność anaboliczna', p: 'Starsi dorośli potrzebują większej dawki białka na porcję, by uzyskać ten sam impuls do syntezy mięśni. Badania wskazują na 25–40 g pełnowartościowego białka w posiłku.' },
        { h2: 'Co robić', p: 'Celuj w 1,2–1,6 g/kg, rozłożone równo. Dodaj trening siłowy — bez bodźca mechanicznego samo białko mięśni nie utrzyma.' }
    ],
    bullets: [
        '<strong>Porcja:</strong> 25–40 g w każdym posiłku.',
        '<strong>Dziennie:</strong> 1,2–1,6 g/kg masy ciała.',
        '<strong>Siłownia:</strong> minimum 2× w tygodniu.',
    ],
    uwaga: 'Przy chorobach nerek zakresy ustala lekarz. U seniorów z problemem żucia pomagają odżywki lub miksowane źródła białka.',
    coDalej: 'Poznaj <a href="bialko-a-kosci-i-wapn">wpływ białka na kości</a> i <a href="dieta#produkty">bazę produktów</a>.'
});
defs.push({
    slug: 'bialko-a-odpornosc',
    emoji: '🛡️',
    title: 'Białko a odporność',
    subtitle: 'Jak niedobór białka osłabia układ odpornościowy i ile trzeba, żeby go wspierać.',
    meta: 'Białko a odporność: przeciwciała, limfocyty i dlaczego niedobór osłabia ochronę organizmu.',
    crumb: 'Białko a odporność',
    category: 'bialko',
    relatedHtml: '<a href="ile-bialka-na-dzien">ile białka</a> · <a href="cynk-a-regeneracja">cynk</a> · <a href="artykuly">artykuły</a>',
    lead: 'Przeciwciała, enzymy i komórki odpornościowe zbudowane są z białka. Chroniczny niedobór realnie osłabia odporność — to nie metafora.',
    sections: [
        { h2: 'Białko w odporności', p: 'Limfocyty i przeciwciała potrzebują aminokwasów do podziałów i produkcji. Przy niedoborze białka regeneracja komórek odpornościowych zwalnia.' },
        { h2: 'Glutamina i arginina', p: 'Niektóre aminokwasy, jak glutamina, są paliwem komórek odpornościowych. U skrajnie niedożywionych suplementacja pomaga, ale u zdrowych wystarczy dieta.' },
        { h2: 'Ile jeść', p: 'Dla aktywnych 1,6–2,2 g/kg to i cel mięśniowy, i wsparcie odporności. Deficyt częściej dotyka osób jedzących mało urozmaicone.' }
    ],
    bullets: [
        '<strong>Baza:</strong> 1,6–2,2 g/kg dla aktywnych.',
        '<strong>Źródła:</strong> jaja, ryby, nabiał, strączki.',
        '<strong>Sygnał:</strong> częste infekcje to ostrzeżenie.',
    ],
    uwaga: 'Odporność to wiele czynników: sen, stres, witaminy D i C, cynk. Samo dużo białka nie zrekompensuje niedospania.',
    coDalej: 'Sprawdź <a href="cynk-a-regeneracja">cynk</a> i <a href="witamina-d-ile-i-kiedy">witaminę D</a>.'
});
defs.push({
    slug: 'bialko-a-skora-wlosy-paznokcie',
    emoji: '💇',
    title: 'Białko a skóra, włosy i paznokcie',
    subtitle: 'Ile prawdy jest w tym, że białko i keratyna poprawiają włosy — i co realnie działa.',
    meta: 'Białko a włosy, skóra i paznokcie: keratyna, kolagen i kiedy suplementacja ma sens.',
    crumb: 'Białko a skóra i włosy',
    category: 'bialko',
    relatedHtml: '<a href="kolagen-czy-liczy-sie-do-bialka">kolagen</a> · <a href="zelazo-niedobor-u-kobiet">żelazo</a> · <a href="artykuly">artykuły</a>',
    lead: 'Włosy, paznokcie i skóra zbudowane są z białek (keratyna, kolagen). Ale „branie więcej białka” rzadko samo naprawi ich wygląd.',
    sections: [
        { h2: 'Keratyna i budulec', p: 'Keratyna to białko bogate w cysteinę. Organizm produkuje ją z aminokwasów z diety — przy prawidłowym odżywieniu materiału nie brakuje.' },
        { h2: 'Kiedy białko pomaga', p: 'Poprawa następuje głównie u osób z niedoborem lub na dietach bardzo ubogich. U dobrze odżywionych dodatkowe białko nie przyspieszy wzrostu włosów.' },
        { h2: 'Co częściej szwankuje', p: 'Za słabymi włosami częściej stoją niedobory żelaza, cynku, biotyny lub hormony — sprawdź przyczynę, zanim sięgniesz po „białkowy cud”.' }
    ],
    bullets: [
        '<strong>Białko:</strong> uzupełnij przy realnym niedoborze.',
        '<strong>Żelazo, cynk:</strong> klucz dla cebulek i paznokci.',
        '<strong>Cierpliwość:</strong> włos rośnie ~1 cm/mc.',
    ],
    uwaga: 'Nagłe wypadanie włosów to objaw dla lekarza (tarczyca, niedobory, hormony), a nie temat na „dietę na włosy”.',
    coDalej: 'Zobacz <a href="zelazo-niedobor-u-kobiet">niedobór żelaza</a> i <a href="kolagen-czy-liczy-sie-do-bialka">czy kolagen działa</a>.'
});
defs.push({
    slug: 'bialko-roslinne-kompletne-aminokwasy',
    emoji: '🌱',
    title: 'Białko roślinne — jak skompletować aminokwasy',
    subtitle: 'Pełnowartościowe białko bez mięsa: łączenie źródeł i ile go realnie potrzebujesz.',
    meta: 'Białko roślinne: kompletny profil aminokwasowy, łączenie strączków ze zbożami i dawki dla wegan.',
    crumb: 'Białko roślinne — aminokwasy',
    category: 'bialko',
    relatedHtml: '<a href="wegetarianskie-zrodla-bialka">wegetariańskie źródła</a> · <a href="soja-tofu-tempeh-seitan-przeglad">tofu i seitan</a> · <a href="artykuly">artykuły</a>',
    lead: 'Białko roślinne bywa „niekompletne”, bo ma mniej niektórych aminokwasów egzogennych. Rozwiązanie jest proste: łącz różne źródła w ciągu dnia.',
    sections: [
        { h2: 'Co to „niekompletne”', p: 'Rośliny mają zwykle mniej lizyny (zboża) albo metioniny (strączki). Jedząc je razem — np. ryż z fasolą — uzupełniasz profil do wzorca zwierzęcego.' },
        { h2: 'Nie musisz łączyć w jednym posiłku', p: 'Organizm ma „pulę aminokwasów”, więc wystarczy różnorodność w ciągu doby. Ważniejsza jest łączna ilość białka niż sparowanie na talerzu.' },
        { h2: 'Dawki dla wegan', p: 'Ze względu na słabszą przyswajalność weganie mogą celować w górną granicę: ok. 1,6–2,2 g/kg, na soi, strączkach, zbożach i odżywkach roślinnych.' }
    ],
    bullets: [
        '<strong>Łącz:</strong> strączki + zboża w ciągu dnia.',
        '<strong>Soja:</strong> najbliżej profilu zwierzęcego.',
        '<strong>Dawka:</strong> 1,6–2,2 g/kg dla aktywnych.',
    ],
    uwaga: 'Na czysto roślinnej diecie łatwo zaniżyć białko i leucynę — sprawdzaj realne ilości. Odżywka grochowo-ryżowa dobrze domyka leucynę.',
    coDalej: 'Zobacz <a href="wegetarianskie-zrodla-bialka">wegetariańskie źródła</a> i <a href="soja-tofu-tempeh-seitan-przeglad">przewodnik po tofu i seitanie</a>.'
});
defs.push({
    slug: 'soja-tofu-tempeh-seitan-przeglad',
    emoji: '🍜',
    title: 'Tofu, tempeh, seitan — ile białka i jak używać',
    subtitle: 'Trzy roślinne zamienniki mięsa — zawartość białka, wady i szybkie pomysły.',
    meta: 'Tofu, tempeh i seitan: zawartość białka, profil aminokwasowy i jak je przyrządzać.',
    crumb: 'Tofu, tempeh, seitan',
    category: 'bialko',
    relatedHtml: '<a href="bialko-roslinne-kompletne-aminokwasy">aminokwasy roślinne</a> · <a href="wegetarianskie-zrodla-bialka">wegetariańskie</a> · <a href="artykuly">artykuły</a>',
    lead: 'Tofu, tempeh i seitan to trzy filary białka roślinnego. Różnią się smakiem, teksturą i profilem aminokwasowym.',
    sections: [
        { h2: 'Tofu (soja)', p: 'Ok. 8–15 g białka na 100 g zależnie od twardości. Pełnowartościowe, neutralne w smaku, świetnie łapie marynaty. Najwszechstronniejszy wybór na start.' },
        { h2: 'Tempeh (fermentowana soja)', p: 'Ok. 19 g białka na 100 g. Fermentacja ułatwia trawienie i daje orzechowy smak. Twarda, „mięsna” struktura — idealny do smażenia.' },
        { h2: 'Seitan (gluten)', p: 'Nawet 25 g białka na 100 g, ale z pszenicy — ubogi w lizynę. Nie dla osób z celiakią. Świetnie imituje mięso, ale łącz z soją lub strączkami.' }
    ],
    bullets: [
        '<strong>Tofu:</strong> marynuj i smaż na chrupko.',
        '<strong>Tempeh:</strong> kroj w plastry i podsmaż.',
        '<strong>Seitan:</strong> łącz ze źródłem lizyny.',
    ],
    uwaga: 'Seitan to czysty gluten — przy celiakii lub nadwrażliwości odpada. Tofu i tempeh są bezglutenowe.',
    coDalej: 'Zobacz <a href="wegetarianskie-zrodla-bialka">pełną listę roślinnego białka</a> i policz porcje w <a href="kalkulator-posilkow">kalkulatorze posiłków</a>.'
});
//_A6_
//_A7_
//_A8_
//_A9_
//_A10_

const articles = defs.map(buildArticle);
const out = path.join(__dirname, 'hardcore-articles-batch5.json');
writeFileSync(out, JSON.stringify(articles, null, 2) + '\n');
console.log(`Zapisano ${articles.length} artykułów -> ${out}`);
