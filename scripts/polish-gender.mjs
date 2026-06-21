/**
 * Wykrywanie płci gramatycznej nazw produktów i odmiana przymiotników.
 * m = męski, f = żeński, n = nijaki, pl = liczba mnoga
 */

const OVERRIDES = new Map([
    ['pierś', 'f'], ['pierś z kurczaka', 'f'], ['pierś z indyka', 'f'],
    ['wołowina', 'f'], ['wieprzowina', 'f'], ['cielęcina', 'f'], ['jagnięcina', 'f'],
    ['szynka', 'f'], ['kiełbasa', 'f'], ['parówka', 'f'], ['parówki', 'pl'],
    ['kasza', 'f'], ['pizza', 'f'], ['sałatka', 'f'], ['zupa', 'f'], ['grochówka', 'f'],
    ['kapuśniak', 'm'], ['pierogi', 'pl'], ['naleśniki', 'pl'], ['frytki', 'pl'],
    ['mleko', 'n'], ['jajko', 'n'], ['mięso', 'n'], ['masło', 'n'], ['tłuszcz', 'm'],
    ['twaróg', 'm'], ['pomidor', 'm'], ['banan', 'm'], ['ryż', 'm'], ['chleb', 'm'],
    ['makaron', 'm'], ['serek', 'm'], ['ser', 'm'], ['jogurt', 'm'], ['kefir', 'm'],
    ['indyk', 'm'], ['kurczak', 'm'], ['dorsz', 'm'], ['tuńczyk', 'm'], ['łosoś', 'm'],
    ['brokuły', 'pl'], ['płatki', 'pl'], ['ziemniaki', 'pl'], ['warzywa', 'pl'],
    ['krewetki', 'pl'], ['kalmary', 'pl'], ['maliny', 'pl'], ['truskawki', 'pl'],
    ['jagody', 'pl'], ['borówki', 'pl'], ['gruszki', 'pl'], ['śliwki', 'pl'],
    ['orzechy', 'pl'], ['migdały', 'pl'], ['pomidory', 'pl'], ['ogórki', 'pl'],
    ['marchewki', 'pl'], ['fasola', 'f'], ['soczewica', 'f'], ['cukinia', 'f'],
    ['papryka', 'f'], ['dynia', 'f'], ['gruszka', 'f'], ['śliwka', 'f'], ['gruszka', 'f'],
    ['jablko', 'n'], ['jabłko', 'n'], ['jajecznica', 'f'], ['owsianka', 'f'],
    ['granola', 'f'], ['quinoa', 'f'], ['komosa', 'f'], ['bulgur', 'm'],
    ['hummus', 'm'], ['tahini', 'f'], ['majonez', 'm'], ['ketchup', 'm'],
    ['odżywka', 'f'], ['izolat', 'm'], ['koncentrat', 'm'], ['whey', 'f'],
    ['bułka', 'f'], ['bagietka', 'f'], ['tortilla', 'f'], ['gofry', 'pl'],
    ['lody', 'pl'], ['żelki', 'pl'], ['chipsy', 'pl'], ['orzeszki', 'pl'],
    ['galaretka', 'f'], ['mus', 'm'], ['tarta', 'f'], ['tort', 'm'],
    ['herbata', 'f'], ['kawa', 'f'], ['woda', 'f'], ['cola', 'f'],
    ['whopper', 'm'], ['bigos', 'm'], ['żurek', 'm'], ['rosół', 'm'],
    ['lasagne', 'f'], ['penne', 'pl'], ['spaghetti', 'n'], ['risotto', 'n'],
    ['stripsy', 'pl'], ['nuggetsy', 'pl'], ['nuggets', 'pl'],
    ['morele', 'pl'], ['pieczarki', 'pl'],
]);

const LEADING_ADJ = /^(suszone|gotowane|marynowane|świeże|świeży|pieczone|smażone|smazone|ugotowane|mrożone|krojone|naturalne|naturalny|naturalna|pełno|pełne|suszone|suszona|suszony)$/i;

const FEMININE_SUFFIXES = ['acja', 'acja', 'acja', 'ica', 'nica', 'anka', 'ina', 'yna', 'owa', 'awa', 'ewa'];
const NEUTER_SUFFIXES = ['ko', 'ło', 'to', 'no', 'um', 'eum'];

/** Główny rzeczownik z nazwy produktu (pierwsze słowo lub fraza przed nawiasem). */
export function headNoun(name) {
    const clean = name.replace(/\([^)]*\)/g, '').trim();
    const parts = clean.split(/\s+/);
    const startIdx = parts.length > 1 && LEADING_ADJ.test(parts[0]) ? 1 : 0;
    const first = parts[startIdx].toLowerCase();
    const two = parts.slice(startIdx, startIdx + 2).join(' ').toLowerCase();
    if (OVERRIDES.has(two)) return two;
    if (OVERRIDES.has(first)) return first;
    return first;
}

/** @returns {'m'|'f'|'n'|'pl'} */
export function detectGender(name) {
    const lower = name.toLowerCase().replace(/\([^)]*\)/g, '').trim();
    const head = headNoun(name);

    if (OVERRIDES.has(head)) return OVERRIDES.get(head);
    if (OVERRIDES.has(lower)) return OVERRIDES.get(lower);

    const word = head;

    // liczba mnoga
    if (/[aei]$/i.test(word) && /(ki|y|i|e)$/i.test(word)) {
        if (/^(płatki|ziemniaki|brokuły|frytki|nuggetsy|stripsy|żelki|lody|chipsy|orzechy|migdały|krewetki|kalmary|maliny|jagody|borówki|truskawki|gruszki|śliwki|pomidory|ogórki|marchewki|parówki|gofry|penne)$/i.test(word)) {
            return 'pl';
        }
        if (/y$/i.test(word) && word.length > 3) return 'pl';
        if (/ki$/i.test(word) && !/ek$/i.test(word)) return 'pl';
    }

    // żeński: -a (z wyjątkami męskich: mężczyzna, poeta...)
    if (/a$/i.test(word) && !/^(kuba|boga|sota)$/i.test(word)) return 'f';

    // nijaki: -o, -e, -ę
    if (/[oęe]$/i.test(word) && !/a$/i.test(word)) {
        if (/o$/i.test(word)) return 'n';
        if (/e$/i.test(word) && !/a$/i.test(word)) return 'n';
    }

    for (const suf of FEMININE_SUFFIXES) {
        if (word.endsWith(suf)) return 'f';
    }

    // domyślnie męski (dorsz, tuńczyk, banan, ser...)
    return 'm';
}

/**
 * Odmiana przymiotnika: agree('dobr', 'f') → 'dobra', agree('gęst', 'pl') → 'gęste'
 * @param {string} stem — rdzeń bez końcówki (dobr, gęst, wygodn, tańsz, droższ, dietetyczn, popularn, klasyczn, chud, sycąc)
 */
export function agree(stem, gender) {
    const g = gender === 'pl' ? 'pl' : gender;
    const map = {
        m: { a: 'y', e: 'y', y: 'y' },
        f: { a: 'a', e: 'a', y: 'a' },
        n: { a: 'e', e: 'e', y: 'e' },
        pl: { a: 'e', e: 'e', y: 'e' },
    };
    const ending = stem.endsWith('n') || stem.endsWith('r') || stem.endsWith('s') ? 'y' : 'y';
    if (stem.endsWith('i') || stem.endsWith('y')) {
        // tańszy → tańsza/tańsze/tańszy
        const base = stem.replace(/y$/, '');
        if (g === 'f') return base + 'a';
        if (g === 'n' || g === 'pl') return base + 'e';
        return base + 'y';
    }
    if (stem.endsWith('ą')) {
        // sycący → sycąca/sycące
        const base = stem.slice(0, -1);
        if (g === 'f') return base + 'a';
        if (g === 'n' || g === 'pl') return base + 'e';
        return stem;
    }
    const suffix = g === 'f' ? 'a' : g === 'n' || g === 'pl' ? 'e' : 'y';
    return stem + suffix;
}

/** „X jest dobry/dobra/dobre” */
export function jestAdj(name, stem) {
    return `${name} jest ${agree(stem, detectGender(name))}`;
}

/** „X bywa wygodny/wygodna/wygodne” */
export function bywaAdj(name, stem) {
    return `${name} bywa ${agree(stem, detectGender(name))}`;
}

/** „tańszy/tańsza/tańsze … droższy/droższa/droższe” */
export function cheaperPair(name) {
    const g = detectGender(name);
    return `${agree('tańsz', g)} lub ${agree('droższ', g)}`;
}

/** „gęsty/gęsta/gęste kalorycznie” — jako przymiotnik przy produkcie */
export function jestGęstyKalorycznie(name) {
    const g = detectGender(name);
    return `${name} ${g === 'f' ? 'jest gęsta' : g === 'n' || g === 'pl' ? 'jest gęste' : 'jest gęsty'} kalorycznie`;
}

/** „nie jest dietetyczny/dietetyczna/dietetyczne” */
export function nieJestDietetyczny(name) {
    const g = detectGender(name);
    return `${name} nie jest ${agree('dietetyczn', g)}`;
}

/** „dobry/dobra/dobre źródło białka” */
export function dobryZrodlo(name) {
    return `${agree('dobr', detectGender(name))} źródło białka`;
}

/** „popularny/popularna/popularne w …” */
export function popularnyW(name, context) {
    return `${agree('popularn', detectGender(name))} ${context}`;
}

/** „klasyczny/klasyczna/klasyczne” przed rzeczownikiem m/n/f */
export function klasyczny(nounGender = 'm') {
    return agree('klasyczn', nounGender);
}

/** „lżejszy/lżejsza/lżejsze” */
export function lżejszy(name) {
    return agree('lżejsz', detectGender(name));
}

/** „wygodny/wygodna/wygodne wybór/opcja” — z rzeczownikiem */
export function wygodnaOpcja(name) {
    const g = detectGender(name);
    if (g === 'f') return 'wygodna opcja';
    if (g === 'n' || g === 'pl') return 'wygodne rozwiązanie';
    return 'wygodny wybór';
}

/**
 * Post-processing tekstu opisu — poprawia typowe błędy zgodności płci.
 * @param {string} text
 * @param {string} productName
 */
export function polishGenderInText(text, productName) {
    if (!text || !productName) return text;
    const g = detectGender(productName);
    const nameEsc = productName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    let t = text;

    // „X jest gęsty/gęsta/gęste kalorycznie”
    t = t.replace(new RegExp(`${nameEsc} jest gęsty kalorycznie`, 'g'), jestGęstyKalorycznie(productName));
    t = t.replace(new RegExp(`${nameEsc} jest gęsty`, 'g'), jestGęstyKalorycznie(productName).replace(' kalorycznie', ''));

    // „X bywa wygodny/wygodna/wygodne” — tylko gdy przymiotnik odnosi się do produktu
    t = t.replace(
        new RegExp(`${nameEsc} bywa wygodny(?! wybór)`, 'g'),
        `${productName} bywa ${agree('wygodn', g)}`
    );
    // „X bywa wygodny wybór” → poprawna konstrukcja
    t = t.replace(
        new RegExp(`${nameEsc} bywa wygodny wybór`, 'g'),
        `${productName} to wygodny wybór`
    );
    t = t.replace(
        new RegExp(`${nameEsc} bywa wygodna opcja`, 'g'),
        `${productName} to wygodna opcja`
    );

    // „X może okazać się tańszy lub droższy”
    t = t.replace(
        new RegExp(`${nameEsc} może okazać się tańszy lub droższy`, 'g'),
        `${productName} może okazać się ${cheaperPair(productName)}`
    );

    // „X nie jest „dietetyczny"”
    t = t.replace(
        new RegExp(`${nameEsc} nie jest „dietetyczny"`, 'g'),
        `${nieJestDietetyczny(productName).replace('dietetyczn', '„dietetyczn')}"`
    );
    t = t.replace(
        new RegExp(`${nameEsc} nie jest "dietetyczny"`, 'g'),
        `${nieJestDietetyczny(productName).replace('dietetyczn', '"dietetyczn')}"`
    );

    // „to dobry wybór” przy produkcie żeńskim w poprzednim zdaniu — kontekstowo trudne; napraw „X to dobry …”
    t = t.replace(
        new RegExp(`${nameEsc} to dobry (\\w+)`, 'g'),
        (_, noun) => {
            const femNouns = ['alternatywa', 'opcja', 'przekąska', 'zmiana', 'baza', 'porcja'];
            if (femNouns.includes(noun)) return `${productName} to dobra ${noun}`;
            if (noun === 'źródło') return `${productName} to ${g === 'f' ? 'dobre' : g === 'n' || g === 'pl' ? 'dobre' : 'dobre'} źródło`;
            return `${productName} to ${agree('dobr', g)} ${noun}`;
        }
    );

    // „dobre białko” przy produkcie żeńskim — OK (białko is neuter). „dobry białko” — fix
    t = t.replace(/\bdobry białko\b/g, 'dobre białko');

    // „jest dobry na” → zgodnie z płcią produktu
    t = t.replace(
        new RegExp(`${nameEsc} jest dobry na`, 'g'),
        `${productName} jest ${agree('dobr', g)} na`
    );
    t = t.replace(
        new RegExp(`${nameEsc} jest dobry do`, 'g'),
        `${productName} jest ${agree('dobr', g)} do`
    );

    // „jest popularny w”
    t = t.replace(
        new RegExp(`${nameEsc} jest popularny w`, 'g'),
        `${productName} jest ${agree('popularn', g)} w`
    );

    return t;
}

/** @param {{ title: string, paragraphs: string[] }} editorial @param {string} productName */
export function polishEditorial(editorial, productName) {
    if (!editorial) return editorial;
    return {
        title: polishGenderInText(editorial.title, productName),
        paragraphs: editorial.paragraphs.map((p) => polishGenderInText(p, productName)),
    };
}
