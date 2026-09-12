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
defs.push({
    slug: 'ile-serii-na-grupe-tygodniowo',
    emoji: '🔢',
    title: 'Ile serii na grupę mięśniową tygodniowo',
    subtitle: 'Optymalna objętość treningowa: ile serii buduje mięśnie, a ile to już przesada.',
    meta: 'Ile serii na grupę tygodniowo: optymalna objętość dla hipertrofii i regeneracji.',
    crumb: 'Ile serii na grupę',
    category: 'cwiczenia',
    relatedHtml: '<a href="czestotliwosc-treningu-nauka">częstotliwość</a> · <a href="rir-czy-trening-do-upadku">RIR</a> · <a href="artykuly">artykuły</a>',
    lead: 'Istnieje „słodki punkt” objętości tygodniowej: zbyt mało nie daje bodźca, zbyt dużo przytłacza regenerację.',
    sections: [
        { h2: 'Ile serii', p: 'Dla większości sprawdza się 10–20 serii na grupę tygodniowo. Poniżej 10 słabo stymuluje, powyżej 20 ryzyko przetrenowania rośnie bez lepszych efektów.' },
        { h2: 'Jak liczyć', p: 'Liczysz serie robocze (bez rozgrzewkowych) na daną grupę w tygodniu. Np. klatka: 3 serie wyciskania × 2 dni = 6, plus rozpiętki — sumujesz.' },
        { h2: 'Dopasuj do siebie', p: 'Początkujący zbudują mięśnie przy niższej objętości, zaawansowani potrzebują jej więcej. Zwiększaj stopniowo, obserwując regenerację i postęp.' }
    ],
    bullets: [
        '<strong>Optimum:</strong> 10–20 serii/grupę/tydzień.',
        '<strong>Początkujący:</strong> dolna granica wystarczy.',
        '<strong>Stopniowo:</strong> nie skacz z 6 na 24 serii.',
    ],
    uwaga: 'Objętość to nie wszystko — kilka „złych” serii to gorsza inwestycja niż mniej, ale jakościowych, blisko porażki.',
    coDalej: 'Zobacz <a href="czestotliwosc-treningu-nauka">częstotliwość treningu</a> i <a href="overtraining-przetrenowanie-objawy">przetrenowanie</a>.'
});
defs.push({
    slug: 'czestotliwosc-treningu-nauka',
    emoji: '📅',
    title: 'Częstotliwość treningu — co mówi nauka',
    subtitle: 'Ile razy w tygodniu trenować mięsień, by rósł najszybciej.',
    meta: 'Częstotliwość treningu: ile razy w tygodniu trenować grupę mięśniową dla hipertrofii.',
    crumb: 'Częstotliwość treningu',
    category: 'cwiczenia',
    relatedHtml: '<a href="ile-serii-na-grupe-tygodniowo">ile serii</a> · <a href="full-body-vs-split">full body vs split</a> · <a href="artykuly">artykuły</a>',
    lead: 'Przy tej samej objętości częstszy trening danego mięśnia (2× vs 1×/tydzień) daje zwykle lekko lepsze efekty — ale to nie zero-jedynkowa różnica.',
    sections: [
        { h2: '2× czy 1×', p: 'Trening mięśnia 2× w tygodniu częściej wygrywa z 1×, choć różnica bywa niewielka. Klucz to rozłożyć objętość na więcej bodźców.' },
        { h2: 'Dlaczego', p: 'Częstsze, mniejsze bodźce dłużej utrzymują syntezę białek mięśniowych na podwyższonym poziomie w skali tygodnia.' },
        { h2: 'Praktyka', p: 'Nie musisz trenować codziennie. Wystarczy góra/dół albo full body 3×/tydzień — każdy mięsień dostaje wtedy 2–3 bodźce tygodniowo.' }
    ],
    bullets: [
        '<strong>Cel:</strong> 2 bodźce na mięsień/tydzień.',
        '<strong>Układ:</strong> full body lub góra/dół.',
        '<strong>Objętość:</strong> rozłóż, nie kumuluj.',
    ],
    uwaga: 'Częstotliwość bez objętości nic nie da — najpierw upewnij się, że robisz 10–20 serii na grupę, dopiero potem rozkładaj częściej.',
    coDalej: 'Zobacz <a href="ile-serii-na-grupe-tygodniowo">ile serii</a> i <a href="full-body-vs-split">full body vs split</a>.'
});
defs.push({
    slug: 'rozgrzewka-czym-i-jak',
    emoji: '🔧',
    title: 'Rozgrzewka — jak naprawdę działa',
    subtitle: 'Czy długie rozciąganie przed treningiem pomaga, czy to strata czasu.',
    meta: 'Rozgrzewka przed treningiem: co robić, czego unikać i ile ma trwać.',
    crumb: 'Rozgrzewka',
    category: 'cwiczenia',
    relatedHtml: '<a href="pierwszy-trening-silowy-plan">plan treningu</a> · <a href="stretching-silny-czy-bez">stretching</a> · <a href="artykuly">artykuły</a>',
    lead: 'Rozgrzewka ma podnieść temperaturę ciała i przygotować stawy oraz układ nerwowy — nie musi trwać pół godziny ani składać się ze statycznego rozciągania.',
    sections: [
        { h2: 'Co robić', p: '5–10 minut lekkiego ruchu (rower, marsz), potem serie rozgrzewkowe tego ćwiczenia ze stopniowo rosnącym ciężarem. To najlepiej przygotowuje do ciężkiej pracy.' },
        { h2: 'Czego nie robić', p: 'Długie statyczne rozciąganie przed treningiem może chwilowo obniżyć siłę. Rozciąganie statyczne zostaw na koniec sesji.' },
        { h2: 'Ile czasu', p: 'Dla większości 10–15 minut w zupełności wystarczy. Ważniejsza jest jakość serii rozgrzewkowych niż długość „rozruchu”.' }
    ],
    bullets: [
        '<strong>Start:</strong> 5–10 min lekkiego cardio.',
        '<strong>Potem:</strong> serie zbliżeniowe danego ruchu.',
        '<strong>Statyczny stretching:</strong> na koniec.',
    ],
    uwaga: 'W chłodne dni i przy porannych treningach rozgrzewka powinna być dłuższa — zimne mięśnie i ścięgna są bardziej podatne na urazy.',
    coDalej: 'Zobacz <a href="stretching-silny-czy-bez">stretching a siła</a> i <a href="pierwszy-trening-silowy-plan">plan treningu</a>.'
});
defs.push({
    slug: 'stretching-silny-czy-bez',
    emoji: '🤸',
    title: 'Stretching a siła — kiedy pomaga, kiedy szkodzi',
    subtitle: 'Statyczne rozciąganie przed treningiem a wyniki siłowe — co mówią badania.',
    meta: 'Stretching a siła: czy rozciąganie przed treningiem osłabia i kiedy je robić.',
    crumb: 'Stretching a siła',
    category: 'cwiczenia',
    relatedHtml: '<a href="rozgrzewka-czym-i-jak">rozgrzewka</a> · <a href="mobilnosc-vs-rozciaganie">mobilność</a> · <a href="artykuly">artykuły</a>',
    lead: 'Długie statyczne rozciąganie tuż przed wysiłkiem siłowym może chwilowo obniżyć siłę. To nie znaczy, że stretching jest zły — trzeba tylko wiedzieć, kiedy go robić.',
    sections: [
        { h2: 'Przed treningiem', p: 'Unikaj długiego (30 s+) statycznego rozciągania danego mięśnia. Zamiast tego dynamiczne rozgrzanie i serie zbliżeniowe.' },
        { h2: 'Po treningu', p: 'Statyczne rozciąganie po sesji poprawia zakres ruchu i nie koliduje z siłą. To jego najlepszy moment.' },
        { h2: 'Osobno', p: 'Jeśli zależy ci na gibkości, rób stretching jako osobną sesję lub w dni nietreningowe — pełny efekt bez wpływu na siłę.' }
    ],
    bullets: [
        '<strong>Przed:</strong> dynamicznie, nie statycznie.',
        '<strong>Po:</strong> statycznie, na koniec.',
        '<strong>Gibkość:</strong> osobne sesje na luzie.',
    ],
    uwaga: 'Efekt osłabienia jest krótki i nie dotyczy każdego równo — ale po co ryzykować? Przenieś statyczny stretching na koniec treningu.',
    coDalej: 'Zobacz <a href="mobilnosc-vs-rozciaganie">mobilność vs rozciąganie</a> i <a href="rozgrzewka-czym-i-jak">rozgrzewkę</a>.'
});
defs.push({
    slug: 'zakwasy-doms-czym-sa',
    emoji: '🔥',
    title: 'Zakwasy (DOMS) — dlaczego bolą mięśnie',
    subtitle: 'Skąd się biorą zakwasy, czy znaczą dobrą robotę i jak je łagodzić.',
    meta: 'Zakwasy i DOMS: dlaczego mięśnie bolą po treningu i czy to oznacza wzrost.',
    crumb: 'Zakwasy (DOMS)',
    category: 'cwiczenia',
    relatedHtml: '<a href="regeneracja-szybka-co-dziala">regeneracja</a> · <a href="mobilnosc-vs-rozciaganie">mobilność</a> · <a href="artykuly">artykuły</a>',
    lead: 'Zakwasy (DOMS) to opóźniony ból mięśni po wysiłku — efekt mikrouszkodzeń i stanu zapalnego, nie „kwasu mlekowego”.',
    sections: [
        { h2: 'Skąd się biorą', p: 'Pojawiają się po 24–72 h, głównie po ekscentrycznych fazach ruchu (opuszczanie ciężaru). To nie kwas mlekowy — ten znika po kilkudziesięciu minutach.' },
        { h2: 'Czy znaczą wzrost', p: 'Nie. Możesz rosnąć bez zakwasów i mieć zakwasy bez wzrostu. To sygnał nowego bodźca, nie miara postępu.' },
        { h2: 'Jak łagodzić', p: 'Lekki ruch, spacer, masaż i sen pomagają. Całkowite unikanie ich nie da nic — zakwasy z czasem po prostu słabną.' }
    ],
    bullets: [
        '<strong>Pora:</strong> 24–72 h po treningu.',
        '<strong>Wzrost:</strong> zakwasy ≠ postęp.',
        '<strong>Łagodzenie:</strong> ruch, sen, masaż.',
    ],
    uwaga: 'Ból ostry, strzelający lub jednostronny to nie zakwasy — to sygnał możliwego urazu i powód, by przerwać i skonsultować z fizjoterapeutą.',
    coDalej: 'Zobacz <a href="regeneracja-szybka-co-dziala">szybszą regenerację</a> i <a href="mobilnosc-vs-rozciaganie">mobilność</a>.'
});
defs.push({
    slug: 'regeneracja-szybka-co-dziala',
    emoji: '♻️',
    title: 'Szybsza regeneracja — co naprawdę działa',
    subtitle: 'Sen, jedzenie, masaż, lód — co przyspiesza powrót do formy, a co to mit.',
    meta: 'Regeneracja po treningu: co działa (sen, białko), a co nie (lód, magiczne rollery).',
    crumb: 'Regeneracja',
    category: 'cwiczenia',
    relatedHtml: '<a href="sen-a-hormon-wzrostu">sen</a> · <a href="zakwasy-doms-czym-sa">zakwasy</a> · <a href="artykuly">artykuły</a>',
    lead: 'Regeneracja to głównie sen i jedzenie. Większość „przyspieszaczy” daje efekt placebo albo działa dopiero wtedy, gdy fundamentu brakuje.',
    sections: [
        { h2: 'Co działa', p: 'Sen 7–9 h, wystarczająca ilość białka i kalorii, zarządzanie stresem. To codzienne nawyki decydują o tempie regeneracji.' },
        { h2: 'Co jest przereklamowane', p: 'Lód, zimne kąpiele i rollery bywają przyjemne, ale dowody na szybszą regenerację są słabe. Mogą nawet spowalniać adaptację przy nadużywaniu.' },
        { h2: 'Praktyka', p: 'Dni lżejsze, spacer i normalna aktywność biją „leżenie i rollowanie”. Trzymaj proste: śpij, jedz białko, nie dokładaj stresu.' }
    ],
    bullets: [
        '<strong>Sen:</strong> 7–9 h to podstawa.',
        '<strong>Białko:</strong> domknij dzienny cel.',
        '<strong>Ruch:</strong> lekki spacer zamiast bezruchu.',
    ],
    uwaga: 'Jeśli ciągle czujesz się rozbity, najpierw sprawdź sen i kalorie — a dopiero potem inwestuj w gadżety regeneracyjne.',
    coDalej: 'Zobacz <a href="sen-a-hormon-wzrostu">sen a regeneracja</a> i <a href="zakwasy-doms-czym-sa">zakwasy</a>.'
});
defs.push({
    slug: 'sen-a-hormon-wzrostu',
    emoji: '🛌',
    title: 'Sen a hormony i siła',
    subtitle: 'Dlaczego niedospanie podcina siłę, hormony i regenerację mięśni.',
    meta: 'Sen a trening: wpływ niedospania na siłę, hormony i budowanie mięśni.',
    crumb: 'Sen a hormony',
    category: 'cwiczenia',
    relatedHtml: '<a href="regeneracja-szybka-co-dziala">regeneracja</a> · <a href="magnez-i-sen-skurcze">magnez i sen</a> · <a href="artykuly">artykuły</a>',
    lead: 'Większość regeneracji i część hormonów anabolicznych działa najmocniej w nocy. Krótki sen to bezpośredni cios w trening.',
    sections: [
        { h2: 'Hormony', p: 'Testosteron i hormon wzrostu są wydzielane głównie w głębokim śnie. Chroniczne niedospanie obniża testosteron i podnosi kortyzol.' },
        { h2: 'Siła i mięśnie', p: 'Niewyspanie pogarsza siłę, koordynację i tempo syntezy białek. Mniej snu = wolniejszy postęp mimo tej samej diety i treningów.' },
        { h2: 'Praktyka', p: 'Celuj w 7–9 h. Stałe godziny snu, ciemny pokój i ograniczenie ekranów przed snem działają lepiej niż suplement „na sen”.' }
    ],
    bullets: [
        '<strong>Cel:</strong> 7–9 h snu.',
        '<strong>Stałość:</strong> regularne godziny.',
        '<strong>Przed snem:</strong> mniej ekranu i kofeiny.',
    ],
    uwaga: 'Jedna zarwana noc to nie tragedia — ale chronicznie 5–6 h snu tydzień w tydzień realnie ograniczy twoje efekty, niezależnie od dania.',
    coDalej: 'Zobacz <a href="regeneracja-szybka-co-dziala">regenerację</a> i <a href="magnez-i-sen-skurcze">magnez a sen</a>.'
});
defs.push({
    slug: 'cardio-liss-vs-hiit',
    emoji: '🏃',
    title: 'LISS vs HIIT — co wybrać',
    subtitle: 'Spokojne cardio czy interwały — co lepsze dla serca, spalania i regeneracji.',
    meta: 'LISS vs HIIT: różnice, wpływ na spalanie i kiedy które wybrać.',
    crumb: 'LISS vs HIIT',
    category: 'cwiczenia',
    relatedHtml: '<a href="epoc-trening-a-spalanie-po">EPOC</a> · <a href="hiit-krotkie-i-intensywne">HIIT</a> · <a href="artykuly">artykuły</a>',
    lead: 'LISS (stałe, spokojne cardio) i HIIT (krótkie interwały) spalają kalorie inaczej, ale oba działają. Wybór zależy od czasu i regeneracji.',
    sections: [
        { h2: 'LISS', p: 'Dłuższe, umiarkowane wysiłki (spacer, rower). Mniejsze obciążenie, łatwe do odbudowy, świetne na codzień i przy treningu siłowym.' },
        { h2: 'HIIT', p: 'Krótkie, intensywne serie. Więcej kalorii na minutę i wyższy EPOC, ale mocniej obciąża i wymaga regeneracji.' },
        { h2: 'Co wybrać', p: 'Fundament to codzienne kroki (LISS-style). HIIT dodawaj 1–2×/tydzień dla kondycji, jeśli regeneracja na to pozwala.' }
    ],
    bullets: [
        '<strong>Codziennie:</strong> lekkie kroki i spacer.',
        '<strong>1–2×/tydz:</strong> HIIT dla kondycji.',
        '<strong>Nadmiar HIIT:</strong> podkrada regenerację.',
    ],
    uwaga: 'HIIT „spala więcej tłuszczu” głównie w reklamach — najważniejsza jest suma spalonych kalorii i to, co zrobisz w skali tygodnia.',
    coDalej: 'Zobacz <a href="hiit-krotkie-i-intensywne">protokół HIIT</a> i <a href="epoc-trening-a-spalanie-po">EPOC</a>.'
});
defs.push({
    slug: 'strefa-tetna-a-spalanie-tluszczu',
    emoji: '📉',
    title: 'Strefa tętna a spalanie tłuszczu — mit',
    subtitle: 'Czy „strefa spalania tłuszczu” faktycznie spala tłuszcz, czy to marketing pulso.' ,
    meta: 'Strefa tętna a spalanie tłuszczu: ile w tym prawdy i co naprawdę liczy się przy cardio.',
    crumb: 'Strefa tętna',
    category: 'cwiczenia',
    relatedHtml: '<a href="cardio-liss-vs-hiit">LISS vs HIIT</a> · <a href="cardio-na-czczo-czy-spala-wiecej">cardio na czczo</a> · <a href="artykuly">artykuły</a>',
    lead: '„Strefa spalania tłuszczu” istnieje, ale mylne jest myślenie, że trening w niej spala najwięcej tłuszczu w ogóle.',
    sections: [
        { h2: 'O co chodzi', p: 'Przy niskiej intensywności organizm proporcjonalnie więcej energii bierze z tłuszczu. Ale to procent, nie absolutna ilość — a liczą się spalone kalorie.' },
        { h2: 'Gdzie jest myłka', p: 'Wyższa intensywność spala więcej kalorii ogółem, nawet jeśli procent z tłuszczu jest mniejszy. Bilans dnia wygrywa z „strefą”.' },
        { h2: 'Praktyka', p: 'Nie gon za pulsometrem. Rób cardio, które pasuje do twojego planu i regeneracji — tłuszcz spalisz deficytem, nie magiczną strefą.' }
    ],
    bullets: [
        '<strong>Liczy się:</strong> suma spalonych kalorii.',
        '<strong>Strefa:</strong> to kwestia proporcji, nie cudu.',
        '<strong>Deficyt:</strong> to on spala tłuszcz.',
    ],
    uwaga: 'Pulsometry bywają niedokładne, a „strefy” uśrednione. Mniej energii w obsługę gadżetów, więcej w konsekwentne ruszanie się.',
    coDalej: 'Zobacz <a href="cardio-na-czczo-czy-spala-wiecej">cardio na czczo</a> i <a href="cardio-liss-vs-hiit">LISS vs HIIT</a>.'
});
defs.push({
    slug: 'cardio-na-czczo-czy-spala-wiecej',
    emoji: '🌅',
    title: 'Cardio na czczo — czy spala więcej tłuszczu?',
    subtitle: 'Trening przed śniadaniem a spalanie tłuszczu — co naprawdę mówią badania.',
    meta: 'Cardio na czczo: czy spala więcej tłuszczu i czy warto trenować przed śniadaniem.',
    crumb: 'Cardio na czczo',
    category: 'cwiczenia',
    relatedHtml: '<a href="strefa-tetna-a-spalanie-tluszczu">strefa tętna</a> · <a href="cardio-liss-vs-hiit">LISS vs HIIT</a> · <a href="artykuly">artykuły</a>',
    lead: 'Cardio na czczo spala chwilowo nieco więcej tłuszczu, ale w skali dnia bilans jest taki sam jak po posiłku. To kwestia preferencji.',
    sections: [
        { h2: 'Mechanizm', p: 'Bez jedzenia organizm sięga po tłuszcz jako paliwo. Efekt „dodatkowego” spalania tłuszczu istnieje, ale jest mały i częściowo równoważony później.' },
        { h2: 'Co mówią dane', p: 'Długoterminowo cardio na czczo vs po posiłku daje podobną utratę tłuszczu przy tym samym deficycie. Cudotwórstwa tu nie ma.' },
        { h2: 'Czy robić', p: 'Jeśli lubisz i dobrze się czujesz — rób. Jeśli po treningu na czczo brakuje ci siły, jedz przed. Konsekwencja wygrywa z timingiem.' }
    ],
    bullets: [
        '<strong>Różnica:</strong> mała, bilans dnia się zgadza.',
        '<strong>Wybierz:</strong> co lepiej ci pasuje.',
        '<strong>Ważne:</strong> deficyt, nie pora.',
    ],
    uwaga: 'Trening siłowy na czczo może obniżyć jakość wysiłku. Cardio ok, ale ciężka siłownia zwykle lepiej po lekkim posiłku.',
    coDalej: 'Zobacz <a href="strefa-tetna-a-spalanie-tluszczu">mit strefy tętna</a> i <a href="bilans-energetyczny-co-to">o bilansie energetycznym</a>.'
});

const articles = defs.map(buildArticle);
const out = path.join(__dirname, 'hardcore-articles-batch8.json');
writeFileSync(out, JSON.stringify(articles, null, 2) + '\n');
console.log(`Zapisano ${articles.length} artykułów -> ${out}`);
