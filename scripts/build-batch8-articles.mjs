/**
 * Generuje artykuły — batch 8 (ćwiczenia i siłownia, 20 szt.).
 * Produkuje scripts/hardcore-articles-batch8.json.
 * node scripts/build-batch8-articles.mjs
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
    slug: 'jak-zaczac-silownie-od-zera',
    emoji: '🏋️',
    title: 'Jak zacząć siłownię od zera',
    subtitle: 'Pierwsze dni na siłowni bez chaosu: plan, sprzęt i czego się nie bać.',
    meta: 'Jak zacząć siłownię od zera: pierwszy miesiąc, plan i czego unikać.',
    crumb: 'Jak zacząć siłownię',
    category: 'cwiczenia',
    relatedHtml: '<a href="pierwszy-trening-silowy-plan">pierwszy trening</a> · <a href="rozgrzewka-czym-i-jak">rozgrzewka</a> · <a href="artykuly">artykuły</a>',
    lead: 'Początek siłowni to głównie pokonanie wejścia do drzwi. Technika, plan i regularność zrobią resztę — nie potrzebujesz „idealnego startu”.',
    sections: [
        { h2: 'Zacznij od maszyn', p: 'Maszyny prowadzą ruch i są bezpieczniejsze dla nowicjusza. Poznaj wzorzec ćwiczenia, zanim przejdziesz na wolne ciężary.' },
        { h2: 'Ustal plan', p: '2–3 treningi w tygodniu, całe ciało za każdym razem (full body). Prostota wygrywa z wymyślnym splitem na start.' },
        { h2: 'Progresja', p: 'Co tydzień lub dwa dodawaj trochę ciężaru lub powtórzeń. Postęp motywuje bardziej niż wszystko inne.' }
    ],
    bullets: [
        '<strong>Plan:</strong> full body 2–3×/tydzień.',
        '<strong>Start:</strong> maszyny, potem wolne ciężary.',
        '<strong>Progresja:</strong> ciężar lub powtórzenia w górę.',
    ],
    uwaga: 'Nie porównuj się z innymi na sali — każdy kiedyś zaczynał. Skup się na swojej technice i stałości, nie na cudzym ciężarze.',
    coDalej: 'Zobacz <a href="pierwszy-trening-silowy-plan">prosty plan na start</a> i <a href="rozgrzewka-czym-i-jak">rozgrzewkę</a>.'
});
defs.push({
    slug: 'pierwszy-trening-silowy-plan',
    emoji: '📋',
    title: 'Pierwszy trening siłowy — prosty plan',
    subtitle: 'Konkretny zestaw ćwiczeń na całe ciało, który zrobisz w 45 minut.',
    meta: 'Pierwszy trening siłowy: gotowy plan full body na 45 minut dla początkujących.',
    crumb: 'Pierwszy trening siłowy',
    category: 'cwiczenia',
    relatedHtml: '<a href="jak-zaczac-silownie-od-zera">od zera</a> · <a href="cwiczenia-zlozone-vs-izolowane">złożone vs izolowane</a> · <a href="artykuly">artykuły</a>',
    lead: 'Dobry plan na start to 5–6 ćwiczeń złożonych na całe ciało, 2–3 serie po 8–12 powtórzeń z minutą przerwy.',
    sections: [
        { h2: 'Zestaw na start', p: 'Prasa na nogi, wiosłowanie, wyciskanie na maszynie, przysiad goblet, martwy ciąg rumuński z hantlami. Każde po 3 serie po 10 powtórzeń.' },
        { h2: 'Ile i jak często', p: 'Taki trening rób 2–3× w tygodniu z dniem przerwy między. Objętość wystarczy, żeby ruszyć mięśnie i nauczyć się ruchów.' },
        { h2: 'Zasady', p: 'Zostaw 1–2 powtórzenia „w zapasie” na start. Ucz się techniki, nie goń ciężaru. Rozgrzewka 5–10 minut przed.' }
    ],
    bullets: [
        '<strong>Ćwiczeń:</strong> 5–6 na całe ciało.',
        '<strong>Serie:</strong> 2–3 × 8–12 powtórzeń.',
        '<strong>Przerwa:</strong> ~1 minuta między seriami.',
    ],
    uwaga: 'Nie zaczynaj od maksymalnych ciężarów i martwego ciągu ze sztangą, jeśli nie znasz techniki. Maszyny i hantle najpierw.',
    coDalej: 'Zobacz <a href="cwiczenia-zlozone-vs-izolowane">złożone vs izolowane</a> i <a href="podwojna-progresja-system">jak dodawać ciężar</a>.'
});
defs.push({
    slug: 'cwiczenia-zlozone-vs-izolowane',
    emoji: '🔗',
    title: 'Ćwiczenia złożone vs izolowane',
    subtitle: 'Martwy ciąg czy wznosy hantli — co buduje więcej mięśni i kiedy co wybrać.',
    meta: 'Ćwiczenia złożone a izolowane: różnice, efektywność i jak je łączyć w treningu.',
    crumb: 'Złożone vs izolowane',
    category: 'cwiczenia',
    relatedHtml: '<a href="pierwszy-trening-silowy-plan">plan</a> · <a href="przysiad-technika-bezpiecznie">przysiad</a> · <a href="artykuly">artykuły</a>',
    lead: 'Ćwiczenia złożone angażują kilka stawów naraz (przysiad, martwy ciąg), izolowane — jeden (uginanie, wznosy). Oba mają miejsce w planie.',
    sections: [
        { h2: 'Złożone', p: 'Dają najwięcej „za czas”: stymulują wiele grup, budują siłę i spalają więcej. To fundament każdego sensownego planu.' },
        { h2: 'Izolowane', p: 'Celują w jedną grupę, dobierając objętość bez obciążania reszty. Świetne na „dobudowanie” słabszych partii po bazie.' },
        { h2: 'Jak łączyć', p: 'Zaczynaj od złożonych, kończ izolowanymi. Proporcja zależy od celu — ale baza zawsze złożona, izolowane to dodatek.' }
    ],
    bullets: [
        '<strong>Baza:</strong> złożone na początku treningu.',
        '<strong>Izolowane:</strong> jako uzupełnienie, nie baza.',
        '<strong>Czas:</strong> złożone = najwięcej efektu.',
    ],
    uwaga: 'Trening złożony wymaga lepszej techniki. Jeśli dopiero zaczynasz, ucz się ruchu z małym ciężarem, zanim dołożysz kilogramy.',
    coDalej: 'Zobacz <a href="przysiad-technika-bezpiecznie">technikę przysiadu</a> i <a href="martwy-ciag-technika">martwego ciągu</a>.'
});
defs.push({
    slug: 'przysiad-technika-bezpiecznie',
    emoji: '🦵',
    title: 'Przysiad — technika i bezpieczeństwo',
    subtitle: 'Głębokość, kolana, plecy — jak kucać bezpiecznie i efektywnie.',
    meta: 'Przysiad: poprawna technika, głębokość i bezpieczeństwo kolan i pleców.',
    crumb: 'Przysiad',
    category: 'cwiczenia',
    relatedHtml: '<a href="martwy-ciag-technika">martwy ciąg</a> · <a href="cwiczenia-zlozone-vs-izolowane">złożone</a> · <a href="artykuly">artykuły</a>',
    lead: 'Przysiad to król ćwiczeń na nogi — ale zła technika obciąża kolana i dolną część pleców. Głębokość dopasuj do swojej mobilności.',
    sections: [
        { h2: 'Technika', p: 'Stopy na szerokość barków, plecy neutralne, kolana w linii stóp. Schodź, wypychając biodra w tył, i wstań, napierając całą stopą.' },
        { h2: 'Głębokość', p: 'Nie każdy musi kucać „do ziemi”. Idź tak nisko, jak pozwala mobilność bez załamania pleców i pięt odrywających się od ziemi.' },
        { h2: 'Bezpieczeństwo', p: 'Zacznij od goblet squata z hantlą, zanim weźmiesz sztangę. Pilnuj stabilnego rdzenia i nie rób przysiadu „na ślepo” z dużym ciężarem.' }
    ],
    bullets: [
        '<strong>Stopy:</strong> barki, kolana w linii stóp.',
        '<strong>Plecy:</strong> neutralne przez cały ruch.',
        '<strong>Start:</strong> goblet squat, potem sztanga.',
    ],
    uwaga: 'Przysiad nie „niszczy kolan” sam z siebie — robi to przeciążenie i zła technika. Ból w kolanach to sygnał, by sprawdzić formę.',
    coDalej: 'Zobacz <a href="przysiad-a-bol-kolan">przysiad a ból kolan</a> i <a href="martwy-ciag-technika">martwy ciąg</a>.'
});
defs.push({
    slug: 'martwy-ciag-technika',
    emoji: '🏋️',
    title: 'Martwy ciąg — technika bez urazu',
    subtitle: 'Hinge w biodrze, neutralny kręgosłup i najczęstsze błędy, które bolą w krzyżu.',
    meta: 'Martwy ciąg: poprawna technika, ustawienie pleców i jak uniknąć bólu krzyża.',
    crumb: 'Martwy ciąg',
    category: 'cwiczenia',
    relatedHtml: '<a href="przysiad-technika-bezpiecznie">przysiad</a> · <a href="bol-plecow-trening-silowy">ból pleców</a> · <a href="artykuly">artykuły</a>',
    lead: 'Martwy ciąg to najlepsze ćwiczenie „tył ciała” — ale błędy w ustawieniu pleców potrafią dać mocno w krzyż.',
    sections: [
        { h2: 'Ruch to hinge', p: 'Martwy ciąg to zgięcie w biodrze, nie „podnoszenie plecami”. Wypychaj biodra w tył, trzymając tułów sztywny i plecy neutralne.' },
        { h2: 'Sztanga blisko', p: 'Gryf powinien jechać tuż przy piszczelach i udach. Im dalej od ciała, tym większy moment na dolną część pleców i większe ryzyko.' },
        { h2: 'Najczęstsze błędy', p: 'Zaokrąglony kręgosłup, szarpanie zamiast płynnego odpychania nogami, odbijanie od podłogi. Wszystko to obciąża krzyż.' }
    ],
    bullets: [
        '<strong>Hinge:</strong> biodra w tył, nie plecy.',
        '<strong>Gryf:</strong> tuż przy nogach.',
        '<strong>Rdzeń:</strong> napięty przez cały ruch.',
    ],
    uwaga: 'Zacznij od wersji rumuńskiej z hantlami, zanim sięgniesz po sztangę. Ból w krzyżu to powód, by zwolnić technikę, nie dokładać ciężar.',
    coDalej: 'Zobacz <a href="bol-plecow-trening-silowy">ból pleców a trening</a> i <a href="przysiad-technika-bezpiecznie">przysiad</a>.'
});
defs.push({
    slug: 'wyciskanie-na-lawce-technika',
    emoji: '🛋️',
    title: 'Wyciskanie na ławce — technika',
    subtitle: 'Ustawienie łopatek, chwyt i łuk — jak wyciskać mocno i bez bólu barków.',
    meta: 'Wyciskanie na ławce: technika, ustawienie łopatek i bezpieczeństwo barków.',
    crumb: 'Wyciskanie na ławce',
    category: 'cwiczenia',
    relatedHtml: '<a href="cwiczenia-zlozone-vs-izolowane">złożone</a> · <a href="podwojna-progresja-system">progresja</a> · <a href="artykuly">artykuły</a>',
    lead: 'Wyciskanie to nie „leżenie i pchanie” — kluczem jest stabilna pozycja łopatek i kontrolowana ścieżka gryfu.',
    sections: [
        { h2: 'Pozycja', p: 'Łopatki cofnij i dociśnij do ławki, stopy twardo na ziemi. To daje stabilną bazę i odciąża ramiona.' },
        { h2: 'Chwyt i łuk', p: 'Chwyt na szerokość barków, nadgarstki prosto. Lekki łuk w odcinku piersiowym jest OK — przesadne wyginanie nie pomaga.' },
        { h2: 'Ścieżka gryfu', p: 'Opuszczaj kontrolowanie do klatki, a nie na szyję. Wyciskaj lekko w górę i w stronę głowy. Nie odbijaj od klatki.' }
    ],
    bullets: [
        '<strong>Łopatki:</strong> cofnięte, dociśnięte.',
        '<strong>Chwyt:</strong> barki, nadgarstki proste.',
        '<strong>Kontrola:</strong> wolno w dół, mocno w górę.',
    ],
    uwaga: 'Ból w barku przy wyciskaniu najczęściej wynika z „otwartych” łopatek i wypychania do przodu. Popraw ustawienie, zanim dołożysz ciężar.',
    coDalej: 'Zobacz <a href="podwojna-progresja-system">progresję ciężaru</a> i <a href="cwiczenia-zlozone-vs-izolowane">złożone ćwiczenia</a>.'
});
defs.push({
    slug: 'podciaganie-na-drazku-plan',
    emoji: '🧗',
    title: 'Podciąganie na drążku — plan od zera',
    subtitle: 'Progresja od wiszenia na drążku do pełnych podciągnięć — bez ani jednego powtórzenia.',
    meta: 'Podciąganie na drążku: progresja od zera do pełnych podciągnięć.',
    crumb: 'Podciąganie na drążku',
    category: 'cwiczenia',
    relatedHtml: '<a href="kalistenika-trening-z-masa-ciala">kalistenika</a> · <a href="podwojna-progresja-system">progresja</a> · <a href="artykuly">artykuły</a>',
    lead: 'Podciąganie to surowe ćwiczenie — wiele osób nie zrobi ani jednego. Da się do niego dojść progresją od samego wiszenia.',
    sections: [
        { h2: 'Etapy progresji', p: 'Zwisy aktywne → negatywne (kontrolowany zjazd) → podciąganie z gumą → pełne powtórzenia. Każdy etap buduje potrzebną siłę.' },
        { h2: 'Częstotliwość', p: 'Ćwicz chwyt i negatywy 2–3× w tygodniu. Krótkie, częste sesje działają tu lepiej niż jedna męcząca.' },
        { h2: 'Technika', p: 'Ściągnij łopatki w dół, zanim ugniesz ręce. Unikaj bujania i półzakresu — lepiej mniej powtórzeń w pełnym zakresie.' }
    ],
    bullets: [
        '<strong>Etapy:</strong> zwis → negatyw → guma → pełne.',
        '<strong>2–3×/tydz:</strong> krótko i często.',
        '<strong>Pełny zakres:</strong> mniej > półpodciągnięcia.',
    ],
    uwaga: 'Nadwaga realnie utrudnia podciąganie — każdy kilogram to więcej do dźwignięcia. Nie zniechęcaj się, postęp przyjdzie z czasem i wagą.',
    coDalej: 'Zobacz <a href="kalistenika-trening-z-masa-ciala">trening z własną masą</a> i <a href="sila-chwytu-grip">siłę chwytu</a>.'
});
defs.push({
    slug: 'full-body-vs-split',
    emoji: '🗂️',
    title: 'Full body vs split — co wybrać',
    subtitle: 'Trening całego ciała czy dzielony na partie — co daje szybciej efekty.',
    meta: 'Full body vs split: co wybrać, ile razy w tygodniu trenować i co daje efekty.',
    crumb: 'Full body vs split',
    category: 'cwiczenia',
    relatedHtml: '<a href="czestotliwosc-treningu-nauka">częstotliwość</a> · <a href="ile-serii-na-grupe-tygodniowo">ile serii</a> · <a href="artykuly">artykuły</a>',
    lead: 'Full body (całe ciało na jednym treningu) i split (dzielenie na partie) dają podobne rezultaty przy tej samej objętości — różnica dotyczy częstotliwości i wygody.',
    sections: [
        { h2: 'Full body', p: 'Idealne przy 2–3 treningach tygodniowo. Częste bodźce na te same mięśnie, proste planowanie. Najlepszy start dla początkujących.' },
        { h2: 'Split', p: 'Dzielenie (push/pull/legs, góra/dół) sprawdza się przy 4–6 treningach i większej objętości. Więcej na partię, ale rzadziej.' },
        { h2: 'Co wybrać', p: 'Decydują dni treningowe, a nie „lepszy split”. Trenujesz 2–3× → full body. 4×+ → góra/dół albo push/pull/legs.' }
    ],
    bullets: [
        '<strong>2–3×/tydz:</strong> full body.',
        '<strong>4×:</strong> góra/dół.',
        '<strong>5–6×:</strong> push/pull/legs.',
    ],
    uwaga: 'Nie komplikuj. Rozdział wolumenu (liczba serii na grupę tygodniowo) liczy się bardziej niż to, jak podzielisz dni.',
    coDalej: 'Zobacz <a href="czestotliwosc-treningu-nauka">częstotliwość treningu</a> i <a href="ile-serii-na-grupe-tygodniowo">ile serii na grupę</a>.'
});
defs.push({
    slug: 'podwojna-progresja-system',
    emoji: '📈',
    title: 'Podwójna progresja — system dodawania ciężaru',
    subtitle: 'Kiedy dołożyć kilogramy, a kiedy powtórzenia — prosty algorytm postępu.',
    meta: 'Podwójna progresja: jak sterować ciężarem i powtórzeniami, by stale rosnąć.',
    crumb: 'Podwójna progresja',
    category: 'cwiczenia',
    relatedHtml: '<a href="rir-czy-trening-do-upadku">RIR</a> · <a href="ile-serii-na-grupe-tygodniowo">ile serii</a> · <a href="artykuly">artykuły</a>',
    lead: 'Podwójna progresja to najprostszy system budowania siły: najpierw dobijaj do górnej liczby powtórzeń, potem dołóż ciężar i zacznij od dołu zakresu.',
    sections: [
        { h2: 'Jak to działa', p: 'Załóż zakres 8–12 powtórzeń. Gdy zrobisz 12 czystych powtórzeń w każdej serii, dołóż ciężar (np. +2,5 kg) i wróć do 8 powtórzeń.' },
        { h2: 'Dlaczego działa', p: 'Daje jasny sygnał, kiedy docisnąć — zamiast „jakoś” dodawać. Postęp ma strukturę, więc łatwiej go utrzymać.' },
        { h2: 'Postęp w praktyce', p: 'Zapisuj wyniki w notatniku lub apce. Bez zapisu podwójna progresja nie działa — nie zapamiętasz liczb z ostatniego treningu.' }
    ],
    bullets: [
        '<strong>Zakres:</strong> np. 8–12 powtórzeń.',
        '<strong>Góra zakresu:</strong> dołóż ciężar.',
        '<strong>Zapisuj:</strong> bez tego system pada.',
    ],
    uwaga: 'Nie dokładaj ciężaru kosztem techniki. Jeśli nie zrobisz minimum zakresu czysto, zostań na tym samym ciężarze.',
    coDalej: 'Zobacz <a href="rir-czy-trening-do-upadku">czy trenować do upadku</a> i <a href="ile-serii-na-grupe-tygodniowo">ile serii tygodniowo</a>.'
});
defs.push({
    slug: 'rir-czy-trening-do-upadku',
    emoji: '🎚️',
    title: 'RIR — trenować do upadku czy nie',
    subtitle: 'Reps in Reserve: ile powtórzeń „w zapasie” zostawiać, by rosnąć bez wypalenia.',
    meta: 'RIR i trening do upadku: ile powtórzeń zostawiać w zapasie dla hipertrofii.',
    crumb: 'RIR i trening do upadku',
    category: 'cwiczenia',
    relatedHtml: '<a href="podwojna-progresja-system">podwójna progresja</a> · <a href="overtraining-przetrenowanie-objawy">przetrenowanie</a> · <a href="artykuly">artykuły</a>',
    lead: 'RIR (reps in reserve) mówi, ile powtórzeń zostawiasz „w zapasie”. Nie musisz trenować do upadku, by budować mięśnie.',
    sections: [
        { h2: 'Upadek vs RIR 1–3', p: 'Trening 1–3 powtórzenia przed upadkiem daje porównywalny wzrost mięśni co upadek, ale z mniejszym zmęczeniem i szybszą regeneracją.' },
        { h2: 'Kiedy upadek ma sens', p: 'Na końcu treningu lub w ćwiczeniach izolowanych, gdzie ryzyko techniczne jest niskie. Stały upadek na złożonych odbija się na objętości.' },
        { h2: 'Praktyka', p: 'Trzymaj RIR 1–2 w seriach roboczych, ostatnią serię możesz doprowadzić bliżej upadku. To dobry kompromis stymulacji i regeneracji.' }
    ],
    bullets: [
        '<strong>RIR 1–2:</strong> standard dla serii roboczych.',
        '<strong>Upadek:</strong> okazjonalnie, na izolowanych.',
        '<strong>Mniej zmęczenia:</strong> = więcej objętości.',
    ],
    uwaga: 'Ciągły trening do upadku podnosi ryzyko drobnych urazów i wydłuża regenerację, bez wyraźnie lepszych efektów. Umiar się opłaca.',
    coDalej: 'Zobacz <a href="podwojna-progresja-system">podwójną progresję</a> i <a href="ile-serii-na-grupe-tygodniowo">ile serii</a>.'
});
//_A6_
//_A7_
//_A8_
//_A9_
//_A10_

const articles = defs.map(buildArticle);
const out = path.join(__dirname, 'hardcore-articles-batch8.json');
writeFileSync(out, JSON.stringify(articles, null, 2) + '\n');
console.log(`Zapisano ${articles.length} artykułów -> ${out}`);
