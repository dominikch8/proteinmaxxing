/**
 * Generuje zdjęcia dla produktów, które nie mają jeszcze grafiki.
 * Styl: minimalistyczne, fotorealistyczne, czyste białe tło #FFFFFF + wycięte tło
 *       (przezroczysty PNG + biały JPG + WebP), spójne z resztą bazy.
 *
 * Model: Pollinations (Flux domyślnie) — anonimowo, z odpytywaniem po Referer.
 * Wznawialny: pomija produkty, które już mają {slug}.jpg.
 *
 * Użycie:
 *   node scripts/generate-missing-product-images.mjs --pilot --limit=3
 *   node scripts/generate-missing-product-images.mjs --missing --limit=50
 *   node scripts/generate-missing-product-images.mjs --missing           # wszyscy bez grafiki
 *   node scripts/generate-missing-product-images.mjs --slug=kaczka-udo
 *   node scripts/generate-missing-product-images.mjs --category=mieso,sery --missing
 *   node scripts/generate-missing-product-images.mjs --force --model=flux --delay=5500
 *
 * Flagi:
 *   --missing            tylko produkty bez {slug}.jpg (domyślnie, gdy brak --slug/--category)
 *   --all                wszystkie produkty (z --force nadpisze istniejące)
 *   --slug=a --slug=b    wybrane slugi
 *   --category=mieso,sery
 *   --limit=N            maksymalna liczba w tej sesji
 *   --model=flux|turbo   model Pollinations (domyślnie flux)
 *   --delay=ms           przerwa między żądaniami (domyślnie 5500 ms)
 *   --force              nadpisz istniejące pliki
 *   --pilot              zapis do scripts/_imgpreview (nie rusza właściwych katalogów)
 *   --no-webp            pomiń generowanie WebP
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { removeEdgeBackground, defringeLightHalos } from './remove-edge-background.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const productsDir = path.join(root, 'images', 'products');
const bundleDir = path.join(root, 'deploy-bundle', 'images', 'products');
const previewDir = path.join(__dirname, '_imgpreview');
const logPath = path.join(__dirname, '_img-gen-log.txt');

const UA = 'Proteiner/1.0 (nutrition education; contact: developeranios@gmail.com)';
const REFERER = 'https://proteiner.pl/';

/* ── Argumenty ─────────────────────────────────────────────────────────── */
const args = process.argv.slice(2);
const hasFlag = (f) => args.includes(f);
const argVal = (name) => {
    const a = args.find((x) => x.startsWith(`--${name}=`));
    return a ? a.slice(name.length + 3) : null;
};
const slugArgs = args.filter((a) => a.startsWith('--slug=')).map((a) => a.slice(7));
const catArgs = (argVal('category') || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
const limit = argVal('limit') ? Number(argVal('limit')) : Infinity;
const model = argVal('model') || 'flux';
/* ── FOOD_SUBJECT (nadpisania promptów) z rebuild-all-product-photos.mjs ─ */
let FOOD_SUBJECT = {};
try {
    const src = fs.readFileSync(path.join(__dirname, 'rebuild-all-product-photos.mjs'), 'utf8');
    const m = src.match(/const FOOD_SUBJECT = \{([\s\S]*?)\n\};/);
    if (m) FOOD_SUBJECT = Function(`"use strict";return {${m[1]}}`)();
} catch {
    /* opcjonalne */
}

/* ── Słownik PL → EN (subject promptu) ─────────────────────────────────── */
const DICT = {
    'szynka wieprzowa': 'cooked pork ham',
    'szynka z kurczaka': 'sliced chicken ham',
    'szynka konserwowa': 'canned pork ham',
    poledwica: 'pork loin cold cut',
    kielbasa: 'Polish sausage',
    parowki: 'Polish frankfurter sausages',
    pasztet: 'meat pate',
    boczek: 'pork bacon belly',
    kaszanka: 'Polish blood sausage kashanka',
    skrzydelka: 'chicken wings',
    serce: 'poultry heart',
    zoladek: 'pork stomach',
    flaki: 'Polish beef tripe stew',
    serca: 'pork hearts',
    nerki: 'pork kidneys',
    'mieso mielone': 'ground minced meat',
    schabowe: 'pork loin cutlet',
    lopatka: 'pork shoulder',
    kotlet: 'pork cutlet schnitzel',
    klopsiki: 'meatballs',
    morszczuk: 'hake fish fillet',
    pstrag: 'trout fish',
    karp: 'carp fish',
    okon: 'perch fish fillet',
    pangasius: 'pangasius catfish fillet',
    miruna: 'blue whiting fish fillet',
    sardynki: 'sardines in tomato sauce',
    szprotki: 'smoked sprats',
    losos: 'salmon',
    tunczyk: 'tuna steak',
    krewetki: 'shrimp prawns',
    osmiornica: 'octopus',
    malze: 'mussels',
    ostrygi: 'oysters',
    kawior: 'black caviar',
    sledz: 'herring fish',
    'ryba po grecku': 'Polish fish in tomato vegetable sauce',
    mleko: 'milk',
    maslanka: 'buttermilk',
    kefir: 'kefir',
    jogurt: 'yogurt',
    skyr: 'skyr yogurt',
    serek: 'cream cheese spread',
    twarog: 'cottage cheese',
    smietana: 'sour cream',
    kakao: 'cocoa drink',
    'napoj proteinowy': 'protein shake drink',
    'bialko serwatkowe': 'whey protein shake',
    jajko: 'egg',
    jajecznica: 'scrambled eggs',
    omlet: 'omelette',
    'jaja sadzone': 'fried eggs',
    majonez: 'mayonnaise',
    ser: 'cheese',
    gouda: 'gouda cheese',
    mazdamer: 'maasdam cheese',
    tylzycki: 'tylzycki cheese',
    szwajcarski: 'swiss cheese',
    mozzarella: 'mozzarella cheese',
    feta: 'feta cheese',
    balkanski: 'balkan white cheese',
    kozi: 'goat cheese',
    owczy: 'sheep cheese',
    oscypek: 'Polish oscypek smoked cheese',
    topiony: 'processed cheese',
    smazony: 'fried cheese',
    golka: 'cooked ham hock',
    gorgonzola: 'gorgonzola blue cheese',
};

const delayMs = argVal('delay') !== null ? Number(argVal('delay')) : 5500;
const force = hasFlag('--force');
const pilot = hasFlag('--pilot');
const wantWebp = !hasFlag('--no-webp');
const OUT_DIR = pilot ? previewDir : productsDir;
