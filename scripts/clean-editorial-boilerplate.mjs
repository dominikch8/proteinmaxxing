/**
 * Usuwa szablonowe akapity z product-editorial.json i zastępuje je kontekstowymi.
 * node scripts/clean-editorial-boilerplate.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
    contextualMealTip,
    isBoilerplateParagraph,
} from './editorial-context.mjs';
import { polishEditorial } from './polish-gender.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

function slugify(name) {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/ą/g, 'a')
        .replace(/ć/g, 'c')
        .replace(/ę/g, 'e')
        .replace(/ł/g, 'l')
        .replace(/ń/g, 'n')
        .replace(/ó/g, 'o')
        .replace(/ś/g, 's')
        .replace(/ź/g, 'z')
        .replace(/ż/g, 'z')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

const raw = fs.readFileSync(path.join(root, 'js/products-data-raw.js'), 'utf8');
const products = JSON.parse(raw.match(/\[.*\]/s)[0]);
const bySlug = new Map(products.map((p) => [slugify(p.name), { ...p, slug: slugify(p.name) }]));

const editorialPath = path.join(__dirname, 'product-editorial.json');
const editorial = JSON.parse(fs.readFileSync(editorialPath, 'utf8'));

const BAD_FRAGMENT_RE =
    /Sos, olej do smażenia czy bułka obok|Warzywa gotuj na parze lub krótko na patelni|Makaron al dente ma nieco mniejszy|Mięso i ryby piecz lub grilluj bez panierki|W nabiale smak często idzie w parze|Zupy kremowe ze śmietaną mają więcej kcal|Zboża i kasze zyskują wodę podczas gotowania|Sosy i dressings to najczęstszy|Owoce dojrzałe są słodsze i mają więcej cukrów prostych niż mniej dojrzałe\. Do jogurtu/i;

function cleanParagraph(text, product) {
    let p = text;
    if (isBoilerplateParagraph(p)) return null;
    if (BAD_FRAGMENT_RE.test(p)) {
        p = p
            .replace(/\s*Sos, olej do smażenia czy bułka obok potrafią zmienić kcal bardziej niż sam produkt\./g, '')
            .replace(/\s*Warzywa gotuj na parze lub krótko na patelni — mniej witamin traci się niż przy długim gotowaniu w dużej ilości wody\. Do sałatek olej licz osobno\./g, '')
            .replace(/\s*Makaron al dente ma nieco mniejszy indeks glikemiczny niż rozgotowany\. Sosy serowe i śmietanowe potrafią podwoić kcal porcji względem samego makaronu\./g, '')
            .replace(/\s*Mięso i ryby piecz lub grilluj bez panierki — wtedy profil zbliża się do tabeli na 100 g\. Smażenie w głębokim tłuszczu podbija kalorie niezależnie od gatunku\./g, '')
            .replace(/\s*W nabiale smak często idzie w parze z tłuszczem — wersje „light” mają mniej kcal, ale sprawdź, czy nie dokładano cukru\. Naturalny skład zwykle ułatwia liczenie makro\./g, '')
            .replace(/\s*Zupy kremowe ze śmietaną mają więcej kcal niż rosół czy jarzynowa\. Bulion domowy z mięsem podbija białko w porcji — instant zwykle go nie ma\./g, '')
            .replace(/\s*Zboża i kasze zyskują wodę podczas gotowania — wartości na 100 g w bazie odnoszą się do formy podanej w opisie porcji; suchy produkt ≠ ugotowany\./g, '')
            .replace(/\s*Sosy i dressings to najczęstszy „cichy” dodatek kalorii\. Odmierz łyżkę stołową zamiast polać „do smaku”\./g, '')
            .replace(/\s*Owoce dojrzałe są słodsze i mają więcej cukrów prostych niż mniej dojrzałe\. Do jogurtu lub owsianki dodawaj owoce na wadze, nie „na oko”\./g, '')
            .replace(/\s*Słodycze najlepiej planować z góry — jeśli wiesz, że zjesz [^.]+\., od rana zostaw miejsce w węglowodanach i tłuszczach\./g, '')
            .trim();
    }
    if (!p || p.length < 40) return null;
    return p;
}

let removed = 0;
let replaced = 0;

for (const [slug, entry] of Object.entries(editorial)) {
    const product = bySlug.get(slug);
    const name = product?.name || slug.replace(/-/g, ' ');

    const cleaned = entry.paragraphs
        .map((p) => cleanParagraph(p, product))
        .filter(Boolean);

    while (cleaned.length < 3 && product) {
        const tip = contextualMealTip(product);
        if (!cleaned.some((p) => p.slice(0, 50) === tip.slice(0, 50))) {
            cleaned.splice(Math.max(0, cleaned.length - 1), 0, tip);
            replaced++;
        } else {
            break;
        }
    }

    if (cleaned.length !== entry.paragraphs.length || cleaned.some((p, i) => p !== entry.paragraphs[i])) {
        removed += entry.paragraphs.length - cleaned.length;
        editorial[slug] = polishEditorial({ ...entry, paragraphs: cleaned }, name);
    }
}

fs.writeFileSync(editorialPath, JSON.stringify(editorial, null, 2) + '\n', 'utf8');
console.log(`Wyczyszczono wpisy: usunięto ${removed} akapitów, dodano ${replaced} kontekstowych.`);
