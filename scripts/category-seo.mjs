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
    sosy: 'Sosy',
};

/** Krótkie frazy pod meta description (bez powtarzania nazwy kategorii) */
const CATEGORY_META_PHRASE = {
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
    sosy: 'sosy i dipy — kalorie na 100 g',
};

const CATEGORY_INTRO = {
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
        'Słodycze i przekąski — kalorie i cukry. Porównaj makra, jeśli wliczasz batony, czekoladę czy ciasta do dziennego bilansu.',
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

