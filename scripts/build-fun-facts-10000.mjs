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
