/**
 * Generuje artykuły — batch 9 (fitness, suplementacja i regeneracja, 20 szt.).
 * Produkuje scripts/hardcore-articles-batch9.json.
 * node scripts/build-batch9-articles.mjs
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
    slug: 'kreatyna-co-robi-i-jak-brac',
    emoji: '🧬',
    title: 'Kreatyna — co robi i jak ją brać',
    subtitle: 'Najlepiej zbadany suplement sportowy: dawki, ładowanie i na co naprawdę działa.',
    meta: 'Kreatyna: działanie, dawkowanie, ładowanie i efekty — co mówi ISSN.',
    crumb: 'Kreatyna',
    category: 'cwiczenia',
    relatedHtml: '<a href="kofeina-dawka-i-timing">kofeina</a> · <a href="bcAA-i-eaa-naprawde-potrzebne">BCAA/EAA</a> · <a href="artykuly">artykuły</a>',
    lead: 'Zgodnie ze <a href="https://jissn.biomedcentral.com/articles/10.1186/s12970-017-0173-z" target="_blank" rel="noopener">stanowiskiem ISSN</a> monohydrat kreatyny to najskuteczniejszy i najlepiej zbadany suplement na siłę i masę mięśniową.',
    sections: [
        { h2: 'Co robi', p: 'Uzupełnia fosfokreatynę, dając energię na krótkie, intensywne wysiłki. Podnosi siłę, moc i przyrost masy, częściowo przez retencję wody w mięśniach.' },
        { h2: 'Dawkowanie', p: 'Standard to 3–5 g monohydratu dziennie. Ładowanie (20 g/dzień przez tydzień) tylko szybciej nasyca bufor — można, ale nie trzeba.' },
        { h2: 'Czy bezpieczna', p: 'Tak, dla zdrowych nerek wieloletnie użycie w typowych dawkach jest bezpieczne. Odstawianie nie powoduje „spadku”, tylko powrót do poziomu wyjściowego.' }
    ],
    bullets: [
        '<strong>Dawka:</strong> 3–5 g monohydratu dziennie.',
        '<strong>Codziennie:</strong> w dzień treningowy i nie.',
        '<strong>Ładowanie:</strong> opcjonalne, 20 g/5–7 dni.',
    ],
    uwaga: 'Tańszy monohydrat działa tak samo jak fancy „kreatyny z nazwami”. Pij więcej wody — kreatyna delikatnie zatrzymuje płyn.',
    coDalej: 'Zobacz <a href="kofeina-dawka-i-timing">czy kofeina koliduje z kreatyną</a> i <a href="bcAA-i-eaa-naprawde-potrzebne">BCAA vs EAA</a>.'
});
defs.push({
    slug: 'kofeina-dawka-i-timing',
    emoji: '☕',
    title: 'Kofeina przed treningiem — dawka i timing',
    subtitle: 'Ile kofeiny działa ergogenicznie i kiedy ją brać, by wzmocnić trening.',
    meta: 'Kofeina przed treningiem: dawka, timing i efekt ergogeniczny.',
    crumb: 'Kofeina przed treningiem',
    category: 'cwiczenia',
    relatedHtml: '<a href="kreatyna-co-robi-i-jak-brac">kreatyna</a> · <a href="kawa-a-zdrowie-ile-bezpiecznie">kawa</a> · <a href="artykuly">artykuły</a>',
    lead: 'Według <a href="https://jissn.biomedcentral.com/articles/10.1186/s12970-020-00383-4" target="_blank" rel="noopener">ISSN</a> kofeina 3–6 mg/kg ok. 30–60 min przed wysiłkiem poprawia siłę, moc i wytrzymałość.',
    sections: [
        { h2: 'Jaka dawka', p: 'Dla osoby 70 kg to ok. 200–400 mg (2–4 kawy). Więcej niekoniecznie działa lepiej, za to częściej daje nerwowość i psuje sen.' },
        { h2: 'Timing', p: 'Szczyt działania to 30–60 min po spożyciu. Przyjmij ją na godzinę przed treningiem, a nie w trakcie.' },
        { h2: 'Wrażliwość', p: 'Niektórzy metabolizują kofeinę wolno — wtedy działa dłużej, a sen cierpi bardziej. Obserwuj siebie, zwłaszcza przy wieczornych treningach.' }
    ],
    bullets: [
        '<strong>Dawka:</strong> 3–6 mg/kg, 30–60 min przed.',
        '<strong>2–4 kawy:</strong> dla większości wystarczą.',
        '<strong>Nie nocą:</strong> kofeina potrafi psuć sen.',
    ],
    uwaga: 'Budujesz tolerancję — cykliczne przerwy od kofeiny przywracają jej moc. Nie eskaluj dawek w nieskończoność.',
    coDalej: 'Zobacz <a href="kreatyna-co-robi-i-jak-brac">kreatynę</a> i <a href="kawa-a-zdrowie-ile-bezpiecznie">ile kawy to zdrowo</a>.'
});
defs.push({
    slug: 'beta-alanina-mrowienie',
    emoji: '🐜',
    title: 'Beta-alanina — mrowienie i wydolność',
    subtitle: 'Co robi, czemu szczypie skórę i czy warto ją dodawać.',
    meta: 'Beta-alanina: działanie, mrowienie (parestezje) i dawkowanie.',
    crumb: 'Beta-alanina',
    category: 'cwiczenia',
    relatedHtml: '<a href="kreatyna-co-robi-i-jak-brac">kreatyna</a> · <a href="cytrulina-i-pompa-miesniowa">cytrulina</a> · <a href="artykuly">artykuły</a>',
    lead: 'Beta-alanina zwiększa karnozynę w mięśniach, buforując kwas — pomaga w wysiłkach trwających 1–4 minuty. Stąd popularna w siłowni i sprincie.',
    sections: [
        { h2: 'Co robi', p: 'Karnozyna neutralizuje jony wodoru, opóźniając „palenie” mięśni. Efekt dotyczy głównie wysiłków od kilkudziesięciu sekund do kilku minut.' },
        { h2: 'Mrowienie', p: 'Parestezje (mrowienie skóry) to nieszkodliwy skutek uboczny. Można go uniknąć, dzieląc dawkę lub biorąc wersję o wolnym uwalnianiu.' },
        { h2: 'Dawkowanie', p: 'Typowe 2–5 g dziennie, mniejsze dawki rozłożone w ciągu dnia. Efekt narasta z czasem, bo karnozyna kumuluje się w mięśniach.' }
    ],
    bullets: [
        '<strong>Dawka:</strong> 2–5 g dziennie.',
        '<strong>Mrowienie:</strong> rozłóż na porcje.',
        '<strong>Działanie:</strong> wysiłki 1–4 minuty.',
    ],
    uwaga: 'Beta-alanina nie daje „pompy” ani energii jak kofeina — to suplement buforujący dla konkretnego typu pracy. Nie licz na nią przy 5-sekundowych sprintach.',
    coDalej: 'Zobacz <a href="cytrulina-i-pompa-miesniowa">cytrulinę</a> i <a href="kreatyna-co-robi-i-jak-brac">kreatynę</a>.'
});
defs.push({
    slug: 'bcAA-i-eaa-naprawde-potrzebne',
    emoji: '🧪',
    title: 'BCAA i EAA — naprawdę potrzebne?',
    subtitle: 'Czy aminokwasy rozgałęzione mają sens, gdy jesz wystarczająco białka.',
    meta: 'BCAA i EAA: czym się różnią i czy warto je suplementować przy dobrej diecie.',
    crumb: 'BCAA i EAA',
    category: 'cwiczenia',
    relatedHtml: '<a href="kreatyna-co-robi-i-jak-brac">kreatyna</a> · <a href="leucyna-prog-anaboliczny">leucyna</a> · <a href="artykuly">artykuły</a>',
    lead: 'BCAA (leucyna, izoleucyna, walina) to podzbiór EAA (wszystkie egzogenne). Przy wystarczającym białku BCAA zwykle mija się z celem.',
    sections: [
        { h2: 'EAA vs BCAA', p: 'Do syntezy mięśni potrzeba wszystkich aminokwasów egzogennych (EAA). Same BCAA bez reszty nie zbudują mięśni — brakuje materiału.' },
        { h2: 'Kiedy BCAA ma sens', p: 'Praktycznie rzadko. Jeśli jesz 1,6–2,2 g białka/kg z pełnowartościowych źródeł, dodatkowe BCAA to strata pieniędzy.' },
        { h2: 'Co robić zamiast', p: 'Policz białko i dopiero ewentualnie uzupełnij EAA lub po prostu shake białkowy, gdy nie masz czasu na posiłek.' }
    ],
    bullets: [
        '<strong>Białko:</strong> najpierw domknij dietę.',
        '<strong>BCAA:</strong> zwykle zbędne przy diecie.',
        '<strong>EAA:</strong> lepsze od samych BCAA.',
    ],
    uwaga: 'Aminokwasy w proszku nie działają magicznie — to tylko rozłożone białko. Sycący posiłek zrobi więcej i taniej niż saszetka BCAA.',
    coDalej: 'Zobacz <a href="leucyna-prog-anaboliczny">próg anaboliczny</a> i <a href="ile-bialka-na-dzien">ile białka dziennie</a>.'
});
defs.push({
    slug: 'cytrulina-i-pompa-miesniowa',
    emoji: '💥',
    title: 'Cytrulina — pompa i wydolność',
    subtitle: 'Czy pre-workouty z cytruliną faktycznie poprawiają trening i pompę mięśniową.',
    meta: 'Cytrulina i pompa mięśniowa: działanie, dawkowanie i czy ma sens.',
    crumb: 'Cytrulina',
    category: 'cwiczenia',
    relatedHtml: '<a href="beta-alanina-mrowienie">beta-alanina</a> · <a href="kofeina-dawka-i-timing">kofeina</a> · <a href="artykuly">artykuły</a>',
    lead: 'Cytrulina podnosi tlenek azotu i rozszerza naczynia, poprawiając „pompę” i opóźniając zmęczenie. Efekt jest umiarkowany, ale realny.',
    sections: [
        { h2: 'Jak działa', p: 'Cytrulina → arginina → tlenek azotu, który rozkurcza naczynia. Większy napływ krwi daje pompatyczną pełnię mięśni podczas treningu.' },
        { h2: 'Efekt na trening', p: 'W badaniach zmniejsza zmęczenie i może podnosić liczbę powtórzeń, zwłaszcza z użyciem cytrynianu (ok. 6–8 g) albo jabłczanu cytruliny.' },
        { h2: 'Dawkowanie', p: 'Cytrynian cytruliny ok. 6–8 g przed treningiem, jabłczan (2:1) ok. 8–10 g. Efekt przychodzi po 30–60 min.' }
    ],
    bullets: [
        '<strong>Dawka:</strong> 6–8 g przed treningiem.',
        '<strong>Pompa:</strong> realna, ale nie cud.',
        '<strong>Nie ma:</strong> ona nie buduje mięśni sama.',
    ],
    uwaga: 'Pompa to chwilowy efekt kosmetyczny — nie myl go z budowaniem mięśni. Cytrulina to dodatek, nie fundament treningu.',
    coDalej: 'Zobacz <a href="beta-alanina-mrowienie">beta-alaninę</a> i <a href="kofeina-dawka-i-timing">kofeinę</a>.'
});
defs.push({
    slug: 'kurcze-miesni-co-pomaga',
    emoji: '⚡',
    title: 'Skurcze mięśni — co naprawdę pomaga',
    subtitle: 'Magnez, sól, nawodnienie — co ma sens przy skurczach, a co to mit.',
    meta: 'Skurcze mięśni: przyczyny i co naprawdę pomaga (nawodnienie, elektrolity, rozciąganie).',
    crumb: 'Skurcze mięśni',
    category: 'cwiczenia',
    relatedHtml: '<a href="elektrolity-co-i-kiedy">elektrolity</a> · <a href="magnez-i-sen-skurcze">magnez</a> · <a href="artykuly">artykuły</a>',
    lead: 'Skurcze to gwałtowny, bolesny spazm mięśnia. Winą najczęściej nie jest „brak magnezu”, tylko zmęczenie, odwodnienie i zaburzona równowaga elektrolitów.',
    sections: [
        { h2: 'Co je powoduje', p: 'Zmęczenie mięśni, długi wysiłek w upale, utrata sodu z potem. To połączenie, nie pojedynczy niedobór jednego minerału.' },
        { h2: 'Magnez — mit czy fakt', p: 'Magnez pomaga, gdy faktycznie masz niedobór. U zdrowych osób wpływ na skurcze bywa słaby — częściej działa nawodnienie z sodem.' },
        { h2: 'Co robić', p: 'Rozciągnij spięty mięsień, masuj, pij płyny z elektrolitami przy długim wysiłku. Przed wysiłkiem nie forsuj zimnych mięśni.' }
    ],
    bullets: [
        '<strong>Przy skurczu:</strong> rozciągnięcie i masaż.',
        '<strong>Profilaktyka:</strong> nawodnienie + sód.',
        '<strong>Magnez:</strong> tylko przy niedoborze.',
    ],
    uwaga: 'Nocne skurcze łydek bywają skutkiem zmęczenia, a nie diety. Częste i silne skurcze warto skonsultować z lekarzem — to bywa objaw innego problemu.',
    coDalej: 'Zobacz <a href="magnez-i-sen-skurcze">magnez</a> i <a href="elektrolity-co-i-kiedy">kiedy elektrolity</a>.'
});
defs.push({
    slug: 'trening-silowy-kobiet-mit',
    emoji: '👩‍🦱',
    title: 'Kobiety i ciężary — mit o „męskich rękach”',
    subtitle: 'Dlaczego trening siłowy nie zrobi z ciebie „twardziela” i jak kobiety budują sylwetkę.',
    meta: 'Trening siłowy dla kobiet: dlaczego ciężary nie robią „męskiej” sylwetki i jak działają.',
    crumb: 'Kobiety i ciężary',
    category: 'cwiczenia',
    relatedHtml: '<a href="miesnie-a-spalanie-w-spoczynku">mięśnie</a> · <a href="jak-zaczac-silownie-od-zera">jak zacząć</a> · <a href="artykuly">artykuły</a>',
    lead: 'Strach, że ciężary zrobią z kobiety „kulturystkę”, jest bezpodstawny — poziom testosteronu u kobiet jest wielokrotnie niższy niż u mężczyzn.',
    sections: [
        { h2: 'Dlaczego nie „urosną”', p: 'Budowa dużej masy wymaga dużo testosteronu, którego kobiety mają mało. Trening siłowy kształtuje i ujędrnia, nie robi „męskich” ramion.' },
        { h2: 'Co daje', p: 'Spala tłuszcz, buduje gestość kości chroniącą przed osteoporozą i modeluje sylwetkę. Efekt to jędrność, nie kark.' },
        { h2: 'Jak trenować', p: 'Tak samo jak mężczyźni: ćwiczenia złożone, progresja ciężaru. Nie musisz używać różowych hantli — ciężar dobieraj po powtórzeniach.' }
    ],
    bullets: [
        '<strong>Ciężary:</strong> nie robią „męskiej” sylwetki.',
        '<strong>Kości:</strong> siłownia chroni gęstość.',
        '<strong>Progresja:</strong> jak u mężczyzn, nie bój się kg.',
    ],
    uwaga: 'Szybki „przyrost masy” u kobiet to najczęściej retencja wody i glikogenu, nie mięśnie. To minie po adaptacji — nie rezygnuj.',
    coDalej: 'Zobacz <a href="jak-zaczac-silownie-od-zera">jak zacząć siłownię</a> i <a href="miesnie-a-spalanie-w-spoczynku">mięśnie a metabolizm</a>.'
});
defs.push({
    slug: 'kalistenika-trening-z-masa-ciala',
    emoji: '🤸‍♂️',
    title: 'Kalistenika — trening z własnym ciężarem',
    subtitle: 'Pompki, dipsy, przysiady — jak budować siłę i mięśnie bez żadnego sprzętu.',
    meta: 'Kalistenika: trening z masą ciała, progresja i jak budować mięśnie bez sprzętu.',
    crumb: 'Kalistenika',
    category: 'cwiczenia',
    relatedHtml: '<a href="podciaganie-na-drazku-plan">podciąganie</a> · <a href="trening-w-domu-bez-sprzetu-plan">trening w domu</a> · <a href="artykuly">artykuły</a>',
    lead: 'Kalistenika buduje siłę i mięśnie samym ciężarem ciała — pod warunkiem, że stosujesz progresję, a nie robisz w kółko 50 pompek.',
    sections: [
        { h2: 'Czy buduje mięśnie', p: 'Tak. Klucz to progresja trudności: pompki zwykłe → wąskie → na poręczach → z obciążeniem. Mięśnie rosną, gdy z czasem dajesz im więcej oporu.' },
        { h2: 'Fundament', p: 'Przysiady, wykroki, pompki, dipsy, podciągania, deska. Z nich zbudujesz trening całościowy bez jednego kilograma sprzętu.' },
        { h2: 'Progresja', p: 'Zwiększaj trudność dźwigni (uniesione nogi, jedna ręka), liczbę powtórzeń i czas napięcia. Możesz też dokładać plecak z książkami.' }
    ],
    bullets: [
        '<strong>Baza:</strong> pompki, dipsy, przysiady, deska.',
        '<strong>Progresja:</strong> trudniejsze warianty.',
        '<strong>Obciążenie:</strong> plecak jako dodatek.',
    ],
    uwaga: 'Górna część ciała szybko „wyrasta” z podstawowych pompek — bez dokładania trudności postój na plateau. Plan progresji to podstawa.',
    coDalej: 'Zobacz <a href="podciaganie-na-drazku-plan">plan podciągnięć</a> i <a href="trening-w-domu-bez-sprzetu-plan">trening w domu</a>.'
});
defs.push({
    slug: 'trening-w-domu-bez-sprzetu-plan',
    emoji: '🏠',
    title: 'Trening w domu — plan bez sprzętu',
    subtitle: 'Pełnowartościowy obwód na całe ciało, który zrobisz w salonie w 20–30 minut.',
    meta: 'Trening w domu bez sprzętu: gotowy obwód na całe ciało i progresja.',
    crumb: 'Trening w domu',
    category: 'cwiczenia',
    relatedHtml: '<a href="kalistenika-trening-z-masa-ciala">kalistenika</a> · <a href="rozgrzewka-czym-i-jak">rozgrzewka</a> · <a href="artykuly">artykuły</a>',
    lead: 'Nie potrzebujesz siłowni, by się ruszyć — obwód z własnym ciężarem angażuje całe ciało i da się go zrobić między spotkaniami.',
    sections: [
        { h2: 'Obwód', p: 'Przysiady, pompki, wykroki, dipsy na krześle, deska, mostki biodrowe. Po 30–45 s pracy z krótką przerwą, 3–4 rundy.' },
        { h2: 'Progresja', p: 'Zwiększaj rundy, skracaj przerwy lub utrudniaj warianty (pompki z uniesionymi nogami). Bez progresji zatrzymasz się w miejscu.' },
        { h2: 'Zasady', p: 'Zrób 5-minutową rozgrzewkę i kończ lekkim rozciągnięciem. Regularność 3–4× w tygodniu bije okazjonalne maratony.' }
    ],
    bullets: [
        '<strong>Obwód:</strong> 6 ćwiczeń, 3–4 rundy.',
        '<strong>Progresja:</strong> rundy, przerwy, warianty.',
        '<strong>3–4×/tydz:</strong> regularnie.',
    ],
    uwaga: 'Domowy trening bez obciążeń ogranicza górną część ciała — po pewnym czasie dodaj plecak lub gumy, żeby dalej rosnąć.',
    coDalej: 'Zobacz <a href="kalistenika-trening-z-masa-ciala">kalistenikę</a> i <a href="rozgrzewka-czym-i-jak">rozgrzewkę</a>.'
});
defs.push({
    slug: 'deload-kiedy-i-jak',
    emoji: '🛑',
    title: 'Deload — kiedy i jak zrobić tydzień lżej',
    subtitle: 'Planowe odciążenie treningu: po co, kiedy i ile razy w roku.',
    meta: 'Deload: co to, kiedy zrobić tydzień odciążenia i jak poprawia postęp.',
    crumb: 'Deload',
    category: 'cwiczenia',
    relatedHtml: '<a href="overtraining-przetrenowanie-objawy">przetrenowanie</a> · <a href="regeneracja-szybka-co-dziala">regeneracja</a> · <a href="artykuly">artykuły</a>',
    lead: 'Deload to planowe zmniejszenie obciążenia lub objętości na tydzień, żeby dać ciału odsapnąć i wrócić mocniejszym. To nie lenistwo — to strategia.',
    sections: [
        { h2: 'Po co', p: 'Kumulujące się zmęczenie ukrywa formę. Tydzień lżej pozwala zregenerować stawy, układ nerwowy i wrócić do progresji.' },
        { h2: 'Kiedy', p: 'Co 4–8 tygodni intensywnego treningu, gdy siła staje w miejscu lub czujesz się stale rozbity. Początkujący rzadziej, zaawansowani częściej.' },
        { h2: 'Jak', p: 'Zostaw te same ćwiczenia, ale obniż ciężar o 40–50% albo serię i powtórzenia. Tydzień spokojniejszego treningu, nie tydzień kanapy.' }
    ],
    bullets: [
        '<strong>Co 4–8 tyg:</strong> tydzień odciążenia.',
        '<strong>Jak:</strong> 40–50% mniejszy ciężar.',
        '<strong>Efekt:</strong> wracasz silniejszy.',
    ],
    uwaga: 'Nie myl deload z wymówką. To zaplanowana część programu, nie „dziś odpuszczam”. Po deloadie wróć do normalnych ciężarów.',
    coDalej: 'Zobacz <a href="overtraining-przetrenowanie-objawy">przetrenowanie</a> i <a href="regeneracja-szybka-co-dziala">regenerację</a>.'
});
defs.push({
    slug: 'overtraining-przetrenowanie-objawy',
    emoji: '🔋',
    title: 'Przetrenowanie — objawy i co zrobić',
    subtitle: 'Jak odróżnić zwykłe zmęczenie od zespołu przetrenowania i jak z niego wyjść.',
    meta: 'Przetrenowanie: objawy, przyczyny i ile odpoczynku potrzeba, by wrócić do formy.',
    crumb: 'Przetrenowanie',
    category: 'cwiczenia',
    relatedHtml: '<a href="deload-kiedy-i-jak">deload</a> · <a href="regeneracja-szybka-co-dziala">regeneracja</a> · <a href="artykuly">artykuły</a>',
    lead: 'Zespół przetrenowania to coś więcej niż „dziś mi się nie chce” — to przewlekłe zmęczenie fizyczne i psychiczne mimo treningu.',
    sections: [
        { h2: 'Objawy', p: 'Spadek siły, zły sen, drażliwość, brak motywacji, częstsze infekcje, bóle mięśni. Ciało nie nadąża z regeneracją.' },
        { h2: 'Przyczyny', p: 'Za dużo objętości i intensywności przy zbyt małej ilości snu, kalorii i dni lekkich. Trening stał się stresem, nie bodźcem.' },
        { h2: 'Co robić', p: 'Zredukuj objętość o połowę albo zrób pełny tydzień lekkich dni, popraw sen i jedzenie. W skrajnych przypadkach odpoczynek jest jedynym lekiem.' }
    ],
    bullets: [
        '<strong>Znaki:</strong> spadek siły, zły sen, brak chęci.',
        '<strong>Lek:</strong> mniej treningu, więcej snu i kcal.',
        '<strong>Zapobiegaj:</strong> planuj deloady i dni lekkie.',
    ],
    uwaga: 'Prawdziwy zespół przetrenowania rozwija się tygodniami. Jeśli objawy nie mijają po 1–2 tygodniach odpoczynku, skonsultuj się z lekarzem.',
    coDalej: 'Zobacz <a href="deload-kiedy-i-jak">deload</a> i <a href="regeneracja-szybka-co-dziala">regenerację</a>.'
});
defs.push({
    slug: 'zakres-ruch-rom-pelny',
    emoji: '📏',
    title: 'Zakres ruchu — pełny czy skrócony?',
    subtitle: 'Czy półprzysiady i „pliki” budują mięśnie, czy pełen zakres ruchu to podstawa.',
    meta: 'Zakres ruchu (ROM): czy pełen zakres buduje więcej mięśni i siły niż skrócony.',
    crumb: 'Zakres ruchu',
    category: 'cwiczenia',
    relatedHtml: '<a href="tempo-treningu-tut">tempo</a> · <a href="przysiad-technika-bezpiecznie">przysiad</a> · <a href="artykuly">artykuły</a>',
    lead: 'Pełny zakres ruchu (ROM) zwykle stymuluje więcej mięśni niż półruchy — zwłaszcza w rozciągniętej pozycji mięśnia.',
    sections: [
        { h2: 'Pełny ROM', p: 'Dłuższa droga = większe napięcie w rozciągniętym mięśniu, co sprzyja hipertrofii. Przysiad do pełnego zakresu buduje więcej niż „pliki”.' },
        { h2: 'Skrócony ROM', p: 'Ma sens w konkretnych celach (część ruchu, blokady), ale jako baza wypada gorzej. Ciężar „na pół” często myli siłę z egotrolem.' },
        { h2: 'Praktyka', p: 'Wybieraj tak głęboki zakres, na jaki pozwala mobilność bez bólu. Pełny ROM przy niższym ciężarze bije półzakres przy większym.' }
    ],
    bullets: [
        '<strong>Pełny ROM:</strong> więcej bodźca na wzrost.',
        '<strong>Rozciągnięta pozycja:</strong> szczególnie cenna.',
        '<strong>Bez bólu:</strong> zakres do granicy mobilności.',
    ],
    uwaga: 'Nie myl pełnego zakresu z wymuszaniem głębokości, której twoje stawy nie znoszą. Granica to bezbolesna mobilność, nie ego.',
    coDalej: 'Zobacz <a href="tempo-treningu-tut">tempo treningu</a> i <a href="przysiad-technika-bezpiecznie">przysiad</a>.'
});
defs.push({
    slug: 'tempo-treningu-tut',
    emoji: '⏱️',
    title: 'Tempo ćwiczeń (TUT) — czy wolniej znaczy lepiej',
    subtitle: 'Time under tension i dlaczego super wolne tempo nie buduje więcej mięśni.',
    meta: 'Tempo ćwiczeń i TUT: czy wolne powtórzenia budują więcej mięśni niż normalne.',
    crumb: 'Tempo ćwiczeń (TUT)',
    category: 'cwiczenia',
    relatedHtml: '<a href="zakres-ruch-rom-pelny">zakres ruchu</a> · <a href="superserie-i-drop-sety">superserie</a> · <a href="artykuly">artykuły</a>',
    lead: 'Czas pod napięciem (TUT) ma znaczenie, ale ekstremalnie wolne tempo nie buduje więcej mięśni — a często je ogranicza, bo musisz użyć mniejszego ciężaru.',
    sections: [
        { h2: 'Co to TUT', p: 'Łączny czas, w którym mięsień pracuje w serii. Zwykłe tempo 2–3 s w fazie ekscentrycznej to w większości wystarczające «napięcie».' },
        { h2: 'Wolne = lepsze?', p: 'Nie. Klucz to zbliżanie się do porażki, a nie sekundy. Bardzo wolne tempo zmusza do odjęcia ciężaru, co obniża stymulację.' },
        { h2: 'Praktyka', p: 'Kontroluj fazę opuszczania (2–3 s), a w górę ruszaj dynamicznie. Umiarkowane tempo + odpowiedni ciężar to najlepszy przepis.' }
    ],
    bullets: [
        '<strong>Ekscentryka:</strong> 2–3 s kontroli.',
        '<strong>Koncentryka:</strong> dynamicznie, ale pewnie.',
        '<strong>Ważniejsze:</strong> ciężar i bliskość porażki.',
    ],
    uwaga: 'Super wolne tempo bywa używane, gdy chcesz odciążyć staw lub lepiej poczuć mięsień — ale jako baza treningu to kiepski wybór.',
    coDalej: 'Zobacz <a href="zakres-ruch-rom-pelny">zakres ruchu</a> i <a href="rir-czy-trening-do-upadku">RIR</a>.'
});
defs.push({
    slug: 'superserie-i-drop-sety',
    emoji: '♻️',
    title: 'Superserie i drop sety — oszczędność czasu',
    subtitle: 'Techniki przyspieszające trening: jak je stosować bez rozwalenia progresji.',
    meta: 'Superserie i drop sety: co to, jak działa i kiedy je stosować.',
    crumb: 'Superserie i drop sety',
    category: 'cwiczenia',
    relatedHtml: '<a href="tempo-treningu-tut">tempo</a> · <a href="ile-serii-na-grupe-tygodniowo">ile serii</a> · <a href="artykuly">artykuły</a>',
    lead: 'Superserie i drop sety skracają trening i pozwalają dobić zmęczenie w krótkim czasie — ale to przyprawa, nie danie główne.',
    sections: [
        { h2: 'Superserie', p: 'Dwa ćwiczenia pod rząd bez przerwy. Wersja na przeciwne mięśnie (klatka + plecy) oszczędza czas i nie obniża jakości jak na te same.' },
        { h2: 'Drop sety', p: 'Po serii do zbliżenia do porażki natychmiast zmniejszasz ciężar i robisz kolejne. Dobrze „domykają” objętość na końcu treningu.' },
        { h2: 'Kiedy', p: 'Gdy masz mało czasu lub chcesz dodać intensywności na koniec. Nie rób z nich całego planu — bazą zostają normalne serie z progresją.' }
    ],
    bullets: [
        '<strong>Superserie:</strong> przeciwne grupy, bez przerwy.',
        '<strong>Drop set:</strong> na koniec, po porażce.',
        '<strong>Baza:</strong> normalne serie z progresją.',
    ],
    uwaga: 'Techniki przyspieszające podnoszą zmęczenie — nadużywane skracają regenrację i obniżają ciężary w seriach głównych. Umiar.',
    coDalej: 'Zobacz <a href="tempo-treningu-tut">tempo</a> i <a href="ile-serii-na-grupe-tygodniowo">objętość</a>.'
});
defs.push({
    slug: 'hiit-krotkie-i-intensywne',
    emoji: '⚡',
    title: 'HIIT — krótko i intensywnie',
    subtitle: 'Protokół interwałowy na 15–20 minut, który poprawi kondycję bez godzin cardio.',
    meta: 'HIIT: protokół interwałowy, ile trwa i jak go robić bezpiecznie.',
    crumb: 'HIIT',
    category: 'cwiczenia',
    relatedHtml: '<a href="cardio-liss-vs-hiit">LISS vs HIIT</a> · <a href="epoc-trening-a-spalanie-po">EPOC</a> · <a href="artykuly">artykuły</a>',
    lead: 'HIIT to naprzemienne krótkie sprinty i odpoczynek. W 15–20 minut da ci tyle pracy serca, co dłuższa sesja spokojnego cardio.',
    sections: [
        { h2: 'Protokół', p: 'Np. 20 s maksymalnego wysiłku / 40 s truchtu, 6–8 powtórzeń. Albo 30/30. Dostosuj stosunek pracy do przerwy do swojej formy.' },
        { h2: 'Dla kogo', p: 'Dla zdrowych, chcących poprawić kondycję szybko. Wymaga intensywności bliskiej maksimum — inaczej to zwykłe cardio.' },
        { h2: 'Częstotliwość', p: '1–2× w tygodniu. Za częsty HIIT podkrada regenerację z treningu siłowego i zwiększa ryzyko przeciążenia.' }
    ],
    bullets: [
        '<strong>Protokół:</strong> np. 20 s pracy / 40 s przerwy.',
        '<strong>6–8 interwałów:</strong> po rozgrzewce.',
        '<strong>1–2×/tydz:</strong> nie więcej.',
    ],
    uwaga: 'HIIT „na czczo” albo przy chorobie serca to zły pomysł. Rozgrzej się dobrze i nie wrzucaj maksa, jeśli wracasz po przerwie.',
    coDalej: 'Zobacz <a href="cardio-liss-vs-hiit">LISS vs HIIT</a> i <a href="epoc-trening-a-spalanie-po">EPOC</a>.'
});
defs.push({
    slug: 'bol-plecow-trening-silowy',
    emoji: '🩹',
    title: 'Ból pleców a trening siłowy',
    subtitle: 'Czy przy bólu krzyża ćwiczyć, czy leżeć — co mówi współczesna nauka o bólu.',
    meta: 'Ból pleców a trening siłowy: czy ćwiczenia pomagają i jak wracać do formy.',
    crumb: 'Ból pleców a trening',
    category: 'cwiczenia',
    relatedHtml: '<a href="martwy-ciag-technika">martwy ciąg</a> · <a href="mobilnosc-vs-rozciaganie">mobilność</a> · <a href="artykuly">artykuły</a>',
    lead: 'Przy nieswoistym bólu krzyża najlepszym „lekiem” jest stopniowy ruch i wzmacnianie, a nie tygodnie leżenia w łóżku.',
    sections: [
        { h2: 'Ruch zamiast bezruchu', p: 'Większość bólów pleców jest „nieswoista” — nie groźna. Delikatny ruch, spacery i stopniowe obciążanie realnie zmniejszają ból.' },
        { h2: 'Trening siłowy', p: 'Wzmocnienie rdzenia, pośladków i pleców (wiosłowania, martwy ciąg w dobranej dawce) chroni przed nawrotami. Strach przed ruchem jest gorszy niż sam ruch.' },
        { h2: 'Jak wracać', p: 'Zacznij od lekkich, bezbolesnych wariantów i stopniowo dokładaj. Jeśli ból promieniuje do nogi albo nie mija — idź do fizjoterapeuty lub lekarza.' }
    ],
    bullets: [
        '<strong>Ruch:</strong> spacer i lekki trening.',
        '<strong>Wzmacniaj:</strong> rdzeń, pośladki, plecy.',
        '<strong>Stopniowo:</strong> bezbolesne obciążenie.',
    ],
    uwaga: 'Ból promieniujący do nogi, drętwienie lub utrata siły to czerwone flagi — nie „przeklekuj”, tylko zgłoś się do specjalisty.',
    coDalej: 'Zobacz <a href="martwy-ciag-technika">technikę martwego ciągu</a> i <a href="mobilnosc-vs-rozciaganie">mobilność</a>.'
});
defs.push({
    slug: 'przysiad-a-bol-kolan',
    emoji: '🦵',
    title: 'Przysiad a ból kolan — co robić',
    subtitle: 'Czy kucanie niszczy kolana i jak trenować nogi, gdy przednie kolano boli.',
    meta: 'Przysiad a ból kolan: przyczyny, jak dostosować technikę i kiedy zejść z obciążenia.',
    crumb: 'Przysiad a kolana',
    category: 'cwiczenia',
    relatedHtml: '<a href="przysiad-technika-bezpiecznie">technika przysiadu</a> · <a href="mobilnosc-vs-rozciaganie">mobilność</a> · <a href="artykuly">artykuły</a>',
    lead: 'Przysiad sam w sobie nie „niszczy” kolan. Ból z przodu kolana najczęściej bierze się z przeciążenia, słabej kontroli lub skoku objętości.',
    sections: [
        { h2: 'Skąd ból', p: 'Zbyt szybki wzrost ciężaru, zła mechanika (kolana uciekające do środka), słabe biodra i pośladki. Rzadko to „uszkodzenie”, częściej przeciążenie.' },
        { h2: 'Dostosuj technikę', p: 'Pilnuj kolan w linii stóp, obniż głębokość do bezbolesnej, wzmacniaj pośladki i łydki. Często pomaga lekko szersza postawa.' },
        { h2: 'Kiedy przestać', p: 'Ostry, strzelający ból, obrzęk lub niestabilność to sygnał do przerwy i wizyty u fizjoterapeuty — nie „dokręcania” kolana bandażem.' }
    ],
    bullets: [
        '<strong>Najczęściej:</strong> przeciążenie, nie uszkodzenie.',
        '<strong>Popraw:</strong> kolana w linii, mniej ciężaru.',
        '<strong>Czerwone flagi:</strong> obrzęk, ostry ból.',
    ],
    uwaga: 'Bezbolesny, stały trening z rozsądną progresją jest dla kolan zwykle dobroczynny. Unikanie ruchu ze strachu bywa gorsze.',
    coDalej: 'Zobacz <a href="przysiad-technika-bezpiecznie">technikę przysiadu</a> i <a href="mobilnosc-vs-rozciaganie">mobilność</a>.'
});
defs.push({
    slug: 'sila-chwytu-grip',
    emoji: '🤲',
    title: 'Siła chwytu — grip i zdrowie',
    subtitle: 'Dlaczego mocny uścisk to więcej niż martwy ciąg — i jak go trenować.',
    meta: 'Siła chwytu: dlaczego jest ważna dla zdrowia i jak ją trenować.',
    crumb: 'Siła chwytu',
    category: 'cwiczenia',
    relatedHtml: '<a href="martwy-ciag-technika">martwy ciąg</a> · <a href="podciaganie-na-drazku-plan">podciąganie</a> · <a href="artykuly">artykuły</a>',
    lead: 'Siła chwytu koreluje z ogólnym zdrowiem i sprawnością w starszym wieku — a przy okazji jest limiterem w martwym ciągu i podciąganiach.',
    sections: [
        { h2: 'Dlaczego ważna', p: 'Badania wiążą słabszy chwyt z wyższym ryzykiem niesprawności i chorób z wiekiem. To prosty wskaźnik ogólnej siły i rezerw.' },
        { h2: 'Jak ją budować', p: 'Ciężkie wiosłowania i martwy ciąg bez pasków, zwisy na drążku, przenoszenie ciężkich rzeczy (farmer carry). Najlepiej naturalnym ruchem.' },
        { h2: 'Paski czy nie', p: 'Pasków używaj tylko, gdy chwyt limituje serię grzbietu. Na co dzień trenuj bez nich, żeby nie zostawić dłoni w tyle.' }
    ],
    bullets: [
        '<strong>Naturalnie:</strong> zwisy, noszenie ciężarów.',
        '<strong>Bez pasków:</strong> głównie bez wspomagania.',
        '<strong>Regularnie:</strong> chwyt rośnie powoli.',
    ],
    uwaga: 'Nie rób z chwytu obsesji — to dodatek do siły ogólnej. Jeśli stale wymaga pasków, to znak, że warto chwyt wręcz wzmacniać osobno.',
    coDalej: 'Zobacz <a href="martwy-ciag-technika">martwy ciąg</a> i <a href="podciaganie-na-drazku-plan">podciąganie</a>.'
});
defs.push({
    slug: 'mobilnosc-vs-rozciaganie',
    emoji: '🤸',
    title: 'Mobilność — różnica od rozciągania',
    subtitle: 'Zakres ruchu, kontrola i stabilność: czym jest mobilność i jak ją poprawiać.',
    meta: 'Mobilność vs rozciąganie: czym się różnią i jak poprawić zakres ruchu w stawach.',
    crumb: 'Mobilność vs rozciąganie',
    category: 'cwiczenia',
    relatedHtml: '<a href="stretching-silny-czy-bez">stretching</a> · <a href="zakres-ruch-rom-pelny">zakres ruchu</a> · <a href="artykuly">artykuły</a>',
    lead: 'Elastyczność to długość mięśnia, a mobilność to zdolność do aktywnej pracy w pełnym zakresie — z kontrolą i siłą.',
    sections: [
        { h2: 'Różnica', p: 'Możesz być „gibki” (statycznie długa) i mieć kiepską mobilność, bo nie panujesz nad zakresem. Mobilność = elastyczność + siła + kontrola.' },
        { h2: 'Dlaczego ważna', p: 'Wpływa na głębokość przysiadu, technikę martwego ciągu i ryzyko przeciążeń. Bez mobilności „gibkość” nie przekłada się na trening.' },
        { h2: 'Jak poprawiać', p: 'Dynamiczna praca w pełnym zakresie, kontrolowane głębokie pozycje (np. asian squat), ćwiczenia stawów. Sam statyczny stretching nie wystarczy.' }
    ],
    bullets: [
        '<strong>Mobilność:</strong> zakres + kontrola + siła.',
        '<strong>Praca:</strong> dynamiczna, w pełnym zakresie.',
        '<strong>Najlepsze:</strong> głębokie pozycje i powtórzenia.',
    ],
    uwaga: 'Nie musisz być „elastyczny jak przyrząd gimnastyczny” — wystarczy mobilność do własnych ćwiczeń. Celuj w funkcję, nie w szpagat.',
    coDalej: 'Zobacz <a href="stretching-silny-czy-bez">stretching</a> i <a href="zakres-ruch-rom-pelny">zakres ruchu</a>.'
});
defs.push({
    slug: 'jak-mierzyc-postep-bez-wagi',
    emoji: '📐',
    title: 'Jak mierzyć postęp bez wagi',
    subtitle: 'Wymiary, zdjęcia i siła — lepsze wskaźniki niż liczba na wadze.',
    meta: 'Mierzenie postępu bez wagi: wymiary, zdjęcia i wskaźniki siłowe.',
    crumb: 'Postęp bez wagi',
    category: 'cwiczenia',
    relatedHtml: '<a href="dlaczego-waga-skacze-o-2kg">waga skacze</a> · <a href="dlaczego-waga-stoi-pomimo-diety">waga stoi</a> · <a href="artykuly">artykuły</a>',
    lead: 'Waga potrafi kłamać — woda, mięśnie i glikogen ją zaburzają. Lepsze wskaźniki to wymiary, zdjęcia i rosnąca siła.',
    sections: [
        { h2: 'Wymiary i zdjęcia', p: 'Centymetr w talii i biodrach oraz zdjęcia (ta sama pora, światło, poza) pokazują kompozycję ciała lepiej niż waga.' },
        { h2: 'Siła', p: 'Rosnące obciążenia i powtórzenia to obiektywny znak postępu. Jeśli ciężar idzie w górę, idziesz w dobrą stronę, nawet gdy waga stoi.' },
        { h2: 'Jak robić', p: 'Mierz się raz w tygodniu, rano, po toalecie. Waga to tylko jeden punkt danych — patrz na trend tygodni, nie na pojedynczy skok.' }
    ],
    bullets: [
        '<strong>Wymiary:</strong> talia, biodra, raz w tygodniu.',
        '<strong>Zdjęcia:</strong> stałe warunki.',
        '<strong>Siła:</strong> ciężary i powtórzenia w górę.',
    ],
    uwaga: 'Jedna metryka nigdy nie opisze postępu. Dopiero combo waga + wymiary + siła + zdjęcia daje rzetelny obraz, co naprawdę się zmienia.',
    coDalej: 'Zobacz <a href="dlaczego-waga-skacze-o-2kg">czemu waga skacze</a> i <a href="dlaczego-waga-stoi-pomimo-diety">czemu waga stoi</a>.'
});

const articles = defs.map(buildArticle);
const out = path.join(__dirname, 'hardcore-articles-batch9.json');
writeFileSync(out, JSON.stringify(articles, null, 2) + '\n');
console.log(`Zapisano ${articles.length} artykułów -> ${out}`);
