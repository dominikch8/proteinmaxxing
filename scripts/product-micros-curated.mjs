/**
 * Kuratowane, realne profile mikroskładników na 100 g (wartości typowe
 * wg USDA FoodData Central / tabel IŻŻ). Używane ZAMIAST szablonu kategorii,
 * gdy nazwa produktu pasuje do jednej z reguł. Jednostki jak w lib/micros-shared.mjs
 * (µg/mg).
 *
 * Priorytet budowania profilu produktu:
 *   1) microsDetailOverride (ręczny override z bazy)
 *   2) Open Food Facts (realne dane z internetu)
 *   3) CURATED_FOODS (pełny, zweryfikowany profil)  <-- ten plik
 *   4) PURE_LEAN (substancje czyste -> profil bliski zeru / znany)
 *   5) silnik NAME_RULES + CATEGORY_BASE (gruba estymacja)
 *   6) brak danych -> microsDetail puste
 */

export const PURE_LEAN = [
    { re: /cukier|cukier puder|cukier wanilinowy|cukier brązowy|cukier biały|syrop klonowy|miód\s*$/, n: { potassium: 50, sodium: 1, calcium: 6, magnesium: 2, phosphorus: 4 } },
    { re: /soda oczyszczona/, n: { sodium: 27360 } },
    { re: /proszek do pieczenia/, n: { sodium: 10600, phosphorus: 8000, calcium: 5900 } },
    { re: /żelatyna|galaretka/, n: { sodium: 12, potassium: 7 } },
    { re: /skrobia|mąka ziemniaczana|mąka kukurydziana/, n: { potassium: 3, magnesium: 2, phosphorus: 13, iron: 0.4, sodium: 1 } },
    { re: /woda\b|woda gazowana|woda mineralna/, n: { calcium: 40, magnesium: 15, sodium: 5, potassium: 2 } },
    { re: /kawa rozpuszczalna|kawa parzona|kawa czarna|espresso|herbata parzona|herbata zielona|herbata czerwona|herbata czarna/, n: { potassium: 50, magnesium: 5, manganese: 0.2, b3: 0.5, phosphorus: 5, sodium: 5 } },
    { re: /olej rzepakowy/, n: { vitE: 17, vitK: 71 } },
    { re: /olej słonecznikowy/, n: { vitE: 41, vitK: 5 } },
    { re: /oliwa z oliwek|oliwa extra|oliwa -/, n: { vitE: 14, vitK: 60 } },
    { re: /olej kokosowy/, n: { vitE: 0.1 } },
    { re: /olej lniany/, n: { vitE: 0.5, vitK: 10 } },
    { re: /masło klarowane|ghee/, n: { vitA: 840, vitE: 2.8 } },
    { re: /sól kuchenna/, n: { sodium: 38758, iodine: 2000 } },
    { re: /ocet/, n: { sodium: 5, potassium: 15, calcium: 6, magnesium: 4 } },
];

export const CURATED_FOODS = [
    // Mięso / jaja / ryby
    { re: /pierś z kurczaka/, n: { vitD: 0.2, b1: 0.08, b2: 0.12, b3: 13.7, b5: 1.3, b6: 0.9, b12: 0.3, choline: 85, iron: 0.9, magnesium: 29, phosphorus: 228, potassium: 256, zinc: 0.9, selenium: 27, copper: 45, sodium: 45 } },
    { re: /pierś z indyka|indyk filet/, n: { vitD: 0.2, b1: 0.08, b2: 0.15, b3: 11.8, b5: 0.9, b6: 0.81, b12: 0.4, choline: 70, iron: 0.7, magnesium: 28, phosphorus: 213, potassium: 293, zinc: 1.2, selenium: 24, copper: 50, sodium: 50 } },
    { re: /wołowina \(polędwica\)|polędwica wołowa|stek z polędwicy/, n: { vitD: 0.1, b1: 0.07, b2: 0.15, b3: 5.5, b5: 0.6, b6: 0.6, b12: 2.1, choline: 85, iron: 2.6, magnesium: 22, phosphorus: 198, potassium: 318, zinc: 4.8, selenium: 22, copper: 90, sodium: 55 } },
    { re: /wieprzowina \(schab|schab bez kości|schabowy/, n: { vitD: 0.8, b1: 0.7, b2: 0.2, b3: 6, b5: 0.8, b6: 0.5, b12: 0.6, choline: 70, iron: 0.8, magnesium: 22, phosphorus: 200, potassium: 350, zinc: 2.2, selenium: 36, copper: 60, sodium: 60 } },
    { re: /łosoś atlantycki|łosoś świeży|łosoś filet/, n: { vitA: 40, vitD: 11, vitE: 0.4, b1: 0.08, b2: 0.15, b3: 8.5, b5: 1.5, b6: 0.8, b12: 3.2, choline: 90, calcium: 9, iron: 0.3, magnesium: 27, phosphorus: 252, potassium: 363, zinc: 0.4, selenium: 36, copper: 50, sodium: 60 } },
    { re: /tuńczyk/, n: { vitD: 1.7, b1: 0.08, b2: 0.12, b3: 18.5, b5: 0.3, b6: 0.9, b12: 2.2, choline: 60, iron: 1.4, magnesium: 30, phosphorus: 222, potassium: 237, zinc: 0.6, selenium: 90, copper: 50, sodium: 60 } },
    { re: /dorsz/, n: { vitD: 0.9, b1: 0.08, b2: 0.06, b3: 2.1, b5: 0.4, b6: 0.25, b12: 1, choline: 70, iron: 0.4, magnesium: 30, phosphorus: 203, potassium: 413, zinc: 0.6, selenium: 33, copper: 40, iodine: 110, sodium: 60 } },
    { re: /śledź|makrela|sardyn/, n: { vitD: 16, b1: 0.08, b2: 0.28, b3: 9, b5: 0.8, b6: 0.4, b12: 8.7, choline: 70, calcium: 40, iron: 1.4, magnesium: 35, phosphorus: 217, potassium: 350, zinc: 1, selenium: 44, copper: 80, iodine: 50, sodium: 90 } },
    { re: /jajo kurze|jajko kurze|jajko/, n: { vitA: 160, vitD: 2, vitE: 1, vitK: 0.3, b1: 0.04, b2: 0.46, b3: 0.08, b5: 1.4, b6: 0.17, b9: 47, b12: 0.89, choline: 294, calcium: 56, iron: 1.8, magnesium: 12, phosphorus: 198, potassium: 138, zinc: 1.3, selenium: 31, copper: 70, sodium: 142 } },
];
