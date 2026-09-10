/**
 * Generuje artykuły tematyczne (białko/odżywianie/odchudzanie/ćwiczenia).
 * Produkuje scripts/hardcore-articles-tematyczne.json.
 * node scripts/build-tematyczne-articles.mjs
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function noteTable(rows) {
    const trs = rows
        .map(([k, v]) => `                        <tr><th>${k}</th><td>${v}</td></tr>`)
        .join('\n');
    return `                <div class="poradnik-table-wrap">
                    <table class="poradnik-intake-table">
                        <tbody>
${trs}
                        </tbody>
                    </table>
                </div>`;
}

function buildArticle(a) {
    const sections = a.sections
        .map(
            (s) => `<h2>${s.h2}</h2>

<p>${s.p}</p>`
        )
        .join('\n\n');

    const bullets = a.bullets
        .map((b) => `                    <li>${b}</li>`)
        .join('\n');

    const tableHtml = a.table ? noteTable(a.table) : '';

    return {
        slug: a.slug,
        emoji: a.emoji,
        title: a.title,
        subtitle: a.subtitle,
        meta: a.meta,
        crumb: a.crumb || a.title,
        category: a.category,
        relatedHtml:
            a.relatedHtml ||
            '<a href="artykuly">artykuły</a> · <a href="poradnik-zywienia">poradnik</a>',
        bodyHtml: `<p>${a.lead}</p>

${sections}

${tableHtml}

<h2>Praktyczny plan</h2>
<div class="poradnik-practical-box">
<ul>
${bullets}
</ul>
</div>

<h2>Na co uważać</h2>
<p>${a.uwaga}</p>

<h2>Co dalej</h2>
<p>${a.coDalej}</p>`
    };
}

const defs = [
{
        slug: 'bialko-po-treningu-ile-faktycznie',
        emoji: '🥩',
        title: 'Białko po treningu — ile faktycznie potrzebujesz',
        subtitle: 'Czy "okno anaboliczne" istnieje? Ile białka po treningu ma sens.',
        meta: 'Białko po treningu: ile gramów, czy okno anaboliczne istnieje i co z odżywką.',
        lead: 'Mit o "oknie anabolicznym" 30 minut po treningu jest mocno przesadzony. Ważniejsza jest suma białka w ciągu dnia niż dokładny czas jednej porcji.',
        category: 'bialko',
        sections: [
            { h2: 'Czy okno anaboliczne istnieje?', p: 'Tak, ale jest szerokie — to kilka godzin, nie 30 minut. Po treningu liczy się, żeby w ciągu 2–4 godzin zjeść porcję białka.' },
            { h2: 'Ile gramów na porcję?', p: 'Dla osoby 70–80 kg sensowna porcja to 25–40 g białka po treningu. Więcej nie dodaje efektu — resztę domykasz kolejnymi posiłkami.' },
            { h2: 'Odżywka czy jedzenie?', p: 'Odżywka to wygoda, nie magia. Twaróg, kurczak, jajka czy skyr działają tak samo. Wybieraj odżywkę, gdy nie masz czasu.'
            }
        ],
        bullets: [
            '<strong>Po treningu:</strong> 25–40 g białka w posiłku lub shake.',
            '<strong>W ciągu dnia:</strong> 1,6–2,2 g/kg, rozłożone na 3–5 porcji.',
            '<strong>Nie musisz jeść "natychmiast"</strong> — 2–4 h spokojnie wystarczą.'
        ],
        uwaga: 'Jeśli trenujesz na czczo albo ostatni posiłek był dawno, jedz szybciej po treningu. Jeśli jadłeś 2 h przed — masz czas.',
        coDalej: 'Sprawdź <a href="ile-bialka-na-dzien">ile białka dziennie</a> i źródła w <a href="dieta#produkty">bazie</a>.'
    },
    {
        slug: 'bialko-na-mase-ile-dokladnie',
        emoji: '🏗️',
        title: 'Białko na masę — ile dokładnie',
        subtitle: 'Budowanie mięśni a białko: ile gramów na kg, kiedy więcej nie pomaga.',
        meta: 'Białko na masę: ile g/kg na budowanie mięśni, nadwyżka kaloryczna i praktyczne źródła.',
        lead: 'Na masie białko jest ważne, ale nie najważniejsze. Bez nadwyżki kalorycznej nawet 3 g białka na kg nie zbuduje mięśni.',
        category: 'bialko',
        sections: [
            { h2: 'Ile białka na masę?', p: '1,6–2,0 g/kg masy ciała wystarcza u większości trenujących. Powyżej 2,2 g/kg dodatkowy efekt jest minimalny — to kalorie, które możesz wydać na węglowodany.' },
            { h2: 'Co buduje mięśnie?', p: 'Nadwyżka kaloryczna (200–400 kcal), trening siłowy z progresją i sen. Białko to materiał budulcowy, ale bez bodźca treningowego nie zbuduje ich.' },
            { h2: 'Liczby w praktyce', p: 'Osoba 80 kg: 130–160 g białka dziennie. Rozłożone na 4 posiłki po 30–40 g to prosta i wygodna strategia.'
            }
        ],
        bullets: [
            '<strong>Białko:</strong> 1,6–2,0 g/kg — więcej nie pomaga.',
            '<strong>Nadwyżka:</strong> 200–400 kcal dziennie, nie "jedz ile wlezie".',
            '<strong>Trening:</strong> progresja obciążeń co tydzień lub dwa.'
        ],
        uwaga: 'Bardzo wysokie białko (3+ g/kg) obciąża budżet i żołądek, a efektów nie doda. Zostaw miejsce na węglowodany — to one dają energię na trening.',
        coDalej: 'Porównaj <a href="cena-bialka">ceny białka</a> i wybierz tanie źródła.'
    },
    {
        slug: 'bialko-roslinne-vs-zwierzece',
        emoji: '🌱',
        title: 'Białko roślinne vs zwierzęce — co wybrać',
        subtitle: 'Czy roślinne białko jest gorsze? Jak kompletować aminokwasy bez mięsa.',
        meta: 'Białko roślinne a zwierzęce: różnice, aminokwasy, kompletowanie diety wege.',
        lead: 'Białko roślinne nie jest "gorsze" — jest inne. Przy dobrze zbilansowanej diecie wegetariańskiej zbudujesz mięśnie tak samo, jak na mięsie.',
        category: 'bialko',
        sections: [
            { h2: 'Różnice w aminokwasach', p: 'Białka zwierzęce mają pełny profil aminokwasów. Roślinne zwykle mają mniej lizyny lub metioniny — ale łącząc źródła (np. fasola + ryż), domykasz profil bez problemu.' },
            { h2: 'Ile jeść?', p: 'Przy diecie roślinnej dodaj 10–20% do normy (np. 2,0–2,2 g/kg zamiast 1,8), bo białko roślinne jest trochę gorzej przyswajane.' },
            { h2: 'Praktyczne źródła', p: 'Tofu, tempeh, soczewica, ciecierzyca, fasola, groch, orzechy, nasiona, kineska. Plus opcjonalna roślinna odżywka (soja, groch).'
            }
        ],
        bullets: [
            '<strong>Łącz źródła:</strong> strączki + zboża w ciągu dnia.',
            '<strong>Dodaj 10–20% do normy</strong> na diecie bezmięsnej.',
            '<strong>Soja jest OK</strong> — mit o "hormonach" nie ma potwierdzenia w badaniach.'
        ],
        uwaga: 'Uważaj na wysoko przetworzone "wege zamienniki" — bywają drogie i kaloryczne. Podstawą strączki i tofu, nie gotowe kotlety.',
        coDalej: 'Zobacz <a href="wegetarianskie-zrodla-bialka">wegetariańskie źródła białka</a>.'
    },
{
        slug: 'od-czego-zaczac-odchudzanie',
        emoji: '📉',
        title: 'Od czego zacząć odchudzanie — kalorie czy jakość?',
        subtitle: 'Co ma pierwszeństwo na starcie redukcji: liczyć czy jeść czysto?',
        meta: 'Od czego zacząć odchudzanie: kalorie czy jakość jedzenia, pierwsze kroki redukcji.',
        lead: 'Pytanie "od czego zacząć" pada najczęściej. Odpowiedź jest prosta: od spożywanych kalorii, bo to one decydują o deficycle. Jakość dochodzi zaraz potem.',
        category: 'odzywianie',
        sections: [
            { h2: 'Krok 1: ważenie i zapis', p: 'Przez 2 tygodnie zapisuj, co jesz. Zwykle okazuje się, że "jem mało" to 500–800 kcal więcej niż myślisz. Średnia z dwóch tygodni to Twój realny start.' },
            { h2: 'Krok 2: deficyt 300–500 kcal', p: 'Odetnij 300–500 kcal od realnej średniej. To zakres, który przynosi 0,3–0,5 kg/tydz. i nie rozwala energii.' },
            { h2: 'Krok 3: białko i warzywa', p: 'Gdy kalorie są pod kontrolą, podnieś białko do 1,6–2,0 g/kg i dodaj warzywa. To utrzyma sytość i mięso, bez liczenia każdego grama węgli.'
            }
        ],
        bullets: [
            '<strong>2 tygodnie zapisu</strong> — poznaj swoją realną bazę.',
            '<strong>Deficyt 300–500 kcal</strong> — zdrowe tempo, 0,3–0,5 kg/tydz.',
            '<strong>Białko 1,6–2,0 g/kg</strong> — sytość i ochrona mięśni.',
            '<strong>Warzywa do każdego posiłku</strong> — objętość bez kalorii.'
        ],
        uwaga: 'Nie zaczynaj od dwóch restrykcyjnych diet naraz. Zacznij od zapisu, potem kalorie, potem jakość. Zbyt wiele zmian na raz kooczy się porzuceniem.',
        coDalej: 'Zobacz <a href="deficyt-kaloryczny-praktyka">jak ustawić deficyt</a> i <a href="dieta#produkty">bazę produktów</a>.'
    },
    {
        slug: 'jablko-na-diecie-mit-czy-fakty',
        emoji: '🍎',
        title: 'Jabłko na diecie — mit czy faktycznie działa?',
        subtitle: 'Owoce a odchudzanie: ile cukru, ile sytości, co wybierać.',
        meta: 'Owoce na diecie: ile wolno, fruktoza, sytość, węglowodany w owocach.',
        lead: 'Na temat owoców krąży mit, że od nich się tyje. Owoc to przede wszystkim woda i błonnik — a najedzone 3 jabłka to mniej kalorii niż batonik. Rzecz w porcji.',
        category: 'odzywianie',
        sections: [
            { h2: 'Czy fruktoza szkodzi?', p: 'Fruktoza z całych owoców, w normalnych poracjach, jest OK. Problem zaczyna się przy sokach i syropach, gdzie fruktoza jest skondensowana, bez błonnika.' },
            { h2: 'Ile owoców na diecie?', p: '2–3 porcje dziennie (np. jabłko, garść jagód, pomarańcza). Dostarczasz witaminy i błonnik, nie torpedujesz diety.' },
            { h2: 'Kiedy unikać', p: 'Przy bardzo niskich celach węglowodanowych (keto) owoce ograniczasz. Przy klasy.compute redukcja — zostaw 2 porcje.'
            }
        ],
        bullets: [
            '<strong>2–3 porcje dziennie</strong> — jest miejsce na owoce.',
            '<strong>Całe owoce, nie sok</strong> — to błonnik robi sytość.',
            '<strong>Zróżnicowanie</strong> — jagody, jabłke, cytrusy, nie tylko banan.'
        ],
        uwaga: 'Suszone owoce są skoncentrowane kalorycznie — 30 g to często 100 kcal. Porcji pilnuj waga1 jako garść, nie paczka.',
        coDalej: 'Zobacz <a href="zdrowe-slodycze">zdrowe słodycze przy odchudzaniu</a>.'
    },
    {
        slug: 'jedzenie-w-nocy-czy-mozna',
        emoji: '🥘',
        title: 'Czy można jeść w nocy?',
        subtitle: 'Mit "nie jedz po 18" — co na to nauka i praktyka sportowca.',
        meta: 'Jedzenie po 18 a odchudzanie: ile w tym mitu, co naprawdę działa.',
        lead: 'To nie pora jedzenia ani szczególna jakaś magia — liczy się suma kalorii. Jedzenie o 22 jest OK, o ile mieści śl się w budżecie.',
        category: 'odzywianie',
        sections: [
            { h2: 'Skąd mit "nie jeść po 18"?', p: 'Bierze się z badań, gdzie jedzący wiceczniej zjadali też więcej łącznie. Winny nie czas, a nadmiar.po potliwość.' },
            { h2: 'Co naprawdę mówią badania', p: 'Sądzenie po godzinie nie zmieniało że palisz kalorie rano vs wieczor. Liczy się bilans dobny i średni.' },
            { h2: 'Pory spożycia idą w parze z rytmem', p: 'Rozłóż kalorię tak, abyś nie łapała głodu na wieczór. Dla części osób wieczicz 2 przekąska białkowa chroni przed nocąnie.'
            }
        ],
        bullets: [
            '<strong>Liczy się bilans</strong> — nie pora jedzenia.',
            '<strong>Jedz wtedy, gdy ciało pracuje</strong> — przy zmianach okaż wieczorne kalorię są normalne.',
            '<strong>Nocleg + głód</strong> — system ochrioni głodowy: przyspiesz, nie odcinaj.'
        ],
        uwaga: 'Jedzenie zanim położysz się pijane, może dawać rzwięku — jeśli masz kłopot, zostaw 1–2 h przerwy. Ale nie unikaj kolacji.',
        coDalej: 'Zobacz <a href="sen-stres-i-waga">sen i waga</a>.'
    },
{
        slug: 'dlaczego-waga-stoi-pomimo-diety',
        emoji: '🚫',
        title: 'Dlaczego waga stoi, mimo że jesteś w deficycie?',
        subtitle: 'Woda, zaparcia, nowy trening — zanim zmienisz dietę, sprawdź te 5 rzeczy.',
        meta: 'Waga stoi mimo diety: retencja wody, mięśnie, zaparcia, cykl, pomiar — co sprawdzić.',
        lead: 'Ciężko jest patrzeć na stojący wynik. Zanim odetniesz kolejne 300 kcal, sprawdź 5 rzeczy, które zwykle odpowiadają za "zastój" bez prawdziwego zastoju.',
        category: 'odchudzanie',
        sections: [
            { h2: '1. Woda i sód', p: 'Sól, węglowodany, trening siłowy, upał — wszystko to trzyma wodę. Waga może stać lub rosnąć, a tłuszcz spadać. To normalne wahanie, nie zatrzymanie efektów.'
            },
            { h2: '2. Zapisuj naprawdę wszystko', p: 'Oleje, sosy, "łyk soka", łyżki z patelni. Niedoszacowane 200–300 kcal dziennie to dokładny zero progresu.'
            },
            { h2: '3. Spójrz na 3 tygodnie', p: 'Stojący tydzień nie znaczy nic. Liczy się trend 3 tygodni — zmiany w diecie rób tylko przy płaskim trendzie.'
            }
        ],
        bullets: [
            '<strong>Waż się rano, po toalecie</strong> — te same warunki.',
            '<strong>Patrz na wymiary i zdjęcia</strong> — waga nie widzi mięśni.',
            '<strong>Zapisz realne kalorie</strong> — dopasuj, nie tnij od razu.'
        ],
        uwaga: 'Tydzień bez zmiany = OK. Trzy tygodnie bez zmian = zaostrz plan. Alarmu nie ma, dopóki trend jest płasko rosnący.',
        coDalej: 'Zobacz <a href="dlaczego-waga-skacze-o-2kg">dlaczego waga skacze</a>.'
    },
    {
        slug: 'spacerowanie-a-skuteczne-odchudzanie',
        emoji: '🚶',
        title: 'Czy spacery wystarczą, żeby schudnąć?',
        subtitle: 'NEAT, kroki i codzienny ruch — ile realnie dają na redukcji.',
        meta: 'Czy spacery wystarczą do odchudzania? NEAT, kroki, niskointensywny ruch.',
        lead: 'Spacery nie spalają tyle, co trening, ale robią coś ważniejszego: utrzymują wysoki wydatek dzienny bez zmęczenia. To "cichy silnik" diety, który najczęściej bywa zaniedbany.',
        category: 'odchudzanie',
        sections: [
            { h2: 'Co to jest NEAT', p: 'To energia na całą dzienną aktywność poza treningiem: chodzenie, sprzątanie, stanie. U osób ruchliwych to nawet kilkaset kcal dziennie.' },
            { h2: 'Kroki a odchudzanie', p: 'Z 5 tys. na 8–10 tys. kroków dziennie dodasz ok. 200–300 kcal wydatku. To bardzo "tanie" kalorie — bez obciążenia regeneracji.' },
            { h2: 'Spacer vs cardio', p: 'Interwały spalają więcej na minutę, ale spacer jest wykonywalny codziennie, przez każdego i się nie nudzi. Rób oba.'
            }
        ],
        bullets: [
            '<strong>8–10 tys. kroków dziennie</strong> — Twoje NEAT-minimum.',
            '<strong>Spacer 20–40 min</strong> — po posiłku, do pracy, do sklepu.',
            '<strong>Nie odcinaj aktywności w weekend</strong> — 5 tys. kroków to za mało.'
        ],
        uwaga: 'Nie zastępuj 3 treningów spacerami — potrzebujesz bodźca siłowego. Ale kroki to fundament, na którym stoi reszta.',
        coDalej: 'Zobacz <a href="neat-kroki-wiecej-niz-silownia">NEAT w praktyce</a>.'
    },
    {
        slug: 'co-zamiast-slodyczy-strategia',
        emoji: '🍫',
        title: 'Co zamiast słodyczy — konkretna strategia na "coś słodkiego"',
        subtitle: 'Jak zaspokoić ochotę na słodkie, nie walcząc z nią 24/7.',
        meta: 'Ochota na słodkie: zamienniki, białkowe słodkości, plan na napad głodu.',
        lead: 'Walka z ochotą na słodycze "na silną wolę" zwykle kończy się objadaniem. Zamiast odcięcia — strategia: znasz swoją ochotę, masz przygotowane zamienniki o dobrej sytości.',
        category: 'odchudzanie',
        sections: [
            { h2: 'Skąd się bierze głód słodyczy?', p: 'Zbyt niskie kalorie, niedobór snu, stres i dieta uboga w białko. Wspólny mianownik większości napadów — brak kompromisu, tylko głodówka przez tydzień i potem awantura.' },
            { h2: 'Zamienniki, które działają', p: 'Skyr z owocami, jabłko z masłem orzechowym, białkowy pudding, gorzka czekolada 70–85% (kilka kostek). Dają słodki smak plus białko i sytość.' },
            { h2: 'Plan "napadowy"', p: 'Masz napad? Wypij wodę, odczekaj 10 minut, zjedz białkowy zamiennik. Jeśli wciąż chcesz — zjedz porcję słodkiego w ramach kalorii. Bez paniki i bez kary cardio.'
            }
        ],
        bullets: [
            '<strong>Białko i błonnik w posiłkach</strong> — mniej napadów.',
            '<strong>Zamiennik pod ręką</strong> — skyr, owoce, gorzka czekolada.',
            '<strong>Poczekaj 10 minut</strong> — połowa "głodu" to impuls.'
        ],
        uwaga: 'Nie trzymaj w domu "zwykłych" słodyczy, jeśli nie potrafisz zjeść jednej porcji. Winna jest dostępność, nie Twoja słabość.',
        coDalej: 'Zobacz <a href="cheat-meal-czy-rekompensata">cheat meal czy rekompensata</a>.'
    },
{
        slug: 'ile-treningow-tygodniowo-wystarczy',
        emoji: '🏋️',
        title: 'Ile treningów tygodniowo wystarczy?',
        subtitle: '2, 3 czy 5 treningów? Co realnie buduje formę przy ograniczonym czasie.',
        meta: 'Ile treningów tygodniowo na masę i redukcję: FBW, split, minimalna skuteczna dawka.',
        lead: 'Nie potrzebujesz 5 treningów. Dla większości osób 3 pełnowartościowe treningi całego ciała dają 90% efektu — a 5 to często 2 dodatkowe dni zmęczenia bez dodatkowych mięśni.',
        category: 'cwiczenia',
        sections: [
            { h2: 'Minimalna skuteczna dawka', p: '2 treningi tygodniowo wystarczą, żeby utrzymać i stopniowo budować mięśnie, jeśli objętość jest OK (10–20 serii na grupę tygodniowo). 3 treningi to optymalny kompromis efekt/czas.' },
            { h2: 'FBW czy split?', p: 'Przy 2–3 treningach wybierz FBW (całe ciało na każdym treningu). Split ma sens przy 4+ dniach, gdy jedna grupa ma czas na regenerację.' },
            { h2: 'Co z cardio?', p: '2–3 sesje lekkiego cardio lub spacery jako dodatek. Na redukcji cardio wspiera deficyt, ale nie zastąpi bodźca siłowego.'
            }
        ],
        bullets: [
            '<strong>2 treningi</strong> — utrzymanie i wolny progres.',
            '<strong>3 treningi FBW</strong> — optimum dla 90% osób.',
            '<strong>4–5</strong> — tylko jeśli regeneracja i sen grają.'
        ],
        uwaga: 'Lepszy 3×45 minut konsekwentnie przez rok niż 5×90 minut przez 6 tygodni i porzucenie. Wybierz plan, który przetrwa Twoje życie.',
        coDalej: 'Zobacz <a href="ile-serii-i-powtorzen-na-mase">ile serii i powtórzeń</a>.'
    },
    {
        slug: 'trening-rano-czy-wieczorem',
        emoji: '⏰',
        title: 'Trening rano czy wieczorem — czy pora ma znaczenie?',
        subtitle: 'Wydolność, siła, sen i głód — co naprawdę zmienia pora treningu.',
        meta: 'Trening rano czy wieczorem: siła, wydolność, sen i głód — co mówią badania.',
        lead: 'Pora treningu zmienia mniej niż myślisz. Różnice w sile między ranem a wieczorem to 3–5% — mniejsze niż różnica między "zrobiłem trening" a "nie zrobiłem".',
        category: 'cwiczenia',
        sections: [
            { h2: 'Co mówią badania', p: 'Siła i moc bywają lekko wyższe popołudniu/wieczorem (ciepło ciała, rozgrzane stawy). Ale przy stałej porze organizm adaptuje — ranny trening po 2–3 tygodniach przestaje być słabszy.' },
            { h2: 'Kiedy trenować?', p: 'Trenuj wtedy, kiedy rzeczywiście dotrwasz. Konsekwencja bije teoretyczne optimum. Jeżeli rano nie masz siły, a wieczorem nie masz czasu — problem nie jest w porze.' },
            { h2: 'Praktyczne niuanse', p: 'Rano: dłuższa rozgrzewka i posiłek wcześniej. Wieczorem: uważaj na intensywne treningi tuż przed snem — mogą opóźniać zasypianie.'
            }
        ],
        bullets: [
            '<strong>Konsekwencja > pora</strong> — stała godzina wygrywa.',
            '<strong>Rano</strong> — rozgrzewka 10 min i coś lekkiego do jedzenia.',
            '<strong>Wieczorem</strong> — koniec treningu 2–3 h przed snem.'
        ],
        uwaga: 'Jeśli bierzesz leki uspokajające albo masz kłopoty ze snem, unikaj mocnych treningów późnym wieczorem — zobacz artykuły o lekach i śnie.',
        coDalej: 'Zobacz <a href="sen-stres-i-waga">sen, stres i waga</a>.'
    },
    {
        slug: 'kardio-vs-sila-na-redukcji-2',
        emoji: '🏃',
        title: 'Cardio czy siła na redukcji — kolejność i proporcje',
        subtitle: 'Co robić najpierw na treningu, ile cardio nie zjada mięśni.',
        meta: 'Cardio a siła na redukcji: kolejność na treningu, ile cardio nie niszczy progresu.',
        lead: 'Cardio nie "zniszczy" Twoich mięśni — zniszczy je tylko brak treningu siłowego i zerowe białko. Ale kolejność i objętość mają znaczenie.',
        category: 'cwiczenia',
        sections: [
            { h2: 'Co najpierw?', p: 'Siła przed cardio. Trening siłowy wymaga świeżego układu nerwowego — po 40 minutach biegu technika i siła lecą. Cardio po siłach lub osobnym dniu.' },
            { h2: 'Ile cardio nie szkodzi?', p: 'Do ok. 150 min tygodniowo lekkiego cardio progres siłowy trzyma się dobrze. Interwały 2×/tydz. są OK; codzienne mocne biegi na redukcji realnie podkradają regenerację.' },
            { h2: 'Proporcje na redukcji', p: 'Fundament: 3 siłowe + 8–10 tys. kroków dziennie. Cardio jako narzędzie do doregulowania wydatku, nie jako kara za jedzenie.'
            }
        ],
        bullets: [
            '<strong>Siła przed cardio</strong> — zawsze, jeśli w jednym treningu.',
            '<strong>150 min/tydz. lekkiego</strong> — bezpieczny zakres.',
            '<strong>Kroki > bieżnia</strong> — tańsze dla regeneracji.'
        ],
        uwaga: 'Jeśli waga stoi, nie dodawaj godzin bieżni — najpierw sprawdź kalorie i kroki. Więcej cardio = większy głód, łatwiej stracić kontrolę.',
        coDalej: 'Zobacz <a href="sila-na-redukcji-dlaczego-nie-tylko-cardio">siła na redukcji</a>.'
    },
];
const articles = defs.map(buildArticle);
const out = path.join(__dirname, 'hardcore-articles-tematyczne.json');
writeFileSync(out, JSON.stringify(articles, null, 2) + '\n');
console.log(`Zapisano ${articles.length} artykułów tematycznych -> ${out}`);