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
// @@MORE@@
