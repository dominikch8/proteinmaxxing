/**
 * Koryguje scripts/new-products-200.json:
 *  1) usuwa 17 duplikatów (te same produkty pod inną nazwą),
 *  2) dodaje 17 zweryfikowanych zamienników (te same kategorie, żeby zachować balans),
 *  3) poprawia 3 wpisy z makrami niezgodnymi z deklarowaną kcal.
 * Uruchom: node scripts/_np-patch.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const jsonPath = path.join(root, 'scripts', 'new-products-200.json');

const REMOVE = new Set([
    'Gęś (mięso)',
    'Chorizo',
    'Królik (tuszka)',
    'Jagnięcina (comber)',
    'Cielęcina (sznycel)',
    'Mleko A2',
    'Śmietana kremówka 36%',
    'Jogurt skyr waniliowy',
    'Ser Pecorino',
    'Ser Lazur',
    'Bób (gotowany)',
    'Koper włoski (fenkuł)',
    'Szpinak mrożony',
    'Persymona (kaki)',
    'Mleko migdałowe (niesłodzone)',
    'Ryż jaśminowy (suchy)',
    'Ryż arborio (suchy)'
]);

const MACRO_FIX = {
    'Ser Mozzarella di bufala': { fat: 24, satFat: 16 },
    'Jogurt typu greckiego 5%': { protein: 9, carbs: 3.6 },
    'Ser Favita': { carbs: 3.5 }
};

const ADD = [
    {"name":"Polędwica z dzika","emoji":"🐗","category":"mieso","servingText":"porcja (150g)","servingRatio":1.5,"kcal":122,"protein":21.5,"carbs":0,"fat":3.5,"satFat":1.2,"pricePerKg":35,"micros":{"b1":0.4,"b2":0.2,"b3":4.5,"b5":0.9,"b6":0.4,"b12":0.7,"choline":80,"iron":1.2,"magnesium":25,"phosphorus":200,"potassium":350,"zinc":2.5,"selenium":12,"copper":90,"sodium":55,"vitD":0.2,"vitE":0.2},"extra":"Dziczyzna jest chudsza od wieprzowiny i bogatsza w żelazo oraz cynk — piecz jak schab."},
    {"name":"Kiełbasa podlaska","emoji":"🌭","category":"mieso","servingText":"plaster (20g)","servingRatio":0.2,"kcal":280,"protein":16,"carbs":1,"fat":24,"satFat":9,"pricePerKg":25,"micros":{"b1":0.4,"b2":0.15,"b3":5,"b5":0.7,"b6":0.3,"b12":0.6,"choline":70,"iron":1.2,"magnesium":20,"phosphorus":180,"potassium":280,"zinc":2.5,"selenium":15,"copper":80,"sodium":950},"extra":"Wędlina z karkówki o grubej ziarnistej strukturze — więcej tłuszczu niż w szynce."},
    {"name":"Wątroba wieprzowa","emoji":"🫀","category":"mieso","servingText":"porcja (120g)","servingRatio":1.2,"kcal":134,"protein":21.4,"carbs":2.5,"fat":3.6,"satFat":1.2,"pricePerKg":10,"micros":{"vitA":6500,"vitC":23,"vitD":0.2,"vitE":0.4,"vitK":0.5,"b1":0.28,"b2":2.2,"b3":15,"b5":6,"b6":0.7,"b9":163,"b12":26,"choline":330,"calcium":9,"iron":17.9,"magnesium":18,"phosphorus":240,"potassium":230,"zinc":6.7,"selenium":44,"copper":650,"manganese":0.3,"sodium":85,"iodine":10},"extra":"Jedno z najbogatszych źródeł witaminy A, B12 i żelaza — 100 g pokrywa wielokrotność dziennej normy."},
    {"name":"Karkówka wędzona","emoji":"🥓","category":"mieso","servingText":"plaster (20g)","servingRatio":0.2,"kcal":320,"protein":15,"carbs":1,"fat":29,"satFat":10.5,"pricePerKg":30,"micros":{"b1":0.5,"b2":0.2,"b3":4,"b5":0.7,"b6":0.3,"b12":0.6,"choline":70,"iron":1.3,"magnesium":20,"phosphorus":170,"potassium":270,"zinc":2.2,"selenium":15,"copper":80,"sodium":1100},"extra":"Wędzona karkówka ma dużo tłuszczu i sodu — traktuj jak dodatek do kanapki, nie źródło białka."},
    {"name":"Miętus","emoji":"🐟","category":"mieso","servingText":"porcja (150g)","servingRatio":1.5,"kcal":88,"protein":19.3,"carbs":0,"fat":0.8,"satFat":0.2,"pricePerKg":25,"micros":{"b12":0.9,"vitD":1,"b1":0.08,"b2":0.1,"b3":1.5,"b5":0.2,"b6":0.1,"choline":65,"calcium":60,"iron":0.4,"magnesium":30,"phosphorus":230,"potassium":350,"zinc":0.7,"selenium":12,"sodium":60,"iodine":25,"copper":60},"extra":"Słodkowodna ryba o bardzo chudym mięsie — delikatna alternatywa dla dorsza."},
    {"name":"Białko jaj w proszku","emoji":"🥚","category":"nabial","servingText":"miarka (30g)","servingRatio":0.3,"kcal":376,"protein":83,"carbs":10,"fat":0.5,"satFat":0.1,"pricePerKg":95,"micros":{"b2":2.4,"b3":0.7,"b5":0.5,"b6":0.03,"b9":20,"b12":0.2,"choline":30,"calcium":60,"iron":0.2,"magnesium":70,"phosphorus":120,"potassium":1100,"zinc":0.1,"selenium":100,"sodium":1650,"copper":60},"extra":"Białko jaj w proszku to niemal czysty protein (ponad 80 g/100 g) — świetne do wypieków i koktajli."},
    {"name":"Mleko 1%","emoji":"🥛","category":"nabial","servingText":"szklanka (250ml)","servingRatio":2.5,"kcal":42,"protein":3.4,"carbs":4.9,"fat":1,"satFat":0.6,"pricePerKg":3.29,"micros":{"b1":0.04,"b2":0.18,"b5":0.6,"b6":0.04,"b9":5,"b12":0.4,"choline":15,"calcium":120,"magnesium":11,"phosphorus":90,"potassium":150,"zinc":0.4,"selenium":3,"sodium":45,"vitD":0.1,"iodine":15},"extra":"Najchudsze mleko krowie — pełna porcja wapnia przy minimalnej ilości tłuszczu."},
    {"name":"Jogurt bałkański 5%","emoji":"🥛","category":"nabial","servingText":"kubek (180g)","servingRatio":1.8,"kcal":97,"protein":9,"carbs":3.6,"fat":5,"satFat":3.2,"pricePerKg":8,"micros":{"b1":0.04,"b2":0.2,"b5":0.6,"b6":0.05,"b9":7,"b12":0.5,"choline":15,"calcium":120,"magnesium":12,"phosphorus":140,"potassium":160,"zinc":0.6,"selenium":4,"sodium":45,"vitD":0.1,"iodine":15},"extra":"Gęsty jogurt odsączany z 9 g białka na 100 g — bliżej twarogu niż klasycznego jogurtu."},
    {"name":"Ser Kashkaval","emoji":"🧀","category":"sery","servingText":"plaster (30g)","servingRatio":0.3,"kcal":350,"protein":25,"carbs":0,"fat":27,"satFat":17,"pricePerKg":40,"micros":{"b2":0.4,"b5":0.5,"b12":1.2,"choline":15,"calcium":700,"iron":0.5,"magnesium":30,"phosphorus":500,"potassium":90,"zinc":3,"selenium":15,"sodium":800,"vitA":220,"iodine":20,"copper":60},"extra":"Bałkański ser półtwardy z mleka owczego lub krowiego — mocno słony, świetny do grillowania."},
    {"name":"Ser Limburger","emoji":"🧀","category":"sery","servingText":"plaster (30g)","servingRatio":0.3,"kcal":327,"protein":20,"carbs":0.5,"fat":27,"satFat":17,"pricePerKg":45,"micros":{"b2":0.35,"b5":0.5,"b12":1,"choline":15,"calcium":500,"iron":0.3,"magnesium":25,"phosphorus":390,"potassium":130,"zinc":2.5,"selenium":15,"sodium":800,"vitA":240,"iodine":20,"copper":60},"extra":"Ser o intensywnej woni i łagodnym smaku — klasyk nadreńskiej kuchni, bogaty w wapń."},
    {"name":"Kukurydza słodka w puszce","emoji":"🌽","category":"warzywa","servingText":"porcja (150g)","servingRatio":1.5,"kcal":81,"protein":2.6,"carbs":17,"fat":0.5,"satFat":0.1,"pricePerKg":11.5,"micros":{"b1":0.03,"b3":1,"b5":0.4,"b6":0.1,"b9":40,"vitC":4,"choline":20,"calcium":4,"iron":0.4,"magnesium":20,"phosphorus":70,"potassium":210,"zinc":0.5,"selenium":1,"sodium":250,"copper":60,"manganese":0.15},"extra":"Kukurydza z puszki jest już ugotowana, ale zawiera dodany cukier i sól — sprawdź etykietę."},
    {"name":"Surówka z kiszonej kapusty","emoji":"🥗","category":"warzywa","servingText":"porcja (150g)","servingRatio":1.5,"kcal":60,"protein":1.2,"carbs":6,"fat":3.5,"satFat":0.5,"pricePerKg":12,"micros":{"vitC":15,"vitK":30,"b9":20,"b1":0.03,"b6":0.1,"calcium":40,"iron":0.5,"magnesium":12,"phosphorus":25,"potassium":180,"zinc":0.2,"sodium":700,"manganese":0.15},"extra":"Kiszona kapusta z olejem i marchewką — witamina C i probiotyki, ale sporo sodu."},
    {"name":"Batat pieczony","emoji":"🍠","category":"warzywa","servingText":"porcja (200g)","servingRatio":2,"kcal":90,"protein":2,"carbs":20.7,"fat":0.15,"satFat":0,"pricePerKg":8,"micros":{"vitA":961,"vitC":19.6,"vitE":0.8,"vitK":2.3,"b1":0.1,"b2":0.1,"b3":1.5,"b5":0.9,"b6":0.3,"b9":6,"choline":13,"calcium":38,"iron":0.7,"magnesium":27,"phosphorus":54,"potassium":475,"zinc":0.3,"copper":160,"manganese":0.5,"sodium":36},"extra":"Pieczony batat to jedna z najbogatszych w witaminę A pozycji w bazie — beta-karoten w dużej dawce."},
    {"name":"Owoce leśne mrożone","emoji":"🫐","category":"owoce","servingText":"porcja (150g)","servingRatio":1.5,"kcal":55,"protein":0.9,"carbs":12,"fat":0.4,"satFat":0.1,"pricePerKg":12,"micros":{"vitA":15,"vitC":25,"vitE":1.2,"vitK":15,"b1":0.03,"b2":0.04,"b3":0.5,"b5":0.3,"b6":0.05,"b9":15,"calcium":20,"iron":0.5,"magnesium":12,"phosphorus":20,"potassium":120,"zinc":0.2,"copper":60,"manganese":0.5,"sodium":3,"selenium":0.5,"iodine":2},"extra":"Mieszanka jagód, malin i porzeczek z mrożonki — witamina C i antyoksydanty przez cały rok."},
    {"name":"Sok wiśniowy","emoji":"🍒","category":"napoje","servingText":"szklanka (250ml)","servingRatio":2.5,"kcal":51,"protein":0.4,"carbs":12.5,"fat":0.1,"satFat":0,"pricePerKg":5.99,"micros":{"b1":0.03,"b2":0.03,"b3":0.4,"b5":0.2,"b6":0.05,"b9":8,"vitC":12,"calcium":12,"iron":0.3,"magnesium":12,"phosphorus":20,"potassium":180,"zinc":0.1,"copper":60,"manganese":0.1,"sodium":5},"extra":"Sok z wiśni wspiera sen i regenerację — pamiętaj jednak o cukrach naturalnych."},
    {"name":"Kasza pęczak gotowany","emoji":"🥣","category":"zboza","servingText":"porcja (200g)","servingRatio":2,"kcal":123,"protein":2.3,"carbs":28.2,"fat":0.4,"satFat":0.1,"pricePerKg":3.5,"micros":{"b1":0.08,"b2":0.03,"b3":1.5,"b5":0.2,"b6":0.1,"b9":12,"vitE":0.01,"vitK":0.6,"choline":12,"calcium":10,"iron":0.6,"magnesium":22,"phosphorus":55,"potassium":90,"zinc":0.6,"copper":80,"manganese":0.3,"selenium":6,"sodium":3},"extra":"Ugotowany pęczak jest źródłem beta-glukanów — błonnika, który pomaga obniżać cholesterol."},
    {"name":"Ryż do risotto","emoji":"🍚","category":"zboza","servingText":"porcja (80g)","servingRatio":0.8,"kcal":350,"protein":7,"carbs":77,"fat":0.6,"satFat":0.2,"pricePerKg":9,"micros":{"b1":0.06,"b3":1.5,"b5":1,"b6":0.1,"b9":8,"choline":6,"calcium":10,"iron":0.8,"magnesium":25,"phosphorus":110,"potassium":110,"zinc":1.4,"copper":200,"manganese":1.1,"selenium":7.5,"sodium":3},"extra":"Krótkoziarnisty ryż arborio do risotto — dużo skrobi, która nadaje kremową konsystencję."}
];

const arr = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const hadNames = new Set(arr.map((p) => p.name));

const removed = [];
const kept = [];
for (const p of arr) {
    if (REMOVE.has(p.name)) { removed.push(p.name); continue; }
    if (MACRO_FIX[p.name]) Object.assign(p, MACRO_FIX[p.name]);
    kept.push(p);
}

const missingRemove = [...REMOVE].filter((n) => !hadNames.has(n));
const keptNames = new Set(kept.map((p) => p.name));
const added = ADD.filter((p) => !keptNames.has(p.name));

const out = [...kept, ...added];
fs.writeFileSync(jsonPath, JSON.stringify(out, null, 0).replace(/\},\{/g, '},\n{'), 'utf8');

console.log(`Usunięto: ${removed.length}${missingRemove.length ? ' | BRAK w pliku: ' + missingRemove.join(', ') : ''}`);
console.log(`Dodano zamienniki: ${added.length} (z ${ADD.length} kandydatów)`);
console.log(`Skorygowano makra: ${Object.keys(MACRO_FIX).length}`);
console.log(`SUMA w JSON: ${out.length}`);

const byCat = {};
for (const p of out) byCat[p.category] = (byCat[p.category] || 0) + 1;
console.log('Kategorie:', JSON.stringify(byCat));