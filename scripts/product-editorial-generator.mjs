/**
 * Generator opisów produktów — treść oparta na danych konkretnego produktu:
 * gęstość białka, pozycja w kategorii, mikroskładniki z %RDA, porcja i cena.
 * Każda sekcja ma wiele wariantów wybieranych deterministycznie po slug,
 * dzięki czemu opisy nie są jednym schematem.
 */
import { CATEGORY_LABELS } from './category-seo.mjs';
import { MICRO_KEYS_ORDER, MICRO_META, formatMicroAmount, pctOfRda } from './lib/micros-shared.mjs';
import { contextualPracticalAddon } from './editorial-context.mjs';
import { fmt, pick, servingPhrase } from './editorial-utils.mjs';
import { jestSa, polishEditorial, verb3 } from './polish-gender.mjs';

// Punkt odniesienia: pierś z kurczaka (23 g białka / 120 kcal na 100 g).
const CHICKEN_PROTEIN = 23;
const CHICKEN_DENSITY = (CHICKEN_PROTEIN / 120) * 100; // ~19,2 g / 100 kcal
// Orientacyjny dzienny cel białka dla osoby trenującej.
const DAILY_PROTEIN_TARGET = 120;

function num(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
}

/** Gramy białka na 100 kcal. */
function density(p) {
    const kcal = num(p.kcal);
    const protein = num(p.protein);
    if (kcal <= 0 || protein <= 0) return 0;
    return (protein / kcal) * 100;
}

/** Procent kalorii pochodzących z białka. */
function proteinShare(p) {
    const kcal = num(p.kcal);
    const protein = num(p.protein);
    if (kcal <= 0 || protein <= 0) return 0;
    return Math.round(((protein * 4) / kcal) * 100);
}

/** Formy przymiotnika „gęstość białka” zależne od rodzaju rzeczownika w zdaniu. */
function densityWord(d) {
    if (d >= 15) return { m: 'bardzo wysoki', f: 'bardzo wysoka', n: 'bardzo wysokie' };
    if (d >= 10) return { m: 'wysoki', f: 'wysoka', n: 'wysokie' };
    if (d >= 5) return { m: 'umiarkowany', f: 'umiarkowana', n: 'umiarkowane' };
    if (d > 0) return { m: 'niski', f: 'niska', n: 'niskie' };
    return { m: 'nieokreślony', f: 'nieokreślona', n: 'nieokreślone' };
}

function ordinal(n) {
    return `${n}.`;
}

/** Najlepsze mikroskładniki (wg % RDA) z mikrodanych produktu. */
function topMicros(p, count = 2) {
    const detail = p.microsDetail && typeof p.microsDetail === 'object' ? p.microsDetail : null;
    if (!detail) return [];
    return MICRO_KEYS_ORDER
        .filter((k) => k !== 'sodium' && detail[k] != null && num(detail[k]) > 0)
        .map((k) => ({
            k,
            label: MICRO_META[k].label.replace(/\s*\([^)]*\)/, ''),
            amount: num(detail[k]),
            unit: MICRO_META[k].unit,
            pct: pctOfRda(detail[k], k),
        }))
        .sort((a, b) => b.pct - a.pct)
        .slice(0, count);
}

function microPhrase(item) {
    return `${item.label} (${formatMicroAmount(item.amount, item.unit)})`;
}

/** Liczba mnoga dla „X z Y produktów”. */
function pluralProducts(n) {
    if (n === 1) return 'produkt';
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'produkty';
    return 'produktów';
}

/** Info o pozycji w kategorii (z kontekstu przekazanego przez generate-product-pages). */
function catInfo(p) {
    const ctx = p._editorialCtx;
    const info = ctx && ctx.bySlug ? ctx.bySlug[p.slug] : null;
    return info || null;
}

/** Akapit 1 — profil makro i porównanie z piersią kurczaka. */
function buildLead(p) {
    const protein = num(p.protein);
    const kcal = num(p.kcal);
    const d = density(p);
    const share = proteinShare(p);
    const catLabel = CATEGORY_LABELS[p.category] || p.category;

    const opener = pick(
        [
            `${p.name} ${verb3(p.name, 'dostarcza', 'dostarczają')} ${fmt(protein)} g białka i ${fmt(kcal)} kcal w 100 g, czyli ${share}% kalorii pochodzi tu z protein.`,
            `${p.name} to ${fmt(protein)} g białka i ${fmt(kcal)} kcal w 100 g — gęstość białka na poziomie ${fmt(d)} g na 100 kcal.`,
            `${p.name} w 100 g zawiera ${fmt(protein)} g białka przy ${fmt(kcal)} kcal; białko odpowiada za ${share}% energii.`,
            `W 100 g produktu jest ${fmt(protein)} g białka i ${fmt(kcal)} kcal — to ${densityWord(d).f} gęstość białka jak na kategorię ${catLabel}.`,
            `${p.name} ${jestSa(p.name)} źródłem ${fmt(protein)} g białka i ${fmt(kcal)} kcal w każdych 100 g.`,
            `${p.name} ${verb3(p.name, 'ma', 'mają')} ${fmt(protein)} g białka i ${fmt(kcal)} kcal w 100 g, a białko daje ${share}% wartości energetycznej.`,
        ],
        p.slug,
        1
    );

    let compare = '';
    if (protein >= 5) {
        compare =
            d >= CHICKEN_DENSITY
                ? pick(
                      [
                          ` Pod względem stosunku białka do kalorii dorównuje lub przebija pierś z kurczaka (${CHICKEN_PROTEIN} g białka / 120 kcal).`,
                          ` To co najmniej tak korzystny bilans białko–kalorie jak referencyjna pierś z kurczaka (${CHICKEN_PROTEIN} g / 120 kcal).`,
                          ` Gęstość białka jest równa lub wyższa niż w klasycznej piersi z kurczaka (${CHICKEN_PROTEIN} g / 120 kcal).`,
                      ],
                      p.slug,
                      2
                  )
                : pick(
                      [
                          ` Dla porównania pierś z kurczaka daje ${CHICKEN_PROTEIN} g białka przy 120 kcal, więc wybór zależy od tego, co jeszcze chcesz zjeść w ciągu dnia.`,
                          ` Punkt odniesienia to pierś z kurczaka (${CHICKEN_PROTEIN} g / 120 kcal) — ten produkt warto łączyć z chudszym źródłem protein.`,
                          ` Referencyjnie pierś z kurczaka ma ${CHICKEN_PROTEIN} g białka przy 120 kcal, co pomaga ocenić rolę tej porcji w diecie.`,
                      ],
                      p.slug,
                      3
                  );
    }
    return opener + compare;
}

/** Akapit 2 — gęstość białka i pozycja w kategorii. */
function buildProteinParagraph(p, info) {
    const d = density(p);
    const catLabel = info ? info.catLabel : CATEGORY_LABELS[p.category] || p.category;
    const parts = [];

    if (d > 0) {
        parts.push(
            pick(
                [
                    `Gęstość białka to ${fmt(d)} g na 100 kcal — to ${densityWord(d).f} wartość jak na kategorię ${catLabel}.`,
                    `Na każde 100 kcal przypada tu ${fmt(d)} g białka, co daje ${densityWord(d).m} wynik na tle bazy.`,
                    `Stosunek białka do kalorii (${fmt(d)} g / 100 kcal) jest ${densityWord(d).m} — to liczba, którą warto porównywać między produktami.`,
                    `Z ${fmt(d)} g białka na 100 kcal wynika ${densityWord(d).f} gęstość białka w kategorii ${catLabel}.`,
                ],
                p.slug,
                11
            )
        );
    }

    if (info && info.proteinRank && info.catCount >= 8) {
        parts.push(
            pick(
                [
                    `W kategorii ${catLabel} to ${ordinal(info.proteinRank)} wynik pod względem zawartości białka (na ${info.catCount} ${pluralProducts(info.catCount)}).`,
                    `Zawartość białka daje ${ordinal(info.proteinRank)} miejsce w kategorii ${catLabel} (na ${info.catCount} ${pluralProducts(info.catCount)}).`,
                    `Wśród ${info.catCount} ${pluralProducts(info.catCount)} w kategorii ${catLabel} zajmuje ${ordinal(info.proteinRank)} lokatę pod względem białka.`,
                    `Pod kątem białka plasuje się na ${ordinal(info.proteinRank)} pozycji w kategorii ${catLabel} (na ${info.catCount} ${pluralProducts(info.catCount)}).`,
                ],
                p.slug,
                12
            )
        );
    }
    return parts.join(' ');
}

/** Akapit 3 — mikroskładniki z % RDA. */
function buildMicrosParagraph(p) {
    const micros = topMicros(p, 2);
    if (!micros.length) return '';

    const list = micros.map(microPhrase).join(' oraz ');
    const first = micros[0];
    const second = micros[1];

    let text = pick(
        [
            `W 100 g znajdziesz ${list}.`,
            `Spośród witamin i minerałów wyróżniają się: ${list}.`,
            `Na uwagę zasługują ${list}.`,
            `Mikroskładniki w 100 g to m.in. ${list}.`,
            `Jeśli patrzysz na witaminy i minerały, w 100 g są tu ${list}.`,
        ],
        p.slug,
        21
    );

    if (first.pct >= 15) {
        text += pick(
            [
                ` Szczególnie mocno wypada ${first.label} — to ok. ${Math.round(first.pct)}% dziennego zapotrzebowania w jednej porcji 100 g.`,
                ` Najmocniejszy punkt to ${first.label}: ok. ${Math.round(first.pct)}% dziennej normy (RDA) w samych 100 g.`,
                ` ${first.label} pokrywa tu ok. ${Math.round(first.pct)}% RDA, licząc tylko 100 g produktu.`,
            ],
            p.slug,
            22
        );
    } else if (second && second.pct >= 8) {
        text += pick(
            [
                ` Najwięcej wnoszą ${first.label} i ${second.label}, choć żaden z nich nie pokrywa większej części dziennej normy.`,
                ` Żaden z tych składników nie przekracza mocno 10% RDA — to raczej dodatek niż główne źródło.`,
            ],
            p.slug,
            23
        );
    } else {
        text += ' Wartości mikroskładników są orientacyjne i zależą od partii oraz sposobu przygotowania.';
    }
    return text;
}

/** Akapit 4 — porcja i koszt białka. */
function buildServingParagraph(p, info) {
    const proteinServing = num(p.proteinInServing);
    const serving = servingPhrase(p);
    const parts = [];

    if (proteinServing > 0) {
        const pctTarget = Math.round((proteinServing / DAILY_PROTEIN_TARGET) * 100);
        parts.push(
            pick(
                [
                    `Porcja (${serving}) dostarcza ${fmt(proteinServing)} g białka, czyli ok. ${pctTarget}% orientacyjnego dziennego celu ${DAILY_PROTEIN_TARGET} g.`,
                    `${serving} to ${fmt(proteinServing)} g białka — mniej więcej ${pctTarget}% zapotrzebowania przy celu ${DAILY_PROTEIN_TARGET} g.`,
                    `Jedna porcja (${serving}) wnosi ${fmt(proteinServing)} g białka (≈${pctTarget}% celu ${DAILY_PROTEIN_TARGET} g dziennie).`,
                    `W jednej porcji (${serving}) jest ${fmt(proteinServing)} g białka, co daje ok. ${pctTarget}% dziennego celu ${DAILY_PROTEIN_TARGET} g.`,
                ],
                p.slug,
                31
            )
        );
    }

    const priceProtein = num(p.pricePer100gProtein);
    if (priceProtein > 0) {
        let verdict = 'typowa dla bazy';
        if (info && info.priceRank && info.priceCount >= 8) {
            const rel = info.priceRank / info.priceCount;
            if (rel <= 0.25) verdict = `jedna z najtańszych w kategorii ${info.catLabel}`;
            else if (rel >= 0.75) verdict = `droższa niż większość produktów w kategorii ${info.catLabel}`;
            else verdict = `średnia na tle kategorii ${info.catLabel}`;
        }
        parts.push(
            pick(
                [
                    `Cena ok. ${fmt(priceProtein)} zł za 100 g białka — ${verdict}.`,
                    `Za 100 g białka zapłacisz ok. ${fmt(priceProtein)} zł; to ${verdict}.`,
                    `Koszt 100 g białka wynosi ok. ${fmt(priceProtein)} zł, czyli ${verdict}.`,
                ],
                p.slug,
                32
            )
        );
    }
    return parts.join(' ');
}

/** Akapit 5 — praktyka w kuchni i w dzienniku. */
function buildPracticalParagraph(p, info) {
    const catLabel = info ? info.catLabel : CATEGORY_LABELS[p.category] || p.category;
    const addon = contextualPracticalAddon(p) || '';
    const lead = pick(
        [
            `W codziennym liczeniu makro najważniejsza jest porcja, nie sam produkt — ${p.name} ${verb3(p.name, 'wpisuje się', 'wpisują się')} w kategorię ${catLabel}.`,
            `${p.name} ${verb3(p.name, 'należy', 'należą')} do kategorii ${catLabel} — przy układaniu dnia pilnuj wielkości porcji, nie tylko samego wyboru.`,
            `Jeśli wpisujesz ${p.name} do dziennika, pamiętaj, że liczy się cały posiłek — ten produkt reprezentuje kategorię ${catLabel}.`,
            `Największy wpływ na wynik ma porcja i dodatki — ${p.name} to kategoria ${catLabel}, więc zestawiaj go z resztą talerza.`,
        ],
        p.slug,
        41
    );
    return [lead, addon].filter(Boolean).join(' ');
}

/** Tytuł sekcji opisu. */
function buildTitle(p) {
    return pick(
        [
            `${p.name} w diecie — białko, kalorie i wartości odżywcze`,
            `Ile białka ma ${p.name}? Makro, mikro i praktyka`,
            `${p.name} — co daje 100 g i jak wpisać to w dziennik`,
            `${p.name}: wartości odżywcze i rola w codziennej diecie`,
            `${p.name} — białko, kcal i wskazówki dla liczących makro`,
            `Makro i mikro ${p.name} — z czym to jeść i jak liczyć`,
        ],
        p.slug,
        51
    );
}

/**
 * Główny generator opisu produktu.
 * @param {object} p produkt (z opcjonalnym p._editorialCtx z generate-product-pages)
 * @returns {{ title: string, paragraphs: string[] }}
 */
export function generateProductEditorial(p) {
    const info = catInfo(p);
    const paragraphs = [
        buildLead(p),
        buildProteinParagraph(p, info),
        buildMicrosParagraph(p),
        buildServingParagraph(p, info),
        buildPracticalParagraph(p, info),
    ].filter((t) => t && t.trim().length > 0);

    return polishEditorial({ title: buildTitle(p), paragraphs }, p.name);
}

/** Czy wygenerowany opis jest wystarczająco obszerny, by indeksować stronę. */
export function generatedEditorialIsRich(p) {
    const ed = generateProductEditorial(p);
    const paragraphs = ed.paragraphs || [];
    const total = paragraphs.join(' ').length;
    return paragraphs.length >= 3 && total >= 450;
}
