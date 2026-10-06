/**
 * „Losowe statystyki" — 5 krótkich, konkretnych ciekawostek per produkt.
 * Wybierane pseudolosowo (deterministycznie) po slug, dzięki czemu są stabilne
 * przy każdej przebudowie, ale różnią się między produktami.
 */
import { CATEGORY_LABELS } from './category-seo.mjs';
import { MICRO_KEYS_ORDER, MICRO_META, pctOfRda } from './lib/micros-shared.mjs';
import { hashSlug, pick, servingPhrase } from './editorial-utils.mjs';
import { verb3 } from './polish-gender.mjs';

const DAILY_KCAL = 2000;
const DAILY_PROTEIN = 120;

function num(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
}
function round2(v) {
    return Math.round(v * 100) / 100;
}
/** Format liczby po polsku (przecinek dziesiętny). */
function pl(n) {
    const v = Number(n);
    if (!Number.isFinite(v)) return '0';
    if (Number.isInteger(v)) return String(v);
    return v.toFixed(1).replace('.', ',').replace(/,0$/, '');
}
function density(p) {
    const kcal = num(p.kcal);
    const protein = num(p.protein);
    return kcal > 0 && protein > 0 ? (protein / kcal) * 100 : 0;
}
function pluralProducts(n) {
    if (n === 1) return 'produkt';
    const m10 = n % 10;
    const m100 = n % 100;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return 'produkty';
    return 'produktów';
}
function seededShuffle(arr, seed) {
    const a = arr.slice();
    let s = seed >>> 0;
    const rnd = () => {
        s = (s * 1664525 + 1013904223) >>> 0;
        return s / 4294967296;
    };
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rnd() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// Dopełniacz nazw metryk (do fraz „więcej / najwięcej X")
const MICRO_GEN = {
    vitA: 'witaminy A', vitC: 'witaminy C', vitD: 'witaminy D', vitE: 'witaminy E', vitK: 'witaminy K',
    b1: 'witaminy B1', b2: 'witaminy B2', b3: 'witaminy B3', b5: 'witaminy B5', b6: 'witaminy B6',
    b7: 'witaminy B7', b9: 'kwasu foliowego', b12: 'witaminy B12', choline: 'choliny',
    calcium: 'wapnia', iron: 'żelaza', magnesium: 'magnezu', phosphorus: 'fosforu', potassium: 'potasu',
    zinc: 'cynku', selenium: 'selenu', copper: 'miedzi', manganese: 'manganu', iodine: 'jodu', sodium: 'sodu'
};

function microsOf(p) {
    return p.microsDetail && typeof p.microsDetail === 'object' ? p.microsDetail : {};
}
function microVal(p, key) {
    const d = microsOf(p);
    return d[key] != null ? Number(d[key]) || 0 : 0;
}
function topMicros(p, count) {
    const d = microsOf(p);
    return MICRO_KEYS_ORDER
        .filter((k) => k !== 'sodium' && d[k] != null && Number(d[k]) > 0)
        .map((k) => ({
            k,
            label: MICRO_META[k].label.replace(/\s*\([^)]*\)/, ''),
            val: Number(d[k]),
            unit: MICRO_META[k].unit,
            pct: pctOfRda(d[k], k)
        }))
        .sort((a, b) => b.pct - a.pct)
        .slice(0, count);
}

/**
 * Kontekst statystyk — agregaty per kategoria + rozkład cen białka.
 * Budowane raz dla całej bazy.
 */
export function buildStatsContext(products) {
    const byCat = new Map();
    for (const p of products) {
        if (!byCat.has(p.category)) byCat.set(p.category, []);
        byCat.get(p.category).push(p);
    }
    const catStats = new Map();
    for (const [cat, list] of byCat) {
        const n = list.length;
        const avg = (fn) => (n ? list.reduce((s, x) => s + fn(x), 0) / n : 0);
        catStats.set(cat, {
            list,
            n,
            label: CATEGORY_LABELS[cat] || cat,
            avgKcal: avg((x) => num(x.kcal)),
            avgProtein: avg((x) => num(x.protein)),
            avgFat: avg((x) => num(x.fat)),
            avgCarbs: avg((x) => num(x.carbs))
        });
    }
    const allProteinPrices = products
        .map((x) => num(x.pricePer100gProtein))
        .filter((v) => v > 0)
        .sort((a, b) => a - b);
    return { catStats, allProteinPrices };
}

function isMax(list, valueOf, p) {
    const v = valueOf(p);
    if (!(v > 0)) return false;
    return list.every((x) => valueOf(x) <= v);
}
function isMin(list, valueOf, p) {
    const v = valueOf(p);
    return list.every((x) => valueOf(x) >= v);
}
function rankIn(list, valueOf, p, desc) {
    const sorted = list
        .map((x) => ({ x, v: valueOf(x) }))
        .sort((a, b) => (desc ? b.v - a.v : a.v - b.v));
    const i = sorted.findIndex((e) => e.x === p);
    return i >= 0 ? i + 1 : 0;
}
function fmtRatio(r) {
    if (r >= 9.5) return String(Math.round(r));
    return pl(Math.round(r * 10) / 10);
}

function superlative(p, ctx) {
    const cat = ctx.catStats.get(p.category);
    if (!cat) return '';
    const list = cat.list;
    const cands = [];
    if (num(p.protein) > 0 && isMax(list, (x) => num(x.protein), p)) cands.push('najwięcej białka');
    if (density(p) > 0 && isMax(list, density, p)) cands.push('najlepszy stosunek białka do kalorii');
    if (isMin(list, (x) => num(x.kcal), p)) cands.push('najmniej kalorii');
    for (const m of topMicros(p, 3)) {
        if (isMax(list, (x) => microVal(x, m.k), p)) cands.push(`najwięcej ${MICRO_GEN[m.k] || m.label}`);
    }
    if (!cands.length) return '';
    const chosen = pick(cands, p.slug, 101);
    return `${p.name} ${verb3(p.name, 'ma', 'mają')} ${chosen} w kategorii ${cat.label}.`;
}

function comparison(p, ctx) {
    const cat = ctx.catStats.get(p.category);
    if (!cat || cat.n < 2) return '';
    const list = cat.list;
    const metrics = [
        { get: (x) => num(x.kcal), gen: 'kalorii' },
        { get: (x) => num(x.protein), gen: 'białka' },
        { get: (x) => num(x.fat), gen: 'tłuszczu' },
        { get: (x) => num(x.carbs), gen: 'węglowodanów' }
    ];
    for (const m of topMicros(p, 3)) {
        metrics.push({ get: (x) => microVal(x, m.k), gen: MICRO_GEN[m.k] || m.label });
    }
    const order = seededShuffle(metrics.map((_, i) => i), hashSlug(p.slug, 201));
    for (const idx of order) {
        const m = metrics[idx];
        const cur = m.get(p);
        if (!(cur > 0)) continue;
        const cands = [];
        for (const q of list) {
            if (q.slug === p.slug) continue;
            const v = m.get(q);
            if (!(v > 0)) continue;
            if (cur >= v * 2) cands.push({ peer: q, ratio: cur / v, more: true });
            else if (v >= cur * 2) cands.push({ peer: q, ratio: v / cur, more: false });
        }
        if (cands.length) {
            const c = pick(cands, p.slug, 202 + idx);
            const dir = c.more ? 'więcej' : 'mniej';
            return `${p.name} ${verb3(p.name, 'ma', 'mają')} ${fmtRatio(c.ratio)} razy ${dir} ${m.gen} niż ${c.peer.name}.`;
        }
    }
    return '';
}

function avgKcal(p, ctx) {
    const cat = ctx.catStats.get(p.category);
    if (!cat || cat.n < 2 || !(cat.avgKcal > 0)) return '';
    const kcal = num(p.kcal);
    const pct = Math.round((Math.abs(kcal - cat.avgKcal) / cat.avgKcal) * 100);
    if (pct < 10) return '';
    const more = kcal > cat.avgKcal;
    return `${p.name} ${verb3(p.name, 'ma', 'mają')} ${pct}% ${more ? 'więcej' : 'mniej'} kalorii niż średnia w kategorii ${cat.label}.`;
}

function microRda(p) {
    const m = topMicros(p, 1)[0];
    if (!m || m.pct < 8) return '';
    return `W 100 g znajdziesz ${Math.round(m.pct)}% dziennej normy ${MICRO_GEN[m.k] || m.label} (${pl(m.val)} ${m.unit}).`;
}

function kcalFact(p) {
    const kcal = num(p.kcal);
    if (kcal > 0) {
        const pct = Math.round((kcal / DAILY_KCAL) * 100);
        if (pct < 1) return `W 100 g jest ${pl(kcal)} kcal — to mniej niż 1% dziennego zapotrzebowania (${DAILY_KCAL} kcal).`;
        return `W 100 g jest ${pl(kcal)} kcal — to ok. ${pct}% dziennego zapotrzebowania (${DAILY_KCAL} kcal).`;
    }
    return 'W 100 g jest 0 kcal — ten produkt nie dostarcza energii z kalorii.';
}

function price(p, ctx) {
    const proteinPrice = num(p._proteinPrice);
    if (proteinPrice > 0 && ctx.allProteinPrices.length > 2) {
        const below = ctx.allProteinPrices.filter((v) => v < proteinPrice).length;
        const pct = Math.round((below / ctx.allProteinPrices.length) * 100);
        if (pct >= 50) {
            return `Za 100 g białka zapłacisz ok. ${pl(round2(proteinPrice))} zł — taniej niż w ${pct}% produktów bazy.`;
        }
        return `Za 100 g białka zapłacisz ok. ${pl(round2(proteinPrice))} zł — drożej niż w ${100 - pct}% produktów bazy.`;
    }
    const foodPrice = num(p._foodPrice);
    if (foodPrice > 0) {
        return `Orientacyjna cena to ${pl(round2(foodPrice))} zł za 100 g.`;
    }
    return '';
}

function serving(p) {
    const g = num(p.proteinInServing);
    if (!(g > 0)) return '';
    const sv = servingPhrase(p);
    const svCap = sv.charAt(0).toUpperCase() + sv.slice(1);
    const pct = Math.round((g / DAILY_PROTEIN) * 100);
    return `${svCap} dostarcza ${pl(g)} g białka — to ok. ${pct}% dziennego celu ${DAILY_PROTEIN} g.`;
}

function densityStat(p) {
    const d = density(p);
    if (!(d > 0)) return '';
    return `${p.name} ${verb3(p.name, 'ma', 'mają')} ${pl(d)} g białka na każde 100 kcal.`;
}

function rankBest(p, ctx) {
    const cat = ctx.catStats.get(p.category);
    if (!cat) return '';
    const list = cat.list;
    const total = cat.n;
    const metrics = [
        { name: 'białka', rank: num(p.protein) > 0 ? rankIn(list, (x) => num(x.protein), p, true) : 0 },
        { name: 'stosunku białka do kalorii', rank: density(p) > 0 ? rankIn(list, density, p, true) : 0 },
        { name: 'kalorii', rank: rankIn(list, (x) => num(x.kcal), p, false) }
    ];
    let best = null;
    for (const m of metrics) {
        if (!m.rank) continue;
        if (!best || m.rank / total < best.rank / total) best = m;
    }
    if (!best) return '';
    return `${p.name} ${verb3(p.name, 'wypada', 'wypadają')} najlepiej pod względem ${best.name} — ${best.rank}. miejsce na ${total} w kategorii ${cat.label}.`;
}

function categoryCount(p, ctx) {
    const cat = ctx.catStats.get(p.category);
    if (!cat) return '';
    const noun = cat.n === 1 ? 'produktu' : 'produktów';
    return `To 1 z ${cat.n} ${noun} w kategorii ${cat.label} w bazie Proteiner.`;
}

const GENERATORS = [
    ['superlative', superlative],
    ['comparison', comparison],
    ['avgKcal', avgKcal],
    ['microRda', microRda],
    ['kcalFact', kcalFact],
    ['price', price],
    ['serving', serving],
    ['density', densityStat],
    ['rankBest', rankBest],
    ['categoryCount', categoryCount]
];

/** 5 deterministycznie wybranych statystyk dla produktu. */
export function buildProductStats(p, ctx) {
    const found = [];
    for (const [type, gen] of GENERATORS) {
        const text = gen(p, ctx);
        if (text) found.push({ type, text });
    }
    const shuffled = seededShuffle(found, hashSlug(p.slug, 301));
    const seen = new Set();
    const result = [];
    for (const s of shuffled) {
        if (seen.has(s.type)) continue;
        seen.add(s.type);
        result.push(s);
        if (result.length >= 5) break;
    }
    const byType = Object.fromEntries(GENERATORS);
    for (const type of ['rankBest', 'categoryCount', 'kcalFact']) {
        if (result.length >= 5) break;
        if (seen.has(type)) continue;
        const text = byType[type](p, ctx);
        if (text) {
            result.push({ type, text });
            seen.add(type);
        }
    }
    return result.slice(0, 5).map((s) => s.text);
}

