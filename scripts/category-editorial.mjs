/** Unikalny tekst redakcyjny per kategoria — gdy produkt nie ma rozbudowanego opisu. */
import { CATEGORY_LABELS } from './category-seo.mjs';

export const CATEGORY_EDITORIAL = {
    mieso: `Mięso, drób i ryby to główne źródła pełnowartościowego białka w diecie. Przy redukcji liczy się deficyt kaloryczny i sytość — chude gatunki (pierś z kurczaka, indyk, dorsz) dają dużo proteinów przy małej liczbie kcal. Przy masie warto uwzględnić także tłuszcz i żelazo z czerwonego mięsa. Porównaj kilka pozycji w <a href="../porownaj-produkty.html">porównywarce</a> zamiast patrzeć tylko na jedną etykietę.`,

    nabial: `Nabiał i jaja dostarczają białka, wapnia i witamin z grupy B. Twaróg chudy i skyr wyróżniają się wysoką zawartością proteinów przy umiarkowanej kaloryczności — często wybierane przy odchudzaniu. Sery tłuste mają więcej nasyconych kwasów tłuszczowych; warto patrzeć na porcję, nie tylko na 100 g.`,

    warzywa: `Warzywa są niskokaloryczne i bogate w błonnik, witaminy oraz potas. Same w sobie rzadko pokrywają zapotrzebowanie na białko, ale zwiększają objętość posiłku i ułatwiają utrzymanie deficytu. Łącz warzywa z źródłem białka (np. jogurt, jajko, mięso) zamiast polegać wyłącznie na sałatce.`,

    owoce: `Owoce dostarczają węglowodanów, błonnika i witamin, ale są bardziej kaloryczne niż większość warzyw. Przy redukcji liczy się całkowita dzienna pula węgli — porcja owoców po treningu lub jako przekąska jest w porządku, jeśli mieści się w Twoim planie z kalkulatora TDEE.`,

    zboza: `Zboża, kasze i ryż to podstawowe źródła energii i węglowodanów. Wersje pełnoziarniste mają więcej błonnika i dłużej sytną. Przy liczeniu makro ważna jest <strong>postać sucha vs gotowana</strong> — na Proteinerze wartości są na 100 g produktu w formie podanej w bazie (sprawdź opis porcji).`,

    'polskie-obiadki': `Tradycyjne dania często łączą białko, tłuszcz i skrobię w jednej porcji. Kaloryczność rośnie od sosów, smażenia i dodatków (śmietana, boczek). Porównując schab, bigos czy placki ziemniaczane, zwróć uwagę na tłuszcze nasycone i całkowite kcal — to ułatwia świadomy wybór bez rezygnacji z ulubionych smaków.`,

    zupy: `Zupy mogą być lekkie (rosół, jarzynowa) lub kaloryczne (kremy ze śmietaną, zupy instant). Białko zależy od dodatku mięsa, soczewicy lub sera. Przy odchudzaniu często lepiej sprawdza się zupa jako starter niż drugie danie wysokotłuszczowe.`,

    orzechy: `Orzechy i nasiona mają dużo kalorii w małej objętości — to gęste źródło tłuszczów nienasyconych i białka roślinnego. Łatwo przekroczyć cel kaloryczny „na garść”. Mierz porcję (np. 20–30 g) i traktuj jako dodatek do jogurtu, owsianki lub sałatki.`,

    tluszcze: `Oleje i masła wpływają głównie na bilans tłuszczów, nie białka. Różnią się proporcją nienasyconych do nasyconych (oliwa vs masło). W diecie redukcyjnej tłuszcz jest potrzebny hormonalnie, ale jego nadmiar szybko podnosi kcal — licz łyżki do dressingu i smażenia.`,

    makarony: `Dania makaronowe łączą węglowodany z białkiem (mięso, ser, ryby). Wersje z pełnego ziarna lub z dodatkiem warzyw mają więcej błonnika. Sosy kremowe i serowe znacząco podnoszą kalorie — porównaj carbonarę z makaronem z kurczakiem w naszej bazie.`,

    fastfood: `Fast food i dania typu „na mieście” często mają więcej tłuszczu, soli i węglowodanów niż domowe odpowiedniki. Nie chodzi o zakaz, tylko o świadomą decyzję: raz na jakiś czas wpisz produkt do dziennego limitu kcal z kalkulatora i porównaj z lżejszą alternatywą w tej samej kategorii.`,

    slodycze: `Słodycze i przekąski są zwykle bogate w cukry i tłuszcz, ubogie w białko. Przy redukcji pomaga planowanie porcji zamiast całkowitej eliminacji. Sprawdź, ile kcal „kosztuje” baton lub ciastko na 100 g — często odpowiada to pełnemu posiłkowi.`,

    sosy: `Sosy i dodatki (ketchup, majonez, sos czosnkowy) łatwo umykają w liczeniu makro, a potrafią dodać setki kcal. Porównuj produkty na 100 g i wybieraj lżejsze wersje (musztarda, jogurtowy dip) tam, gdzie to możliwe.`
};

export function buildCategoryEditorialHtml(category, prefix = '../') {
    const text = CATEGORY_EDITORIAL[category];
    if (!text) return '';
    const label = CATEGORY_LABELS[category] || category;
    const linked = text.replace('../porownaj-produkty.html', `${prefix}porownaj-produkty.html`);
    return `        <section class="product-guide product-guide--category">
            <h2>O produktach z kategorii ${label}</h2>
            <p>${linked}</p>
        </section>`;
}

/** Minimalna długość pola extra, aby strona produktu była indeksowana. */
export const MIN_EXTRA_FOR_INDEX = 45;

export function productHasRichContent(p, editorialBySlug = {}) {
    if (editorialBySlug[p.slug]) return true;
    const extra = (p.extra || '').trim();
    if (extra.length >= MIN_EXTRA_FOR_INDEX) return true;
    if ((p.note || '').trim().length >= 40) return true;
    return false;
}
