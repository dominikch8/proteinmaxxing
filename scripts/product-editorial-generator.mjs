/**
 * Generuje unikalny opis redakcyjny per produkt (na podstawie makro, kategorii, porcji).
 * Używany gdy brak ręcznego wpisu w product-editorial.json.
 */
import { CATEGORY_LABELS } from './category-seo.mjs';

function hashSlug(slug, salt = 0) {
    let h = salt ^ 0x811c9dc5;
    for (let i = 0; i < slug.length; i++) {
        h ^= slug.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
}

function pick(arr, slug, salt = 0) {
    if (!arr.length) return '';
    return arr[hashSlug(slug, salt) % arr.length];
}

function fmt(n) {
    const v = Number(n);
    return Number.isInteger(v) ? String(v) : v.toFixed(1).replace(/\.0$/, '');
}

function proteinKcalRatio(p) {
    return p.protein > 0 ? p.kcal / p.protein : null;
}

function macroProfile(p) {
    const ratio = proteinKcalRatio(p);
    if (p.protein >= 18 && p.kcal <= 160) return 'lean-protein';
    if (p.protein >= 12 && ratio != null && ratio <= 8) return 'protein-dense';
    if (p.protein >= 8 && p.kcal <= 120) return 'protein-light';
    if (p.kcal <= 45) return 'very-low-cal';
    if (p.kcal <= 90) return 'low-cal';
    if (p.fat >= 15 && p.protein < 8) return 'high-fat';
    if (p.carbs >= 25 && p.protein < 6) return 'carb-heavy';
    if (p.kcal >= 300) return 'calorie-dense';
    if (p.category === 'slodycze' || p.category === 'fastfood') return 'treat';
    return 'balanced';
}

function servingPhrase(p) {
    if (p.servingText) return p.servingText;
    if (p.servingGrams) return `porcja ok. ${p.servingGrams} g`;
    if (p.servingRatio) return `porcja (${p.servingRatio} × 100 g)`;
    return 'porcja z tabeli powyżej';
}

function microSnippet(p) {
    if (!p.micros || p.micros === '-') return '';
    const parts = p.micros.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0];
    if (parts.length === 2) return `${parts[0]} i ${parts[1]}`;
    return `${parts.slice(0, 2).join(', ')} oraz ${parts[2]}`;
}

function priceSnippet(p) {
    if (p.pricePer100gProtein != null && p.pricePer100gProtein > 0) {
        return `W rankingu „cena za 100 g białka” wychodzi ok. ${p.pricePer100gProtein.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł — warto porównać z innymi źródłami proteinów w tej samej kategorii.`;
    }
    if (p.servingPricePln != null && p.servingPricePln > 0) {
        return `Szacunkowa cena porcji (${servingPhrase(p)}) to ok. ${p.servingPricePln.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł — pamiętaj, że to orientacyjna kwota z gazetek, nie aktualna oferta sklepu.`;
    }
    return '';
}

function buildTitle(p) {
    const profile = macroProfile(p);
    const titles = {
        'lean-protein': [
            `${p.name} — chude białko w diecie`,
            `${p.name}: makro przy redukcji`,
            `Jak wykorzystać ${p.name}?`
        ],
        'protein-dense': [
            `${p.name} — dużo białka, mało kcal`,
            `${p.name} w planie żywieniowym`,
            `Białko z ${p.name}`
        ],
        'very-low-cal': [
            `${p.name} — lekki dodatek do posiłku`,
            `${p.name} na diecie redukcyjnej`,
            `Kalorie i porcja: ${p.name}`
        ],
        'high-fat': [
            `${p.name} — tłuszcz i porcja`,
            `${p.name}: kalorie w małej objętości`,
            `Jak liczyć ${p.name}?`
        ],
        'carb-heavy': [
            `${p.name} — węglowodany w planie`,
            `${p.name} przed i po treningu`,
            `Energia z ${p.name}`
        ],
        'calorie-dense': [
            `${p.name} — gęste kalorycznie`,
            `${p.name}: kiedy ma sens?`,
            `Makro ${p.name}`
        ],
        treat: [
            `${p.name} a dzienny limit kcal`,
            `${p.name} — świadomy wybór`,
            `${p.name}: kiedy ma sens w diecie?`
        ],
        balanced: [
            `${p.name} — praktyczny przewodnik`,
            `${p.name} w codziennej diecie`,
            `Co warto wiedzieć o ${p.name}?`
        ]
    };
    return pick(titles[profile] || titles.balanced, p.slug, 11);
}

function buildOpening(p) {
    const name = p.name;
    const cat = CATEGORY_LABELS[p.category] || p.category;
    const profile = macroProfile(p);
    const ratio = proteinKcalRatio(p);
    const micro = microSnippet(p);

    const templates = {
        'lean-protein': [
            `${name} to klasyk osób liczących makro: ${fmt(p.protein)} g białka przy ${fmt(p.kcal)} kcal na 100 g daje stosunek ok. ${ratio?.toFixed(1)} kcal na gram proteinu — jeden z korzystniejszych w kategorii ${cat.toLowerCase()}.`,
            `Jeśli szukasz źródła białka bez nadmiaru tłuszczu, ${name} wpisuje się w większość planów redukcyjnych. Na 100 g masz ${fmt(p.protein)} g proteinów i ${fmt(p.kcal)} kcal — konkretne liczby, które łatwo przenieść z kalkulatora TDEE na talerz.`,
            `${name} pojawia się w polskich jadłospisach nie bez powodu: ${fmt(p.protein)} g białka na 100 g to wynik, który trudno przebić wieloma produktami spożywczymi bez dokładania zbędnych kalorii.`
        ],
        'protein-dense': [
            `${name} łączy wysoką zawartość białka (${fmt(p.protein)} g / 100 g) z umiarkowaną kalorycznością (${fmt(p.kcal)} kcal). W praktyce oznacza to, że jedna porcja (${servingPhrase(p)}) może pokryć znaczną część dziennego celu proteinowego.`,
            `W kategorii „${cat}” ${name} wyróżnia się profilem makro — ${fmt(p.protein)} g białka i ${fmt(p.carbs)} g węglowodanów na 100 g. To produkt, który często wybierany jest zamiast droższych suplementów, gdy wystarczy normalne jedzenie.`,
            `Na 100 g ${name} dostarcza ${fmt(p.protein)} g białka przy ${fmt(p.kcal)} kcal. Dla porównania: to więcej proteinów niż w typowym jogurcie owocowym przy podobnej lub niższej kaloryczności.`
        ],
        'very-low-cal': [
            `${name} ma zaledwie ${fmt(p.kcal)} kcal na 100 g — możesz zjeść spory kęs bez obawy, że zje resztę dziennego deficytu. Białka jest ${fmt(p.protein)} g, więc traktuj ten produkt jako uzupełnienie objętości posiłku, nie główne źródło proteinów.`,
            `Przy odchudzaniu ${name} pomaga „zapełnić” talerz: niska energia (${fmt(p.kcal)} kcal / 100 g) i ${fmt(p.carbs)} g węglowodanów sprawiają, że łatwiej utrzymać sytość, gdy reszta dnia jest liczona w gramach.`,
            `${name} to przykład produktu, przy którym liczy się porcja z wagą, ale sama kaloryczność nie przeraża — ${fmt(p.kcal)} kcal na 100 g to dużo mniej niż większość dań obiadowych.`
        ],
        'low-cal': [
            `${name} (${fmt(p.kcal)} kcal, ${fmt(p.protein)} g białka na 100 g) pasuje do dni, gdy chcesz zostawić miejsce na bardziej kaloryczny obiad lub deser. W kategorii ${cat.toLowerCase()} to rozsądny wybór na redukcji.`,
            `Kaloryczność ${name} na poziomie ${fmt(p.kcal)} kcal / 100 g pozwala włączyć produkt do sałatki, smoothie lub drugiego dania bez psucia bilansu z kalkulatora Proteiner.`,
            `${name} nie jest „dietetyczny” dlatego, że tak pisze producent — po prostu ma niewiele energii na 100 g (${fmt(p.kcal)} kcal) przy ${fmt(p.fat)} g tłuszczu.`
        ],
        'high-fat': [
            `${name} jest gęsty kalorycznie: ${fmt(p.kcal)} kcal i ${fmt(p.fat)} g tłuszczu na 100 g. To nie wada — tłuszcz sytni i potrzebny w zbilansowanej diecie — ale łatwo przesadzić z porcją, jeśli nie ważysz produktu.`,
            `W małej objętości ${name} kryje sporo energii (${fmt(p.kcal)} kcal / 100 g). Białka jest ${fmt(p.protein)} g, więc nie traktuj tego produktu jak głównego źródła proteinów; licz go przede wszystkim w puli tłuszczów.`,
            `${name} często ląduje w diecie jako dodatek — do owsianki, sałatki lub pieczenia. Przy ${fmt(p.fat)} g tłuszczu na 100 g wystarczy zmienić łyżkę więcej, by wybić się z planu kalorycznego.`
        ],
        'carb-heavy': [
            `${name} to przede wszystkim węglowodany: ${fmt(p.carbs)} g na 100 g przy ${fmt(p.protein)} g białka. Sprawdza się, gdy z kalkulatora wynika, że masz jeszcze miejsce na węgle — np. po treningu lub w dniu z większą aktywnością.`,
            `Energia z ${name} (${fmt(p.kcal)} kcal / 100 g) pochodzi głównie ze skrobi i cukrów. Na redukcji nie musisz z niego rezygnować — dopasuj porcję do dziennego limitu węglowodanów.`,
            `${name} w kategorii ${cat.toLowerCase()} to klasyczne uzupełnienie glikogenu. Sam w sobie rzadko zaspokoi zapotrzebowanie na białko (${fmt(p.protein)} g / 100 g), ale dobrze łączy się z mięsem, rybą lub nabiałem.`
        ],
        'calorie-dense': [
            `${name} ma ${fmt(p.kcal)} kcal na 100 g — to produkt, który szybko domyka dzienny bilans energetyczny. Przy ${fmt(p.protein)} g białka warto świadomie zaplanować porcję, zwłaszcza na deficycie.`,
            `Jedna porcja ${name} (${servingPhrase(p)}) potrafi odpowiadać pełnemu, lekkostrawnemu posiłkowi pod względem kalorii. Zanim dodasz go do dnia, sprawdź w kalkulatorze, ile kcal zostało Ci jeszcze „w budżecie”.`,
            `${name} nie jest „zakazany” — po prostu ma gęsty profil energetyczny (${fmt(p.kcal)} kcal, ${fmt(p.fat)} g tłuszczu na 100 g). Na masie bywa wygodny; na redukcji wymaga mniejszej porcji lub rzadszego włączenia.`
        ],
        treat: [
            `${name} (${fmt(p.kcal)} kcal / 100 g) to raczej okazjonalny wybór niż baza tygodnia. Na Proteinerze pokazujemy makro bez moralizowania — licz porcję i wpisz ją do dziennego limitu z kalkulatora.`,
            `Słodycze i fast food mają sens w diecie wtedy, gdy reszta dnia jest poukładana. ${name} ma ${fmt(p.carbs)} g węglowodanów i ${fmt(p.fat)} g tłuszczu na 100 g — porównaj z domową alternatywą w <a href="../porownaj-produkty.html">porównywarce</a>.`,
            `${name} często wybierany „z rozpędu”, a potem trudno domknąć deficyt. Warto z góry wiedzieć, że 100 g to ${fmt(p.kcal)} kcal — czasem tyle co spokojny obiad z warzywami i mięsem.`
        ],
        balanced: [
            `${name} w kategorii ${cat.toLowerCase()} ma profil ${fmt(p.protein)} g białka, ${fmt(p.carbs)} g węglowodanów i ${fmt(p.fat)} g tłuszczu na 100 g (${fmt(p.kcal)} kcal). To konkretne liczby do wpisania w plan zamiast ogólnych zaleceń „jedz zdrowo”.`,
            `Nie każdy produkt musi być rekordzistą białka — ${name} pokazuje umiarkowany, ale praktyczny bilans makro. Porcja (${servingPhrase(p)}) pomaga przełożyć wartości na talerz bez przeliczania w głowie.`,
            `${name} to pozycja, którą wielu użytkowników Proteiner dodaje do rotacji obiadowej. ${fmt(p.kcal)} kcal na 100 g i ${fmt(p.protein)} g proteinów — sprawdź, jak wpisuje się w Twój cel z kalkulatora (redukcja, masa lub utrzymanie).`
        ]
    };

    let text = pick(templates[profile] || templates.balanced, p.slug, 1);
    if (micro && hashSlug(p.slug, 3) % 3 === 0) {
        text += ` Wartości odżywcze obejmują m.in. ${micro}.`;
    }
    if (p.extra && p.extra.length > 20 && hashSlug(p.slug, 5) % 2 === 0) {
        text += ` ${p.extra.charAt(0).toUpperCase()}${p.extra.slice(1).replace(/\.$/, '')}.`;
    }
    return text;
}

function buildPractical(p) {
    const profile = macroProfile(p);
    const serving = servingPhrase(p);
    const cat = p.category;

    const reduction = [
        `Na redukcji ${p.name} najlepiej sprawdza się w porcji zważonej (${serving}) — wpisz ją do dziennego bilansu razem z dodatkami. Sos, olej do smażenia czy bułka obok potrafią zmienić kcal bardziej niż sam produkt.`,
        `Jeśli z kalkulatora wynika deficyt, ${p.name} możesz włączyć do planu, o ile mieści się w limicie białka i kalorii. Unikaj „ocznego” szacowania — jedna większa porcja to często +150–300 kcal.`,
        `Przy odchudzaniu liczy się cały dzień, nie jeden produkt. ${p.name} na talerzu obok warzyw i źródła białka daje syty posiłek bez rezygnowania z ulubionych smaków.`
    ];

    const mass = [
        `Przy budowie masy ${p.name} może uzupełniać nadwyżkę kaloryczną — zwłaszcza gdy trudno zjeść kolejny klasyczny posiłek. Porcja ${serving} to punkt startowy; dostosuj ją do wyniku z kalkulatora (+ ok. 300 kcal nad utrzymaniem).`,
        `Na masie ${p.name} bywa dodatkiem do obiadu lub przekąską po treningu. Zwróć uwagę na tłuszcz (${fmt(p.fat)} g / 100 g) — przy bardzo wysokiej kaloryczności łatwo przejść z „nadwyżki” w nadmiar tłuszczu w diecie.`,
        `Większa porcja ${p.name} to szybki sposób na dołożenie energii. Łącz go z ryżem, ziemniakami lub pieczywem tylko wtedy, gdy węglowodany z kalkulatora na to pozwalają.`
    ];

    const maintain = [
        `Przy utrzymaniu wagi ${p.name} wpisujesz jak każdy inny składnik — porcja ${serving}, reszta dnia według TDEE bez korekty ±300–400 kcal. To najprostszy scenariusz do testowania w kalkulatorze Proteiner.`,
        `Nie musisz traktować ${p.name} jako produktu „na specjalną okazję”. Przy stabilnej wadze rotacja kilku ulubionych pozycji ułatwia trzymanie makro bez nudnej diety.`,
        `Utrzymanie to balans: ${p.name} razem z warzywami, zbożami i białkiem z mięsa lub nabiału. Sprawdź w bazie podobne produkty — czasem wymiana na inną pozycję z tej samej kategorii poprawia sytość przy tych samych kcal.`
    ];

    const categoryTips = {
        mieso: `Mięso i ryby piecz lub grilluj bez panierki — wtedy profil zbliża się do tabeli na 100 g. Smażenie w głębokim tłuszczu podbija kalorie niezależnie od gatunku.`,
        nabial: `W nabiale smak często idzie w parze z tłuszczem — wersje „light” mają mniej kcal, ale sprawdź, czy nie dokładano cukru. Naturalny skład zwykle ułatwia liczenie makro.`,
        warzywa: `Warzywa gotuj na parze lub krótko na patelni — mniej witamin traci się niż przy długim gotowaniu w dużej ilości wody. Do sałatek olej licz osobno.`,
        owoce: `Owoce dojrzałe są słodsze i mają więcej cukrów prostych niż mniej dojrzałe. Do jogurtu lub owsianki dodawaj owoce na wadze, nie „na oko”.`,
        zboza: `Zboża i kasze zyskują wodę podczas gotowania — wartości na 100 g w bazie odnoszą się do formy podanej w opisie porcji; suchy produkt ≠ ugotowany.`,
        'polskie-obiadki': `Polskie dania często zawierają ukryte tłuszcze w sosie i smażeniu. Jeśli jesz poza domem, przyjmij wyższą kaloryczność niż w tabeli domowej.`,
        zupy: `Zupy kremowe ze śmietaną mają więcej kcal niż rosół czy jarzynowa. Bulion domowy z mięsem podbija białko w porcji — instant zwykle go nie ma.`,
        orzechy: `Orzechy i nasiona kupuj luzem i odmierzaj łyżką wagi. „Garść” to często 40–50 g, czyli dwa razy więcej kalorii niż planowałeś.`,
        tluszcze: `Oleje dodawaj po obróbce termicznej sałatek, nie zawsze do smażenia na pełnym ogniu — smak i makro zostają, a mniej tłuszczu wchłania się w jedzenie.`,
        makarony: `Makaron al dente ma nieco mniejszy indeks glikemiczny niż rozgotowany. Sosy serowe i śmietanowe potrafią podwoić kcal porcji względem samego makaronu.`,
        fastfood: `Fast food jedz rzadziej, ale świadomie: wpisz ${p.name} do dnia z góry, a resztę posiłków dostosuj (więcej warzyw, mniej sosów).`,
        slodycze: `Słodycze najlepiej planować z góry — jeśli wiesz, że zjesz ${p.name}, od rana zostaw miejsce w węglowodanach i tłuszczach.`,
        sosy: `Sosy i dressings to najczęstszy „cichy” dodatek kalorii. Odmierz łyżkę stołową zamiast polać „do smaku”.`
    };

    const goalPool =
        profile === 'calorie-dense' || profile === 'treat'
            ? hashSlug(p.slug, 7) % 2 === 0
                ? mass
                : maintain
            : profile === 'lean-protein' || profile === 'very-low-cal'
              ? hashSlug(p.slug, 7) % 2 === 0
                  ? reduction
                  : maintain
              : pick([reduction, mass, maintain], p.slug, 7);

    let text = pick(goalPool, p.slug, 13);
    if (categoryTips[cat]) {
        text += ` ${categoryTips[cat]}`;
    }
  if (p.note && p.note.length > 15) {
        text += ` Uwaga z bazy: ${p.note.replace(/\.$/, '')}.`;
    }
    return text;
}

function buildClosing(p) {
    const price = priceSnippet(p);
    const closings = [
        `Porównaj ${p.name} z inną pozycją z kategorii ${CATEGORY_LABELS[p.category] || p.category} w <a href="../porownaj-produkty.html">porównywarce Proteiner</a> — zobaczysz różnicę w białku, kcal i cenie za 100 g proteinu na jednym wykresie.`,
        `W <a href="../dieta.html#produkty">bazie produktów</a> znajdziesz podobne makro w tej samej kategorii. Czasem zamiana ${p.name} na inną pozycję pozwala zostać w deficycie bez głodu.`,
        `Strona produktu ${p.name} to punkt wyjścia — resztę dnia ułóż z warzyw, węgli i innych źródeł białka, żeby domknąć plan z <a href="../index.html">kalkulatora TDEE</a>.`,
        `Jeśli liczysz koszty, sprawdź ranking na stronie <a href="../cena-bialka.html">Cena białka</a> — ${p.name} może okazać się tańszy lub droższy niż myślisz, zależnie od promocji w sklepie.`,
        `Makro na etykiecie bywa inne niż w domowej porcji (np. po dodaniu tłuszczu do patelni). Tabela na tej stronie odnosi się do typowej porcji: ${servingPhrase(p)}.`,
        `Zerknij na <a href="../produkty/kategoria/${p.category}.html">stronę kategorii ${CATEGORY_LABELS[p.category] || p.category}</a> — tam są podobne produkty i praktyczne wskazówki do planowania posiłków.`
    ];

    let text = pick(closings, p.slug, 19);
    if (price && hashSlug(p.slug, 23) % 2 === 0) {
        text += ` ${price}`;
    }
    return text;
}

/**
 * @param {object} p — produkt z bazy (name, slug, category, makro, porcja…)
 * @returns {{ title: string, paragraphs: string[] }}
 */
export function generateProductEditorial(p) {
    return {
        title: buildTitle(p),
        paragraphs: [buildOpening(p), buildPractical(p), buildClosing(p)]
    };
}

/** Czy wygenerowany opis ma wystarczającą długość do indeksowania. */
export function generatedEditorialIsRich(p) {
    const ed = generateProductEditorial(p);
    const chars = ed.paragraphs.join(' ').length;
    return ed.paragraphs.length >= 3 && chars >= 280;
}
