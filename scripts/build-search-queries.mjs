/** Generuje js/product-search-queries.js – angielskie zapytania pod zdjęcia */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Ręczne zapytania dla trudnych produktów */
const SLUG_QUERIES = {
    'fasolka-szparagowa': ['green beans fresh', 'French beans vegetable', 'haricots verts'],
    migdaly: ['raw almonds nuts', 'almonds whole', 'almond nuts food'],
    'zapiekanka-studentska': ['zapiekanka polish open sandwich', 'zapiekanka food'],
    'bialka-jaj': ['egg white', 'egg whites food'],
    'izolat-bialka-wpi': ['whey protein isolate powder', 'whey protein supplement'],
    'koncentrat-bialka-serwatkowego-wpc': ['whey protein concentrate powder'],
    'kebab-w-ciescie': ['doner kebab wrap', 'kebab sandwich'],
    'big-mac-styl': ['big mac burger', 'hamburger'],
    'mcchicken-kurczak-w-panierce': ['mcchicken sandwich', 'fried chicken burger']
};

const SKIP = new Set([
    'z', 'w', 'na', 'i', 'ze', 'po', 'bez', 'styl', 'np', 'szt', 'box', 'miska', 'style',
    'gotowana', 'gotowany', 'gotowane', 'gotowiec', 'gotowa', 'suchy', 'sucha', 'swiezy', 'swieza',
    'konserwowa', 'wedlina', 'plastry', 'kawalek', 'szt', '8', '1000', 'danio', 'kraft'
]);

const TOKEN_EN = {
    piers: 'breast', kurczaka: 'chicken', kurczak: 'chicken', kurczakiem: 'chicken', indyka: 'turkey', indyk: 'turkey',
    wolowina: 'beef', wolowa: 'beef', wolowy: 'beef', wieprzowina: 'pork', wieprzowa: 'pork', wieprzowe: 'pork',
    schab: 'pork loin', karkowka: 'pork neck', poledwica: 'tenderloin', losie: 'venison', szynka: 'ham',
    salami: 'salami', parowki: 'sausages', parowkowa: 'sausage', kielbasa: 'sausage', slaska: 'sausage',
    kabanosy: 'sausage', boczek: 'bacon', mortadela: 'mortadella', pasztet: 'pate', nuggetsy: 'chicken nuggets',
    stripsy: 'chicken strips', dorsz: 'cod', losos: 'salmon', atlantycki: '', tunczyk: 'tuna', wodzie: 'canned',
    oleju: 'oil', pstrag: 'trout', karp: 'carp', smazony: 'fried', sledz: 'herring', marynowany: 'pickled',
    makrela: 'mackerel', wedzona: 'smoked', sandacz: 'perch', mintaj: 'pollock', krewetki: 'shrimp',
    kalmary: 'squid', udko: 'chicken leg', skora: 'skin', skrzydelka: 'chicken wings', kurze: 'chicken',
    cielecina: 'veal', jagniecina: 'lamb', kaczka: 'duck', filet: 'fillet', mielony: 'ground', drobiowa: 'poultry',
    krucha: 'ham', baleron: 'ham', parmenska: 'parma ham', watrobka: 'liver', ozor: 'tongue', sopocka: 'ham',
    sardynki: 'sardines', fladra: 'flounder', halibut: 'halibut', sosie: 'sauce', wlasnym: 'canned', krolik: 'rabbit',
    golonka: 'pork knuckle', zeberka: 'pork ribs', grecku: 'greek style', ryba: 'fish', kotlet: 'cutlet',
    panierowany: 'breaded', schabowy: 'pork cutlet', mcchicken: 'chicken sandwich', panierce: 'breaded',
    twarog: 'cottage cheese', chudy: 'low fat', serek: 'cottage cheese', wiejski: 'cottage cheese',
    skyr: 'skyr', jogurt: 'yogurt', naturalny: 'plain', grecki: 'greek', pitny: 'drinkable', kefir: 'kefir',
    smietana: 'cream', smietanka: 'whipping cream', jajko: 'egg', jaj: 'egg', cale: 'whole', bialka: 'egg white',
    izolat: 'whey protein', bialka: 'protein', serwatkowego: 'whey', wpc: 'whey protein', wpi: 'whey isolate',
    ser: 'cheese', gouda: 'gouda', camembert: 'camembert', mozzarella: 'mozzarella', parmezan: 'parmesan',
    mleko: 'milk', ricotta: 'ricotta', feta: 'feta', brie: 'brie', edamski: 'edam', zolty: 'yellow',
    homogenizowany: 'cream cheese', budyn: 'pudding', mascarpone: 'mascarpone', plesniowy: 'blue cheese',
    halloumi: 'halloumi', owocowy: 'fruit', protein: 'protein', pudding: 'pudding', skondensowane: 'condensed',
    slodzone: 'sweetened', poltlusty: 'semi-fat', tlusty: 'full fat', topiony: 'processed', twarogowy: 'curd',
    ziemniaki: 'potato', pomidor: 'tomato', ogorek: 'cucumber', cebula: 'onion', marchew: 'carrot',
    kapusta: 'cabbage', biala: 'white', czerwona: 'red', kiszona: 'sauerkraut', pekinska: 'napa',
    papryka: 'bell pepper', czerwona: 'red', burak: 'beet', czosnek: 'garlic', salata: 'lettuce', maslowa: 'butter',
    szpinak: 'spinach', brokuly: 'broccoli', kalafior: 'cauliflower', baklazan: 'eggplant', cukinia: 'zucchini',
    dynia: 'pumpkin', miazsz: 'pumpkin', fasolka: 'green beans', szparagowa: 'green beans', groszek: 'peas',
    zielony: 'green', kukurydza: 'corn', rzodkiewka: 'radish', rukola: 'arugula', jarmuz: 'kale',
    pieczarka: 'mushroom', ciecierzyca: 'chickpeas', soczewica: 'lentils', czerwona: 'red', fasola: 'beans',
    biala: 'white', por: 'leek', seler: 'celery', naciowy: 'celery', korzeniowy: 'celeriac', pietruszka: 'parsnip',
    korzen: 'root', brukselka: 'brussels sprouts', szparagi: 'asparagus', zielone: 'green', karczoch: 'artichoke',
    salatka: 'salad', kiszony: 'pickled', pomidory: 'tomato', suszone: 'sun dried', bob: 'fava beans', mlody: 'young',
    mrozona: 'frozen', mix: 'mixed', salat: 'salad', torebka: 'bag', chrzan: 'horseradish', imbir: 'ginger',
    jablko: 'apple', banan: 'banana', truskawki: 'strawberry', maliny: 'raspberry', sliwki: 'plum', wisnie: 'cherry',
    gruszka: 'pear', czeresnie: 'cherry', borowki: 'blueberry', winogrona: 'grape', awokado: 'avocado', kiwi: 'kiwi',
    pomarancza: 'orange', mandarynki: 'mandarin', arbuz: 'watermelon', melon: 'melon', granat: 'pomegranate',
    ananas: 'pineapple', swiezy: 'fresh', mango: 'mango', zurawina: 'cranberry', suszona: 'dried', rodzynki: 'raisin',
    brzoskwinia: 'peach', nektarynka: 'nectarine', morela: 'apricot', pomelo: 'pomelo', grejpfrut: 'grapefruit',
    porzeczki: 'currant', czarne: 'black', czerwone: 'red', jagody: 'berry', lesne: 'wild', pigwa: 'quince',
    figi: 'fig', daktyle: 'date', kokos: 'coconut', marakuja: 'passion fruit', papaja: 'papaya',
    owsiane: 'oats', ryz: 'rice', bialy: 'white', brazowy: 'brown', jalowcowy: 'juniper', dziki: 'wild',
    basmati: 'basmati', arborio: 'arborio', gryczana: 'buckwheat', jaglana: 'millet', jeczmienna: 'barley',
    peczak: 'barley', jeczmienny: 'barley', kuskus: 'couscous', komosa: 'quinoa', ryżowa: 'quinoa', amarantus: 'amaranth',
    makaron: 'pasta', pszenny: 'wheat', pelnoziarnisty: 'whole wheat', jajeczny: 'egg', ryżowy: 'rice',
    swiderki: 'pasta', penne: 'penne', spaghetti: 'spaghetti', lazanki: 'lasagna', fusilli: 'fusilli', rigatoni: 'rigatoni',
    bulgur: 'bulgur', chleb: 'bread', zytni: 'rye', tostowy: 'toast', baguette: 'baguette', tortilla: 'tortilla',
    pszenna: 'wheat', platki: 'flakes', sniadaniowe: 'cereal', cukier: 'sugar', granola: 'granola', manna: 'semolina',
    chipsy: 'potato chips', ziemniaczane: 'potato', migdaly: 'almond', orzechy: 'nuts', wloskie: 'walnut',
    laskowe: 'hazelnut', ziemne: 'peanut', nerkowca: 'cashew', pistacjowe: 'pistachio', brazylijskie: 'brazil nut',
    pekan: 'pecan', makadamia: 'macadamia', orzechowe: 'peanut butter', pestki: 'seeds', dyni: 'pumpkin',
    slonecznika: 'sunflower', chia: 'chia', tahini: 'tahini', ketchup: 'ketchup', majonez: 'mayonnaise',
    musztarda: 'mustard', kremowa: 'mustard', czosnkowy: 'garlic sauce', tatarski: 'tartar sauce', sojowy: 'soy sauce',
    barbecue: 'bbq sauce', ostry: 'hot', chilli: 'chili', ranch: 'ranch', slodko: 'sweet', kwasny: 'sour',
    pesto: 'pesto', wysp: 'island', delikatesowa: 'mustard', oliwa: 'olive', oliwek: 'olive', olej: 'oil',
    rzepakowy: 'canola', maslo: 'butter', ekstra: 'butter', smalec: 'lard', slonecznikowy: 'sunflower',
    kokosowy: 'coconut', margaryna: 'margarine', klarowane: 'ghee', lniany: 'flaxseed', sezamowy: 'sesame',
    tluszcz: 'fat', kaczy: 'duck', miod: 'honey', dzem: 'jam', truskawkowy: 'strawberry',
    baton: 'candy bar', snickers: 'snickers', czekolada: 'chocolate', mleczna: 'milk', gorzka: 'dark',
    ptasie: 'marshmallow', mleczko: 'marshmallow', raffaello: 'candy', proteinowy: 'protein bar', lody: 'ice cream',
    waniliowe: 'vanilla', paczek: 'donut', nadzieniem: 'filled', herbatniki: 'cookies', maslane: 'butter',
    wafel: 'wafer', czekoladowy: 'chocolate', zelki: 'gummy', lukrecja: 'licorice', nutella: 'nutella',
    krakersy: 'crackers', popcorn: 'popcorn', solony: 'salted', hot: 'hot', dog: 'dog', pizza: 'pizza',
    margherita: 'margherita', pepperoni: 'pepperoni', hawajska: 'hawaiian', hamburger: 'hamburger', cheeseburger: 'cheeseburger',
    kebab: 'kebab', ciescie: 'wrap', frytki: 'french fries', serem: 'cheese', zapiekanka: 'baguette sandwich',
    pieca: 'oven', big: 'big', mac: 'mac', wrap: 'wrap', talerzu: 'plate', kolba: 'corn', kukurydzy: 'corn',
    smazona: 'fried', chinska: 'chinese', instant: 'instant', zupa: 'soup', farszem: 'filled', kfc: 'fried chicken',
    bolognese: 'bolognese', carbonara: 'carbonara', lasagne: 'lasagne', miesem: 'meat', brokulami: 'broccoli',
    lososiem: 'salmon', bulionem: 'broth', cannelloni: 'cannoni', ricotta: 'ricotta', makaronowa: 'pasta bake',
    krakowska: 'sausage', parowkowa: 'sausage', golonka: 'ham hock', nalesnik: 'crepe', gofry: 'waffles',
    bita: 'whipped', smietana: 'cream', zupka: 'instant noodles', pierogi: 'pierogi', ruskie: 'potato cheese',
    kopytka: 'potato dumplings', slaskie: 'silesian', placki: 'pancakes', gulasz: 'stew', makaronem: 'pasta',
    rosol: 'broth', pomidorowa: 'tomato', ryzem: 'rice', croissant: 'croissant', sernik: 'cheesecake',
    szarlotka: 'apple pie', piernik: 'gingerbread', makowiec: 'poppy cake', chalwa: 'halva', sezamowa: 'sesame',
    babka: 'cake', drozdzowa: 'yeast', krem: 'spread', ciastka: 'cookies', rocky: 'rocky', road: 'road',
    studentska: 'toastie', chrupki: 'crispy', nalesnik: 'pancake', piernik: 'gingerbread',
    worcestershire: 'worcestershire', teriyaki: 'teriyaki', holenderski: 'hollandaise', musztardowo: 'honey mustard',
    miodowy: 'honey', ketchupowy: 'tomato', hummus: 'hummus', tzatziki: 'tzatziki', salatkowy: 'salad', winegret: 'vinaigrette',
    konopi: 'hemp', luskane: 'hulled', prazone: 'roasted', wiorki: 'shredded', suszony: 'dried',
    sojowe: 'soy', owsiane: 'oat', roslinne: 'plant', koncentrat: 'concentrate', budyn: 'custard',
    typ: 'flour', maka: 'flour', precel: 'pretzel', pumpernikiel: 'pumpernickel', grahamka: 'roll', bulka: 'roll',
    razowy: 'wholegrain', musli: 'muesli', cukru: 'sugar', solony: 'salted', gotowy: 'ready'
};

function slugify(name) {
    return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/ą/g, 'a').replace(/ć/g, 'c').replace(/ę/g, 'e').replace(/ł/g, 'l')
        .replace(/ń/g, 'n').replace(/ó/g, 'o').replace(/ś/g, 's').replace(/ź/g, 'z').replace(/ż/g, 'z')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function enrichProducts(raw) {
    const seen = {};
    return raw.map((p) => {
        let base = slugify(p.name);
        let slug = base, n = 2;
        while (seen[slug]) { slug = `${base}-${p.category}`; if (seen[slug]) slug = `${base}-${n++}`; }
        seen[slug] = true;
        return { ...p, slug };
    });
}

function fromSlug(slug, polishName) {
    if (SLUG_QUERIES[slug]) {
        const q = SLUG_QUERIES[slug][0];
        return [...SLUG_QUERIES[slug], `${q} food`, `${q} ingredient photo`].filter((x, i, a) => a.indexOf(x) === i);
    }
    const parts = slug.split('-').filter((t) => t && !SKIP.has(t) && !/^\d+$/.test(t));
    const words = parts.map((t) => TOKEN_EN[t]).filter((w) => w && w.length > 0);
    let q = [...new Set(words)].join(' ').replace(/\s+/g, ' ').trim();

    const fixes = [
        [/breast chicken|chicken breast/gi, 'chicken breast'],
        [/chicken breast chicken/gi, 'chicken breast'],
        [/turkey breast/gi, 'turkey breast'],
        [/canned tuna/gi, 'canned tuna'],
        [/tuna oil/gi, 'tuna in oil'],
        [/tuna water/gi, 'tuna in water'],
        [/cottage cheese low fat/gi, 'low fat cottage cheese'],
        [/egg white/gi, 'egg white'],
        [/fried fish/gi, 'fried fish'],
        [/pickled herring/gi, 'pickled herring']
    ];
    for (const [re, rep] of fixes) q = q.replace(re, rep);

    if (!q || q.length < 3) q = polishName.replace(/\(.*?\)/g, '').trim();

    const uniq = (arr) => arr.filter((x, i, a) => x && a.indexOf(x) === i);
    return uniq([q, `${q} food`, `${q} ingredient photo`]);
}

const raw = JSON.parse(fs.readFileSync(path.join(root, 'js', 'products-data-raw.js'), 'utf8').match(/= (\[[\s\S]*\]);/)[1]);
const products = enrichProducts(raw);
const queries = {};
for (const p of products) {
    queries[p.slug] = fromSlug(p.slug, p.name);
}
fs.writeFileSync(
    path.join(root, 'js', 'product-search-queries.js'),
    `export const PRODUCT_SEARCH_QUERIES = ${JSON.stringify(queries, null, 2)};\n`
);
console.log('Built', Object.keys(queries).length, 'sets. Examples:');
console.log('  piers-z-kurczaka:', queries['piers-z-kurczaka']);
console.log('  losos-atlantycki:', queries['losos-atlantycki']);
console.log('  twarog-chudy:', queries['twarog-chudy']);
