/** Etykiety i meta kategorii (treść na dieta.html?kategoria=…) */
export const CATEGORY_ORDER = [
    'mieso',
    'nabial',
    'warzywa',
    'owoce',
    'zboza',
    'polskie-obiadki',
    'zupy',
    'orzechy',
    'tluszcze',
    'makarony',
    'fastfood',
    'slodycze',
    'batony',
    'sosy',
];

export const CATEGORY_LABELS = {
    mieso: 'Mięsa i ryby',
    nabial: 'Nabiał i jaja',
    warzywa: 'Warzywa',
    owoce: 'Owoce',
    zboza: 'Zboża i kasze',
    'polskie-obiadki': 'Polskie obiadki',
    zupy: 'Zupy',
    orzechy: 'Orzechy',
    tluszcze: 'Tłuszcze i oleje',
    makarony: 'Dania z makaronu',
    fastfood: 'Fast food',
    slodycze: 'Słodycze i przekąski',
    batony: 'Batony',
    sosy: 'Sosy',
};

/** Krótkie frazy pod meta description (bez powtarzania nazwy kategorii) */
export const CATEGORY_META_PHRASE = {
    mieso: 'mięso, drób, ryby — kalorie i białko na 100 g',
    nabial: 'nabiał, jaja, sery — kalorie i białko',
    warzywa: 'kalorie, białko i węglowodany na 100 g',
    owoce: 'kalorie, cukry i błonnik',
    zboza: 'zboża, kasze, ryż — makra na 100 g',
    'polskie-obiadki': 'pierogi, bigos, gołąbki i inne dania',
    zupy: 'rosół, krupnik, żurek, pomidorowa — makra',
    orzechy: 'orzechy i nasiona — białko i tłuszcze',
    tluszcze: 'oleje, masło, oliwa — kalorie na 100 g',
    makarony: 'makaron i dania makaronowe',
    fastfood: 'burgery, pizza, kebab — makra',
    slodycze: 'słodycze i przekąski — kalorie',
    batony: 'batony czekoladowe — kalorie i makro na 100 g',
    sosy: 'sosy i dipy — kalorie na 100 g',
};

export const CATEGORY_INTRO = {
    mieso:
        'Porównaj kalorie, białko i tłuszcze mięs, drobiu i ryb. Ranking Białko Maxxing pokaże, które źródła dają najwięcej proteinów przy najmniejszej liczbie kcal — ranking ceny za 100 g białka pomoże wybrać tanio.',
    nabial:
        'Twaróg, jajka, jogurty i sery to często najtańsze źródła białka. Zobacz rankingi w tej kategorii: gęstość białka względem kalorii oraz koszt 100 g czystego proteinu.',
    warzywa:
        'Warzywa zwykle mają niskie białko, ale liczą się kalorie, węglowodany i sytość na redukcji. Sprawdź makra na 100 g i porównaj produkty w tej kategorii.',
    owoce:
        'Owoce to głównie węglowodany i kalorie — zobacz, które mają więcej białka lub mniej kcal na 100 g, jeśli liczysz makro w diecie.',
    zboza:
        'Ryż, kasze, płatki i pieczywo — energia i węgle. Rankingi pokażą, które zboża mają lepszy profil białko/kcal i ile kosztuje 100 g białka z tej grupy.',
    'polskie-obiadki':
        'Polskie klasyki: pierogi, bigos, placki, zapiekanka. Porównaj kalorie i białko domowych dań — przydatne przy odchudzaniu i liczeniu makro.',
    zupy:
        'Zupy polskie i świata: rosół, krupnik, żurek, pomidorowa. Sprawdź kalorie i białko na 100 g oraz rankingi Białko Maxxing i ceny białka w tej kategorii.',
    orzechy:
        'Orzechy i nasiona: dużo kalorii, tłuszczu i często solidne białko roślinne. Zobacz, które mają najlepszy stosunek kcal do białka i koszt proteinu.',
    tluszcze:
        'Oleje, masło, oliwa — gęste kalorie, minimalne białko. Porównaj makra i wybierz świadomie tłuszcze do diety.',
    makarony:
        'Makarony suche, gotowe i dania z makaronem. Ranking Białko Maxxing i cena białka pomogą dobrać produkt pod cel sylwetkowy.',
    fastfood:
        'Burgery, pizza, kebab — wysokie kalorie. Zobacz, które fast foody mają więcej białka na kcal i ile kosztuje białko w tej kategorii.',
    slodycze:
        'Słodycze i przekąski — kalorie i cukry. Porównaj makra, jeśli wliczasz czekoladę czy ciasta do dziennego bilansu.',
    batony:
        'Snickers, Mars, Twix, 3 Bit i inne batony brandingowe — kalorie, białko i tłuszcz na 100 g. Sprawdź, ile kosztuje porcja w dziennym limicie.',
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
        'Ser tłusty licz po porcji, nie „na plaster” bez wagi.',
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
        'Płatki śniadaniowe sprawdź pod kątem cukru w składzie.',
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
        'Porównaj makaron z sosem kremowym i z kurczakiem — różnica w kcal bywa duża.',
        'Makaron suchy ≠ ugotowany — patrz na opis w bazie.',
        'Dodaj białko: kurczak, tuńczyk, twaróg lub ser.',
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
        'Wersje „protein” nie zawsze mają mniej kcal niż klasyczne — porównaj w tabeli.',
        'Porównaj Snickersa z batonem zbożowym: różnica w tłuszczu bywa duża.',
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
            'W bazie makro jest dla formy podanej przy produkcie. 100 g suchego makaronu to nie to samo co 100 g ugotowanego.',
        ],
        [
            'Jak dołożyć białko do makaronu?',
            'Kurczak, tuńczyk, twaróg, ser żółty lub odżywka — porównaj dania w porównywarce Proteiner.',
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
    batony: [
        [
            'Ile kalorii ma typowy baton?',
            'Większość Snickersów, Marsów czy Twixów to ok. 200–280 kcal na sztukę. W tabeli porównasz też wartości na 100 g.',
        ],
        [
            'Czy baton proteinowy jest „zdrowszy”?',
            'Ma więcej białka, ale kalorie bywają podobne. Porównaj Snickers Protein z klasycznym Snickersem w tej kategorii.',
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

