/**
 * Generuje artykuły — batch 7 (odchudzanie + metabolizm, 20 szt.).
 * Produkuje scripts/hardcore-articles-batch7.json.
 * node scripts/build-batch7-articles.mjs
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
    slug: 'czym-jest-metabolizm-i-rmr',
    emoji: '🔥',
    title: 'Czym jest metabolizm — i co go spala',
    subtitle: 'BMR, RMR, TEF, NEAT — składowe przemiany materii w prostym rozkładzie.',
    meta: 'Czym jest metabolizm: BMR, RMR, NEAT i TEF — z czego składa się dzienny wydatek energii.',
    crumb: 'Czym jest metabolizm',
    category: 'odchudzanie',
    relatedHtml: '<a href="mięśnie-a-spalanie-w-spoczynku">mięśnie a spalanie</a> · <a href="termogeneza-odzywiania-tef">TEF</a> · <a href="artykuly">artykuły</a>',
    lead: 'Metabolizm to suma energii, którą spalasz — wcale nie jedna magiczna liczba, tylko kilka składowych, na każdą możesz wpłynąć inaczej.',
    sections: [
        { h2: 'BMR / RMR', p: 'To spoczynkowa przemiana materii: energia na podtrzymanie życia w bezruchu. Dla większości to 55–70% dziennego wydatku.' },
        { h2: 'TEF', p: 'Termogeneza odżywiania — energia na trawienie i wchłanianie. Zwykle ok. 5–10% kalorii z jedzenia; białko „kosztuje” najwięcej.' },
        { h2: 'NEAT i aktywność', p: 'NEAT to wszystkie codzienne ruchy poza treningiem: chodzenie, stanie, wiercenie się. Bywa niedoceniany, a potrafi różnić się o setki kcal między ludźmi.' }
    ],
    bullets: [
        '<strong>RMR:</strong> 55–70% wydatku.',
        '<strong>NEAT:</strong> kroki i codzienny ruch.',
        '<strong>Trening:</strong> mniejszy, niż się wydaje.',
    ],
    uwaga: 'Kalkulatory BMR to tylko oszacowanie — realną liczbę najlepiej sprawdzić obserwacją wagi przy znanej diecie przez 2–3 tygodnie.',
    coDalej: 'Zobacz <a href="miesnie-a-spalanie-w-spoczynku">ile spala mięsień</a> i <a href="termogeneza-odzywiania-tef">co to TEF</a>.'
});
defs.push({
    slug: 'metabolizm-zwalnia-z-wiekiem',
    emoji: '📉',
    title: 'Czy metabolizm zwalnia z wiekiem?',
    subtitle: 'Ile naprawdę spowalnia przemiana materii — i co z tym ma masa mięśni.',
    meta: 'Metabolizm a wiek: ile spowalnia z dekady na dekadę i ile z tego to wina mięśni.',
    crumb: 'Metabolizm a wiek',
    category: 'odchudzanie',
    relatedHtml: '<a href="miesnie-a-spalanie-w-spoczynku">mięśnie a spalanie</a> · <a href="czym-jest-metabolizm-i-rmr">metabolizm</a> · <a href="artykuly">artykuły</a>',
    lead: 'Metabolizm faktycznie zwalnia z wiekiem, ale mniej dramatycznie, niż się obawia — dużą część „spadku” da się wyjaśnić utratą mięśni i ruchem.',
    sections: [
        { h2: 'Tempo spadku', p: 'Spoczynkowa przemiana materii spada średnio o ok. 1–2% na dekadę po 20. roku życia. To nie cliff — to powolny, ale realny trend.' },
        { h2: 'Wina mięśni', p: 'Mięśnie spalają więcej niż tłuszcz. Wraz z wiekiem tracimy masę mięśniową (sarkopenia), co ciągnie metabolizm w dół — ale temu można przeciwdziałać.' },
        { h2: 'Co robić', p: 'Trening siłowy i wystarczające białko utrzymują mięśnie, a codzienny ruch (NEAT) pilnuje reszty wydatku. Wiek to mniejsza przeszkoda, niż się sądzi.' }
    ],
    bullets: [
        '<strong>Spadek:</strong> ~1–2% na dekadę.',
        '<strong>Utrzymuj:</strong> mięśnie treningiem siłowym.',
        '<strong>Ruszaj się:</strong> NEAT przez cały dzień.',
    ],
    uwaga: 'Szybki „spadek metabolizmu” przed 30. to zwykle mit — częściej zmienia się styl życia: mniej ruchu i więcej jedzenia.',
    coDalej: 'Zobacz <a href="miesnie-a-spalanie-w-spoczynku">ile spala mięsień</a> i <a href="bialko-a-starzenie-sarkopenia">sarkopenię</a>.'
});
defs.push({
    slug: 'miesnie-a-spalanie-w-spoczynku',
    emoji: '💪',
    title: 'Mięśnie a spalanie w spoczynku',
    subtitle: 'Ile realnie kcal spala kilogram mięśni i dlaczego siłownia to nie „maszynka do spalania”.',
    meta: 'Ile kalorii spala kilogram mięśni: realne liczby i rola treningu siłowego w metabolizmie.',
    crumb: 'Mięśnie a spalanie',
    category: 'odchudzanie',
    relatedHtml: '<a href="czym-jest-metabolizm-i-rmr">metabolizm</a> · <a href="trening-silowy-kobiet-mit">trening siłowy</a> · <a href="artykuly">artykuły</a>',
    lead: 'Każdy kilogram mięśni spala w spoczynku więcej niż kilogram tłuszczu — ale różnica bywa wyolbrzymiana w reklamach.',
    sections: [
        { h2: 'Ile spala mięsień', p: 'Przyjmuje się ok. 10–15 kcal na kg mięśni dziennie w spoczynku. Tłuszcz spala ok. 4–5 kcal. Różnica realna, ale nie kolosalna.' },
        { h2: 'Skąd te „50 kcal”', p: 'Stary mit mówi o 50 kcal na kg mięśni — to zawyżona liczba. Nawet kilka kg mięśni nie naprawi diety full-sugar.' },
        { h2: 'Dlaczego się opłaca', p: 'Trening siłowy pomaga nie tyle „palić” kalorie, co utrzymać mięśnie na redukcji i podnieść sytość lepszą kompozycją ciała. To długofalowa inwestycja.' }
    ],
    bullets: [
        '<strong>Mięsień:</strong> ~10–15 kcal/kg/dzień.',
        '<strong>Tłuszcz:</strong> ~4–5 kcal/kg/dzień.',
        '<strong>Siłownia:</strong> chroni mięśnie na redukcji.',
    ],
    uwaga: 'Nie buduj mięśni tylko po to, by „podnieść metabolizm” — realna różnica jest mniejsza niż jeden batonik. Liczy się całość: trening, białko, ruch.',
    coDalej: 'Zobacz <a href="czym-jest-metabolizm-i-rmr">składowe metabolizmu</a> i <a href="epoc-trening-a-spalanie-po">EPOC</a>.'
});
defs.push({
    slug: 'epoc-trening-a-spalanie-po',
    emoji: '🌡️',
    title: 'EPOC — spalanie po treningu — fakty',
    subtitle: 'Ile kalorii naprawdę „palisz po wysiłku” i czy afterburn to mit.',
    meta: 'EPOC (afterburn): ile kalorii spalasz po treningu i dlaczego ten efekt bywa przeceniany.',
    crumb: 'EPOC — spalanie po treningu',
    category: 'odchudzanie',
    relatedHtml: '<a href="miesnie-a-spalanie-w-spoczynku">mięśnie</a> · <a href="cardio-liss-vs-hiit">HIIT</a> · <a href="artykuly">artykuły</a>',
    lead: 'EPOC to podwyższone spalanie po wysiłku. Istnieje, ale jego skala bywa przesadzona — większość kalorii palisz w trakcie, nie godzinami po.',
    sections: [
        { h2: 'Czym jest EPOC', p: 'Po treningu organizm wraca do stanu spoczynku: usuwa mleczan, uzupełnia tlen. Ten proces chwilowo podnosi metabolizm o kilka–kilkanaście procent.' },
        { h2: 'Ile to kalorii', p: 'Typowo EPOC dodaje do 10–15% kalorii z treningu. Po 500 kcal wysiłku to kilkadziesiąt kcal rozłożone na godziny — nie „noc palenia tłuszczu”.' },
        { h2: 'Co go zwiększa', p: 'Intensywny trening (interwały, siłowy) daje wyższy EPOC niż spokojne cardio. Ale w skali tygodnia liczy się suma ruchu, nie sam afterburn.' }
    ],
    bullets: [
        '<strong>Skala:</strong> ~10–15% kalorii treningu.',
        '<strong>Większy:</strong> po interwałach i siłowym.',
        '<strong>Realnie:</strong> liczy się cały tydzień.',
    ],
    uwaga: 'Nie planuj diety „pod EPOC” — to drobiazg. Fundament to deficyt kaloryczny i codzienna aktywność, a afterburn to bonus.',
    coDalej: 'Zobacz <a href="cardio-liss-vs-hiit">LISS vs HIIT</a> i <a href="miesnie-a-spalanie-w-spoczynku">mięśnie a spalanie</a>.'
});
defs.push({
    slug: 'termogeneza-odzywiania-tef',
    emoji: '🍽️',
    title: 'Termogeneza odżywiania (TEF)',
    subtitle: 'Ile energii kosztuje cię trawienie i dlaczego białko „spala” najwięcej.',
    meta: 'Termogeneza odżywiania (TEF): ile kcal idzie na trawienie i dlaczego białko ją podnosi.',
    crumb: 'Termogeneza odżywiania',
    category: 'odchudzanie',
    relatedHtml: '<a href="czym-jest-metabolizm-i-rmr">metabolizm</a> · <a href="dieta-wysokobialkowa-a-redukcja-dowody">białko na redukcji</a> · <a href="artykuly">artykuły</a>',
    lead: 'Trawienie też kosztuje energię — to termogeneza odżywiania (TEF). Białko kosztuje najwięcej, stąd jego przewaga w dietach.',
    sections: [
        { h2: 'Ile to kosztuje', p: 'TEF to ok. 5–10% energii z posiłku. Białko „spala” 20–30% swoich kalorii na przetworzenie, węglowodany 5–10%, tłuszcze 0–3%.' },
        { h2: 'Dlaczego białko', p: 'Rozkład na aminokwasy i ich wbudowywanie to proces energochłonny. Dlatego dieta wysokobiałkowa delikatnie podnosi dzienny wydatek.' },
        { h2: 'Czy to odchudza', p: 'Samo TEF nie schudnie za ciebie — to kilkadziesiąt kcal dziennie. Ale w połączeniu z sytością białka daje realną przewagę na redukcji.' }
    ],
    bullets: [
        '<strong>Białko:</strong> 20–30% TEF.',
        '<strong>Węgle:</strong> 5–10% TEF.',
        '<strong>Tłuszcz:</strong> 0–3% TEF.',
    ],
    uwaga: 'Różnice w TEF są miłe, ale nie zbalansują nadwyżki. To argument za białkiem w diecie, nie licencja na objadanie się „bo białko”.',
    coDalej: 'Zobacz <a href="dieta-wysokobialkowa-a-redukcja-dowody">dietę wysokobiałkową</a> i <a href="czym-jest-metabolizm-i-rmr">składowe metabolizmu</a>.'
});
defs.push({
    slug: 'brunatny-tluszcz-co-to',
    emoji: '🟤',
    title: 'Brązowy tłuszcz — czym jest i czy go aktywujesz',
    subtitle: 'Tkanka brunatna spala kalorie na ciepło — ile można z niej „wycisnąć”.',
    meta: 'Brązowy tłuszcz (BAT): czym jest, jak spala kalorie i czy da się go aktywować na chłodzie.',
    crumb: 'Brązowy tłuszcz',
    category: 'odchudzanie',
    relatedHtml: '<a href="czym-jest-metabolizm-i-rmr">metabolizm</a> · <a href="metabolizm-przyspieszyc-fakty">przyspiesz metabolizm</a> · <a href="artykuly">artykuły</a>',
    lead: 'W przeciwieństwie do białego tłuszczu, tkanka brunatna (BAT) spala kalorie na produkcję ciepła. To fascynujący, ale przeceniany mechanizm odchudzania.',
    sections: [
        { h2: 'Czym jest BAT', p: 'Brunatna tkanka tłuszczowa, bogata w mitochondria, wytwarza ciepło zamiast magazynować energię. U dorosłych jest jej mało, głównie wokół szyi i łopatek.' },
        { h2: 'Co ją aktywuje', p: 'Zimno oraz częściowo niektóre bodźce (kapsaicyna). Zimowe prysznice i morsowanie aktywują BAT, ale efekt kaloryczny jest skromny.' },
        { h2: 'Ile to daje', p: 'Nawet aktywowana BAT spala niewielką część dziennego wydatku. To ciekawostka naukowa, nie realna strategia na schudnięcie.' }
    ],
    bullets: [
        '<strong>BAT:</strong> spala kalorie na ciepło.',
        '<strong>Aktywacja:</strong> zimno, kapsaicyna.',
        '<strong>Efekt:</strong> skromny, nie odchudzi.',
    ],
    uwaga: 'Nie rób sobie lodowatych pryszniców „na spalanie” — efekt jest marginalny, a ryzyko przeziębienia realne. Zimna woda to temat regeneracji, nie odchudzania.',
    coDalej: 'Zobacz <a href="metabolizm-przyspieszyc-fakty">czy da się przyspieszyć metabolizm</a> i <a href="czym-jest-metabolizm-i-rmr">jego składowe</a>.'
});
defs.push({
    slug: 'tarczyca-a-waga-co-warto-wiedziec',
    emoji: '🦋',
    title: 'Tarczyca a waga — co warto wiedzieć',
    subtitle: 'Niedoczynność, hormon TSH i ile realnie tarczyca wpływa na wagę.',
    meta: 'Tarczyca a waga: niedoczynność, TSH, metabolizm i kiedy szukać przyczyny w hormonach.',
    crumb: 'Tarczyca a waga',
    category: 'odchudzanie',
    relatedHtml: '<a href="czym-jest-metabolizm-i-rmr">metabolizm</a> · <a href="kortyzol-a-metabolizm">kortyzol</a> · <a href="artykuly">artykuły</a>',
    lead: 'Tarczyca reguluje metabolizm, ale jej rola w przybieraniu na wadze bywa przeceniana — niedoczynność tłumaczy zwykle kilka kilogramów, nie kilkadziesiąt.',
    sections: [
        { h2: 'Co robi tarczyca', p: 'Hormony tarczycy (T3, T4) sterują tempem przemiany materii. Przy niedoczynności spada BMR, pojawia się senność, zimno i wolniejszy metabolizm.' },
        { h2: 'Ile waży', p: 'Niedoczynność odpowiada zwykle za 2–5 kg, głównie przez retencję wody. Masywny przyrost trudno zrzucić wyłącznie na tarczycę.' },
        { h2: 'Kiedy badać', p: 'Przy – mimo pilnowanej diety – braku efektów, chronicznym zmęczeniu i zmarznięciu warto zbadać TSH i hormony. Diagnoza to domena endokrynologa.' }
    ],
    bullets: [
        '<strong>Objawy:</strong> zmęczenie, zimno, brak efektów.',
        '<strong>Zbadaj:</strong> TSH, fT3, fT4.',
        '<strong>Realnie:</strong> kilka kg, nie kilkadziesiąt.',
    ],
    uwaga: 'Nie suplementuj „wsparcia tarczycy” na własną rękę. Najpierw badania i lekarz — samodzielne kombinacje z hormonami bywają groźne.',
    coDalej: 'Zobacz <a href="kortyzol-a-metabolizm">kortyzol a metabolizm</a> i <a href="czym-jest-metabolizm-i-rmr">składowe metabolizmu</a>.'
});
defs.push({
    slug: 'kortyzol-a-metabolizm',
    emoji: '😰',
    title: 'Kortyzol a metabolizm',
    subtitle: 'Czy stres i kortyzol naprawdę „blokują spalanie” i powodują tycie na brzuchu.',
    meta: 'Kortyzol a metabolizm: wpływ stresu na wagę, apetyt i tłuszcz trzewny.',
    crumb: 'Kortyzol a metabolizm',
    category: 'odchudzanie',
    relatedHtml: '<a href="tarczyca-a-waga-co-warto-wiedziec">tarczyca</a> · <a href="sen-stres-i-waga">sen i stres</a> · <a href="artykuly">artykuły</a>',
    lead: 'Kortyzol to hormon stresu — przewlekle podniesiony może sprzyjać odkładaniu tłuszczu brzusznego i podbijać apetyt na słodycze.',
    sections: [
        { h2: 'Co robi kortyzol', p: 'W krótkim stresie to normalne. Przy chronicznym stresie wysoki kortyzol sprzyja insulinooporności i gromadzeniu tłuszczu trzewnego.' },
        { h2: 'Apetyt i jedzenie', p: 'Stres podnosi ochotę na wysokoenergetyczne jedzenie — częściowo przez kortyzol, częściowo przez zwykły mechanizm „zajadania emocji”.' },
        { h2: 'Jak sobie radzić', p: 'Sen, ruch i regularne posiłki stabilizują kortyzol. Redukcja nie musi być „odchudzaniem w stresie” — najpierw higiena, potem agresywny deficyt.' }
    ],
    bullets: [
        '<strong>Chroniczny stres:</strong> sprzyja tłuszczowi wisceralnemu.',
        '<strong>Sen 7–9 h:</strong> obniża kortyzol.',
        '<strong>Nie głódź się:</strong> głodówki podbijają stres.',
    ],
    uwaga: '„Kortyzol blokuje spalanie tłuszczu” to nadużycie. Przy deficycie chudniesz i w stresie — tyle że trudniej o trwałość i kontrolę apetytu.',
    coDalej: 'Zobacz <a href="sen-stres-i-waga">sen, stres a waga</a> i <a href="glod-wieczorny-strategie">wieczorny głód</a>.'
});
defs.push({
    slug: 'insulina-a-magazynowanie-tluszczu',
    emoji: '📦',
    title: 'Insulina i magazynowanie tłuszczu',
    subtitle: 'Czy insulina „tuczy”, i dlaczego model węglowodanowo-insulinowy jest uproszczeniem.',
    meta: 'Insulina a tycie: jak hormony sterują magazynowaniem tłuszczu i dlaczego nie wystarczy „obniżyć insuliny”.',
    crumb: 'Insulina a tłuszcz',
    category: 'odchudzanie',
    relatedHtml: '<a href="bialko-a-cukrzyca-insulina">białko a insulina</a> · <a href="indeks-glikemiczny-czy-ma-znaczenie">IG</a> · <a href="artykuly">artykuły</a>',
    lead: 'Insulina kieruje magazynowaniem składników — ale twierdzenie, że „bez niskiej insuliny nie spalisz tłuszczu”, to nadmierne uproszczenie.',
    sections: [
        { h2: 'Rola insuliny', p: 'Po posiłku insulina transportuje glukozę do komórek i chwilowo hamuje uwalnianie tłuszczu. To normalna fizjologia, nie „wpadka”.' },
        { h2: 'Model węglowodanowo-insulinowy', p: 'Popularna teoria mówi, że węgle → insulina → magazynowanie. Problem: chudnie się też na diecie wysokowęglowodanowej, jeśli jest deficyt kalorii.' },
        { h2: 'Co naprawdę liczy', p: 'O tyciu decyduje bilans energetyczny. Insulina wpływa na to, gdzie i jak szybko odkładasz energię, ale nie unieważnia prawa bilansu.' }
    ],
    bullets: [
        '<strong>Insulina:</strong> normalny hormon, nie wróg.',
        '<strong>Bilans:</strong> decyduje o tyciu/chudnięciu.',
        '<strong>Wrażliwość:</strong> popraw ją ruchem i masą mięśni.',
    ],
    uwaga: 'Niskowęglowodanowe diety bywają skuteczne przez sytość i łatwiejszy deficyt, nie przez „magicznie niską insulinę”. Różne drogi, jeden cel: bilans.',
    coDalej: 'Zobacz <a href="bialko-a-cukrzyca-insulina">białko a insulina</a> i <a href="indeks-glikemiczny-czy-ma-znaczenie">indeks glikemiczny</a>.'
});
defs.push({
    slug: 'dieta-wysokobialkowa-a-redukcja-dowody',
    emoji: '🥇',
    title: 'Dieta wysokobiałkowa a redukcja — dowody',
    subtitle: 'Dlaczego podbijenie białka pomaga chudnąć i chronić mięśnie — co mówią metaanalizy.',
    meta: 'Dieta wysokobiałkowa na redukcji: dowody na sytość i ochronę mięśni.',
    crumb: 'Dieta wysokobiałkowa a redukcja',
    category: 'odchudzanie',
    relatedHtml: '<a href="ile-bialka-na-dzien">ile białka</a> · <a href="termogeneza-odzywiania-tef">TEF</a> · <a href="artykuly">artykuły</a>',
    lead: 'Metaanaliza <a href="https://doi.org/10.1136/bjsports-2017-097608" target="_blank" rel="noopener">Mortona i wsp.</a> pokazuje, że suplementacja białka przy treningu oporowym realnie zwiększa masę i siłę mięśni — a na redukcji białko pomaga trzymać mięśnie.',
    sections: [
        { h2: 'Sytość', p: 'Białko jest najbardziej sycącym makroskładnikiem. Wyższy udział białka realnie zmniejsza spontaniczne podjadanie przy tym samym uczuciu najedzenia.' },
        { h2: 'Ochrona mięśni', p: 'Na deficycie organizm chętnie sięga po mięśnie. 1,8–2,2 g/kg pomaga zachować masę mięśniową przy utracie tłuszczu.' },
        { h2: 'Praktyka', p: 'Zamień część tłuszczu i węgli na białko, zachowując deficyt. Najprościej: do każdego posiłku porcja chudego białka.' }
    ],
    bullets: [
        '<strong>Białko:</strong> 1,8–2,2 g/kg na redukcji.',
        '<strong>Sytość:</strong> mniej podjadania.',
        '<strong>Trening:</strong> siłowy + wysokie białko = mięśnie.',
    ],
    uwaga: 'Samo białko nie „spala tłuszczu” bez deficytu. To wzmocnienie, nie zastępstwo ujemnego bilansu kalorii.',
    coDalej: 'Policz <a href="ile-bialka-na-dzien">ile białka jeść</a> i zobacz <a href="termogeneza-odzywiania-tef">dlaczego białko spala więcej</a>.'
});
//_A6_
//_A7_
//_A8_
//_A9_
//_A10_

const articles = defs.map(buildArticle);
const out = path.join(__dirname, 'hardcore-articles-batch7.json');
writeFileSync(out, JSON.stringify(articles, null, 2) + '\n');
console.log(`Zapisano ${articles.length} artykułów -> ${out}`);
