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
    ['coca-cola', 'f'], ['coca-cola zero', 'f'], ['pepsi', 'f'], ['sprite', 'm'],
    ['fanta', 'f'], ['mirinda', 'f'], ['nestea', 'f'], ['lipton', 'm'],
    ['wódka', 'f'], ['wyborowa', 'f'], ['soplica', 'f'], ['żubrówka', 'f'],
    ['piwo', 'n'], ['wino', 'n'], ['prosecco', 'n'], ['sól', 'f'], ['papryka', 'f'],
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
    // dodatkowe plurale (końcówka -y/-i/-e bywa myląca)
    ['bataty', 'pl'], ['biszkopty', 'pl'], ['kabanosy', 'pl'], ['korniszony', 'pl'],
    ['krokiety', 'pl'], ['szparagi', 'pl'], ['zrazy', 'pl'], ['grześki', 'pl'],
    ['cannelloni', 'pl'], ['gnocchi', 'pl'], ['ravioli', 'pl'], ['tortellini', 'pl'],
    ['rodzynki', 'pl'], ['mandarynki', 'pl'], ['porzeczki', 'pl'],
    // nijakie / brandy mylone z liczbą mnogą (np. -nie w „brownie”, -sie w „ptasie”)
    ['brownie', 'n'], ['brownie czekoladowe', 'n'],
    ['ptasie mleczko', 'n'], ['mleczko', 'n'],
    ['smoothie', 'n'], ['guacamole', 'n'], ['minestrone', 'n'],
]);

const LEADING_ADJ = /^(suszone|gotowane|marynowane|świeże|świeży|pieczone|smażone|smazone|ugotowane|mrożone|krojone|naturalne|naturalny|naturalna|pełno|pełne|suszone|suszona|suszony|ptasie)$/i;

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

    // ——— liczba mnoga (kolejność ma znaczenie) ———
    // -ki (płatki, frytki, żelki, grześki)
    if (/ki$/i.test(word) && word.length > 3) return 'pl';
    // -y (bataty, kabanosy, orzechy) — wcześniej warunek /[aei]$/ blokował tę ścieżkę
    if (/y$/i.test(word) && word.length > 3) {
        if (!/^(curry|jelly|whisky|wasabi)$/i.test(word)) return 'pl';
    }
    // -cje (delicje, pistacje)
    if (/cje$/i.test(word)) return 'pl';
    // typowe plurale na -gi / -dzi / -li (pierogi, gołąbki via -ki already)
    if (/(ogi|agi)$/i.test(word) && word.length > 4) return 'pl';
    // -e tylko dla znanych wzorców pluralnych — NIE „brownie” (-nie), NIE przymiotniki (-sie)
    if (/(ale|ule|ele|one|iny|yny|awy|owe)$/i.test(word) && word.length > 4) {
        // „flaki” jest w overrides; „naleśniki” via -ki
    }
    // lista znanych plurali na -e / inne
    if (
        /^(płatki|ziemniaki|brokuły|frytki|nuggetsy|stripsy|żelki|lody|chipsy|orzechy|migdały|krewetki|kalmary|maliny|jagody|borówki|truskawki|gruszki|śliwki|pomidory|ogórki|marchewki|parówki|gofry|penne|pistacje|pestki|delicje|kluski|herbatniki|krakersy|paluszki|wafle|otręby|kotlety|gołąbki|pyzy|wiśnie|czereśnie|figi|daktyle|morele|pieczarki|nasiona|flaki|grześki|bataty|biszkopty|kabanosy|korniszony|krokiety|szparagi|zrazy|rodzynki|mandarynki|porzeczki|cannelloni|gnocchi|ravioli|tortellini)$/i.test(
            word
        )
    ) {
        return 'pl';
    }

    // żeński: -a (z wyjątkami męskich: mężczyzna, poeta...)
    if (/a$/i.test(word) && !/^(kuba|boga|sota)$/i.test(word)) return 'f';

    // nijaki: -o, -e, -ę (w tym brownie, smoothie — po wyłączeniu fałszywych plurali)
    if (/o$/i.test(word)) return 'n';
    if (/ę$/i.test(word)) return 'n';
    if (/e$/i.test(word) && !/a$/i.test(word)) return 'n';

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
 * Działa też gdy nazwa jest już w <span class="product-name-inline">…</span>.
 * @param {string} text
 * @param {string} productName
 */
export function polishGenderInText(text, productName) {
    if (!text || !productName) return text;
    const g = detectGender(productName);
    const nameEsc = productName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Nazwa naga, marker [[PN|…|PN]], lub span product-name-inline
    const nameToken = `(?:${nameEsc}|\\[\\[PN\\|${nameEsc}\\|PN\\]\\]|<span class="product-name-inline">${nameEsc}<\\/span>)`;
    let t = text;

    // \b nie działa po polskich znakach (ą/ę…) — koniec słowa = nie-litera
    const end = '(?!\\p{L})';
    const replaceVerb = (sg, pl) => {
        const form = verb3(productName, sg, pl);
        const escSg = sg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const escPl = pl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        t = t.replace(new RegExp(`(${nameToken}) ${escSg}${end}`, 'gu'), `$1 ${form}`);
        t = t.replace(new RegExp(`(${nameToken}) ${escPl}${end}`, 'gu'), `$1 ${form}`);
        t = t.replace(
            new RegExp(
                `(${nameToken}) (często|najlepiej|po prostu|również|także) ${escSg}${end}`,
                'gu'
            ),
            `$1 $2 ${form}`
        );
        t = t.replace(
            new RegExp(
                `(${nameToken}) (często|najlepiej|po prostu|również|także) ${escPl}${end}`,
                'gu'
            ),
            `$1 $2 ${form}`
        );
    };

    // „X jest/są gęsty|gęsta|gęste kalorycznie”
    t = t.replace(
        new RegExp(`(${nameToken}) (?:jest|są) gęst\\w* kalorycznie`, 'g'),
        (_, namePart) => {
            const adj = g === 'f' ? 'gęsta' : g === 'n' || g === 'pl' ? 'gęste' : 'gęsty';
            return `${namePart} ${jestSa(productName)} ${adj} kalorycznie`;
        }
    );

    replaceVerb('ma', 'mają');
    replaceVerb('jest', 'są');
    replaceVerb('bywa', 'bywają');

    // „X nie jest / nie są „zakazany””
    t = t.replace(
        new RegExp(`(${nameToken}) nie jest „zakazan[yae]”`, 'g'),
        `$1 nie ${jestSa(productName)} „${zakazany(productName)}”`
    );
    t = t.replace(
        new RegExp(`(${nameToken}) nie są „zakazan[yae]”`, 'g'),
        `$1 nie ${jestSa(productName)} „${zakazany(productName)}”`
    );

    // „X nie jest/są dietetyczny…” (z cudzysłowem lub bez)
    t = t.replace(
        new RegExp(`(${nameToken}) nie (?:jest|są) „dietetyczn\\w*”`, 'g'),
        `$1 nie ${jestSa(productName)} „${agree('dietetyczn', g)}”`
    );
    t = t.replace(
        new RegExp(`(${nameToken}) nie (?:jest|są) "dietetyczn\\w*"`, 'g'),
        `$1 nie ${jestSa(productName)} "${agree('dietetyczn', g)}"`
    );
    t = t.replace(
        new RegExp(`(${nameToken}) nie (?:jest|są) dietetyczn\\w*`, 'g'),
        `$1 nie ${jestSa(productName)} ${agree('dietetyczn', g)}`
    );

    // „X bywa wygodny…”
    t = t.replace(
        new RegExp(`(${nameToken}) bywa wygodny(?! wybór)`, 'g'),
        `$1 ${verb3(productName, 'bywa', 'bywają')} ${agree('wygodn', g)}`
    );
    t = t.replace(
        new RegExp(`(${nameToken}) bywa wygodny wybór`, 'g'),
        `$1 to wygodny wybór`
    );
    t = t.replace(
        new RegExp(`(${nameToken}) bywa wygodna opcja`, 'g'),
        `$1 to wygodna opcja`
    );

    // „X może/mogą okazać się tańszy…”
    t = t.replace(
        new RegExp(`(${nameToken}) (?:może|mogą) okazać się tańsz\\w* lub droższ\\w*`, 'g'),
        `$1 ${verb3(productName, 'może', 'mogą')} okazać się ${cheaperPair(productName)}`
    );

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
        ['daje', 'dają'],
        ['może', 'mogą'],
        ['mieści się', 'mieszczą się'],
        ['najlepiej sprawdza się', 'najlepiej sprawdzają się'],
    ];
    for (const [sg, pl] of verbPairs) {
        replaceVerb(sg, pl);
    }

    t = t.replace(
        new RegExp(`(${nameToken}) to dobry (\\w+)`, 'g'),
        (_, namePart, noun) => {
            const femNouns = ['alternatywa', 'opcja', 'przekąska', 'zmiana', 'baza', 'porcja'];
            if (femNouns.includes(noun)) return `${namePart} to dobra ${noun}`;
            if (noun === 'źródło') return `${namePart} to dobre źródło`;
            return `${namePart} to ${agree('dobr', g)} ${noun}`;
        }
    );

    t = t.replace(/\bdobry białko\b/g, 'dobre białko');

    t = t.replace(
        new RegExp(`(${nameToken}) ${jestSa(productName)} dobry na`, 'g'),
        `$1 ${jestSa(productName)} ${agree('dobr', g)} na`
    );
    t = t.replace(
        new RegExp(`(${nameToken}) ${jestSa(productName)} dobry do`, 'g'),
        `$1 ${jestSa(productName)} ${agree('dobr', g)} do`
    );

    t = t.replace(
        new RegExp(`(${nameToken}) ${jestSa(productName)} popularny w`, 'g'),
        `$1 ${jestSa(productName)} ${agree('popularn', g)} w`
    );

    t = t.replace(
        new RegExp(`(${nameToken}) często wybieran[yae]`, 'g'),
        `$1 często ${wybierany(productName)}`
    );

    if (g === 'pl') {
        t = t.replace(/; na redukcji wymaga(?!\p{L})/gu, '; na redukcji wymagają');
        t = t.replace(/\. Na redukcji wymaga(?!\p{L})/gu, '. Na redukcji wymagają');
        t = t.replace(/— po prostu ma(?!\p{L})/gu, '— po prostu mają');
        t = t.replace(/po prostu ma(?!\p{L})/gu, 'po prostu mają');
    } else {
        t = t.replace(/; na redukcji wymagają(?!\p{L})/gu, '; na redukcji wymaga');
        t = t.replace(/\. Na redukcji wymagają(?!\p{L})/gu, '. Na redukcji wymaga');
        t = t.replace(/— po prostu mają(?!\p{L})/gu, '— po prostu ma');
        t = t.replace(/po prostu mają(?!\p{L})/gu, 'po prostu ma');
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
