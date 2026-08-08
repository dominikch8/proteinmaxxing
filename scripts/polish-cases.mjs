/**
 * Odmiana nazw produktów przez przypadki + podświetlenie w opisach.
 */
import { detectGender } from './polish-gender.mjs';

const MARKER = '[[PN|';
const MARKER_END = '|PN]]';

/** @typedef {'nom'|'gen'|'acc'|'dat'|'inst'|'loc'} GramCase */

const WORD_CASES = new Map([
    ['nutella', { gen: 'Nutelli', acc: 'Nutellę', dat: 'Nutelli', inst: 'Nutellą', loc: 'Nutelli' }],
    ['twaróg', { gen: 'twarogu', acc: 'twaróg', inst: 'twarogiem', loc: 'twarogu' }],
    ['ser', { gen: 'sera', acc: 'ser', inst: 'serem', loc: 'serze' }],
    ['ryż', { gen: 'ryżu', acc: 'ryż', inst: 'ryżem', loc: 'ryżu' }],
    ['makaron', { gen: 'makaronu', acc: 'makaron', inst: 'makaronem', loc: 'makaronie' }],
    ['pierś', { gen: 'piersi', acc: 'pierś', inst: 'piersią', loc: 'piersi' }],
    ['wołowina', { gen: 'wołowiny', acc: 'wołowinę', inst: 'wołowiną', loc: 'wołowinie' }],
    ['wieprzowina', { gen: 'wieprzowiny', acc: 'wieprzowinę', inst: 'wieprzowiną', loc: 'wieprzowinie' }],
    ['szynka', { gen: 'szynki', acc: 'szynkę', inst: 'szynką', loc: 'szynce' }],
    ['kiełbasa', { gen: 'kiełbasy', acc: 'kiełbasę', inst: 'kiełbasą', loc: 'kiełbasie' }],
    ['kasza', { gen: 'kaszy', acc: 'kaszę', inst: 'kaszą', loc: 'kaszy' }],
    ['pizza', { gen: 'pizzy', acc: 'pizzę', inst: 'pizzą', loc: 'pizzy' }],
    ['jajko', { gen: 'jajka', acc: 'jajko', inst: 'jajkiem', loc: 'jajku' }],
    ['mleko', { gen: 'mleka', acc: 'mleko', inst: 'mlekiem', loc: 'mleku' }],
    ['masło', { gen: 'masła', acc: 'masło', inst: 'masłem', loc: 'maśle' }],
    ['mięso', { gen: 'mięsa', acc: 'mięso', inst: 'mięsem', loc: 'mięsie' }],
    ['pomidor', { gen: 'pomidora', acc: 'pomidora', inst: 'pomidorze', loc: 'pomidorze' }],
    ['banan', { gen: 'banana', acc: 'banana', inst: 'bananem', loc: 'bananie' }],
    ['morele', { gen: 'moreli', acc: 'morele', inst: 'morelami', loc: 'morelach' }],
    ['pieczarki', { gen: 'pieczarek', acc: 'pieczarki', inst: 'pieczarkami', loc: 'pieczarkach' }],
    ['dorsz', { gen: 'dorsza', acc: 'dorsza', inst: 'dorszem', loc: 'dorszu' }],
    ['tuńczyk', { gen: 'tuńczyka', acc: 'tuńczyka', inst: 'tuńczykiem', loc: 'tuńczyku' }],
    ['łosoś', { gen: 'łososia', acc: 'łososia', inst: 'łososiem', loc: 'łososiu' }],
    ['śledź', { gen: 'śledzia', acc: 'śledzia', inst: 'śledziem', loc: 'śledziu' }],
    ['kurczak', { gen: 'kurczaka', acc: 'kurczaka', inst: 'kurczakiem', loc: 'kurczaku' }],
    ['indyk', { gen: 'indyka', acc: 'indyka', inst: 'indykiem', loc: 'indyku' }],
    ['jogurt', { gen: 'jogurtu', acc: 'jogurt', inst: 'jogurtem', loc: 'jogurcie' }],
    ['kefir', { gen: 'kefiru', acc: 'kefir', inst: 'kefirem', loc: 'kefirze' }],
    ['hummus', { gen: 'hummusu', acc: 'hummus', inst: 'hummusem', loc: 'hummusie' }],
    ['majonez', { gen: 'majonezu', acc: 'majonez', inst: 'majonezem', loc: 'majonezie' }],
    ['ketchup', { gen: 'ketchupu', acc: 'ketchup', inst: 'ketchupem', loc: 'ketchupie' }],
    ['bulgur', { gen: 'bulguru', acc: 'bulgur', inst: 'bulgurem', loc: 'bulgurze' }],
    ['brokuły', { gen: 'brokułów', acc: 'brokuły', inst: 'brokułami', loc: 'brokułach' }],
    ['krewetki', { gen: 'krewetek', acc: 'krewetki', inst: 'krewetkami', loc: 'krewetkach' }],
    ['płatki', { gen: 'płatków', acc: 'płatki', inst: 'płatkami', loc: 'płatkach' }],
    ['ziemniaki', { gen: 'ziemniaków', acc: 'ziemniaki', inst: 'ziemniakami', loc: 'ziemniakach' }],
    ['pierogi', { gen: 'pierogów', acc: 'pierogi', inst: 'pierogami', loc: 'pierogach' }],
    ['naleśniki', { gen: 'naleśników', acc: 'naleśniki', inst: 'naleśnikami', loc: 'naleśnikach' }],
    ['gołąbki', { gen: 'gołąbków', acc: 'gołąbki', inst: 'gołąbkami', loc: 'gołąbkach' }],
    ['kluski', { gen: 'klusek', acc: 'kluski', inst: 'kluskami', loc: 'kluskach' }],
    ['krokiety', { gen: 'krokietów', acc: 'krokiety', inst: 'krokietami', loc: 'krokietach' }],
    ['placki', { gen: 'placzków', acc: 'placki', inst: 'placzkami', loc: 'placzkach' }],
    ['herbatniki', { gen: 'herbatników', acc: 'herbatniki', inst: 'herbatnikami', loc: 'herbatnikach' }],
    ['krakersy', { gen: 'krakersów', acc: 'krakersy', inst: 'krakersami', loc: 'krakersach' }],
    ['pomidorki', { gen: 'pomidorków', acc: 'pomidorki', inst: 'pomidorkami', loc: 'pomidorkach' }],
    ['pistacje', { gen: 'pistacji', acc: 'pistacje', inst: 'pistacjami', loc: 'pistacjach' }],
    ['jagody', { gen: 'jagód', acc: 'jagody', inst: 'jagodami', loc: 'jagodach' }],
    ['wiśnie', { gen: 'wiśni', acc: 'wiśnie', inst: 'wiśniami', loc: 'wiśniach' }],
    ['czereśnie', { gen: 'czereśni', acc: 'czereśnie', inst: 'czereśniami', loc: 'czereśniach' }],
    ['pyzy', { gen: 'pyz', acc: 'pyzy', inst: 'pyzami', loc: 'pyzach' }],
    ['frytki', { gen: 'frytek', acc: 'frytki', inst: 'frytkami', loc: 'frytkach' }],
    ['lody', { gen: 'lodów', acc: 'lody', inst: 'lodami', loc: 'lodach' }],
    ['żelki', { gen: 'żelek', acc: 'żelki', inst: 'żelkami', loc: 'żelkach' }],
    ['chipsy', { gen: 'chipsów', acc: 'chipsy', inst: 'chipsami', loc: 'chipsach' }],
    ['orzechy', { gen: 'orzechów', acc: 'orzechy', inst: 'orzechami', loc: 'orzechach' }],
    ['migdały', { gen: 'migdałów', acc: 'migdały', inst: 'migdałami', loc: 'migdałach' }],
    ['nasiona', { gen: 'nasion', acc: 'nasiona', inst: 'nasionami', loc: 'nasionach' }],
    ['skrzydełka', { gen: 'skrzydełek', acc: 'skrzydełka', inst: 'skrzydełkami', loc: 'skrzydełkach' }],
    ['żeberka', { gen: 'żeberek', acc: 'żeberka', inst: 'żeberkami', loc: 'żeberkach' }],
    ['ciastka', { gen: 'ciastek', acc: 'ciastka', inst: 'ciastkami', loc: 'ciastkach' }],
    ['białka', { gen: 'białek', acc: 'białka', inst: 'białkami', loc: 'białkach' }],
    ['wafle', { gen: 'wafli', acc: 'wafle', inst: 'waflami', loc: 'waflach' }],
    ['otręby', { gen: 'otrąb', acc: 'otręby', inst: 'otrębami', loc: 'otrębach' }],
    ['penne', { gen: 'penne', acc: 'penne', inst: 'penne', loc: 'penne' }],
    ['lasagne', { gen: 'lasagne', acc: 'lasagne', inst: 'lasagne', loc: 'lasagne' }],
    ['pho', { gen: 'pho', acc: 'pho', inst: 'pho', loc: 'pho' }],
    ['sos', { gen: 'sosu', acc: 'sos', inst: 'sosem', loc: 'sosie' }],
    ['krem', { gen: 'kremu', acc: 'krem', inst: 'kremem', loc: 'kremie' }],
    ['chleb', { gen: 'chleba', acc: 'chleb', inst: 'chlebem', loc: 'chlebie' }],
    ['pasztet', { gen: 'pasztetu', acc: 'pasztet', inst: 'pasztetem', loc: 'pasztecie' }],
    ['barszcz', { gen: 'barszczu', acc: 'barszcz', inst: 'barszczem', loc: 'barszczu' }],
    ['olej', { gen: 'oleju', acc: 'olej', inst: 'olejem', loc: 'oleju' }],
    ['miód', { gen: 'miodu', acc: 'miód', inst: 'miodem', loc: 'miodzie' }],
    ['dżem', { gen: 'dżemu', acc: 'dżem', inst: 'dżemem', loc: 'dżemie' }],
    ['tłuszcz', { gen: 'tłuszczu', acc: 'tłuszcz', inst: 'tłuszczem', loc: 'tłuszczu' }],
    ['szpinak', { gen: 'szpinaku', acc: 'szpinak', inst: 'szpinakiem', loc: 'szpinaku' }],
    ['ogórek', { gen: 'ogórka', acc: 'ogórek', inst: 'ogórkiem', loc: 'ogórku' }],
    ['śmietana', { gen: 'śmietany', acc: 'śmietanę', inst: 'śmietaną', loc: 'śmietanie' }],
    ['śmietanka', { gen: 'śmietanki', acc: 'śmietankę', inst: 'śmietanką', loc: 'śmietance' }],
    ['mąka', { gen: 'mąki', acc: 'mąkę', inst: 'mąką', loc: 'mące' }],
    ['sałatka', { gen: 'sałatki', acc: 'sałatkę', inst: 'sałatką', loc: 'sałatce' }],
    ['sałata', { gen: 'sałaty', acc: 'sałatę', inst: 'sałatą', loc: 'sałacie' }],
    ['papryka', { gen: 'papryki', acc: 'paprykę', inst: 'papryką', loc: 'papryce' }],
    ['fasola', { gen: 'fasoli', acc: 'fasolę', inst: 'fasolą', loc: 'fasoli' }],
    ['fasolka', { gen: 'fasolki', acc: 'fasolkę', inst: 'fasolką', loc: 'fasolce' }],
    ['kapusta', { gen: 'kapusty', acc: 'kapustę', inst: 'kapustą', loc: 'kapuście' }],
    ['dynia', { gen: 'dyni', acc: 'dynię', inst: 'dynią', loc: 'dyni' }],
    ['bazylia', { gen: 'bazylii', acc: 'bazylię', inst: 'bazylią', loc: 'bazylii' }],
    ['makrela', { gen: 'makreli', acc: 'makrelę', inst: 'makrelą', loc: 'makreli' }],
    ['polędwica', { gen: 'polędwicy', acc: 'polędwicę', inst: 'polędwicą', loc: 'polędwicy' }],
    ['manna', { gen: 'manny', acc: 'mannę', inst: 'manną', loc: 'mannie' }],
    ['kajzerka', { gen: 'kajzerki', acc: 'kajzerkę', inst: 'kajzerką', loc: 'kajzerce' }],
    ['grahamka', { gen: 'grahamki', acc: 'grahamkę', inst: 'grahamką', loc: 'grahamce' }],
    ['pasztetowa', { gen: 'pasztetowej', acc: 'pasztetową', inst: 'pasztetową', loc: 'pasztetowej' }],
    ['babka', { gen: 'babki', acc: 'babkę', inst: 'babką', loc: 'babce' }],
    ['szarlotka', { gen: 'szarlotki', acc: 'szarlotkę', inst: 'szarlotką', loc: 'szarlotce' }],
    ['brukselka', { gen: 'brukselki', acc: 'brukselkę', inst: 'brukselką', loc: 'brukselce' }],
    ['kaczka', { gen: 'kaczki', acc: 'kaczkę', inst: 'kaczką', loc: 'kaczce' }],
    ['karkówka', { gen: 'karkówki', acc: 'karkówkę', inst: 'karkówką', loc: 'karkówce' }],
    ['wątróbka', { gen: 'wątróbki', acc: 'wątróbkę', inst: 'wątróbką', loc: 'wątróbce' }],
    ['golonka', { gen: 'golonki', acc: 'golonkę', inst: 'golonką', loc: 'golonce' }],
    ['zapiekanka', { gen: 'zapiekanki', acc: 'zapiekankę', inst: 'zapiekanką', loc: 'zapiekance' }],
    ['pietruszka', { gen: 'pietruszki', acc: 'pietruszkę', inst: 'pietruszką', loc: 'pietruszce' }],
    ['chia', { gen: 'chia', acc: 'chia', inst: 'chia', loc: 'chia' }],
    ['bigos', { gen: 'bigosu', acc: 'bigos', inst: 'bigosem', loc: 'bigosie' }],
    ['żurek', { gen: 'żurku', acc: 'żurek', inst: 'żurkiem', loc: 'żurku' }],
    ['rosół', { gen: 'rosołu', acc: 'rosół', inst: 'rosołem', loc: 'rosole' }],
    ['bułka', { gen: 'bułki', acc: 'bułkę', inst: 'bułką', loc: 'bułce' }],
    ['bagietka', { gen: 'bagietki', acc: 'bagietkę', inst: 'bagietką', loc: 'bagietce' }],
    ['granola', { gen: 'granoli', acc: 'granola', inst: 'granola', loc: 'granoli' }],
    ['owsianka', { gen: 'owsianki', acc: 'owsiankę', inst: 'owsianką', loc: 'owsiance' }],
    ['jajecznica', { gen: 'jajecznicy', acc: 'jajecznicę', inst: 'jajecznicą', loc: 'jajecnicy' }],
    ['grochówka', { gen: 'grochówki', acc: 'grochówkę', inst: 'grochówką', loc: 'grochówce' }],
    ['kapuśniak', { gen: 'kapuśniaku', acc: 'kapuśniak', inst: 'kapuśniakiem', loc: 'kapuśniaku' }],
    ['quinoa', { gen: 'quinoi', acc: 'quinoa', inst: 'quinoa', loc: 'quinoi' }],
    ['komosa', { gen: 'komosy', acc: 'komosę', inst: 'komosą', loc: 'komosie' }],
    ['cola', { gen: 'coli', acc: 'colę', inst: 'colą', loc: 'coli' }],
    ['herbata', { gen: 'herbaty', acc: 'herbatę', inst: 'herbatą', loc: 'herbacie' }],
    ['kawa', { gen: 'kawy', acc: 'kawę', inst: 'kawą', loc: 'kawie' }],
    ['woda', { gen: 'wody', acc: 'wodę', inst: 'wodą', loc: 'wodzie' }],
    ['odżywka', { gen: 'odżywki', acc: 'odżywkę', inst: 'odżywką', loc: 'odżywce' }],
    ['izolat', { gen: 'izolatu', acc: 'izolat', inst: 'izolatem', loc: 'izolacie' }],
    ['koncentrat', { gen: 'koncentratu', acc: 'koncentrat', inst: 'koncentratem', loc: 'koncentracie' }],
    ['jarmuż', { gen: 'jarmużu', acc: 'jarmuż', inst: 'jarmużem', loc: 'jarmużu' }],
    ['budyń', { gen: 'budyniu', acc: 'budyń', inst: 'budyniem', loc: 'budyniu' }],
]);

/** Pełne nazwy produktów z ręczną odmianą (gdy heurystyka nie daje rady). */
const PHRASE_CASES = new Map([
    ['nasiona chia', { gen: 'nasion chia', acc: 'nasiona chia', inst: 'nasionami chia', loc: 'nasionach chia' }],
    ['nasiona lniane', { gen: 'nasion lnianych', acc: 'nasiona lniane', inst: 'nasionami lnianymi', loc: 'nasionach lnianych' }],
    ['nasiona słonecznika', { gen: 'nasion słonecznika', acc: 'nasiona słonecznika', inst: 'nasionami słonecznika', loc: 'nasionach słonecznika' }],
    ['mięso mielone wołowe', { gen: 'mięsa mielonego wołowego', acc: 'mięso mielone wołowe', inst: 'mięsem mielonym wołowym', loc: 'mięsie mielonym wołowym' }],
    ['kotlety mielone drobiowe', { gen: 'kotletów mielonych drobiowych', acc: 'kotlety mielone drobiowe', inst: 'kotletami mielonymi drobiowymi', loc: 'kotletach mielonych drobiowych' }],
    ['bułka kajzerka', { gen: 'bułki kajzerki', acc: 'bułkę kajzerkę', inst: 'bułką kajzerką', loc: 'bułce kajzerce' }],
    ['bułka grahamka', { gen: 'bułki grahamki', acc: 'bułkę grahamkę', inst: 'bułką grahamką', loc: 'bułce grahamce' }],
    ['kasza manna', { gen: 'kaszy manny', acc: 'kaszę mannę', inst: 'kaszą manną', loc: 'kaszy mannie' }],
    ['chleb żytni pełnoziarnisty', { gen: 'chleba żytniego pełnoziarnistego', acc: 'chleb żytni pełnoziarnisty', inst: 'chlebem żytnim pełnoziarnistym', loc: 'chlebie żytnim pełnoziarnistym' }],
    ['ser kozi miękki', { gen: 'sera koziego miękkiego', acc: 'ser kozi miękki', inst: 'serem kozim miękkim', loc: 'serze kozim miękkim' }],
    ['pomidorowa z ryżem', { gen: 'pomidorowej z ryżem', acc: 'pomidorową z ryżem', inst: 'pomidorową z ryżem', loc: 'pomidorowej z ryżem' }],
    ['czekolada gorzka', { gen: 'czekolady gorzkiej', acc: 'czekoladę gorzką', inst: 'czekoladą gorzką', loc: 'czekoladzie gorzkiej' }],
    ['feliciana margherita', { gen: 'Feliciana Margherita', acc: 'Feliciana Margherita', inst: 'Feliciana Margherita', loc: 'Feliciana Margherita' }],
    ['feliciana speciale', { gen: 'Feliciana Speciale', acc: 'Feliciana Speciale', inst: 'Feliciana Speciale', loc: 'Feliciana Speciale' }],
    ['feliciana prosciutto e funghi', { gen: 'Feliciana Prosciutto e Funghi', acc: 'Feliciana Prosciutto e Funghi', inst: 'Feliciana Prosciutto e Funghi', loc: 'Feliciana Prosciutto e Funghi' }],
    ['feliciana quattro formaggi', { gen: 'Feliciana Quattro Formaggi', acc: 'Feliciana Quattro Formaggi', inst: 'Feliciana Quattro Formaggi', loc: 'Feliciana Quattro Formaggi' }],
    ['milky way', { gen: 'Milky Way', acc: 'Milky Way', inst: 'Milky Way', loc: 'Milky Way' }],
]);

const PLURAL_NOUNS = new Set([
    'morele', 'pieczarki', 'krewetki', 'płatki', 'ziemniaki', 'pierogi', 'frytki', 'lody', 'żelki',
    'chipsy', 'orzechy', 'migdały', 'brokuły', 'stripsy', 'nuggetsy', 'gofry', 'parówki', 'jagody',
    'maliny', 'truskawki', 'borówki', 'śliwki', 'gruszki', 'pomidory', 'ogórki', 'marchewki', 'penne',
    'nasiona', 'skrzydełka', 'żeberka', 'ciastka', 'białka', 'naleśniki', 'gołąbki', 'kluski',
    'krokiety', 'placki', 'herbatniki', 'krakersy', 'pomidorki', 'pistacje', 'wiśnie', 'czereśnie',
    'pyzy', 'wafle', 'otręby', 'kotlety',
]);

/** Rzeczowniki często mylone z przymiotnikami (końcówka -na/-ne/-a). */
const NOUN_BLOCKLIST = new Set([
    'śmietana', 'śmietanka', 'nasiona', 'chia', 'pizza', 'quinoa', 'granola', 'cola', 'woda', 'kawa',
    'herbata', 'kasza', 'papryka', 'fasola', 'soczewica', 'dynia', 'cukinia', 'sałata', 'kapusta',
    'polędwica', 'makrela', 'manna', 'kajzerka', 'grahamka', 'bazylia', 'wołowina', 'wieprzowina',
]);

function preserveCase(original, declined) {
    const oParts = original.split(/\s+/);
    return declined
        .split(/\s+/)
        .map((part, i) => {
            if (oParts[i] && oParts[i][0] === oParts[i][0].toUpperCase()) {
                return part.charAt(0).toUpperCase() + part.slice(1);
            }
            return part;
        })
        .join(' ');
}

function isAdjectiveWord(word) {
    const w = word.toLowerCase();
    if (PLURAL_NOUNS.has(w) || WORD_CASES.has(w) || NOUN_BLOCKLIST.has(w)) return false;
    // Wyraźne przymiotniki / imiesłowy — bez szerokiego /na$/ (łapie „nasiona”, „śmietana”).
    return /(owy|owa|owe|cki|cka|cke|ski|ska|skie|kie|chudy|chuda|chude|gotowane|gotowana|gotowany|świeży|świeża|świeże|swiezy|mielony|mielona|mielone|naturalny|naturalna|naturalne|półtłusty|półtłusta|poltlusty|tłusty|tłusta|tłuste|suchy|sucha|suche|biały|biała|białe|brązowy|brązowa|brązowe|czekoladowy|czekoladowa|czekoladowe|wieprzowy|wieprzowa|wieprzowe|wołowy|wołowa|wołowe|drobiowy|drobiowa|drobiowe|kurzy|kurza|kurze|atlantycki|suszony|suszona|suszone|marynowany|marynowana|marynowane|panierowany|wędzony|wędzona|wędzone|ugotowany|mrożony|mrożona|mrożone|krojony|pieczony|pieczona|pieczone|smażony|smażona|smażone|pełny|pełna|pełne|lniane|lniany|owsiane|owsiany|pszenny|pszenna|pszenne|jajeczny|jajeczna|ryżowy|ryżowa|ryżowe|pomidorowy|pomidorowa|czosnkowy|tatarski|sojowy|ostry|ostra|ostre|słodko-kwaśny|holenderski|musztardowo-miodowy|brokułowy|grecka|grecki|greckie|jarzynowa|żółty|żółta|żółte|zielony|zielona|zielone|czerwony|czerwona|czerwone|włoskie|włoski|włoska|brazylijskie|prażone|prażony|prażona|tłuczone|tłuczony|drożdżowa|drożdżowy|makaronowa|makaronowy|jęczmienna|jęczmienny|szparagowa|żytni|żytnia|żytnie|pitny|pitna|pełnoziarnisty|pełnoziarnista|pełnoziarniste|homogenizowany|homogenizowana|kozi|kozia|kozie|miękki|miękka|miękkie|krucha|kruchy|kruche|chińska|chiński|chińskie|tostowy|tostowa|masłowa|masłowy|jaglana|gryczana|gryczany|razowy|razowa|orkiszowy|orkiszowa|sernikowy|sernikowa|kokosowy|kokosowa|owocowy|owocowa|wiejski|wiejska|wiejskie|edamski|topiony|topiona|pleśniowy|roślinne|roślinny|roślinna|sojowe|sojowa|klarowane|klarowany|sezamowa|sezamowy|maślane|maślany|podwójny|podwójna|leniwe|leniwy|śląskie|śląski|śląska|laskowe|laskowy|łuskane|solone|solony|kukurydziane|kukurydziany|koktajlowe|koktajlowy|kremowa|kremowy|gulaszowa|fasolowa|szczawiowa|cebulowa|kalafiorowa|dyniowa|grzybowa|pieczarkowa|ogórkowa|jarzynowy|słodzone|słodzony|skondensowane|dziki|dzika|jałowcowy|podwawelski|rzymski|myśliwska|parówkowa|krakowska|parmeńska|pekińska|hawajska|meksykańska|sopocka|łososiowa|gorzka|gorzki|gorzkie)$/i.test(
        w
    ) || /(one|ane|owe|ony|ana|eny|yna|yny|cki|ski|kie|skie|isty|ista|iste|ny|na|ne|ły|ła|łe|ty|ta|te|wy|wa|we|żony|żona|żone|any|ana|ane|ony|ona|one)$/i.test(w)
        || /^(kozi|żytni|pitny|dziki|miękki|ostry|świeży)$/i.test(w);
}

function isLikelyNoun(word) {
    const w = word.toLowerCase();
    if (WORD_CASES.has(w) || PLURAL_NOUNS.has(w)) return true;
    if (/^(z|ze)$/i.test(word)) return false;
    return !isAdjectiveWord(word);
}

function isPluralNoun(word) {
    const w = word.toLowerCase();
    if (PLURAL_NOUNS.has(w)) return true;
    return detectGender(word) === 'pl';
}

function namePattern(parts) {
    const zIdx = parts.findIndex((p) => /^z(e)?$/i.test(p));
    if (zIdx > 0) return 'noun-z-noun';

    if (parts.length >= 2 && isAdjectiveWord(parts[0]) && isLikelyNoun(parts[parts.length - 1])) {
        return 'adj-noun';
    }
    if (parts.length >= 2 && isLikelyNoun(parts[0]) && isAdjectiveWord(parts[parts.length - 1])) {
        return 'noun-adj';
    }
    if (parts.length >= 2 && isLikelyNoun(parts[0]) && isAdjectiveWord(parts[1])) {
        return 'noun-adj';
    }
    return 'single';
}

function declineAdjective(adj, gender, grammaticalCase, plural = false) {
    if (grammaticalCase === 'nom') return adj;
    // Biernik = mianownik dla męskich nieżywotnych i nijakich; dopełniacz tylko dla żywotnych męskich.
    // W nazwach żywności domyślnie nieżywotne → acc jak nom (poza żeńskim).
    if (grammaticalCase === 'acc' && !plural && gender !== 'f' && gender !== 'pl') {
        return adj;
    }

    if (plural || gender === 'pl') {
        if (grammaticalCase === 'gen' || grammaticalCase === 'loc') {
            if (/one$/i.test(adj)) return adj.replace(/one$/i, 'onych');
            if (/ane$/i.test(adj)) return adj.replace(/ane$/i, 'anych');
            if (/owe$/i.test(adj)) return adj.replace(/owe$/i, 'owych');
            if (/skie$/i.test(adj)) return adj.replace(/skie$/i, 'skich');
            if (/ckie$/i.test(adj)) return adj.replace(/ckie$/i, 'ckich');
            if (/kie$/i.test(adj)) return adj.replace(/kie$/i, 'kich');
            if (/ne$/i.test(adj)) return adj.replace(/ne$/i, 'nych');
            if (/łe$/i.test(adj)) return adj.replace(/łe$/i, 'łych');
            if (/te$/i.test(adj)) return adj.replace(/te$/i, 'tych');
            if (/we$/i.test(adj)) return adj.replace(/we$/i, 'wych');
            if (/y$/i.test(adj)) return adj.replace(/y$/i, 'ych');
            if (/i$/i.test(adj)) return adj.replace(/i$/i, 'ich');
            if (/e$/i.test(adj)) return adj.replace(/e$/i, 'ych');
        }
        if (grammaticalCase === 'inst') {
            if (/one$/i.test(adj)) return adj.replace(/one$/i, 'onymi');
            if (/ane$/i.test(adj)) return adj.replace(/ane$/i, 'anymi');
            if (/owe$/i.test(adj)) return adj.replace(/owe$/i, 'owymi');
            if (/skie$/i.test(adj)) return adj.replace(/skie$/i, 'skimi');
            if (/kie$/i.test(adj)) return adj.replace(/kie$/i, 'kimi');
            if (/ne$/i.test(adj)) return adj.replace(/ne$/i, 'nymi');
            if (/e$/i.test(adj)) return adj.replace(/e$/i, 'ymi');
        }
        return adj;
    }

    if (/chudy$/i.test(adj)) {
        if (grammaticalCase === 'gen') return adj.replace(/chudy$/i, 'chudego');
        if (grammaticalCase === 'inst') return adj.replace(/chudy$/i, 'chudym');
    }
    if (/chuda$/i.test(adj)) {
        if (grammaticalCase === 'gen') return adj.replace(/chuda$/i, 'chudej');
        if (grammaticalCase === 'acc') return adj.replace(/chuda$/i, 'chudą');
        if (grammaticalCase === 'inst') return adj.replace(/chuda$/i, 'chudą');
    }
    if (/chude$/i.test(adj)) {
        if (grammaticalCase === 'gen') return adj.replace(/chude$/i, 'chudego');
    }
    if (/gotowane$/i.test(adj)) return adj.replace(/gotowane$/i, grammaticalCase === 'gen' ? 'gotowanych' : adj);
    if (/gotowana$/i.test(adj)) {
        if (grammaticalCase === 'gen') return adj.replace(/gotowana$/i, 'gotowanej');
        if (grammaticalCase === 'acc' || grammaticalCase === 'inst') return adj.replace(/gotowana$/i, 'gotowaną');
    }
    if (/marynowane$/i.test(adj)) return adj.replace(/marynowane$/i, grammaticalCase === 'gen' ? 'marynowanych' : adj);
    if (/świeży$/i.test(adj) || /swiezy$/i.test(adj)) {
        if (grammaticalCase === 'gen') return adj.replace(/(świeży|swiezy)$/i, 'świeżego');
        if (grammaticalCase === 'inst') return adj.replace(/(świeży|swiezy)$/i, 'świeżym');
    }
    if (/świeża$/i.test(adj)) {
        if (grammaticalCase === 'gen') return adj.replace(/świeża$/i, 'świeżej');
        if (grammaticalCase === 'acc' || grammaticalCase === 'inst') return adj.replace(/świeża$/i, 'świeżą');
    }
    if (/atlantycki$/i.test(adj)) {
        if (grammaticalCase === 'gen') return adj.replace(/atlantycki$/i, 'atlantyckiego');
    }
    if (/owy$/i.test(adj)) {
        if (grammaticalCase === 'gen') return adj.replace(/owy$/i, 'owego');
        if (grammaticalCase === 'inst') return adj.replace(/owy$/i, 'owym');
    }
    if (/owa$/i.test(adj)) {
        if (grammaticalCase === 'gen') return adj.replace(/owa$/i, 'owej');
        if (grammaticalCase === 'acc') return adj.replace(/owa$/i, 'ową');
        if (grammaticalCase === 'inst') return adj.replace(/owa$/i, 'ową');
    }
    if (/owa$/i.test(adj) === false && /cka$/i.test(adj)) {
        if (grammaticalCase === 'gen') return adj.replace(/cka$/i, 'ckiej');
        if (grammaticalCase === 'acc') return adj.replace(/cka$/i, 'cką');
        if (grammaticalCase === 'inst') return adj.replace(/cka$/i, 'cką');
    }
    if (/ska$/i.test(adj)) {
        if (grammaticalCase === 'gen') return adj.replace(/ska$/i, 'skiej');
        if (grammaticalCase === 'acc') return adj.replace(/ska$/i, 'ską');
        if (grammaticalCase === 'inst') return adj.replace(/ska$/i, 'ską');
    }
    if (/owa$/i.test(adj) === false && /ła$/i.test(adj)) {
        if (grammaticalCase === 'gen') return adj.replace(/ła$/i, 'łej');
        if (grammaticalCase === 'acc' || grammaticalCase === 'inst') return adj.replace(/ła$/i, 'łą');
    }
    if (/ta$/i.test(adj) && !/ista$/i.test(adj)) {
        if (grammaticalCase === 'gen') return adj.replace(/ta$/i, 'tej');
        if (grammaticalCase === 'acc' || grammaticalCase === 'inst') return adj.replace(/ta$/i, 'tą');
    }
    if (/owe$/i.test(adj)) {
        if (grammaticalCase === 'gen') return adj.replace(/owe$/i, 'owego');
        if (grammaticalCase === 'inst') return adj.replace(/owe$/i, 'owym');
    }
    if (/isty$/i.test(adj)) {
        if (grammaticalCase === 'gen') return adj.replace(/isty$/i, 'istego');
        if (grammaticalCase === 'inst') return adj.replace(/isty$/i, 'istym');
    }
    if (/ny$/i.test(adj)) {
        if (grammaticalCase === 'gen' && gender === 'f') return adj.replace(/ny$/i, 'nej');
        if (grammaticalCase === 'acc' && gender === 'f') return adj.replace(/ny$/i, 'ną');
        if (grammaticalCase === 'gen') return adj.replace(/ny$/i, 'nego');
        if (grammaticalCase === 'inst') return adj.replace(/ny$/i, 'nym');
    }
    if (/na$/i.test(adj)) {
        if (grammaticalCase === 'gen') return adj.replace(/na$/i, 'nej');
        if (grammaticalCase === 'acc') return adj.replace(/na$/i, 'ną');
        if (grammaticalCase === 'inst') return adj.replace(/na$/i, 'ną');
    }
    if (/ne$/i.test(adj) && gender === 'n') {
        if (grammaticalCase === 'gen') return adj.replace(/ne$/i, 'nego');
        if (grammaticalCase === 'inst') return adj.replace(/ne$/i, 'nym');
    }
    if (/ty$/i.test(adj)) {
        if (grammaticalCase === 'gen') return adj.replace(/ty$/i, 'tego');
        if (grammaticalCase === 'inst') return adj.replace(/ty$/i, 'tym');
    }
    if (/ły$/i.test(adj)) {
        if (grammaticalCase === 'gen') return adj.replace(/ły$/i, 'łego');
        if (grammaticalCase === 'inst') return adj.replace(/ły$/i, 'łym');
    }
    if (/wy$/i.test(adj)) {
        if (grammaticalCase === 'gen') return adj.replace(/wy$/i, 'wego');
        if (grammaticalCase === 'inst') return adj.replace(/wy$/i, 'wym');
    }
    if (/ski$/i.test(adj) || /cki$/i.test(adj)) {
        if (grammaticalCase === 'gen') return adj.replace(/(ski|cki)$/i, (m) => m.slice(0, -1) + 'iego');
        if (grammaticalCase === 'inst') return adj.replace(/(ski|cki)$/i, (m) => m.slice(0, -1) + 'im');
    }
    if (/ki$/i.test(adj) && !/(ski|cki)$/i.test(adj)) {
        if (grammaticalCase === 'gen') return adj.replace(/ki$/i, 'kiego');
        if (grammaticalCase === 'inst') return adj.replace(/ki$/i, 'kim');
    }
    // miękkie przymiotniki męskie: żytni, kozi, dziki, pitny już /ny/
    if (/[żźćńśł]?i$/i.test(adj) && !/(ski|cki|ki)$/i.test(adj) && gender !== 'f') {
        if (grammaticalCase === 'gen') return adj.replace(/i$/i, 'iego');
        if (grammaticalCase === 'inst') return adj.replace(/i$/i, 'im');
    }
    if (/ia$/i.test(adj) && gender === 'f') {
        if (grammaticalCase === 'gen') return adj.replace(/ia$/i, 'iej');
        if (grammaticalCase === 'acc' || grammaticalCase === 'inst') return adj.replace(/ia$/i, 'ią');
    }
    if (/ony$/i.test(adj) || /any$/i.test(adj) || /ęty$/i.test(adj)) {
        if (grammaticalCase === 'gen') return adj.replace(/y$/i, 'ego');
        if (grammaticalCase === 'inst') return adj.replace(/y$/i, 'ym');
    }
    if (/ona$/i.test(adj) || /ana$/i.test(adj) || /ęta$/i.test(adj) || /ucha$/i.test(adj)) {
        if (grammaticalCase === 'gen') return adj.replace(/a$/i, 'ej');
        if (grammaticalCase === 'acc' || grammaticalCase === 'inst') return adj.replace(/a$/i, 'ą');
    }

    return adj;
}

function declineWord(word, grammaticalCase) {
    if (grammaticalCase === 'nom') return word;
    const lower = word.toLowerCase();
    if (WORD_CASES.has(lower)) {
        const forms = WORD_CASES.get(lower);
        return forms[grammaticalCase] || word;
    }

    const gender = detectGender(word);
    const plural = isPluralNoun(word) || gender === 'pl';

    if (plural) {
        if (grammaticalCase === 'gen') {
            if (/niki$/i.test(word)) return word.replace(/niki$/i, 'ników');
            if (/iki$/i.test(word)) return word.replace(/iki$/i, 'ików');
            if (/bki$/i.test(word)) return word.replace(/bki$/i, 'bków');
            if (/dki$/i.test(word)) return word.replace(/dki$/i, 'dków');
            if (/tki$/i.test(word) && !/ątki$/i.test(word)) return word.replace(/tki$/i, 'tków');
            if (/ki$/i.test(word)) return word.replace(/ki$/i, 'ek');
            if (/y$/i.test(word)) return word.replace(/y$/i, 'ów');
            if (/a$/i.test(word)) return word.replace(/a$/i, ''); // nasiona → nasion (fallback)
            if (/e$/i.test(word) && !/ek$/i.test(word)) return word.replace(/e$/i, 'i');
        }
        if (grammaticalCase === 'inst') {
            if (/ki$/i.test(word)) return word.replace(/ki$/i, 'kami');
            if (/y$/i.test(word)) return word.replace(/y$/i, 'ami');
            if (/a$/i.test(word)) return word.replace(/a$/i, 'ami');
            if (/e$/i.test(word)) return word.replace(/e$/i, 'ami');
        }
        return word;
    }

    if (gender === 'f') {
        if (grammaticalCase === 'gen') {
            if (/ica$/i.test(word)) return word.replace(/ica$/i, 'icy');
            if (/ika$/i.test(word)) return word.replace(/ika$/i, 'iki');
            // -nia/-lia/-mia → -ni/-li/-mi (dynia→dyni); inne -ia → -ii
            if (/[nlrm]ia$/i.test(word)) return word.replace(/ia$/i, 'i');
            if (/ia$/i.test(word)) return word.replace(/ia$/i, 'ii');
            // -ka/-ga → -ki/-gi (mąka→mąki, sałatka→sałatki), nie -ky
            if (/ka$/i.test(word)) return word.replace(/ka$/i, 'ki');
            if (/ga$/i.test(word)) return word.replace(/ga$/i, 'gi');
            // po miękkich / l: fasola→fasoli, makrela→makreli
            if (/[lśźćńj]a$/i.test(word)) return word.replace(/a$/i, 'i');
            if (/a$/i.test(word)) return word.replace(/a$/i, 'y');
            if (/ść$/i.test(word)) return word.replace(/ść$/i, 'ści');
        }
        if (grammaticalCase === 'acc') {
            if (/ka$/i.test(word) || /ga$/i.test(word) || /a$/i.test(word)) {
                return word.replace(/a$/i, 'ę');
            }
        }
        if (grammaticalCase === 'inst' && /a$/i.test(word)) return word.replace(/a$/i, 'ą');
        return word;
    }

    if (gender === 'n') {
        if (grammaticalCase === 'gen' && /o$/i.test(word)) return word.replace(/o$/i, 'a');
        if (grammaticalCase === 'gen' && /a$/i.test(word)) return word.replace(/a$/i, ''); // rare neuter pl-looking
        return word;
    }

    if (grammaticalCase === 'gen') {
        if (/ęć$/i.test(word)) return word.replace(/ęć$/i, 'ęcia'); // śledź handled in dict; pięć-like
        if (/ódź$/i.test(word) || /edź$/i.test(word) || /ódź$/i.test(word)) return word.replace(/ź$/i, 'zia');
        if (/oś$/i.test(word) || /oś$/i.test(word)) return word; // handled via dict often
        if (/órek$/i.test(word)) return word.replace(/órek$/i, 'órka');
        if (/ek$/i.test(word)) return word.replace(/ek$/i, 'ka');
        if (/óg$/i.test(word)) return word.replace(/óg$/i, 'ogu');
        if (/acz$/i.test(word) || /arz$/i.test(word) || /usz$/i.test(word) || /eż$/i.test(word) || /óż$/i.test(word) || /asz$/i.test(word) || /isz$/i.test(word)) {
            return word + 'u';
        }
        if (/[bcdfghjklmnprstwzżźćń]$/i.test(word)) return word + 'a';
    }
    if (grammaticalCase === 'acc') {
        // nieżywotne męskie = mianownik
        return word;
    }
    if (grammaticalCase === 'inst') {
        const gen = declineWord(word, 'gen');
        if (gen.endsWith('a')) return gen.slice(0, -1) + 'em';
        return gen + 'em';
    }
    if (grammaticalCase === 'loc') return declineWord(word, 'gen');

    return word;
}

/**
 * @param {string} name
 * @param {GramCase} grammaticalCase
 */
export function declineProductName(name, grammaticalCase) {
    if (!name || grammaticalCase === 'nom') return name;

    const phraseKey = name.toLowerCase().replace(/\([^)]*\)/g, '').trim().replace(/\s+/g, ' ');
    if (PHRASE_CASES.has(phraseKey)) {
        const forms = PHRASE_CASES.get(phraseKey);
        const declined = forms[grammaticalCase] || name;
        return preserveCase(name, declined);
    }

    const parenMatch = name.match(/^(.+?)\s*(\([^)]+\))\s*$/);
    const main = (parenMatch ? parenMatch[1] : name).trim();
    const paren = parenMatch ? ` ${parenMatch[2]}` : '';
    const parts = main.split(/\s+/);
    if (parts.length === 0) return name;

    const pattern = namePattern(parts);
    let declined;

    if (pattern === 'adj-noun') {
        const noun = parts[parts.length - 1];
        const plural = isPluralNoun(noun);
        const g = plural ? 'pl' : detectGender(noun);
        declined = parts
            .map((w, i) => {
                if (i === parts.length - 1) return declineWord(w, grammaticalCase);
                if (isAdjectiveWord(w)) return declineAdjective(w, g, grammaticalCase, plural);
                return w;
            })
            .join(' ');
    } else if (pattern === 'noun-adj') {
        const plural = isPluralNoun(parts[0]);
        const g = plural ? 'pl' : detectGender(parts[0]);
        declined = parts
            .map((w, i) => {
                if (i === 0) return declineWord(w, grammaticalCase);
                if (isAdjectiveWord(w)) return declineAdjective(w, g, grammaticalCase, plural);
                // drugi rzeczownik w apozycji: bułka kajzerka, kasza manna
                const lw = w.toLowerCase();
                if (
                    isLikelyNoun(w) &&
                    !/^z(e)?$/i.test(w) &&
                    (WORD_CASES.has(lw) || /(?:ka|na|ek)$/i.test(lw))
                ) {
                    return declineWord(w, grammaticalCase);
                }
                return w;
            })
            .join(' ');
    } else if (pattern === 'noun-z-noun') {
        const zIdx = parts.findIndex((p) => /^z(e)?$/i.test(p));
        const head = parts[0];
        const g = detectGender(head);
        const next = [...parts];
        next[0] = declineWord(head, grammaticalCase);
        if (zIdx === 2 && isAdjectiveWord(next[1])) {
            next[1] = declineAdjective(next[1], g, grammaticalCase);
        }
        declined = next.join(' ');
    } else {
        declined = declineWord(parts[0], grammaticalCase);
        if (parts.length > 1) {
            const g = detectGender(parts[0]);
            const plural = isPluralNoun(parts[0]);
            declined = [
                declined,
                ...parts.slice(1).map((w) => {
                    if (isAdjectiveWord(w)) return declineAdjective(w, g, grammaticalCase, plural);
                    return w;
                }),
            ].join(' ');
        }
    }

    return preserveCase(name, declined + paren);
}

export function getProductNameForms(name) {
    const cases = ['nom', 'gen', 'acc', 'dat', 'inst', 'loc'];
    const forms = new Set([name]);
    for (const c of cases) {
        forms.add(declineProductName(name, c));
    }
    return [...forms].filter(Boolean).sort((a, b) => b.length - a.length);
}

/** @param {string} before @returns {GramCase} */
function detectCaseFromContext(before) {
    const ctx = before.slice(-140).toLowerCase();

    const accPatterns = [
        /\b(zjesz|zjecie|zjedz|dodaj|dodasz|wpisz|wpisujesz|planując|planuj|jedząc|kupując|stosując|łącząc|wybierz|włącz|uwzględnij|kup|stosuj|używasz|jesz|jem|spożywasz|spożyj|porównaj|porównajcie|zamień|weź|spróbuj|wypróbuj|degustuj|smakuj|wykorzystać|wykorzystaj|wykorzystujesz|wykorzystamy)\s*$/i,
        /\bże zjesz\s*$/i,
        /\bjak wykorzystać\s*$/i,
    ];
    if (accPatterns.some((re) => re.test(ctx))) return 'acc';

    const genPatterns = [
        /\b(większa|mniejsza|standardowa|typowa|pełna|pojedyncza|podwójna|mała|duża)\s+(?:porcj[aę])\s*$/i,
        /\b(porcja|porcj[aę]|szklanka|kubek|łyżka|łyżeczka|garść|opakowanie|kostka|plaster|kawałek|sztuka|paczka|puszka|słoik|butelka|miska|miseczka|talerz)\s+$/i,
        /\b(z|ze|bez|do|od|dla|u|zamiast|oprócz|zamian[aę])\s+$/i,
        /\b(posiłek|posiłku|przekąska|przekąski|dodatek|dodatku|energia|smak|połączenie|zestaw|typ\s+posiłku)\s+z\s+$/i,
        /\b(kaloryczność)\s+$/i,
        /\b(na|Na)\s+100\s+g\s+$/i,
        /\b100\s+g\s+$/i,
        /\b(w|W)\s+(małej|dużej)\s+objętości\s+$/i,
        /\b(energia|Energia)\s+z\s+$/i,
        /\b(w|W)\s+praktyce\s+$/i,
        /\b(po|Po)\s+$/i,
        /\bprzed\s+$/i,
        /\b(zamiana)\s+$/i,
        /\b(przy|Przy)\s+(liczeniu|gotowaniu|pieczeniu|smażeniu|dodawaniu)\s+$/i,
        // „nie musisz traktować X jako…” — dopełniacz (negacja / ustalona fraza redakcyjna)
        /\b(traktować|traktujesz|traktujemy|traktujcie|traktując)\s*$/i,
        /\bbiałko\s+z\s+$/i,
    ];
    if (genPatterns.some((re) => re.test(ctx))) return 'gen';

    return 'nom';
}

function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function applyProductNameCases(text, productName) {
    if (!text || !productName) return text || '';

    if (text.includes(productName)) {
        const re = new RegExp(escapeRegex(productName), 'g');
        let result = '';
        let lastIndex = 0;
        let match;

        while ((match = re.exec(text)) !== null) {
            const before = text.slice(0, match.index);
            const grammaticalCase = detectCaseFromContext(before);
            const declined = declineProductName(productName, grammaticalCase);
            result += text.slice(lastIndex, match.index);
            result += `${MARKER}${declined}${MARKER_END}`;
            lastIndex = match.index + productName.length;
        }
        result += text.slice(lastIndex);
        return result;
    }

    return highlightExistingForms(text, productName);
}

function highlightExistingForms(text, productName) {
    let out = text;
    for (const form of getProductNameForms(productName)) {
        if (!out.includes(form)) continue;
        const re = new RegExp(escapeRegex(form), 'g');
        out = out.replace(re, (m) => `${MARKER}${m}${MARKER_END}`);
    }
    return out;
}

/** @param {{ title?: string, paragraphs: string[] }} editorial @param {string} productName */
export function applyProductNameCasesToEditorial(editorial, productName) {
    if (!editorial) return editorial;
    return {
        title: applyProductNameCases(editorial.title || '', productName),
        paragraphs: editorial.paragraphs.map((p) => applyProductNameCases(p, productName)),
    };
}

export function renderEditorialFragment(text, escHtml) {
    if (!text) return '';
    const markerRe = /\[\[PN\|([\s\S]*?)\|PN\]\]/g;
    let html = '';
    let last = 0;
    let m;
    while ((m = markerRe.exec(text)) !== null) {
        html += escHtml(text.slice(last, m.index));
        html += `<span class="product-name-inline">${escHtml(m[1])}</span>`;
        last = m.index + m[0].length;
    }
    html += escHtml(text.slice(last));
    return html;
}
