(function () {
    let BUILTIN_FACTS = [
        { emoji: '🥩', tag: 'Białko', text: 'Ludzkie ciało składa się z około 20% białka — to drugi najczęstszy składnik po wodzie.' },
        { emoji: '🧬', tag: 'Białko', text: 'Genom człowieka koduje ponad 20 000 różnych białek, z których każde pełni inną funkcję.' },
        { emoji: '🥚', tag: 'Białko', text: 'Białko jaja kurzego ma wskaźnik PDCAAS 1,0 — uznawany za wzorzec jakości białka w diecie.' },
        { emoji: '🐟', tag: 'Białko', text: 'Tuńczyk ma około 30 g białka na 100 g mięsa — więcej niż wiele popularnych suplementów na łyżkę.' },
        { emoji: '🫘', tag: 'Białko', text: 'Soczewica i ryż razem tworzą kompletny profil aminokwasów — klasyczny duet roślinnego białka.' },
        { emoji: '🧀', tag: 'Białko', text: 'Ser twarogowy chudy to jedno z najtańszych źródeł białka w polskich sklepach — ok. 18 g na 100 g.' },
        { emoji: '🍗', tag: 'Białko', text: 'Pierś z kurczaka ma około 31 g białka i bardzo mało tłuszczu — stąd jej popularność w diecie sportowej.' },
        { emoji: '🦐', tag: 'Białko', text: 'Krewetki mają około 24 g białka na 100 g i jednocześnie niewiele kalorii — świetny wybór na redukcji.' },
        { emoji: '🥛', tag: 'Białko', text: 'Kazeina z mleka trawi się wolno — dlatego często pije się ją przed snem jako „wolne” białko nocne.' },
        { emoji: '⚡', tag: 'Białko', text: 'Serwatka (whey) wchłania się szybciej niż kazeina — stąd jej popularność tuż po treningu.' },
        { emoji: '🌾', tag: 'Białko', text: 'Pszenica ma mało lizyny, ale groszek dużo — dlatego mieszanki roślinne często łączą te składniki.' },
        { emoji: '🥜', tag: 'Białko', text: 'Orzeszki ziemne mają około 26 g białka na 100 g, ale też sporo kalorii — łatwo je „przekombinować”.' },
        { emoji: '🫛', tag: 'Białko', text: 'Tofu ma około 8–17 g białka na 100 g w zależności od twardości — im twardsze, tym zwykle więcej białka.' },
        { emoji: '🍳', tag: 'Białko', text: 'Suche białko jaja (proszek) to prawie czyste białko bez tłuszczu — używane w wypiekach proteinowych.' },
        { emoji: '🧫', tag: 'Białko', text: 'Kolagen to białko strukturalne skóry i stawów — sam z siebie nie ma pełnego profilu aminokwasów mięśniowych.' },
        { emoji: '🏋️', tag: 'Białko', text: 'Po treningu siłowym synteza białek mięśniowych rośnie nawet przez 24–48 godzin.' },
        { emoji: '📊', tag: 'Białko', text: 'Dla aktywnej osoby często rekomenduje się 1,6–2,2 g białka na kg masy ciała dziennie.' },
        { emoji: '🍖', tag: 'Białko', text: 'Wołowina dostarcza dużo leucyny — aminokwasu, który mocno „odpala” sygnał budowy mięśni.' },
        { emoji: '🐑', tag: 'Białko', text: 'Jagnięcina ma nieco więcej tłuszczu niż wołowina, ale też solidną porcję białka i żelaza.' },
        { emoji: '🥬', tag: 'Białko', text: 'Brokuły mają około 3 g białka na 100 g — mało jak na mięso, ale sporo jak na warzywo.' },
        { emoji: '🌱', tag: 'Białko', text: 'Białko grochu stało się bazą wielu nowoczesnych odżywek roślinnych — dobrze rozpuszcza się w wodzie.' },
        { emoji: '🧃', tag: 'Białko', text: 'Jedna standardowa porcja odżywki białkowej (30 g proszku) to zwykle 20–25 g samego białka.' },
        { emoji: '🍚', tag: 'Białko', text: 'Ryż i fasola to duet znany na całym świecie — razem dają wszystkie niezbędne aminokwasy egzogenne.' },
        { emoji: '🦃', tag: 'Białko', text: 'Indyk ma mniej tłuszczu niż kurczak ciemny, a podobną ilość białka — świetny na dietę.' },
        { emoji: '🔥', tag: 'Białko', text: 'Termogeneza białka jest wyższa niż węglowodanów i tłuszczów — organizm „spala” więcej energii na trawienie białka.' },

        { emoji: '📉', tag: 'Odchudzanie', text: 'Deficyt 500 kcal dziennie teoretycznie daje około 0,5 kg spadku masy ciała tygodniowo — to orientacyjna zasada, nie prawo.' },
        { emoji: '⚖️', tag: 'Odchudzanie', text: 'Waga potrafi wahać się o 1–2 kg w ciągu doby przez wodę, sól, węglowodany i trening — to normalne.' },
        { emoji: '🍽️', tag: 'Odchudzanie', text: 'Efekt odchudzania zależy głównie od bilansu kalorycznego w czasie, a nie od pojedynczego posiłku czy produktu.' },
        { emoji: '🚶', tag: 'Odchudzanie', text: 'NEAT — codzienne ruchy poza treningiem (schody, chodzenie) mogą spalać setki kalorii dziennie.' },
        { emoji: '😴', tag: 'Odchudzanie', text: 'Brak snu zwiększa apetyt i gorsze decyzje żywieniowe — sen to część diety, nie luksus.' },
        { emoji: '🧠', tag: 'Odchudzanie', text: 'Stres podnosi kortyzol, co może utrudniać redukcję — dlatego „dieta w nerwach” często nie działa długo.' },
        { emoji: '🥤', tag: 'Odchudzanie', text: 'Płynne kalorie (soki, latte, alkohol) łatwo „przegapić” — nie dają takiego sytości jak jedzenie.' },
        { emoji: '🍫', tag: 'Odchudzanie', text: 'Cheat meal nie psuje diety — psuje ją regularne przekraczanie deficytu przez resztę tygodnia.' },
        { emoji: '📱', tag: 'Odchudzanie', text: 'Tracking kalorii przez 2–4 tygodnie uczy porcji lepiej niż lata zgadywania „na oko”.' },
        { emoji: '🥗', tag: 'Odchudzanie', text: 'Volume eating — duże porcje niskokalorycznych warzyw zwiększają sytość bez nadwyrężania deficytu.' },
        { emoji: '🔄', tag: 'Odchudzanie', text: 'Plateau wagi to często sygnał, że metabolizm się dostosował — czas zmienić strategię, nie panikować.' },
        { emoji: '💧', tag: 'Odchudzanie', text: 'Picie wody przed posiłkiem może nieznacznie zmniejszyć apetyt — efekt jest realny, ale umiarkowany.' },
        { emoji: '🍞', tag: 'Odchudzanie', text: 'Niskie węglowodany nie są magiczne — działają głównie dlatego, że ułatwiają utrzymanie deficytu.' },
        { emoji: '🕐', tag: 'Odchudzanie', text: 'Intermittent fasting to narzędzie planowania posiłków — sam w sobie nie omija praw fizyki kalorii.' },
        { emoji: '🧮', tag: 'Odchudzanie', text: 'TDEE to suma BMR i aktywności — bez tego trudno sensownie ustawić cel kaloryczny.' },
        { emoji: '📏', tag: 'Odchudzanie', text: 'Obwód talii lepiej opisuje ryzyko zdrowotne niż sama waga — warto mierzyć oba parametry.' },
        { emoji: '🏃', tag: 'Odchudzanie', text: 'Kardio wspomaga deficyt, ale samo bez diety rzadko wystarcza do wyraźnej redukcji.' },
        { emoji: '🍺', tag: 'Odchudzanie', text: 'Alkohol ma 7 kcal/g — prawie jak tłuszcz — i organizm traktuje go priorytetowo w metabolizmie.' },
        { emoji: '🧊', tag: 'Odchudzanie', text: '„Zimna woda spala tłuszcz” — efekt istnieje, ale jest tak mały, że nie zastąpi deficytu kalorycznego.' },
        { emoji: '📅', tag: 'Odchudzanie', text: 'Utrata 0,5–1% masy ciała tygodniowo to bezpieczny, realistyczny cel dla większości osób.' },

        { emoji: '🥦', tag: 'Odżywianie', text: 'Warzywa mają dużo błonnika, witamin i minerałów, ale mało kalorii — dlatego „zapełniają” talerz bez tłuczenia deficytu.' },
        { emoji: '🍌', tag: 'Odżywianie', text: 'Banan to nie „tylko cukier” — ma potas, błonnik i węglowodany przydatne przed treningiem.' },
        { emoji: '🥑', tag: 'Odżywianie', text: 'Awokado ma około 160 kcal na 100 g — kaloryczne, ale pełne zdrowych tłuszczów jednonienasyconych.' },
        { emoji: '🐟', tag: 'Odżywianie', text: 'Tłuste ryby morskie (łosoś, makrela) dostarczają omega-3 EPA i DHA — trudnych do uzyskania z samej lądowej diety.' },
        { emoji: '☀️', tag: 'Odżywianie', text: 'W Polsce niedobór witaminy D zimą dotyczy większości populacji — warto monitorować poziom we krwi.' },
        { emoji: '🧂', tag: 'Odżywianie', text: 'Sód jest potrzebny sportowcom, ale nadmiar soli z processed food łatwo prowadzi do retencji wody.' },
        { emoji: '🍯', tag: 'Odżywianie', text: 'Miód ma antybakteryjne właściwości, ale kalorycznie to wciąż cukier — około 304 kcal na 100 g.' },
        { emoji: '🌰', tag: 'Odżywianie', text: 'Orzechy włoskie mają jedne z najwyższych zawartości kwasu alfa-linolenowego (omega-3 roślinnego).' },
        { emoji: '🥬', tag: 'Odżywianie', text: 'Szpinak ma dużo żelaza, ale w formie trudno wchłanialnej — witamina C z papryki poprawia jego absorpcję.' },
        { emoji: '🍊', tag: 'Odżywianie', text: 'Papryka ma więcej witaminy C niż pomarańcza — świeże warzywa często biją owoce w mikroelementach.' },
        { emoji: '🫐', tag: 'Odżywianie', text: 'Jagody są bogate w antocyjany — związki, które nadają im kolor i mają właściwości antyoksydacyjne.' },
        { emoji: '🍠', tag: 'Odżywianie', text: 'Batat ma więcej beta-karotenu niż zwykły ziemniak — oba są świetnymi źródłami węglowodanów.' },
        { emoji: '🧈', tag: 'Odżywianie', text: 'Masło klarowane (ghee) ma wyższy punkt dymienia niż zwykłe masło — lepsze do smażenia.' },
        { emoji: '🥒', tag: 'Odżywianie', text: 'Ogórek to w praktyce woda z błonnikiem — idealny do volume eating i nawodnienia z jedzenia.' },
        { emoji: '🌿', tag: 'Odżywianie', text: 'Zioła i przyprawy dodają smaku bez kalorii — kurkuma, pieprz cayenne, bazylia to „free flavor”.' },
        { emoji: '🍵', tag: 'Odżywianie', text: 'Zielona herbata zawiera L-teaninę, która łagodzi pobudzenie od kofeiny — mniej „nerwów” niż sama kawa.' },
        { emoji: '🧊', tag: 'Odżywianie', text: 'Mrożone warzywa mają podobną wartość odżywczą jak świeże — często mrożone tuż po zbiorze.' },
        { emoji: '🍎', tag: 'Odżywianie', text: '„Jabłko dziennie” ma sens — błonnik, polifenole i sytość przy niskiej kaloryczności.' },
        { emoji: '🥛', tag: 'Odżywianie', text: 'Jogurt naturalny ma probiotyki i wapń — wersja grecka ma więcej białka i gęstsze konsystencję.' },
        { emoji: '🍫', tag: 'Odżywianie', text: 'Czekolada gorzka (70%+) ma mniej cukru i więcej flawonoidów niż mleczna — ale wciąż kaloryczna.' },
        { emoji: '🌾', tag: 'Odżywianie', text: 'Płatki owsiane mają beta-glukany — błonnik, który pomaga obniżać cholesterol LDL.' },
        { emoji: '🧄', tag: 'Odżywianie', text: 'Czosnek zawiera allicynę — związek o właściwościach antybakteryjnych i przeciwzapalnych.' },
        { emoji: '🫒', tag: 'Odżywianie', text: 'Oliwa extra virgin to podstawa diety śródziemnomorskiej — tłuszcz, który wspiera zdrowie serca.' },
        { emoji: '🍄', tag: 'Odżywianie', text: 'Grzyby mają mało kalorii, ale dużo umami — świetne do dań na redukcji bez rezygnacji ze smaku.' },
        { emoji: '🥤', tag: 'Odżywianie', text: 'Smoothie może mieć 600+ kcal w szklance — mielenie owoców nie usuwa cukru, tylko ułatwia przesadzenie z porcją.' },

        { emoji: '🏋️', tag: 'Trening', text: 'Mięsień nie rośnie w siłowni — rośnie podczas regeneracji po treningu, kiedy organizm naprawia mikrouszkodzenia.' },
        { emoji: '💪', tag: 'Trening', text: 'Progresja obciążeń to klucz do hipertrofii — mięśnie adaptują się do coraz większego bodźca.' },
        { emoji: '🦵', tag: 'Trening', text: 'Trening nóg angażuje największe grupy mięśniowe — stąd mówi się, że „leg day” budzi metabolizm.' },
        { emoji: '🫁', tag: 'Trening', text: 'VO2max to maksymalna zdolność organizmu do wykorzystywania tlenu — kluczowy parametr kondycji.' },
        { emoji: '⏱️', tag: 'Trening', text: 'Optymalna przerwa między seriami na siłę to zwykle 2–5 minut — na hipertrofię często 1,5–3 minuty.' },
        { emoji: '🎯', tag: 'Trening', text: 'Zakres 6–12 powtórzeń to klasyczny „sweet spot” hipertrofii, ale siła i wytrzymałość też budują mięśnie.' },
        { emoji: '🏃', tag: 'Trening', text: 'HIIT spala dużo kalorii w krótkim czasie, ale nie zastępuje treningu siłowego przy budowie sylwetki.' },
        { emoji: '🧘', tag: 'Trening', text: 'Mobilność i rozciąganie poprawiają zakres ruchu — lepszy ROM często oznacza lepsze efekty treningowe.' },
        { emoji: '🩹', tag: 'Trening', text: 'DOMS (spuchnięte mięśnie po treningu) nie jest dowodem dobrego treningu — możesz rosnąć bez „zajechania”.' },
        { emoji: '🏆', tag: 'Trening', text: 'Rekord świata w martwym ciągu (equipped) przekracza 500 kg — ale dla amatora liczy się konsekwencja, nie rekordy.' },
        { emoji: '🤸', tag: 'Trening', text: 'Kalistenika (pompki, podciągania) buduje siłę względną — im lżejsze ciało, tym łatwiej wykonać ruch.' },
        { emoji: '🚴', tag: 'Trening', text: 'Rower stacjonarny to niskie obciążenie stawów — dobry wybór przy kontuzjach kolan.' },
        { emoji: '🏊', tag: 'Trening', text: 'Pływanie angażuje prawie całe ciało, ale w wodzie nie pocisz się tak jak na lądzie — pamiętaj o nawodnieniu.' },
        { emoji: '🎽', tag: 'Trening', text: 'Okresizacja treningu — zmiana objętości i intensywności co kilka tygodni — pomaga uniknąć stagnacji.' },
        { emoji: '🔋', tag: 'Trening', text: 'Glikogen mięśniowy to „paliwo” na intensywny wysiłek — dlatego węglowodany przed treningiem mają sens.' },
        { emoji: '🦴', tag: 'Trening', text: 'Trening siłowy wzmacnia kości — obciążenia mechaniczne stymulują gęstość mineralną szkieletu.' },
        { emoji: '👟', tag: 'Trening', text: 'Buty do biegania tracą amortyzację po 600–800 km — stare buty to częsta przyczyna kontuzji.' },
        { emoji: '📈', tag: 'Trening', text: 'Pierwsze 6–12 miesięcy treningu to „newbie gains” — najszybsze postępy w historii każdego sportowca.' },
        { emoji: '🧊', tag: 'Trening', text: 'Krioterapia i zimne prysznice mogą łagodzić ból, ale nie zastępują snu i odżywiania w regeneracji.' },
        { emoji: '🤝', tag: 'Trening', text: 'Trening z partnerem zwiększa motywację — ale i ryzyko „dopasowania” do cudzego tempa zamiast własnego planu.' },
        { emoji: '🎵', tag: 'Trening', text: 'Muzyka o wyższym tempie (120–140 BPM) może zwiększyć wydajność podczas cardio i treningu obwodowego.' },
        { emoji: '🫀', tag: 'Trening', text: 'Tętno spoczynkowe u sportowców może spaść poniżej 50 uderzeń/min — znak dobrej kondycji sercowo-naczyniowej.' },
        { emoji: '🏗️', tag: 'Trening', text: 'Mięsień składa się w ok. 75% z wody — odwodnienie obniża siłę nawet o kilka procent.' },
        { emoji: '🔄', tag: 'Trening', text: 'Super serie i drop sety to techniki intensyfikacji — skuteczne, ale nie konieczne na każdym treningu.' },
        { emoji: '📋', tag: 'Trening', text: 'Prowadzenie dziennika treningowego to jeden z najprostszych sposobów na realną progresję.' },

        { emoji: '💊', tag: 'Suplementy', text: 'Kreatyna monohydrat to jeden z najlepiej przebadanych suplementów — wspiera siłę i moc mięśni.' },
        { emoji: '🧪', tag: 'Suplementy', text: 'Większość suplementów „spalaczy tłuszczu” ma minimalny efekt w porównaniu z dietą i treningiem.' },
        { emoji: '🌞', tag: 'Suplementy', text: 'Witamina D3 warto łączyć z posiłkiem zawierającym tłuszcz — jest rozpuszczalna w tłuszczach.' },
        { emoji: '🐟', tag: 'Suplementy', text: 'Olej z wątroby dorsza to źródło witaminy A, D i omega-3 — ale łatwo przesadzić z witaminą A.' },
        { emoji: '⚡', tag: 'Suplementy', text: 'Kofeina zwiększa wydajność treningową — efekt jest realny, ale rośnie tolerancja przy codziennym stosowaniu.' },
        { emoji: '🧬', tag: 'Suplementy', text: 'BCAA w diecie wysokobiałkowej są zbędne — pełne białko już dostarcza wszystkie aminokwasy.' },
        { emoji: '🍌', tag: 'Suplementy', text: 'Elektrolity (sód, potas, magnez) są kluczowe przy długim cardio i intensywnym poceniu.' },
        { emoji: '🔬', tag: 'Suplementy', text: 'Beta-alanina powoduje mrowienie skóry (parestezje) — to normalne, nie alergia.' },

        { emoji: '🌍', tag: 'Historia', text: 'Olimpijskie zawody w starożytnej Grecji zakazywały mięsa przed startem — dziś dieta sportowca wygląda zupełnie inaczej.' },
        { emoji: '🏛️', tag: 'Historia', text: 'Milo z Krotonu, legendarny atleta starożytności, podobno jadł 9 kg mięsa dziennie — mit, ale pokazuje fascynację białkiem od wieków.' },
        { emoji: '📜', tag: 'Historia', text: 'Termin „proteina” pochodzi od greckiego „protos” — pierwszy, najważniejszy — bo białko uznawano za fundament życia.' },
        { emoji: '🥫', tag: 'Historia', text: 'Pierwsze odżywki białkowe w proszku pojawiły się w latach 50. XX wieku — początkowo dla astronautów i sportowców elitarnych.' },

        { emoji: '🏆', tag: 'Rekordy', text: 'Arnold Schwarzenegger miał około 107 kg w szczytowej formie na scenie — przy wzroście 188 cm to imponująca masa.' },
        { emoji: '🍗', tag: 'Rekordy', text: 'Rekord Guinnessa w jedzeniu skrzydełek kurczaka to setki sztuk w kilkanaście minut — nie próbuj tego w domu.' },
        { emoji: '🏃', tag: 'Rekordy', text: 'Maraton poniżej 2 godzin (1:59:40) został pobity przez Eliuda Kipchogę w 2019 roku — granica ludzkich możliwości.' },
        { emoji: '💪', tag: 'Rekordy', text: 'Ronnie Coleman podnosił w martwym ciągu ponad 360 kg na zawodach — legenda kulturystyki lat 90.' },

        { emoji: '🧠', tag: 'Ciało', text: 'Mózg zużywa około 20% energii ciała w spoczynku — mimo że stanowi tylko 2% masy ciała.' },
        { emoji: '❤️', tag: 'Ciało', text: 'Serce bijące 70 razy/min pompuje około 10 000 litrów krwi dziennie — prawdziwa maszyna wytrzymałościowa.' },
        { emoji: '🦷', tag: 'Ciało', text: 'Szklanka mleka po treningu dostarcza wapnia ważnego nie tylko dla kości, ale i kurczliwości mięśni.' },
        { emoji: '🩸', tag: 'Ciało', text: 'Po ciężkim treningu nóg krew „omija” mózg — stąd uczucie zamglenia i chęć usiądzenia na ławce.' },
        { emoji: '🔥', tag: 'Ciało', text: 'Brunatna tkanka tłuszczowa (BAT) spala kalorie na ciepło — aktywna w chłodzie i przy niektórych bodźcach.' },
        { emoji: '👃', tag: 'Ciało', text: 'Głód potrafi „oszukać” nos — zapach jedzenia staje się intensywniejszy na diecie, bo mózg szuka kalorii.' },
        { emoji: '🕐', tag: 'Ciało', text: 'Rytm dobowy wpływa na metabolizm — ten sam posiłek wieczorem może dawać nieco inny sygnał sytości niż rano.' },
        { emoji: '🦠', tag: 'Ciało', text: 'Jelita to „drugi mózg” — mikrobiom wpływa na trawienie, nastrój i nawet apetyt.' },
        { emoji: '💧', tag: 'Ciało', text: 'Ciało dorosłego człowieka to około 60% wody — odwodnienie o 2% obniża wydajność fizyczną.' },
        { emoji: '🧬', tag: 'Ciało', text: 'Insulina to hormon magazynujący — po posiłku węglowodanowym pomaga transportować glukozę do mięśni i wątroby.' }
    ];

    // Master pool (all categories) + active, category-filtered pool.
    let FULL_FACTS = BUILTIN_FACTS;
    let FUN_FACTS = BUILTIN_FACTS;
    let activeCat = 'all';
    const ALL_CAT = 'all';

    const STORAGE_KEY = 'funfactBag_v3';
    const CAT_KEY = 'funfactCat_v1';
    const textEl = document.getElementById('funfactText');
    const emojiEl = document.getElementById('funfactEmoji');
    const tagEl = document.getElementById('funfactTag');
    const cardEl = document.getElementById('funfactTile');
    const btnEl = document.getElementById('funfactBtn');
    const copyBtnEl = document.getElementById('funfactCopyBtn');
    const progressEl = document.getElementById('funfactProgress');
    const catsEl = document.getElementById('funfactCats');
    const counterEl = document.getElementById('funfactCounter');

    if (!textEl || !btnEl) return;

    function readStored() {
        try {
            const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
            if (raw && typeof raw === 'object' && !Array.isArray(raw)) return raw;
        } catch (e) { /* ignore */ }
        return null;
    }

    function readStoredCat() {
        try {
            return localStorage.getItem(CAT_KEY);
        } catch (e) { /* ignore */ }
        return null;
    }

    function saveBag(bag) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ cat: activeCat, bag: bag }));
        } catch (e) { /* ignore */ }
    }

    function saveCat(cat) {
        try {
            localStorage.setItem(CAT_KEY, cat);
        } catch (e) { /* ignore */ }
    }

    function shuffle(arr) {
        const copy = arr.slice();
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const tmp = copy[i];
            copy[i] = copy[j];
            copy[j] = tmp;
        }
        return copy;
    }

    let bag = [];
    let seen = 0;
    let currentFact = null;
    let rolling = false;

    function categoriesOf(pool) {
        const usedTags = {};
        const out = [];
        pool.forEach(function (f) {
            if (f && f.tag && !usedTags[f.tag]) {
                usedTags[f.tag] = true;
                out.push(f.tag);
            }
        });
        return out;
    }

    function renderCats() {
        if (!catsEl) return;
        catsEl.textContent = '';

        // Featured "Wszystkie" chip — sits on its own row above the rest.
        const allChip = document.createElement('button');
        allChip.type = 'button';
        allChip.className = 'funfact-cat funfact-cat--all' + (activeCat === ALL_CAT ? ' is-active' : '');
        allChip.setAttribute('data-cat', ALL_CAT);
        allChip.setAttribute('aria-pressed', activeCat === ALL_CAT ? 'true' : 'false');

        const star = document.createElement('span');
        star.className = 'funfact-cat-star';
        star.setAttribute('aria-hidden', 'true');
        star.textContent = '✦';

        const allLabel = document.createElement('span');
        allLabel.textContent = 'Wszystkie';

        const allCount = document.createElement('span');
        allCount.className = 'funfact-cat-count';
        allCount.textContent = String(FULL_FACTS.length);

        allChip.appendChild(star);
        allChip.appendChild(allLabel);
        allChip.appendChild(allCount);
        allChip.addEventListener('click', function () { selectCat(ALL_CAT); });
        catsEl.appendChild(allChip);

        // Remaining categories wrap below the featured chip.
        const rest = document.createElement('div');
        rest.className = 'funfact-cats-rest';
        categoriesOf(FULL_FACTS).forEach(function (cat) {
            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'funfact-cat' + (cat === activeCat ? ' is-active' : '');
            chip.setAttribute('data-cat', cat);
            chip.setAttribute('aria-pressed', cat === activeCat ? 'true' : 'false');
            chip.textContent = cat;
            chip.addEventListener('click', function () { selectCat(cat); });
            rest.appendChild(chip);
        });
        catsEl.appendChild(rest);
    }

    // Every fact gets a stable number based on its position in the FULL pool
    // (all facts, regardless of the active category): #1 … #total.
    function indexFacts() {
        FULL_FACTS.forEach(function (f, i) { f.no = i + 1; });
    }

    function updateMeta() {
        if (counterEl) {
            const catLabel = activeCat === ALL_CAT ? 'wszystkie kategorie' : activeCat;
            counterEl.textContent = 'Kategoria: ' + catLabel + ' · wylosowano ' + seen + ' z ' + FUN_FACTS.length;
        }
    }

    // The progress bar reflects the rolled fact's own number against the total
    // number of ALL facts: fact #42 of 1000 fills the bar to 4.2%.
    // A higher number therefore yields a fuller bar.
    function updateProgress(fact) {
        const total = FULL_FACTS.length;
        const no = fact && Number.isFinite(fact.no) ? fact.no : 0;
        const pct = total ? Math.min(100, Math.max(0, (no / total) * 100)) : 0;
        if (progressEl) {
            progressEl.style.width = pct + '%';
            const track = progressEl.parentElement;
            if (track) track.setAttribute('aria-valuenow', String(Math.round(pct)));
        }
    }

    function applyFact(fact) {
        textEl.textContent = fact.text;
        emojiEl.textContent = fact.emoji || '🎲';
        tagEl.textContent = fact.tag || 'Ciekawostka';
        tagEl.setAttribute('data-cat', fact.tag || 'Ciekawostka');
        currentFact = fact;
    }

    function roll() {
        if (rolling) return;
        rolling = true;
        btnEl.disabled = true;
        btnEl.classList.add('is-spinning');

        textEl.classList.add('is-rolling');
        emojiEl.classList.add('is-rolling');

        if (!bag.length) {
            bag = shuffle(FUN_FACTS.map(function (_, i) { return i; }));
        }

        const idx = bag.pop();
        const fact = FUN_FACTS[idx];
        saveBag(bag);

        window.setTimeout(function () {
            applyFact(fact);
            textEl.classList.remove('is-rolling');
            emojiEl.classList.remove('is-rolling');
            if (cardEl) {
                cardEl.classList.remove('is-reveal');
                void cardEl.offsetWidth;
                cardEl.classList.add('is-reveal');
            }
            seen++;
            updateMeta();
            rolling = false;
            btnEl.disabled = false;
            btnEl.classList.remove('is-spinning');
        }, 220);
    }

    btnEl.addEventListener('click', roll);

    if (copyBtnEl) {
        copyBtnEl.addEventListener('click', function () {
            if (!currentFact) return;
            const shareText = currentFact.emoji + ' ' + currentFact.text + ' — Proteiner.pl/fun-fakty';
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(shareText).then(function () {
                    copyBtnEl.textContent = 'Skopiowano!';
                    window.setTimeout(function () {
                        copyBtnEl.textContent = 'Kopiuj fakt';
                    }, 1800);
                }).catch(function () { /* ignore */ });
            }
        });
    }

    function setPool(cat, restoredBag) {
        const valid = cat === ALL_CAT || categoriesOf(FULL_FACTS).indexOf(cat) !== -1;
        activeCat = valid ? cat : ALL_CAT;
        FUN_FACTS = activeCat === ALL_CAT ? FULL_FACTS : FULL_FACTS.filter(function (f) {
            return f.tag === activeCat;
        });
        if (!FUN_FACTS.length) {
            FUN_FACTS = FULL_FACTS;
            activeCat = ALL_CAT;
        }

        let restored = null;
        if (Array.isArray(restoredBag)) {
            restored = restoredBag.filter(function (i) {
                return Number.isInteger(i) && i >= 0 && i < FUN_FACTS.length;
            });
        }
        bag = restored && restored.length ? restored : shuffle(FUN_FACTS.map(function (_, i) { return i; }));

        seen = 0;
        currentFact = null;
        saveCat(activeCat);
        if (progressEl) progressEl.style.width = '0%';
        renderCats();
        updateMeta();
        roll();
    }

    function selectCat(cat) {
        if (rolling || cat === activeCat) return;
        setPool(cat, null);
    }

    function boot() {
        const stored = readStored();
        const initialCat = (stored && stored.cat) || readStoredCat() || ALL_CAT;
        setPool(initialCat, stored ? stored.bag : null);
    }

    // Try to load the full 1000-fact pool; fall back to built-in facts.
    if (window.fetch) {
        fetch('fun-facts-new.json', { cache: 'no-store' })
            .then(function (r) {
                if (!r.ok) throw new Error('http ' + r.status);
                return r.json();
            })
            .then(function (data) {
                if (Array.isArray(data) && data.length) FULL_FACTS = data;
                boot();
            })
            .catch(function () {
                boot();
            });
    } else {
        boot();
    }
})();
