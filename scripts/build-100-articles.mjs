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
    {
        slug: 'bialko-roslinne-vs-zwierzece',
        emoji: '🫘',
        title: 'Białko roślinne vs zwierzęce — gdzie naprawdę jest haczyk',
        subtitle: 'Nie chodzi o „gorsze” białko, tylko o profil aminokwasów i ilość. Kombinacja to załatwia.',
        meta: 'Białko roślinne czy zwierzęce: różnice w aminokwasach, przyswajalność, ile białka z fasoli i soczewicy oraz jak łączyć rośliny, by mieć pełny profil.',
        category: 'bialko',
        lead: 'Białko zwierzęce ma komplet aminokwasów, roślinne często brakuje jednego (np. lizyny w zbożach). To nie znaczy „gorsze” — trzeba tylko mądrze łączyć i jeść go trochę więcej.',
        sections: [
            { h2: 'Profil aminokwasów', p: 'Mięso, jaja i nabiał są kompletne. Zboża mają mało lizyny, strączki mało metioniny — stąd duet ryż + fasola, który daje pełen zestaw.' },
            { h2: 'Ile trzeba zjeść', p: 'Przyswajalność białka roślinnego jest niższa, więc celuj w górę zakresu: 1,8–2,2 g/kg, jeśli budujesz masę na roślinach.' },
            { h2: 'Najlepsze źródła', p: 'Soja, tofu, tempeh, soczewica, ciecierzyca, seitan, groch. Mieszanka strączków ze zbożem w ciągu dnia wystarcza — nie musi być w jednym posiłku.' }
        ],
        bullets: ['<strong>Łącz strączki ze zbożem</strong> — ryż, kasza, chleb.', '<strong>Celuj 1,8–2,2 g/kg</strong> — zapas na przyswajalność.', '<strong>Soja to nie wróg</strong> — pełne białko roślinne.'],
        uwaga: 'Na diecie stricte roślinnej dopilnuj B12 (suplement) i sprawdź żelazo — to częstsze braki niż białko.',
        coDalej: 'Zobacz <a href="wegetarianskie-zrodla-bialka">wegetariańskie źródła białka</a> i <a href="witamina-b12-dieta-roslinna">witaminę B12</a>.'
    },
    {
        slug: 'twarog-poltlusty-czy-chudy',
        emoji: '🧀',
        title: 'Twaróg półtłusty czy chudy — 5 g różnicy, 40 kcal',
        subtitle: 'Różnica w białku jest symboliczna, w kaloriach realna. Który wybrać? Zależy od celu.',
        meta: 'Twaróg chudy czy półtłusty — ile białka, tłuszczu i kalorii naprawdę różni te dwa sery i który lepszy na redukcji, a który na masie.',
        category: 'bialko',
        lead: 'Twaróg chudy ma ~18 g białka i ~1 g tłuszczu, półtłusty ~17 g białka i ~4,5 g tłuszczu na 100 g. Białko prawie to samo, kalorie różnią się o ~40 na 100 g.',
        sections: [
            { h2: 'Na redukcji', p: 'Wybierz chudy — dostajesz więcej białka za mniej kalorii, a sytość jest podobna. Różnica 40 kcal na 100 g robi się, gdy jesz 200–300 g dziennie.' },
            { h2: 'Na masie', p: 'Półtłusty daje łatwiej domknąć kalorie i ma lepszy smak. Tłuszcz mleczny to nie „zło” — przy nadwyżce kalorycznej to plus.' },
            { h2: 'Czy chudy jest „gorszy”', p: 'Nie. Chudszy twaróg ma trochę mniej witamin rozpuszczalnych w tłuszczu, ale przy normalnej diecie to bez znaczenia.' }
        ],
        bullets: ['<strong>Redukcja</strong> — chudy, więcej białka za mniej kcal.', '<strong>Masa</strong> — półtłusty, łatwiej dobić kalorie.', '<strong>Oba ok.</strong> — różnica jest mała.'],
        uwaga: 'Twarogi „klinek”, „grani” i sernikowe bywają dosładzane — sprawdzaj etykietę, bo tam kalorie potrafią się podwoić.',
        coDalej: 'Sprawdź <a href="najtansze-zrodla-bialka-w-polsce">najtańsze źródła białka</a> i <a href="cena-bialka">cenę za 100 g białka</a>.'
    },
    {
        slug: 'czy-bialko-obciaza-nerki',
        emoji: '🫀',
        title: 'Czy białko „zapycha” nerki zdrowym ludziom?',
        subtitle: 'Mit powtarzany od dekad. U zdrowych nerek wysokie białko nie szkodzi — u chorych to inna historia.',
        meta: 'Czy dużo białka szkodzi nerkom? Co mówią badania u zdrowych osób, kiedy białko jest ryzykowne i ile gramów na kg jest bezpieczne.',
        category: 'bialko',
        lead: 'U zdrowych osób dieta wysokobiałkowa (nawet 2–3 g/kg) nie uszkadza nerek. Ryzyko dotyczy osób z już istniejącą chorobą nerek — a to duża różnica.',
        sections: [
            { h2: 'Skąd ten mit', p: 'Wysokie białko podnosi filtrację nerek (GFR), bo więcej jest do przefiltrowania. Kiedyś mylono to ze „zużywaniem” nerek. Dziś wiemy, że to normalna adaptacja.' },
            { h2: 'Kiedy uważać', p: 'Przy przewlekłej chorobie nerek (CKD), kamicy, dnie moczanowej czy cukrzycy białko trzeba ograniczać i ustalać z lekarzem.' },
            { h2: 'Praktycznie', p: 'Dla zdrowej, aktywnej osoby 1,6–2,2 g/kg jest bezpieczne. Pij wodę — odwodnienie obciąża nerki bardziej niż samo białko.' }
        ],
        bullets: ['<strong>Zdrowy + trenujący</strong> — 1,6–2,2 g/kg bez obaw.', '<strong>Chore nerki</strong> — białko tylko wg lekarza.', '<strong>Woda</strong> — nawodnienie ważniejsze od gramów.'],
        uwaga: 'Jeśli masz wyniki kreatyniny/eGFR poza normą albo kamicę — nie zwiększaj białka na własną rękę.',
        coDalej: 'Zobacz <a href="ile-bialka-na-dzien">ile białka dziennie</a> i <a href="czy-mozna-przedawkowac-bialko">czy da się przedawkować białko</a>.'
    },
    {
        slug: 'bialko-na-sniadanie-jajka-czy-platki',
        emoji: '🥣',
        title: 'Białko na śniadanie — dlaczego jajka biją płatki',
        subtitle: 'Płatki z mlekiem to ~10 g białka, jajecznica z 3 jaj ~19 g. Sytość wygrywa z porannym cukrem.',
        meta: 'Śniadanie białkowe — porównanie jajek i płatków z mlekiem: ile białka, cukru i sytości daje każde z nich i co wybrać na redukcji.',
        category: 'bialko',
        lead: 'Miska płatków z mlekiem to ~10 g białka i sporo szybkich węglowodanów. Jajecznica z 3 jaj + twaróg to ~30 g białka i sytość na kilka godzin.',
        sections: [
            { h2: 'Ile białka naprawdę dają', p: 'Płatki owsiane (50 g) + mleko (250 ml) = ~13 g białka. 3 jajka + 100 g twarogu = ~35 g. Różnica 3× przy podobnej kaloryczności.' },
            { h2: 'Sytość a cukier', p: 'Węglowodany z płatków szybko podnoszą glukozę, potem przychodzi głód. Białko i tłuszcz z jajek trzymają poziom energii dłużej.' },
            { h2: 'Co robić', p: 'Nie musisz rezygnować z płatków — dodaj do nich twaróg, jogurt naturalny albo jajko, żeby domknąć białko i spłaszczyć skok cukru.' }
        ],
        bullets: ['<strong>Jajka + twaróg</strong> — najprostsze białkowe śniadanie.', '<strong>Płatki</strong> — ok, ale dorzuć białko.', '<strong>30 g białka rano</strong> — dobry cel na start dnia.'],
        uwaga: '„Fit” granole i musli bywają słodsze niż wyglądają — 100 g potrafi mieć 20+ g cukru.',
        coDalej: 'Zobacz <a href="ile-bialka-na-dzien">ile białka dziennie</a> i <a href="granola-zdrowe-sniadanie-ile-cukru">ile cukru ma granola</a>.'
    },
    {
        slug: 'tunczyk-w-oleju-czy-wodzie',
        emoji: '🐟',
        title: 'Tuńczyk w oleju czy w wodzie — przelicznik bez emocji',
        subtitle: 'Olej dokłada ~150 kcal do puszki. Białko to samo. Na redukcji woda wygrywa, na masie olej nie szkodzi.',
        meta: 'Tuńczyk w oleju czy w wodzie — ile białka, kalorii i tłuszczu naprawdę różni te puszki i którą wybrać na redukcji i na masie.',
        category: 'bialko',
        lead: 'Obie puszki mają ~24 g białka na 100 g. Różnica to tłuszcz: wersja w oleju to ~10 g tłuszczu i ~190 kcal, w wodzie ~1 g i ~100 kcal.',
        sections: [
            { h2: 'Skąd bierze się różnica', p: 'Białko tuńczyka jest identyczne. Kalorie dokłada olej — i to nawet 90 kcal na 100 g, czyli ~150 kcal na całą puszkę.' },
            { h2: 'Na redukcji', p: 'Wybieraj w wodzie/sosie własnym. To najtańszy sposób, żeby zjeść 30 g białka za ~120 kcal.' },
            { h2: 'Na masie', p: 'W oleju daje więcej kalorii bez objętości — wygodne, gdy masz problem z dobiciem nadwyżki. Odlej część oleju, jeśli nie chcesz aż tyle.' }
        ],
        bullets: ['<strong>Redukcja</strong> — w wodzie, ~120 kcal/puszka.', '<strong>Masa</strong> — w oleju, więcej energii bez objętości.', '<strong>Białko zawsze to samo</strong> — ~24 g/100 g.'],
        uwaga: 'Tuńczyk kumuluje rtęć — 2–3 puszki tygodniowo to bezpieczny limit, codzienne puszki już nie.',
        coDalej: 'Sprawdź <a href="konserwa-rybna-bialko-za-grosze">konserwy rybne</a> i <a href="bialko-maxxing">ranking białko maxxing</a>.'
    },
    {
        slug: 'ser-zolty-jako-zrodlo-bialka',
        emoji: '🧀',
        title: 'Ser żółty jako źródło białka — kiedy ma sens',
        subtitle: 'Ser daje ~25 g białka, ale i ~30 g tłuszczu na 100 g. To białko premium — liczone z głową.',
        meta: 'Czy ser żółty to dobre źródło białka? Ile białka i tłuszczu ma gouda, kiedy ser na diecie ma sens i ile go jeść.',
        category: 'bialko',
        lead: 'Ser żółty to ~25 g białka na 100 g, ale obok idzie ~30 g tłuszczu i ~400 kcal. Jako źródło białka jest drogi — cenowo i kalorycznie.',
        sections: [
            { h2: 'Profil', p: 'Białko sera jest kompletne i dobrze przyswajalne. Problem w gęstości kalorycznej — 100 g sera to tyle kcal, co 300 g piersi z kurczaka.' },
            { h2: 'Kiedy ma sens', p: 'Na masie, jako dodatek smakowy, i w małych ilościach. Jako główne źródło białka na redukcji — nie, bo kalorie i tłuszcz uciekają.' },
            { h2: 'Jaki wybierać', p: 'Twardsze, dojrzewające sery mają więcej białka na 100 g. Unikaj „serów” topionych i „produktów seropodobnych” — tam bywa mniej białka i więcej dodatków.' }
        ],
        bullets: ['<strong>Na masie</strong> — świetny dodatek kaloryczny.', '<strong>Na redukcji</strong> — małe ilości, smak, nie baza.', '<strong>~25 g białka/100 g</strong> — ale z ~30 g tłuszczu.'],
        uwaga: 'Ser to sporo soli i tłuszczów nasyconych — codziennie w dużych ilościach podbija kalorie i sód.',
        coDalej: 'Zobacz <a href="najtansze-zrodla-bialka-w-polsce">najtańsze źródła białka</a> i <a href="cena-bialka">cenę za 100 g białka</a>.'
    },
    {
        slug: 'skyr-grecki-czy-zwykly',
        emoji: '🥛',
        title: 'Skyr, grecki czy zwykły jogurt — gramy za złotówkę',
        subtitle: 'Skyr ma ~11 g białka, grecki ~9 g, zwykły ~4 g na 100 g. Cena potrafi wszystko odwrócić.',
        meta: 'Skyr vs jogurt grecki vs zwykły — ile białka, kalorii i ile kosztują za 100 g białka, żeby wybrać najlepszy nabiał na diecie.',
        category: 'bialko',
        lead: 'Skyr to zagęszczony jogurt islandzki — ~11 g białka na 100 g. Grecki ma ~9 g, zwykły ~4 g. Ale decyduje też cena za gram białka.',
        sections: [
            { h2: 'Białko na 100 g', p: 'Skyr 10–11 g, grecki 8–10 g, zwykły 3–5 g. Skyr wygrywa gęstością — to prawie twaróg w płynie.' },
            { h2: 'Cena za 100 g białka', p: 'Skyr bywa drogi; grecki z Lidla/Biedronki często wychodzi taniej. Licz złotówki za gram białka, nie cenę kubka.' },
            { h2: 'Kiedy który', p: 'Na redukcji — skyr lub grecki naturalny. Zwykły jogurt to raczej baza pod smoothie, nie główne białko.' }
        ],
        bullets: ['<strong>Skyr</strong> — najwięcej białka na 100 g.', '<strong>Grecki</strong> — najlepszy stosunek ceny do białka.', '<strong>Zwykły</strong> — dodatek, nie baza.'],
        uwaga: 'Kupuj naturalne, nie „owocowe” — dosładzane wersje mają 2–3× więcej cukru i mniej białka na 100 g.',
        coDalej: 'Zobacz <a href="najtansze-zrodla-bialka-w-polsce">najtańsze źródła białka</a> i <a href="produkty-bialkowe-czy-oplacalne">czy produkty białkowe się opłacają</a>.'
    },
    {
        slug: 'losos-wedzony-ile-bialka',
        emoji: '🐟',
        title: 'Łosoś wędzony na kanapce — ile białka realnie zjadasz',
        subtitle: 'Łosoś to ~20 g białka, ale też ~13 g tłuszczu i sporo soli. Dwie plastry to nie „pół paczki”.',
        meta: 'Ile białka ma łosoś wędzony — wartości na plaster, kanapkę i 100 g, ile omega-3 i dlaczego sól w łososiu bywa ukrytym problemem.',
        category: 'bialko',
        lead: 'Łosoś wędzony ma ~20 g białka i ~13 g tłuszczu na 100 g. Dwa plastry (ok. 40 g) to ledwie ~8 g białka — smaczny dodatek, nie podstawa.',
        sections: [
            { h2: 'Ile na kanapce', p: 'Typowa kanapka z 2 plastrami łososia daje ~8 g białka. Żeby wyciągnąć 30 g, musiałbyś zjeść 150 g — pół paczki i ~500 mg sodu ekstra.' },
            { h2: 'Omega-3', p: 'Łosoś to świetne źródło EPA/DHA. Dwie porcje ryby tygodniowo realnie domykają omega-3 — wędzony się do tego liczy.' },
            { h2: 'Czy to „dobre” białko', p: 'Tak, kompletne. Ale do bazy białkowej lepsze są tańsze i mniej słone źródła: filet łososia, dorsz, tuńczyk w wodzie.' }
        ],
        bullets: ['<strong>2 plastry ≈ 8 g białka</strong> — dodatek, nie posiłek.', '<strong>Omega-3</strong> — duży plus ryby.', '<strong>Uważaj na sól</strong> — wędzony ma jej sporo.'],
        uwaga: 'Wędzony łosoś bywa dosładzany i mocno solony; przy nadciśnieniu wybieraj filet pieczony zamiast wędzonego.',
        coDalej: 'Sprawdź <a href="omega-3-ryba-czy-kapsulka">omega-3 z ryby czy suplementu</a> i <a href="bialko-maxxing">ranking białko maxxing</a>.'
    },
    {
        slug: 'proszek-bialkowy-jak-czytac-etykiete',
        emoji: '🏷️',
        title: 'Proszek białkowy z promocji — jak czytać etykietę',
        subtitle: 'Patrz na białko na 100 g, aminogram i cukier — nie na wielkość opakowania ani „gainer” na froncie.',
        meta: 'Jak wybrać odżywkę białkową — na co patrzeć na etykiecie: białko na 100 g, aminogram, cukier, smaki. Unikaj fake gainerów.',
        category: 'bialko',
        lead: 'Dobry proszek to 75–85 g białka na 100 g i krótka lista składników. „Białko” z 30 g na 100 g to często gainer albo cukier w przebraniu.',
        sections: [
            { h2: 'Białko na 100 g', p: 'WPC/WPI mają 75–90 g białka na 100 g. Jeśli na etykiecie widzisz 30–50 g, reszta to węglowodany i tłuszcz — nie przepłacaj.' },
            { h2: 'Aminogram i BCAA', p: 'Sprawdzaj zawartość leucyny (najlepiej ~2,5 g na porcję). Tanie proszki czasem „dobiłe” dodają tanie aminokwasy zamiast pełnego białka.' },
            { h2: 'Cukier i dodatki', p: 'Unikaj proszków z syropem glukozowym na czele składu. Smak nie powinien kosztować 10 g cukru na porcję.' }
        ],
        bullets: ['<strong>75+ g białka/100 g</strong> — punkt startowy.', '<strong>Leucyna ~2,5 g/porcję</strong> — ważniejsza niż „BCAA” na froncie.', '<strong>Krótki skład</strong> — mniej marketingu, więcej białka.'],
        uwaga: '„Aminokwasy dodane” i „kompleks” na etykiecie często maskują niską zawartość prawdziwego białka — licz gramy, nie slogany.',
        coDalej: 'Zobacz <a href="kreatyna-kofeina-bialko-co-warto">co naprawdę warto suplementować</a> i <a href="produkty-bialkowe-czy-oplacalne">czy odżywki się opłacają</a>.'
    },
    {
        slug: 'batonek-proteinowy-ile-bialka',
        emoji: '🍫',
        title: 'Ile białka naprawdę ma „batonek proteinowy” z kasy',
        subtitle: 'Batonek „proteinowy” z supermarketu ma 10–15 g białka i tyle samo cukru. To raczej baton niż białko.',
        meta: 'Ile białka ma baton proteinowy — batonik ze sklepu vs prawdziwy protein bar: białko, cukier, kalorie i czy warto za niego płacić.',
        category: 'bialko',
        lead: 'Tani „batonek proteinowy” z kasy ma zwykle 10–15 g białka i 15–20 g cukru. Prawdziwy protein bar (20+ g białka, <3 g cukru) to inna kategoria.',
        sections: [
            { h2: 'Dwa światy batonów', p: 'Baton „z dodatkiem białka” to słodycz z odrobiną białka. Protein bar to ~20 g białka, mało cukru i słodziki. Czytaj, który trzymasz.' },
            { h2: 'Cukier a białko', p: 'Jeśli batonek ma więcej gramów cukru niż białka, to deser. Nie budujesz na nim diety — traktujesz jak słodycz z premią.' },
            { h2: 'Kiedy ma sens', p: 'Jako awaryjna przekąska w podróży albo kontrolowany deser. Jako codzienne „białko” — przepłacasz i jesz cukier.' }
        ],
        bullets: ['<strong>20+ g białka, <3 g cukru</strong> — to dopiero protein bar.', '<strong>Cukier > białko</strong> — to zwykły baton.', '<strong>Przekąska awaryjna</strong> — ok, nie baza.'],
        uwaga: '„Fit”, „protein”, „bez cukru” na froncie nic nie znaczą — obróć opakowanie i przeczytaj tabelę.',
        coDalej: 'Zobacz <a href="batony-fit-jak-czytac-etykiety">jak czytać etykiety batonów fit</a> i <a href="produkty-bialkowe-czy-oplacalne">czy produkty białkowe się opłacają</a>.'
    },
    {
        slug: 'bialko-a-wlosy-paznokcie',
        emoji: '💇',
        title: 'Białko a włosy i paznokcie — co jest mitem',
        subtitle: 'Włosy i paznokcie to keratyna = białko. Ale jedzenie go w nadmiarze nie sprawi, że urosną szybciej.',
        meta: 'Czy białko wpływa na włosy i paznokcie — rola keratyny, kiedy niedobór białka niszczy włosy i ile białka naprawdę trzeba jeść.',
        category: 'bialko',
        lead: 'Włosy i paznokcie są z keratyny, czyli z białka. Ale organizm nie wysyła „nadwyżki” białka do paznokci — one rosną we własnym tempie.',
        sections: [
            { h2: 'Kiedy białko ma znaczenie', p: 'Przy realnym niedoborze (poniżej ~0,8 g/kg) włosy robią się łamliwe i wypadają. To sygnał, że jesz za mało — nie powód, żeby brać „keratynę w tabletkach”.' },
            { h2: 'Co naprawdę pomaga', p: 'Normalna podaż białka, żelazo, cynk i biotyna. Niedobory mikroelementów psują włosy częściej niż brak samego białka.' },
            { h2: 'Suplementy „na włosy”', p: 'Kapsułki z keratyną i kolagenem mają zerowe dowody na porost włosów. Zjedz normalny obiad z białkiem i sprawdź żelazo.' }
        ],
        bullets: ['<strong>Minimum 0,8 g/kg</strong> — poniżej zaczynają się problemy.', '<strong>Żelazo i cynk</strong> — częstsze winy niż białko.', '<strong>Suplementy keratynowe</strong> — strata pieniędzy.'],
        uwaga: 'Nagłe wypadanie włosów po diecie to często efekt zbyt niskich kalorii i braków — nie „za mało kolagenu”.',
        coDalej: 'Zobacz <a href="zelazo-u-trenujacych-kobiet">żelazo u trenujących</a> i <a href="ile-bialka-na-dzien">ile białka dziennie</a>.'
    },
    {
        slug: 'roslinny-kurczak-czy-dogania-mieso',
        emoji: '🌱',
        title: 'Roślinny „kurczak” — czy dogania mięso w białku',
        subtitle: 'Roślinne zamienniki mają 15–25 g białka, ale to przetworzony produkt. Sprawdź, co jesz zamiast kurczaka.',
        meta: 'Roślinne zamienniki kurczaka — ile białka, kalorii i składników mają roślinne kotlety, czy doganiają mięso i czy są zdrowsze.',
        category: 'bialko',
        lead: 'Roślinny „kurczak” z grochu i soi ma zwykle 15–25 g białka na 100 g — tyle co mięso. Ale to mocno przetworzony produkt z długą listą składników.',
        sections: [
            { h2: 'Białko', p: 'Kotlety z teksturowanego białka grochu/soi potrafią mieć 20+ g białka na 100 g. Pod tym kątem realnie doganiają pierś z kurczaka.' },
            { h2: 'Co w składzie', p: 'Obok białka: oleje, zagęszczacze, aromaty, sporo soli. To nie „zdrowsza” wersja z automatu — to wybór etyczny/roślinny, nie dietetyczny cud.' },
            { h2: 'Warto?', p: 'Jeśli jesz roślinne — tak, to wygodne białko. Jeśli liczysz kalorie i skład, tofu i tempeh są mniej przetworzone i zwykle tańsze.' }
        ],
        bullets: ['<strong>15–25 g białka/100 g</strong> — realnie jak mięso.', '<strong>Długa lista składników</strong> — to przetworzony produkt.', '<strong>Tofu/tempeh</strong> — czystsze opcje roślinne.'],
        uwaga: 'Nie zakładaj, że roślinne = mniej kalorii — panierowane kotlety roślinne potrafią mieć tyle kcal, co schabowy.',
        coDalej: 'Zobacz <a href="bialko-roslinne-vs-zwierzece">białko roślinne vs zwierzęce</a> i <a href="wegetarianskie-zrodla-bialka">wegetariańskie źródła białka</a>.'
    },
    {
        slug: 'ryz-z-fasola-czemu-razem',
        emoji: '🍚',
        title: 'Ryż z fasolą — dlaczego razem, a nie osobno',
        subtitle: 'Osobno mają „dziury” w aminokwasach, razem tworzą komplet. To najtańszy pełnowartościowy posiłek roślinny.',
        meta: 'Dlaczego ryż z fasolą to pełne białko — aminokwasy lizyna i metionina, jak łączyć zboża ze strączkami i ile białka daje ta para.',
        category: 'bialko',
        lead: 'Zboża mają mało lizyny, strączki mało metioniny. Ryż uzupełnia fasolę i odwrotnie — razem dają komplet aminokwasów jak mięso.',
        sections: [
            { h2: 'Aminokwasy uzupełniające', p: 'Lizyna ze strączków i metionina ze zbóż składają się w pełny profil. Nie musisz jeść ich w tym samym posiłku — wystarczy ten sam dzień.' },
            { h2: 'Ile białka daje', p: 'Porcja: 100 g ryżu (suchego) + 100 g fasoli to ~20 g białka. To baza, do której dokładasz warzywa i tłuszcz.' },
            { h2: 'Czemu to tanie', p: 'Ryż i sucha fasola to jedne z najtańszych kalorii i białka w sklepie. Meal prep na cały tydzień za kilkanaście złotych.' }
        ],
        bullets: ['<strong>Ryż + strączki</strong> — komplet aminokwasów.', '<strong>~20 g białka</strong> — za porcję duetu.', '<strong>Ten sam dzień</strong> — nie musi być jeden talerz.'],
        uwaga: 'Suchą fasolę mocz i gotuj porządnie — niedogotowane strączki mają lektyny, które podrażniają żołądek.',
        coDalej: 'Zobacz <a href="bialko-roslinne-vs-zwierzece">białko roślinne vs zwierzęce</a> i <a href="wegetarianskie-zrodla-bialka">wegetariańskie źródła białka</a>.'
    },
    {
        slug: 'czy-mozna-przedawkowac-bialko',
        emoji: '⚠️',
        title: 'Czy można przedawkować białko z jedzenia',
        subtitle: 'Z normalnego jedzenia — praktycznie nie. Z proszku łychą na godzinę — to już inna rozmowa.',
        meta: 'Czy można przedawkować białko — ile g/kg to za dużo, objawy nadmiaru białka i kiedy suplementacja robi się ryzykowna.',
        category: 'bialko',
        lead: 'Przedawkować białko z jedzenia jest naprawdę trudno — musiałbyś zjeść absurdalne ilości mięsa. Realne ryzyko to nadmiar kalorii, nie białka.',
        sections: [
            { h2: 'Ile to za dużo', p: 'Powyżej ~3,5–4 g/kg u zdrowych osób pojawiają się problemy trawienne i obciążenie nerek. To ponad 250 g białka dla 70 kg — trudne do zjedzenia.' },
            { h2: 'Co się dzieje przy nadmiarze', p: 'Białko nie zamienia się w mięśnie — nadwyżka idzie w energię albo tłuszcz. Plus odwodnienie i obciążenie przewodu pokarmowego.' },
            { h2: 'Kiedy uważać', p: 'Przy chorej nerce/wątrobie i przy ekstremalnym dokładaniu proszku do wszystkiego. Normalna dieta 1,6–2,2 g/kg jest całkowicie bezpieczna.' }
        ],
        bullets: ['<strong>1,6–2,2 g/kg</strong> — strefa bezpieczna i skuteczna.', '<strong>3,5+ g/kg</strong> — zaczynają się problemy.', '<strong>Więcej ≠ więcej mięśni</strong> — nadwyżka to tłuszcz.'],
        uwaga: 'Proszek „łyżka do wszystkiego” potrafi zsumować się w 3+ g/kg — licz łączną podaż, nie tylko posiłki stałe.',
        coDalej: 'Zobacz <a href="czy-bialko-obciaza-nerki">czy białko obciąża nerki</a> i <a href="ile-bialka-na-dzien">ile białka dziennie</a>.'
    },
    {
        slug: 'bialko-w-platkach-owsianych',
        emoji: '🥣',
        title: 'Białko w płatkach owsianych — ile go naprawdę jest',
        subtitle: 'Płatki owsiane to ~13 g białka na 100 g. To więcej niż myślisz, ale to wciąż głównie węglowodany.',
        meta: 'Ile białka mają płatki owsiane — wartość na 100 g i porcję, jak podbić białko w owsiance i czy owies to dobre źródło białka.',
        category: 'bialko',
        lead: 'Płatki owsiane mają ~13 g białka na 100 g — więcej niż ryż czy pieczywo. Ale porcja owsianki to nadal głównie węglowodany.',
        sections: [
            { h2: 'Białko w 100 g', p: '13 g to solidnie jak na zboże (dla porównania ryż ~7 g). Ale 100 g płatków to też ~66 g węglowodanów i ~380 kcal.' },
            { h2: 'Jak podbić białko', p: 'Owsianka na mleku + jogurt/twaróg + łyżka masła orzechowego to już ~30 g białka w jednej misce. Same płatki to za mało.' },
            { h2: 'Czy owies buduje mięśnie', p: 'Nie sam. Białko owsa nie ma pełnego profilu (mało lizyny), więc traktuj je jako dodatek, nie główne źródło.' }
        ],
        bullets: ['<strong>13 g białka/100 g</strong> — dużo jak na zboże.', '<strong>Owsianka + nabiał</strong> — dobić do ~30 g białka.', '<strong>Nie jest kompletne</strong> — dokładaj nabiał/soję.'],
        uwaga: 'Płatki „błyskawiczne” mają wyższy indeks glikemiczny — zwykłe górskie trzymają sytość dłużej.',
        coDalej: 'Zobacz <a href="bialko-na-sniadanie-jajka-czy-platki">jajka czy płatki na śniadanie</a> i <a href="ile-bialka-na-dzien">ile białka dziennie</a>.'
    },
    {
        slug: 'najtansze-zrodla-bialka-w-polsce',
        emoji: '💸',
        title: 'Najtańsze źródła białka w polskich sklepach',
        subtitle: 'Twaróg, jaja, pierś z kurczaka i sucha fasola — ranking ceny za 100 g białka, nie za opakowanie.',
        meta: 'Najtańsze źródła białka w Polsce — twaróg, jaja, kurczak, tuńczyk i strączki: cena za 100 g białka i który wybór daje najwięcej za złotówkę.',
        category: 'bialko',
        lead: 'Cena za opakowanie kłamie — liczy się cena za 100 g białka. Twaróg chudy, jaja i sucha fasola regularnie wygrywają z „proteinową” półką.',
        sections: [
            { h2: 'Ranking na oko', p: 'Sucha fasola/soczewica: ~2–4 zł za 100 g białka. Jaja: ~5–7 zł. Twaróg chudy: ~6–9 zł. Pierś z kurczaka: ~8–12 zł. Odżywka WPC: ~10–15 zł.' },
            { h2: 'Dlaczego nie batony', p: 'Batony i puddingi proteinowe kosztują 30–60 zł za 100 g białka — 5× drożej niż twaróg. Płacisz za wygodę, nie za białko.' },
            { h2: 'Jak liczyć', p: 'Weź cenę, podziel przez (białko na 100 g × liczba 100-gramowych porcji w opakowaniu). Prosty wzór, który obnaża marketing.' }
        ],
        bullets: ['<strong>Twaróg + jaja + strączki</strong> — tanie podstawy.', '<strong>Batony proteinowe</strong> — najdroższe białko na rynku.', '<strong>Licz zł za 100 g białka</strong> — nie za kubek.'],
        uwaga: 'Najtańsze nie znaczy najgorsze — twaróg i jaja mają pełny profil aminokwasów, a batony często nie.',
        coDalej: 'Sprawdź <a href="cena-bialka">ranking cena za 100 g białka</a> i <a href="twarog-poltlusty-czy-chudy">twaróg chudy czy półtłusty</a>.'
    },
    {
        slug: 'konserwa-rybna-bialko-za-grosze',
        emoji: '🥫',
        title: 'Konserwy rybne — białko za grosze i na co uważać',
        subtitle: 'Szprot, makrela i sardynka to tanie białko z omega-3. Ale sól i olej potrafią zepsuć rachunek.',
        meta: 'Konserwy rybne jako źródło białka — szprot, makrela, sardynka i tuńczyk: ile białka, omega-3, ile soli i którą puszkę wybrać.',
        category: 'bialko',
        lead: 'Szprot w pomidorach to ~18 g białka i solidna dawka omega-3 za 5–7 zł. Jedna z najlepszych „tanich” opcji — jeśli patrzysz na sól.',
        sections: [
            { h2: 'Ile białka', p: 'Szprot ~18 g, makrela ~19 g, sardynki ~24 g na 100 g. Podobnie jak tuńczyk, ale z dodatkiem zdrowych tłuszczów i wapnia (ości!).' },
            { h2: 'Sól i olej', p: 'Wersje w oleju mają więcej kalorii, w sosie pomidorowym zwykle mniej tłuszczu. Sól potrafi dobić do 1–2 g na puszkę — przy nadciśnieniu wybieraj te o niższej zawartości.' },
            { h2: 'Jak jeść', p: 'Na kanapce, z ryżem albo prosto z puszki jako awaryjne białko w pracy. Dwa razy w tygodniu w pełni wystarczy na omega-3.' }
        ],
        bullets: ['<strong>18–24 g białka/100 g</strong> — tanie i sycące.', '<strong>Omega-3 + wapń</strong> — bonus, którego nie ma w mięsie.', '<strong>Sprawdzaj sól</strong> — ona jest tu głównym ryzykiem.'],
        uwaga: 'Ryby wędzone i konserwowe bywają bardzo słone — jeśli masz nadciśnienie, odsącz zalewę i nie dolewaj soli.',
        coDalej: 'Zobacz <a href="tunczyk-w-oleju-czy-wodzie">tuńczyk w oleju czy wodzie</a> i <a href="omega-3-ryba-czy-kapsulka">omega-3 z ryby czy kapsułki</a>.'
    },
    {
        slug: 'blonnik-a-sytosc',
        emoji: '🌾',
        title: 'Błonnik — dlaczego syci, a nie tuczy',
        subtitle: 'Błonnik pęcznieje w żołądku, spowalnia trawienie i prawie nie daje kalorii. To twoja broń na głód.',
        meta: 'Błonnik a sytość — jak działa, ile gramów dziennie jeść, najlepsze źródła i dlaczego błonnik pomaga jeść mniej bez uczucia głodu.',
        category: 'odzywianie',
        lead: 'Błonnik nie jest trawiony, ale pęcznieje w żołądku i spowalnia opróżnianie — czujesz się pełny dłużej, a kalorii dostajesz mniej.',
        sections: [
            { h2: 'Jak działa', p: 'Rozpuszczalny błonnik tworzy żel, który spowalnia wchłanianie cukru; nierozpuszczalny dodaje objętości i „czyści” jelita. Oba dają sytość.' },
            { h2: 'Ile jeść', p: 'Celuj w 25–35 g dziennie. Większość Polaków je ~18 g. Dodawaj po trochu, bo nagły skok daje wzdęcia.' },
            { h2: 'Gdzie go szukać', p: 'Strączki, pełne ziarna, płatki owsiane, siemię, warzywa i owoce ze skórką. Biały chleb i sok mają go prawie zero.' }
        ],
        bullets: ['<strong>25–35 g dziennie</strong> — cel większości ludzi.', '<strong>Strączki + pełne ziarna</strong> — najwięcej błonnika.', '<strong>Dodawaj stopniowo</strong> — inaczej wzdęcia.'],
        uwaga: 'Więcej błonnika wymaga więcej wody — bez nawodnienia zaparcia się nasilą, zamiast ustąpić.',
        coDalej: 'Zobacz <a href="volume-eating-jak-jesc-duzo-i-chudnac">volume eating</a> i <a href="blonnik-z-siemienia">błonnik z siemienia lnianego</a>.'
    },
    {
        slug: 'oliwa-czy-maslo',
        emoji: '🫒',
        title: 'Oliwa czy masło — co do czego na patelni',
        subtitle: 'Oba to ~90% tłuszczu. Różnią się składem kwasów i punktem dymienia — a nie „zdrowością” na oko.',
        meta: 'Oliwa czy masło — który tłuszcz do smażenia i na zimno: kwasy tłuszczowe, punkt dymienia, kalorie i co wybrać na diecie.',
        category: 'odzywianie',
        lead: 'Oliwa i masło mają niemal identyczną kaloryczność (~900 kcal/100 g). Różnica to profil tłuszczów: oliwa to głównie jednonienasycone, masło — nasycone.',
        sections: [
            { h2: 'Skład kwasów', p: 'Oliwa to ~73% jednonienasyconych (zdrowe dla serca). Masło to ~63% nasyconych. Na co dzień oliwa wygrywa profilem.' },
            { h2: 'Smażenie', p: 'Masło ma niski punkt dymienia i przypala się szybciej. Do smażenia lepsza oliwa (zwłaszcza rafinowana) albo masło klarowane.' },
            { h2: 'Kalorie', p: '1 łyżka oliwy = 1 łyżka masła = ~120 kcal. Na redukcji oba licz — łatwo wlać 300 kcal „na oko”.' }
        ],
        bullets: ['<strong>Na zimno</strong> — oliwa extra virgin.', '<strong>Do smażenia</strong> — oliwa lub masło klarowane.', '<strong>1 łyżka ≈ 120 kcal</strong> — mierz, nie lej.'],
        uwaga: '„Lekkie” oliwy i masła roślinne mają tyle samo kalorii — nazwa to marketing, nie mniej energii.',
        coDalej: 'Zobacz <a href="tluszcze-nasycone-czy-nienasycone">tłuszcze nasycone vs nienasycone</a> i <a href="kalorie-na-oko-dlaczego-sie-mylisz">kalorie na oko</a>.'
    },
    {
        slug: 'witamina-d-zima',
        emoji: '☀️',
        title: 'Witamina D zimą — czy suplement to konieczność',
        subtitle: 'Między październikiem a marcem słońce w Polsce nie wystarcza. U większości ludzi D3 warto brać.',
        meta: 'Witamina D zimą — dlaczego w Polsce jej brakuje, ile IU dziennie brać, z czym łączyć i czy badać poziom przed suplementacją.',
        category: 'odzywianie',
        lead: 'Od października do marca kąt padania słońca jest zbyt niski, by skóra produkowała witaminę D. W polskich warunkach suplementacja to norma, nie fanaberia.',
        sections: [
            { h2: 'Dlaczego brakuje', p: 'Witamina D powstaje w skórze pod wpływem UVB. Zimą UVB praktycznie nie dociera — stąd powszechne niedobory nawet u zdrowych osób.' },
            { h2: 'Ile brać', p: 'Dla dorosłych typowo 1000–2000 IU dziennie, u osób z niedoborem więcej. Najlepiej po zbadaniu poziomu 25(OH)D.' },
            { h2: 'Z czym łączyć', p: 'D3 jest rozpuszczalna w tłuszczu — bierz z posiłkiem zawierającym tłuszcz. To realnie poprawia wchłanianie.' }
        ],
        bullets: ['<strong>Październik–marzec</strong> — suplementuj D3.', '<strong>1000–2000 IU/dzień</strong> — typowa dawka dorosłego.', '<strong>Z tłuszczem</strong> — lepsze wchłanianie.'],
        uwaga: 'D3 to witamina rozpuszczalna w tłuszczach — da się ją przedawkować. Trzymaj się dawek, nie łykaj „na zapas”.',
        coDalej: 'Zobacz <a href="wapn-bez-nabialu">wapń bez nabiału</a> i <a href="kreatyna-kofeina-bialko-co-warto">co naprawdę warto suplementować</a>.'
    },
    {
        slug: 'zelazo-u-trenujacych-kobiet',
        emoji: '🩸',
        title: 'Żelazo u trenujących kobiet — objawy, których nie ignoruj',
        subtitle: 'Zmęczenie, bladość, słabszy trening — to może być żelazo, nie lenistwo. Kobiety tracą go więcej.',
        meta: 'Niedobór żelaza u trenujących kobiet — objawy, norma ferrytyny, najlepsze źródła żelaza i kiedy suplementacja ma sens.',
        category: 'odzywianie',
        lead: 'Miesiączka + trening + niskokaloryczna dieta = przepis na niedobór żelaza. Zmęczenie i gorsze wyniki to często ferrytyna, nie brak motywacji.',
        sections: [
            { h2: 'Objawy', p: 'Ciągłe zmęczenie, bladość, łamliwe paznokcie, zadyszka przy wysiłku, zimne dłonie. To klasyka niedoboru żelaza.' },
            { h2: 'Jakie źródła', p: 'Czerwone mięso, wątróbka, strączki, szpinak, pestki dyni. Żelazo hemowe (z mięsa) wchłania się lepiej niż roślinne.' },
            { h2: 'Wchłanianie', p: 'Witamina C podbija wchłanianie żelaza roślinnego; kawa i herbata tuż po posiłku je blokują. To praktyczne, nie kosmetyczne różnice.' }
        ],
        bullets: ['<strong>Zbadaj ferrytynę</strong> — zanim zaczniesz brać.', '<strong>Mięso + witamina C</strong> — najlepsze wchłanianie.', '<strong>Kawa/herbata po posiłku</strong> — blokują żelazo.'],
        uwaga: 'Nie suplementuj żelaza „w ciemno” — nadmiar jest toksyczny. Najpierw morfologia i ferrytyna.',
        coDalej: 'Zobacz <a href="bialko-a-wlosy-paznokcie">białko a włosy</a> i <a href="wapn-bez-nabialu">wapń bez nabiału</a>.'
    },
// @@MORE@@
