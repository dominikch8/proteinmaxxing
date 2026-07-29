/** Etykiety i meta kategorii (treść na dieta.html?kategoria=…) */
export const CATEGORY_ORDER = [
    'mieso',
    'nabial',
    'sery',
    'warzywa',
    'owoce',
    'zboza',
    'platki-sniadaniowe',
    'polskie-obiadki',
    'zupy',
    'orzechy',
    'tluszcze',
    'makarony',
    'mrozone-pizze',
    'fastfood',
    'slodycze',
    'batony',
    'batony-proteinowe',
    'sosy',
];

export const CATEGORY_LABELS = {
    mieso: 'Mięsa i ryby',
    nabial: 'Nabiał i jaja',
    sery: 'Sery',
    warzywa: 'Warzywa',
    owoce: 'Owoce',
    zboza: 'Zboża i kasze',
    'platki-sniadaniowe': 'Płatki śniadaniowe',
    'polskie-obiadki': 'Polskie obiadki',
    zupy: 'Zupy',
    orzechy: 'Orzechy',
    tluszcze: 'Tłuszcze i oleje',
    makarony: 'Makarony',
    'mrozone-pizze': 'Mrożone pizze',
    fastfood: 'Fast food',
    slodycze: 'Słodycze i przekąski',
    batony: 'Batony',
    'batony-proteinowe': 'Batony proteinowe',
    sosy: 'Sosy',
};

/** Krótkie frazy pod meta description (bez powtarzania nazwy kategorii) */
export const CATEGORY_META_PHRASE = {
    mieso: 'mięso, drób, ryby — kalorie i białko na 100 g',
    nabial: 'nabiał, jaja, jogurty, twarogi — kalorie i białko',
    sery: 'gouda, mozzarella, feta, oscypek — kalorie i białko',
    warzywa: 'kalorie, białko i węglowodany na 100 g',
    owoce: 'kalorie, cukry i błonnik',
    zboza: 'zboża, kasze, ryż — makra na 100 g',
    'platki-sniadaniowe': 'płatki, granola, musli — kalorie i cukier na 100 g',
    'polskie-obiadki': 'pierogi, bigos, gołąbki i inne dania',
    zupy: 'rosół, krupnik, żurek, pomidorowa — makra',
    orzechy: 'orzechy i nasiona — białko i tłuszcze',
    tluszcze: 'oleje, masło, oliwa — kalorie na 100 g',
    makarony: 'makaron suchy — fusilli, penne, spaghetti na 100 g',
    'mrozone-pizze': 'Guseppe, Feliciana, Dzik, Ristorante — makra na 100 g',
    fastfood: 'burgery, pizza, kebab — makra',
    slodycze: 'słodycze i przekąski — kalorie',
    batony: 'batony czekoladowe — kalorie i makro na 100 g',
    'batony-proteinowe': 'batony proteinowe — białko i kalorie na 100 g',
    sosy: 'sosy i dipy — kalorie na 100 g',
};

export const CATEGORY_INTRO = {
    mieso:
        'Porównaj kalorie, białko i tłuszcze mięs, drobiu i ryb. Ranking Białko Maxxing pokaże, które źródła dają najwięcej proteinów przy najmniejszej liczbie kcal — ranking ceny za 100 g białka pomoże wybrać tanio.',
    nabial:
        'Twaróg, jajka i jogurty to często najtańsze źródła białka. Sery znajdziesz w osobnej kategorii. Zobacz rankingi: gęstość białka względem kalorii oraz koszt 100 g proteinu.',
    sery:
        'Gouda, mozzarella, feta, camembert, oscypek i inne popularne sery w Polsce. Porównaj kalorie, białko i tłuszcz na 100 g oraz ranking ceny białka.',
    warzywa:
        'Warzywa zwykle mają niskie białko, ale liczą się kalorie, węglowodany i sytość na redukcji. Sprawdź makra na 100 g i porównaj produkty w tej kategorii.',
    owoce:
        'Owoce to głównie węglowodany i kalorie — zobacz, które mają więcej białka lub mniej kcal na 100 g, jeśli liczysz makro w diecie.',
    zboza:
        'Ryż, kasze i pieczywo — energia i węgle (bez makaronów). Rankingi pokażą, które zboża mają lepszy profil białko/kcal i ile kosztuje 100 g białka z tej grupy. Makarony są w osobnej kategorii; płatki śniadaniowe też.',
    'platki-sniadaniowe':
        'Płatki owsiane, Corn Flakes, Nesquik, Cini Minis, granola i musli — porównaj cukier, kalorie i białko na 100 g przed śniadaniem.',
    'polskie-obiadki':
        'Polskie klasyki: pierogi, bigos, placki, zapiekanka. Porównaj kalorie i białko domowych dań — przydatne przy odchudzaniu i liczeniu makro.',
    zupy:
        'Zupy polskie i świata: rosół, krupnik, żurek, pomidorowa. Sprawdź kalorie i białko na 100 g oraz rankingi Białko Maxxing i ceny białka w tej kategorii.',
    orzechy:
        'Orzechy i nasiona: dużo kalorii, tłuszczu i często solidne białko roślinne. Zobacz, które mają najlepszy stosunek kcal do białka i koszt proteinu.',
    tluszcze:
        'Oleje, masło, oliwa — gęste kalorie, minimalne białko. Porównaj makra i wybierz świadomie tłuszcze do diety.',
    makarony:
        'Makarony suche i typy makaronu: spaghetti, penne, fusilli, tortellini. Porównaj węglowodany i kalorie przed ugotowaniem — dania z makaronem znajdziesz w Polskich obiadkach.',
    'mrozone-pizze':
        'Mrożone pizze z marketu: Guseppe, Feliciana, Dzik, Ristorante, Wagner. Porównaj kalorie i białko na 100 g — proteinowe Dzik vs klasyczne cienkie ciasto.',
    fastfood:
        'Burgery, pizza z lokalu, kebab — wysokie kalorie. Mrożone pizze z marketu są w osobnej kategorii. Zobacz ranking białka w tej grupie.',
    slodycze:
        'Słodycze i przekąski — kalorie i cukry. Porównaj makra, jeśli wliczasz czekoladę czy ciasta do dziennego bilansu.',
    batony:
        'Snickers, Mars, Twix, 3 Bit i inne batony brandingowe — kalorie, białko i tłuszcz na 100 g. Sprawdź, ile kosztuje porcja w dziennym limicie.',
    'batony-proteinowe':
        'Batony proteinowe (Snickers Protein, Mars Protein, Go On…) — więcej białka niż klasyczny baton, ale kalorie bywają podobne. Porównaj makro na 100 g i na sztukę.',
    sosy:
        'Ketchup, majonez, sosy sałatkowe — małe porcje, duży wpływ na kalorie. Sprawdź makra na 100 g w tej kategorii.',
};

export function formatProductCount(n) {
    if (n === 1) return '1 produkt';
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} produkty`;
    return `${n} produktów`;
}

/** Praktyczne tipy na stronie kategorii (3 na kategorię). */
export const CATEGORY_TIPS = {
    mieso: [
        'Wybieraj chude gatunki przy redukcji (pierś z kurczaka, indyk, dorsz).',
        'Porównaj mięso z rybą i nabiałem w porównywarce — czasem tańsze źródło ma lepsze makro.',
        'Wędliny i panierka podbijają sól i tłuszcz — czytaj etykietę na 100 g.',
    ],
    nabial: [
        'Twaróg i skyr dają dużo białka za niską cenę — sprawdź ranking ceny białka.',
        'Jogurty owocowe mają więcej cukru niż naturalne — porównaj w bazie.',
        'Sery żółte i miękkie są w kategorii Sery — tam porównasz Gouda, Feta, Mozzarella.',
    ],
    sery: [
        'Ser licz po gramach — plaster „na oko” szybko zawyża tłuszcz i kcal.',
        'Gouda i edamski to klasyki kanapkowe; mozzarella i feta lepiej pasują do sałatek.',
        'Oscypek i sery wędzone są gęste kalorycznie — mała porcja wystarczy.',
    ],
    warzywa: [
        'Duża porcja warzyw zwiększa sytość przy małej liczbie kcal.',
        'Mrożonki są równie wartościowe co świeże — mniej marnowania.',
        'Olej do sałatki licz osobno — warzywa same w sobie są lekkie.',
    ],
    owoce: [
        'Porcjonuj owoce jak węgle — garść jagód to nie to samo co sok z kilku jabłek.',
        'Banany i awokado mają więcej kcal niż truskawki czy arbuz.',
        'Owoce po treningu mogą uzupełnić węgle, jeśli mieszczą się w planie.',
    ],
    zboza: [
        'Porównuj makro suchego produktu z tym, co jesz po ugotowaniu.',
        'Pełnoziarniste mają więcej błonnika — często dłużej sytną.',
        'Płatki śniadaniowe są w osobnej kategorii — tam łatwiej porównać cukier.',
    ],
    'platki-sniadaniowe': [
        'Sprawdź cukier na 100 g — różnica między Corn Flakes a Nestlé bywa duża.',
        'Płatki owsiane i musli bez cukru zwykle lepiej wpisują się w deficyt.',
        'Mleko do płatków licz osobno — samo opakowanie to nie cały posiłek.',
    ],
    'polskie-obiadki': [
        'Sosy, śmietana i smażenie często dodają więcej kcal niż samo mięso.',
        'Domowe porcje zwykle łatwiej zważyć niż danie w restauracji.',
        'Bigos i gołąbki różnią się makro — nie zakładaj jednej liczby dla wszystkich.',
    ],
    zupy: [
        'Zupa jako starter często lepiej wpisuje się w deficyt niż drugie danie wysokotłuszczowe.',
        'Kremy ze śmietaną mają więcej kcal niż rosół czy jarzynowa.',
        'Zupy instant — sprawdź sól i makro na opakowaniu.',
    ],
    orzechy: [
        'Odmierzaj garść (20–30 g) — kalorie rosną szybciej niż sytość.',
        'Masło orzechowe to nie to samo co garść orzechów — inne makro.',
        'Orzechy do jogurtu lub owsianki — licz cały posiłek.',
    ],
    tluszcze: [
        'Jedna łyżka oliwy to ok. 90 kcal — licz ją osobno.',
        'Masło vs oliwa: różne proporcje nasyconych i nienasyconych tłuszczów.',
        'Tłuszcz jest potrzebny — chodzi o porcję z kalkulatora, nie o zerowy limit.',
    ],
    makarony: [
        'Makro w bazie dotyczy formy suchej — po ugotowaniu kcal na 100 g spada przez wodę.',
        'Pełnoziarnisty ma więcej błonnika; jajeczny nie zawsze ma więcej białka.',
        'Carbonara, lasagne i inne dania z makaronem są w kategorii Polskie obiadki.',
    ],
    'mrozone-pizze': [
        'Wartości na 100 g z etykiety — cała pizza to często 300–400 g.',
        'Linie proteinowe (np. Dzik) mają więcej białka przy podobnych węglach.',
        'Po upieczeniu woda odparowuje — waż porcję gotową, jeśli liczysz precyzyjnie.',
    ],
    fastfood: [
        'Wpisz posiłek do limitu z góry zamiast kompensować głodówką następnego dnia.',
        'Burger bez frytek i napoju słodzonego to inny bilans niż zestaw.',
        'Ranking Białko maxxing pokazuje lżejsze opcje w tej kategorii.',
    ],
    slodycze: [
        'Planuj porcję w tygodniu — zakaz często kończy się objadaniem.',
        'Czekolada gorzka ma inne makro niż mleczna — porównaj w bazie.',
        'Ciastka i chipsy łatwo „znikają” z opakowania — waż porcję.',
    ],
    batony: [
        'Jeden baton to często 200–280 kcal — wpisz go do limitu z góry.',
        'Porównaj Snickersa z batonem zbożowym: różnica w tłuszczu bywa duża.',
        'Batony proteinowe znajdziesz w osobnej kategorii — inne makro.',
    ],
    'batony-proteinowe': [
        'Więcej białka ≠ mniej kcal — zawsze porównaj z klasycznym batonem.',
        'Szukaj ok. 15–20 g białka na sztukę przy rozsądnych kcal.',
        'Cukry i tłuszcze nadal się liczą — wpisz baton do dziennego limitu.',
    ],
    sosy: [
        'Ketchup i majonez szybko podbijają kalorie — makro na 100 g.',
        'Musztarda i sos sojowy są zwykle lżejsze niż kremy.',
        'Sos w restauracji — odmierz łyżką w domu, żeby znać skalę.',
    ],
};

/** FAQ na stronie kategorii — para [pytanie, odpowiedź]. */
export const CATEGORY_FAQ = {
    mieso: [
        [
            'Ile białka daje mięso na 100 g?',
            'Zależy od gatunku: pierś z kurczaka ok. 23 g, wołowina 20–26 g, wędliny często mniej. W tabeli poniżej sortuj produkty po białku.',
        ],
        [
            'Czy mięso jest konieczne na redukcji?',
            'Nie — białko możesz brać z ryb, jaj, nabiału lub roślin strączkowych. Mięso to wygodne źródło, nie obowiązek.',
        ],
    ],
    nabial: [
        [
            'Co ma najwięcej białka w nabiale?',
            'Twaróg chudy, skyr i jogurt grecki 0–2% — często 10–18 g białka na 100 g przy umiarkowanych kcal.',
        ],
        [
            'Gdzie są sery?',
            'Sery (gouda, mozzarella, feta, camembert…) są w osobnej kategorii „Sery”. Tu zostają twarogi, jogurty, mleko i jajka.',
        ],
    ],
    sery: [
        [
            'Które sery są najpopularniejsze w Polsce?',
            'Gouda, edamski, mozzarella, camembert, feta, parmezan, cheddar, brie, halloumi i oscypek — porównaj je w tabeli poniżej.',
        ],
        [
            'Czy ser tłusty psuje dietę?',
            'Sam w sobie nie — liczy się porcja i dzienny bilans. Sery mają więcej tłuszczu nasyconego, więc łatwiej przekroczyć kcal.',
        ],
    ],
    warzywa: [
        [
            'Czy warzywa mają dużo białka?',
            'Zwykle niewiele (1–3 g / 100 g), ale niskie kcal i dużo błonnika. Łącz je z źródłem białka w posiłku.',
        ],
        [
            'Mrożonki vs świeże — co wybrać?',
            'Makro jest podobne; mrożonki są wygodne i redukują marnowanie. Ważna jest porcja i sposób przygotowania.',
        ],
    ],
    owoce: [
        [
            'Które owoce mają najmniej kalorii?',
            'Truskawki, arbuz, maliny — zwykle poniżej 50 kcal / 100 g. Banan i awokado są kaloryczniejsze.',
        ],
        [
            'Czy owoce na redukcji są złe?',
            'Nie — liczy się dzienna pula węglowodanów. Owoce wpisujesz jak każdy inny składnik z kalkulatora.',
        ],
    ],
    zboza: [
        [
            'Ryż suchy czy gotowany — co wpisywać?',
            'Na Proteinerze sprawdź opis przy produkcie. Po ugotowaniu kcal na 100 g spada przez wodę — nie porównuj suchego z gotowym.',
        ],
        [
            'Pełnoziarniste czy białe?',
            'Pełnoziarniste mają więcej błonnika i często dłużej sytną. Kalorie bywają podobne — patrz na etykietę.',
        ],
    ],
    'polskie-obiadki': [
        [
            'Czy polskie dania nadają się na redukcję?',
            'Tak, jeśli wpiszesz porcję do dziennego limitu. Bigos, pierogi czy gołąbki różnią się kcal — porównaj w bazie.',
        ],
        [
            'Od czego zacząć przy liczeniu?',
            'Zważ porcję i dodaj sosy osobno. Domowe dania bez panierki zwykle mają przewidywalniejsze makro niż wersja „na mieście”.',
        ],
    ],
    zupy: [
        [
            'Która zupa ma najmniej kalorii?',
            'Rosół, jarzynowa i pomidorowa bez śmietany — często poniżej 50 kcal / 100 g. Kremy i zupy instant mają więcej.',
        ],
        [
            'Czy zupa zastępuje posiłek?',
            'Lekka zupa to dobry starter; przy budowie masy dodaj białko (mięso, soczewica, twaróg) do pełnego posiłku.',
        ],
    ],
    orzechy: [
        [
            'Ile orzechów dziennie?',
            'Orientacyjnie 20–30 g (garść) — ok. 120–200 kcal zależnie od rodzaju. Reszta dnia według TDEE.',
        ],
        [
            'Czy orzechy mają dużo białka?',
            'Roślinne białko w orzechach jest obok tłuszczu — kalorie rosną szybciej niż przy chudym mięsie.',
        ],
    ],
    tluszcze: [
        [
            'Ile tłuszczu na redukcji?',
            'Z kalkulatora — zwykle 20–30% kcal. Tłuszcz jest potrzebny hormonalnie; chodzi o porcję, nie eliminację.',
        ],
        [
            'Oliwa czy masło?',
            'Oliwa ma więcej nienasyconych kwasów tłuszczowych; masło więcej nasyconych. Obie opcje liczysz po kcal.',
        ],
    ],
    makarony: [
        [
            'Makaron suchy czy gotowy — jak liczyć?',
            'W tej kategorii są suche makarony i typy (penne, spaghetti, tortellini). 100 g suchego to nie to samo co 100 g ugotowanego.',
        ],
        [
            'Gdzie są dania makaronowe?',
            'Carbonara, bolognese, lasagne i makaron z kurczakiem są w kategorii Polskie obiadki.',
        ],
    ],
    'mrozone-pizze': [
        [
            'Ile kalorii ma mrożona pizza?',
            'Zwykle 190–280 kcal na 100 g zależnie od smaku. Cała pizza to często 600–900 kcal — sprawdź porcję w bazie.',
        ],
        [
            'Która mrożona pizza ma najwięcej białka?',
            'Linie proteinowe (np. Dzik) mają ok. 14–19 g białka na 100 g. Klasyczne Guseppe/Feliciana zwykle ok. 8–11 g.',
        ],
    ],
    fastfood: [
        [
            'Czy fast food psuje dietę?',
            'Nie sam w sobie — psuje niekontrolowana nadwyżka kcal w tygodniu. Wpisz burgera lub pizzę do dziennego limitu.',
        ],
        [
            'Co wybrać przy ograniczonych kcal?',
            'Szukaj opcji z większą ilością białka i mniejszą porcją sosów — ranking Białko maxxing w tej kategorii pomaga.',
        ],
    ],
    slodycze: [
        [
            'Czy muszę rezygnować ze słodyczy?',
            'Nie. Planowana porcja ciastka lub czekolady w tygodniu jest lepsza niż zakaz i późniejsze objadanie.',
        ],
        [
            'Dlaczego słodycze mają mało białka?',
            'To głównie cukry i tłuszcz — stąd wysoka kcal przy niskiej sytości. Traktuj jako dodatek, nie bazę posiłku.',
        ],
    ],
    'platki-sniadaniowe': [
        [
            'Które płatki mają najmniej cukru?',
            'Zwykle płatki owsiane i musli bez cukru. Brandingowe (Nesquik, Cini Minis, Cookie Crisps) bywają słodsze — porównaj w tabeli na 100 g.',
        ],
        [
            'Czy granola jest zdrowa?',
            'Zależy od przepisu — często ma dużo cukru i tłuszczu. Traktuj jak gęste kalorie i waż porcję, zamiast sypać „na oko”.',
        ],
    ],
    batony: [
        [
            'Ile kalorii ma typowy baton?',
            'Większość Snickersów, Marsów czy Twixów to ok. 200–280 kcal na sztukę. W tabeli porównasz też wartości na 100 g.',
        ],
        [
            'Gdzie są batony proteinowe?',
            'W osobnej kategorii „Batony proteinowe” — tam Snickers Protein, Mars Protein i podobne pozycje z wyższym białkiem.',
        ],
    ],
    'batony-proteinowe': [
        [
            'Czy baton proteinowy jest „zdrowszy” od zwykłego?',
            'Ma więcej białka, ale kalorie często są podobne. Porównaj Snickers Protein z klasycznym Snickersem w kategorii Batony.',
        ],
        [
            'Ile białka powinien mieć dobry baton proteinowy?',
            'Orientacyjnie 15–20 g na sztukę. Sprawdź też cukry i tłuszcz — samo „protein” na opakowaniu nie wystarczy.',
        ],
    ],
    sosy: [
        [
            'Który sos ma najmniej kalorii?',
            'Musztarda, sos sojowy, niektóre wersje jogurtowe — majonez i sosy kremowe mają zwykle więcej kcal.',
        ],
        [
            'Jak liczyć sos do sałatki?',
            'Odmierz łyżkę (ok. 15 g) i przelicz na 100 g z bazy — „na oko” często znaczy 2–3× więcej kalorii.',
        ],
    ],
};

export function categoryPagePath(category) {
    return `produkty/kategoria/${category}`;
}

