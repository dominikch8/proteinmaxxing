/**
 * Generuje artykuły — batch 6 (odżywianie, 20 szt.).
 * Produkuje scripts/hardcore-articles-batch6.json.
 * node scripts/build-batch6-articles.mjs
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function noteTable(rows) {
    const trs = rows.map(([k, v]) => `                        <tr><th>${k}</th><td>${v}</td></tr>`).join('\n');
    return `                <div class="poradnik-table-wrap">
                    <table class="poradnik-intake-table">
                        <tbody>
${trs}
                        </tbody>
                    </table>
                </div>`;
}

function buildArticle(a) {
    const sections = a.sections.map((s) => `<h2>${s.h2}</h2>\n\n<p>${s.p}</p>`).join('\n\n');
    const bullets = a.bullets.map((b) => `                    <li>${b}</li>`).join('\n');
    const tableHtml = a.table ? noteTable(a.table) : '';
    return {
        slug: a.slug,
        emoji: a.emoji,
        title: a.title,
        subtitle: a.subtitle,
        meta: a.meta,
        crumb: a.crumb || a.title,
        category: a.category,
        relatedHtml: a.relatedHtml || '<a href="artykuly">artykuły</a> · <a href="poradnik-zywienia">poradnik</a>',
        bodyHtml: `<p>${a.lead}</p>\n\n${sections}\n\n${tableHtml}\n\n<h2>Praktyczny plan</h2>\n<div class="poradnik-practical-box">\n<ul>\n${bullets}\n</ul>\n</div>\n\n<h2>Na co uważać</h2>\n<p>${a.uwaga}</p>\n\n<h2>Co dalej</h2>\n<p>${a.coDalej}</p>`
    };
}

const defs = [];

defs.push({
    slug: 'blonnik-ile-i-po-co',
    emoji: '🌾',
    title: 'Błonnik — ile jeść i jak to zrobić',
    subtitle: 'Rozpuszczalny vs nierozpuszczalny, zalecane dawki i źródła, które realnie domkniesz.',
    meta: 'Błonnik pokarmowy: ile gramów dziennie, rozpuszczalny i nierozpuszczalny oraz źródła w diecie.',
    crumb: 'Błonnik — ile i po co',
    category: 'odzywianie',
    relatedHtml: '<a href="gestosc-energetyczna-jedzenia">gęstość energetyczna</a> · <a href="probiotyki-i-prebiotyki">prebiotyki</a> · <a href="artykuly">artykuły</a>',
    lead: 'Większość Polaków je o połowę mniej błonnika niż zalecane 25–35 g dziennie. A to on odpowiada za sytość, trawienie i mikrobiotę.',
    sections: [
        { h2: 'Rozpuszczalny vs nierozpuszczalny', p: 'Rozpuszczalny (owies, jabłka, rośliny strączkowe) tworzy żel, spowalnia glukozę i karmi bakterie. Nierozpuszczalny (pełne ziarno, otręby) reguluje perystaltykę.' },
        { h2: 'Dlaczego ma znaczenie', p: 'Błonnik zwiększa sytość przy mniejszej kaloryczności, stabilizuje cukier i wspiera mikrobiotę. Diety bogate w błonnik wiążą się z niższym ryzykiem chorób serca i cukrzycy.' },
        { h2: 'Jak dojść do celu', p: 'Dorzucaj po jednym źródle do każdego posiłku: pełne pieczywo, warzywa, nasiona chia lub siemię. Zwiększaj stopniowo, bo nagły skok daje wzdęcia.' }
    ],
    bullets: [
        '<strong>Cel:</strong> 25–35 g dziennie.',
        '<strong>Do każdego posiłku:</strong> warzywa lub pełne ziarno.',
        '<strong>Stopniowo:</strong> +5 g tygodniowo, więcej wody.',
    ],
    uwaga: 'Zwiększając błonnik, pij więcej płynów — inaczej może zrobić się odwrotnie i doprowadzić do zaparć.',
    coDalej: 'Zobacz <a href="gestosc-energetyczna-jedzenia">gęstość energetyczną jedzenia</a> i <a href="probiotyki-i-prebiotyki">prebiotyki</a>.'
});
defs.push({
    slug: 'tluszcze-nasycone-a-zdrowie',
    emoji: '🧈',
    title: 'Tłuszcze nasycone a zdrowie — co mówi nauka',
    subtitle: 'Czy masło naprawdę zapycha tętnice i ile tłuszczów nasyconych jest bezpieczne.',
    meta: 'Tłuszcze nasycone a zdrowie: wpływ na LDL, ryzyko sercowe i ile ich jeść.',
    crumb: 'Tłuszcze nasycone',
    category: 'odzywianie',
    relatedHtml: '<a href="oliwa-vs-maslo-vs-olej">oliwa vs masło</a> · <a href="omega-3-dha-epa-ile">omega-3</a> · <a href="artykuly">artykuły</a>',
    lead: 'Tłuszcze nasycone podnoszą „zły” cholesterol LDL, ale efekt zależy od tego, czym je zastąpisz. Liczy się całość diety, nie jeden produkt.',
    sections: [
        { h2: 'Co robią nasycone', p: 'Podnoszą LDL, co przy nadmiarze zwiększa ryzyko chorób sercowo-naczyniowych. WHO radzi, by dawały mniej niż 10% energii w ciągu dnia.' },
        { h2: 'Żródła', p: 'Masło, tłuste mięso, sery, śmietana, olej kokosowy i palmowy. W diecie śródziemnomorskiej są zwykle wypierane przez oliwę, ryby i orzechy.' },
        { h2: 'Czym zastępować', p: 'Kluczowa jest podmiana: tłuszcze nasycone na jedno- i wielonienasycone (oliwa, awokado, orzechy). Sama redukcja bez podmiany daje mniej korzyści.' }
    ],
    bullets: [
        '<strong>Limit:</strong> <10% energii z nasyconych.',
        '<strong>Podmień:</strong> masło → oliwa, bekon → ryba.',
        '<strong>Nie demonizuj:</strong> liczy się wzorzec diety.',
    ],
    uwaga: 'Olej kokosowy, choć „modny”, to głównie tłuszcz nasycony — nie jest zamiennikiem oliwy, jeśli pilnujesz lipidów.',
    coDalej: 'Porównaj <a href="oliwa-vs-maslo-vs-olej">oliwę, masło i olej kokosowy</a> oraz <a href="omega-3-dha-epa-ile">omega-3</a>.'
});
defs.push({
    slug: 'omega-3-dha-epa-ile',
    emoji: '🐟',
    title: 'Omega-3 (EPA i DHA) — ile potrzebujesz',
    subtitle: 'Dlaczego ALA z oleju lnianego nie wystarczy i skąd brać EPA i DHA.',
    meta: 'Omega-3 EPA i DHA: ile dziennie, różnica vs ALA i najlepsze źródła w diecie.',
    crumb: 'Omega-3 — EPA i DHA',
    category: 'odzywianie',
    relatedHtml: '<a href="ryby-i-owoce-morza-jako-zrodlo-bialka">ryby</a> · <a href="tluszcze-nasycone-a-zdrowie">tłuszcze</a> · <a href="artykuly">artykuły</a>',
    lead: 'Kwasy omega-3 to nie jedno ciało — liczą się długołańcuchowe EPA i DHA, a ich roślinny „zamiennik” ALA konwertuje się słabo.',
    sections: [
        { h2: 'EPA i DHA a ALA', p: 'ALA (siemię, orzechy włoskie) organizm przekształca w EPA i DHA w zaledwie kilku procentach. Dlatego samo siemię nie domknie zapotrzebowania.' },
        { h2: 'Ile brać', p: 'Dla zdrowia serca wystarcza ok. 250–500 mg EPA+DHA dziennie. To w praktyce 1–2 porcje tłustej ryby tygodniowo albo suplement.' },
        { h2: 'Źródła', p: 'Łosoś, makrela, śledź, sardynki. Z roślin: algi (olej z alg to wegańskie DHA). Suplementuj zwłaszcza, gdy nie jadasz ryb.' }
    ],
    bullets: [
        '<strong>Cel:</strong> 250–500 mg EPA+DHA/dzień.',
        '<strong>Ryby:</strong> 1–2 porcje tłustych tygodniowo.',
        '<strong>Wegańsko:</strong> olej z alg.',
    ],
    uwaga: 'Wysokie dawki (kilka gramów) to już temat medyczny i bywają przepisywane przy hipertriglicerydemii — nie bierz ich „profilaktycznie” bez powodu.',
    coDalej: 'Zobacz <a href="ryby-i-owoce-morza-jako-zrodlo-bialka">ryby jako źródło</a> i <a href="tluszcze-nasycone-a-zdrowie">tłuszcze a zdrowie</a>.'
});
defs.push({
    slug: 'weglowodany-proste-vs-zlozone',
    emoji: '🍞',
    title: 'Węglowodany proste vs złożone',
    subtitle: 'Czym się różnią, czy proste są „złe” i jak wybierać te, które dają energię.',
    meta: 'Węglowodany proste i złożone: różnice, wpływ na cukier i jak je rozkładać w diecie.',
    crumb: 'Węglowodany proste vs złożone',
    category: 'odzywianie',
    relatedHtml: '<a href="indeks-glikemiczny-czy-ma-znaczenie">indeks glikemiczny</a> · <a href="fruktoza-i-owoce-mit">fruktoza</a> · <a href="artykuly">artykuły</a>',
    lead: 'Węglowodany złożone trawią się wolniej i dają stabilną energię, proste — szybki zastrzyk. Ale kontekst posiłku jest ważniejszy niż sama etykieta.',
    sections: [
        { h2: 'Czym się różnią', p: 'Proste (mono- i disacharydy) to cukry: glukoza, fruktoza, sacharoza. Złożone (skrobia, błonnik) to łańcuchy — trawione wolniej, mniej skoków cukru.' },
        { h2: 'Czy proste są „złe”', p: 'Nie same w sobie. Owoce i nabiał zawierają cukry proste, ale z błonnikiem lub białkiem. Problemem są dosładzane napoje i słodycze bez wartości odżywczych.' },
        { h2: 'Jak wybierać', p: 'Bazuj na pełnym ziarnie, ziemniakach, kaszach i strączkach. Proste węglowodany dawaj wokół treningu, gdy chcesz szybkiej energii.' }
    ],
    bullets: [
        '<strong>Baza:</strong> pełne ziarno, kasze, ziemniaki.',
        '<strong>Proste:</strong> wokół treningu i jako owoce.',
        '<strong>Ogranicz:</strong> słodzone napoje i słodycze.',
    ],
    uwaga: '„Cukry” na etykiecie zawierają i te naturalne (laktoza w mleku, fruktoza w owocach) — patrz na listę składników, nie tylko na liczbę.',
    coDalej: 'Zobacz <a href="indeks-glikemiczny-czy-ma-znaczenie">czy IG ma znaczenie</a> i <a href="fruktoza-i-owoce-mit">mit o fruktozie</a>.'
});
defs.push({
    slug: 'indeks-glikemiczny-czy-ma-znaczenie',
    emoji: '📊',
    title: 'Indeks glikemiczny — czy ma znaczenie?',
    subtitle: 'IG vs ładunek glikemiczny i dlaczego sam indeks bywa mylący.',
    meta: 'Indeks i ładunek glikemiczny: różnice, ograniczenia i kiedy IG faktycznie się przydaje.',
    crumb: 'Indeks glikemiczny',
    category: 'odzywianie',
    relatedHtml: '<a href="weglowodany-proste-vs-zlozone">proste vs złożone</a> · <a href="bialko-a-cukrzyca-insulina">cukrzyca</a> · <a href="artykuly">artykuły</a>',
    lead: 'Indeks glikemiczny mierzy, jak szybko dany pokarm podnosi cukier — ale nie uwzględnia wielkości porcji ani całego posiłku.',
    sections: [
        { h2: 'IG a ładunek', p: 'IG to szybkość, ładunek glikemiczny (ŁG) to szybkość razy ilość węglowodanów. Arbuz ma wysoki IG, ale mało węgli — jego ŁG jest niski.' },
        { h2: 'Ograniczenia IG', p: 'IG mierzy się dla pojedynczych produktów na czczo. Białko, tłuszcz i błonnik w posiłku obniżają realny skok. Sam IG kiepsko przewiduje odpowiedź glukozy.' },
        { h2: 'Kiedy się przydaje', p: 'Głównie przy cukrzycy, do orientacyjnego doboru węglowodanów. Dla zdrowych ważniejsza jest całkowita jakość diety niż gonienie niskiego IG.' }
    ],
    bullets: [
        '<strong>IG:</strong> szybkość wzrostu cukru.',
        '<strong>Ładunek:</strong> porcja też ma znaczenie.',
        '<strong>Kontekst:</strong> pełny posiłek łagodzi skok.',
    ],
    uwaga: 'Niski IG nie znaczy automatycznie „zdrowe” — lody czy czekolada potrafią mieć umiarkowany IG dzięki tłuszczowi, a wcale nie są dietetyczne.',
    coDalej: 'Zobacz <a href="weglowodany-proste-vs-zlozone">proste vs złożone</a> i <a href="bialko-a-cukrzyca-insulina">białko a cukrzycę</a>.'
});
defs.push({
    slug: 'slodziki-sa-bezpieczne',
    emoji: '🧃',
    title: 'Słodziki — bezpieczeństwo i wpływ na apetyt',
    subtitle: 'Aspartam, stewia, sukraloza: co mówią regulacje i czy „zero kalorii” pomaga chudnąć.',
    meta: 'Słodziki: bezpieczeństwo aspartamu i stewii, wpływ na apetyt i czy pomagają schudnąć.',
    crumb: 'Słodziki i bezpieczeństwo',
    category: 'odzywianie',
    relatedHtml: '<a href="produkty-light-czy-warto">produkty light</a> · <a href="cukier-czy-slodziki-co-wybrac">cukier vs słodziki</a> · <a href="artykuly">artykuły</a>',
    lead: 'Dopuszczone słodziki są bezpieczne w zalecanych ilościach. Mniej jasne jest, czy zawsze realnie pomagają jeść mniej kalorii.',
    sections: [
        { h2: 'Bezpieczeństwo', p: 'Aspartam, sukraloza i stewia mają zatwierdzone dopuszczalne dawki (ADI) przez EFSA i FDA. Przeciętne spożycie jest daleko poniżej limitów.' },
        { h2: 'Wpływ na apetyt', p: 'U niektórych słodki smak bez kalorii może podtrzymywać ochotę na słodycze. Efekt netto na wagę bywa jednak neutralny lub lekko korzystny przy substytucji napojów.' },
        { h2: 'W praktyce', p: 'Słodziki najlepiej działają jako zamiennik słodkich napojów na rzecz wody i napojów zero. Nie są „darmowym wejściem” na całodniowe słodkie podjadanie.' }
    ],
    bullets: [
        '<strong>Bezpieczne:</strong> w ramach ADI.',
        '<strong>Zastosowanie:</strong> zamiast słodzonych napojów.',
        '<strong>Umiar:</strong> nie lej litrami zero napojów.',
    ],
    uwaga: 'Osoby z fenyloketonurią muszą unikać aspartamu (fenyloalanina). Reszta może go stosować bez obaw w normalnych ilościach.',
    coDalej: 'Zobacz <a href="produkty-light-czy-warto">czy produkty light się opłacają</a> i <a href="cukier-czy-slodziki-co-wybrac">cukier vs słodziki</a>.'
});
defs.push({
    slug: 'ile-wody-pic-dziennie',
    emoji: '💧',
    title: 'Ile wody pić dziennie — bez magii',
    subtitle: 'Od „3 litrów” do koloru moczu: ile płynów realnie potrzebujesz.',
    meta: 'Ile wody pić dziennie: realne zapotrzebowanie, kolor moczu i kiedy pić więcej.',
    crumb: 'Ile wody pić',
    category: 'odzywianie',
    relatedHtml: '<a href="elektrolity-co-i-kiedy">elektrolity</a> · <a href="kawa-a-zdrowie-ile-bezpiecznie">kawa</a> · <a href="artykuly">artykuły</a>',
    lead: 'Sztywne „2–3 litry dla każdego” to mit. Zapotrzebowanie zależy od masy, klimatu i aktywności — a najlepszym wskaźnikiem jest twój organizm.',
    sections: [
        { h2: 'Ile realnie', p: 'Dla większości dorosłych sprawdza się ok. 2–2,5 l płynów dziennie, więcej przy upale i treningu. Człowiek traci wodę z moczem, potem i oddechem.' },
        { h2: 'Kolor moczu', p: 'Jasnożółty to zwykle dobry znak, ciemny — sygnał odwodnienia. To prostszy wskaźnik niż gonienie za konkretną liczbą butelek.' },
        { h2: 'Co się liczy', p: 'Woda, herbata, kawa, a nawet część wody z jedzenia. Kawa ma działanie lekko moczopędne, ale przy umiarkowaniu nie odwadnia.' }
    ],
    bullets: [
        '<strong>Baza:</strong> ~2–2,5 l płynów dziennie.',
        '<strong>Wskaźnik:</strong> jasnożółty mocz.',
        '<strong>W trening:</strong> pij przed, w trakcie i po.',
    ],
    uwaga: 'Przewlekłe zmuszanie się do ogromnych ilości wody może wypłukać elektrolity (hiponatremia). Pij, gdy czujesz pragnienie, i nie przedobrzaj.',
    coDalej: 'Zobacz <a href="elektrolity-co-i-kiedy">kiedy uzupełniać elektrolity</a> i <a href="kawa-a-zdrowie-ile-bezpiecznie">ile kawy to OK</a>.'
});
defs.push({
    slug: 'elektrolity-co-i-kiedy',
    emoji: '⚡',
    title: 'Elektrolity — co, kiedy i ile',
    subtitle: 'Sód, potas, magnez: kiedy naprawdę je uzupełniać, a kiedy napoje izotoniczne to marketing.',
    meta: 'Elektrolity: sód, potas, magnez — kiedy suplementować i czy izotonik ma sens.',
    crumb: 'Elektrolity',
    category: 'odzywianie',
    relatedHtml: '<a href="ile-wody-pic-dziennie">nawodnienie</a> · <a href="kurcze-miesni-co-pomaga">skurcze</a> · <a href="artykuly">artykuły</a>',
    lead: 'Elektrolity — głównie sód, potas i magnez — regulują nawodnienie i pracę mięśni. Przy przeciętnym treningu zwykle wystarcza normalna dieta.',
    sections: [
        { h2: 'Kiedy trzeba', p: 'Przy długim wysiłku (1,5 h+) lub intensywnym poceniu w upale tracisz sporo sodu. Wtedy izotonik lub szczypta soli do wody ma sens.' },
        { h2: 'Kiedy to marketing', p: 'Przy 40 minutach na siłowni w klimatyzacji napój izotoniczny to głównie cukier i sól, których nie potrzebujesz. Woda wystarczy.' },
        { h2: 'Źródła w diecie', p: 'Potas: banany, ziemniaki, pomidory. Magnez: orzechy, kasza, kakao. Sód: normalna kuchnia. Zbilansowana dieta domyka większość potrzeb.' }
    ],
    bullets: [
        '<strong>Krótki trening:</strong> woda wystarczy.',
        '<strong>Długi/upalny:</strong> dodaj sód lub izotonik.',
        '<strong>Potas, magnez:</strong> warzywa, orzechy, kasze.',
    ],
    uwaga: 'Przy chorobach nerek i serca dodatkowy sód lub potas może być niebezpieczny — tam suplementację ustala lekarz.',
    coDalej: 'Zobacz <a href="kurcze-miesni-co-pomaga">co na skurcze</a> i <a href="ile-wody-pic-dziennie">ile pić</a>.'
});
defs.push({
    slug: 'kawa-a-zdrowie-ile-bezpiecznie',
    emoji: '☕',
    title: 'Kawa a zdrowie — ile jest bezpieczne',
    subtitle: 'Kofeina, korzyści i górna granica, której lepiej nie przekraczać.',
    meta: 'Kawa i kofeina: ile filiżanek jest bezpieczne, korzyści zdrowotne i kto powinien uważać.',
    crumb: 'Kawa a zdrowie',
    category: 'odzywianie',
    relatedHtml: '<a href="kofeina-dawka-i-timing">kofeina przed treningiem</a> · <a href="sen-stres-i-waga">sen</a> · <a href="artykuly">artykuły</a>',
    lead: 'Kawa w umiarkowanych ilościach wiąże się z niższym ryzykiem wielu chorób. Kluczem jest dawka i pora.',
    sections: [
        { h2: 'Ile to bezpieczne', p: 'Dla zdrowych dorosłych ok. 3–4 filiżanki dziennie (do 400 mg kofeiny) są zwykle bezpieczne. Ciężarne powinny zejść niżej (ok. 200 mg).' },
        { h2: 'Korzyści', p: 'Badania obserwacyjne łączą picie kawy z niższym ryzykiem chorób serca, cukrzycy typu 2 i chorób wątroby. Efekt bywa też częściowo z błędu selekcji.' },
        { h2: 'Kto uważa', p: 'Osoby z arytmią, nadciśnieniem, refluksem i problemami ze snem. Kofeina późnym popołudniem potrafi realnie skracać i psuć sen.' }
    ],
    bullets: [
        '<strong>Bezpiecznie:</strong> do 3–4 filiżanek dziennie.',
        '<strong>Sen:</strong> ostatnia kawa 8–10 h przed snem.',
        '<strong>Dodatki:</strong> licz syrop i cukier do kcal.',
    ],
    uwaga: 'Kawa nie działa u wszystkich tak samo — genetyka zmienia metabolizm kofeiny. Jeśli po jednej filiżance masz kołatanie, po prostu pij mniej.',
    coDalej: 'Zobacz <a href="kofeina-dawka-i-timing">kofeinę jako wspomagacz treningu</a> i <a href="sen-stres-i-waga">sen a wagę</a>.'
});
defs.push({
    slug: 'przyprawy-i-sol-w-diecie',
    emoji: '🧂',
    title: 'Sól i przyprawy — ile soli to za dużo',
    subtitle: 'Sód, nadciśnienie i jak smakować jedzenie bez dosalania.',
    meta: 'Sól w diecie: ile to za dużo, ukryty sód w produktach i jak przyprawiać bez soli.',
    crumb: 'Sól i przyprawy',
    category: 'odzywianie',
    relatedHtml: '<a href="elektrolity-co-i-kiedy">elektrolity</a> · <a href="tluszcze-nasycone-a-zdrowie">tłuszcze</a> · <a href="artykuly">artykuły</a>',
    lead: 'Nadmiar sodu podnosi ciśnienie, a większość soli w diecie pochodzi nie z solniczki, lecz z przetworzonych produktów.',
    sections: [
        { h2: 'Ile soli', p: 'WHO zaleca mniej niż 5 g soli dziennie (ok. 2 g sodu). Przeciętny Polak je wyraźnie więcej, głównie z pieczywa, wędlin i gotowców.' },
        { h2: 'Ukryty sód', p: 'Najwięcej sodu kryje się w wędlinach, serach żółtych, sosach, zupach instant i przekąskach. Etykiety bywają mylące — patrz na „sól”.' },
        { h2: 'Jak ograniczać', p: 'Przyprawiaj ziołami, czosnkiem, pieprzem i cytryną. Gotuj w domu i stopniowo zmniejszaj ilość soli — kubki smakowe się adaptują.' }
    ],
    bullets: [
        '<strong>Limit:</strong> <5 g soli/dzień.',
        '<strong>Najgorsze:</strong> wędliny, gotowce, sosy.',
        '<strong>Zamiana:</strong> zioła, czosnek, cytryna.',
    ],
    uwaga: 'Sól jest potrzebna — całkowite jej unikanie to przesada. Po prostu pilnuj, by nie była podstawą smaku każdej potrawy.',
    coDalej: 'Zobacz <a href="elektrolity-co-i-kiedy">rolę sodu w treningu</a> i <a href="tluszcze-nasycone-a-zdrowie">tłuszcze a zdrowie</a>.'
});
//_A6_
//_A7_
//_A8_
//_A9_
//_A10_

const articles = defs.map(buildArticle);
const out = path.join(__dirname, 'hardcore-articles-batch6.json');
writeFileSync(out, JSON.stringify(articles, null, 2) + '\n');
console.log(`Zapisano ${articles.length} artykułów -> ${out}`);
