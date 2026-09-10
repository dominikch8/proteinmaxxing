/**
 * Generuje artykuły "Przy odchudzaniu" dla 20 popularnych leków psychiatrycznych.
 * Produkuje scripts/hardcore-articles-leki.json dla build-hardcore-articles.mjs.
 * node scripts/build-leki-articles.mjs
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function tableHtml(opie) {
    const rows = [
        ['Wpływ na apetyt', opie.appetite],
        ['Wpływ na metabolizm', opie.metabolism],
        ['Orientacyjna zmiana wagi po 2–3 mies.', opie.weight],
        ['Najważniejsza zasada w redukcji', opie.hack]
    ];
    const trs = rows
        .map(([k, v]) => `                        <tr><th>${k}</th><td>${v}</td></tr>`)
        .join('\n');
    return `                <div class="poradnik-table-wrap">
                    <table class="poradnik-intake-table">
                        <thead>
                            <tr><th>Co sprawdzamy</th><th>Wartość orientacyjna</th></tr>
                        </thead>
                        <tbody>
${trs}
                        </tbody>
                    </table>
                    <p class="article-note">Procenty to orientacyjne uśrednienie z praktyki i badań — reakcja u Ciebie może być inna, a lek to nie suplement diety. Najpierw uzgodnij leki z lekarzem, dopiero potem licz makro.</p>
                </div>`;
}

function buildArticle(def) {
    return {
        slug: def.slug,
        emoji: def.emoji,
        title: def.title,
        subtitle: def.subtitle,
        meta: def.meta,
        crumb: def.crumb || def.title,
        category: 'leki',
        relatedHtml:
            def.relatedHtml ||
            '<a href="leki-a-redukcja">leki a redukcja</a> · <a href="deficyt-kaloryczny-praktyka">deficyt</a> · <a href="artykuly">artykuły</a>',
        bodyHtml: `<p>${def.lead}</p>

${tableHtml(def.opie)}

<h2>Co robi ten lek — krótko</h2>
<p>${def.mechanika}</p>

<h2>Jak to się ma do odchudzania</h2>
<div class="poradnik-practical-box">
<h2>Praktyczne zasady przy tym leku</h2>
<ul>
${def.zasady.map((z) => `                    <li>${z}</li>`).join('\n')}
</ul>
</div>

<h2>Na co uważać</h2>
<p>${def.uwagi}</p>

<h2>Co dalej</h2>
<p>${def.coDalej}</p>

<div class="info-warning">
Lek psychiatryczny nie jest środkiem odchudzającym. Nie zmieniaj samodzielnie dawki ani nie odstawiaj leku — nagłe odstawienie większości leków z tej listy grozi nawrotem objawów i działaniami niepożądanymi. Dieta i trening idą w parze z leczeniem, a nie zamiast niego.
</div>`
    };
}

const defs = [
{
slug: 'sertralina-przy-odchudzaniu',
        emoji: '💊',
        title: 'Sertralina przy odchudzaniu',
        subtitle: 'Najczęstszy antydepresant z grupy SSRI. Czy utrudnia utratę wagi?',
        meta: 'Sertralina a odchudzanie: wpływ na apetyt, metabolizm, wagę i praktyczne zasady diety redukcyjnej.',
        lead: 'Sertralina najbardziej przepisywana SSRI w Polsce. Dobre wieści: nie "wyłącza" metabolizmu i zwykle nie powoduje szybkiego tycia. Wpływa przede wszystkim na apetyt — a ten można ogarnąć dietą z białkiem.',
        opie: {
            appetite: '0%…−10% (u nielicznych +)',
            metabolism: '0% (neutralnie)',
            weight: 'zwykle 0…+1,5 kg, część osób traci',
            hack: 'jedz białko w każdym posiłku i raz w tygodniu waż się, nie codziennie'
        },
        mechanika: 'Sertralina blokuje wychwyt serotoniny. Serotonina odpowiada za nastrój i głód — dlatego na starcie część osób je mniej, a część zgłasza kompulsy słodkie. Nie "wyhamowania spalania": wydatek energetyczny się nie zmienia. Duże przybory wagi na sertralinie zwykle wynikają ze spadku aktywności i objadania, nie samego leku.',
        zasady: [
            '<strong>Białko 1,6–2,2 g/kg</strong> — u stabilizuje węglę glukozy i tnie napady słodkie.',
            '<strong>Biblioteka objętościowa</strong> — warzywa i zupy na bazie (volumizing) redukują ochotę na dorzucanie.',
            '<strong>Nie odcinać węglowodanów nagle</strong> — serotonina lubi węgle; zostaw 40–45% kalorii, nie zeruj.',
            '<strong>Medium kroki 7000+</strong> — aktywność codziennie zamiast epickich cudów weekendowo.'
        ],
        uwagi: 'Na pierwsze 2 tygodnie część osób odcz kołatania, mniejszą apetyt lub mdłości — pojędkowe, zwykle przechodzenia. Prawdziwe czerwone światło: skoki wagi >2 kg/mies. bez zmiany diety. Wtedy do psychiatry (rzadko, ale lek sprawa).',
        coDalej: 'Rób fotki i ciuchy, nie tylko wagę. Na sertraline schudniesz tak samo, jak na tego nastrój pozwoli.',
        related: 'deficyt-kaloryczny-praktyka'
    },
    {
        slug: 'escitalopram-przy-odchudzaniu',
        emoji: '🌅',
        title: 'Escitalopram przy odchudzaniu',
        subtitle: 'SSRI o łagodnym profilu apetytu. Dlaczego rzadko psuje redukcję?',
        meta: 'Escitalopram a odchudzanie: apatyt, metabolizm, zmiana wagi i praktyczne zalecenia.',
        lead: 'Escitalopram (marki typu Lexapro generiki) to jeden z lepiej tolerowanych SSRI — wpływ na apetyt bywa minimalny, a duża część pacjentów utrzymuje wagę albo trapez. To dobry kandydat do zbudowania redukcji bez terroru głodu.',
        opie: {
            appetite: '−5%…+10%',
            metabolism: '0%',
            weight: 'zwykle 0…+1 kg',
            hack: 'regularność posiłków — na escitalopramie bmosti na regularne że potrafi zgubić rytm'
        },
        mechanika: 'Wybiórczo hamuje w wymianie serotoniny. W praktyce od 5–10% pacj— oraz miewa wzrost apetytu, szczegol w grupie z depresją i jedzeniem. Nie wzięto mi pod kontrolą przez-state: brak odnotowań na metabolizm.',
        zasady: [
            '<strong>Krównia stroi skład</strong> — regularnie jedz śniadania/kolacje, łapi zaczynasz nie zapominać.',
            '<strong>Redukcja z woln-ne ma być powyżej 0,5% tyg.</strong> — lek może delikatzniele, spokojnie nie żeńska.',
            '<strong>Loguj w JAKOṢCI</strong> — nie tylko ktoś kalorii; eskitala często "czyści" od pierwszego miesiąca apetit.'
        ],
        uwagi: 'Na starcie możesz poczuć dziurowcie żołądka lub spadek łaknienia — do 2 tyg. Przeszkodoże: mdłości na pustą zmianę samodzielnie — zamiast bicie, jedz 3 mniejsze posiłki zamiast 2 dużych.',
        coDalej: 'Jeśli lek pomaga na lęki — a ten pomaga — to duży plus dla diety: mniej jedznerzenia stresem. Skorzystaj z tego.'
    },
{
        slug: 'fluoksetyna-przy-odchudzaniu',
        emoji: '🦋',
        title: 'Fluoksetyna przy odchudzaniu',
        subtitle: 'SSRI, który najczęściej zmniejsza apetyt. Co z tym zrobić na redukcji?',
        meta: 'Fluoksetyna a odchudzanie: wpływ na apetyt i wagę, kiedy pomaga, kiedy przeszkadza.',
        lead: 'Fluoksetyna (Prozac) ma opinię "chudnącego" SSRI — u części osób realnie zmniejsza łaknienie na start. To nie znaczy, że lek jest odchudzaczem; to znaczy, że masz narzędzie, z którego można mądrze skorzystać.',
        opie: {
            appetite: '−10%…−20% (pierwsze tygodnie)',
            metabolism: '0%',
            weight: 'część osób −1…−3 kg w 2–3 mies.',
            hack: 'wykorzystaj mniejszy apetyt na białkowe posiłki, nie na głodówki'
        },
        mechanika: 'Fluoksetyna ma długi czas działania i silnie wpływa na serotoninę, co u części pacjentów tłumi apetyt. Ważne: efekt mija z czasem, a ryzyko głodówek "bo nie czuję głodu" jest realne — to prosta droga do efektu jo-jo.',
        zasady: [
            '<strong>Nie głoduj, planuj</strong> — mniejszy apetyt to okazja do 3–4 białkowych posiłków, nie do pomijania.',
            '<strong>Białko 1,8–2,2 g/kg</strong> — gdy apetyt wraca, sytość trzyma Cię w deficycie.',
            '<strong>Warzywa w każdej porcji</strong> — objętość utrzymuje nawyk jedzenia bez nadmiaru kcal.',
            '<strong>Waż się co tydzień</strong> — przy szybkim spadku (ponad 1%/tydz.) dojedź więcej, nie mniej.'
        ],
        uwagi: 'Jeśli apetyt spadł tak, że zapominasz jeść — to nie sukces, tylko ryzyko. Niedobory i spadek masy mięśniowej uderzą potem rykoszetem. Zgłoś lekarzowi, gdy jesz wyraźnie poniżej 1200 kcal przez tydzień.',
        coDalej: 'Fluoksetyna bywa przepisywana też w bulimii — wtedy redukcja idzie ręka w rękę z terapią. Skorzystaj z "okna" na łaknienie, ale buduj trwałe nawyki.'
    },
    {
        slug: 'citalopram-przy-odchudzaniu',
        emoji: '🌊',
        title: 'Citalopram przy odchudzaniu',
        subtitle: 'Starszy SSRI. Czy wpływa na wagę i apetyt? Co warto wiedzieć przed dietą.',
        meta: 'Citalopram a odchudzanie: apetyt, metabolizm, zmiana wagi i praktyczne wskazówki.',
        lead: 'Citalopram to SSRI o umiarkowanym profilu — zwykle nie robi ani wielkiego głodu, ani wielkiego spadku apetytu. Dla osoby na redukcji to dobra wiadomość: lek zwykle nie przeszkadza.',
        opie: {
            appetite: '0%…+10% (sporadycznie)',
            metabolism: '0%',
            weight: 'zwykle 0…+1 kg',
            hack: 'traktuj citalopram jak neutralny — buduj dietę na białku i warzywach'
        },
        mechanika: 'Hamuje wychwyt serotoniny podobnie do escitalopramu, ale z mniejszą selektywnością. W praktyce klinicznej rzadko powoduje duże zmiany wagi; jeśli już, to łagodny wzrost apetytu u osób z tendencją do jedzenia emocjonalnego.',
        zasady: [
            '<strong>Stały rytm posiłków</strong> — citalopram lubi stabilność, a i Ty na niej zyskasz.',
            '<strong>Białko + błonnik</strong> — stabilizują poziom cukru, mniej skoków głodu.',
            '<strong>Nie porównuj się z "chudnącymi na SSRI"</strong> — reakcje są indywidualne.'
        ],
        uwagi: 'Citalopram bywa kojarzony z wydłużeniem QT — to sprawa dla lekarza, nie dla diety. Ty zajmij się tym, co kontrolujesz: kalorie, sen, ruch.',
        coDalej: 'Standardowa redukcja działa. Gdyby po 2 miesiącach waga szła w górę mimo deficytu — wróć do lekarza, czasem wystarczy zmiana dawki.'
    },
    {
        slug: 'paroksetyna-przy-odchudzaniu',
        emoji: '⚖️',
        title: 'Paroksetyna przy odchudzaniu',
        subtitle: 'SSRI, który częściej niż inne dodaje kilogramy. Jak to ograć?',
        meta: 'Paroksetyna a odchudzanie: dlaczego tyje się na paroksetynie, wpływ na apetyt i co robić.',
        lead: 'Paroksetyna (Seroxat, Paxil) to SSRI, na którym przybiera się najczęściej. To nie mit — ale da się to kontrolować, jeśli wiesz, skąd bierze się wzrost wagi.',
        opie: {
            appetite: '+10%…+20%',
            metabolism: '−5%…0% (lekko spowalnia)',
            weight: '+1…+4 kg w 2–3 mies. (jeśli bez kontroli)',
            hack: 'waż się co tydzień i reaguj na +1 kg — nie czekaj na +4'
        },
        mechanika: 'Paroksetyna ma działanie antycholinergiczne i sedacyjne, przez co część osób czuje większy apetyt (zwłaszcza na węglowodany) i mniejszą energię do ruchu. To połączenie realnie sprzyja tyciu — ale to efekt uboczny, nie wyrok.',
        zasady: [
            '<strong>Zapisz "dlaczego jem"</strong> — paroksetyna wzmacnia jedzenie emocjonalne; świadomość to połowa sukcesu.',
            '<strong>Węglowodany rozłóż na cały dzień</strong> — zamiast wieczornego ataku na słodkie.',
            '<strong>Ruch w harmonogramie</strong> — lek usypia; zaplanuj spacer/trening jak spotkanie, nie "jak się uda".',
            '<strong>Białko 2 g/kg</strong> — sytość i ochrona mięśni przy niższej aktywności.'
        ],
        uwagi: 'Jeśli waga rośnie >2 kg/mies. mimo dobrej diety, to sygnał do rozmowy z psychiatrą — bywa, że zmiana na inny SSRI rozwiązuje problem. Nie odstawiaj sam, to grozi zespołem odstawiennym.',
        coDalej: 'Paroksetyna wymaga więcej dyscypliny, ale nie jest wyrokiem. Zbuduj system (waga, kroki, białko) i trzymaj go.'
    },
{
        slug: 'wenlafaksyna-przy-odchudzaniu',
        emoji: '⛰️',
        title: 'Wenlafaksyna przy odchudzaniu',
        subtitle: 'SNRI na depresję i lęk. Często zmniejsza apetyt — jak to wykorzystać.',
        meta: 'Wenlafaksyna a odchudzanie: wpływ na apetyt, metabolizm, waga i praktyczne wskazówki.',
        lead: 'Wenlafaksyna (Efectin) działa na serotoninę i noradrenalinę. U sporej części osób tłumi apetyt i dodaje energii — to jeden z tych leków, które bywają "sprzymierzeńcem" redukcji, jeśli nie przesadzisz.',
        opie: {
            appetite: '−10%…−20%',
            metabolism: '0%…+5% (lekkie pobudzenie)',
            weight: 'część osób −1…−2 kg',
            hack: 'mniejszy apetyt wykorzystaj na białko, nie na głodówki'
        },
        mechanika: 'Noradrenalina podbija energię i czujność, serotonina stabilizuje nastrój. Efekt: mniejsza ochota na podjadanie i więcej chęci do ruchu. To realne ułatwienie — ale tylko jeśli nie zamienisz go w restrykcję.',
        zasady: [
            '<strong>3–4 posiłki białkowe</strong> — nawet bez głodu jedz, inaczej wieczorem dopadnie Cię kompuls.',
            '<strong>Wykorzystaj energię na trening</strong> — wenlafaksyna + siłownia to dobry duet.',
            '<strong>Nie odstawiaj nagle</strong> — zespół odstawienny od wenlafaksyny bywa ostry (zawroty, nudności).'
        ],
        uwagi: 'Może podbijać ciśnienie i tętno — przy intensywnym cardio obserwuj się. Jeśli apetyt zniknął całkowicie i jesz <1200 kcal, to sygnał do rozmowy, nie do świętowania.',
        coDalej: 'Z wenlafaksyną masz naturalny "boost". Zbuduj na tym rutynę: białko, trening, sen — i obserwuj trend wagi.'
    },
    {
        slug: 'duloksetyna-przy-odchudzaniu',
        emoji: '🧘',
        title: 'Duloksetyna przy odchudzaniu',
        subtitle: 'SNRI stosowany też w bólu przewlekłym. Wpływ na apetyt i wagę.',
        meta: 'Duloksetyna a odchudzanie: wpływ na apetyt, metabolizm, waga i praktyczne porady.',
        lead: 'Duloksetyna (Cymbalta) działa podobnie do wenlafaksyny, ale często jest lepiej tolerowana. U części osób lekko zmniejsza apetyt; u innych jest neutralna. Redukcja na duloksetynie jest w pełni wykonalna.',
        opie: {
            appetite: '−5%…−15%',
            metabolism: '0%',
            weight: '0…−1,5 kg',
            hack: 'regularne posiłki — nie polegaj na "braku głodu"'
        },
        mechanika: 'Blokuje wychwyt serotoniny i noradrenaliny. Przy bólu przewlekłym dodatkowo poprawia sen i samopoczucie, co pośrednio pomaga w diecie (mniej jedzenia z bólu i frustracji).',
        zasady: [
            '<strong>Jedz mimo braku apetytu</strong> — 3 posiłki z białkiem, nie czekaj na głód.',
            '<strong>Ruch łagodny, ale stały</strong> — spacery i siłownia 2–3×/tydz.',
            '<strong>Sen priorytet</strong> — przy bólu i leku sen bywa kruchy; to fundament głodu.'
        ],
        uwagi: 'Na starcie możliwe nudności i suchość w ustach — przejściowe. Przy nagłym odstawieniu mogą być objawy odstawienne, więc zmiany dawki tylko z lekarzem.',
        coDalej: 'Traktuj duloksetynę jako neutralną i buduj dietę klasycznie: deficyt, białko, warzywa, ruch.'
    },
    {
        slug: 'mirtazapina-przy-odchudzaniu',
        emoji: '😴',
        title: 'Mirtazapina przy odchudzaniu',
        subtitle: 'Lek, który realnie zwiększa apetyt. Jak nie przytyć na mirtazapinie?',
        meta: 'Mirtazapina a odchudzanie: silny wpływ na apetyt, mechanizm tycia i jak to kontrolować.',
        lead: 'Mirtazapina (Remeron) to uczciwie największe wyzwanie wagowe na tej liście — wzmaga apetyt i senność. Ale da się to ogarnąć, jeśli potraktujesz to jak plan, nie jak fatum.',
        opie: {
            appetite: '+20%…+40%',
            metabolism: '−5%…0% (sedacja = mniej ruchu)',
            weight: '+2…+6 kg w 2–3 mies. (bez kontroli)',
            hack: 'przygotuj posiłki z góry — decyzje "na głodzie" przegrywasz'
        },
        mechanika: 'Mirtazapina blokuje receptory histaminowe i serotoninowe 5-HT2, przez co silnie budzi apetyt (zwłaszcza na węglowodany) i usypia. To podwójny cios: więcej jesz i mniej się ruszasz. Efekt jest najsilniejszy na początku i przy wyższych dawkach.',
        zasady: [
            '<strong>Meal prep na 2–3 dni</strong> — gdy głód uderza, jesz to, co masz, nie to, co widzisz.',
            '<strong>Białko 2 g/kg + warzywa</strong> — maksymalna sytość za minimum kcal.',
            '<strong>Ruch rano</strong> — lek wieczorem usypia; poranny spacer/trening ratuje dzienną aktywność.',
            '<strong>Waga co tydzień</strong> — reaguj na +1 kg od razu, nie po miesiącu.',
            '<strong>Zgłoś lekarzowi przyrost >2 kg/mies.</strong> — czasem wystarczy zmiana dawki lub pory.'
        ],
        uwagi: 'Mirtazapina bywa stosowana właśnie przy bezsenności i braku apetytu (np. u osób starszych). Jeśli bierzesz ją na sen, zapytaj lekarza o najmniejszą skuteczną dawkę — im mniej, tym mniejszy głód.',
        coDalej: 'To lek wymagający, ale nie niemożliwy. System > silna wola: przygotowane jedzenie, poranny ruch, cotygodniowa waga.'
    },
{
        slug: 'bupropion-przy-odchudzaniu',
        emoji: '⚡',
        title: 'Bupropion przy odchudzaniu',
        subtitle: 'Lek, który bywa "sprzymierzeńcem" redukcji — mniejszy apetyt, więcej energii.',
        meta: 'Bupropion a odchudzanie: wpływ na apetyt, metabolizm, waga. Kiedy pomaga w redukcji.',
        lead: 'Bupropion (Wellbutrin) działa na dopaminę i noradrenalinę — u większości osób zmniejsza apetyt i dodaje energii. To jeden z leków najczęściej kojarzonych z utratą wagi. Brzmi świetnie? Tak, z jednym zastrzeżeniem: to nie jest lek odchudzający, tylko lek, który nie przeszkadza.',
        opie: {
            appetite: '−15%…−25%',
            metabolism: '0%…+5%',
            weight: 'część osób −1…−3 kg w 2–3 mies.',
            hack: 'wykorzystaj energię na trening siłowy — to najlepszy czas na budowanie nawyku'
        },
        mechanika: 'Bupropion podbija dopaminę i noradrenalinę. Efekt: mniejszy apetyt, lepsza motywacja, więcej energii. Część pacjentów chudnie bez wysiłku — ale jeśli nie zbudujesz nawyków, po odstawieniu waga wróci.',
        zasady: [
            '<strong>Nie polegaj na leku</strong> — buduj nawyki: białko, trening, sen, jakby leku nie było.',
            '<strong>Trening siłowy 3×/tydz.</strong> — energia jest, wykorzystaj ją na mięśnie.',
            '<strong>Uważaj na kofeinę</strong> — bupropion + kawa = nerwowość, gorszy sen.',
            '<strong>Pij wodę</strong> — lek daje suchość w ustach, a odwodnienie myli się z głodem.'
        ],
        uwagi: 'Bupropion obniża próg drgawkowy — przy padaczce lub zaburzeniach odżywiania (bulimia/anoreksja) bywa przeciwwskazany. Nie łącz z alkoholem w nadmiarze. Przy bezsenności bierz dawkę rano.',
        coDalej: 'To najlepszy "układ" na tej liście do budowania formy. 12 tygodni konsekwencji, a nawyki zostają na dłużej niż lek.'
    },
    {
        slug: 'kwetiapina-przy-odchudzaniu',
        emoji: '🌙',
        title: 'Kwetiapina przy odchudzaniu',
        subtitle: 'Neuroleptyk, który realnie zwiększa apetyt. Jak kontrolować wagę na kwetiapinie?',
        meta: 'Kwetiapina a odchudwanie: silny wpływ na apetyt, mechanizm tycia, praktyczne strategie.',
        lead: 'Kwetiapina (Seroquel) to lek, na którym przybiera się najczęściej — to udokumentowane, nie anegdota. Ale to też lek, który ratuje sen i stabilność. Nie wybierasz między lekiem a sylwetką — wybierasz strategię.',
        opie: {
            appetite: '+20%…+40%',
            metabolism: '−5%…0%',
            weight: '+2…+6 kg w 2–3 mies. (bez kontroli)',
            hack: 'współpracuj z psychiatrą przy dawce — niżej = mniej głodu'
        },
        mechanika: 'Kwetiapina blokuje receptory histaminowe (senność), serotoninowe i dopaminowe. Efekt: silny wzrost apetytu, zwłaszcza wieczorem, i spadek energii. Wysokie dawki (300+mg) problem większe niż niskie (25–50 mg na sen).',
        zasady: [
            '<strong>Wieczor pułapki</strong> — lek wieczor, głód też wieczór. Przygotuj wieczorna przekąskę z góry (białko+warzyw).',
            '<strong>Waga co tydzień</strong> — 5i8 cicho dodaje; reaguj na pierwsze kilogram.',
            '<strong>Białko 2g/kg</strong> — sytość, która przetrwa napad.',
            '<strong>Ruch rano/południe</strong> — wieczorem nie ma siły.',
            '<strong>Porozmawiaj o dawce</strong> — czasem wystarczy mniejsza.'
        ],
        uwagi: 'Kwetia łączy się z zaburzeniami metab regulnymi — got. Przy >2kg/mies to nie "słaba wola", tylko farmakologia — temat do rozmowy z psychiatrem.',
        coDalej: 'Traktuj kwetię jak przeciwnika z planem: przygotowane jedzenie, poran ruch, wag cotygodniowa.'
    },
{
        slug: 'olanzapina-przy-odchudzaniu',
        emoji: '🍽️',
        title: 'Olanzapina przy odchudzaniu',
        subtitle: 'Lek o największym potencjale tycia. Jak nie przytyć na olanzapinie?',
        meta: 'Olanzapina a odchudzanie: największe ryzyko przyrostu wagi, mechanizm i strategie kontroli.',
        lead: 'Olanzapina (Zyprexa) ma największy potencjał przyrostu wagi spośród neuroleptyków — w badaniach część pacjentów przybiera 4–10 kg. Jeśli ją bierzesz, musisz grać inaczej: systemowo, nie "na silną wolę".',
        opie: {
            appetite: '+30%…+50%',
            metabolism: '−10%…0%',
            weight: '+3…+8 kg w 2–3 mies. (bez kontroli)',
            hack: 'jedzenie przygotowane z góry + waga co tydzień = podstawa'
        },
        mechanika: 'Olanzapina silnie blokuje receptory histaminowe, serotoninowe i muskarynowe. Efekt: ogromny wzrost apetytu, spowolnienie, senność. Dodatkowo może zaburzać gospodarkę cukrową. To najtrudniejszy scenariusz na tej liście.',
        zasady: [
            '<strong>Meal prep na cały dzień</strong> — zero decyzji żywieniowych "na głodzie".',
            '<strong>Białko 2 g/kg + dużo warzyw</strong> — objętość i sytość to Twoja broń.',
            '<strong>Waga co tydzień, zapis</strong> — widzisz trend, nie "niespodziankę".',
            '<strong>Ruch poranny</strong> — po leku wieczorem nie ma siły.',
            '<strong>Badania metaboliczne</strong> — cukier i lipidy co pół roku, standard przy olanzapinie.'
        ],
        uwagi: 'Przyrost >3 kg/mies. mimo dobrej diety to sygnał do pilnej rozmowy z psychiatrą — istnieją zamienniki o mniejszym wpływie na wagę (np. aripiprazol, lurazydon). Nie odstawiaj sam — ryzyko nawrotu psychozy jest realne.',
        coDalej: 'Olanzapina wymaga największej dyscypliny. Ale ludzie na niej chudną — z planem, wsparciem i monitoringiem. Ty też możesz.'
    },
    {
        slug: 'rysperydon-przy-odchudzaniu',
        emoji: '🎯',
        title: 'Rysperydon przy odchudzaniu',
        subtitle: 'Neuroleptyk o umiarkowanym wpływie na wagę. Jak zbilansować dietę?',
        meta: 'Rysperydon a odchudzanie: wpływ na apetyt, prolaktynę, wagę i praktyczne wskazówki.',
        lead: 'Rysperydon (Risperdal) ma mniejszy potencjał tycia niż olanzapina i kwetiapina, ale wciąż realny — zwłaszcza przez wzrost apetytu i prolaktynę. Da się to kontrolować.',
        opie: {
            appetite: '+10%…+25%',
            metabolism: '−5%…0%',
            weight: '+1…+4 kg w 2–3 mies. (bez kontroli)',
            hack: 'białko i warzywa w każdym posiłku + ruch 3×/tydz.'
        },
        mechanika: 'Rysperydon blokuje głównie receptory dopaminowe D2 i serotoninowe. Wzrost apetytu jest umiarkowany, ale lek podbija prolaktynę, co u części osób zaburza gospodarkę hormonalną i sprzyja retencji wody oraz tyciu.',
        zasady: [
            '<strong>Stałe posiłki</strong> — rytm ogranicza kompulsy, które lek może wzmagać.',
            '<strong>Białko 1,8–2,2 g/kg</strong> — sytość i ochrona mięśni.',
            '<strong>Monitoruj prolaktynę</strong> — jeśli lekarz zaleci, badania okresowe to standard.',
            '<strong>Ruch 3×/tydz.</strong> — siłowy + spacery, obniża ryzyko metaboliczne.'
        ],
        uwagi: 'U kobiet rysperydon może zaburzać cykl przez prolaktynę — temat dla lekarza. Przyrost >2 kg/mies. zgłoś; czasem pomaga zmiana dawki lub leku.',
        coDalej: 'Rysperydon to "środek trudności". Standardowa, dobrze zbilansowana redukcja wystarczy — trzymaj system.'
    },
    {
        slug: 'aripiprazol-przy-odchudzaniu',
        emoji: '🧩',
        title: 'Aripiprazol przy odchudzaniu',
        subtitle: 'Neuroleptyk o neutralnym profilu wagowym. Dobra wiadomość dla redukcji.',
        meta: 'Aripiprazol a odchudzanie: wpływ na apetyt, wagę, metabolizm i praktyczne zasady.',
        lead: 'Aripiprazol (Abilify) działa inaczej niż typowe neuroleptyki — częściowo pobudza receptory dopaminowe. Efekt: zwykle neutralny wpływ na wagę, a u części osób nawet spadek. To jeden z lepszych wyborów, jeśli zależy Ci na sylwetce.',
        opie: {
            appetite: '−5%…+10%',
            metabolism: '0%',
            weight: '0…−1 kg',
            hack: 'traktuj lek jako neutralny i buduj normalną redukcję'
        },
        mechanika: 'Aripiprazol jest częściowym agonistą dopaminy — nie "wycisza" tak mocno jak inne neuroleptyki. Dlatego rzadziej daje senność i wzrost apetytu. U części pacjentów pojawia się wręcz spadek łaknienia i więcej energii.',
        zasady: [
            '<strong>Klasyczna redukcja</strong> — deficyt 300–500 kcal, białko 1,6–2,2 g/kg.',
            '<strong>Trening siłowy</strong> — energia zwykle jest, wykorzystaj ją.',
            '<strong>Stałe posiłki</strong> — nie polegaj na "braku głodu", jedz regularnie.'
        ],
        uwagi: 'Na starcie możliwa bezsenność lub niepokój (akatyzja) — zgłoś lekarzowi, jeśli przeszkadza. Nie odstawiaj sam, nawet jeśli czujesz się świetnie.',
        coDalej: 'Aripiprazol to "zielone światło" dla redukcji. Rób swoje: deficyt, białko, ruch, sen.'
    },
{
        slug: 'lamotrygina-przy-odchudzaniu',
        emoji: '📐',
        title: 'Lamotrygina przy odchudzaniu',
        subtitle: 'Stabilizator nastroju o neutralnym wpływie na wagę. Idealny do redukcji?',
        meta: 'Lamotrygina a odchudzanie: wpływ na apetyt, metabolizm, wagę i praktyczne wskazówki.',
        lead: 'Lamotrygina (Lamictal) to stabilizator nastroju, który zwykle nie zmienia apetytu ani wagi. To dobra wiadomość: jeśli ją bierzesz, redukcja wygląda dokładnie tak samo jak bez leku.',
        opie: {
            appetite: '0% (neutralny)',
            metabolism: '0%',
            weight: '0…+0,5 kg',
            hack: 'traktuj jak neutralny — skup się na klasycznej diecie'
        },
        mechanika: 'Lamotrygina stabilizuje błony neuronalne (blokuje kanały sodowe) i działa na glutaminian. Nie wpływa na serotoninę ani histaminę, dlatego nie zmienia apetytu. To jeden z lepiej tolerowanych stabilizatorów pod kątem wagi.',
        zasady: [
            '<strong>Klasyczna redukcja</strong> — deficyt, białko, warzywa, ruch.',
            '<strong>Regularność</strong> — lamotrygina lubi stałe dawki; i dieta lubi stałe posiłki.',
            '<strong>Nie przerywaj nagle</strong> — odstawianie tylko z lekarzem (ryzyko wysypki przy nagłych zmianach).'
        ],
        uwagi: 'Lamotrygina wymaga wolnego zwiększania dawki (ryzyko wysypki). Jeśli pojawi się wysypka — kontakt z lekarzem, nie z internetem. Poza tym: zero specjalnych zasad żywieniowych.',
        coDalej: 'To "niewidzialny" lek dla diety. Rób standardowo: deficyt, białko, sen, ruch.'
    },
    {
        slug: 'lit-przy-odchudzaniu',
        emoji: '🧂',
        title: 'Lit przy odchudzaniu',
        subtitle: 'Stabilizator nastroju, który potrafi dodać kilogramy. Jak to kontrolować?',
        meta: 'Lit a odchudzanie: wpływ na apetyt, retencję wody, wagę i praktyczne zasady.',
        lead: 'Lit to złoty standard w chorobie afektywnej dwubiegunowej, ale bywa trudny dla wagi: zwiększa pragnienie, apetyt i retencję wody. Nie jest to jednak powód, by z niego rezygnować — tylko by grać mądrze.',
        opie: {
            appetite: '+10%…+20%',
            metabolism: '0%…−5% (retencja wody)',
            weight: '+1…+3 kg (część to woda)',
            hack: 'pij wodę regularnie — pragnienie myli się z głodem'
        },
        mechanika: 'Lit wpływa na gospodarkę wodno-elektrolitową i może zwiększać pragnienie oraz apetyt. Część przyrostu wagi to woda, nie tłuszcz. Ważne: lit ma wąski indeks terapeutyczny — dawkowanie i poziom we krwi kontroluje lekarz.',
        zasady: [
            '<strong>Nie myl pragnienia z głodem</strong> — pij 2–2,5 l wody dziennie.',
            '<strong>Białko 1,8–2,2 g/kg</strong> — sytość przy kontroli kalorii.',
            '<strong>Monitoruj sól</strong> — lit + nadmiar soli = retencja; nie solij przesadnie.',
            '<strong>Waga co tydzień</strong> — oddziel "wodę" od "tłuszczu" trendem miesięcznym.'
        ],
        uwagi: 'Odwodnienie przy litu jest niebezpieczne (ryzyko toksyczności). Przy intensywnym treningu i upałach pij więcej. Objawy toksyczności (drżenie, wymioty, splątanie) = natychmiast lekarz.',
        coDalej: 'Lit wymaga uwagi, ale nie wyklucza redukcji. Nawodnienie, białko, monitoring — i rozmowa z psychiatrą o poziomach.'
    },
    {
        slug: 'metylofenidat-przy-odchudzaniu',
        emoji: '⚡',
        title: 'Metylofenidat przy odchudzaniu',
        subtitle: 'Lek na ADHD, który tłumi apetyt. Jak nie wpaść w głodówkę?',
        meta: 'Metylofenidat a odchudzanie: wpływ na apetyt, energię, wagę i praktyczne zasady.',
        lead: 'Metylofenidat (Concerta, Medikinet) to stymulant na ADHD, który u większości osób tłumi apetyt. To może ułatwić redukcję — ale też prowadzi do głodówek i efektu jo-jo, jeśli nie zadbasz o posiłki.',
        opie: {
            appetite: '−20%…−30% (w godzinach działania)',
            metabolism: '+5%…+10% (pobudzenie)',
            weight: 'część osób −1…−3 kg',
            hack: 'jedz białkowe posiłki, zanim lek "wyłączy" głód'
        },
        mechanika: 'Metylofenidat podbija dopaminę i noradrenalinę — stąd energia, skupienie i mniejszy apetyt. Efekt głodu wraca, gdy lek przestaje działać (wieczorem), co bywa pułapką na podjadanie.',
        zasady: [
            '<strong>Śniadanie przed lekiem</strong> — białkowe, żeby dzień nie zaczął się od głodówki.',
            '<strong>Posiłek w "oknie" wieczornym</strong> — gdy lek przestaje działać, głód wraca; przygotuj go z góry.',
            '<strong>Białko 1,8–2,2 g/kg</strong> — chroni mięśnie i stabilizuje głód.',
            '<strong>Nie łącz z nadmiarem kofeiny</strong> — serce i sen podziękują.'
        ],
        uwagi: 'Jeśli jesz <1200 kcal przez kilka dni, to nie "sukces diety", tylko sygnał ostrzegawczy. Przy spadku wagi >1%/tydz. dojedź więcej. Nie odstawiaj leku "na wakacje od głodu" bez konsultacji.',
        coDalej: 'Metylofenidat daje Ci naturalny deficyt apetytu. Wykorzystaj to na białkowe posiłki i trening — nie na głodówkę.'
    },
{
        slug: 'atomoksetyna-przy-odchudzaniu',
        emoji: '🧠',
        title: 'Atomoksetyna przy odchudzaniu',
        subtitle: 'Niestymulujący lek na ADHD. Wpływ na apetyt i wagę.',
        meta: 'Atomoksetyna a odchudzanie: wpływ na apetyt, metabolizm, wagę i praktyczne wskazówki.',
        lead: 'Atomoksetyna (Strattera) działa na ADHD bez stymulacji — ale też potrafi zmniejszyć apetyt, zwłaszcza na początku. Wpływ na wagę jest zwykle łagodny i do opanowania.',
        opie: {
            appetite: '−10%…−20% (początek)',
            metabolism: '0%',
            weight: '0…−1,5 kg',
            hack: 'regularne posiłki — apetyt wraca po kilku tygodniach'
        },
        mechanika: 'Atomoksetyna blokuje wychwyt noradrenaliny. U części osób tłumi apetyt na pierwszych tygodniach, potem zwykle wraca do normy. Nie daje "kopa" jak stymulanty, więc energia do treningu nie rośnie magicznie.',
        zasady: [
            '<strong>Posiłki o stałych porach</strong> — nie czekaj na głód, on może nie przyjść.',
            '<strong>Białko w każdym posiłku</strong> — ochrona mięśni i stabilizacja.',
            '<strong>Trening siłowy</strong> — energia jest "normalna", więc buduj nawyk, nie euforię.'
        ],
        uwagi: 'Możliwe suchość w ustach, zaparcia, nudności — pij wodę i jedz błonnik. Jeśli apetyt nie wraca po 2 miesiącach, zgłoś lekarzowi.',
        coDalej: 'Atomoksetyna to "łagodna" lek dla diety. Rób standardowo i nie polegaj na tłumieniu apetytu — on może minąć.'
    },
    {
        slug: 'hydroksyzyna-przy-odchudzaniu',
        emoji: '😌',
        title: 'Hydroksyzyna przy odchudzaniu',
        subtitle: 'Lek uspokajający/na alergię. Czy wpływa na wagę?',
        meta: 'Hydroksyzyna a odchudzanie: wpływ na apetyt, senność, wagę i praktyczne wskazówki.',
        lead: 'Hydroksyzyna (Atarax, Hydroxyzinum) to lek przeciwhistaminowy o działaniu uspokajającym. Wpływ na wagę jest zwykle minimalny — główny problem to senność, która może obniżyć aktywność.',
        opie: {
            appetite: '0%…+5%',
            metabolism: '0% (ale senność ↓ aktywność)',
            weight: '0…+1 kg',
            hack: 'bierz wieczorem, jeśli senność przeszkadza w ciągu dnia'
        },
        mechanika: 'Hydroksyzyna blokuje receptory histaminowe H1 — stąd działanie uspokajające i nasenne. Histamina odpowiada też za czuwanie, więc po leku możesz być wolniejszy. Apetyt zwykle bez zmian.',
        zasady: [
            '<strong>Planuj ruch rano</strong> — zanim lek Cię „spowolni”.',
            '<strong>Klasyczna redukcja</strong> — deficyt, białko, warzywa.',
            '<strong>Uważaj na alkohol</strong> — nasila senność.'
        ],
        uwagi: 'Hydroksyzyna bywa stosowana doraźnie (lęk, alergia). Jeśli bierzesz ją "na zaśnięcie", pamiętaj: sen po leku to nie to samo co sen naturalny.',
        coDalej: 'Neutralny lek dla wagi. Główny wróg to senność — ograj ją ruchem rano i spacerami.'
    },
{
        slug: 'diazepam-przy-odchudzaniu',
        emoji: '🛋️',
        title: 'Diazepam przy odchudzaniu',
        subtitle: 'Benzodiazepina — wpływ na apetyt, sen i wagę. Co warto wiedzieć.',
        meta: 'Diazepam a odchudzanie: wpływ na apetyt, senność, wagę i praktyczne zasady.',
        lead: 'Diazepam (Relanium) to benzodiazepina stosowana doraźnie przy lęku i napięciu. Sam lek zwykle nie zmienia wagi — ale może rozregulować sen i aktywność, a przy długim stosowaniu uzależnia. To ważniejsze niż kalorie.',
        opie: {
            appetite: '0%…+5%',
            metabolism: '−5%…0% (sedacja)',
            weight: '0…+1 kg',
            hack: 'krótko i doraźnie — im krócej, tym mniej problemów'
        },
        mechanika: 'Diazepam wzmacnia GABA — działa uspokajająco i rozluźniająco. Może zmniejszać aktywność i pogarszać jakość snu przy regularnym stosowaniu. Apetyt zwykle bez zmian; problemem jest spadek ruchu, nie głód.',
        zasady: [
            '<strong>Nie myl rozluźnienia z "dniem wolnym"</strong> — lek nie zwalnia z diety.',
            '<strong>Ruch łagodny, ale codziennie</strong> — spacery ratują aktywność przy sedacji.',
            '<strong>Krótka terapia</strong> — benzodiazepiny to leki doraźne, nie na lata.'
        ],
        uwagi: 'Długie stosowanie diazepamu prowadzi do tolerancji i uzależnienia. Odstawianie po dłuższym czasie tylko z lekarzem (zespół odstawienny). Nie łącz z alkoholem — to groźne połączenie.',
        coDalej: 'Diazepam to "środek przejściowy". Skup się na nawykach, które zostaną, gdy lek zniknie.'
    },
    {
        slug: 'klonazepam-przy-odchudzaniu',
        emoji: '🌫️',
        title: 'Klonazepam przy odchudzaniu',
        subtitle: 'Benzodiazepina o długim działaniu. Wpływ na wagę i praktyczne zasady.',
        meta: 'Klonazepam a odchudzanie: wpływ na apetyt, sen, wagę i praktyczne wskazówki.',
        lead: 'Klonazepam (Clonazepamum) działa długo i bywa stosowany przy lęku, napadach paniki i tikach. Wpływ na wagę jest zwykle neutralny — ale sedacja i uzależnienie to realne tematy, ważniejsze niż makro.',
        opie: {
            appetite: '0%…+5%',
            metabolism: '−5%…0%',
            weight: '0…+1 kg',
            hack: 'doraźnie i krótko — nie na lata'
        },
        mechanika: 'Klonazepam wzmacnia GABA, działa uspokajająco i rozluźniająco przez wiele godzin. Może spowalniać i pogarszać jakość snu przy regularnym stosowaniu. Apetyt zwykle bez zmian.',
        zasady: [
            '<strong>Aktywność poranna</strong> — sedacja po leku wieczorem nie zniknie sama.',
            '<strong>Białko w każdym posiłku</strong> — standard, niezależnie od leku.',
            '<strong>Rozmowa z lekarzem o planie odstawienia</strong> — benzodiazepiny nie są na stałe.'
        ],
        uwagi: 'Klonazepam ma długi okres półtrwania — kumuluje się. Przy dłuższym stosowaniu uzależnienie i zespół odstawienny są realne; odstawianie wyłącznie pod kontrolą lekarza.',
        coDalej: 'Traktuj klonazepam jak tymczasowe wsparcie. Dieta i ruch to Twoja stała inwestycja.'
    },
];
const articles = defs.map(buildArticle);
const out = path.join(__dirname, 'hardcore-articles-leki.json');
writeFileSync(out, JSON.stringify(articles, null, 2) + '\n');
console.log(`Zapisano ${articles.length} artykułów o lekach -> ${out}`);
