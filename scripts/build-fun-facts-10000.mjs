/**
 * build-fun-facts-10000.mjs
 *
 * Buduje bazę fun faktów dla /fun-fakty (docelowo 10 000 ciekawostek).
 *
 * Źródła:
 *   1. fun-facts-new.json          — ręcznie pisane ciekawostki (trivia, historia, rekordy).
 *   2. js/products-lite.js         — 2315 realnych produktów (białko, kcal, porcja, cena, mikro).
 *   3. js/fun-fakty.js             — BUILTIN_FACTS (na potrzeby deduplikacji).
 *
 * Wynik (serwowane artefakty):
 *   fun-facts/index.json      — spis: total + kategorie + pliki + token wersji.
 *   fun-facts/<slug>-N.json    — paczki po CHUNK_SIZE faktów (bez gzipa na serwerze,
 *                                dlatego dzielimy je na małe pliki i ładujemy leniwie).
 *
 * UWAGA: celowo NIE w data/ — workflow deployu (.github/workflows/deploy.yml)
 * wyklucza z FTP cały katalog **/data/** jako dane lokalne serwera, więc pliki
 * z data/ nie trafiłyby na produkcję.
 *
 * Uruchom: node scripts/build-fun-facts-10000.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'fun-facts');

/** Token wersji paczek — bump przy każdej regeneracji (długi cache na serwerze). */
const FACTS_V = '20260920fun10k';
const TARGET_TOTAL = 10000;
const CHUNK_SIZE = 800;

/* ---------------------------------------------------------------- formatowanie */

/** Liczba w formacie polskim: przecinek dziesiętny, spacja w tysiącach. */
function pl(x, dec = 0) {
    if (!Number.isFinite(x)) return '0';
    const fixed = Math.abs(x).toFixed(dec);
    const [int, frac] = fixed.split('.');
    const spaced = int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    const sign = x < 0 ? '-' : '';
    return sign + (frac ? spaced + ',' + frac : spaced);
}

/** Normalizacja do wykrywania duplikatów (jak w generate_fun_facts_new.py). */
function norm(s) {
    return String(s).toLowerCase().replace(/[^a-ząćęłńóśźż0-9]+/g, '');
}

const uniqueIdx = new Map();
const FACTS = [];
let skipped = 0;

function push(tag, emoji, text) {
    const t = String(text).replace(/\s+/g, ' ').trim();
    const key = norm(t);
    if (!key || uniqueIdx.has(key)) { skipped++; return; }
    uniqueIdx.set(key, true);
    FACTS.push({ emoji, tag, text: t });
}

/* --------------------------------------------------------------- źródła danych */

function readProducts() {
    const src = fs.readFileSync(path.join(ROOT, 'js', 'products-lite.js'), 'utf8');
    const json = src.slice(src.indexOf('['), src.lastIndexOf(']') + 1);
    return JSON.parse(json);
}

function readCurated() {
    const p = path.join(ROOT, 'fun-facts-new.json');
    if (!fs.existsSync(p)) return [];
    const arr = JSON.parse(fs.readFileSync(p, 'utf8'));
    return Array.isArray(arr) ? arr : [];
}

/** BUILTIN_FACTS z js/fun-fakty.js — wciągamy je do puli i używamy do deduplikacji. */
function readBuiltinFacts() {
    const src = fs.readFileSync(path.join(ROOT, 'js', 'fun-fakty.js'), 'utf8');
    const m = src.match(/BUILTIN_FACTS\s*=\s*(\[[\s\S]*?\n\s*\]);/);
    if (!m) return [];
    const arr = vm.runInNewContext('(' + m[1] + ')');
    return Array.isArray(arr) ? arr.filter((f) => f && f.text && f.tag) : [];
}

/* ------------------------------------------------------------------ kategorie */

const CAT_ORDER = [
    'Białko',
    'Odżywianie',
    'Odchudzanie',
    'Trening',
    'Suplementy',
    'Metabolizm',
    'Ciało',
    'Rekordy',
    'Historia',
    'Psychologia'
];

const CAT_SLUG = {
    'Białko': 'bialko',
    'Odżywianie': 'odzywianie',
    'Odchudzanie': 'odchudzanie',
    'Trening': 'trening',
    'Suplementy': 'suplementy',
    'Metabolizm': 'metabolizm',
    'Ciało': 'cialo',
    'Rekordy': 'rekordy',
    'Historia': 'historia',
    'Psychologia': 'psychologia'
};


/* -------------------------------------------------------- fakty z bazy produktów */

const products = readProducts();
const bySlug = new Map(products.map((p) => [p.slug, p]));

/** Punkt odniesienia dla porównań — pierś z kurczaka z bazy. */
const chicken = bySlug.get('piers-z-kurczaka') || { name: 'Pierś z kurczaka', protein: 23 };
const REF_PROTEIN = Number(chicken.protein) || 23;

/** Orientacyjny dzienny cel białka używany w faktach. */
const DAILY_PROTEIN = 120;

const Q = (name) => '\u201e' + name + '\u201d';

function median(values) {
    if (!values.length) return 0;
    const s = values.slice().sort((a, b) => a - b);
    const m = Math.floor(s.length / 2);
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function pctOf(list, p) {
    if (!list.length) return 0;
    const s = list.slice().sort((a, b) => a - b);
    return s[Math.min(s.length - 1, Math.floor((s.length - 1) * p))];
}

const density = (p) => (p.kcal > 0 && p.protein > 0 ? (p.protein / p.kcal) * 100 : 0);
const perGramPrice = (p) => (p.pricePer100gProtein > 0 ? p.pricePer100gProtein / 100 : 0);

/**
 * Produkt „sensowny” do przeliczeń: bez tego kawa (0,1 g białka/100 g) wychodziła
 * jako „10 g białka na 100 kcal”, a bułka tarta jako „1184 kcal za 30 g białka”.
 */
const MIN_PROTEIN = 5;
const MIN_KCAL = 20;
const solid = (p) => Number(p.protein) >= MIN_PROTEIN && Number(p.kcal) >= MIN_KCAL;

const pricePerGramList = products.map(perGramPrice).filter((x) => x > 0);
const CHEAP_Q1 = pctOf(pricePerGramList, 0.1);
const PRICE_Q3 = pctOf(pricePerGramList, 0.75);

function densityVerdict(d) {
    if (d >= 20) return 'to absolutna czołówka pod tym względem';
    if (d >= 15) return 'bardzo dobry wynik, gdy liczymy kalorie';
    if (d >= 10) return 'solidny wynik na redukcji';
    if (d >= 5) return 'przeciętny wynik';
    return 'słaby wynik — kalorie przeważają nad białkiem';
}

function priceVerdict(per) {
    if (per <= CHEAP_Q1) return 'jedno z najtańszych źródeł białka w bazie';
    if (per >= PRICE_Q3) return 'drogi sposób na białko';
    return 'cena zbliżona do przeciętnej w bazie';
}

/** F1 — białko na 100 g (tag: Białko). */
function familyProteinPer100(p, i) {
    const pr = Number(p.protein);
    if (!(pr > 0)) return;
    const diff = pr - REF_PROTEIN;
    const cmp = Math.abs(diff) < 0.5
        ? 'mniej więcej tyle, ile ma pierś z kurczaka'
        : diff > 0
            ? 'o ' + pl(diff, 1) + ' g więcej niż w piersi z kurczaka'
            : 'o ' + pl(Math.abs(diff), 1) + ' g mniej niż w piersi z kurczaka';
    const phrase = i % 3;
    if (phrase === 0) push('Białko', p.emoji, 'W 100 g produktu ' + Q(p.name) + ' jest ' + pl(pr, 1) + ' g białka — ' + cmp + '.');
    else if (phrase === 1) push('Białko', p.emoji, 'W 100 g produktu ' + Q(p.name) + ' znajdziesz ' + pl(pr, 1) + ' g białka.');
    else push('Białko', p.emoji, 'Produkt ' + Q(p.name) + ' ma ' + pl(pr, 1) + ' g białka na 100 g — ' + cmp + '.');
}

/** F2 — gęstość białka, czyli gramy na 100 kcal (tag: Odchudzanie). */
function familyDensity(p, i) {
    if (!solid(p)) return;
    const d = density(p);
    if (!(d > 0)) return;
    const phrase = i % 3;
    if (phrase === 0) push('Odchudzanie', p.emoji, 'Produkt ' + Q(p.name) + ' daje ' + pl(d, 1) + ' g białka na każde 100 kcal — ' + densityVerdict(d) + '.');
    else if (phrase === 1) push('Odchudzanie', p.emoji, 'Za 100 kcal z produktu ' + Q(p.name) + ' dostajesz ' + pl(d, 1) + ' g białka — ' + densityVerdict(d) + '.');
    else push('Odchudzanie', p.emoji, 'Stosunek białka do kalorii w produkcie ' + Q(p.name) + ' to ' + pl(d, 1) + ' g na 100 kcal.');
}

/** F3 — ile kalorii kosztuje 30 g białka (tag: Odchudzanie). */
function familyKcalFor30g(p, i) {
    if (!solid(p)) return;
    const pr = Number(p.protein);
    const kcal = Number(p.kcal);
    const grams = (30 / pr) * 100;
    const cost = (grams / 100) * kcal;
    const phrase = i % 3;
    if (phrase === 0) push('Odchudzanie', p.emoji, 'Żeby zjeść 30 g białka z produktu ' + Q(p.name) + ', trzeba przyjąć ' + pl(cost) + ' kcal (' + pl(grams) + ' g produktu).');
    else if (phrase === 1) push('Odchudzanie', p.emoji, '30 g białka z produktu ' + Q(p.name) + ' to ' + pl(cost) + ' kcal.');
    else push('Odchudzanie', p.emoji, 'Na 30 g białka z produktu ' + Q(p.name) + ' musisz zjeść ' + pl(grams) + ' g, czyli ' + pl(cost) + ' kcal.');
}

/** F4 — ile białka w jednej porcji (tag: Trening). */
function familyServing(p, i) {
    const pis = Number(p.proteinInServing);
    if (!(pis >= 5) || !p.servingText) return;
    const pct = Math.round((pis / DAILY_PROTEIN) * 100);
    // „po treningu” tylko przy sensownej porcji — 1 g białka nie buduje mięśni.
    const phrase = pis >= 10 ? i % 3 : (i % 2) * 2;
    if (phrase === 0) push('Trening', p.emoji, 'Jedna porcja produktu ' + Q(p.name) + ' (' + p.servingText + ') dostarcza ' + pl(pis, 1) + ' g białka — ' + pct + '% dziennego celu ' + DAILY_PROTEIN + ' g.');
    else if (phrase === 1) push('Trening', p.emoji, 'Porcja ' + p.servingText + ' produktu ' + Q(p.name) + ' to ' + pl(pis, 1) + ' g białka po treningu.');
    else push('Trening', p.emoji, 'Cała porcja produktu ' + Q(p.name) + ' (' + p.servingText + ') to ' + pl(pis, 1) + ' g białka.');
}

/** F5 — jaki udział energii daje białko (tag: Odżywianie). */
function familyProteinShare(p, i) {
    if (!solid(p)) return;
    const pr = Number(p.protein);
    const kcal = Number(p.kcal);
    const share = ((pr * 4) / kcal) * 100;
    if (share > 100) return;
    const word = share >= 50 ? 'aż' : 'tylko';
    const phrase = i % 3;
    if (phrase === 0) push('Odżywianie', p.emoji, 'Białko stanowi ' + pl(share) + '% kalorii w produkcie ' + Q(p.name) + '.');
    else if (phrase === 1) push('Odżywianie', p.emoji, 'W produkcie ' + Q(p.name) + ' ' + word + ' ' + pl(share) + '% energii pochodzi z białka.');
    else push('Odżywianie', p.emoji, pl(share) + '% kalorii w produkcie ' + Q(p.name) + ' to białko (' + pl(pr, 1) + ' g białka i ' + pl(kcal) + ' kcal na 100 g).');
}

/** F6 — ile kosztuje białko z danego produktu (tag: Odżywianie). */
function familyPrice(p, i) {
    if (!(Number(p.protein) >= MIN_PROTEIN)) return;
    const per = perGramPrice(p);
    if (!(per > 0)) return;
    const per30 = per * 30;
    const phrase = i % 3;
    if (phrase === 0) push('Odżywianie', p.emoji, 'Białko z produktu ' + Q(p.name) + ' kosztuje ' + pl(per30, 2) + ' zł za 30 g (' + pl(per, 2) + ' zł za gram).');
    else if (phrase === 1) push('Odżywianie', p.emoji, 'Za 30 g białka z produktu ' + Q(p.name) + ' zapłacisz około ' + pl(per30, 2) + ' zł.');
    else push('Odżywianie', p.emoji, 'Produkt ' + Q(p.name) + ' to ' + pl(per, 2) + ' zł za każdy gram białka — ' + priceVerdict(per) + '.');
}

for (let i = 0; i < products.length; i++) {
    const p = products[i];
    if (!p || !p.name) continue;
    familyProteinPer100(p, i);
    familyDensity(p, i);
    familyKcalFor30g(p, i);
    familyServing(p, i);
    familyProteinShare(p, i);
    familyPrice(p, i);
}

/* --------------------------------------------------- rekordy i statystyki bazy */

const CAT_LABEL = {
    'mieso': 'mięso',
    'nabial': 'nabiał',
    'sery': 'sery',
    'warzywa': 'warzywa',
    'owoce': 'owoce',
    'platki-sniadaniowe': 'płatki śniadaniowe',
    'zboza': 'zboża',
    'makarony': 'makarony',
    'slodycze': 'słodycze',
    'orzechy': 'orzechy',
    'sosy': 'sosy',
    'tluszcze': 'tłuszcze',
    'batony': 'batony',
    'batony-proteinowe': 'batony proteinowe',
    'fastfood': 'fast food',
    'zupy': 'zupy',
    'polskie-obiadki': 'polskie obiadki',
    'mrozone-pizze': 'mrożone pizze',
    'napoje': 'napoje',
    'alkohole': 'alkohole',
    'przyprawy': 'przyprawy'
};

const byCategory = new Map();
for (const p of products) {
    if (!p || !p.category) continue;
    if (!byCategory.has(p.category)) byCategory.set(p.category, []);
    byCategory.get(p.category).push(p);
}

const label = (cat) => CAT_LABEL[cat] || cat;

for (const [cat, list] of byCategory) {
    const withProtein = list.filter((p) => Number(p.protein) >= MIN_PROTEIN);
    if (!withProtein.length) continue;
    const catName = '„' + label(cat) + '”';

    const topProtein = withProtein.slice().sort((a, b) => b.protein - a.protein)[0];
    push('Rekordy', topProtein.emoji, 'W kategorii ' + catName + ' najwięcej białka na 100 g ma ' + topProtein.name + ' — ' + pl(topProtein.protein, 1) + ' g.');

    const dense = withProtein.filter(solid).sort((a, b) => density(b) - density(a))[0];
    if (dense) push('Rekordy', dense.emoji, 'Najlepszy stosunek białka do kalorii w kategorii ' + catName + ' ma ' + dense.name + ': ' + pl(density(dense), 1) + ' g białka na 100 kcal.');

    const biggestServing = withProtein.filter((p) => Number(p.proteinInServing) >= 10 && p.servingText).sort((a, b) => b.proteinInServing - a.proteinInServing)[0];
    if (biggestServing) push('Rekordy', biggestServing.emoji, 'Najwięcej białka w jednej porcji w kategorii ' + catName + ' daje ' + biggestServing.name + ' — ' + pl(biggestServing.proteinInServing, 1) + ' g (' + biggestServing.servingText + ').');

    const priced = withProtein.map((p) => ({ p: p, per: perGramPrice(p) })).filter((x) => x.per > 0).sort((a, b) => a.per - b.per);
    if (priced.length) {
        const cheapest = priced[0];
        push('Rekordy', cheapest.p.emoji, 'Najtańsze białko w kategorii ' + catName + ' to ' + cheapest.p.name + ': ' + pl(cheapest.per, 2) + ' zł za gram.');
        const priciest = priced[priced.length - 1];
        if (priced.length > 1) {
            const ratio = priciest.per / cheapest.per;
            push('Rekordy', priciest.p.emoji, 'Najdroższe białko w kategorii ' + catName + ' to ' + priciest.p.name + ': ' + pl(priciest.per, 2) + ' zł za gram — ' + pl(ratio, 1) + '× drożej niż najtańsze w tej kategorii.');
        }
    }

    const avgProtein = withProtein.reduce((s, p) => s + Number(p.protein), 0) / withProtein.length;
    push('Rekordy', '📊', 'Produkty w kategorii ' + catName + ' mają średnio ' + pl(avgProtein, 1) + ' g białka na 100 g (na podstawie ' + pl(withProtein.length) + ' pozycji).');
}

/* ------------------------------------------------------------ statystyki bazy */

const withKcal = products.filter(solid);
const totalProducts = products.length;

const maxProtein = products.slice().sort((a, b) => b.protein - a.protein)[0];
const maxDensity = withKcal.slice().sort((a, b) => density(b) - density(a))[0];
const pricedAll = products.filter((p) => Number(p.protein) >= MIN_PROTEIN).map((p) => ({ p: p, per: perGramPrice(p) })).filter((x) => x.per > 0).sort((a, b) => a.per - b.per);

push('Rekordy', '🥇', 'W całej bazie Proteiner (' + pl(totalProducts) + ' produktów) najwięcej białka na 100 g ma ' + maxProtein.name + ' — ' + pl(maxProtein.protein, 1) + ' g.');
push('Rekordy', '🥇', 'Najlepsza gęstość białka w całej bazie: ' + maxDensity.name + ' — ' + pl(density(maxDensity), 1) + ' g białka na każde 100 kcal.');

if (pricedAll.length) {
    const cheapest = pricedAll[0];
    const priciest = pricedAll[pricedAll.length - 1];
    push('Rekordy', cheapest.p.emoji, 'Najtańsze białko w bazie to ' + cheapest.p.name + ' — ' + pl(cheapest.per, 2) + ' zł za gram (' + pl(cheapest.per * 30, 2) + ' zł za 30 g).');
    push('Rekordy', priciest.p.emoji, 'Najdroższe białko w bazie to ' + priciest.p.name + ' — ' + pl(priciest.per, 2) + ' zł za gram, czyli ' + pl(priciest.per / cheapest.per, 0) + '× więcej niż najtańsze.');
    const medianPer = median(pricedAll.map((x) => x.per));
    push('Metabolizm', '💰', 'Mediana ceny białka w bazie Proteiner to ' + pl(medianPer, 2) + ' zł za gram — najtaniej ' + pl(cheapest.per, 2) + ' zł, najdrożej ' + pl(priciest.per, 2) + ' zł.');
}

const countAtLeast = (v) => products.filter((p) => Number(p.protein) >= v).length;
push('Rekordy', '📈', pl(countAtLeast(25)) + ' produktów w bazie ma co najmniej 25 g białka na 100 g.');
push('Rekordy', '📉', pl(countAtLeast(20)) + ' produktów w bazie ma co najmniej 20 g białka na 100 g.');
push('Rekordy', '🌱', 'Aż ' + pl(products.filter((p) => Number(p.protein) > 0 && Number(p.protein) < 2).length) + ' produktów w bazie ma mniej niż 2 g białka na 100 g.');

const avgProteinAll = products.reduce((s, p) => s + (Number(p.protein) || 0), 0) / totalProducts;
push('Odżywianie', '📊', 'Średnio produkt w bazie Proteiner ma ' + pl(avgProteinAll, 1) + ' g białka na 100 g.');

const highDensity = withKcal.filter((p) => density(p) >= 20).length;
push('Rekordy', '⚡', 'Tylko ' + pl(highDensity) + ' produktów w bazie daje co najmniej 20 g białka na każde 100 kcal — to absolutna czołówka gęstości białka.');

const halfFromProtein = withKcal.filter((p) => (Number(p.protein) * 4) / Number(p.kcal) > 0.5).length;
push('Odżywianie', '🥩', 'W ' + pl(halfFromProtein) + ' produktach z bazy więcej niż połowa kalorii pochodzi z białka.');

const fatBeatsProtein = withKcal.filter((p) => Number(p.fat) * 9 > Number(p.protein) * 4).length;
push('Odżywianie', '🧈', 'W ' + pl(fatBeatsProtein) + ' produktach z bazy więcej energii dostarcza tłuszcz niż białko — warto o tym pamiętać na redukcji.');

const carbsBeatProtein = withKcal.filter((p) => Number(p.carbs) * 4 > Number(p.protein) * 4).length;
push('Odżywianie', '🍞', 'W ' + pl(carbsBeatProtein) + ' produktach z bazy węglowodany dają więcej kalorii niż białko.');

const bigServing = products.filter((p) => Number(p.proteinInServing) >= 30).length;
push('Trening', '🏋️', pl(bigServing) + ' produktów w bazie dostarcza co najmniej 30 g białka w jednej porcji.');

/* ------------------------------------------------------- scalanie i selekcja */

const generatedCount = FACTS.length;

const curated = readCurated();
let curatedKept = 0;
for (const f of curated) {
    if (!f || !f.text || !f.tag) continue;
    const before = FACTS.length;
    push(f.tag, f.emoji, f.text);
    if (FACTS.length > before) curatedKept++;
}

const builtin = readBuiltinFacts();
let builtinKept = 0;
for (const f of builtin) {
    const before = FACTS.length;
    push(f.tag, f.emoji, f.text);
    if (FACTS.length > before) builtinKept++;
}

const generated = FACTS.slice(0, generatedCount);
const handWritten = FACTS.slice(generatedCount);

const buckets = new Map();
for (const f of generated) {
    if (!buckets.has(f.tag)) buckets.set(f.tag, []);
    buckets.get(f.tag).push(f);
}

/** Dobieramy fakty z bazy po równo między kategorie, aż dobijemy TARGET_TOTAL. */
const need = Math.max(0, TARGET_TOTAL - handWritten.length);
const chosen = [];
const keys = Array.from(buckets.keys());
while (chosen.length < need) {
    let progressed = false;
    for (const k of keys) {
        const bucket = buckets.get(k);
        if (!bucket.length) continue;
        progressed = true;
        chosen.push(bucket.shift());
        if (chosen.length >= need) break;
    }
    if (!progressed) break;
}

const pool = handWritten.concat(chosen);

/* ------------------------------------------------- deterministyczne losowanie */

function mulberry32(seed) {
    return function () {
        seed |= 0;
        seed = (seed + 0x6D2B79F5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const rand = mulberry32(20260920);
for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = pool[i];
    pool[i] = pool[j];
    pool[j] = tmp;
}
pool.forEach((f, i) => { f.no = i + 1; });

/* --------------------------------------------------------------- zapis paczek */

const byTag = new Map();
for (const f of pool) {
    if (!byTag.has(f.tag)) byTag.set(f.tag, []);
    byTag.get(f.tag).push(f);
}

fs.mkdirSync(OUT_DIR, { recursive: true });
for (const name of fs.readdirSync(OUT_DIR)) {
    if (name.endsWith('.json')) fs.rmSync(path.join(OUT_DIR, name));
}

const index = {
    v: FACTS_V,
    total: pool.length,
    built: new Date().toISOString().slice(0, 10),
    source: 'products-lite.js + fun-facts-new.json',
    categories: []
};

const orderedTags = CAT_ORDER.filter((t) => byTag.has(t))
    .concat(Array.from(byTag.keys()).filter((t) => CAT_ORDER.indexOf(t) === -1));

for (const tag of orderedTags) {
    const list = byTag.get(tag);
    const slug = CAT_SLUG[tag] || norm(tag);
    const files = [];
    for (let i = 0; i < list.length; i += CHUNK_SIZE) {
        const part = list.slice(i, i + CHUNK_SIZE);
        const name = slug + '-' + (Math.floor(i / CHUNK_SIZE) + 1) + '.json';
        fs.writeFileSync(path.join(OUT_DIR, name), JSON.stringify(part), 'utf8');
        files.push(name);
    }
    index.categories.push({ tag: tag, slug: slug, count: list.length, files: files });
}

fs.writeFileSync(path.join(OUT_DIR, 'index.json'), JSON.stringify(index), 'utf8');

/* ----------------------------------------------------------------- podsumowanie */

let bytes = 0;
let chunkFiles = 0;
for (const c of index.categories) chunkFiles += c.files.length;
for (const name of fs.readdirSync(OUT_DIR)) bytes += fs.statSync(path.join(OUT_DIR, name)).size;

console.log('Fun fakty zbudowane');
console.log('  faktow w puli:       ' + pool.length + '  (cel: ' + TARGET_TOTAL + ')');
console.log('  z bazy produktow:    ' + chosen.length);
console.log('  ciekawostki (json):  ' + curatedKept);
console.log('  ciekawostki (js):    ' + builtinKept);
console.log('  pominiete duplikaty: ' + skipped);
console.log('  paczki:              ' + chunkFiles + ' plikow, ' + Math.round(bytes / 1024) + ' KB lacznie');
for (const c of index.categories) {
    console.log('    - ' + c.tag + ' — ' + c.count + ' faktow  ->  ' + c.files.join(', '));
}
