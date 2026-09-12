/**
 * Generuje brakujące zdjęcia produktów w stylu reszty bazy:
 * minimalistyczne, fotorealistyczne, z WYCIĘTYM tłem
 * (przezroczysty PNG → WebP z alfą + JPG na białym tle).
 *
 * node scripts/generate-missing-product-photos.mjs --limit=5
 * node scripts/generate-missing-product-photos.mjs --slug=bulgur-suchy
 * node scripts/generate-missing-product-photos.mjs --all --delay=400
 * node scripts/generate-missing-product-photos.mjs --formats=jpg,webp,png
 * node scripts/generate-missing-product-photos.mjs --force --slug=ryz
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath, pathToFileURL } from 'url';
import { removeEdgeBackground, defringeLightHalos } from './remove-edge-background.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'images', 'products');
const bundleDir = path.join(root, 'deploy-bundle', 'images', 'products');
const queriesPath = path.join(root, 'js', 'product-search-queries.js');
const UA = 'Proteiner/1.0 (nutrition education; contact: developeranios@gmail.com)';

/** Angielskie nazwy kategorii (lepsze prompty). */
const CATEGORY_EN = {
    warzywa: 'fresh vegetable',
    owoce: 'fresh fruit',
    nabial: 'dairy food product',
    sery: 'cheese',
    mieso: 'meat, fish or poultry',
    zboza: 'grain, bread or bakery product',
    napoje: 'beverage in a clear glass',
    alkohole: 'alcoholic drink in a glass',
    przyprawy: 'dry spice or herb',
    tluszcze: 'butter or cooking oil',
    sosy: 'sauce or condiment',
    zupy: 'soup in a white ceramic bowl',
    makarony: 'pasta dish',
    orzechy: 'nuts or seeds pile',
    slodycze: 'candy, chocolate or dessert',
    'platki-sniadaniowe': 'breakfast cereal',
    'polskie-obiadki': 'Polish home-style cooked dish on a plate or in a bowl',
    'mrozone-pizze': 'whole round pizza',
    fastfood: 'fast food item',
    batony: 'candy bar'
};
