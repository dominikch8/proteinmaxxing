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
    {
        slug: 'magnez-a-skurcze',
        emoji: '🦵',
        title: 'Magnez i skurcze po treningu — czy to naprawdę to',
        subtitle: 'Skurcze częściej biorą się z odwodnienia i zmęczenia niż z braku magnezu. Ale magnez i tak warto pilnować.',
        meta: 'Skurcze mięśni a magnez — czy niedobór magnezu powoduje skurcze, co naprawdę je wywołuje i ile magnezu dziennie jeść.',
        category: 'odzywianie',
        lead: 'Skurcz łydki o 3 w nocy to klasyk — ale najczęściej winne jest odwodnienie i przemęczenie, nie sam magnez. Mimo to magnez jest niedoborowy u wielu.',
        sections: [
            { h2: 'Skąd skurcze', p: 'Główni podejrzani: odwodnienie, niski sód/potas przy obfitym poceniu, zmęczenie mięśnia. Magnez bywa winny rzadziej, niż się myśli.' },
            { h2: 'Ile magnezu', p: 'Dorośli: ~350–400 mg dziennie. Źródła: kasza gryczana, orzechy, pestki dyni, kakao, rośliny strączkowe, ciemne pieczywo.' },
            { h2: 'Jaki suplement', p: 'Cytrynian magnezu wchłania się dobrze; tlenek — słabo i ma działanie przeczyszczające. Sprawdzaj formę na etykiecie.' }
        ],
        bullets: ['<strong>Najpierw woda + elektrolity</strong> — to częstsze winy.', '<strong>350–400 mg magnezu</strong> — dzienna dawka.', '<strong>Cytrynian > tlenek</strong> — lepsze wchłanianie.'],
        uwaga: 'Nadmiar magnezu z suplementów daje biegunkę — lepiej domykać z jedzenia, a suplement tylko jako uzupełnienie.',
        coDalej: 'Zobacz <a href="elektrolity-kiedy-woda-za-malo">elektrolity</a> i <a href="woda-przed-posilkiem">wodę przed posiłkiem</a>.'
    },
    {
        slug: 'elektrolity-kiedy-woda-za-malo',
        emoji: '🧂',
        title: 'Elektrolity — kiedy sama woda już nie wystarcza',
        subtitle: 'Przy długim cardio i w upał tracisz sód i potas. Woda bez elektrolitów bywa gorsza niż nic.',
        meta: 'Kiedy brać elektrolity — sód, potas, magnez podczas treningu i upałów, objawy niedoboru i czy napoje izotoniczne mają sens.',
        category: 'odzywianie',
        lead: 'Przy 1–2 h intensywnego wysiłku w upale możesz wypocić kilka gramów sodu. Sama woda rozcieńcza krew, a to przepis na skurcze i słabość.',
        sections: [
            { h2: 'Co tracisz', p: 'Z potem ucieka głównie sód, mniej potasu i magnezu. Przy długim wysiłku to sód jest tym, co trzeba uzupełnić najszybciej.' },
            { h2: 'Kiedy brać', p: 'Treningi 60+ minut, upał, intensywne cardio, praca fizyczna. Na krótki trening siłowy w chłodzie wystarczy woda.' },
            { h2: 'Izotonik czy sól', p: 'Gotowe izotoniki to woda + cukier + sól. Tańszy wariant: woda, szczypta soli i odrobina soku. Skład podobny, cena inna.' }
        ],
        bullets: ['<strong>60+ min wysiłku</strong> — dorzuć elektrolity.', '<strong>Sód</strong> — najważniejszy do uzupełnienia.', '<strong>Domowy izotonik</strong> — woda + sól + sok.'],
        uwaga: 'Nie przesadzaj z elektrolitami na co dzień — nadmiar sodu podnosi ciśnienie u osób wrażliwych.',
        coDalej: 'Zobacz <a href="magnez-a-skurcze">magnez i skurcze</a> i <a href="sod-dlaczego-nie-demonizowac">sód bez demonizowania</a>.'
    },
    {
        slug: 'weglowodany-na-noc',
        emoji: '🌙',
        title: 'Węglowodany na noc — czy naprawdę tuczą',
        subtitle: 'Organizm nie patrzy na zegarek. Liczy się bilans dnia, nie godzina ostatniego ryżu.',
        meta: 'Czy węglowodany wieczorem tuczą — mit o jedzeniu po 18, jak organizm trawi węgle w nocy i czy kolacja z węglowodanami psuje redukcję.',
        category: 'odzywianie',
        lead: 'Mit, że węglowodany po 18 „idą w tłuszcz”, nie ma podstaw. O tyciu decyduje bilans kalorii w całym dniu — nie pora ostatniego posiłku.',
        sections: [
            { h2: 'Skąd mit', p: 'Ludzie jedzący wieczorem często po prostu podjadają nadwyżkę kalorii. Winna jest ilość, nie godzina.' },
            { h2: 'Co dzieje się w nocy', p: 'Organizm trawi w nocy wolniej, ale normalnie. Węglowodany na kolację mogą nawet pomóc zasnąć (podnoszą serotoninę).' },
            { h2: 'Kiedy uważać', p: 'Przy refluksie i złej jakości snu ciężka, tłusta kolacja tuż przed snem przeszkadza. Zjedz 2–3 h przed — i to wszystko.' }
        ],
        bullets: ['<strong>Liczy się bilans dnia</strong> — nie godzina.', '<strong>Węgle na kolację</strong> — mogą pomóc spać.', '<strong>Zjedz 2–3 h przed snem</strong> — dla trawienia.'],
        uwaga: 'Jeśli po kolacji z węglami śpisz gorzej i masz refluks — przesuń je wcześniej, ale nie dlatego, że „tuczą”.',
        coDalej: 'Zobacz <a href="dlaczego-waga-skacze-o-2kg">dlaczego waga skacze</a> i <a href="sen-stres-i-waga">sen, stres i waga</a>.'
    },
    {
        slug: 'indeks-glikemiczny-banan',
        emoji: '🍌',
        title: 'Indeks glikemiczny — dlaczego banan nie jest zły',
        subtitle: 'IG mierzy sam węglowodan, nie posiłek. Banan z twarogiem to zupełnie inna historia niż sam banan.',
        meta: 'Indeks glikemiczny — co naprawdę mierzy, dlaczego banan nie jest zły, ładunek glikemiczny i jak komponować posiłki, by cukier nie skakał.',
        category: 'odzywianie',
        lead: 'Indeks glikemiczny pokazuje, jak szybko sam produkt podnosi cukier. Banan ma wysoki IG, ale zjedzony z twarogiem lub orzechami — już nie.',
        sections: [
            { h2: 'IG vs ładunek', p: 'IG ignoruje ilość. Ładunek glikemiczny liczy realną porcję — i to on ma znaczenie. Kawałek arbuza to mniej cukru, niż sugeruje jego wysoki IG.' },
            { h2: 'Dlaczego banan jest OK', p: 'Dojrzały banan to szybkie węgle, ale też potas i sytość. Przed treningiem to plus, nie wróg. Zielony ma mniej cukru i więcej skrobi opornej.' },
            { h2: 'Jak obniżyć IG', p: 'Łącz węglowodany z białkiem, tłuszczem i błonnikiem. Kanapka z twarogiem, owoc z jogurtem — cukier rośnie wolniej, sytość dłużej.' }
        ],
        bullets: ['<strong>Ładunek > indeks</strong> — licz porcję, nie IG.', '<strong>Banan + twaróg</strong> — spłaszcza skok cukru.', '<strong>Łącz węgle z białkiem</strong> — uniwersalna zasada.'],
        uwaga: 'IG to jedno z wielu narzędzi — nie demonizuj owoców. Przy zdrowym metabolizmie owoc dziennie to zaleta, nie grzech.',
        coDalej: 'Zobacz <a href="weglowodany-na-noc">węglowodany na noc</a> i <a href="fruktoza-w-owocach">fruktozę w owocach</a>.'
    },
    {
        slug: 'omega-3-ryba-czy-kapsulka',
        emoji: '🐟',
        title: 'Omega-3 — ryba czy kapsułka',
        subtitle: 'Ryba daje pełen zestaw, kapsułka wygodę. Ale nie każda kapsułka ma sensowną dawkę EPA/DHA.',
        meta: 'Omega-3 z ryby czy suplementu — ile EPA i DHA dziennie, która ryba ma najwięcej omega-3 i jak wybrać dobry suplement.',
        category: 'odzywianie',
        lead: 'Dwie porcje tłustej ryby tygodniowo domykają omega-3 lepiej niż tania kapsułka. W suplementach patrz na sumę EPA+DHA, nie na wielkość kapsułki.',
        sections: [
            { h2: 'Ile trzeba', p: 'Zdrowy dorosły: ~250–500 mg EPA+DHA dziennie. To 2 porcje łososia/makreli/sardynek tygodniowo albo porządny suplement.' },
            { h2: 'Ryba czy kapsułka', p: 'Ryba daje też białko i witaminę D. Kapsułka to opcja dla tych, którzy ryb nie jedzą. Oba działają, jeśli dawka EPA+DHA się zgadza.' },
            { h2: 'Jak wybrać', p: 'Sprawdzaj etykietę: suma EPA+DHA na porcję, nie „1000 mg oleju rybiego” (gdzie omega-3 może być 300 mg). Świeżość i źródło też mają znaczenie.' }
        ],
        bullets: ['<strong>250–500 mg EPA+DHA</strong> — dzienna dawka.', '<strong>2 porcje ryby/tydz.</strong> — najprościej.', '<strong>Sprawdzaj EPA+DHA</strong> — nie „olej rybi”.'],
        uwaga: 'Jeśli bierzesz leki rozrzedzające krew, skonsultuj duże dawki omega-3 z lekarzem.',
        coDalej: 'Zobacz <a href="losos-wedzony-ile-bialka">łososia wędzonego</a> i <a href="konserwa-rybna-bialko-za-grosze">konserwy rybne</a>.'
    },
    {
        slug: 'sod-dlaczego-nie-demonizowac',
        emoji: '🧂',
        title: 'Sód — dlaczego nie musisz go demonizować',
        subtitle: 'Sól to nie trucizna, a elektrolit. Problemem jest nadmiar z przetworzonych, nie sól z solniczki.',
        meta: 'Sód w diecie — ile dziennie to norma, dlaczego sól nie jest sama w sobie zła i skąd naprawdę pochodzi nadmiar sodu.',
        category: 'odzywianie',
        lead: 'Sód jest niezbędny do pracy mięśni i nerwów. Problem w tym, że jemy go 2× za dużo — ale głównie z gotowców, nie z dosalania obiadu.',
        sections: [
            { h2: 'Ile to norma', p: 'WHO zaleca do 5 g soli (2 g sodu) dziennie. Przeciętnie jemy ~9–10 g, z czego większość siedzi w pieczywie, wędlinach i gotowcach.' },
            { h2: 'Czemu to ważne', p: 'Nadmiar sodu podnosi ciśnienie u osób wrażliwych i zatrzymuje wodę. Ale zero sodu też jest złe — szczególnie przy intensywnym treningu.' },
            { h2: 'Gdzie jest sód', p: 'Nie w solniczce — w chlebie, serze, wędlinach, zupach instant i fast foodzie. Gotując sam, kontrolujesz najwięcej.' }
        ],
        bullets: ['<strong>Do 5 g soli/dzień</strong> — norma WHO.', '<strong>Gotuj sam</strong> — najwięcej sodu jest w gotowcach.', '<strong>Nie tnij do zera</strong> — sód jest potrzebny.'],
        uwaga: 'Jeśli masz nadciśnienie, ogranicz sód — ale najpierw w gotowcach i przetworzonych, nie w domowej kuchni.',
        coDalej: 'Zobacz <a href="elektrolity-kiedy-woda-za-malo">elektrolity</a> i <a href="konserwa-rybna-bialko-za-grosze">sól w konserwach</a>.'
    },
    {
        slug: 'fruktoza-w-owocach',
        emoji: '🍎',
        title: 'Cukier w owocach — czy fruktoza tuczy',
        subtitle: 'Owoc to nie „cukier”. Ma błonnik, wodę i witaminy. Problemem jest fruktoza w syropach, nie w jabłku.',
        meta: 'Fruktoza w owocach — czy cukier z owoców tuczy, ile owoców dziennie jeść i czym różni się fruktoza z jabłka od syropu glukozowo-fruktozowego.',
        category: 'odzywianie',
        lead: 'Owoc to nie to samo co cukier z torebki. Fruktoza w jabłku idzie z błonnikiem i wodą, a ta w napojach — jako czysty zastrzyk. Różnica jest ogromna.',
        sections: [
            { h2: 'Fruktoza a glukoza', p: 'Fruktoza jest metabolizowana w wątrobie, nie podnosi cukru tak szybko. Problem zaczyna się, gdy jesz jej nadmiar w syropach i słodyczach.' },
            { h2: 'Ile owoców', p: '2–3 porcje dziennie (np. jabłko + garść jagód) to zdrowa norma. Owoców nie trzeba się bać — to kalorie, nie trucizna.' },
            { h2: 'Gdzie jest pułapka', p: 'Syrop glukozowo-fruktozowy w napojach i słodyczach to ukryta fruktoza bez błonnika. To on jest winny, nie owoce.' }
        ],
        bullets: ['<strong>2–3 porcje owoców dziennie</strong> — spokojnie.', '<strong>Owoc ≠ sok</strong> — sok traci błonnik.', '<strong>Syrop GF</strong> — to on jest problemem.'],
        uwaga: 'Soki i smoothie bez błonnika potrafią mieć tyle cukru co cola — owoc jedz, a nie pij.',
        coDalej: 'Zobacz <a href="indeks-glikemiczny-banan">banan i indeks glikemiczny</a> i <a href="sztuczne-slodziki">sztuczne słodziki</a>.'
    },
    {
        slug: 'sztuczne-slodziki',
        emoji: '🥤',
        title: 'Sztuczne słodziki — co mówią badania, a nie fora',
        subtitle: 'Słodziki nie są rakotwórcze w realnych dawkach. Są narzędziem — nie cudem i nie trucizną.',
        meta: 'Sztuczne słodziki — czy są bezpieczne, co mówią badania o aspartamie i sukralozie, ile można ich jeść i czy pomagają schudnąć.',
        category: 'odzywianie',
        lead: 'Panika wokół aspartamu jest przesadzona — agencje uznają go za bezpieczny w dawkach wielokrotnie wyższych niż realne. Ale słodzik to narzędzie, nie magiczna szczupłość.',
        sections: [
            { h2: 'Czy są bezpieczne', p: 'Aspartam, sukraloza, stewia — przy normalnym spożyciu bezpieczne. Limity (ADI) są tak wysokie, że trudno je przekroczyć.' },
            { h2: 'Czy pomagają chudnąć', p: 'Pomagają, jeśli realnie zastępują słodzone napoje i tną kalorie. Same w sobie nie odchudzają, ale nie tuczą.' },
            { h2: 'Na co uważać', p: 'Słodki smak może podtrzymywać ochotę na słodycze u niektórych osób. Jeśli po „zero” masz większy apetyt na ciastko — to nie słodzik, to nawyk.' }
        ],
        bullets: ['<strong>Bezpieczne w realnych dawkach</strong> — nie panikuj.', '<strong>Zamień colę na zero</strong> — tniesz setki kcal.', '<strong>Obserwuj apetyt</strong> — niektórzy reagują słodyczą na słodycz.'],
        uwaga: 'Unikaj tylko przy fenyloketonurii (aspartam) — dla reszty osób to kwestia preferencji, nie bezpieczeństwa.',
        coDalej: 'Zobacz <a href="fruktoza-w-owocach">fruktozę</a> i <a href="plynne-kalorie-sok-to-nie-owoc">płynne kalorie</a>.'
    },
    {
        slug: 'kofeina-ile-kiedy-sen',
        emoji: '☕',
        title: 'Kofeina — ile, kiedy i czy psuje sen',
        subtitle: 'Kofeina działa 5–6 godzin. Kawa o 17 potrafi zepsuć sen o 23 — nawet jeśli „śpisz normalnie”.',
        meta: 'Kofeina przed treningiem i w ciągu dnia — ile mg to bezpieczna dawka, jak długo działa i o której wypić ostatnią kawę, by nie psuła snu.',
        category: 'odzywianie',
        lead: 'Kofeina ma okres półtrwania ~5 h. Kawa o 17 to o 23 wciąż połowa dawki we krwi — sen przychodzi, ale jest płytszy.',
        sections: [
            { h2: 'Ile to bezpieczne', p: 'Do 400 mg dziennie (ok. 4 espresso) u zdrowych dorosłych jest OK. Powyżej — nerwowość, kołatanie, gorszy sen.' },
            { h2: 'Kiedy ostatnia kawa', p: 'Najpóźniej 6–8 h przed snem. Dla większości to ok. 14–15. Wrażliwi na kofeinę powinni kończyć jeszcze wcześniej.' },
            { h2: 'Kofeina a trening', p: '3–6 mg/kg przed wysiłkiem realnie podnosi wydolność. Efekt słabnie przy codziennym piciu — tolerancja rośnie szybko.' }
        ],
        bullets: ['<strong>Do 400 mg/dzień</strong> — bezpieczny sufit.', '<strong>Ostatnia kawa 6–8 h przed snem</strong> — reguła.', '<strong>Przed treningiem</strong> — 3–6 mg/kg działa.'],
        uwaga: 'Kofeina z przedtreningówek + kawa w ciągu dnia potrafią zsumować się w 600+ mg — licz całość.',
        coDalej: 'Zobacz <a href="przedtreningowka-czy-wystarczy-kawa">przedtreningówka czy kawa</a> i <a href="sen-6-czy-8-godzin-a-waga">sen a waga</a>.'
    },
    {
        slug: 'alkohol-kalorie-ktorych-nie-liczysz',
        emoji: '🍺',
        title: 'Alkohol — kalorie, których nie liczysz',
        subtitle: 'Alkohol to 7 kcal na gram — więcej niż węglowodany. A do tego obniża hamulce i psuje regenerację.',
        meta: 'Kalorie z alkoholu — ile kcal ma piwo, wino i wódka, jak alkohol psuje redukcję i regenerację oraz jak pić, jeśli w ogóle, bez rujnowania diety.',
        category: 'odzywianie',
        lead: 'Alkohol ma 7 kcal na gram — gęściej niż węgle i białko. Piwo to 250 kcal, kieliszek wina 120. I to zanim dojdzie do podjadania.',
        sections: [
            { h2: 'Kalorie', p: 'Gram etanolu = 7 kcal. Piwo (500 ml) ~250 kcal, wino (150 ml) ~120, wódka (50 ml) ~110. Bez syropów i coli w drinku.' },
            { h2: 'Co robi z dietą', p: 'Alkohol spowalnia spalanie tłuszczu, psuje sen i regenerację, a po kilku głębszych znika kontrola nad jedzeniem.' },
            { h2: 'Jak minimalizować', p: 'Wybieraj czyste trunki bez słodkich dodatków, pij wodę między kolejkami i licz te kalorie jak każde inne.' }
        ],
        bullets: ['<strong>7 kcal/g</strong> — licz alkohol jak makro.', '<strong>Piwo 250 kcal</strong> — za butelkę.', '<strong>Czyste trunki + woda</strong> — mniej szkód.'],
        uwaga: 'Na redukcji alkohol to pierwszy kandydat do cięcia — jego kalorie nie dają ani sytości, ani mięśni.',
        coDalej: 'Zobacz <a href="alkohol-a-odchudzanie">alkohol a odchudzanie</a> i <a href="plynne-kalorie-sok-to-nie-owoc">płynne kalorie</a>.'
    },
    {
        slug: 'woda-przed-posilkiem',
        emoji: '💧',
        title: 'Woda przed posiłkiem — trik na sytość czy placebo',
        subtitle: 'Szklanka wody przed jedzeniem realnie zmniejsza porcję o ~10%. Tani sposób na mniejszy apetyt.',
        meta: 'Czy picie wody przed posiłkiem pomaga schudnąć — jak woda wpływa na sytość, ile pić i czy to realny trik na mniejsze porcje.',
        category: 'odzywianie',
        lead: 'Szklanka wody (500 ml) 15–30 min przed posiłkiem realnie zmniejsza to, ile potem zjesz — o ok. 10–15%. To nie magia, tylko objętość w żołądku.',
        sections: [
            { h2: 'Jak działa', p: 'Woda rozciąga żołądek i daje sygnał sytości, zanim zaczniesz jeść. Efekt jest realny, ale skromny — nie zastąpi liczenia.' },
            { h2: 'Ile pić', p: 'Dwie szklanki przed głównymi posiłkami. Nie przesadzaj — litr naraz tylko rozcieńczy sok żołądkowy i da uczucie ciężkości.' },
            { h2: 'Kiedy działa', p: 'Najlepiej u osób jedzących szybko i dużo. Jeśli już jesz powoli i sycąco, różnica będzie mniejsza.' }
        ],
        bullets: ['<strong>500 ml przed posiłkiem</strong> — mniejsza porcja.', '<strong>15–30 min przed</strong> — nie tuż przy talerzu.', '<strong>Efekt ~10%</strong> — pomocny, nie magiczny.'],
        uwaga: 'Nie popijaj każdego kęsa dużą ilością wody — jedz, a wodę pij przed posiłkiem.',
        coDalej: 'Zobacz <a href="volume-eating-jak-jesc-duzo-i-chudnac">volume eating</a> i <a href="blonnik-a-sytosc">błonnik a sytość</a>.'
    },
    {
        slug: 'kreatyna-z-jedzenia',
        emoji: '🥩',
        title: 'Kreatyna z jedzenia — ile jej jest w mięsie',
        subtitle: 'Mięso i ryby mają kreatynę, ale żeby dobić dawkę z suplementu, musiałbyś zjeść kilogram dziennie.',
        meta: 'Kreatyna z jedzenia — ile kreatyny ma mięso i ryby, ile trzeba zjeść, by dorównać suplementowi i dlaczego monohydrat jest tańszy.',
        category: 'odzywianie',
        lead: 'Kreatyna siedzi w mięsie i rybach — ok. 3–5 g na kilogram. Żeby wziąć typową dawkę 3–5 g dziennie, musiałbyś zjeść ~1 kg mięsa.',
        sections: [
            { h2: 'Ile w produktach', p: 'Wołowina ~4–5 g/kg, śledź ~6–8 g/kg, kurczak ~3 g/kg. Wegetarianie mają jej we krwi mniej — stąd u nich suplement daje większy efekt.' },
            { h2: 'Jedzenie vs suplement', p: 'Monohydrat to ~30–50 zł za miesięczny zapas — taniej niż kilogram mięsa dziennie. I bez kalorii.' },
            { h2: 'Czy warto', p: 'Kreatyna to najlepiej przebadany suplement siłowy. 3–5 g dziennie poprawia siłę i masę mięśniową u większości trenujących.' }
        ],
        bullets: ['<strong>3–5 g/kg w mięsie</strong> — ale to mało na porcję.', '<strong>3–5 g monohydratu</strong> — standardowa dawka.', '<strong>Najtańszy efekt</strong> — kreatyna > BCAA i spalacze.'],
        uwaga: 'Faza ładowania nie jest konieczna — 3–5 g dziennie stałej dawki da ten sam efekt, tylko wolniej.',
        coDalej: 'Zobacz <a href="kreatyna-kofeina-bialko-co-warto">co naprawdę warto brać</a> i <a href="przedtreningowka-czy-wystarczy-kawa">przedtreningówka czy kawa</a>.'
    },
    {
        slug: 'wapn-bez-nabialu',
        emoji: '🥦',
        title: 'Wapń bez nabiału — gdzie go szukać',
        subtitle: 'Nabiał to nie jedyne źródło wapnia. Mak, tofu, sardynki i zielone warzywa domykają dzienną dawkę.',
        meta: 'Wapń bez nabiału — mak, tofu, sardynki, migdały i warzywa: ile wapnia dziennie trzeba i jak domknąć je bez mleka.',
        category: 'odzywianie',
        lead: 'Dorosły potrzebuje ~1000 mg wapnia dziennie. Bez nabiału da się — mak, tofu z wapniem, sardynki i brokuły robią robotę.',
        sections: [
            { h2: 'Ile trzeba', p: 'Dorośli: 1000 mg, kobiety po 50. i mężczyźni po 70. — 1200 mg. Niedobór odbija się na kościach, nie tylko na diecie.' },
            { h2: 'Najlepsze źródła', p: 'Mak (~1400 mg/100 g), sezam, tofu z solami wapnia, sardynki z ośćmi, migdały, jarmuż, brokuły. Sporo, jeśli wiesz gdzie.' },
            { h2: 'Wchłanianie', p: 'Wapń lubi witaminę D i kwas żołądkowy. Szczawiany (szpinak) i fityniany (otręby) wiążą wapń — dlatego sam szpinak nie wystarczy.' }
        ],
        bullets: ['<strong>1000 mg dziennie</strong> — dorosły cel.', '<strong>Mak, tofu, sardynki</strong> — poza nabiałem.', '<strong>Witamina D</strong> — bez niej wapń gorzej wchodzi.'],
        uwaga: 'Wegańska dieta bez planu łatwo wpada w 400–600 mg wapnia — suplement albo świadome źródła to konieczność.',
        coDalej: 'Zobacz <a href="witamina-d-zima">witaminę D zimą</a> i <a href="witamina-b12-dieta-roslinna">witaminę B12</a>.'
    },
    {
        slug: 'bialko-wegle-po-treningu',
        emoji: '⚡',
        title: 'Białko + węglowodany po treningu — po co ta para',
        subtitle: 'Białko buduje, węglowodany uzupełniają glikogen i poprawiają wchłanianie. Razem działają lepiej niż solo.',
        meta: 'Dlaczego białko z węglowodanami po treningu — jak ta para wpływa na regenerację i glikogen, ile jeść i czy ratio 3:1 ma znaczenie.',
        category: 'odzywianie',
        lead: 'Po treningu mięśnie chcą aminokwasów (naprawa) i glukozy (glikogen). Białko + węglowodany to nie moda — to logistyka regeneracji.',
        sections: [
            { h2: 'Co robi białko', p: 'Dostarcza aminokwasów do odbudowy mikrouszkodzeń mięśni. 25–40 g po treningu to sensowna porcja.' },
            { h2: 'Co robią węgle', p: 'Uzupełniają glikogen spalony w trakcie i podbijają insulinę, która pomaga „wpakować” aminokwasy do mięśni.' },
            { h2: 'Ile i kiedy', p: 'Nie musisz jeść w 30 minut. Posiłek w ciągu 2–4 h z białkiem i węglami wystarczy. Ratio 3:1 to sugestia, nie prawo.' }
        ],
        bullets: ['<strong>25–40 g białka</strong> — po treningu.', '<strong>+ węglowodany</strong> — glikogen i insulina.', '<strong>2–4 h na posiłek</strong> — bez paniki o okno.'],
        uwaga: 'Na redukcji węgle po treningu też są OK — tylko wpisz je w dzienny bilans, zamiast dokładać ponad limit.',
        coDalej: 'Zobacz <a href="bialko-po-treningu-ile-faktycznie">ile białka po treningu</a> i <a href="ile-bialka-na-dzien">ile białka dziennie</a>.'
    },
    {
        slug: 'mrozonki-vs-swieze',
        emoji: '🥶',
        title: 'Mrożonki vs świeże — czy tracisz witaminy',
        subtitle: 'Mrożone warzywa często mają więcej witamin niż „świeże” z marketu. Zamrażanie to nie wróg.',
        meta: 'Mrożonki czy świeże warzywa i owoce — czy mrożenie niszczy witaminy, kiedy mrożonki wygrywają i które wybierać na diecie.',
        category: 'odzywianie',
        lead: 'Mrożone warzywa są zbierane w szczycie dojrzałości i mrożone w godziny — często mają więcej witamin niż „świeże”, które tygodniami leżały w transporcie.',
        sections: [
            { h2: 'Co dzieje się przy mrożeniu', p: 'Szybkie mrożenie zatrzymuje witaminy. Strata jest minimalna, a czasem mniejsza niż w warzywach leżących w sklepie.' },
            { h2: 'Kiedy mrożonki wygrywają', p: 'Poza sezonem, przy małym budżecie i gdy nie gotujesz codziennie. Mrożony szpinak i jagody to stały, tani wybór.' },
            { h2: 'Na co uważać', p: 'Kupuj same warzywa/owoce, bez sosów i panierek. „Mrożone gotowce” to już inna kategoria — sprawdzaj skład.' }
        ],
        bullets: ['<strong>Mrożenie ≈ świeże</strong> — różnice są małe.', '<strong>Poza sezonem</strong> — mrożonki lepsze.', '<strong>Bez sosów</strong> — kupuj czyste produkty.'],
        uwaga: 'Mrożone „mieszanki na patelnię” z sosem potrafią mieć sporo tłuszczu i cukru — to nie to samo co worek warzyw.',
        coDalej: 'Zobacz <a href="volume-eating-jak-jesc-duzo-i-chudnac">volume eating</a> i <a href="blonnik-a-sytosc">błonnik a sytość</a>.'
    },
    {
        slug: 'glutaminian-i-chemi',
        emoji: '🍜',
        title: 'Glutaminian i „chemia” — co jest faktem',
        subtitle: 'Glutaminian to aminokwas, który jesz codziennie w pomidorach i serze. „Chemia” to straszak, nie argument.',
        meta: 'Glutaminian sodu — czy jest szkodliwy, czym różni się od naturalnego, co mówią badania i dlaczego „bez glutaminianu” to głównie marketing.',
        category: 'odzywianie',
        lead: 'Glutaminian to sól kwasu glutaminowego — aminokwasu, który naturalnie występuje w pomidorach, serze parmezan i mięsie. Twój organizm go zna.',
        sections: [
            { h2: 'Naturalny vs dodany', p: 'Chemicznie to ta sama cząsteczka. Organizm nie odróżnia glutaminianu z parmezanu od tego z przyprawy — rozkłada go tak samo.' },
            { h2: 'Czy szkodzi', p: 'Badania nie potwierdzają „syndromu chińskiej restauracji” przy normalnych dawkach. Dla zdecydowanej większości jest bezpieczny.' },
            { h2: 'Na co naprawdę patrzeć', p: 'Glutaminian wzmacnia smak, więc produkty „umami” bywają przetworzone i słone. Problem to cały produkt, nie sam glutaminian.' }
        ],
        bullets: ['<strong>To aminokwas</strong> — nie trucizna.', '<strong>Bezpieczny w normalnych dawkach</strong> — potwierdzone.', '<strong>Patrz na cały produkt</strong> — nie na jeden składnik.'],
        uwaga: 'U wrażliwych osób duża dawka na pusty żołądek może dać ból głowy — to rzadkość, ale jeśli czujesz, jedz mniej.',
        coDalej: 'Zobacz <a href="sod-dlaczego-nie-demonizowac">sód bez demonizowania</a> i <a href="batony-fit-jak-czytac-etykiety">jak czytać etykiety</a>.'
    },
    {
        slug: 'blonnik-z-siemienia',
        emoji: '🌱',
        title: 'Błonnik z siemienia lnianego — jak go nie przedawkować',
        subtitle: 'Siemię to błonnik i omega-3 w jednym. Ale suche ziarno pęcznieje — łyżka bez wody to problem.',
        meta: 'Siemię lniane — błonnik i omega-3, ile dziennie jeść, dlaczego trzeba pić wodę i jak mielić siemię, by działało.',
        category: 'odzywianie',
        lead: 'Siemię lniane to ~27 g błonnika i sporo ALA (roślinne omega-3) na 100 g. Ale całe ziarna przechodzą niestrawione — i pęcznieją.',
        sections: [
            { h2: 'Całe czy mielone', p: 'Całe siemię przechodzi przez jelita niestrawione. Mielone uwalnia składniki i faktycznie działa. Miel świeżo, bo tłuszcze jełczeją.' },
            { h2: 'Ile jeść', p: '1–2 łyżki dziennie to rozsądna porcja. Dodawaj do owsianki, jogurtu albo smoothie — i koniecznie pij wodę.' },
            { h2: 'Dlaczego woda', p: 'Błonnik pęcznieje. Sucha łyżka siemienia bez wody potrafi zbić się w przełyku i dać zaparcia zamiast ulgi.' }
        ],
        bullets: ['<strong>Mielone, nie całe</strong> — inaczej nie działa.', '<strong>1–2 łyżki dziennie</strong> — sensowna dawka.', '<strong>Pij wodę</strong> — błonnik bez wody szkodzi.'],
        uwaga: 'Zacznij od pół łyżki i zwiększaj stopniowo — nagły skok błonnika to gwarancja wzdęć.',
        coDalej: 'Zobacz <a href="blonnik-a-sytosc">błonnik a sytość</a> i <a href="omega-3-ryba-czy-kapsulka">omega-3</a>.'
    },
    {
        slug: 'witamina-b12-dieta-roslinna',
        emoji: '💊',
        title: 'Witamina B12 na diecie roślinnej — jedyna, której brak',
        subtitle: 'B12 jest tylko w produktach odzwierzęcych. Na weganizmie bez suplementu wpadniesz w niedobór — to kwestia czasu.',
        meta: 'Witamina B12 na diecie wegańskiej i wegetariańskiej — objawy niedoboru, ile brać, jaka forma i dlaczego to jedyny obowiązkowy suplement.',
        category: 'odzywianie',
        lead: 'B12 nie występuje w roślinach w przyswajalnej formie. Weganie bez suplementu prędzej czy później wpadną w niedobór — a ten uszkadza nerwy i krew.',
        sections: [
            { h2: 'Objawy niedoboru', p: 'Zmęczenie, mrowienie rąk i nóg, problemy z pamięcią, anemia. Rozwijają się powoli, więc łatwo je zignorować.' },
            { h2: 'Ile brać', p: 'Weganom zaleca się suplement — np. 250–500 µg dziennie cyjanokobalaminy albo 1000–2000 µg tygodniowo. Dawki zależą od formy.' },
            { h2: 'Czy wegetarianie też', p: 'Laktoowowegetarianie dostają B12 z jaj i nabiału, ale przy małej ilości i tak warto badać poziom. Weganie — suplement obowiązkowo.' }
        ],
        bullets: ['<strong>Suplementuj na weganizmie</strong> — bez wyjątków.', '<strong>250–500 µg dziennie</strong> — typowa dawka.', '<strong>Badaj B12</strong> — raz do roku wystarczy.'],
        uwaga: 'B12 z alg i „wzbogaconych” produktów bywa niewystarczająca — pewny jest tylko suplement albo regularne wzbogacone produkty w dużej ilości.',
        coDalej: 'Zobacz <a href="bialko-roslinne-vs-zwierzece">białko roślinne</a> i <a href="wapn-bez-nabialu">wapń bez nabiału</a>.'
    },
    {
        slug: 'batony-fit-jak-czytac-etykiety',
        emoji: '🍫',
        title: 'Batony „fit” — jak czytać etykiety bez nabierania się',
        subtitle: '„Bez cukru”, „protein”, „fit” to ozdoby. Obróć opakowanie i sprawdź białko, cukier i listę składników.',
        meta: 'Jak czytać etykiety batonów fit — białko, cukier, alkohole cukrowe i kalorie: na co patrzeć, by nie przepłacać za zwykły baton.',
        category: 'odzywianie',
        lead: 'Front opakowania to reklama. Prawda jest z tyłu: gramy białka, cukru i skład w kolejności malejącej. Tam widać, czy to baton, czy „fit” złudzenie.',
        sections: [
            { h2: 'Białko i cukier', p: 'Protein bar: 20+ g białka, <3 g cukru. „Fit” baton: 5–10 g białka, 15–20 g cukru. Licz obie liczby, nie jedną.' },
            { h2: 'Słodziki i alkohole cukrowe', p: 'Maltitol i erytrytol obniżają cukier, ale maltitol potrafi wzdymać i ma kalorie. „Bez cukru” nie znaczy „bez kalorii”.' },
            { h2: 'Kolejność składników', p: 'Składniki są od największej ilości. Jeśli cukier/syrop jest na 2. miejscu — to deser, nieważne co krzyczy front.' }
        ],
        bullets: ['<strong>20+ g białka, <3 g cukru</strong> — wzorzec.', '<strong>Cukier/syrop na 2. miejscu</strong> — to deser.', '<strong>Sprawdzaj maltitol</strong> — wzdyma i ma kcal.'],
        uwaga: '„Fit” nie ma definicji prawnej — każdy może tak podpisać baton. Liczy się tylko tabela z tyłu.',
        coDalej: 'Zobacz <a href="batonek-proteinowy-ile-bialka">ile białka ma baton proteinowy</a> i <a href="sztuczne-slodziki">sztuczne słodziki</a>.'
    },
    {
        slug: 'granola-zdrowe-sniadanie-ile-cukru',
        emoji: '🥣',
        title: '„Zdrowe” śniadanie z granolą — ile ma cukru',
        subtitle: 'Granola z marketu to często 20–30 g cukru na 100 g. „Zdrowe” śniadanie potrafi być słodsze niż pączek.',
        meta: 'Ile cukru ma granola i musli — porównanie granoli, owsianki i płatków, na co patrzeć przy zakupie i jak zrobić zdrowszą wersję.',
        category: 'odzywianie',
        lead: 'Sklepowa granola to płatki sklejone syropem i olejem — często 20–30 g cukru na 100 g. Miska „zdrowego śniadania” potrafi mieć tyle cukru co baton.',
        sections: [
            { h2: 'Cukier i tłuszcz', p: 'Granola jest pieczona z dodatkiem syropu i tłuszczu, dlatego ma 400–450 kcal i sporo cukru na 100 g. Zwykłe płatki owsiane: ~1 g cukru.' },
            { h2: 'Jak wybrać', p: 'Szukaj musli/granoli z <10 g cukru na 100 g. Albo zrób własną: płatki + orzechy + odrobina miodu, pieczone w domu.' },
            { h2: 'Jak jeść', p: 'Granolę traktuj jak dodatek (garść), nie bazę. Na bazę daj zwykłe płatki, a chrupkość i smak dorzuć łyżką granoli.' }
        ],
        bullets: ['<strong><10 g cukru/100 g</strong> — szukaj takiej.', '<strong>Granola = dodatek</strong> — garść, nie miska.', '<strong>Zrób własną</strong> — kontrolujesz miód i olej.'],
        uwaga: '„Naturalna” i „ekologiczna” granola bywa tak samo słodka — te słowa nie mówią nic o cukrze.',
        coDalej: 'Zobacz <a href="bialko-na-sniadanie-jajka-czy-platki">jajka czy płatki na śniadanie</a> i <a href="bialko-w-platkach-owsianych">białko w płatkach</a>.'
    },
    {
        slug: 'tluszcze-nasycone-czy-nienasycone',
        emoji: '🫒',
        title: 'Tłuszcze nasycone czy nienasycone — co wybierać',
        subtitle: 'Nie chodzi o zero nasyconych, tylko o proporcje. Zamień część masła na oliwę i ryby — i tyle.',
        meta: 'Tłuszcze nasycone vs nienasycone — różnica, wpływ na serce, gdzie są nasycone i jak prosto poprawić proporcje tłuszczów w diecie.',
        category: 'odzywianie',
        lead: 'Tłuszcze nasycone (masło, smalec, tłuste mięso) podnoszą „zły” cholesterol LDL. Nienasycone (oliwa, ryby, orzechy) go obniżają. Klucz to proporcje.',
        sections: [
            { h2: 'Różnica', p: 'Nasycone są stałe w temperaturze pokojowej, nienasycone płynne. Zamiana nasyconych na nienasycone realnie obniża ryzyko sercowe.' },
            { h2: 'Gdzie są nasycone', p: 'Masło, smalec, tłuste mięso, ser, ciasta, fast food. Nie musisz ich zerować — wystarczy nie przesadzać i część zamienić.' },
            { h2: 'Prosta zamiana', p: 'Masło na kanapce → pasta z awokado; smażenie na smalcu → oliwa; tłusta wieprzowina częściej → ryba. Małe kroki, duży efekt.' }
        ],
        bullets: ['<strong>Zamień część nasyconych</strong> — nie wszystkie.', '<strong>Oliwa, ryby, orzechy</strong> — baza nienasyconych.', '<strong>Proporcje > zero</strong> — nie demonizuj masła.'],
        uwaga: 'Tłuszcze trans (utwardzone, w tanich słodyczach) są gorsze od nasyconych — to ich unikaj najmocniej.',
        coDalej: 'Zobacz <a href="oliwa-czy-maslo">oliwę czy masło</a> i <a href="omega-3-ryba-czy-kapsulka">omega-3</a>.'
    },
    {
        slug: 'talerz-80-procent-sytosci',
        emoji: '🍽️',
        title: 'Talerz w 80% pełny — jak jeść mniej bez liczenia',
        subtitle: 'Japońska zasada hara hachi bu: kończ, gdy jesteś syty w 80%. Prosty trik na mniejsze porcje bez wagi.',
        meta: 'Metoda talerza 80% — hara hachi bu: jak jeść do 80% sytości, by chudnąć bez liczenia kalorii i dlaczego mózg potrzebuje 20 minut.',
        category: 'odchudzanie',
        lead: 'Mózg rejestruje sytość z ~20-minutowym opóźnieniem. Jeśli kończysz posiłek na „prawie syty”, za chwilę będziesz najedzony — bez przejedzenia.',
        sections: [
            { h2: 'Na czym polega', p: 'Zamiast jeść do pełna, zjedz ~80% tego, co zwykle, i odczekaj 15–20 minut. Sygnał sytości dojdzie — bez dokładki.' },
            { h2: 'Dlaczego działa', p: 'Rozciągnięcie żołądka i hormony sytości (GLP-1) potrzebują czasu. Jedząc wolniej, dajesz im szansę nadążyć.' },
            { h2: 'Jak wdrożyć', p: 'Jedz wolniej, odkładaj sztućce między kęsami, pij wodę. Odstaw talerz na 10 minut, zanim sięgniesz po dokładkę.' }
        ],
        bullets: ['<strong>Kończ na 80%</strong> — nie na pełno.', '<strong>Jedz wolniej</strong> — 20 min na posiłek.', '<strong>Odczekaj przed dokładką</strong> — 10 minut.'],
        uwaga: 'Nie tnij porcji do głodu — 80% sytości to nie 50% kalorii. Zbyt mało tylko nakręci podjadanie wieczorem.',
        coDalej: 'Zobacz <a href="glod-vs-apetyt">głód vs apetyt</a> i <a href="volume-eating-jak-jesc-duzo-i-chudnac">volume eating</a>.'
    },
    {
        slug: 'cheat-meal-a-tydzien-redukcji',
        emoji: '🍕',
        title: 'Cheat meal — kiedy pomaga, kiedy psuje tydzień',
        subtitle: 'Jeden luźny posiłek nie zrujnuje redukcji. Codzienne „małe oszustwa” — już tak.',
        meta: 'Cheat meal na redukcji — czy warto, jak często, ile kalorii może mieć i kiedy jeden luźny posiłek zamienia się w zepsuty tydzień.',
        category: 'odchudzanie',
        lead: 'Jeden cheat meal w tygodniu to spadek tempa, nie koniec diety. Problem zaczyna się, gdy cheat trwa cały weekend.',
        sections: [
            { h2: 'Matematyka', p: 'Nadwyżka 800 kcal w jednym posiłku to ułamek tygodniowego deficytu. Ta sama nadwyżka codziennie — kasuje cały postęp.' },
            { h2: 'Kiedy pomaga', p: 'Psychicznie: oddech od diety zmniejsza napięcie i ryzyko porzucenia planu. Fizycznie: uzupełnia glikogen, co bywa miłe przed ciężkim treningiem.' },
            { h2: 'Jak go zrobić', p: 'Zaplanuj z góry, zjedz i wróć do planu następnym posiłkiem. Nie „nadrabiaj” głodówką — to tylko napędza cykl.' }
        ],
        bullets: ['<strong>1 posiłek, nie weekend</strong> — granica.', '<strong>Zaplanuj</strong> — nie jedz „w nagrodę” impulsywnie.', '<strong>Wróć następnym posiłkiem</strong> — bez głodówki.'],
        uwaga: 'Jeśli cheat meal wyzwala u ciebie tygodniowe objadanie, odpuść go — nie każdemu służy.',
        coDalej: 'Zobacz <a href="cheat-meal-czy-rekompensata">cheat meal czy rekompensata</a> i <a href="podjadanie-wieczorem">podjadanie wieczorem</a>.'
    },
    {
        slug: 'glod-vs-apetyt',
        emoji: '🧠',
        title: 'Głód vs apetyt — jak je odróżnić',
        subtitle: 'Głód to sygnał ciała, apetyt to chęć przyjemności. Jeśli ich nie rozróżniasz, dieta zawsze będzie walką.',
        meta: 'Głód fizyczny a apetyt emocjonalny — jak je odróżnić, objawy prawdziwego głodu i co robić, gdy „głód” pojawia się z nudów lub stresu.',
        category: 'odchudzanie',
        lead: 'Głód przychodzi stopniowo i zadowoli go każdy posiłek. Apetyt pojawia się nagle, celuje w konkretny smak i nie znika po zdrowym obiedzie.',
        sections: [
            { h2: 'Objawy głodu', p: 'Burczenie w brzuchu, spadek energii, drażliwość — i chęć zjedzenia czegokolwiek, nawet brokułów. To głód fizyczny.' },
            { h2: 'Objawy apetytu', p: 'Chcesz „coś słodkiego/słonego” konkretnie, pojawia się przy stresie, nudzie albo widoku jedzenia. To nie głód, to bodziec.' },
            { h2: 'Co robić', p: 'Przy apetycie: wypij wodę, zrób 10-minutową przerwę, sprawdź, czy nie jesteś po prostu zmęczony. Prawdziwy głód przeczekaj — nie zniknie.' }
        ],
        bullets: ['<strong>Głód = cokolwiek</strong> — apetyt = konkretny smak.', '<strong>Woda + 10 min</strong> — test na apetyt.', '<strong>Nuda i stres</strong> — nie głoduj, tylko się zajmij.'],
        uwaga: 'Chroniczne tłumienie prawdziwego głodu kończy się napadem. Głód fizyczny zawsze zaspokój — tylko wybieraj mądrze.',
        coDalej: 'Zobacz <a href="jedzenie-z-nudow">jedzenie z nudów</a> i <a href="podjadanie-wieczorem">podjadanie wieczorem</a>.'
    },
    {
        slug: 'deficyt-500-czy-700',
        emoji: '🔢',
        title: 'Deficyt 500 czy 700 kcal — który wybrać realnie',
        subtitle: 'Większy deficyt = szybszy spadek, ale większy głód i ryzyko utraty mięśni. Złoty środek to 500.',
        meta: 'Deficyt 500 czy 700 kcal — ile chudnie się na każdym, który jest bezpieczniejszy, jak dobrać deficyt pod siebie i dlaczego 1200 kcal to często pułapka.',
        category: 'odchudzanie',
        lead: 'Deficyt 500 kcal to ~0,5 kg tygodniowo — bezpieczne tempo. 700+ kcal chudnie szybciej, ale częściej kończy się głodem i utratą mięśni.',
        sections: [
            { h2: 'Tempo spadku', p: '500 kcal dziennie = ~0,5 kg/tydz. 700 kcal = ~0,7 kg/tydz. Różnica wydaje się mała, ale w dłuższym ciągu liczy się trwałość.' },
            { h2: 'Ryzyko', p: 'Agresywny deficyt mocniej obniża energię, podnosi głód i łatwiej zjada mięśnie. Im większy pośpiech, tym większa szansa na jojo.' },
            { h2: 'Jak dobrać', p: 'Zacznij od 10–20% poniżej utrzymania (zwykle 400–600 kcal). Obserwuj wagę 2 tygodnie i dopiero wtedy tnij więcej.' }
        ],
        bullets: ['<strong>500 kcal</strong> — bezpieczny start.', '<strong>10–20% pod utrzymanie</strong> — zamiast zgadywania.', '<strong>Nie spiesz się</strong> — trwałość > tempo.'],
        uwaga: 'Nie schodź poniżej ~1200–1500 kcal bez planu — za mało energii to głód, braki i utrata mięśni.',
        coDalej: 'Zobacz <a href="deficyt-kaloryczny-praktyka">deficyt w praktyce</a> i <a href="dlaczego-nie-chudniesz-na-1200-kcal">czemu nie chudniesz na 1200</a>.'
    },
    {
        slug: 'plynne-kalorie-sok-to-nie-owoc',
        emoji: '🧃',
        title: 'Płynne kalorie — dlaczego sok to nie owoc',
        subtitle: 'Szklanka soku = kalorie 3 owoców i zero sytości. Płyny nie nasycają, a kalorie liczą tak samo.',
        meta: 'Płynne kalorie — sok, napoje i alkohol: dlaczego nie dają sytości, ile kcal ma szklanka soku i jak płyny po cichu psują redukcję.',
        category: 'odchudzanie',
        lead: 'Wypicie 300 kcal soku zajmuje 30 sekund i nie syci. Zjedzenie 300 kcal owoców to 10 minut żucia i pełny żołądek. Stąd problem.',
        sections: [
            { h2: 'Dlaczego nie sycą', p: 'Płyny nie rozciągają żołądka jak stałe jedzenie i szybko je opuszczają. Mózg nie rejestruje kalorii z napoju tak jak z posiłku.' },
            { h2: 'Ile to kosztuje', p: 'Szklanka soku pomarańczowego ~110 kcal, cola ~140, piwo ~250. Trzy „niewinne” płyny dziennie to dodatkowe 400–500 kcal.' },
            { h2: 'Co pić', p: 'Woda, kawa/herbata bez cukru, napoje zero. Sok i mleko traktuj jako kalorie, nie gaszenie pragnienia.' }
        ],
        bullets: ['<strong>Pij wodę i „zero”</strong> — zero kalorii.', '<strong>Sok = kalorie</strong> — nie nawodnienie.', '<strong>Owoc zamiast soku</strong> — syci i ma błonnik.'],
        uwaga: '„100% sok” to wciąż cukier — bez błonnika owocu. Nie daj się nabrać na „naturalne”.',
        coDalej: 'Zobacz <a href="fruktoza-w-owocach">fruktozę</a> i <a href="alkohol-kalorie-ktorych-nie-liczysz">kalorie z alkoholu</a>.'
    },
    {
        slug: 'obiad-po-20-czy-psuje',
        emoji: '🌙',
        title: 'Obiad po 20:00 — czy to cokolwiek psuje',
        subtitle: 'Godzina posiłku nie zmienia bilansu. Ważniejsze, co i ile jesz — i czy po 20 nie robisz „drugiej kolacji”.',
        meta: 'Czy jedzenie po 20:00 tuczy — godzina posiłku a bilans kalorii, dlaczego wieczorne jedzenie kojarzy się z tyciem i co naprawdę ma znaczenie.',
        category: 'odchudzanie',
        lead: 'Organizm nie ma „zamknięcia kasy” o 20:00. Tyjesz od nadwyżki kalorii w całym dniu — nie od tego, że obiad wypadł wieczorem.',
        sections: [
            { h2: 'Skąd mit', p: 'Wieczorne jedzenie często jest dodatkiem do już zjedzonych kalorii — podjadanie przed TV. Winna jest suma, nie zegarek.' },
            { h2: 'Co naprawdę ma znaczenie', p: 'Bilans dnia i jakość snu. Ciężki, tłusty posiłek tuż przed snem może pogorszyć sen — i to jest jedyny realny argument.' },
            { h2: 'Kiedy uważać', p: 'Przy refluksie i złym śnie zjedz ostatni duży posiłek 2–3 h przed. Poza tym jedz, kiedy ci wygodnie.' }
        ],
        bullets: ['<strong>Bilans dnia</strong> — nie godzina.', '<strong>2–3 h przed snem</strong> — dla komfortu trawienia.', '<strong>Bez „drugiej kolacji”</strong> — to ona tyje.'],
        uwaga: 'Jeśli po 20 jesz z nudów, a nie głodu — problem to nawyk, nie pora posiłku.',
        coDalej: 'Zobacz <a href="weglowodany-na-noc">węglowodany na noc</a> i <a href="podjadanie-wieczorem">podjadanie wieczorem</a>.'
    },
    {
        slug: 'redukcja-bez-wagi',
        emoji: '📏',
        title: 'Redukcja bez wagi — po czym poznać, że działa',
        subtitle: 'Waga potrafi kłamać (woda, glikogen). Miara, zdjęcia i ciuchy mówią więcej niż liczba na wyświetlaczu.',
        meta: 'Jak mierzyć redukcję bez wagi — centymetr, zdjęcia i ubrania zamiast wagi: dlaczego waga potrafi stać, a sylwetka i tak się zmienia.',
        category: 'odchudzanie',
        lead: 'Waga skacze o 1–2 kg w ciągu doby przez wodę i glikogen. Centymetr w pasie i stare jeansy pokazują trend lepiej niż codzienne ważenie.',
        sections: [
            { h2: 'Czemu waga kłamie', p: 'Sól, węglowodany, hormony i trening zmieniają retencję wody. Możesz chudnąć w tłuszczu, a waga stoi — i odwrotnie.' },
            { h2: 'Co mierzyć', p: 'Obwód pasa i bioder raz w tygodniu, zdjęcia co 2–4 tygodnie, i to, jak leżą ubrania. To realny obraz, nie szum dzienny.' },
            { h2: 'Jak ważyć, jeśli już', p: 'Rano, po toalecie, na czczo — i patrz na średnią z tygodnia, nie na pojedynczy pomiar.' }
        ],
        bullets: ['<strong>Pas + zdjęcia</strong> — lepsze niż waga.', '<strong>Raz w tygodniu</strong> — nie codziennie.', '<strong>Średnia z tygodnia</strong> — jeśli ważysz.'],
        uwaga: 'Codzienne ważenie u osób wrażliwych nakręca obsesję — jeśli waga psuje ci humor, schowaj ją na tydzień.',
        coDalej: 'Zobacz <a href="waga-stoi-a-ubrania-luzniejsze">waga stoi, a ubrania luźniejsze</a> i <a href="dlaczego-waga-skacze-o-2kg">czemu waga skacze</a>.'
    },
    {
        slug: 'efekt-jojo-jak-nie-nakarmic',
        emoji: '🪀',
        title: 'Efekt jojo — dlaczego wraca i jak go nie nakarmić',
        subtitle: 'Jojo to nie „słaba wola”, tylko dieta, której nie da się trzymać. Wracasz do starych nawyków — i waga wraca.',
        meta: 'Efekt jojo — dlaczego waga wraca po diecie, jak go uniknąć, czym różni się trwała zmiana nawyków od restrykcyjnej diety.',
        category: 'odchudzanie',
        lead: 'Jojo bierze się stąd, że po diecie wracasz do tego, co cię utuczyło. Organizm nie „pamięta” wagi — pamiętasz ty, że znów jesz jak kiedyś.',
        sections: [
            { h2: 'Dlaczego wraca', p: 'Restrykcyjne diety kończą się, a nawyki zostają. Do tego po głodówce apetyt rośnie, a metabolizm lekko zwalnia — waga wraca z nawiązką.' },
            { h2: 'Jak uniknąć', p: 'Zamiast diety „na 8 tygodni” zmieniaj nawyki, które zostaną. Wolniejszy spadek, ale trwały. To nie wyścig.' },
            { h2: 'Po redukcji', p: 'Nie wracaj do starych porcji z dnia na dzień. Przejście w utrzymanie: lekko podbij kalorie, pilnuj białka i kroków.' }
        ],
        bullets: ['<strong>Zmieniaj nawyki</strong> — nie „przechodź dietę”.', '<strong>Wolniej, ale trwale</strong> — to działa.', '<strong>Utrzymanie</strong> — to osobny etap, nie koniec.'],
        uwaga: 'Diety „cud” i głodówki to fabryka jojo. Jeśli coś obiecuje 5 kg w tydzień — zapłacisz za to później.',
        coDalej: 'Zobacz <a href="deficyt-500-czy-700">deficyt 500 czy 700</a> i <a href="detoksy-chudniesz-na-wodzie">detoksy</a>.'
    },
    {
        slug: 'podjadanie-wieczorem',
        emoji: '📺',
        title: 'Podjadanie wieczorem — jak je uciąć bez silnej woli',
        subtitle: 'Wieczorne podjadanie to zwykle nuda i nawyk, nie głód. Zmień rutynę, nie walcz z lodówką siłą.',
        meta: 'Jak przestać podjadać wieczorem — dlaczego wieczorem ciągnie do jedzenia, jak odróżnić głód od nudy i proste triki na wieczorny nawyk.',
        category: 'odchudzanie',
        lead: 'Wieczorne podjadanie rzadko jest głodem — to nuda, stres i nawyk „coś do TV”. Walcz z rutyną, nie z apetytem.',
        sections: [
            { h2: 'Dlaczego wieczorem', p: 'Po całym dniu masz mniej samokontroli, a nuda i zmęczenie szukają nagrody. Do tego telewizja = bezmyślne jedzenie.' },
            { h2: 'Triki', p: 'Nie trzymaj słodyczy na widoku, jedz sycącą kolację z białkiem, umyj zęby od razu po kolacji i zamień podjadanie na herbatę albo spacer.' },
            { h2: 'Co jeśli to głód', p: 'Jeśli naprawdę głodny — zjedz twaróg, jogurt albo jajko. To syci, a nie nakręca. Nie głodź się do rana.' }
        ],
        bullets: ['<strong>Po kolacji umyj zęby</strong> — sygnał końca.', '<strong>Schowaj słodycze</strong> — z oczu, z myśli.', '<strong>Głód? Twaróg</strong> — nie czekolada.'],
        uwaga: 'Zbyt mała kolacja to przepis na nocną wizytę w lodówce — zostaw sobie sycący, białkowy posiłek wieczorem.',
        coDalej: 'Zobacz <a href="jedzenie-z-nudow">jedzenie z nudów</a> i <a href="glod-vs-apetyt">głód vs apetyt</a>.'
    },
    {
        slug: 'kalorie-na-oko-dlaczego-sie-mylisz',
        emoji: '👀',
        title: 'Kalorie „na oko” — dlaczego mylisz się o 300 kcal',
        subtitle: 'Ludzie notorycznie zaniżają porcje o 20–40%. Łyżka oliwy, garść orzechów — i 300 kcal znika.',
        meta: 'Dlaczego liczenie kalorii na oko zawodzi — jak duże są błędy przy porcjach, które produkty łatwo niedoszacować i jak ważyć, by liczyć realnie.',
        category: 'odchudzanie',
        lead: 'Badania pokazują, że ludzie niedoszacowują to, co jedzą, średnio o 20–40%. „Łyżeczka” masła orzechowego potrafi mieć 2× tyle kalorii, co myślisz.',
        sections: [
            { h2: 'Gdzie są błędy', p: 'Tłuszcze (oliwa, masło, orzechy), sosy i „garści”. Łyżka oliwy to 120 kcal, a „trochę” na patelni łatwo robi się z trzech.' },
            { h2: 'Skala problemu', p: 'Trzy niedoszacowane rzeczy dziennie po 100 kcal = 300 kcal. Przy deficycie 500 to praktycznie kasuje postęp.' },
            { h2: 'Jak to naprawić', p: 'Waż przez 1–2 tygodnie, żeby nauczyć oko realnych porcji. Potem liczysz sprawniej, ale raz na jakiś czas wróć do wagi.' }
        ],
        bullets: ['<strong>Waż 1–2 tygodnie</strong> — kalibracja oka.', '<strong>Tłuszcze i sosy</strong> — tu błąd jest największy.', '<strong>300 kcal dziennie</strong> — tyle „ginie” na oko.'],
        uwaga: 'Nie licz na pamięć w restauracjach — porcje bywają 1,5× większe niż domowe. Lepiej założyć więcej.',
        coDalej: 'Zobacz <a href="tracking-kalorii-bez-obsesji">tracking bez obsesji</a> i <a href="zamienniki-tnace-500-kcal">zamienniki tnące 500 kcal</a>.'
    },
    {
        slug: 'zamienniki-tnace-500-kcal',
        emoji: '🔁',
        title: 'Zamienniki, które tną 500 kcal bez uczucia głodu',
        subtitle: 'Ta sama objętość, mniej kalorii. Majonez na jogurt, cola na zero, tłuste mięso na chude.',
        meta: 'Proste zamienniki produktów — jak uciąć 500 kcal dziennie bez głodu: zamiana majonezu, napojów i tłustych produktów na lżejsze.',
        category: 'odchudzanie',
        lead: 'Nie musisz jeść mniej — wystarczy jeść mądrzej. Kilka zamian dziennie potrafi uciąć 500 kcal przy tej samej objętości talerza.',
        sections: [
            { h2: 'Napojowe', p: 'Cola → zero: −140 kcal. Sok → woda z cytryną: −110 kcal. Latte z syropem → czarna kawa: −200 kcal.' },
            { h2: 'Na talerzu', p: 'Majonez → jogurt naturalny: −80 kcal na łyżce. Tłusta wieprzowina → pierś z kurczaka: −150 kcal. Ser żółty → twaróg: −200 kcal.' },
            { h2: 'Przekąskowe', p: 'Chipsy → popcorn bez tłuszczu: −200 kcal. Baton → owoc + jogurt: −150 kcal. Orzechy garść → mniejsza garść: −100 kcal.' }
        ],
        bullets: ['<strong>Napoje</strong> — najłatwiejsze cięcie.', '<strong>Majonez → jogurt</strong> — duża oszczędność.', '<strong>Te same porcje</strong> — mniej kalorii.'],
        uwaga: 'Nie zamieniaj wszystkiego naraz — wprowadzaj 2–3 zmiany, które zostaną, zamiast rewolucji na tydzień.',
        coDalej: 'Zobacz <a href="plynne-kalorie-sok-to-nie-owoc">płynne kalorie</a> i <a href="sosy-gdzie-siedzi-200-kcal">sosy</a>.'
    },
    {
        slug: 'dlaczego-nie-chudniesz-na-1200-kcal',
        emoji: '🛑',
        title: 'Dlaczego nie chudniesz na 1200 kcal',
        subtitle: '1200 kcal brzmi jak dieta, a bywa za mało — i sabotuje postęp głodem, brakami i spadkiem energii.',
        meta: 'Dlaczego 1200 kcal nie działa — za niski deficyt, głód, utrata mięśni i spadek NEAT, czyli jak za mało kalorii blokuje odchudzanie.',
        category: 'odchudzanie',
        lead: '1200 kcal to często mniej niż podstawowa przemiana materii dorosłego. Organizm odpowiada głodem, mniejszą energią i mniejszym ruchem — i waga staje.',
        sections: [
            { h2: 'Co się dzieje', p: 'Przy zbyt niskich kaloriach spada NEAT (spontaniczny ruch), pogarsza się sen i rośnie głód. Deficyt na papierze topnieje, bo ciało oszczędza.' },
            { h2: 'Głód i mięśnie', p: 'Za mało białka i kalorii = organizm sięga po mięśnie. Chudniesz, ale nie z tłuszczu — z mięśni. Stąd „skinny fat”.' },
            { h2: 'Co zamiast', p: 'Policz utrzymanie i tnij 400–600 kcal. Dla większości kobiet to 1500–1800 kcal, nie 1200. Więcej jedzenia, lepszy efekt.' }
        ],
        bullets: ['<strong>Policz utrzymanie</strong> — nie zgaduj 1200.', '<strong>1500–1800 kcal</strong> — częstszy rozsądny cel.', '<strong>Białko wysoko</strong> — chroń mięśnie.'],
        uwaga: '1200 kcal ma sens tylko u bardzo niskich, mało aktywnych osób — i to krótkoterminowo, pod okiem dietetyka.',
        coDalej: 'Zobacz <a href="deficyt-500-czy-700">deficyt 500 czy 700</a> i <a href="metabolizm-po-30-mit-czy-fakt">metabolizm po 30.</a>.'
    },
    {
        slug: 'produkty-ktore-syca',
        emoji: '🍽️',
        title: 'Produkty, które naprawdę sycą — ranking sytości',
        subtitle: 'Indeks sytości: ziemniaki, jajka i owsianka biją rogaliki. Wybieraj to, co trzyma cię najedzonym.',
        meta: 'Ranking sycących produktów — ziemniaki, jajka, owsianka i białko: które jedzenie daje najdłuższą sytość i jak jeść, by nie głodnieć.',
        category: 'odchudzanie',
        lead: 'Nie wszystkie kalorie sycą tak samo. Ziemniaki i jajka trzymają najedzonego godzinami, a rogalik z kawą — ledwo chwilę.',
        sections: [
            { h2: 'Indeks sytości', p: 'W badaniach najwyżej wypadają: gotowane ziemniaki, ryby, owsianka, jajka, jabłka, mięso. Najniżej — rogaliki, ciasta, batony.' },
            { h2: 'Dlaczego', p: 'Białko i błonnik + woda + objętość = sytość. Kaloryczne, ale puste produkty (cukier, tłuszcz) nasycają najsłabiej.' },
            { h2: 'Jak to wykorzystać', p: 'Buduj posiłki na białku i warzywach, dodaj ziemniaki/kaszę zamiast frytek i białego chleba. Mniej głodu, łatwiejszy deficyt.' }
        ],
        bullets: ['<strong>Ziemniaki, jajka, owsianka</strong> — top sytości.', '<strong>Białko + błonnik</strong> — baza każdego posiłku.', '<strong>Unikaj pustych kalorii</strong> — nie nasycają.'],
        uwaga: 'Sycące nie znaczy niskokaloryczne — orzechy sycą, ale mają dużo kcal. Licz je, tylko się nie bój.',
        coDalej: 'Zobacz <a href="volume-eating-jak-jesc-duzo-i-chudnac">volume eating</a> i <a href="blonnik-a-sytosc">błonnik a sytość</a>.'
    },
    {
        slug: 'metabolizm-po-30-mit-czy-fakt',
        emoji: '🎂',
        title: 'Metabolizm po 30. — mit czy fakt',
        subtitle: 'Spowolnienie metabolizmu po 30. to mit. Prawdziwy spadek zaczyna się koło 60. — wcześniej to styl życia.',
        meta: 'Czy metabolizm zwalnia po 30 — co mówią badania o spadku przemiany materii z wiekiem, ile to naprawdę kcal i co naprawdę zmienia się z wiekiem.',
        category: 'odchudzanie',
        lead: 'Badania pokazują, że metabolizm spoczynkowy jest stabilny od 20. do 60. roku życia. „Zwalnia po 30” to wymówka — winny jest ruch i nawyki.',
        sections: [
            { h2: 'Co mówią badania', p: 'PPM (spoczynkowa przemiana) spada realnie dopiero po ~60. roku życia, o ~1% rocznie. Po 30. różnicy praktycznie nie ma.' },
            { h2: 'Skąd ten mit', p: 'Z wiekiem ludzie mniej się ruszają i tracą mięśnie — to obniża dzienne spalanie. Ale to efekt stylu życia, nie „zepsutego metabolizmu”.' },
            { h2: 'Co robić', p: 'Trzymaj masę mięśniową (trening siłowy + białko) i codzienny ruch. To utrzymuje spalanie bez względu na metrykę.' }
        ],
        bullets: ['<strong>20–60 lat</strong> — metabolizm stabilny.', '<strong>Winny ruch i mięśnie</strong> — nie wiek.', '<strong>Siła + białko</strong> — trzymają spalanie.'],
        uwaga: '„Zepsuty metabolizm” po dietach-cud istnieje krótkotrwale — to adaptacja, która mija po powrocie do normalnego jedzenia.',
        coDalej: 'Zobacz <a href="dlaczego-nie-chudniesz-na-1200-kcal">czemu nie chudniesz na 1200</a> i <a href="neat-kroki-wiecej-niz-silownia">NEAT i kroki</a>.'
    },
    {
        slug: 'okno-zywieniowe-16-8',
        emoji: '⏱️',
        title: 'Okno żywieniowe 16/8 — czy to coś więcej niż kalorie',
        subtitle: 'Intermittent fasting to narzędzie na mniej posiłków, nie magia. Bez deficytu kalorii nie schudniesz.',
        meta: 'Okno żywieniowe 16/8 — jak działa intermittent fasting, czy przyspiesza odchudzanie, dla kogo jest i czy to coś więcej niż ograniczenie kalorii.',
        category: 'odchudzanie',
        lead: '16/8 to jedzenie w 8-godzinnym oknie i 16 h postu. Samo w sobie nie spala tłuszczu — działa, bo łatwiej zjeść mniej, gdy masz mniej czasu na jedzenie.',
        sections: [
            { h2: 'Jak działa', p: 'Ograniczasz okno jedzenia, więc zwykle jesz mniej posiłków i mniej kalorii. To cała „magia” — reszta to wygoda i rutyna.' },
            { h2: 'Czy przyspiesza', p: 'Nie ma solidnych dowodów, że 16/8 spala więcej niż ten sam deficyt w normalnym rozkładzie. Liczy się bilans kalorii.' },
            { h2: 'Dla kogo', p: 'Dla tych, którzy wolą 2–3 większe posiłki i nie lubią śniadań. Nie dla osób z tendencją do napadów i przy intensywnych treningach rano.' }
        ],
        bullets: ['<strong>To narzędzie</strong> — nie cud.', '<strong>Deficyt nadal rządzi</strong> — bez niego nic.', '<strong>2–3 większe posiłki</strong> — dla lubiących.'],
        uwaga: 'Jeśli na czczo trenujesz ciężko i mdlejesz — jedz przed treningiem. IF nie jest obowiązkowe.',
        coDalej: 'Zobacz <a href="deficyt-kaloryczny-praktyka">deficyt w praktyce</a> i <a href="bialko-na-redukcji-ile-zeby-nie-stracic">białko na redukcji</a>.'
    },
    {
        slug: 'bialko-na-redukcji-ile-zeby-nie-stracic',
        emoji: '🥩',
        title: 'Białko na redukcji — ile, żeby nie zjeść mięśni',
        subtitle: 'Na deficycie białko chroni mięśnie i trzyma sytość. Celuj w górę zakresu: 1,8–2,2 g/kg.',
        meta: 'Ile białka na redukcji — dlaczego więcej białka chroni mięśnie, jaka dawka g/kg i jak domknąć ją, chudnąc bez utraty masy mięśniowej.',
        category: 'odchudzanie',
        lead: 'Na redukcji organizm chętnie sięga po mięśnie na energię. Wysokie białko to najtańsze „ubezpieczenie” — i najskuteczniejsze narzędzie na głód.',
        sections: [
            { h2: 'Ile białka', p: '1,8–2,2 g/kg masy ciała przy redukcji. Więcej niż na masie — bo deficyt sprzyja rozpadowi mięśni, a białko to hamuje.' },
            { h2: 'Dlaczego syci', p: 'Białko ma najwyższą termogenezę i najdłużej syci. Na redukcji to podwójna korzyść: mniej głodu, lepszy skład ciała.' },
            { h2: 'Jak domknąć', p: 'Rozłóż na 3–4 posiłki po 30–40 g: jajka, twaróg, kurczak, ryba, skyr, WPC. Pilnuj, żeby białko było w każdym posiłku.' }
        ],
        bullets: ['<strong>1,8–2,2 g/kg</strong> — na redukcji.', '<strong>30–40 g na posiłek</strong> — rozłóż równo.', '<strong>Białko w każdym posiłku</strong> — zasada.'],
        uwaga: 'Samo białko bez treningu siłowego nie uratuje mięśni — połącz je z ciężarami.',
        coDalej: 'Zobacz <a href="utrata-miesni-na-redukcji">utratę mięśni na redukcji</a> i <a href="sila-na-redukcji-dlaczego-nie-tylko-cardio">siłę na redukcji</a>.'
    },
    {
        slug: 'tluszcz-z-brzucha-schodzi-ostatni',
        emoji: '🎯',
        title: 'Tłuszcz z brzucha — dlaczego schodzi ostatni',
        subtitle: 'Nie spalisz tłuszczu punktowo. Brzuch schodzi tam, gdzie organizm chce — i zwykle na końcu.',
        meta: 'Dlaczego tłuszcz z brzucha schodzi ostatni — czy da się spalać miejscowo, od czego zależy kolejność i co naprawdę działa na brzuch.',
        category: 'odchudzanie',
        lead: 'Brzuszki nie spalają tłuszczu z brzucha. Organizm bierze tłuszcz z całego ciała, a o kolejności decyduje genetyka — brzuch bywa ostatni w kolejce.',
        sections: [
            { h2: 'Czemu nie punktowo', p: 'Tkanka tłuszczowa oddaje tłuszcz globalnie, nie z „ćwiczonego” miejsca. Brzuszki budują mięsień, nie spalają tłuszczu nad nim.' },
            { h2: 'Co decyduje o kolejności', p: 'Genetyka i hormony. U mężczyzn tłuszcz lubi brzuch, u kobiet biodra. Deficyt kaloryczny działa wszędzie — po prostu nierówno.' },
            { h2: 'Co działa', p: 'Deficyt + trening siłowy + białko. Brzuch zniknie, gdy całościowy poziom tłuszczu spadnie — to kwestia czasu, nie ćwiczeń na „boczki”.' }
        ],
        bullets: ['<strong>Deficyt kaloryczny</strong> — jedyne co spala.', '<strong>Brzuszki = mięsień</strong> — nie spalanie.', '<strong>Cierpliwość</strong> — brzuch schodzi na końcu.'],
        uwaga: 'Szeroki pas i tłuszcz wisceralny (wewnątrz brzucha) to przede wszystkim kwestia kalorii i alkoholu — nie ćwiczeń.',
        coDalej: 'Zobacz <a href="deficyt-kaloryczny-praktyka">deficyt w praktyce</a> i <a href="stres-kortyzol-i-brzuch">kortyzol i brzuch</a>.'
    },
    {
        slug: 'waga-stoi-a-ubrania-luzniejsze',
        emoji: '👖',
        title: 'Waga stoi, a ubrania luźniejsze — co się dzieje',
        subtitle: 'Rekompozycja: tracisz tłuszcz i budujesz mięśnie naraz. Waga się nie zmienia, sylwetka tak.',
        meta: 'Waga stoi a ubrania luźniejsze — rekompozycja sylwetki: jak tracić tłuszcz i budować mięśnie jednocześnie, i dlaczego waga nie pokazuje postępu.',
        category: 'odchudzanie',
        lead: 'Jeśli waga stoi, a pas się zmniejsza — tracisz tłuszcz i budujesz mięśnie jednocześnie. To najlepszy możliwy scenariusz, nie powód do paniki.',
        sections: [
            { h2: 'Co to jest', p: 'Rekompozycja: kilogram tłuszczu (duża objętość) znika, kilogram mięśnia (mniejsza objętość) przybywa. Waga taka sama, sylwetka lepsza.' },
            { h2: 'Kiedy występuje', p: 'U początkujących, po przerwie od treningu i przy lekkim deficycie z wysokim białkiem. To najszybsza droga do „wyrzeźbienia”.' },
            { h2: 'Jak to utrzymać', p: 'Lekki deficyt, trening siłowy i 1,8–2,2 g białka. Mierz pas i rób zdjęcia — waga przestaje być jedynym wskaźnikiem.' }
        ],
        bullets: ['<strong>Rekompozycja</strong> — tłuszcz na mięśnie.', '<strong>Mierz pas</strong> — nie tylko wagę.', '<strong>Białko + siła</strong> — warunki rekompozycji.'],
        uwaga: 'Nie tnij kalorii mocniej, gdy waga stoi a ubrania luźniejsze — to znak, że działasz dobrze, nie że trzeba przyspieszać.',
        coDalej: 'Zobacz <a href="redukcja-bez-wagi">redukcję bez wagi</a> i <a href="utrata-miesni-na-redukcji">utratę mięśni</a>.'
    },
    {
        slug: 'detoksy-chudniesz-na-wodzie',
        emoji: '🥤',
        title: 'Detoksy i głodówki — dlaczego chudniesz na wodzie',
        subtitle: 'Detoks schudnie cię o 2 kg — wody i glikogenu. Tłuszcz zostaje, a waga wraca po pierwszym obiedzie.',
        meta: 'Czy detoksy działają — dlaczego traci się na nich wodę zamiast tłuszczu, co dają soki i głodówki i dlaczego waga wraca.',
        category: 'odchudzanie',
        lead: 'Detoks sokowy daje szybki spadek wagi — ale to woda i glikogen, nie tłuszcz. Wracasz do jedzenia i waga wraca. Organizm sam się „detoksuje”.',
        sections: [
            { h2: 'Skąd spadek wagi', p: 'Bez węglowodanów i soli organizm traci wodę związaną z glikogenem. 2 kg „zgubione” w tydzień to głównie płyny.' },
            { h2: 'Czy to detoks', p: 'Wątroba i nerki detoksykują cię non stop — nie potrzebują soków. „Toksyny” to marketing, nie fizjologia.' },
            { h2: 'Co zamiast', p: 'Realny deficyt kalorii z normalnym jedzeniem. Wolniej, ale chudniesz z tłuszczu i efekt zostaje.' }
        ],
        bullets: ['<strong>To woda i glikogen</strong> — nie tłuszcz.', '<strong>Organizm się sam detoksykuje</strong> — masz wątrobę.', '<strong>Deficyt z jedzeniem</strong> — jedyne trwałe.'],
        uwaga: 'Głodówki i detoksy potrafią skończyć się napadem objadania — szybki spadek, szybki powrót z nawiązką.',
        coDalej: 'Zobacz <a href="efekt-jojo-jak-nie-nakarmic">efekt jojo</a> i <a href="deficyt-500-czy-700">deficyt kaloryczny</a>.'
    },
    {
        slug: 'kroki-dziennie-ile-realnie',
        emoji: '🚶',
        title: 'Kroki dziennie — ile naprawdę spalasz',
        subtitle: '10 000 kroków to ~300–400 kcal. To nie trening, ale codzienna baza, która utrzymuje spalanie.',
        meta: 'Ile kalorii spalają kroki — 10 000 kroków, ile to kcal, czy kroki zastąpią trening i dlaczego NEAT to podstawa redukcji.',
        category: 'odchudzanie',
        lead: '10 000 kroków to dla większości ~300–400 kcal. Nie schudniesz od samych spacerów, ale kroki to fundament, bez którego redukcja stoi.',
        sections: [
            { h2: 'Ile to kcal', p: 'Zależnie od wagi i tempa: 10 000 kroków to 300–500 kcal. To sporo — tyle co godzina marszu, ale rozbite na cały dzień.' },
            { h2: 'Czemu to ważne', p: 'NEAT (ruch poza treningiem) to nawet 15–30% dziennego spalania. Mało kroków = wolniejszy metabolizm dnia codziennego.' },
            { h2: 'Jak dobić', p: 'Spacer do pracy, schody zamiast windy, rozmowa telefoniczna na nogach. Zacznij od 6–8 tys. i zwiększaj.' }
        ],
        bullets: ['<strong>10 000 kroków ≈ 300–400 kcal</strong> — baza.', '<strong>NEAT</strong> — większy gracz niż siłownia.', '<strong>Dodawaj po 1000</strong> — stopniowo.'],
        uwaga: 'Kroki nie zastąpią treningu siłowego, ale trening nie zastąpi kroków — potrzebujesz obu.',
        coDalej: 'Zobacz <a href="neat-kroki-wiecej-niz-silownia">NEAT więcej niż siłownia</a> i <a href="metabolizm-po-30-mit-czy-fakt">metabolizm po 30.</a>.'
    },
    {
        slug: 'stres-kortyzol-i-brzuch',
        emoji: '😰',
        title: 'Stres, kortyzol i brzuch — czy stres tuczy',
        subtitle: 'Przewlekły stres podnosi kortyzol, a ten sprzyja apetytowi i tłuszczowi na brzuchu. Ale to nie wyrok.',
        meta: 'Stres a tycie — jak kortyzol wpływa na apetyt i tłuszcz brzuszny, czy stres realnie blokuje odchudzanie i co z tym zrobić.',
        category: 'odchudzanie',
        lead: 'Przewlekły stres = stale podniesiony kortyzol = większy apetyt na słodycze i skłonność do magazynowania tłuszczu na brzuchu.',
        sections: [
            { h2: 'Jak to działa', p: 'Kortyzol podnosi apetyt i przesuwa magazynowanie tłuszczu w okolice brzucha (tłuszcz wisceralny). Do tego gorszy sen i mniej ruchu.' },
            { h2: 'Czy to blokuje redukcję', p: 'Nie bezpośrednio — stres nie kasuje praw fizyki. Ale utrudnia: podjadasz, śpisz gorzej, masz mniej sił na trening.' },
            { h2: 'Co robić', p: 'Sen to najtańszy „anty-stres”. Do tego spacer, siłownia, ograniczenie kofeiny wieczorem. Nie da się wyzerować stresu, ale da się nim zarządzać.' }
        ],
        bullets: ['<strong>Sen 7–8 h</strong> — obniża kortyzol.', '<strong>Trening i spacer</strong> — naturalny reset.', '<strong>Nie zajadaj stresu</strong> — przerwij pętlę.'],
        uwaga: 'Kortyzol to nie „hormon tycia” — to normalna część fizjologii. Problem to przewlekłe napięcie, nie pojedynczy stres.',
        coDalej: 'Zobacz <a href="sen-6-czy-8-godzin-a-waga">sen a waga</a> i <a href="jedzenie-z-nudow">jedzenie z nudów</a>.'
    },
    {
        slug: 'sen-6-czy-8-godzin-a-waga',
        emoji: '😴',
        title: 'Sen 6 vs 8 godzin — jak to wpływa na wagę',
        subtitle: 'Krótki sen podnosi głód i apetyt na słodycze. 6 zamiast 8 godzin potrafi po cichu dołożyć 300 kcal dziennie.',
        meta: 'Sen a waga — ile snu trzeba, by chudnąć, jak niedobór snu podnosi głód i apetyt i dlaczego sen to część diety.',
        category: 'odchudzanie',
        lead: 'Po nieprzespanej nocy rośnie grelina (głód), spada leptyna (sytość), a mózg mocniej reaguje na słodycze. Sen to cichy gracz odchudzania.',
        sections: [
            { h2: 'Hormony', p: 'Niedobór snu podnosi grelinę i obniża leptynę — czujesz większy głód i mniejszą sytość. Do tego kortyzol i chęć na węgle.' },
            { h2: 'Ile to kcal', p: 'Badania: krótki sen wiąże się z +300 kcal dziennie, głównie z przekąsek. To dokładnie tyle, ile wynosi twój deficyt.' },
            { h2: 'Ile spać', p: '7–9 godzin. Regularność ważniejsza niż weekendowe „odespanie”. Stała pora snu to darmowe wsparcie diety.' }
        ],
        bullets: ['<strong>7–9 h snu</strong> — norma dla dorosłych.', '<strong>Stała pora</strong> — ważniejsza niż długość.', '<strong>Sen = część diety</strong> — nie dodatek.'],
        uwaga: 'Kofeina po 15 i ekran w łóżku to dwaj najwięksi złodzieje snu — zacznij od nich.',
        coDalej: 'Zobacz <a href="stres-kortyzol-i-brzuch">stres i kortyzol</a> i <a href="kofeina-ile-kiedy-sen">kofeinę i sen</a>.'
    },
    {
        slug: 'jedzenie-z-nudow',
        emoji: '🥱',
        title: 'Jedzenie z nudów — jak przerwać pętlę',
        subtitle: 'Nuda to najczęstszy fałszywy głód. Zamiast jeść, zrób coś rękami — nawyk zniknie szybciej, niż myślisz.',
        meta: 'Jedzenie z nudów — jak rozpoznać fałszywy głód, dlaczego nuda ciągnie do lodówki i proste sposoby na przerwanie nawyku.',
        category: 'odchudzanie',
        lead: 'Jedzenie z nudów to nie głód — to szukanie bodźca. Mózg chce stymulacji, a lodówka jest najbliżej. Zmień bodziec, nie dietę.',
        sections: [
            { h2: 'Skąd się bierze', p: 'Nuda i rutyna szukają dopaminy — a jedzenie daje ją natychmiast. To nawyk, nie potrzeba energetyczna.' },
            { h2: 'Test na nudę', p: 'Zapytaj: „Czy zjadłbym teraz jabłko?” Jeśli nie — nie jesteś głodny, tylko znudzony. Głód zadowoli każde jedzenie.' },
            { h2: 'Co robić', p: 'Zajmij ręce: spacer, telefon do kogoś, sprzątanie, hobby. Wypij wodę. Ustal „godziny bez podjadania” poza posiłkami.' }
        ],
        bullets: ['<strong>Test jabłka</strong> — głód zje wszystko.', '<strong>Zajmij ręce</strong> — nuda minie.', '<strong>Woda + 10 min</strong> — zanim sięgniesz.'],
        uwaga: 'Trzymanie słodyczy „na widoku” zamienia nudę w jedzenie automatycznie — schowaj je, a częstotliwość spadnie.',
        coDalej: 'Zobacz <a href="glod-vs-apetyt">głód vs apetyt</a> i <a href="podjadanie-wieczorem">podjadanie wieczorem</a>.'
    },
    {
        slug: 'sosy-gdzie-siedzi-200-kcal',
        emoji: '🥣',
        title: 'Sosy i dodatki — gdzie chowa się 200 kcal',
        subtitle: 'Majonez, sos czosnkowy i dressing potrafią dołożyć więcej kalorii niż cały obiad. Sprawdzaj, czym polewasz.',
        meta: 'Kalorie w sosach — ile kcal ma majonez, sos czosnkowy i ketchup, gdzie chowają się dodatkowe kalorie i jak je ograniczyć.',
        category: 'odchudzanie',
        lead: 'Łyżka majonezu to ~100 kcal, sosu czosnkowego ~80. Dwie łyżki do obiadu i „lekka sałatka” ma tyle kalorii co drugi posiłek.',
        sections: [
            { h2: 'Ile to kosztuje', p: 'Majonez ~700 kcal/100 g, sos czosnkowy ~500, dressing ~300, ketchup ~100. „Trochę sosu” potrafi dołożyć 200+ kcal.' },
            { h2: 'Gdzie się chowa', p: 'Sałatki „fit” z dressingiem, wrap z sosem, frytki z dipem. Sosy to najczęściej pomijane kalorie w liczeniu.' },
            { h2: 'Jak ograniczyć', p: 'Jogurt naturalny zamiast majonezu, sos na bazie twarogu, ketchup zamiast kremowych. Albo sos osobno i maczaj, nie polewaj.' }
        ],
        bullets: ['<strong>2 łyżki majonezu ≈ 200 kcal</strong> — licz.', '<strong>Jogurt zamiast majonezu</strong> — taniej kcal.', '<strong>Sos osobno</strong> — kontrolujesz ilość.'],
        uwaga: '„Lekki” majonez ma mniej kalorii, ale nadal sporo — sprawdzaj etykietę zamiast ufać nazwie.',
        coDalej: 'Zobacz <a href="zamienniki-tnace-500-kcal">zamienniki tnące 500 kcal</a> i <a href="kalorie-na-oko-dlaczego-sie-mylisz">kalorie na oko</a>.'
    },
    {
        slug: 'pierwsze-6-miesiecy-silowni',
        emoji: '🏋️',
        title: 'Pierwsze 6 miesięcy siłowni — czego się spodziewać',
        subtitle: 'Newbie gains: najszybszy postęp w życiu. Wykorzystaj go prostym planem i progresją, nie wymyślaniem.',
        meta: 'Pierwsze 6 miesięcy treningu — newbie gains, ile mięśni można zbudować, czego się spodziewać i jak maksymalnie wykorzystać start.',
        category: 'cwiczenia',
        lead: 'W pierwsze 6–12 miesięcy organizm reaguje na trening najszybciej w życiu. To okno na realne, widoczne postępy — jeśli nie zmarnujesz go na chaos.',
        sections: [
            { h2: 'Newbie gains', p: 'Początkujący potrafią zbudować kilka kilogramów mięśni i podwoić siłę w pół roku. Potem tempo spada — dlatego start jest tak ważny.' },
            { h2: 'Czego się spodziewać', p: 'Szybki wzrost siły, lepsza postura, więcej energii. Wygląd zmienia się wolniej niż liczby na sztandze — nie porównuj się po tygodniu.' },
            { h2: 'Co robić', p: 'Prosty plan 3× w tygodniu, wielostawowe ćwiczenia i progresja co tydzień. Nie 5 splitów i nie „metoda gwiazdy z TikToka”.' }
        ],
        bullets: ['<strong>3× w tygodniu</strong> — wystarczy na start.', '<strong>Wielostawowe</strong> — przysiad, martwy, wyciskanie.', '<strong>Progresja</strong> — co tydzień trochę więcej.'],
        uwaga: 'Nie goń za technikami zaawansowanych — na starcie to progresja i regularność budują 95% efektu.',
        coDalej: 'Zobacz <a href="progresja-jedyne-co-buduje">progresję</a> i <a href="fbw-vs-split">FBW vs split</a>.'
    },
    {
        slug: 'ile-serii-na-miesien',
        emoji: '🔢',
        title: 'Ile serii na mięsień tygodniowo wystarczy',
        subtitle: '10–20 serii na grupę tygodniowo to słodki punkt. Więcej nie znaczy lepiej — regeneracja ma limit.',
        meta: 'Ile serii na mięsień tygodniowo — optymalna objętość treningowa, jak rozłożyć serie i dlaczego więcej nie zawsze znaczy szybciej.',
        category: 'cwiczenia',
        lead: 'Badania pokazują, że 10–20 serii na grupę mięśniową tygodniowo daje najlepszy stosunek efektu do regeneracji. Powyżej 20 serii zysk maleje.',
        sections: [
            { h2: 'Zakres', p: 'Początkujący: 10–12 serii na grupę. Średniozaawansowani: 12–18. Zaawansowani: do 20. Licz serie „robocze”, nie rozgrzewkowe.' },
            { h2: 'Jak rozłożyć', p: 'Lepiej 2× po 8 serii niż 1× 16 — częstszy bodziec i lepsza regeneracja między treningami.' },
            { h2: 'Więcej = lepiej?', p: 'Do pewnego punktu tak. Potem dochodzisz do ściany regeneracji — i to ona, nie objętość, staje się limitem.' }
        ],
        bullets: ['<strong>10–20 serii/grupę/tydz.</strong> — słodki punkt.', '<strong>Rozłóż na 2 treningi</strong> — nie jeden.', '<strong>Serie robocze</strong> — nie rozgrzewka.'],
        uwaga: 'Jeśli po 3 tygodniach nie progresujesz, nie dokładaj od razu serii — sprawdź sen, jedzenie i technikę.',
        coDalej: 'Zobacz <a href="progresja-jedyne-co-buduje">progresję</a> i <a href="regeneracja-miesnie-rosna-poza">regenerację</a>.'
    },
    {
        slug: 'trening-do-upadku-czy-warto',
        emoji: '💥',
        title: 'Trening do upadku mięśniowego — czy warto',
        subtitle: 'Upadek daje dużo zmęczenia za niewiele więcej efektu. Zostaw go na ostatnią serię, nie na cały trening.',
        meta: 'Trening do upadku mięśniowego — czy buduje więcej mięśni, jak często go stosować i dlaczego codzienny upadek spowalnia progres.',
        category: 'cwiczenia',
        lead: 'Trening do upadku (zero powtórzeń w zapasie) daje podobny wzrost mięśni co zostawienie 1–2 powtórzeń — za to dużo więcej zmęczenia.',
        sections: [
            { h2: 'Efekt vs koszt', p: 'Upadek buduje mięśnie, ale kosztuje regenerację. Różnica w hipertrofii wobec „1–2 powtórzenia w zapasie” jest minimalna.' },
            { h2: 'Kiedy używać', p: 'Na izolowanych ćwiczeniach i w ostatniej serii — tam ryzyko techniczne jest małe, a zmęczenie do zniesienia.' },
            { h2: 'Czego unikać', p: 'Upadek na przysiadzie, martwym i wyciskaniu co serię to przepis na kontuzję i wypalenie. Zostaw rezerwę na złożone ruchy.' }
        ],
        bullets: ['<strong>1–2 powt. w zapasie</strong> — zwykle wystarczy.', '<strong>Upadek na końcu</strong> — izolowane, ostatnia seria.', '<strong>Nie na wielostawowych</strong> — ryzyko kontuzji.'],
        uwaga: 'Jeśli po każdym treningu czujesz się wypruty, a siła stoi — winny może być codzienny upadek.',
        coDalej: 'Zobacz <a href="ile-serii-na-miesien">ile serii na mięsień</a> i <a href="regeneracja-miesnie-rosna-poza">regenerację</a>.'
    },
    {
        slug: 'zakwasy-czy-dobry-trening',
        emoji: '🦵',
        title: 'Zakwasy — czy to znak dobrego treningu',
        subtitle: 'Zakwasy to mikrouszkodzenia po nowym bodźcu, nie dowód skuteczności. Możesz budować mięśnie bez bólu.',
        meta: 'Czy zakwasy świadczą o dobrym treningu — skąd się biorą, czy ból mięśni = wzrost i dlaczego brak zakwasów nie znaczy, że trening był zły.',
        category: 'cwiczenia',
        lead: 'Zakwasy (DOMS) pojawiają się, gdy mięsień dostaje nowy bodziec. Nie są wskaźnikiem wzrostu — możesz progresować bez odczuwania bólu.',
        sections: [
            { h2: 'Skąd się biorą', p: 'Mikrouszkodzenia włókien po nietypowym wysiłku — zwłaszcza ekscentrycznym (opuszczanie ciężaru). Szczyt bólu: 24–48 h.' },
            { h2: 'Czy = wzrost', p: 'Nie. Zakwasy korelują z nowością bodźca, nie z hipertrofią. Stały trening daje postępy i coraz mniej zakwasów.' },
            { h2: 'Co z bólem', p: 'Lekki ruch, spacer, sen i białko pomagają. Rozciąganie i „wałkowanie” dają ulgę chwilową — nie przyspieszają realnie regeneracji.' }
        ],
        bullets: ['<strong>Zakwasy ≠ wzrost</strong> — nie goń za bólem.', '<strong>Nowy bodziec</strong> — stąd DOMS.', '<strong>Lekki ruch</strong> — najlepsza ulga.'],
        uwaga: 'Silny ból z obrzękiem i ciemnym moczem po treningu to może być rabdomioliza — to już wizyta u lekarza, nie zakwasy.',
        coDalej: 'Zobacz <a href="regeneracja-miesnie-rosna-poza">regenerację</a> i <a href="rozgrzewka-5-minut">rozgrzewkę</a>.'
    },
    {
        slug: 'rozgrzewka-5-minut',
        emoji: '🔥',
        title: 'Rozgrzewka — 5 minut, które ratuje stawy',
        subtitle: 'Rozgrzewka podnosi temperaturę i przygotowuje stawy. Pominięcie jej to najtańsza droga do kontuzji.',
        meta: 'Jak się rozgrzewać przed treningiem — ile minut, co robić i dlaczego rozgrzewka to inwestycja w stawy i lepszą technikę.',
        category: 'cwiczenia',
        lead: 'Rozgrzewka to nie strata czasu — podnosi temperaturę mięśni, smaruje stawy i przygotowuje układ nerwowy do ciężarów.',
        sections: [
            { h2: 'Po co', p: 'Cieplejsze mięśnie pracują sprawniej, a stawy są lepiej nawilżone. Rozgrzany organizm = mniejsze ryzyko naciągnięć i lepsza technika.' },
            { h2: 'Jak to robić', p: '5–10 min lekkiego cardio (rower, skakanka, marsz) + kilka dynamicznych ruchów (wymachy, krążenia). Potem serie rozgrzewkowe z pustą sztangą.' },
            { h2: 'Co pominąć', p: 'Długie statyczne rozciąganie przed ciężarami — obniża siłę. Zostaw rozciąganie na po treningu.' }
        ],
        bullets: ['<strong>5–10 min</strong> — wystarczy.', '<strong>Cardio + dynamiczne ruchy</strong> — przed treningiem.', '<strong>Statyczne na koniec</strong> — nie na start.'],
        uwaga: 'Im zimniej i im cięższy trening, tym dłuższa rozgrzewka. Przy przysiadzie i martwym nie skacz od razu na ciężar roboczy.',
        coDalej: 'Zobacz <a href="cwiczenia-wielostawowe">ćwiczenia wielostawowe</a> i <a href="przerwa-po-kontuzji">przerwę po kontuzji</a>.'
    },
    {
        slug: 'progresja-jedyne-co-buduje',
        emoji: '📈',
        title: 'Progresja — jedyna rzecz, która naprawdę buduje mięśnie',
        subtitle: 'Mięśnie rosną, gdy dajesz im więcej bodźca. Bez progresji obciążenia robisz w kółko to samo — i stoisz.',
        meta: 'Progresja obciążenia — dlaczego to podstawa budowania mięśni, jak progresować (ciężar, powtórzenia, serie) i co robić, gdy progres staje.',
        category: 'cwiczenia',
        lead: 'Mięsień rośnie w odpowiedzi na coraz większy bodziec. Jeśli od miesięcy robisz te same ciężary i powtórzenia — ciało nie ma powodu się zmieniać.',
        sections: [
            { h2: 'Czym jest progresja', p: 'Stopniowe zwiększanie bodźca: ciężaru, powtórzeń albo serii. Najprościej — dokładasz 1–2 kg, gdy domkniesz zakres.' },
            { h2: 'Jak progresować', p: 'Podwójna progresja: ustal zakres (np. 8–12 powt.), zacznij od dołu, dojdź do góry, dodaj ciężar, zejdź z powtórzeniami. I tak w kółko.' },
            { h2: 'Gdy progres staje', p: 'Sprawdź sen, jedzenie i objętość. Czasem wystarczy tydzień lżejszy (deload), żeby wrócić silniejszym.' }
        ],
        bullets: ['<strong>Ciężar/powt./serie w górę</strong> — progresja.', '<strong>Podwójna progresja</strong> — najprostsza metoda.', '<strong>Deload</strong> — gdy stajesz.'],
        uwaga: 'Progresja to nie dokładanie ciężaru za cenę techniki — zła forma to kontuzja, nie postęp.',
        coDalej: 'Zobacz <a href="ile-serii-na-miesien">ile serii na mięsień</a> i <a href="pierwsze-6-miesiecy-silowni">pierwsze 6 miesięcy</a>.'
    },
    {
        slug: 'martwy-ciag-czy-niezbedny',
        emoji: '🏗️',
        title: 'Martwy ciąg — czy jest niezbędny',
        subtitle: 'Martwy to świetne ćwiczenie, ale nie obowiązkowe. Plecy i nogi zbudujesz też bez niego.',
        meta: 'Czy martwy ciąg jest konieczny — zalety i ryzyko martwego ciągu, dla kogo jest, a kto może go zastąpić innymi ćwiczeniami.',
        category: 'cwiczenia',
        lead: 'Martwy ciąg angażuje pół ciała i buduje potężną siłę. Ale to nie jest ćwiczenie obowiązkowe — dla części osób ryzyko przeważa nad zyskiem.',
        sections: [
            { h2: 'Zalety', p: 'Plecy, pośladki, tył ud, chwyt i core w jednym. Niewiele ćwiczeń daje tyle „za jednym razem”.' },
            { h2: 'Ryzyko', p: 'Przy złej technice i zbyt dużym ciężarze martwy obciąża dolną część pleców. To ćwiczenie, które wymaga szacunku, nie odwagi.' },
            { h2: 'Alternatywy', p: 'Rumuński martwy, hip thrust, wiosłowanie, przysiad. Jeśli martwy ci nie leży — zamień go, zamiast robić na siłę.' }
        ],
        bullets: ['<strong>Świetny, ale nie obowiązkowy</strong> — bez presji.', '<strong>Technika > ciężar</strong> — zawsze.', '<strong>RDL/hip thrust</strong> — sensowne zamienniki.'],
        uwaga: 'Ból dolnej części pleców w trakcie to sygnał stopu — nie „hartuj się”, tylko popraw technikę lub zmień ćwiczenie.',
        coDalej: 'Zobacz <a href="cwiczenia-wielostawowe">ćwiczenia wielostawowe</a> i <a href="przysiad-gleboki-czy-rownolegly">przysiad</a>.'
    },
    {
        slug: 'przysiad-gleboki-czy-rownolegly',
        emoji: '🦵',
        title: 'Przysiad głęboki czy równoległy',
        subtitle: 'Głęboki buduje więcej, równoległy jest bezpieczniejszy dla kolan. Wybierz wg mobilności, nie ego.',
        meta: 'Przysiad głęboki czy równoległy — różnice w aktywacji mięśni, wpływ na kolana i jak wybrać głębokość przysiadu pod swoją mobilność.',
        category: 'cwiczenia',
        lead: 'Głęboki przysiad (poniżej równoległości) mocniej aktywuje pośladki i uda. Równoległy jest łagodniejszy dla kolan i wymaga mniej mobilności.',
        sections: [
            { h2: 'Aktywacja', p: 'Im głębiej, tym więcej pracy pośladków i przywodzicieli. Równoległy skupia się bardziej na czworogłowych.' },
            { h2: 'Kolana', p: 'Głęboki przysiad nie „niszczy kolan” przy dobrej technice. Ale przy ograniczonej mobilności kostek/bioder wymusza złą pozycję — stąd kontuzje.' },
            { h2: 'Co wybrać', p: 'Schodź tak głęboko, jak pozwala ci czysta technika. Lepszy pełny kontrolowany równoległy niż „głęboki” z zaokrąglonymi plecami.' }
        ],
        bullets: ['<strong>Głębiej = więcej pośladków</strong> — ale trudniej.', '<strong>Technika wyznacza głębokość</strong> — nie ego.', '<strong>Mobilność kostek</strong> — klucz do głębi.'],
        uwaga: 'Nie pogłębiaj przysiadu na siłę z bólem kolan — popracuj najpierw nad mobilnością bioder i kostek.',
        coDalej: 'Zobacz <a href="trening-nog-dlaczego-omijasz">trening nóg</a> i <a href="cwiczenia-wielostawowe">ćwiczenia wielostawowe</a>.'
    },
    {
        slug: 'fbw-vs-split',
        emoji: '🔀',
        title: 'Trening FBW vs split — co wybrać na start',
        subtitle: 'FBW (całe ciało 3× w tygodniu) bije splity u początkujących. Częstotliwość > podział partii.',
        meta: 'FBW czy split — który trening lepszy dla początkujących i średniozaawansowanych, zalety treningu całego ciała i kiedy przejść na split.',
        category: 'cwiczenia',
        lead: 'Trening całego ciała (FBW) 3× w tygodniu uderza każdą partię częściej — a częstotliwość to jeden z głównych motorów wzrostu u początkujących.',
        sections: [
            { h2: 'FBW', p: 'Całe ciało na jednym treningu, 3× w tygodniu. Każda partia dostaje bodziec co 48 h. Idealne na start i po przerwie.' },
            { h2: 'Split', p: 'Dzielisz ciało na partie (np. push/pull/nogi). Sensowny, gdy potrzebujesz więcej objętości na partię i trenujesz 4–6× w tygodniu.' },
            { h2: 'Co wybrać', p: 'Początkujący i wracający: FBW. Średniozaawansowani z czasem: push/pull/legs. Nie skacz na 5-dniowy split „bo tak robią zawodowcy”.' }
        ],
        bullets: ['<strong>Początkujący → FBW</strong> — częstotliwość wygrywa.', '<strong>3× w tygodniu</strong> — baza.', '<strong>Split</strong> — dopiero przy większej objętości.'],
        uwaga: 'Najlepszy plan to ten, który robisz co tydzień. FBW 3× bije idealny split, który porzucisz po miesiącu.',
        coDalej: 'Zobacz <a href="ile-serii-na-miesien">ile serii na mięsień</a> i <a href="pierwsze-6-miesiecy-silowni">pierwsze 6 miesięcy</a>.'
    },
    {
        slug: 'odpoczynek-miedzy-seriami',
        emoji: '⏳',
        title: 'Odpoczynek między seriami — ile na siłę, ile na masę',
        subtitle: 'Na siłę odpoczywaj 2–5 min, na hipertrofię 1–2 min. Krótka przerwa to nie lepszy trening, a mniejszy ciężar.',
        meta: 'Ile odpoczywać między seriami — przerwy na siłę vs na masę, jak długość przerwy wpływa na ciężar i kiedy krótkie przerwy mają sens.',
        category: 'cwiczenia',
        lead: 'Długa przerwa = pełna regeneracja = większy ciężar. Krótka przerwa = zmęczenie = mniejsze obciążenie. To prosta zależność, którą warto rozumieć.',
        sections: [
            { h2: 'Na siłę', p: '2–5 min między ciężkimi seriami. Dajesz układowi nerwowemu czas na regenerację ATP — i podnosisz więcej.' },
            { h2: 'Na masę', p: '1–2 min przy umiarkowanych ciężarach wystarcza na hipertrofię. Krótsze przerwy trzymają „pompę”, ale kosztują ciężar.' },
            { h2: 'Kiedy krótko', p: 'Izolowane ćwiczenia, drop sety, superserie i trening na czas. Przy wielostawowych ciężarach — odpoczywaj długo.' }
        ],
        bullets: ['<strong>Siła: 2–5 min</strong> — pełna regeneracja.', '<strong>Masa: 1–2 min</strong> — na hipertrofię.', '<strong>Krótko = lżej</strong> — nie lepiej.'],
        uwaga: 'Nie patrz w telefon 10 min „odpoczywając” — po 5 min mięsień stygnie, a trening się rozłazi.',
        coDalej: 'Zobacz <a href="ile-serii-na-miesien">ile serii na mięsień</a> i <a href="trening-w-40-minut">trening w 40 minut</a>.'
    },
    {
        slug: 'trening-w-40-minut',
        emoji: '⏱️',
        title: 'Masz 40 minut — jak zrobić sensowny trening',
        subtitle: 'Krótki trening to nie gorszy trening. Superserie i wielostawowe ruchy dadzą efekt bez 2 godzin na siłowni.',
        meta: 'Trening w 40 minut — jak ułożyć krótki efektywny trening, superserie, wielostawowe ćwiczenia i dlaczego czas nie jest wyznacznikiem jakości.',
        category: 'cwiczenia',
        lead: 'Nie potrzebujesz 2 godzin. 40 minut z wielostawowymi ćwiczeniami i superseriami da więcej niż godzina przegadana i przeczekana.',
        sections: [
            { h2: 'Wielostawowe', p: 'Przysiad, wyciskanie, wiosłowanie, martwy — angażują najwięcej mięśni na minutę. To podstawa krótkiego treningu.' },
            { h2: 'Superserie', p: 'Łącz ćwiczenia antagonistyczne (klata + plecy) bez przerwy. Oszczędzasz czas, a intensywność zostaje.' },
            { h2: 'Plan na 40 min', p: 'Rozgrzewka 5 min → 2–3 wielostawowe po 3–4 serie → 1 superseria na słabsze partie. I koniec. Krótko, ale konkretnie.' }
        ],
        bullets: ['<strong>Wielostawowe</strong> — najwięcej za minutę.', '<strong>Superserie</strong> — mniej czekania.', '<strong>40 min wystarczy</strong> — jeśli jest intensywnie.'],
        uwaga: 'Krótki trening wymaga dyscypliny — telefon i pogaduchy zjedzą go w 10 minut.',
        coDalej: 'Zobacz <a href="fbw-vs-split">FBW vs split</a> i <a href="cwiczenia-wielostawowe">ćwiczenia wielostawowe</a>.'
    },
    {
        slug: 'trening-z-gumami-w-domu',
        emoji: '🩹',
        title: 'Trening z gumami w domu — czy coś daje',
        subtitle: 'Gumy nie zastąpią sztangi, ale utrzymają mięśnie i siłę, gdy nie masz siłowni. Lepsze niż nic — dużo lepsze.',
        meta: 'Trening z gumami oporowymi w domu — czy buduje mięśnie, jak trenować z gumami i ile można utrzymać bez siłowni.',
        category: 'cwiczenia',
        lead: 'Gumy oporowe dają inny opór niż sztanga (najcięższe na końcu ruchu), ale w domu utrzymają mięśnie i siłę. To solidny plan B.',
        sections: [
            { h2: 'Co dają', p: 'Przy treningu do zmęczenia gumy potrafią stymulować wzrost niemal jak wolne ciężary. Wystarczą do utrzymania, a u początkujących — do budowy.' },
            { h2: 'Jak trenować', p: 'Przysiady, wiosłowanie, wyciskanie, rozpiętki, martwy z gumą. Rób 3–4 serie blisko upadku — opór to opór, nie musi być żelazny.' },
            { h2: 'Limit gum', p: 'Trudno o realną progresję ciężaru i ciężkie nogi. Gumy to pomost między siłownią a niczym — nie docelowy plan.' }
        ],
        bullets: ['<strong>Utrzymasz mięśnie</strong> — bez siłowni.', '<strong>Trenuj blisko upadku</strong> — wtedy działa.', '<strong>Plan B</strong> — nie zamiennik na zawsze.'],
        uwaga: 'Kup gumy o różnych oporach — jedna „uniwersalna” szybko robi się za słaba na dolne partie.',
        coDalej: 'Zobacz <a href="kalistenika-na-mase">kalistenikę na masę</a> i <a href="regeneracja-miesnie-rosna-poza">regenerację</a>.'
    },
    {
        slug: 'rozklad-bialka-w-dzien-treningu',
        emoji: '📅',
        title: 'Białko w dzień treningowy — rozkład, nie pora',
        subtitle: 'Nie liczy się „30 minut po”, tylko suma dnia rozłożona na 3–5 porcji. Pora jest drugorzędna.',
        meta: 'Białko w dniu treningu — jak rozłożyć białko na posiłki, ile na porcję i dlaczego rozkład na cały dzień liczy się bardziej niż okno potreningowe.',
        category: 'cwiczenia',
        lead: 'Mięśnie rosną z sumy białka rozłożonej na cały dzień, nie z jednej porcji o 18:32. Liczy się 3–5 posiłków po 25–40 g.',
        sections: [
            { h2: 'Rozkład', p: 'Równe porcje co 3–5 h lepiej napędzają syntezę białka niż jedno ogromne i dwa śladowe posiłki.' },
            { h2: 'Ile na porcję', p: '25–40 g białka na posiłek to praktyczne optimum. Więcej w jednym siadzie nie „przepadnie”, ale nie da ekstra efektu.' },
            { h2: 'W dzień treningu', p: 'Nie ma obowiązkowego „shake 30 min po”. Zjedz normalny posiłek w ciągu 2–4 h po treningu — i pilnuj reszty dnia.' }
        ],
        bullets: ['<strong>3–5 posiłków po 25–40 g</strong> — rozkład.', '<strong>2–4 h po treningu</strong> — bez presji.', '<strong>Suma dnia > pora</strong> — zawsze.'],
        uwaga: 'Najczęstszy błąd to 100 g białka wieczorem i prawie zero rano — rozłóż równo, a efekt będzie lepszy.',
        coDalej: 'Zobacz <a href="bialko-po-treningu-ile-faktycznie">białko po treningu</a> i <a href="ile-bialka-na-dzien">ile białka dziennie</a>.'
    },
    {
        slug: 'regeneracja-miesnie-rosna-poza',
        emoji: '😴',
        title: 'Regeneracja — mięśnie rosną poza siłownią',
        subtitle: 'Trening to bodziec, wzrost dzieje się w przerwie. Sen i jedzenie to nie dodatek — to 50% planu.',
        meta: 'Regeneracja mięśni — dlaczego mięśnie rosną po treningu, ile snu i białka potrzeba i co najszybciej spowalnia regenerację.',
        category: 'cwiczenia',
        lead: 'Na treningu rozbijasz mięśnie; one odbudowują się i rosną w nocy i w dni wolne. Kto ignoruje regenerację, trenuje za darmo.',
        sections: [
            { h2: 'Sen', p: 'Wzrost hormonów i naprawa mięśni dzieją się głównie w głębokim śnie. 7–9 h to część treningu, nie luksus.' },
            { h2: 'Jedzenie', p: 'Białko (1,6–2,2 g/kg) i wystarczająco kalorii dają budulec. Deficyt + ciężki trening bez białka = spalanie mięśni.' },
            { h2: 'Objawy braku', p: 'Stagnacja siły, ciągłe zmęczenie, gorszy sen, bóle stawów. To sygnały, że więcej treningu tylko pogorszy sprawę.' }
        ],
        bullets: ['<strong>Sen 7–9 h</strong> — podstawa regeneracji.', '<strong>Białko + kalorie</strong> — budulec.', '<strong>Dni wolne</strong> — nie strata, a plan.'],
        uwaga: 'Trenowanie tej samej partii codziennie „na zakwasy” to nie determinacja — to sabotowanie wzrostu.',
        coDalej: 'Zobacz <a href="sen-6-czy-8-godzin-a-waga">sen a waga</a> i <a href="zakwasy-czy-dobry-trening">zakwasy</a>.'
    },
    {
        slug: 'sila-a-napompowany',
        emoji: '💪',
        title: 'Siła a wygląd — dlaczego „napompowany” to nie to samo',
        subtitle: 'Pompa to chwilowa krew i woda, siła to układ nerwowy i mięśnie. Budujesz jedno i drugie — ale inaczej.',
        meta: 'Siła vs pompa mięśniowa — różnica między treningiem na siłę a na pompę, dlaczego wygląd po treningu to nie wzrost i co naprawdę buduje mięśnie.',
        category: 'cwiczenia',
        lead: 'Pompa to napływ krwi do mięśnia — znika po godzinie. Siła to zdolność układu nerwowego i wielkość mięśnia — zostaje. Nie myl jednego z drugim.',
        sections: [
            { h2: 'Pompa', p: 'Efekt chwilowy: krew i płyn w mięśniu po seriach z dużą liczbą powtórzeń. Nie buduje trwale — ale bywa sygnałem dobrego ukrwienia.' },
            { h2: 'Siła', p: 'Wynika z rekrutacji włókien i masy mięśniowej. Trening z ciężarem 1–5 powtórzeń buduje siłę, 6–15 — głównie masę.' },
            { h2: 'Co buduje mięśnie', p: 'Progresja ciężaru w zakresie 6–15 powtórzeń, objętość i białko. Pompa to efekt uboczny, nie cel sam w sobie.' }
        ],
        bullets: ['<strong>Pompa = chwilowa</strong> — nie wzrost.', '<strong>Siła = trwała</strong> — układ nerwowy + mięśnie.', '<strong>6–15 powt. + progresja</strong> — na masę.'],
        uwaga: 'Nie oceniaj postępu po pompie z treningu — zrób zdjęcie rano, po nocy, dopiero to pokazuje prawdę.',
        coDalej: 'Zobacz <a href="progresja-jedyne-co-buduje">progresję</a> i <a href="ile-serii-na-miesien">ile serii na mięsień</a>.'
    },
    {
        slug: 'masa-bez-liczenia',
        emoji: '📊',
        title: 'Trening na masę bez liczenia — da się?',
        subtitle: 'Da się, ale wolniej i mniej pewnie. Liczenie to nie obsesja — to precyzja, gdy chcesz realnych efektów.',
        meta: 'Czy da się budować masę bez liczenia kalorii — jak jeść intuicyjnie na masie, kiedy to działa i kiedy liczenie jest konieczne.',
        category: 'cwiczenia',
        lead: 'Bez liczenia możesz budować masę — jeśli jesz do syta i pilnujesz białka. Ale „do syta” u jednych znaczy nadwyżka, u innych deficyt.',
        sections: [
            { h2: 'Kiedy działa', p: 'U osób, które naturalnie jedzą dużo i mają stabilną wagę. Dorzucasz porcję białka i kalorii do każdego posiłku — i rośniesz.' },
            { h2: 'Kiedy nie działa', p: 'U „niejadków” i osób z małym apetytem. Oni bez liczenia jedzą za mało i dziwią się, że masa nie idzie.' },
            { h2: 'Złoty środek', p: 'Licz tylko białko (i kalorie przez pierwsze 2 tygodnie, żeby skalibrować). Potem intuicja wystarcza, jeśli waga idzie w górę.' }
        ],
        bullets: ['<strong>Pilnuj białka</strong> — minimum.', '<strong>Waga w górę?</strong> — działa, nie licz.', '<strong>Waga stoi?</strong> — wróć do liczenia.'],
        uwaga: 'Nadwyżka „na oko” bywa za mała lub za duża — ważąc się raz w tygodniu, szybko złapiesz właściwy kierunek.',
        coDalej: 'Zobacz <a href="bulk-brudny-vs-czysty">bulk brudny vs czysty</a> i <a href="budowanie-miesni-minimalny-plan">minimalny plan na masę</a>.'
    },
    {
        slug: 'przerwa-po-kontuzji',
        emoji: '🩹',
        title: 'Przerwa po kontuzji — ile mięśni realnie tracisz',
        subtitle: 'Tracisz mniej, niż myślisz — a siła i masa szybko wracają dzięki pamięci mięśniowej. Nie panikuj.',
        meta: 'Ile mięśni tracisz po przerwie od treningu — zanik mięśni po 2–4 tygodniach, pamięć mięśniowa i jak bezpiecznie wrócić po kontuzji.',
        category: 'cwiczenia',
        lead: 'Po 2–3 tygodniach przerwy mięśnie wyglądają na mniejsze (spadek glikogenu i wody), ale realnej masy tracisz mało. Pamięć mięśniowa odbuduje ją szybko.',
        sections: [
            { h2: 'Co się dzieje', p: 'Pierwszy spadek to woda i glikogen, nie mięśnie. Realny zanik zaczyna się po ~3 tygodniach i jest wolny.' },
            { h2: 'Pamięć mięśniowa', p: 'Komórki mięśniowe, które zbudowałeś, zostają „zapisane”. Po powrocie odbudowujesz siłę i masę dużo szybciej niż za pierwszym razem.' },
            { h2: 'Jak wracać', p: 'Zacznij od 50–60% dawnych ciężarów, progresuj co tydzień, nie goń za starym poziomem w miesiąc. Kontuzja to sygnał, żeby poprawić technikę.' }
        ],
        bullets: ['<strong>Tracisz mało</strong> — to głównie woda.', '<strong>Pamięć mięśniowa</strong> — szybki powrót.', '<strong>Wracaj stopniowo</strong> — 50–60% na start.'],
        uwaga: 'Powrót za szybko po kontuzji to przepis na jej powtórkę — lepiej wolniej i pewnie niż szybko i znów na przerwie.',
        coDalej: 'Zobacz <a href="rozgrzewka-5-minut">rozgrzewkę</a> i <a href="regeneracja-miesnie-rosna-poza">regenerację</a>.'
    },
    {
        slug: 'cwiczenia-wielostawowe',
        emoji: '🏋️',
        title: 'Ćwiczenia wielostawowe — dlaczego rządzą',
        subtitle: 'Przysiad, martwy, wyciskanie, wiosłowanie — angażują wiele mięśni naraz. Więcej efektu w mniej czasu.',
        meta: 'Ćwiczenia wielostawowe — dlaczego to podstawa treningu, które ruchy dają najwięcej i jak ułożyć plan na wielostawowych.',
        category: 'cwiczenia',
        lead: 'Wielostawowe ćwiczenia ruszają kilka stawów i grup mięśni naraz. To najwięcej bodźca za minutę treningu — i fundament każdego planu.',
        sections: [
            { h2: 'Dlaczego', p: 'Więcej mięśni w ruchu = większe obciążenie = większy bodziec wzrostowy. Do tego realna siła funkcjonalna i spalanie kalorii.' },
            { h2: 'Które', p: 'Przysiad, martwy ciąg, wyciskanie leżąc, wiosłowanie, podciąganie, wyciskanie nad głowę. To 80% efektu w 6 ruchach.' },
            { h2: 'Jak ułożyć', p: 'Zacznij trening od wielostawowych (świeży układ nerwowy), a izolowane zostaw na koniec. 2–3 wielostawowe + 1–2 izolowane to dobry szablon.' }
        ],
        bullets: ['<strong>Przysiad, martwy, wyciskanie</strong> — baza.', '<strong>Najpierw wielostawowe</strong> — na świeżo.', '<strong>Więcej mięśni = większy efekt</strong> — na minutę.'],
        uwaga: 'Wielostawowe wymagają lepszej techniki — ucz się ich z małym ciężarem, zanim dokładasz.',
        coDalej: 'Zobacz <a href="martwy-ciag-czy-niezbedny">martwy ciąg</a> i <a href="trening-w-40-minut">trening w 40 minut</a>.'
    },
    {
        slug: 'kalistenika-na-mase',
        emoji: '🤸',
        title: 'Kalistenika na masę — pompki i podciąganie wystarczą?',
        subtitle: 'Masa ciała buduje mięśnie, ale progresja jest trudniejsza. Działa, jeśli robisz to mądrze.',
        meta: 'Kalistenika na masę — czy pompki i podciąganie budują mięśnie, jak progresować masą ciała i kiedy ciężary są potrzebne.',
        category: 'cwiczenia',
        lead: 'Pompki, podciąganie i dipy budują mięśnie — do momentu, gdy stają się za łatwe. Wtedy progresja robi się wyzwaniem.',
        sections: [
            { h2: 'Czy działa', p: 'Tak, zwłaszcza na górę ciała. Klucz to trening blisko upadku i stałe utrudnianie: więcej powtórzeń, wolniejsze tempo, uniesienie nóg.' },
            { h2: 'Jak progresować', p: 'Utrudniaj dźwignię (pompki na poręczach, podciąganie z obciążeniem), nie tylko dokładaj powtórzeń w nieskończoność.' },
            { h2: 'Limit', p: 'Nogi i dolne partie trudno dobić samą masą ciała. Przysiady na jednej nodze to sporo, ale ciężar ostatecznie wygrywa.' }
        ],
        bullets: ['<strong>Góra ciała</strong> — kalistenika wystarczy.', '<strong>Utrudniaj dźwignię</strong> — nie tylko powtórzenia.', '<strong>Nogi</strong> — tu ciężar pomaga.'],
        uwaga: '„Do upadku” przy kalistenice jest bezpieczniejsze niż przy ciężarach — wykorzystaj to, ale pilnuj techniki.',
        coDalej: 'Zobacz <a href="trening-z-gumami-w-domu">trening z gumami</a> i <a href="progresja-jedyne-co-buduje">progresję</a>.'
    },
    {
        slug: 'trening-nog-dlaczego-omijasz',
        emoji: '🦵',
        title: 'Trening nóg — dlaczego go omijasz (i czemu to błąd)',
        subtitle: 'Nogi to połowa ciała i największy potencjał wzrostu. Omijanie ich to budowanie domu bez fundamentu.',
        meta: 'Dlaczego warto trenować nogi — korzyści z treningu nóg dla sylwetki i metabolizmu, jak zacząć i dlaczego „leg day” nie jest straszny.',
        category: 'cwiczenia',
        lead: 'Nogi to największe grupy mięśniowe ciała. Ich trening podnosi ogólny wzrost, spalanie i sylwetkę — omijanie ich to strata połowy potencjału.',
        sections: [
            { h2: 'Korzyści', p: 'Duże mięśnie nóg = większa produkcja hormonów wzrostu i więcej spalonych kalorii. Do tego stabilny fundament pod całe ciało.' },
            { h2: 'Czemu omijasz', p: 'Nogi bolą i są męczące — to najcięższy trening tygodnia. Ale to właśnie dlatego daje najwięcej.' },
            { h2: 'Jak zacząć', p: 'Przysiad, martwy, wykroki, hip thrust. Dwa treningi nóg w tygodniu, zaczynając od lekkich ciężarów i pełnej techniki.' }
        ],
        bullets: ['<strong>Nogi = połowa ciała</strong> — nie pomijaj.', '<strong>2× w tygodniu</strong> — dobry start.', '<strong>Przysiad + martwy</strong> — podstawa.'],
        uwaga: 'Zakwasy po nogach to norma — zaplanuj leg day tak, by nie kolidował z czymś, co wymaga chodzenia.',
        coDalej: 'Zobacz <a href="przysiad-gleboki-czy-rownolegly">przysiad</a> i <a href="cwiczenia-wielostawowe">ćwiczenia wielostawowe</a>.'
    },
    {
        slug: 'cardio-a-miesnie',
        emoji: '🏃',
        title: 'Cardio a mięśnie — czy bieganie je zjada',
        subtitle: 'Umiarkowane cardio nie zjada mięśni. Zjada je za mało kalorii i brak siłowego. Biegaj spokojnie.',
        meta: 'Czy cardio niszczy mięśnie — ile cardio jest bezpieczne przy budowaniu masy, jak łączyć bieganie z siłownią i czego naprawdę unikać.',
        category: 'cwiczenia',
        lead: 'Cardio nie „zjada” mięśni, dopóki jesz wystarczająco i robisz trening siłowy. Problem to ekstremalne objętości i duży deficyt.',
        sections: [
            { h2: 'Ile jest OK', p: '2–3 sesje cardio po 20–30 min tygodniowo nie zaszkodzą masie. Wręcz poprawią regenerację i kondycję.' },
            { h2: 'Kiedy szkodzi', p: 'Codzienne długie biegi + niskie kalorie + brak siłowego = organizm sięga po mięśnie. Winny jest deficyt, nie samo cardio.' },
            { h2: 'Jak łączyć', p: 'Siła przed cardio w jednym dniu, albo osobne dni. Nie rób maratonu tuż przed treningiem nóg.' }
        ],
        bullets: ['<strong>2–3× po 20–30 min</strong> — bezpiecznie.', '<strong>Siła przed cardio</strong> — kolejność.', '<strong>Jedz wystarczająco</strong> — wtedy cardio nie zjada.'],
        uwaga: 'HIIT spala i buduje kondycję, ale mocniej męczy — nie dokładaj go do już ciężkiego planu siłowego.',
        coDalej: 'Zobacz <a href="sila-na-redukcji-dlaczego-nie-tylko-cardio">siła na redukcji</a> i <a href="kardio-vs-sila-na-redukcji-2">cardio czy siła</a>.'
    },
    {
        slug: 'porownywanie-sie-na-silowni',
        emoji: '🏆',
        title: 'Porównywanie się na siłowni — dlaczego cię hamuje',
        subtitle: 'Ścigasz się z cudzymi genami, stażem i wspomaganiem. Twoim jedynym rywalem jesteś ty sprzed miesiąca.',
        meta: 'Porównywanie się na siłowni — dlaczego cudzy progres psuje motywację, jak przestać i dlaczego rywalizacja z sobą działa lepiej.',
        category: 'cwiczenia',
        lead: 'Gość obok wyciska 120 kg, a ty 60 — i co z tego? Nie znasz jego stażu, genetyki ani diety. Porównuj się z sobą sprzed miesiąca, nie z nim.',
        sections: [
            { h2: 'Czemu to pułapka', p: 'Cudzy wygląd to suma lat treningu, genów i często wspomagania. Porównanie z nim to niesprawiedliwy wyścig, który tylko zniechęca.' },
            { h2: 'Co porównywać', p: 'Własne liczby: ciężar, powtórzenia, obwody, zdjęcia. To jedyna miara, która ma sens — i jedyna, na którą masz wpływ.' },
            { h2: 'Jak to robić', p: 'Dziennik treningowy + zdjęcie raz w miesiącu. Zobaczysz trend, nie jednorazowy strzał. I przestaniesz patrzeć w bok.' }
        ],
        bullets: ['<strong>Rywal = ty sprzed miesiąca</strong> — nie gość obok.', '<strong>Dziennik</strong> — liczby zamiast emocji.', '<strong>Zdrowy dystans</strong> — cudzy progres to nie twój minus.'],
        uwaga: 'Zazdrość o czyjąś sylwetkę to często brak informacji o jego drodze — skup się na swojej, bo tylko ją kontrolujesz.',
        coDalej: 'Zobacz <a href="motywacja-vs-nawyki">motywację vs nawyki</a> i <a href="progresja-jedyne-co-buduje">progresję</a>.'
    },
    {
        slug: 'bialko-30g-mit',
        emoji: '🧮',
        title: '„Białko się nie wchłania powyżej 30 g” — skąd to wyszło',
        subtitle: 'Mit o limicie 30 g na posiłek nie ma podstaw. Organizm wchłonie i 60 g — po prostu wolniej.',
        meta: 'Czy organizm wchłania maksymalnie 30 g białka — skąd mit o limicie na posiłek, ile białka naprawdę można zjeść naraz i co to znaczy w praktyce.',
        category: 'odzywianie',
        lead: 'Mit „max 30 g białka na posiłek” wziął się z uproszczenia jednego badania. Organizm wchłonie i 60 g — większa porcja po prostu trawi się dłużej.',
        sections: [
            { h2: 'Skąd mit', p: 'Badania pokazały, że ~30 g maksymalnie pobudza syntezę mięśniową na raz. Ktoś to uprościł do „więcej się nie wchłonie” — i poleciało.' },
            { h2: 'Co naprawdę', p: 'Całe zjedzone białko zostanie strawione i wchłonięte. Większa porcja = dłuższe trawienie i mniejszy „bonus” do syntezy, ale zero marnotrawstwa.' },
            { h2: 'Praktycznie', p: 'Nie musisz jeść co 3 h po 30 g. Licz dzienną sumę i rozłóż mniej więcej równo — 3–5 posiłków po 25–40 g w zupełności wystarczy.' }
        ],
        bullets: ['<strong>Nie ma limitu 30 g</strong> — to mit.', '<strong>Większa porcja = dłuższe trawienie</strong> — nie strata.', '<strong>Licz sumę dnia</strong> — nie pojedynczy posiłek.'],
        uwaga: 'Ściganie się z „idealnym rozkładem” to strata energii — suma białka w ciągu dnia robi 95% roboty.',
        coDalej: 'Zobacz <a href="ile-bialka-na-dzien">ile białka dziennie</a> i <a href="rozklad-bialka-w-dzien-treningu">rozkład białka</a>.'
    },
    {
        slug: 'gluten-kiedy-naprawde-szkodzi',
        emoji: '🌾',
        title: 'Gluten — kiedy naprawdę szkodzi',
        subtitle: 'Gluten szkodzi przy celiakii i nadwrażliwości. Dla reszty to zwykłe białko z pszenicy, nie trucizna.',
        meta: 'Czy gluten jest szkodliwy — celiakia, nadwrażliwość i moda na bezglutenowe: kiedy unikać glutenu, a kiedy to tylko trend.',
        category: 'odzywianie',
        lead: 'Gluten to białko pszenicy. Szkodzi tylko osobom z celiakią i realną nadwrażliwością — dla reszty to neutralny składnik, nie „zapychacz”.',
        sections: [
            { h2: 'Kiedy szkodzi', p: 'Celiakia (ok. 1% ludzi) i nieceliakalna nadwrażliwość. Tam gluten wywołuje stan zapalny i objawy — i wymaga diety bezglutenowej.' },
            { h2: 'Moda na bezglutenowe', p: 'Dla zdrowych osób produkty „bez glutenu” nie są zdrowsze — bywają bardziej przetworzone i droższe, a nie lepsze.' },
            { h2: 'Jak sprawdzić', p: 'Jeśli po pieczywie masz wzdęcia i biegunkę regularnie — zbadaj się na celiakię, zanim sam usuniesz gluten. Inaczej testy wyjdą fałszywie.' }
        ],
        bullets: ['<strong>Celiakia</strong> — tu gluten trzeba odstawić.', '<strong>Zdrowi</strong> — gluten jest neutralny.', '<strong>Zbadaj, zanim odstawisz</strong> — nie zgaduj.'],
        uwaga: 'Odstawienie glutenu „na próbę” przed badaniami maskuje celiakię — najpierw diagnoza, potem dieta.',
        coDalej: 'Zobacz <a href="laktoza-czy-psuje-sylwetke">laktozę</a> i <a href="glutaminian-i-chemi">glutaminian</a>.'
    },
    {
        slug: 'laktoza-czy-psuje-sylwetke',
        emoji: '🥛',
        title: 'Laktoza — czy mleko „psuje” sylwetkę',
        subtitle: 'Mleko to nie wróg sylwetki, tylko kalorie i cukier mleczny. Nietolerancja to osobna sprawa — objawy, nie tycie.',
        meta: 'Czy laktoza szkodzi sylwetce — mleko i laktoza a waga, nietolerancja laktozy, kalorie z mleka i czy warto pić mleko bez laktozy.',
        category: 'odzywianie',
        lead: 'Mleko nie „psuje” sylwetki samo w sobie — to płynne kalorie, które łatwo przesadzić. Laktoza tuczy tylko wtedy, gdy pijesz jej za dużo.',
        sections: [
            { h2: 'Kalorie', p: 'Szklanka mleka 2% to ~120 kcal i ~5 g cukru (laktozy). Trzy szklanki dziennie to 360 kcal — łatwo zapomnieć, że to nie woda.' },
            { h2: 'Nietolerancja', p: 'Jeśli po mleku masz wzdęcia i biegunkę — to nietolerancja laktozy, nie „tycie od mleka”. Mleko bez laktozy rozwiązuje problem.' },
            { h2: 'Czy pić', p: 'Mleko to tanie białko i wapń. Licz je w bilansie i pij z głową — na masie świetne, na redukcji zwracaj uwagę na ilość.' }
        ],
        bullets: ['<strong>Mleko = kalorie</strong> — licz jak posiłek.', '<strong>Wzdęcia po mleku</strong> — to laktoza, nie waga.', '<strong>Bez laktozy</strong> — ta sama wartość, bez objawów.'],
        uwaga: '„Laktoza tuczy” to mit — tuczy nadwyżka kalorii, a mleko łatwo jej dokłada, bo pije się je szybko.',
        coDalej: 'Zobacz <a href="gluten-kiedy-naprawde-szkodzi">gluten</a> i <a href="plynne-kalorie-sok-to-nie-owoc">płynne kalorie</a>.'
    },
    {
        slug: 'keto-vs-low-carb',
        emoji: '🥑',
        title: 'Keto vs low carb — w czym naprawdę rzecz',
        subtitle: 'Obie diety tną węgle, ale żadna nie spala tłuszczu magicznie. Liczy się deficyt, nie nazwa diety.',
        meta: 'Keto czy low carb — różnica, czy ketoza przyspiesza odchudzanie, dla kogo niskowęglowodanowa dieta i dlaczego deficyt nadal rządzi.',
        category: 'odchudzanie',
        lead: 'Keto to bardzo niskie węgle i stan ketozy; low carb to po prostu mniej węglowodanów. Żadna nie omija praw fizyki — chudniesz od deficytu.',
        sections: [
            { h2: 'Różnica', p: 'Keto: <50 g węgli dziennie, dużo tłuszczu. Low carb: zwykle 50–150 g węgli. Keto wymusza ketozę, low carb nie.' },
            { h2: 'Czy keto przyspiesza', p: 'Nie ma dowodów, że ketoza spala więcej tłuszczu niż ten sam deficyt na węglach. Szybki spadek na starcie to woda i glikogen.' },
            { h2: 'Dla kogo', p: 'Niski poziom węgli pomaga kontrolować apetyt u niektórych i bywa wygodny. Ale nie jest obowiązkowy — liczy się bilans kalorii.' }
        ],
        bullets: ['<strong>Deficyt rządzi</strong> — nie nazwa diety.', '<strong>Keto ≠ szybsze spalanie</strong> — to woda na starcie.', '<strong>Wybierz, co utrzymasz</strong> — trwałość wygrywa.'],
        uwaga: 'Keto bywa ubogie w błonnik i mikroelementy, jeśli jesz samo mięso i tłuszcz — warzywa na keto to konieczność, nie opcja.',
        coDalej: 'Zobacz <a href="deficyt-500-czy-700">deficyt kaloryczny</a> i <a href="weglowodany-na-noc">węglowodany na noc</a>.'
    },
    {
        slug: 'superfoods-marketing',
        emoji: '🫐',
        title: 'Superfoods — ile marketingu jest w jagodach goji',
        subtitle: 'Goji, spirulina, quinoa to fajne produkty, nie cuda. Zwykłe jabłko i fasola biją je ceną za te same składniki.',
        meta: 'Superfoods — czy jagody goji, spirulina i quinoa są zdrowsze, ile w tym marketingu i jakie zwykłe produkty dają to samo taniej.',
        category: 'odzywianie',
        lead: '„Superfoods” to termin marketingowy, nie naukowy. Goji ma antyoksydanty — ale truskawki i borówki mają je też, za ułamek ceny.',
        sections: [
            { h2: 'Czym są naprawdę', p: 'To zwykłe produkty z dobrym składem, opakowane w historię o egzotyce. Ich składniki znajdziesz w lokalnych, tańszych produktach.' },
            { h2: 'Czy są zdrowsze', p: 'Nie bardziej niż zbilansowana dieta. Żaden pojedynczy produkt nie „odtruwa” ani nie leczy — to nie działa tak jak w reklamie.' },
            { h2: 'Tańsze odpowiedniki', p: 'Goji → borówki/jagody, quinoa → kasza gryczana, spirulina → zwykły szpinak. Ta sama klasa składników, niższa cena.' }
        ],
        bullets: ['<strong>Marketing, nie nauka</strong> — „superfoods”.', '<strong>Borówki > goji</strong> — taniej i podobnie.', '<strong>Zróżnicowana dieta</strong> — bije każdy cud.'],
        uwaga: 'Płacenie 40 zł za 100 g „super” proszku nie zrobi nic, czego nie zrobi talerz warzyw i owoców dziennie.',
        coDalej: 'Zobacz <a href="fruktoza-w-owocach">owoce</a> i <a href="tabele-kalorii-skad-sie-biora">skąd biorą się tabele kalorii</a>.'
    },
    {
        slug: 'ujemne-kalorie-seler',
        emoji: '🥬',
        title: 'Ujemne kalorie — czy seler spala więcej niż daje',
        subtitle: 'Mit „ujemnych kalorii” jest przesadzony. Seler prawie nic nie ma, ale nie spala więcej, niż dostarcza.',
        meta: 'Czy istnieją produkty o ujemnych kaloriach — seler, ogórek i sałata: ile naprawdę mają kalorii i czy jedzenie ich spala więcej energii.',
        category: 'odchudzanie',
        lead: 'Seler ma ~14 kcal na 100 g — prawie nic. Ale „ujemne kalorie” to mit: trawienie nie spala więcej, niż produkt dostarcza.',
        sections: [
            { h2: 'Skąd mit', p: 'Efekt termiczny jedzenia (TEF) to ~10% kalorii. Ktoś uznał, że przy 14 kcal organizm spali więcej na trawienie — w praktyce nie.' },
            { h2: 'Ile naprawdę', p: 'Seler, ogórek, sałata mają 10–15 kcal/100 g. Są świetne na objętość i sytość, ale bilans zostaje lekko dodatni.' },
            { h2: 'Czemu i tak warto', p: 'Warzywa wodniste dają objętość za grosze kalorii. To podstawa volume eating — nie dlatego, że „spalają”, tylko że sycą.' }
        ],
        bullets: ['<strong>Nie ma ujemnych kalorii</strong> — to mit.', '<strong>10–15 kcal/100 g</strong> — prawie zero.', '<strong>Jedz na objętość</strong> — sycą za grosze.'],
        uwaga: 'Warzywa niskokaloryczne to nie „licencja na wszystko” — liczą się w całości dnia jak każde inne.',
        coDalej: 'Zobacz <a href="volume-eating-jak-jesc-duzo-i-chudnac">volume eating</a> i <a href="produkty-ktore-syca">produkty, które sycą</a>.'
    },
    {
        slug: 'motywacja-vs-nawyki',
        emoji: '⚙️',
        title: 'Motywacja vs nawyki — co naprawdę trzyma dietę',
        subtitle: 'Motywacja to zryw, nawyki to autopilot. Dieta trzyma się nie siłą woli, tylko rutyną, której nie musisz chcieć.',
        meta: 'Motywacja czy nawyki — dlaczego dieta nie trzyma się na sile woli, jak budować nawyki żywieniowe i treningowe, które zostają.',
        category: 'odchudzanie',
        lead: 'Motywacja spada po tygodniu. Nawyki działają latami, bo nie wymagają decyzji. Buduj rutynę, zamiast liczyć na zapał.',
        sections: [
            { h2: 'Różnica', p: 'Motywacja to chwilowa energia; nawyk to automat. Diety padają, gdy opierają się na zapał — nie na powtarzalnych zasadach.' },
            { h2: 'Jak budować', p: 'Zacznij od małego (jedna zmiana na 2 tygodnie), przypnij do istniejącej rutyny (po kawie, przed obiadem) i powtarzaj.' },
            { h2: 'Sztuczka', p: 'Ułatwiaj dobre wybory: meal prep, lista zakupów, stałe godziny. Im mniej decyzji, tym mniej miejsca na „nie chce mi się”.' }
        ],
        bullets: ['<strong>Nawyki > motywacja</strong> — zawsze.', '<strong>1 zmiana na 2 tygodnie</strong> — nie rewolucja.', '<strong>Ułatwiaj</strong> — mniej decyzji = mniej porażek.'],
        uwaga: 'Nie czekaj na „lepszy moment” i idealny zapał — działanie buduje motywację, nie odwrotnie.',
        coDalej: 'Zobacz <a href="tracking-kalorii-bez-obsesji">tracking bez obsesji</a> i <a href="porownywanie-sie-na-silowni">porównywanie się</a>.'
    },
    {
        slug: 'tabele-kalorii-skad-sie-biora',
        emoji: '📊',
        title: 'Tabele kalorii — skąd się biorą te liczby',
        subtitle: 'Kalorie w tabelach to wartości uśrednione, często mierzone metodą spalania sprzed 100 lat. Traktuj je jak szacunek.',
        meta: 'Skąd biorą się tabele kalorii — jak mierzy się kaloryczność jedzenia, dlaczego wartości się różnią i czy można im ufać przy liczeniu.',
        category: 'odzywianie',
        lead: 'Kaloryczność produktu to uśredniona wartość z bazy danych, nie wyrok. Różnice między tabelami i realnym jedzeniem sięgają 10–20%.',
        sections: [
            { h2: 'Jak to mierzą', p: 'Historycznie spalano jedzenie w kalorymetrze i liczono ciepło. Dziś używa się współczynników Atwater (4/4/9 kcal na gram makro).' },
            { h2: 'Dlaczego się różni', p: 'Różne odmiany, dojrzałość, sposób przygotowania i błonnik zmieniają realne kalorie. Stąd te same produkty mają różne wartości w różnych bazach.' },
            { h2: 'Czy liczyć', p: 'Tak, ale z marginesem. Tabele są dobre do śledzenia trendu, nie do liczenia co do kcal. Celuj w zakres, nie w perfekcję.' }
        ],
        bullets: ['<strong>To szacunek</strong> — nie wyrok.', '<strong>10–20% błędu</strong> — norma.', '<strong>Licz trend</strong> — nie co do kcal.'],
        uwaga: 'Nie dobieraj się do 50 kcal w górę czy dół — precyzja tabel jest mniejsza, niż myślisz.',
        coDalej: 'Zobacz <a href="kalorie-na-oko-dlaczego-sie-mylisz">kalorie na oko</a> i <a href="tracking-kalorii-bez-obsesji">tracking</a>.'
    },
// @@MORE@@
