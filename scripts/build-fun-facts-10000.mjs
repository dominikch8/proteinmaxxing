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
 *   data/fun-facts/index.json      — spis: total + kategorie + pliki + token wersji.
 *   data/fun-facts/<slug>-N.json   — paczki po CHUNK_SIZE faktów (bez gzipa na serwerze,
 *                                    dlatego dzielimy je na małe pliki i ładujemy leniwie).
 *
 * Uruchom: node scripts/build-fun-facts-10000.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'data', 'fun-facts');

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

/** BUILTIN_FACTS z js/fun-fakty.js — tylko po to, by ich nie duplikować. */
function readBuiltinTexts() {
    const src = fs.readFileSync(path.join(ROOT, 'js', 'fun-fakty.js'), 'utf8');
    const m = src.match(/BUILTIN_FACTS\s*=\s*(\[[\s\S]*?\n\s*\]);/);
    if (!m) return [];
    const arr = vm.runInNewContext('(' + m[1] + ')');
    return Array.isArray(arr) ? arr.map((f) => f.text).filter(Boolean) : [];
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
            ? 'o ' + pl(diff, 1) + ' g więcej niż pierś z kurczaka'
            : 'o ' + pl(Math.abs(diff), 1) + ' g mniej niż pierś z kurczaka';
    const phrase = i % 3;
    if (phrase === 0) push('Białko', p.emoji, p.name + ' ma ' + pl(pr, 1) + ' g białka na 100 g — ' + cmp + '.');
    else if (phrase === 1) push('Białko', p.emoji, 'W 100 g produktu ' + Q(p.name) + ' znajdziesz ' + pl(pr, 1) + ' g białka.');
    else push('Białko', p.emoji, p.name + ': ' + pl(pr, 1) + ' g białka w 100 g produktu — ' + cmp + '.');
}

/** F2 — gęstość białka, czyli gramy na 100 kcal (tag: Odchudzanie). */
function familyDensity(p, i) {
    const d = density(p);
    if (!(d > 0)) return;
    const phrase = i % 3;
    if (phrase === 0) push('Odchudzanie', p.emoji, p.name + ' daje ' + pl(d, 1) + ' g białka na każde 100 kcal — ' + densityVerdict(d) + '.');
    else if (phrase === 1) push('Odchudzanie', p.emoji, 'Za 100 kcal z produktu ' + Q(p.name) + ' dostajesz ' + pl(d, 1) + ' g białka — ' + densityVerdict(d) + '.');
    else push('Odchudzanie', p.emoji, 'Stosunek białka do kalorii w produkcie ' + Q(p.name) + ' to ' + pl(d, 1) + ' g na 100 kcal.');
}

/** F3 — ile kalorii kosztuje 30 g białka (tag: Odchudzanie). */
function familyKcalFor30g(p, i) {
    const pr = Number(p.protein);
    const kcal = Number(p.kcal);
    if (!(pr > 0) || !(kcal > 0)) return;
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
    if (!(pis > 0) || !p.servingText) return;
    const pct = Math.round((pis / DAILY_PROTEIN) * 100);
    const phrase = i % 3;
    if (phrase === 0) push('Trening', p.emoji, 'Jedna porcja produktu ' + Q(p.name) + ' (' + p.servingText + ') dostarcza ' + pl(pis, 1) + ' g białka — ' + pct + '% dziennego celu ' + DAILY_PROTEIN + ' g.');
    else if (phrase === 1) push('Trening', p.emoji, 'Porcja ' + p.servingText + ' produktu ' + Q(p.name) + ' to ' + pl(pis, 1) + ' g białka po treningu.');
    else push('Trening', p.emoji, 'Cała porcja produktu ' + Q(p.name) + ' (' + p.servingText + ') to ' + pl(pis, 1) + ' g białka.');
}

/** F5 — jaki udział energii daje białko (tag: Odżywianie). */
function familyProteinShare(p, i) {
    const pr = Number(p.protein);
    const kcal = Number(p.kcal);
    if (!(pr > 0) || !(kcal > 0)) return;
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
    const per = perGramPrice(p);
    if (!(per > 0)) return;
    const per30 = per * 30;
    const phrase = i % 3;
    if (phrase === 0) push('Odżywianie', p.emoji, 'Białko z produktu ' + Q(p.name) + ' kosztuje ' + pl(per30, 2) + ' zł za 30 g (' + pl(per, 2) + ' zł za gram).');
    else if (phrase === 1) push('Odżywianie', p.emoji, 'Za 30 g białka z produktu ' + Q(p.name) + ' zapłacisz około ' + pl(per30, 2) + ' zł.');
    else push('Odżywianie', p.emoji, p.name + ' to ' + pl(per, 2) + ' zł za każdy gram białka — ' + priceVerdict(per) + '.');
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
