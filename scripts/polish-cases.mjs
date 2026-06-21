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

function isAdjective(word) {
    return /(owy|owa|owe|ny|na|ne|cki|ska|cke|ski|ska|kie|chudy|chuda|chude|gotowan|śwież|mielon|naturaln|półtłust|tłust|such|biał|brązow|czekoladow|wieprzow|wołow|drobiow|kurz|atlantyck)/i.test(
        word
    );
}

function declineAdjective(adj, gender, grammaticalCase) {
    if (grammaticalCase === 'nom') return adj;
    const lower = adj.toLowerCase();

    if (/chudy$/i.test(lower)) return adj.replace(/chudy$/i, grammaticalCase === 'gen' ? 'chudego' : adj);
    if (/chuda$/i.test(lower)) return adj.replace(/chuda$/i, grammaticalCase === 'gen' ? 'chudej' : adj);
    if (/gotowane$/i.test(lower)) return adj.replace(/gotowane$/i, grammaticalCase === 'gen' ? 'gotowanych' : adj);
    if (/owy$/i.test(lower)) {
        if (grammaticalCase === 'gen') return adj.replace(/owy$/i, 'owego');
        if (grammaticalCase === 'inst') return adj.replace(/owy$/i, 'owym');
    }
    if (/owa$/i.test(lower)) {
        if (grammaticalCase === 'gen') return adj.replace(/owa$/i, 'owej');
        if (grammaticalCase === 'acc') return adj.replace(/owa$/i, 'ową');
        if (grammaticalCase === 'inst') return adj.replace(/owa$/i, 'ową');
    }
    if (/ny$/i.test(lower) && gender === 'f') {
        if (grammaticalCase === 'gen') return adj.replace(/ny$/i, 'nej');
        if (grammaticalCase === 'acc') return adj.replace(/ny$/i, 'ną');
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

    if (gender === 'pl') {
        if (grammaticalCase === 'gen') {
            if (/ki$/i.test(word)) return word.replace(/ki$/i, 'ek');
            if (/y$/i.test(word)) return word.replace(/y$/i, 'ów');
        }
        return word;
    }

    if (gender === 'f') {
        if (grammaticalCase === 'gen') {
            if (/a$/i.test(word)) return word.replace(/a$/i, 'y');
            if (/ść$/i.test(word)) return word.replace(/ść$/i, 'ści');
        }
        if (grammaticalCase === 'acc' && /a$/i.test(word)) return word.replace(/a$/i, 'ę');
        if (grammaticalCase === 'inst' && /a$/i.test(word)) return word.replace(/a$/i, 'ą');
        return word;
    }

    if (gender === 'n') {
        if (grammaticalCase === 'gen' && /o$/i.test(word)) return word.replace(/o$/i, 'a');
        return word;
    }

    if (grammaticalCase === 'gen') {
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

function capitalize(word, template) {
    if (!word || word[0] !== word[0].toUpperCase()) return template;
    return template.charAt(0).toUpperCase() + template.slice(1);
}

/**
 * @param {string} name
 * @param {GramCase} grammaticalCase
 */
export function declineProductName(name, grammaticalCase) {
    if (!name || grammaticalCase === 'nom') return name;

    const parenMatch = name.match(/^(.+?)\s*(\([^)]+\))\s*$/);
    const main = (parenMatch ? parenMatch[1] : name).trim();
    const paren = parenMatch ? ` ${parenMatch[2]}` : '';

    const parts = main.split(/\s+/);
    if (parts.length === 0) return name;

    const zIdx = parts.findIndex((p) => /^z(e)?$/i.test(p));
    if (zIdx > 0) {
        const head = parts[0];
        const g = detectGender(head);
        parts[0] = declineWord(head, grammaticalCase);
        if (zIdx === 2 && isAdjective(parts[1])) {
            parts[1] = declineAdjective(parts[1], g, grammaticalCase);
        }
        return parts.join(' ') + paren;
    }

    if (parts.length >= 2 && isAdjective(parts[1])) {
        const g = detectGender(parts[0]);
        parts[0] = declineWord(parts[0], grammaticalCase);
        parts[1] = declineAdjective(parts[1], g, grammaticalCase);
        return parts.join(' ') + paren;
    }

    if (parts.length >= 2 && isAdjective(parts[parts.length - 1])) {
        const g = detectGender(parts[0]);
        parts[0] = declineWord(parts[0], grammaticalCase);
        parts[parts.length - 1] = declineAdjective(parts[parts.length - 1], g, grammaticalCase);
        return parts.join(' ') + paren;
    }

    parts[0] = declineWord(parts[0], grammaticalCase);
    return parts.join(' ') + paren;
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
    const ctx = before.slice(-120).toLowerCase();

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
        /\b(kaloryczność|strona produktu)\s+$/i,
        /\b(na|Na)\s+100\s+g\s+$/i,
        /\b100\s+g\s+$/i,
        /\b(w|W)\s+(małej|dużej)\s+objętości\s+$/i,
        /\b(meal prep|Meal prep)\s+z\s+$/i,
        /\b(typowy|Typowy)\s+posiłek\s+z\s+$/i,
        /\b(energia|Energia)\s+z\s+$/i,
        /\b(w|W)\s+praktyce\s+$/i,
        /\b(po|Po)\s+$/i,
        /\bprzed\s+$/i,
        /\b(zamiana)\s+$/i,
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
        out = out.replace(re, (m) => {
            if (out.includes(`${MARKER}${m}${MARKER_END}`)) return m;
            return `${MARKER}${m}${MARKER_END}`;
        });
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
