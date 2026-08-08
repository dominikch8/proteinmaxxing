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
    ['pomidor', { gen: 'pomidora', acc: 'pomidora', inst: 'pomidorze', loc: 'pomidorze' }],
    ['banan', { gen: 'banana', acc: 'banana', inst: 'bananem', loc: 'bananie' }],
    ['morele', { gen: 'moreli', acc: 'morele', inst: 'morelami', loc: 'morelach' }],
    ['pieczarki', { gen: 'pieczarek', acc: 'pieczarki', inst: 'pieczarkami', loc: 'pieczarkach' }],
    ['dorsz', { gen: 'dorsza', acc: 'dorsza', inst: 'dorszem', loc: 'dorszu' }],
    ['tuńczyk', { gen: 'tuńczyka', acc: 'tuńczyka', inst: 'tuńczykiem', loc: 'tuńczyku' }],
    ['łosoś', { gen: 'łososia', acc: 'łososia', inst: 'łososiem', loc: 'łososiu' }],
    ['kurczak', { gen: 'kurczaka', acc: 'kurczaka', inst: 'kurczakiem', loc: 'kurczaku' }],
    ['indyk', { gen: 'indyka', acc: 'indyka', inst: 'indykiem', loc: 'indyku' }],
    ['jogurt', { gen: 'jogurtu', acc: 'jogurt', inst: 'jogurtem', loc: 'jogurcie' }],
    ['kefir', { gen: 'kefiru', acc: 'kefir', inst: 'kefitem', loc: 'kefirze' }],
    ['hummus', { gen: 'hummusu', acc: 'hummus', inst: 'hummusem', loc: 'hummusie' }],
    ['majonez', { gen: 'majonezu', acc: 'majonez', inst: 'majonezem', loc: 'majonezie' }],
    ['ketchup', { gen: 'ketchupu', acc: 'ketchup', inst: 'ketchupem', loc: 'ketchupie' }],
    ['bulgur', { gen: 'bulguru', acc: 'bulgur', inst: 'bulgurem', loc: 'bulgurze' }],
    ['brokuły', { gen: 'brokułów', acc: 'brokuły', inst: 'brokułami', loc: 'brokułach' }],
    ['krewetki', { gen: 'krewetek', acc: 'krewetki', inst: 'krewetkami', loc: 'krewetkach' }],
    ['płatki', { gen: 'płatków', acc: 'płatki', inst: 'płatkami', loc: 'płatkach' }],
    ['ziemniaki', { gen: 'ziemniaków', acc: 'ziemniaki', inst: 'ziemniakami', loc: 'ziemniakach' }],
    ['pierogi', { gen: 'pierogów', acc: 'pierogi', inst: 'pierogami', loc: 'pierogach' }],
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
    ['sos', { gen: 'sosu', acc: 'sos', inst: 'sosem', loc: 'sosie' }],
    ['krem', { gen: 'kremu', acc: 'krem', inst: 'kremem', loc: 'kremie' }],
    ['ogórek', { gen: 'ogórka', acc: 'ogórek', inst: 'ogórkiem', loc: 'ogórku' }],
    ['śmietana', { gen: 'śmietany', acc: 'śmietanę', inst: 'śmietaną', loc: 'śmietanie' }],
    ['śmietanka', { gen: 'śmietanki', acc: 'śmietankę', inst: 'śmietanką', loc: 'śmietance' }],
    ['mąka', { gen: 'mąki', acc: 'mąkę', inst: 'mąką', loc: 'mące' }],
    ['sałatka', { gen: 'sałatki', acc: 'sałatkę', inst: 'sałatką', loc: 'sałatce' }],
    ['papryka', { gen: 'papryki', acc: 'paprykę', inst: 'papryką', loc: 'papryce' }],
    ['fasolka', { gen: 'fasolki', acc: 'fasolkę', inst: 'fasolką', loc: 'fasolce' }],
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
]);

/** Pełne nazwy produktów z ręczną odmianą (gdy heurystyka nie daje rady). */
const PHRASE_CASES = new Map([
    ['nasiona chia', { gen: 'nasion chia', acc: 'nasiona chia', inst: 'nasionami chia', loc: 'nasionach chia' }],
    ['nasiona lniane', { gen: 'nasion lnianych', acc: 'nasiona lniane', inst: 'nasionami lnianymi', loc: 'nasionach lnianych' }],
    ['nasiona słonecznika', { gen: 'nasion słonecznika', acc: 'nasiona słonecznika', inst: 'nasionami słonecznika', loc: 'nasionach słonecznika' }],
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
    'nasiona', 'skrzydełka', 'żeberka', 'ciastka', 'białka',
]);

/** Rzeczowniki często mylone z przymiotnikami (końcówka -na/-ne/-a). */
const NOUN_BLOCKLIST = new Set([
    'śmietana', 'śmietanka', 'nasiona', 'chia', 'pizza', 'quinoa', 'granola', 'cola', 'woda', 'kawa',
    'herbata', 'kasza', 'papryka', 'fasola', 'soczewica', 'dynia', 'cukinia',
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
    return /(owy|owa|owe|cki|cka|cke|ski|ska|skie|kie|chudy|chuda|chude|gotowane|świeży|świeża|świeże|swiezy|mielony|mielona|mielone|naturalny|naturalna|naturalne|półtłusty|półtłusta|poltlusty|tłusty|tłusta|suchy|sucha|suche|biały|biała|białe|brązowy|brązowa|czekoladowy|czekoladowa|czekoladowe|wieprzowy|wieprzowa|wieprzowe|wołowy|wołowa|wołowe|drobiowy|drobiowa|drobiowe|kurzy|kurza|kurze|atlantycki|suszony|suszona|suszone|marynowany|marynowana|marynowane|panierowany|wędzony|wędzona|ugotowany|mrożony|mrożona|mrożone|krojony|pieczony|smażony|smażona|pełny|pełna|pełne|lniane|lniany|owsiane|owsiany|pszenny|pszenna|jajeczny|jajeczna|ryżowy|ryżowa|pomidorowy|pomidorowa|czosnkowy|tatarski|sojowy|ostry|słodko-kwaśny|holenderski|musztardowo-miodowy|brokułowy|grecka|jarzynowa|żółty|żółta|żółte|zielony|zielona|czerwony|czerwona|włoskie|brazylijskie|prażone|prażony|tłuczone|tłuczony|drożdżowa|drożdżowy|makaronowa|makaronowy|jęczmienna|szparagowa)$/i.test(
        w
    ) || /(one|ane|owe|ony|ana|eny|yna|yny|yny|cki|ski|kie|skie)$/i.test(w);
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
    if (grammaticalCase === 'acc' && !plural && gender !== 'f' && gender !== 'pl') {
        return declineAdjective(adj, gender, 'gen', false);
    }

    if (plural || gender === 'pl') {
        if (grammaticalCase === 'gen') {
            if (/one$/i.test(adj)) return adj.replace(/one$/i, 'onych');
            if (/ane$/i.test(adj)) return adj.replace(/ane$/i, 'anych');
            if (/owe$/i.test(adj)) return adj.replace(/owe$/i, 'owych');
            if (/skie$/i.test(adj)) return adj.replace(/skie$/i, 'skich');
            if (/kie$/i.test(adj)) return adj.replace(/kie$/i, 'kich');
            if (/ne$/i.test(adj)) return adj.replace(/ne$/i, 'nych');
            if (/y$/i.test(adj)) return adj.replace(/y$/i, 'ych');
            if (/i$/i.test(adj)) return adj.replace(/i$/i, 'ych');
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
    if (/marynowane$/i.test(adj)) return adj.replace(/marynowane$/i, grammaticalCase === 'gen' ? 'marynowanych' : adj);
    if (/świeży$/i.test(adj) || /swiezy$/i.test(adj)) {
        if (grammaticalCase === 'gen') return adj.replace(/(świeży|swiezy)$/i, 'świeżego');
    }
    if (/świeża$/i.test(adj)) {
        if (grammaticalCase === 'gen') return adj.replace(/świeża$/i, 'świeżej');
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
    if (/owe$/i.test(adj)) {
        if (grammaticalCase === 'gen') return adj.replace(/owe$/i, 'owego');
        if (grammaticalCase === 'inst') return adj.replace(/owe$/i, 'owym');
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
    if (/ty$/i.test(adj)) {
        if (grammaticalCase === 'gen') return adj.replace(/ty$/i, 'tego');
        if (grammaticalCase === 'inst') return adj.replace(/ty$/i, 'tym');
    }
    if (/ły$/i.test(adj)) {
        if (grammaticalCase === 'gen') return adj.replace(/ły$/i, 'łego');
        if (grammaticalCase === 'inst') return adj.replace(/ły$/i, 'łym');
    }
    if (/ski$/i.test(adj) || /cki$/i.test(adj)) {
        if (grammaticalCase === 'gen') return adj.replace(/(ski|cki)$/i, (m) => m.slice(0, -1) + 'iego');
        if (grammaticalCase === 'inst') return adj.replace(/(ski|cki)$/i, (m) => m.slice(0, -1) + 'im');
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
            if (/ia$/i.test(word)) return word.replace(/ia$/i, 'ii');
            // -ka/-ga → -ki/-gi (mąka→mąki, sałatka→sałatki), nie -ky
            if (/ka$/i.test(word)) return word.replace(/ka$/i, 'ki');
            if (/ga$/i.test(word)) return word.replace(/ga$/i, 'gi');
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
        if (/órek$/i.test(word)) return word.replace(/órek$/i, 'órka');
        if (/ek$/i.test(word)) return word.replace(/ek$/i, 'ka');
        if (/óg$/i.test(word)) return word.replace(/óg$/i, 'ogu');
        if (/[bcdfghjklmnprstwz]$/i.test(word)) return word + 'a';
    }
    if (grammaticalCase === 'acc') return declineWord(word, 'gen');
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
        const adj = parts[0];
        const noun = parts.slice(1).join(' ');
        const plural = isPluralNoun(noun) || isPluralNoun(parts[parts.length - 1]);
        const g = plural ? 'pl' : detectGender(noun);
        declined = [
            declineAdjective(adj, g, grammaticalCase, plural),
            declineWord(parts.length === 2 ? parts[1] : noun, grammaticalCase),
        ].join(' ');
        if (parts.length > 2) {
            declined = [
                declineAdjective(adj, g, grammaticalCase, plural),
                ...parts.slice(1, -1),
                declineWord(parts[parts.length - 1], grammaticalCase),
            ].join(' ');
        }
    } else if (pattern === 'noun-adj') {
        const adj = parts[parts.length - 1];
        const nounParts = parts.slice(0, -1);
        const plural = isPluralNoun(parts[0]);
        const g = plural ? 'pl' : detectGender(parts[0]);
        declined = [
            ...nounParts.map((w, i) => (i === 0 ? declineWord(w, grammaticalCase) : w)),
            declineAdjective(adj, g, grammaticalCase, plural),
        ].join(' ');
    } else if (pattern === 'noun-z-noun') {
        const zIdx = parts.findIndex((p) => /^z(e)?$/i.test(p));
        const head = parts[0];
        const g = detectGender(head);
        parts[0] = declineWord(head, grammaticalCase);
        if (zIdx === 2 && isAdjectiveWord(parts[1])) {
            parts[1] = declineAdjective(parts[1], g, grammaticalCase);
        }
        declined = parts.join(' ');
    } else {
        declined = declineWord(parts[0], grammaticalCase);
        if (parts.length > 1) declined = [declined, ...parts.slice(1)].join(' ');
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
        /\b(zjesz|zjecie|zjedz|dodaj|dodasz|wpisz|wpisujesz|planując|planuj|jedząc|kupując|stosując|łącząc|wybierz|włącz|uwzględnij|kup|stosuj|używasz|jesz|jem|spożywasz|spożyj|porównaj|porównajcie|zamień|weź|spróbuj|wypróbuj|degustuj|smakuj)\s*$/i,
        /\bże zjesz\s*$/i,
    ];
    if (accPatterns.some((re) => re.test(ctx))) return 'acc';

    const genPatterns = [
        /\b(większa|mniejsza|standardowa|typowa|pełna|pojedyncza|podwójna|mała|duża)\s+(?:porcj[aęę])\s*$/i,
        /\b(porcja|porcj[aęę]|szklanka|kubek|łyżka|łyżeczka|garść|opakowanie|kostka|plaster|kawałek|sztuka|paczka|puszka|słoik|butelka|miska|miseczka|talerz)\s+$/i,
        /\b(z|ze|bez|do|od|dla|u|zamiast|oprócz|zamian[aęę])\s+$/i,
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
