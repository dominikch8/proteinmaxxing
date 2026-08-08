/**
 * Generuje unikalny opis redakcyjny per produkt (na podstawie makro, kategorii, porcji).
 * Używany gdy brak ręcznego wpisu w product-editorial.json.
 */
import { CATEGORY_LABELS } from './category-seo.mjs';
import {
    contextualMealTip,
    contextualPlateTip,
    contextualPracticalAddon,
} from './editorial-context.mjs';
import { fmt, hashSlug, pick, servingPhrase } from './editorial-utils.mjs';
import {
    cheaperPair,
    jestSa,
    maMaja,
    nieJestDietetyczny,
    polishEditorial,
    verb3,
    wygodnaOpcja,
    zakazany,
    wybierany,
} from './polish-gender.mjs';

function proteinKcalRatio(p) {
    return p.protein > 0 ? p.kcal / p.protein : null;
}

function macroProfile(p) {
    const ratio = proteinKcalRatio(p);
    if (p.category === 'napoje') {
        if (p.kcal <= 5) return 'very-low-cal';
        if (p.carbs >= 5) return 'treat';
        return 'low-cal';
    }
    if (p.category === 'alkohole') {
        if (p.kcal >= 150) return 'calorie-dense';
        if (p.carbs >= 4) return 'treat';
        return 'calorie-dense';
    }
    if (p.category === 'przyprawy') {
        return 'very-low-cal';
    }
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

function microSnippet(p) {
    if (!p.micros || p.micros === '-') return '';
    const parts = p.micros.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0];
    if (parts.length === 2) return `${parts[0]} i ${parts[1]}`;
    return `${parts.slice(0, 2).join(', ')} oraz ${parts[2]}`;
}

function buildMealCombo(p) {
    const plate = contextualPlateTip(p);
    if (plate) return plate;
    return contextualMealTip(p);
}

function buildPractical(p) {
    const profile = macroProfile(p);
    const serving = servingPhrase(p);

    const reduction = [
        `Na redukcji ${p.name} najlepiej ${verb3(p.name, 'sprawdza się', 'sprawdzają się')} w porcji zważonej (${serving}) — wpisz ją do dziennego bilansu.`,
        `Jeśli z kalkulatora wynika deficyt, ${p.name} możesz włączyć do planu, o ile ${verb3(p.name, 'mieści się', 'mieszczą się')} w limicie białka i kalorii.`,
        `Przy odchudzaniu liczy się cały dzień, nie jeden produkt. ${p.name} obok warzyw i źródła białka ${verb3(p.name, 'daje', 'dają')} syty posiłek bez rezygnowania z ulubionych smaków.`,
    ];

    const mass = [
        `Przy budowie masy ${p.name} ${verb3(p.name, 'może', 'mogą')} uzupełniać nadwyżkę kaloryczną — zwłaszcza gdy trudno zjeść kolejny klasyczny posiłek. Porcja ${serving} to punkt startowy; dostosuj ją do wyniku z kalkulatora (+ ok. 300 kcal nad utrzymaniem).`,
        `Na masie ${p.name} ${verb3(p.name, 'bywa', 'bywają')} dodatkiem do obiadu lub przekąską po treningu. Zwróć uwagę na tłuszcz (${fmt(p.fat)} g / 100 g) — przy bardzo wysokiej kaloryczności łatwo przejść z „nadwyżki” w nadmiar tłuszczu w diecie.`,
        `Większa porcja ${p.name} to szybki sposób na dołożenie energii — dopasuj ją do puli węglowodanów z kalkulatora.`,
    ];

    const maintain = [
        `Przy utrzymaniu wagi ${p.name} wpisujesz jak każdy inny składnik — porcja ${serving}, reszta dnia według TDEE bez korekty ±300–400 kcal.`,
        `Nie musisz traktować ${p.name} jako produktu „na specjalną okazję”. Przy stabilnej wadze rotacja kilku ulubionych pozycji ułatwia trzymanie makro bez nudnej diety.`,
        `Utrzymanie to balans: ${p.name} razem z warzywami, zbożami i białkiem z mięsa lub nabiału. Sprawdź w bazie podobne produkty — czasem wymiana poprawia sytość przy tych samych kcal.`,
    ];

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
    const addon = contextualPracticalAddon(p);
    if (addon) text += ` ${addon}`;
    if (p.note && p.note.length > 15) {
        text += ` Uwaga z bazy: ${p.note.replace(/\.$/, '')}.`;
    }
    return text;
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
            `${p.name}: kiedy ${maMaja(p.name)} sens?`,
            `Makro ${p.name}`
        ],
        treat: [
            `${p.name} a dzienny limit kcal`,
            `${p.name} — świadomy wybór`,
            `${p.name}: kiedy ${maMaja(p.name)} sens w diecie?`
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
            `Jeśli szukasz źródła białka bez nadmiaru tłuszczu, ${name} ${verb3(name, 'wpisuje się', 'wpisują się')} w większość planów redukcyjnych. Na 100 g masz ${fmt(p.protein)} g proteinów i ${fmt(p.kcal)} kcal — konkretne liczby, które łatwo przenieść z kalkulatora TDEE na talerz.`,
            `${name} ${verb3(name, 'pojawia się', 'pojawiają się')} w polskich jadłospisach nie bez powodu: ${fmt(p.protein)} g białka na 100 g to wynik, który trudno przebić wieloma produktami spożywczymi bez dokładania zbędnych kalorii.`
        ],
        'protein-dense': [
            `${name} ${verb3(name, 'łączy', 'łączą')} wysoką zawartość białka (${fmt(p.protein)} g / 100 g) z umiarkowaną kalorycznością (${fmt(p.kcal)} kcal). W praktyce oznacza to, że jedna porcja (${servingPhrase(p)}) może pokryć znaczną część dziennego celu proteinowego.`,
            `W kategorii „${cat}” ${name} ${verb3(name, 'wyróżnia się', 'wyróżniają się')} profilem makro — ${fmt(p.protein)} g białka i ${fmt(p.carbs)} g węglowodanów na 100 g. Często ${wybierany(name)} zamiast droższych suplementów, gdy wystarczy normalne jedzenie.`,
            `Na 100 g ${name} ${verb3(name, 'dostarcza', 'dostarczają')} ${fmt(p.protein)} g białka przy ${fmt(p.kcal)} kcal. Dla porównania: to więcej proteinów niż w typowym jogurcie owocowym przy podobnej lub niższej kaloryczności.`
        ],
        'very-low-cal': [
            `${name} ${maMaja(name)} zaledwie ${fmt(p.kcal)} kcal na 100 g — możesz zjeść spory kęs bez obawy, że zje resztę dziennego deficytu. Białka jest ${fmt(p.protein)} g, więc traktuj ten produkt jako uzupełnienie objętości posiłku, nie główne źródło proteinów.`,
            `Przy odchudzaniu ${name} ${verb3(name, 'pomaga', 'pomagają')} „zapełnić” talerz: niska energia (${fmt(p.kcal)} kcal / 100 g) i ${fmt(p.carbs)} g węglowodanów sprawiają, że łatwiej utrzymać sytość, gdy reszta dnia jest liczona w gramach.`,
            `${name} to przykład produktu, przy którym liczy się porcja z wagą, ale sama kaloryczność nie przeraża — ${fmt(p.kcal)} kcal na 100 g to dużo mniej niż większość dań obiadowych.`
        ],
        'low-cal': [
            `${name} (${fmt(p.kcal)} kcal, ${fmt(p.protein)} g białka na 100 g) ${verb3(name, 'pasuje', 'pasują')} do dni, gdy chcesz zostawić miejsce na bardziej kaloryczny obiad lub deser. W kategorii ${cat.toLowerCase()} to rozsądny wybór na redukcji.`,
            `Kaloryczność ${name} na poziomie ${fmt(p.kcal)} kcal / 100 g pozwala włączyć produkt do sałatki, smoothie lub drugiego dania bez psucia bilansu z kalkulatora Proteiner.`,
            `${nieJestDietetyczny(name)} dlatego, że tak pisze producent — po prostu ${maMaja(name)} niewiele energii na 100 g (${fmt(p.kcal)} kcal) przy ${fmt(p.fat)} g tłuszczu.`
        ],
        'high-fat': [
            `${name} ${maMaja(name)} gęsty profil kaloryczny: ${fmt(p.kcal)} kcal i ${fmt(p.fat)} g tłuszczu na 100 g. To nie wada — tłuszcz sytni i potrzebny w zbilansowanej diecie — ale łatwo przesadzić z porcją, jeśli nie ważysz produktu.`,
            `W małej objętości ${name} ${verb3(name, 'kryje', 'kryją')} sporo energii (${fmt(p.kcal)} kcal / 100 g). Białka jest ${fmt(p.protein)} g, więc nie traktuj tego produktu jak głównego źródła proteinów; licz go przede wszystkim w puli tłuszczów.`,
            `${name} często ${verb3(name, 'ląduje', 'lądują')} w diecie jako dodatek — do owsianki, sałatki lub pieczenia. Przy ${fmt(p.fat)} g tłuszczu na 100 g wystarczy zmienić łyżkę więcej, by wybić się z planu kalorycznego.`
        ],
        'carb-heavy': [
            `${name} to przede wszystkim węglowodany: ${fmt(p.carbs)} g na 100 g przy ${fmt(p.protein)} g białka. ${verb3(name, 'Sprawdza się', 'Sprawdzają się')}, gdy z kalkulatora wynika, że masz jeszcze miejsce na węgle — np. po treningu lub w dniu z większą aktywnością.`,
            `Energia z ${name} (${fmt(p.kcal)} kcal / 100 g) pochodzi głównie ze skrobi i cukrów. Na redukcji nie musisz z niego rezygnować — dopasuj porcję do dziennego limitu węglowodanów.`,
            `${name} w kategorii ${cat.toLowerCase()} to klasyczne uzupełnienie glikogenu. Sam w sobie rzadko zaspokoi zapotrzebowanie na białko (${fmt(p.protein)} g / 100 g), ale dobrze łączy się z mięsem, rybą lub nabiałem.`
        ],
        'calorie-dense': [
            `${name} ${maMaja(name)} ${fmt(p.kcal)} kcal na 100 g — to produkt, który szybko domyka dzienny bilans energetyczny. Przy ${fmt(p.protein)} g białka warto świadomie zaplanować porcję, zwłaszcza na deficycie.`,
            `Jedna porcja ${name} (${servingPhrase(p)}) potrafi odpowiadać pełnemu, lekkostrawnemu posiłkowi pod względem kalorii. Zanim dodasz go do dnia, sprawdź w kalkulatorze, ile kcal zostało Ci jeszcze „w budżecie”.`,
            `${name} nie ${jestSa(name)} „${zakazany(name)}” — po prostu ${maMaja(name)} gęsty profil energetyczny (${fmt(p.kcal)} kcal, ${fmt(p.fat)} g tłuszczu na 100 g). Na masie ${name} to ${wygodnaOpcja(name)}; na redukcji ${verb3(name, 'wymaga', 'wymagają')} mniejszej porcji lub rzadszego włączenia.`
        ],
        treat: [
            `${name} (${fmt(p.kcal)} kcal / 100 g) to raczej okazjonalny wybór niż baza tygodnia. Na Proteinerze pokazujemy makro bez moralizowania — licz porcję i wpisz ją do dziennego limitu z kalkulatora.`,
            `Słodycze i fast food mają sens w diecie wtedy, gdy reszta dnia jest poukładana. ${name} ${maMaja(name)} ${fmt(p.carbs)} g węglowodanów i ${fmt(p.fat)} g tłuszczu na 100 g — porównaj z domową alternatywą w <a href="../porownaj-produkty">porównywarce</a>.`,
            `${name} często ${wybierany(name)} „z rozpędu”, a potem trudno domknąć deficyt. Warto z góry wiedzieć, że 100 g to ${fmt(p.kcal)} kcal — czasem tyle co spokojny obiad z warzywami i mięsem.`
        ],
        balanced: [
            `${name} w kategorii ${cat.toLowerCase()} ${maMaja(name)} profil ${fmt(p.protein)} g białka, ${fmt(p.carbs)} g węglowodanów i ${fmt(p.fat)} g tłuszczu na 100 g (${fmt(p.kcal)} kcal). To konkretne liczby do wpisania w plan zamiast ogólnych zaleceń „jedz zdrowo”.`,
            `Nie każdy produkt musi być rekordzistą białka — ${name} ${verb3(name, 'pokazuje', 'pokazują')} umiarkowany, ale praktyczny bilans makro. Porcja (${servingPhrase(p)}) pomaga przełożyć wartości na talerz bez przeliczania w głowie.`,
            `${name} to pozycja, którą wielu użytkowników Proteiner dodaje do rotacji obiadowej. ${fmt(p.kcal)} kcal na 100 g i ${fmt(p.protein)} g proteinów — sprawdź, jak ${verb3(name, 'wpisuje się', 'wpisują się')} w Twój cel z kalkulatora (redukcja, masa lub utrzymanie).`
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

function buildClosing(p) {
    const price = priceSnippet(p);
    const closings = [
        `Porównaj ${p.name} z inną pozycją z kategorii ${CATEGORY_LABELS[p.category] || p.category} w <a href="../porownaj-produkty">porównywarce Proteiner</a> — zobaczysz różnicę w białku, kcal i cenie za 100 g proteinu na jednym wykresie.`,
        `W <a href="../dieta#produkty">bazie produktów</a> znajdziesz podobne makro w tej samej kategorii. Czasem zamiana ${p.name} na inną pozycję pozwala zostać w deficycie bez głodu.`,
        `Strona produktu ${p.name} to punkt wyjścia — resztę dnia ułóż z warzyw, węgli i innych źródeł białka, żeby domknąć plan z <a href="../">kalkulatora TDEE</a>.`,
        `Jeśli liczysz koszty, sprawdź ranking na stronie <a href="../cena-bialka">Cena białka</a> — ${p.name} może okazać się ${cheaperPair(p.name)} niż myślisz, zależnie od promocji w sklepie.`,
        `Makro na etykiecie bywa inne niż w domowej porcji (np. po dodaniu tłuszczu do patelni). Tabela na tej stronie odnosi się do typowej porcji: ${servingPhrase(p)}.`,
        `Zerknij na <a href="../dieta#produkty/kategoria/${p.category}">kategorię ${CATEGORY_LABELS[p.category] || p.category}</a> w bazie produktów — tam szybko przejrzysz podobne pozycje.`
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
    const raw = {
        title: buildTitle(p),
        paragraphs: [buildOpening(p), buildPractical(p), buildMealCombo(p), buildClosing(p)]
    };
    return polishEditorial(raw, p.name);
}

/** Czy wygenerowany opis ma wystarczającą długość do indeksowania. */
export function generatedEditorialIsRich(p) {
    const ed = generateProductEditorial(p);
    const chars = ed.paragraphs.join(' ').length;
    return ed.paragraphs.length >= 3 && chars >= 350;
}
