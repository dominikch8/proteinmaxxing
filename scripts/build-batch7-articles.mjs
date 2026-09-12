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
defs.push({
    slug: 'gestosc-energetyczna-jedzenia',
    emoji: '🥗',
    title: 'Gęstość energetyczna — jeść więcej, ważyć mniej',
    subtitle: 'Jak dobierać jedzenie o niskiej gęstości kalorycznej, by jeść duże porcje i chudnąć.',
    meta: 'Gęstość energetyczna jedzenia: jak jeść duże porcje na małej liczbie kalorii.',
    crumb: 'Gęstość energetyczna',
    category: 'odchudzanie',
    relatedHtml: '<a href="volume-eating-jak-jesc-duzo-i-chudnac">volume eating</a> · <a href="blonnik-ile-i-po-co">błonnik</a> · <a href="artykuly">artykuły</a>',
    lead: 'To samo 300 kcal może ważyć 80 g czekolady albo ponad kilogram warzyw. Wybór jedzenia o niskiej gęstości energetycznej to najprostszy sposób na sytość w deficycie.',
    sections: [
        { h2: 'Co to jest', p: 'Gęstość energetyczna to kcal na gram jedzenia. Woda i błonnik rozrzedzają kalorie — dlatego warzywa, owoce i zupy są „lekkie”, a tłuszcz i cukier gęste.' },
        { h2: 'Dlaczego działa', p: 'Ludzie jedzą zwykle podobną wagę jedzenia dziennie. Jeśli ta waga ma mniej kalorii, jesz tyle samo objętościowo, a chudniesz bez głodu.' },
        { h2: 'Jak to robić', p: 'Zaczynaj posiłek od warzyw, dodawaj zup i sałatek, wybieraj chudsze białka, a tłuszcze i cukier traktuj jako dodatek, nie bazę talerza.' }
    ],
    bullets: [
        '<strong>Warzywa:</strong> połowa talerza.',
        '<strong>Zupy i sałatki:</strong> na start posiłku.',
        '<strong>Chude białko:</strong> syci przy niskiej gęstości.',
    ],
    uwaga: 'Niska gęstość nie znaczy zero kalorii — orzechy i awokado są gęste, ale zdrowe. Chodzi o proporcje, nie o eliminację tłuszczu w ogóle.',
    coDalej: 'Zobacz <a href="volume-eating-jak-jesc-duzo-i-chudnac">volume eating</a> i <a href="blonnik-ile-i-po-co">ile błonnika</a>.'
});
defs.push({
    slug: 'plynne-kalorie-napoje-a-waga',
    emoji: '🥤',
    title: 'Płynne kalorie — napoje a waga',
    subtitle: 'Dlaczego soki, słodkie napoje i kalorie w płynie tak łatwo rozbijają dietę.',
    meta: 'Płynne kalorie: dlaczego napoje słodzone sabotażują odchudzanie i jak je ograniczać.',
    crumb: 'Płynne kalorie',
    category: 'odchudzanie',
    relatedHtml: '<a href="fruktoza-i-owoce-mit">fruktoza</a> · <a href="slodziki-sa-bezpieczne">słodziki</a> · <a href="artykuly">artykuły</a>',
    lead: 'Kalorie w płynie nie sycą tak jak jedzenie — organizm ledwo je rejestruje, a ty pijesz setki kcal „przy okazji”.',
    sections: [
        { h2: 'Brak sytości', p: 'Płyny przechodzą przez żołądek szybko i nie dają uczucia najedzenia. Wypicie 150 kcal soku nie zmniejszy tego, ile zjesz potem.' },
        { h2: 'Gdzie się chowają', p: 'Soki, słodkie napoje, kawa z syropem, smoothie, alkohol, a nawet „zdrowe” shotsy. W pół litra coli to ponad 200 kcal.' },
        { h2: 'Zamiana', p: 'Woda, herbata, napoje zero, kawa bez cukru. Smoothie traktuj jak posiłek, nie napój — i licz go do kalorii.' }
    ],
    bullets: [
        '<strong>Zamień:</strong> słodkie na wodę i napoje zero.',
        '<strong>Smoothie:</strong> to posiłek, policz go.',
        '<strong>Alkohol:</strong> też kalorie, nie ignoruj.',
    ],
    uwaga: 'Białko w płynie (np. shake) syci bardziej niż sok, ale nadal mniej niż stały posiłek. Płyny nie są złe — są łatwe do „przegapienia”.',
    coDalej: 'Zobacz <a href="fruktoza-i-owoce-mit">fruktozę i owoce</a> i <a href="slodziki-sa-bezpieczne">napojowe słodziki</a>.'
});
defs.push({
    slug: 'glod-wieczorny-strategie',
    emoji: '🌙',
    title: 'Wieczorny głód — jak sobie z nim radzić',
    subtitle: 'Dlaczego wieczorem ciągnie na przekąski i jak ułożyć dzień, żeby nie kończyć go w szafce.',
    meta: 'Wieczorny głód: przyczyny i strategie, żeby nie kończyć dnia podjadaniem.',
    crumb: 'Wieczorny głód',
    category: 'odchudzanie',
    relatedHtml: '<a href="jedzenie-w-nocy-czy-mozna">jedzenie w nocy</a> · <a href="dieta-wysokobialkowa-a-redukcja-dowody">sytość białka</a> · <a href="artykuly">artykuły</a>',
    lead: 'Wieczorne podjadanie to zwykle skutek zbyt małego jedzenia w dzień i nudy — a nie braku „silnej woli”.',
    sections: [
        { h2: 'Skąd się bierze', p: 'Za mało białka i błonnika w dzień, pomijanie śniadania, stres lub zwykły nawyk „coś do serialu”. Głód fizyczny i nawyk to dwie różne rzeczy.' },
        { h2: 'Ułóż dzień', p: 'Solidne śniadanie i białko w każdym posiłku stabilizują apetyt. Kolację zostaw sycącą (białko + warzywa), zamiast robić ją skromną.' },
        { h2: 'Na koniec dnia', p: 'Zaplanuj niskokaloryczną „ostatnią przekąskę”: skyr, twaróg, warzywa z dipem. Jeśli masz plan, nie sięgasz po cokolwiek.' }
    ],
    bullets: [
        '<strong>Białko:</strong> w każdym posiłku dnia.',
        '<strong>Kolacja:</strong> sycąca, nie „najmniejsza”.',
        '<strong>Plan:</strong> przygotuj niskokaloryczną przekąskę.',
    ],
    uwaga: 'Jeśli głód wieczorem jest silny i fizyczny, nie walcz z nim — zjedz zaplanowaną, lekką przekąskę. Deficyt budujesz całą dobą, nie jedną kolacją.',
    coDalej: 'Zobacz <a href="jedzenie-w-nocy-czy-mozna">czy można jeść w nocy</a> i <a href="dieta-wysokobialkowa-a-redukcja-dowody">sytość białka</a>.'
});
defs.push({
    slug: 'leptyna-i-glod-po-redukcji',
    emoji: '⚖️',
    title: 'Leptyna i głód po redukcji',
    subtitle: 'Dlaczego po schudnięciu jesteś głodniejszy i jak hormony bronią utraconej wagi.',
    meta: 'Leptyna i głód po redukcji: jak hormony zwiększają apetyt po schudnięciu.',
    crumb: 'Leptyna i głód po redukcji',
    category: 'odchudzanie',
    relatedHtml: '<a href="set-point-czy-organizm-broni-wagi">set point</a> · <a href="efekt-jojo-jak-go-uniknac">jo-jo</a> · <a href="artykuly">artykuły</a>',
    lead: 'Po utracie wagi organizm podnosi głód i obniża sytość — m.in. spada leptyna. To biologiczny odruch, nie porażka charakteru.',
    sections: [
        { h2: 'Co robi leptyna', p: 'Leptyna to hormon sytości wydzielany przez tkankę tłuszczową. Gdy tłuszczu ubywa, leptyny jest mniej, więc mózg częściej dostaje sygnał „jedz”.' },
        { h2: 'Głodniejszy po redukcji', p: 'Badania pokazują, że po schudnięciu apetyt realnie rośnie, a wydatek spada. Organizm „chce” wrócić do poprzedniej masy.' },
        { h2: 'Jak to przetrwać', p: 'Wychodzenie z diety powoli, dyf. odwrotna dieta, dużo białka i błonnika oraz sen łagodzą efekt. Unikaj gwałtownego powrotu do starych nawyków.' }
    ],
    bullets: [
        '<strong>Leptyna:</strong> spada razem z tłuszczem.',
        '<strong>Po redukcji:</strong> apetyt rośnie — to normalne.',
        '<strong>Wyjdź powoli:</strong> stopniowo zwiększaj kalorie.',
    ],
    uwaga: '„Odwrotna dieta” i wolny powrót kalorii to nie czary — po prostu dają organizmowi czas na przestawienie sygnałów głodu.',
    coDalej: 'Zobacz <a href="set-point-czy-organizm-broni-wagi">teorię set point</a> i <a href="efekt-jojo-jak-go-uniknac">jak uniknąć jo-jo</a>.'
});
defs.push({
    slug: 'set-point-czy-organizm-broni-wagi',
    emoji: '🎯',
    title: 'Set point — czy organizm broni wagi?',
    subtitle: 'Teoria „punktu nastawczego” i ile w niej prawdy, a ile wymówki.',
    meta: 'Teoria set point: czy organizm broni ustalonej wagi i co to znaczy dla odchudzania.',
    crumb: 'Set point',
    category: 'odchudzanie',
    relatedHtml: '<a href="leptyna-i-glod-po-redukcji">leptyna</a> · <a href="efekt-jojo-jak-go-uniknac">jo-jo</a> · <a href="artykuly">artykuły</a>',
    lead: 'Według teorii set point organizm „celuje” w pewną wagę i broni jej głodem oraz spadkiem metabolizmu. Część prawdy w tym jest, ale to nie wyrok.',
    sections: [
        { h2: 'Na czym polega', p: 'Organizm ma mechanizmy utrzymujące wagę: gdy chudniesz, rośnie głód, a wydatek spada. Stąd wrażenie, że ciało „walczy”, by wrócić.' },
        { h2: 'Czy to stałe', p: 'Set point bywa „przesuwalny” — powolne, trwałe zmiany nawyków potrafią go przestawić. Gwałtowne diety cud raczej go utrwalają.' },
        { h2: 'Co robić', p: 'Traktuj to jako powód do cierpliwości, nie do rezygnacji. Wolniejsza redukcja i utrzymanie przez miesiące realnie obniżają „broniony” poziom.' }
    ],
    bullets: [
        '<strong>Set point:</strong> elastyczny, nie stały.',
        '<strong>Powoli:</strong> stopniowe zmiany go przesuwają.',
        '<strong>Cierpliwość:</strong> utrzymanie > szybka redukcja.',
    ],
    uwaga: 'Set point to nie „genetyczne fatum”. Wymówka „mam taki set point” rzadziej dotyczy biologii, a częściej nawyków i kalorii.',
    coDalej: 'Zobacz <a href="leptyna-i-glod-po-redukcji">leptynę i głód</a> i <a href="efekt-jojo-jak-go-uniknac">jak uniknąć jo-jo</a>.'
});
defs.push({
    slug: 'efekt-jojo-jak-go-uniknac',
    emoji: '🪀',
    title: 'Efekt jo-jo — jak go uniknąć',
    subtitle: 'Dlaczego diety „na chwilę” kończą się powrotem wagi i jak schudnąć na stałe.',
    meta: 'Efekt jo-jo: dlaczego się pojawia i jak schudnąć, żeby nie wrócić do poprzedniej wagi.',
    crumb: 'Efekt jo-jo',
    category: 'odchudzanie',
    relatedHtml: '<a href="set-point-czy-organizm-broni-wagi">set point</a> · <a href="leptyna-i-glod-po-redukcji">głód po redukcji</a> · <a href="artykuly">artykuły</a>',
    lead: 'Jo-jo to powrót wagi po restrykcyjnej diecie. Wynika z połączenia głodu, spadku wydatku i powrotu do starych nawyków.',
    sections: [
        { h2: 'Dlaczego się pojawia', p: 'Ekstremalny deficyt i brak planu na „po” sprawiają, że po diecie wracasz do dawnych porcji — a organizm jeszcze wolniej spala. Stąd szybki odbity skok.' },
        { h2: 'Czego unikać', p: 'Diet cud, bardzo niskich kalorii, wycinania całych grup. To nie uczą cię jeść na stałe — tylko przetrwać kilka tygodni.' },
        { h2: 'Jak schudnąć na stałe', p: 'Umiarkowany deficyt, dużo białka, trening siłowy i stopniowe wyjście z diety. Waga ma być skutkiem nawyków, nie tymczasowego „wyścigu”.' }
    ],
    bullets: [
        '<strong>Deficyt:</strong> umiarkowany, 300–500 kcal.',
        '<strong>Siłownia:</strong> utrzymuje mięśnie i spalanie.',
        '<strong>Plan „po”:</strong> utrzymanie, nie powrót.',
    ],
    uwaga: 'Szybkie wahania wagi tuż po diecie to często woda i glikogen, nie tłuszcz — nie panikuj przy pierwszym skoku, patrz na trend tygodniowy.',
    coDalej: 'Zobacz <a href="leptyna-i-glod-po-redukcji">głód po redukcji</a> i <a href="set-point-czy-organizm-broni-wagi">set point</a>.'
});
defs.push({
    slug: 'dieta-80-20-elastycznosc',
    emoji: '🍕',
    title: 'Dieta 80/20 — elastyczność bez wpadek',
    subtitle: 'Czy „80% czysto, 20% luzu” działa i jak liczyć te 20% na poważnie.',
    meta: 'Dieta 80/20: jak pogodzić zdrowe jedzenie z luzem i nie rozbić deficytu.',
    crumb: 'Dieta 80/20',
    category: 'odchudzanie',
    relatedHtml: '<a href="schudnac-bez-liczenia-kalorii">bez liczenia</a> · <a href="efekt-jojo-jak-go-uniknac">jo-jo</a> · <a href="artykuly">artykuły</a>',
    lead: 'Zasada 80/20 pozwala jeść elastycznie — 80% kalorii z pożywnego jedzenia, 20% „na luz”. Problem w tym, że 20% łatwo niedoszacować.',
    sections: [
        { h2: 'Na czym polega', p: 'Nie chodzi o 80% objętości, a o kalorie lub dni. W praktyce: trzymasz bazę (białko, warzywa, pełne ziarno), a resztę przeznaczasz na przyjemności.' },
        { h2: 'Dlaczego działa', p: 'Elastyczność zmniejsza ryzyko „wszystko albo nic”, przez które dieta pada po jednej czekoladzie. Duży wybór = łatwiej wytrwać.' },
        { h2: 'Pułapka 20%', p: '20% dziennego budżetu to np. 400 kcal przy 2000 kcal. To mniej niż „duża pizza na wyrywki”. Warto choć z grubsza je pilnować.' }
    ],
    bullets: [
        '<strong>Baza:</strong> 80% pożywnego jedzenia.',
        '<strong>Luz:</strong> 20% kalorii, nie objętości.',
        '<strong>Elastycznie:</strong> bez zasady „wszystko albo nic”.',
    ],
    uwaga: '80/20 to nie licencja na codzienny fast food. Jeśli 20% wymyka się spod kontroli, licz kalorie z „luźnej” puli konkretnie.',
    coDalej: 'Zobacz <a href="schudnac-bez-liczenia-kalorii">jak chudnąć bez liczenia</a> i <a href="efekt-jojo-jak-go-uniknac">jak uniknąć jo-jo</a>.'
});
defs.push({
    slug: 'schudnac-bez-liczenia-kalorii',
    emoji: '🧠',
    title: 'Jak schudnąć bez liczenia kalorii',
    subtitle: 'Proste nawyki, które obniżą kaloryczność diety bez ważenia i aplikacji.',
    meta: 'Schudnąć bez liczenia kalorii: sprawdzone nawyki, talerz i sygnały sytości.',
    crumb: 'Chudnięcie bez liczenia',
    category: 'odchudzanie',
    relatedHtml: '<a href="dieta-80-20-elastycznosc">dieta 80/20</a> · <a href="gestosc-energetyczna-jedzenia">gęstość energetyczna</a> · <a href="artykuly">artykuły</a>',
    lead: 'Nie musisz ważyć jedzenia, by schudnąć — wystarczy zestaw nawyków, który naturalnie obniża liczbę zjadanych kalorii.',
    sections: [
        { h2: 'Metoda talerza', p: 'Połowa talerza warzywa, ćwierć białko, ćwierć węglowodany. Automatycznie kontroluje proporcje bez liczenia.' },
        { h2: 'Gęstość i sytość', p: 'Wybieraj mniej kaloryczne gęstością produkty (warzywa, chude białko) i pilnuj porcji tłustych i słodkich. Sytość przy mniejszej kaloryczności.' },
        { h2: 'Nawyki', p: 'Regularne posiłki, wolne jedzenie, bez napojów kalorycznych i podjadania z opakowania. Większość „diety” to właśnie te proste zasady.' }
    ],
    bullets: [
        '<strong>Talerz:</strong> ½ warzyw, ¼ białka, ¼ węgli.',
        '<strong>Pij:</strong> wodę i napoje bez kalorii.',
        '<strong>Jedz:</strong> bez ekranu, wolno.',
    ],
    uwaga: 'Jeśli waga stoi 3 tygodnie, a ty „na pewno” jesz mało — jednak zmierz kilka dni. Bez liczenia łatwo o błąd, który blokuje efekt.',
    coDalej: 'Zobacz <a href="gestosc-energetyczna-jedzenia">gęstość energetyczną</a> i <a href="dieta-80-20-elastycznosc">dietę 80/20</a>.'
});
defs.push({
    slug: 'odstawienie-cukru-plan',
    emoji: '🍬',
    title: 'Jak odstawić cukier — plan krok po kroku',
    subtitle: 'Dlaczego cukier bywa „uzależniający” i jak z nim wygrać na stałe, bez rzucania wszystkiego.',
    meta: 'Odstawienie cukru: plan krok po kroku, żeby ograniczyć słodycze bez załamania.',
    crumb: 'Odstawienie cukru',
    category: 'odchudzanie',
    relatedHtml: '<a href="slodziki-sa-bezpieczne">słodziki</a> · <a href="fruktoza-i-owoce-mit">owoce</a> · <a href="artykuly">artykuły</a>',
    lead: 'Cukier silnie angażuje układ nagrody, więc organizm się go „domaga”. Najskuteczniej wychodzi się stopniowo, nie zrywem.',
    sections: [
        { h2: 'Dlaczego ciągnie', p: 'Cukier daje szybki zastrzyk glukozy i dopaminy. Po skokach cukru pojawia się spadek i głód — stąd błędne koło. To nie brak silnej woli.' },
        { h2: 'Zacznij od napojów', p: 'Słodzone napoje to najłatwiejszy i największy zysk. Zamiana na wodę i napoje zero potrafi zdjąć setki kcal dziennie.' },
        { h2: 'Stopniowe redukcje', p: 'Ograniczaj porcje, nie rzucaj z dnia na dzień. Zamieniaj na owoce, gorzką czekoladę, jogurt naturalny z owocami. Pilnuj snu — niewyspanie podbija ochotę na cukier.' }
    ],
    bullets: [
        '<strong>Najpierw:</strong> słodzone napoje.',
        '<strong>Zamiany:</strong> owoce, gorzka czekolada.',
        '<strong>Sen:</strong> niewyspanie = ochota na cukier.',
    ],
    uwaga: 'Całkowity „detoks” od węglowodanów jest zbędny — organizm potrzebuje glukozy. Celem jest ograniczenie dodanego cukru, nie owoców i kasz.',
    coDalej: 'Zobacz <a href="slodziki-sa-bezpieczne">czy słodziki pomogą</a> i <a href="fruktoza-i-owoce-mit">owoce a fruktoza</a>.'
});
defs.push({
    slug: 'metabolizm-przyspieszyc-fakty',
    emoji: '🚀',
    title: 'Czy można przyspieszyć metabolizm?',
    subtitle: 'Co realnie podnosi przemianę materii, a co to tylko spalacze-tłuszczu marketing.',
    meta: 'Przyspieszanie metabolizmu: co działa (ruch, mięśnie, białko), a co to marketing.',
    crumb: 'Przyspieszenie metabolizmu',
    category: 'odchudzanie',
    relatedHtml: '<a href="czym-jest-metabolizm-i-rmr">metabolizm</a> · <a href="termogeneza-odzywiania-tef">TEF</a> · <a href="artykuly">artykuły</a>',
    lead: 'Nie ma magicznego „przycisku” na metabolizm, ale są realne dźwignie: więcej ruchu, mięśni i białka. A spalacze tłuszczu zwykle to placebo.',
    sections: [
        { h2: 'Co działa', p: 'Więcej NEAT-u (kroki, stanie), trening siłowy podtrzymujący mięśnie i wysokobiałkowa dieta (TEF). To razem realnie podnosi dzienny wydatek.' },
        { h2: 'Co nie działa', p: 'Większość „spalaczy” (L-karnityna, zielona kawa, tabletki na termogenezę) ma efekt znikomy lub żaden. Kofeina daje skromny, krótki impuls.' },
        { h2: 'Ile to daje', p: 'Suma tych zmian to zwykle kilkaset kcal dziennie — zasięg, który faktycznie przekłada się na wagę. Więcej da się zrobić ruchem niż suplementem.' }
    ],
    bullets: [
        '<strong>Kroki:</strong> 8–10 tys. dziennie.',
        '<strong>Mięśnie:</strong> trening siłowy 2–3×/tydz.',
        '<strong>Białko:</strong> wyższe TEF i sytość.',
    ],
    uwaga: 'Jeśli chcesz „przyspieszyć” metabolizm przez kofeinę — efekt jest niewielki i czasowy. Fundament to deficyt i ruch, nie suplementy.',
    coDalej: 'Zobacz <a href="czym-jest-metabolizm-i-rmr">składowe metabolizmu</a> i <a href="termogeneza-odzywiania-tef">TEF</a>.'
});

const articles = defs.map(buildArticle);
const out = path.join(__dirname, 'hardcore-articles-batch7.json');
writeFileSync(out, JSON.stringify(articles, null, 2) + '\n');
console.log(`Zapisano ${articles.length} artykułów -> ${out}`);
