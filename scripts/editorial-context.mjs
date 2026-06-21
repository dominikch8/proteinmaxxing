/**
 * Kontekstowe wskazówki do opisów produktów — bez szablonów typu „bułka obok”.
 */
import { hashSlug, pick, servingPhrase, fmt } from './editorial-utils.mjs';

const BOILERPLATE_RE =
    /^W praktyce .+ rzadko jadasz solo\.|^Sos, olej do smażenia czy bułka obok|^Przy liczeniu .+ pamiętaj o dodatkach: olej, sos i pieczywo/i;

export function isBoilerplateParagraph(text) {
    return BOILERPLATE_RE.test((text || '').trim());
}

/** Drugie zdanie akapitu praktycznego — dopasowane do kategorii i nazwy. */
export function contextualPracticalAddon(p) {
    const cat = p.category;
    const n = p.name.toLowerCase();

    if (/susz|rodzynki|daktyle|figi|żurawina|bakalie|morele/i.test(n)) {
        return pick(
            [
                'Suszone owoce mają usuniętą wodę — ta sama waga to 3–4× więcej kcal niż świeże; garść z worka łatwo przekracza plan.',
                'Do owsianki, jogurtu lub mixu orzechowego dodawaj porcję na wadze — „kilka sztuk więcej” to często +80–120 kcal.',
            ],
            p.slug,
            41
        );
    }
    if (cat === 'orzechy') {
        return 'Garść z opakowania to często 40–50 g — odmierz łyżką wagi, zanim wrzucisz do sałatki lub musli.';
    }
    if (cat === 'owoce') {
        return 'Owoce dojrzałe są słodsze niż mniej dojrzałe — do jogurtu lub owsianki dodawaj je na wadze, nie „na oko”.';
    }
    if (cat === 'warzywa') {
        if (/marynow|kornisz|kiszon|konserw|w occie/i.test(n)) {
            return 'W zalewie jest sól i często cukier — porcja z słoika to nie to samo co ta sama waga warzywa surowego.';
        }
        if (/śwież|bazylia|szczypiorek|pietruszka|natka|koperek|mięta|szpinak/i.test(n)) {
            return 'Zielenina sama w sobie ma mało kcal — przy sałatkach to olej, orzechy i ser podbijają bilans.';
        }
        return 'Do sałatek i surówek olej i dressing licz osobno — łyżka oliwy to ok. +120 kcal niezależnie od warzyw.';
    }
    if (cat === 'zupy' || cat === 'polskie-obiadki') {
        return pick(
            [
                'Grzanka, śmietana lub dokładany olej potrafią podnieść kcal miski bardziej niż sama zupa z tabeli.',
                'Zupy kremowe ze śmietaną mają więcej kcal niż rosół czy jarzynowa — bulion z mięsem podbija białko, instant zwykle go nie ma.',
            ],
            p.slug,
            42
        );
    }
    if (cat === 'makarony') {
        return 'Sos serowy, śmietana lub dodatkowy olej potrafią podwoić kcal porcji względem samego makaronu z tabeli.';
    }
    if (cat === 'zboza') {
        return pick(
            [
                'Kasze i ryż zyskują wodę podczas gotowania — wartości w bazie dotyczą formy z opisu porcji; suchy produkt ≠ ugotowany.',
                'Płatki na mleku, z orzechami lub miodem szybko podbijają kcal — wpisz cały posiłek, nie sam produkt z tabeli.',
            ],
            p.slug,
            43
        );
    }
    if (cat === 'mieso') {
        if (/w oleju|marynow|wędz|śledź|makrela|konserw/i.test(n)) {
            return 'Olej z puszki lub zalewa marynowa wchodzą w porcję — odcedź i waż sam produkt, jeśli liczysz makro dokładnie.';
        }
        return 'Panierka, tłuszcz na patelni i sos śmietanowy potrafią dodać więcej kcal niż sama porcja mięsa z tabeli.';
    }
    if (cat === 'nabial') {
        return 'Wersje owocowe, wędzone lub „kremowe” mają często dodany cukier — sprawdź etykietę przy strict liczeniu makro.';
    }
    if (cat === 'sosy') {
        return 'Łyżka sosu to często 40–80 kcal — odmierz porcję zamiast polewać „do smaku”.';
    }
    if (cat === 'tluszcze') {
        return 'Przy smażeniu część tłuszczu zostaje w patelni, ale w bilansie bezpieczniej liczyć pełną odmierzoną porcję.';
    }
    if (cat === 'slodycze') {
        return 'Jeśli planujesz deser, od rana zostaw miejsce w węglowodanach i tłuszczach — reszta posiłków może być lżejsza.';
    }
    if (cat === 'fastfood') {
        return 'Frytki, sos i napój do zestawu potrafią dodać więcej kcal niż sam produkt z tabeli — wpisz całość zamówienia.';
    }
    return pick(
        [
            'Dodatki do posiłku — sos, tłuszcz, pieczywo — licz osobno; łatwo dodać +100–200 kcal ponad sam produkt.',
            'Przy „ocznej” porcji łatwo przesadzić — jedna większa porcja to często +150–300 kcal ponad plan.',
        ],
        p.slug,
        44
    );
}

/** Trzeci akapit — jak produkt wpisuje się w posiłek (zamiast „rzadko jadasz solo”). */
export function contextualMealTip(p) {
    const name = p.name;
    const cat = p.category;
    const n = name.toLowerCase();
    const serving = servingPhrase(p);

    if (/susz|rodzynki|daktyle|figi|żurawina|bakalie|morele/i.test(n)) {
        return pick(
            [
                `${name} (${serving}) dobrze łączy się z jogurtem, twarogiem lub owsianką — wpisz cały posiłek, nie samą garść z worka.`,
                `Do musli, kompotu lub deseru bez cukru ${name} dodaje słodycz — porcja z wagą ułatwia trzymanie deficytu.`,
            ],
            p.slug,
            31
        );
    }
    if (cat === 'owoce') {
        return `${name} (${serving}) do owsianki, jogurtu lub koktajlu — owoce licz na wadze; sok nie zastąpi świeżej porcji w bilansie.`;
    }
    if (cat === 'orzechy') {
        return `${name} (${serving}) do sałatki, owsianki lub jako przekąska — połącz z owocami lub jogurtem, ale trzymaj porcję stałą dziennie.`;
    }
    if (cat === 'warzywa') {
        if (/marynow|kornisz|kiszon|konserw/i.test(n)) {
            return `${name} (${serving}) to dodatek do kanapek, sałatek i talerzy obiadowych — sprawdź etykietę pod kątem cukru w zalewie.`;
        }
        if (/śwież|bazylia|szczypiorek|pietruszka|natka|koperek|mięta/i.test(n)) {
            return `${name} podkręca smak bez kalorii — dodawaj na koniec gotowania lub do sałatek, żeby zachować aromat.`;
        }
        return `${name} (${serving}) to baza talerza — dołóż źródło białka (mięso, ryby, jaja, twaróg), żeby posiłek był syty.`;
    }
    if (cat === 'nabial') {
        return pick(
            [
                `${name} (${serving}) sprawdza się solo, z owocami, płatkami lub chlebem — wpisz całość posiłku do dziennika.`,
                `${name} to wygodna baza śniadania lub kolacji — dopasuj porcję do limitu białka i tłuszczu z kalkulatora.`,
            ],
            p.slug,
            32
        );
    }
    if (cat === 'mieso') {
        if (/wędz|w oleju|marynow|śledź|makrela/i.test(n)) {
            return `${name} (${serving}) najczęściej jesz z chlebem, warzywami lub ziemniakami — zalewę i olej licz osobno.`;
        }
        return `${name} (${serving}) do obiadu z ryżem, kaszą, ziemniakami lub warzywami — sama porcja z tabeli to zwykle część talerza.`;
    }
    if (cat === 'zupy' || cat === 'polskie-obiadki') {
        return `${name} (${serving}) to często cały posiłek — grzankę, śmietanę lub dokładany chleb licz osobno.`;
    }
    if (cat === 'makarony') {
        return `${name} (${serving}) z mięsem, rybą lub warzywami daje pełniejszy obiad — sam makaron to głównie węglowodany (${fmt(p.carbs)} g / 100 g).`;
    }
    if (cat === 'zboza') {
        return `${name} (${serving}) z białkiem i warzywami domyka obiad — sama porcja węglowodanów rzadko wystarcza na syty posiłek.`;
    }
    if (cat === 'sosy' || cat === 'tluszcze') {
        return `${name} dodajesz do gotowego dania — odmierz porcję zamiast polewać „do smaku”.`;
    }
    if (cat === 'slodycze' || cat === 'fastfood') {
        return `${name} (${serving}) planuj w bilansie dnia z góry — reszta posiłków może być lżejsza w węglowodany i tłuszcze.`;
    }
    if (p.protein >= 12) {
        return `${name} (${serving}) z ryżem, ziemniakami lub warzywami daje pełny obiad — sama porcja pokrywa dużą część dziennego białka.`;
    }
    if (p.protein >= 6) {
        return `${name} (${serving}) dołóż do źródła białka i warzyw — sama porcja uzupełnia posiłek, ale rzadko wystarcza jako całość.`;
    }
    return `${name} (${serving}) łącz z białkiem i warzywami — wtedy łatwiej domknąć makro dnia bez głodu wieczorem.`;
}

/** Akapit „na talerzu” — tylko gdy ma sens dla produktu. */
export function contextualPlateTip(p) {
    const cat = p.category;
    const n = p.name.toLowerCase();
    const serving = servingPhrase(p);
    const name = p.name;

    if (p.kcal <= 50) return '';
    if (/bazylia|szczypiorek|pietruszka|natka|koperek|mięta|oregano|tymianek|rozmaryn|szpinak/i.test(n)) return '';
    if (cat === 'sosy' || cat === 'tluszcze') return '';
    if (/susz|rodzynki|daktyle|figi|żurawina|mars|snickers|baton|czekolad/i.test(n)) return '';
    if (cat === 'slodycze' || cat === 'fastfood') return '';

    if (cat === 'owoce' || /susz/i.test(n)) {
        return `${name} (${serving}) z jogurtem lub twarogiem to syty posiłek — wpisz całość, nie samą porcję owoców.`;
    }
    if (cat === 'warzywa' || cat === 'mieso' || cat === 'zupy' || cat === 'polskie-obiadki' || cat === 'makarony' || cat === 'zboza') {
        return `Na talerzu liczy się proporcja: ${name} (${serving}) plus warzywa i źródło białka to często 400–600 kcal — wpisz całość do dziennika.`;
    }
    return pick(
        [
            `Przy liczeniu ${name} (${serving}) wpisz też dodatki do posiłku — łatwo zapomnieć o tym, co ląduje obok na talerzu.`,
            `${name} (${serving}) to zwykle element posiłku — resztę dnia ułóż z warzyw, węgli i innych źródeł białka.`,
        ],
        p.slug,
        33
    );
}

export { hashSlug, pick, servingPhrase, fmt };
