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
const delayMs = argVal('delay') !== null ? Number(argVal('delay')) : 5500;
const force = hasFlag('--force');
const pilot = hasFlag('--pilot');
const wantWebp = !hasFlag('--no-webp');
const OUT_DIR = pilot ? previewDir : productsDir;
