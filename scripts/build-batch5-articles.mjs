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
defs.push({
    slug: 'owady-jako-bialko-ciekawostka',
    emoji: '🦗',
    title: 'Owady jako białko — fakty i liczby',
    subtitle: 'Świerszcze i mączniki: ile białka, jak wypadają ekologicznie i czy są bezpieczne.',
    meta: 'Owady jadalne jako białko: zawartość, aminokwasy, ekologia i bezpieczeństwo spożycia.',
    crumb: 'Owady jako białko',
    category: 'bialko',
    relatedHtml: '<a href="budzetowe-zrodla-bialka-taniej-niz-odzywka">tanie białko</a> · <a href="artykuly">artykuły</a> · <a href="poradnik-zywienia">poradnik</a>',
    lead: 'Owady to jedno z najbardziej białkowych „produktów” na kilogram suchej masy — i ekologicznie tani sposób na proteiny.',
    sections: [
        { h2: 'Ile białka', p: 'Mącznik i świerszcze mają ok. 50–70 g białka na 100 g suchej masy. Profil aminokwasowy jest zaskakująco dobry, porównywalny z mięsem.' },
        { h2: 'Ekologia', p: 'Hodowla owadów zużywa wielokrotnie mniej wody i paszy niż bydło i emituje mniej gazów cieplarnianych. Dlatego FAO traktuje je jako przyszłościowe źródło białka.' },
        { h2: 'Bezpieczeństwo', p: 'W UE owady są zatwierdzone jako nowa żywność (m.in. mącznik, świerszcz). Osoby z alergią na skorupiaki mogą reagować krzyżowo.' }
    ],
    bullets: [
        '<strong>Białko:</strong> 50–70 g/100 g suchej masy.',
        '<strong>Ekologia:</strong> niższy ślad wodny i węglowy.',
        '<strong>Alergia:</strong> ostrożnie przy alergii na krewetki.',
    ],
    uwaga: 'Mąka ze świerszczy bywa droga i nie jest konieczna — to ciekawostka i alternatywa, nie niezbędnik. Tańsze zostają twaróg i jaja.',
    coDalej: 'Sprawdź <a href="budzetowe-zrodla-bialka-taniej-niz-odzywka">najtańsze źródła</a> i <a href="cena-bialka">koszt za 100 g proteinów</a>.'
});
defs.push({
    slug: 'bialko-a-cukrzyca-insulina',
    emoji: '🩸',
    title: 'Białko a cukrzyca i insulina',
    subtitle: 'Jak białko wpływa na glukozę i insulinę oraz dlaczego pomaga przy insulinooporności.',
    meta: 'Białko a cukrzyca: wpływ na glukozę, insulinę i dlaczego dieta wysokobiałkowa wspiera kontrolę.',
    crumb: 'Białko a cukrzyca',
    category: 'bialko',
    relatedHtml: '<a href="ile-bialka-na-dzien">ile białka</a> · <a href="indeks-glikemiczny-czy-ma-znaczenie">indeks glikemiczny</a> · <a href="artykuly">artykuły</a>',
    lead: 'Białko podnosi insulinę słabiej niż węglowodany i spowalnia wchłanianie glukozy — dlatego pomaga stabilizować cukier po posiłku.',
    sections: [
        { h2: 'Białko a glukoza', p: 'Część aminokwasów stymuluje insulinę, ale przy tym glukagon równoważy poziom cukru. Efekt: mniejsze skoki glukozy po łącznym posiłku.' },
        { h2: 'Rola sytości', p: 'Białko jest najbardziej sycącym makroskładnikiem, co pomaga jeść mniej i rytmiczniej — kluczowe przy insulinooporności i cukrzycy typu 2.' },
        { h2: 'Praktyka', p: 'Rozkładaj białko na posiłki i łącz z błonnikiem oraz tłuszczem. Pomaga to też zdrowym uniknąć poposiłkowej senności i głodu.' }
    ],
    bullets: [
        '<strong>Stabilizacja:</strong> białko w każdym posiłku.',
        '<strong>Łącz:</strong> z warzywami i pełnym ziarnem.',
        '<strong>Regularnie:</strong> 3–5 posiłków, bez podjadania.',
    ],
    uwaga: 'Przy zaawansowanej cukrzycy i chorobach nerek ilość białka ustala lekarz lub dietetyk kliniczny.',
    coDalej: 'Czytaj o <a href="insulina-a-magazynowanie-tluszczu">insulinie i tłuszczu</a> oraz <a href="indeks-glikemiczny-czy-ma-znaczenie">indeksie glikemicznym</a>.'
});
defs.push({
    slug: 'bialko-serwatkowe-a-tradzik-i-laktoza',
    emoji: '🧖',
    title: 'Białko serwatkowe a trądzik i laktoza',
    subtitle: 'Dlaczego po odżywce czasem wyskakują pryszcze i co z nietolerancją laktozy.',
    meta: 'Serwatka a trądzik i laktoza: mechanizm, kto jest narażony i czym zastąpić odżywkę.',
    crumb: 'Serwatka a trądzik',
    category: 'bialko',
    relatedHtml: '<a href="wpc-vs-wpi-vs-hydrolizat">WPC vs WPI</a> · <a href="suplementacja-bialka-czy-wpc-wpi-potrzebne">suplementacja</a> · <a href="artykuly">artykuły</a>',
    lead: 'Serwatka może zaostrzać trądzik u części osób, a laktoza w koncentracie — drażnić przy nietolerancji. Są proste zamiany.',
    sections: [
        { h2: 'Trądzik i serwatka', p: 'Serwatka podwyższa insulinę i IGF-1, co u predysponowanych nasila produkcję sebum. Jeśli po odżywce widzisz gorszą cerę, to częste połączenie.' },
        { h2: 'Laktoza', p: 'WPC zawiera laktozę — przy nietolerancji daje wzdęcia i dyskomfort. Izolat (WPI) ma jej śladowe ilości, więc bywa lepszy.' },
        { h2: 'Zamiany', p: 'Testuj kolejno: izolat, białko roślinne (groch/ryż) albo zrezygnuj z odżywki na rzecz twarogu, skyr i jaj. Efekt treningowy będzie ten sam.' }
    ],
    bullets: [
        '<strong>Trądzik po odżywce:</strong> spróbuj WPI lub roślinne.',
        '<strong>Wzdęcia:</strong> sprawdź izolat bez laktozy.',
        '<strong>Bez odżywki:</strong> twaróg i jaja działają tak samo.',
    ],
    uwaga: 'Trądzik ma wiele przyczyn (hormony, stres, kosmetyki). Jeśli zmiana odżywki nie pomaga, idź do dermatologa.',
    coDalej: 'Zobacz <a href="wpc-vs-wpi-vs-hydrolizat">różnice WPC/WPI/hydrolizat</a> i <a href="suplementacja-bialka-czy-wpc-wpi-potrzebne">czy odżywka jest ci potrzebna</a>.'
});
defs.push({
    slug: 'ile-bialka-wchlaniamy-z-jednego-posilku',
    emoji: '🤔',
    title: 'Ile białka wchłaniamy z jednego posiłku?',
    subtitle: 'Mit „tylko 30 g na raz” pod lupą — ile naprawdę wykorzystuje organizm.',
    meta: 'Ile białka wchłonie się z jednego posiłku: mit 30 g, tempo trawienia i praktyka dla trenujących.',
    crumb: 'Ile białka z posiłku',
    category: 'bialko',
    relatedHtml: '<a href="leucyna-prog-anaboliczny">próg anaboliczny</a> · <a href="mity-o-bialku">mity</a> · <a href="artykuly">artykuły</a>',
    lead: 'Legenda o „maksymalnie 30 g białka na posiłek” to uproszczenie. Organizm wykorzysta też większe porcje — wolniej i częściowo na inne cele.',
    sections: [
        { h2: 'Skąd 30 g', p: 'Wynika z badań, że synteza mięśni osiąga szczyt przy 20–40 g białka na posiłek. Więcej nie podbija budowy mięśni, ale nadal jest wchłaniane.' },
        { h2: 'Co z nadmiarem', p: 'Nadwyżka nie „znika”. Organizm spala ją jako energię, zużywa na inne tkanki lub chwilowo magazynuje. Nie oznacza to, że białko się marnuje.' },
        { h2: 'Praktyka', p: 'Optymalnie dla mięśni: 3–5 porcji po 20–40 g. Ale jeden większy posiłek (np. stek na 60 g) nie jest stratą — tylko mniej optymalnym rozkładem.' }
    ],
    bullets: [
        '<strong>Na mięśnie:</strong> 20–40 g/porcję to optimum.',
        '<strong>Więcej:</strong> nie szkodzi, nie przyspiesza.',
        '<strong>Rozkład:</strong> 3–5 porcji wygrywa.',
    ],
    uwaga: 'Osoby na 1–2 posiłkach dziennie (IF) też budują mięśnie, jeśli tygodniowa suma białka i kalorie się zgadzają — rozkład to optymalizacja, nie warunek.',
    coDalej: 'Czytaj <a href="leucyna-prog-anaboliczny">o progu anabolicznym</a> i <a href="mity-o-bialku">obalonych mitach</a>.'
});
defs.push({
    slug: 'bialko-nocne-mps-podczas-snu',
    emoji: '🌙',
    title: 'Białko przed snem — nocna synteza mięśni',
    subtitle: 'Czy kazeina albo twaróg na noc realnie pomaga regenerować mięśnie.',
    meta: 'Białko przed snem: kazeina, twaróg i synteza białek podczas snu — co mówią badania.',
    crumb: 'Białko przed snem',
    category: 'bialko',
    relatedHtml: '<a href="leucyna-prog-anaboliczny">leucyna</a> · <a href="ile-bialka-na-dzien">ile białka</a> · <a href="artykuly">artykuły</a>',
    lead: 'Według <a href="https://jissn.biomedcentral.com/articles/10.1186/s12970-017-0177-8" target="_blank" rel="noopener">ISSN</a> 30–40 g białka przed snem podnosi nocną syntezę białek mięśniowych — zwłaszcza po wieczornym treningu.',
    sections: [
        { h2: 'Dlaczego działa', p: 'W nocy organizm jest w naturalnym „poście”. Porcja z kazeiną lub twarogiem uwalnia aminokwasy powoli, karmiąc mięśnie przez kilka godzin.' },
        { h2: 'Kazeina czy twaróg', p: 'Kazeina trawi się wolno, ale chudy twaróg robi to samo i jest tańszy. 150–250 g twarogu dostarcza 20–30 g białka i działa porównywalnie.' },
        { h2: 'Kiedy ma sens', p: 'Największa korzyść, gdy trenujesz wieczorem i masz wąskie okno do snu. Przy dobrze rozłożonym białku w ciągu dnia to opcjonalny bonus.' }
    ],
    bullets: [
        '<strong>Porcja:</strong> 30–40 g białka przed snem.',
        '<strong>Źródło:</strong> chudy twaróg lub kazeina.',
        '<strong>Warto:</strong> zwłaszcza przy wieczornych treningach.',
    ],
    uwaga: 'Dodatkowa porcja przed snem to dodatkowe kalorie — na mocnym deficycie wlicz ją do budżetu, nie dokładaj „na wierzch”.',
    coDalej: 'Policz <a href="ile-bialka-na-dzien">dzienne białko</a> i porównaj <a href="cena-bialka">koszt twarogu vs kazeiny</a>.'
});
defs.push({
    slug: 'bialko-dla-biegaczy-i-kolarzy',
    emoji: '🚴',
    title: 'Białko dla biegaczy i kolarzy',
    subtitle: 'Ile białka potrzebują sportowcy wytrzymałościowi i dlaczego nie tylko węglowodany.',
    meta: 'Białko w sportach wytrzymałościowych: dawki, regeneracja i ochrona mięśni u biegaczy.',
    crumb: 'Białko dla wytrzymałych',
    category: 'bialko',
    relatedHtml: '<a href="ile-bialka-na-dzien">ile białka</a> · <a href="weglowodany-proste-vs-zlozone">węglowodany</a> · <a href="artykuly">artykuły</a>',
    lead: 'Wytrzymałościowcy często zaniżają białko, skupiając się na węglowodanach. Tymczasem to białko naprawia włókna mięśniowe niszczone kilometrami.',
    sections: [
        { h2: 'Ile jeść', p: 'Dla biegaczy i kolarzy sprawdza się ok. 1,4–1,8 g/kg, a przy wysokiej objętości i redukcji — bliżej 1,8–2,0 g/kg.' },
        { h2: 'Nie tylko węgle', p: 'Białko wspiera naprawę mięśni po długich wybieganiach i pomaga utrzymać masę przy dużej ilości cardio. Chroni też odporność w intensywnych blokach.' },
        { h2: 'Timing', p: '30–40 g po treningu przyspiesza regenerację. Połącz z węglowodanami (ryż z kurczakiem), żeby uzupełnić glikogen i zbudować mięśnie.' }
    ],
    bullets: [
        '<strong>Dawka:</strong> 1,4–2,0 g/kg.',
        '<strong>Po treningu:</strong> białko + węglowodany.',
        '<strong>Regularnie:</strong> nie tylko w dzień startu.',
    ],
    uwaga: 'Kalorie z białka nie mogą wypierać węglowodanów przy dużym kilometrażu — węgle to główne paliwo. Chodzi o dodanie białka, nie zastąpienie.',
    coDalej: 'Sprawdź <a href="weglowodany-proste-vs-zlozone">proste vs złożone węglowodany</a> i <a href="elektrolity-co-i-kiedy">elektrolity</a>.'
});
defs.push({
    slug: 'kurczak-vs-wolowina-vs-wieprzowina',
    emoji: '🍖',
    title: 'Kurczak, wołowina, wieprzowina — porównanie',
    subtitle: 'Białko, kalorie i mikroelementy trzech podstaw dietetycznych mięs.',
    meta: 'Kurczak, wołowina i wieprzowina: porównanie białka, kalorii, żelaza i kwasów tłuszczowych.',
    crumb: 'Kurczak vs wołowina vs wieprzowina',
    category: 'bialko',
    relatedHtml: '<a href="ryby-i-owoce-morza-jako-zrodlo-bialka">ryby</a> · <a href="ile-bialka-na-dzien">ile białka</a> · <a href="artykuly">artykuły</a>',
    lead: 'Trzy podstawowe mięsa różnią się nie tyle ilością białka, co kaloriami, żelazem i rodzajem tłuszczu.',
    sections: [
        { h2: 'Pierś z kurczaka', p: 'Ok. 21–23 g białka na 100 g i zaledwie ~120 kcal. Chuda, uniwersalna, idealna na redukcji. Udko ma więcej tłuszczu i smaku.' },
        { h2: 'Wołowina', p: '20–26 g białka i więcej kcal (chuda ~130–150). Bogata w żelazo hemowe i witaminę B12. Wybieraj chude kawałki, ograniczaj przetworzoną.' },
        { h2: 'Wieprzowina', p: 'Schab i polędwica są chude (ok. 21 g białka), ale boczek i karkówka — tłuste. Często tańsza, trzeba patrzeć na partie.' }
    ],
    bullets: [
        '<strong>Redukcja:</strong> pierś, chuda wołowina, polędwica.',
        '<strong>Żelazo:</strong> wołowina wygrywa.',
        '<strong>Rotacja:</strong> różne mięsa = różne mikro.',
    ],
    uwaga: 'Przetworzone mięso (kabanosy, parówki, boczek) wiąże się z gorszymi wynikami zdrowotnymi — trzymaj je jako rzadki dodatek.',
    coDalej: 'Zobacz <a href="ryby-i-owoce-morza-jako-zrodlo-bialka">ryby jako białko</a> i <a href="jajka-ile-bialka-i-cholesterol">porównanie z jajkami</a>.'
});
defs.push({
    slug: 'jajka-ile-bialka-i-cholesterol',
    emoji: '🥚',
    title: 'Jajka — ile białka, a co z cholesterolem',
    subtitle: 'Czy cholesterol w jajkach szkodzi, i dlaczego jajko to wzorcowe białko.',
    meta: 'Jajka: zawartość białka, cholesterol z diety i dlaczego jajko to złoty standard aminokwasów.',
    crumb: 'Jajka i cholesterol',
    category: 'bialko',
    relatedHtml: '<a href="kurczak-vs-wolowina-vs-wieprzowina">mięsa</a> · <a href="ile-bialka-na-dzien">ile białka</a> · <a href="artykuly">artykuły</a>',
    lead: 'Jajko zawiera ~6 g białka o niemal idealnym profilu aminokwasowym. A strach przed cholesterolem z jajek okazał się przesadzony.',
    sections: [
        { h2: 'Białko i PDCAAS', p: 'Białko jaja to jeden z najwyżej ocenianych wzorców (PDCAAS = 1,0). Idealna proporcja aminokwasów egzogennych — stąd bywa punktem odniesienia.' },
        { h2: 'Cholesterol z diety', p: 'U większości ludzi cholesterol z jedzenia ma mniejszy wpływ na krew niż tłuszcze nasycone i trans. Jajka nie podnoszą ryzyka sercowego tak, jak sądzono.' },
        { h2: 'Ile jeść', p: '2–3 jajka dziennie są bezpieczne dla zdrowych. Przy problemach z lipidami warto porozmawiać z lekarzem i pilnować całości diety.' }
    ],
    bullets: [
        '<strong>Białko:</strong> 6 g na duże jajko.',
        '<strong>Profil:</strong> wzorcowy dla aminokwasów.',
        '<strong>Bezpiecznie:</strong> 2–3 dziennie u zdrowych.',
    ],
    uwaga: 'Osoby z cukrzycą lub zaburzeniami lipidowymi powinny podejść do liczby jajek indywidualnie — z lekarzem, nie z internetu.',
    coDalej: 'Porównaj <a href="kurczak-vs-wolowina-vs-wieprzowina">mięsa</a> i sprawdź <a href="cena-bialka">koszt jajek za 100 g białka</a>.'
});
defs.push({
    slug: 'ryby-i-owoce-morza-jako-zrodlo-bialka',
    emoji: '🐟',
    title: 'Ryby i owoce morza — białko i omega-3',
    subtitle: 'Ile białka w łososiu, tuńczyku i krewetkach oraz dlaczego jeść ryby dwa razy w tygodniu.',
    meta: 'Ryby i owoce morza: białko, omega-3, rtęć i ile ryb jeść tygodniowo.',
    crumb: 'Ryby i owoce morza',
    category: 'bialko',
    relatedHtml: '<a href="kurczak-vs-wolowina-vs-wieprzowina">mięsa</a> · <a href="omega-3-dha-epa-ile">omega-3</a> · <a href="artykuly">artykuły</a>',
    lead: 'Ryby i owoce morza to nie tylko białko, ale też EPA i DHA — kwasy omega-3, których w polskiej diecie zwykle brakuje.',
    sections: [
        { h2: 'Ile białka', p: 'Łosoś ~20 g/100 g, tuńczyk ~25 g, krewetki ~20–24 g przy bardzo niskiej kaloryczności. Ryby to chude, pełnowartościowe białko.' },
        { h2: 'Omega-3', p: 'Tłuste ryby (łosoś, makrela, śledź) dostarczają EPA i DHA, które wspierają serce, mózg i stan zapalny. Zalecenie to min. 2 porcje ryb tygodniowo.' },
        { h2: 'Na co uważać', p: 'Duże drapieżniki (miecznik, rekin) kumulują rtęć — ograniczaj. Tuńczyk z puszki jedz z umiarem, a łososia i makrelę częściej.' }
    ],
    bullets: [
        '<strong>Cel:</strong> min. 2 porcje tłustych ryb/tydzień.',
        '<strong>Białko:</strong> 20–25 g/100 g u większości.',
        '<strong>Rtęć:</strong> unikaj miecznika i rekina.',
    ],
    uwaga: 'Krewetki i skorupiaki to częsty alergen. Omega-3 możesz brać z suplementu, ale ryby dają przy okazji selen i witaminę D.',
    coDalej: 'Czytaj <a href="omega-3-dha-epa-ile">ile omega-3 potrzebujesz</a> i porównaj <a href="zrodla-bialka-auchan">ryby w Auchan</a>.'
});
defs.push({
    slug: 'budzetowe-zrodla-bialka-taniej-niz-odzywka',
    emoji: '💰',
    title: 'Budżetowe źródła białka — taniej niż odżywka',
    subtitle: 'Twaróg, jaja i strączki: jak domknąć białko za mniej niż suplement.',
    meta: 'Tanie źródła białka: twaróg, jaja, strączki i wątróbka — cena za 100 g białka bez odżywki.',
    crumb: 'Budżetowe źródła białka',
    category: 'bialko',
    relatedHtml: '<a href="cena-bialka">cena białka</a> · <a href="produkty-bialkowe-czy-oplacalne">czy się opłacają</a> · <a href="artykuly">artykuły</a>',
    lead: 'Odżywka jest wygodna, ale w przeliczeniu na 100 g białka często przegrywa z prostymi produktami spożywczymi.',
    sections: [
        { h2: 'Twaróg i jaja', p: 'Chudy twaróg i jaja to zwykle najtańsze pełnowartościowe białko w sklepach. Są syte, tanie i uniwersalne — ciężko o lepszy stosunek ceny do grama.' },
        { h2: 'Strączki', p: 'Ciecierzyca, fasola i soczewica są tanie, choć białko mają mniej skoncentrowane i nieco słabiej przyswajalne. Świetne jako baza tanich posiłków.' },
        { h2: 'Wątróbka i podroby', p: 'Bardzo tanie i bogate w białko, żelazo i B12. Polaryzują smakowo, ale dla budżetowych diet to konkretne wzmocnienie.' }
    ],
    bullets: [
        '<strong>Najtaniej:</strong> twaróg, jaja, śledź.',
        '<strong>Roślinnie:</strong> soczewica, ciecierzyca.',
        '<strong>Odżywka:</strong> jako wygoda, nie ratunek.',
    ],
    uwaga: 'Tanie nie znaczy zawsze chude — pilnuj kalorii w tłustych serach i mięsach. Licz białko na 100 g i 100 kcal, nie „na paczkę”.',
    coDalej: 'Policz <a href="cena-bialka">koszt za 100 g białka</a> i <a href="produkty-bialkowe-czy-oplacalne">czy produkty „protein” się opłacają</a>.'
});

const articles = defs.map(buildArticle);
const out = path.join(__dirname, 'hardcore-articles-batch5.json');
writeFileSync(out, JSON.stringify(articles, null, 2) + '\n');
console.log(`Zapisano ${articles.length} artykułów -> ${out}`);
