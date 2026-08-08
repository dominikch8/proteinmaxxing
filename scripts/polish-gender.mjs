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
    ['nasiona', 'pl'], ['nasiona chia', 'pl'], ['nasiona lniane', 'pl'], ['nasiona słonecznika', 'pl'],
    ['śmietana', 'f'], ['śmietanka', 'f'], ['mąka', 'f'], ['sos', 'm'], ['krem', 'm'],
    ['ogórek', 'm'], ['skrzydełka', 'pl'], ['żeberka', 'pl'], ['ciastka', 'pl'], ['białka', 'pl'],
    ['sałatka', 'f'],
    ['polędwica', 'f'], ['barszcz', 'm'], ['pasztet', 'm'], ['chleb', 'm'],
    ['śledź', 'm'], ['makrela', 'f'], ['dynia', 'f'], ['kapusta', 'f'],
    ['fasola', 'f'], ['olej', 'm'], ['miód', 'm'], ['dżem', 'm'],
    ['pistacje', 'pl'], ['pestki', 'pl'], ['delicje', 'pl'], ['kluski', 'pl'],
    ['herbatniki', 'pl'], ['krakersy', 'pl'], ['paluszki', 'pl'], ['wafle', 'pl'],
    ['otręby', 'pl'], ['kotlety', 'pl'], ['gołąbki', 'pl'], ['pyzy', 'pl'],
    ['wiśnie', 'pl'], ['czereśnie', 'pl'], ['figi', 'pl'], ['daktyle', 'pl'],
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
        if (/^(płatki|ziemniaki|brokuły|frytki|nuggetsy|stripsy|żelki|lody|chipsy|orzechy|migdały|krewetki|kalmary|maliny|jagody|borówki|truskawki|gruszki|śliwki|pomidory|ogórki|marchewki|parówki|gofry|penne|pistacje|pestki|delicje|kluski|herbatniki|krakersy|paluszki|wafle|otręby|kotlety|gołąbki|pyzy|wiśnie|czereśnie|figi|daktyle|morele|pieczarki|nasiona)$/i.test(word)) {
            return 'pl';
        }
        if (/y$/i.test(word) && word.length > 3) return 'pl';
        if (/ki$/i.test(word) && !/ek$/i.test(word)) return 'pl';
        // typowe plurale na -cje/-nie/-e (nie nijakie -e jak „smoothie”)
        if (/(cje|nie|mie|sie|zie)$/i.test(word)) return 'pl';
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

/** „X jest / są” */
export function jestSa(name) {
    return detectGender(name) === 'pl' ? 'są' : 'jest';
}

/** „X ma / mają” */
export function maMaja(name) {
    return detectGender(name) === 'pl' ? 'mają' : 'ma';
}

/** 3. os. czasownika: singular vs plural */
export function verb3(name, singular, plural) {
    return detectGender(name) === 'pl' ? plural : singular;
}

/** „zakazany/zakazana/zakazane” */
export function zakazany(name) {
    const g = detectGender(name);
    if (g === 'f') return 'zakazana';
    if (g === 'n' || g === 'pl') return 'zakazane';
    return 'zakazany';
}

/** „wybierany/wybierana/wybierane” */
export function wybierany(name) {
    const g = detectGender(name);
    if (g === 'f') return 'wybierana';
    if (g === 'n' || g === 'pl') return 'wybierane';
    return 'wybierany';
}

/** „gęsty/gęsta/gęste kalorycznie” — jako przymiotnik przy produkcie */
export function jestGęstyKalorycznie(name) {
    const g = detectGender(name);
    const copula = g === 'pl' ? 'są' : 'jest';
    const adj =
        g === 'f' ? 'gęsta' : g === 'n' || g === 'pl' ? 'gęste' : 'gęsty';
    return `${name} ${copula} ${adj} kalorycznie`;
}

/** „nie jest/nie są dietetyczny/…” */
export function nieJestDietetyczny(name) {
    const g = detectGender(name);
    return `${name} nie ${jestSa(name)} ${agree('dietetyczn', g)}`;
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
 * Post-processing tekstu opisu — poprawia typowe błędy zgodności płci i liczby.
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
    t = t.replace(new RegExp(`${nameEsc} są gęste kalorycznie`, 'g'), jestGęstyKalorycznie(productName));
    t = t.replace(new RegExp(`${nameEsc} jest gęsty`, 'g'), jestGęstyKalorycznie(productName).replace(' kalorycznie', ''));

    // „X ma / mają …”
    t = t.replace(new RegExp(`${nameEsc} ma\\b`, 'g'), `${productName} ${maMaja(productName)}`);
    t = t.replace(new RegExp(`${nameEsc} mają\\b`, 'g'), `${productName} ${maMaja(productName)}`);

    // „X jest / są …” (tylko gdy zaraz potem nie ma już poprawionej formy)
    t = t.replace(new RegExp(`${nameEsc} jest\\b`, 'g'), `${productName} ${jestSa(productName)}`);
    t = t.replace(new RegExp(`${nameEsc} są\\b`, 'g'), `${productName} ${jestSa(productName)}`);

    // „X nie jest / nie są „zakazany””
    t = t.replace(
        new RegExp(`${nameEsc} nie jest „zakazan[yae]”`, 'g'),
        `${productName} nie ${jestSa(productName)} „${zakazany(productName)}”`
    );
    t = t.replace(
        new RegExp(`${nameEsc} nie są „zakazan[yae]”`, 'g'),
        `${productName} nie ${jestSa(productName)} „${zakazany(productName)}”`
    );

    // „X bywa wygodny/wygodna/wygodne” — tylko gdy przymiotnik odnosi się do produktu
    t = t.replace(
        new RegExp(`${nameEsc} bywa wygodny(?! wybór)`, 'g'),
        `${productName} ${verb3(productName, 'bywa', 'bywają')} ${agree('wygodn', g)}`
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

    // „X nie jest/nie są dietetyczny…”
    t = t.replace(
        new RegExp(`${nameEsc} nie jest „dietetyczn\\w*”`, 'g'),
        `${productName} nie ${jestSa(productName)} „${agree('dietetyczn', g)}”`
    );
    t = t.replace(
        new RegExp(`${nameEsc} nie są „dietetyczn\\w*”`, 'g'),
        `${productName} nie ${jestSa(productName)} „${agree('dietetyczn', g)}”`
    );
    t = t.replace(
        new RegExp(`${nameEsc} nie jest "dietetyczn\\w*"`, 'g'),
        `${productName} nie ${jestSa(productName)} "${agree('dietetyczn', g)}"`
    );

    // częste czasowniki 3. os.
    const verbPairs = [
        ['wpisuje się', 'wpisują się'],
        ['łączy', 'łączą'],
        ['wyróżnia się', 'wyróżniają się'],
        ['pojawia się', 'pojawiają się'],
        ['pasuje', 'pasują'],
        ['pomaga', 'pomagają'],
        ['kryje', 'kryją'],
        ['ląduje', 'lądują'],
        ['sprawdza się', 'sprawdzają się'],
        ['dostarcza', 'dostarczają'],
        ['pokazuje', 'pokazują'],
        ['wymaga', 'wymagają'],
        ['pozwala', 'pozwalają'],
        ['bywa', 'bywają'],
        ['daje', 'dają'],
        ['może', 'mogą'],
        ['mieści się', 'mieszczą się'],
        ['najlepiej sprawdza się', 'najlepiej sprawdzają się'],
    ];
    for (const [sg, pl] of verbPairs) {
        const form = verb3(productName, sg, pl);
        t = t.replace(new RegExp(`${nameEsc} ${sg}\\b`, 'g'), `${productName} ${form}`);
        t = t.replace(new RegExp(`${nameEsc} ${pl}\\b`, 'g'), `${productName} ${form}`);
    }

    // „to dobry wybór” przy produkcie żeńskim w poprzednim zdaniu — kontekstowo trudne; napraw „X to dobry …”
    t = t.replace(
        new RegExp(`${nameEsc} to dobry (\\w+)`, 'g'),
        (_, noun) => {
            const femNouns = ['alternatywa', 'opcja', 'przekąska', 'zmiana', 'baza', 'porcja'];
            if (femNouns.includes(noun)) return `${productName} to dobra ${noun}`;
            if (noun === 'źródło') return `${productName} to dobre źródło`;
            return `${productName} to ${agree('dobr', g)} ${noun}`;
        }
    );

    // „dobre białko” przy produkcie żeńskim — OK (białko is neuter). „dobry białko” — fix
    t = t.replace(/\bdobry białko\b/g, 'dobre białko');

    // „jest dobry na” → zgodnie z płcią produktu (po wcześniejszej podmianie jest→są)
    t = t.replace(
        new RegExp(`${nameEsc} ${jestSa(productName)} dobry na`, 'g'),
        `${productName} ${jestSa(productName)} ${agree('dobr', g)} na`
    );
    t = t.replace(
        new RegExp(`${nameEsc} ${jestSa(productName)} dobry do`, 'g'),
        `${productName} ${jestSa(productName)} ${agree('dobr', g)} do`
    );

    // „jest popularny w”
    t = t.replace(
        new RegExp(`${nameEsc} ${jestSa(productName)} popularny w`, 'g'),
        `${productName} ${jestSa(productName)} ${agree('popularn', g)} w`
    );

    // „często wybierany”
    t = t.replace(
        new RegExp(`${nameEsc} często wybieran[yae]`, 'g'),
        `${productName} często ${wybierany(productName)}`
    );

    // „na redukcji wymaga” — orzeczenie odnoszące się do produktu w poprzednim zdaniu
    if (g === 'pl') {
        t = t.replace(/; na redukcji wymaga\b/g, '; na redukcji wymagają');
        t = t.replace(/\. Na redukcji wymaga\b/g, '. Na redukcji wymagają');
    }

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
