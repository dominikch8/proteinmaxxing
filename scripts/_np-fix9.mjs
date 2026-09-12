/**
 * Zamienia 9 duplikatów miękkich w scripts/new-products-200.json na 9 nowych,
 * zweryfikowanych produktów (makro na 100 g + mikro + cena regularna PL 2026).
 * Uruchom: node scripts/_np-fix9.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const jsonPath = path.join(root, 'scripts', 'new-products-200.json');
const arr = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const REMOVE = [
    'Gulasz wołowy (mięso)',   // duplikat: Gulasz wołowy
    'Mleko migdałowe',         // duplikat: Mleko migdałowe (niesłodzone)
    'Ser Cheddar',             // duplikat bazy: Ser cheddar
    'Ser Mascarpone',          // duplikat bazy: Ser mascarpone
    'Ser Halloumi',            // duplikat bazy: Ser halloumi
    'Ser Provolone',           // duplikat bazy: Ser provolone
    'Ser koryciński',          // duplikat: Ser Koryciński
    'Bataty (słodkie ziemniaki)', // duplikat bazy: Bataty
    'Ser bryndza',             // duplikat: Ser Bryndza
];

const NEW9 = [
    {"name":"Sos gochujang","emoji":"🌶️","category":"sosy","servingText":"łyżka (20g)","servingRatio":0.2,"kcal":200,"protein":5,"carbs":37,"fat":3,"satFat":0.5,"pricePerKg":26,"micros":{"sodium":1600,"potassium":400,"vitA":60,"vitC":5,"calcium":30,"iron":1.5,"magnesium":30,"phosphorus":60,"b6":0.1},"extra":"Koreańska pasta z chili i sfermentowanej soi — słodko-ostra, bardzo słona, dozuj łyżką."},
    {"name":"Sos hoisin","emoji":"🥢","category":"sosy","servingText":"łyżka (20g)","servingRatio":0.2,"kcal":220,"protein":3.3,"carbs":44,"fat":3.4,"satFat":0.5,"pricePerKg":24,"micros":{"sodium":1600,"potassium":400,"calcium":30,"iron":1.5,"vitC":2,"phosphorus":60,"magnesium":25},"extra":"Chiński sos z fermentowanej soi — dużo cukru i sodu, klasyk do dań stir-fry."},
    {"name":"Sos miodowo-musztardowy","emoji":"🍯","category":"sosy","servingText":"łyżka (20g)","servingRatio":0.2,"kcal":330,"protein":1,"carbs":35,"fat":21,"satFat":2,"pricePerKg":20,"micros":{"sodium":600,"potassium":80,"calcium":20,"iron":0.5,"vitC":2,"selenium":3},"extra":"Połączenie miodu i musztardy — sporo cukru i tłuszczu, ale wyraźny smak do sałatek."},
    {"name":"Olej z orzechów włoskich","emoji":"🌰","category":"tluszcze","servingText":"łyżka (10g)","servingRatio":0.1,"kcal":884,"protein":0,"carbs":0,"fat":100,"satFat":9,"pricePerKg":100,"micros":{"vitE":0.4,"vitK":15},"extra":"Tłoczony na zimno — delikatny, bogaty w omega-3; nie nadaje się do smażenia."},
    {"name":"Olej z pestek dyni","emoji":"🎃","category":"tluszcze","servingText":"łyżka (10g)","servingRatio":0.1,"kcal":884,"protein":0,"carbs":0,"fat":100,"satFat":20,"pricePerKg":80,"micros":{"vitE":2.2,"vitK":7.3,"zinc":0.1},"extra":"Ciemnozielony olej do surówek i sałatek — jeden z najbogatszych w witaminę E."},
    {"name":"Smalec gęsi","emoji":"🦢","category":"tluszcze","servingText":"łyżka (15g)","servingRatio":0.15,"kcal":900,"protein":0,"carbs":0,"fat":99.8,"satFat":27,"pricePerKg":50,"micros":{"vitA":30,"vitE":1,"vitD":1.7,"vitK":1,"choline":40,"selenium":0.2},"extra":"Tradycyjny tłuszcz do pieczenia ziemniaków — prawie sam tłuszcz, ale stabilny w wysokich temperaturach."},
    {"name":"Makaron soba","emoji":"🍜","category":"makarony","servingText":"porcja sucha (75g)","servingRatio":0.75,"kcal":336,"protein":14,"carbs":71,"fat":1.4,"satFat":0.3,"pricePerKg":32,"micros":{"b1":0.1,"b2":0.06,"b3":1.5,"b9":14,"iron":2.5,"magnesium":80,"phosphorus":150,"zinc":1.5,"manganese":1,"copper":200,"selenium":10,"sodium":300},"extra":"Gryczany makaron japoński — wyższe białko i więcej żelaza niż pszenny."},
    {"name":"Makaron orkiszowy (suchy)","emoji":"🌾","category":"makarony","servingText":"porcja sucha (75g)","servingRatio":0.75,"kcal":348,"protein":15,"carbs":70,"fat":2.5,"satFat":0.5,"pricePerKg":18,"micros":{"b1":0.3,"b2":0.1,"b3":4,"b9":40,"iron":3.5,"magnesium":120,"phosphorus":300,"zinc":2.5,"selenium":30,"manganese":2.5,"copper":400,"sodium":10},"extra":"Makaron z pszenicy orkisz — więcej błonnika i mikroelementów niż zwykły pszenny."},
    {"name":"Makaron soczewicowy (suchy)","emoji":"🫘","category":"makarony","servingText":"porcja sucha (75g)","servingRatio":0.75,"kcal":350,"protein":25,"carbs":57,"fat":1.5,"satFat":0.3,"pricePerKg":40,"micros":{"b1":0.5,"b9":200,"iron":5,"magnesium":90,"phosphorus":300,"zinc":3,"potassium":700,"copper":500,"manganese":1.5,"sodium":10},"extra":"Bezglutenowy makaron z soczewicy — rekordowe białko i żelazo wśród makaronów."},
];

// Usuń duplikaty
const removeSet = new Set(REMOVE);
const before = arr.length;
const filtered = arr.filter((p) => !removeSet.has(p.name));
if (before - filtered.length !== REMOVE.length) {
    console.error('BŁĄD: usunięto', before - filtered.length, 'z', REMOVE.length);
    process.exit(1);
}

// Dodaj nowe (i zweryfikuj brak kolizji)
const have = new Set(filtered.map((p) => p.name));
for (const n of NEW9) {
    if (have.has(n.name)) { console.error('Kolizja nazwy:', n.name); process.exit(1); }
    have.add(n.name);
    filtered.push(n);
}

// Walidacja makr
let bad = 0;
for (const p of filtered) {
    const calc = 4 * p.protein + 4 * p.carbs + 9 * p.fat;
    if (Math.abs(calc - p.kcal) > 22) { console.error('Makro poza tolerancją:', p.name, Math.round(calc), p.kcal); bad++; }
}
if (bad) process.exit(1);

fs.writeFileSync(jsonPath, JSON.stringify(filtered, null, 0).replace(/\},\{/g, '},\n{'), 'utf8');
console.log(`OK: usunięto ${REMOVE.length}, dodano ${NEW9.length}, razem ${filtered.length}`);
