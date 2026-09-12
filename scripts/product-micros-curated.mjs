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

    // Nabiał / sery
    { re: /mleko 3,2|mleko 3\.2|laciate 3/, n: { vitA: 50, vitD: 1, b1: 0.04, b2: 0.18, b3: 0.1, b5: 0.36, b6: 0.04, b9: 5, b12: 0.45, choline: 14, calcium: 113, iron: 0.03, magnesium: 10, phosphorus: 91, potassium: 143, zinc: 0.4, selenium: 3, iodine: 15, copper: 10, sodium: 43 } },
    { re: /mleko 2%|mleko 2 /, n: { vitA: 40, vitD: 1, b1: 0.04, b2: 0.18, b3: 0.1, b5: 0.36, b6: 0.04, b12: 0.45, choline: 14, calcium: 118, iron: 0.03, magnesium: 11, phosphorus: 93, potassium: 150, zinc: 0.4, selenium: 3, iodine: 15, sodium: 44 } },
    { re: /mleko 0%|mleko odtłuszczone|mleko 0,5/, n: { vitA: 15, vitD: 1, b1: 0.04, b2: 0.18, b3: 0.1, b5: 0.36, b6: 0.04, b12: 0.5, choline: 14, calcium: 122, iron: 0.03, magnesium: 11, phosphorus: 95, potassium: 156, zinc: 0.4, selenium: 3, iodine: 15, sodium: 45 } },
    { re: /twaróg chudy/, n: { vitA: 15, b2: 0.16, b5: 0.4, b12: 0.6, choline: 15, calcium: 80, iron: 0.1, magnesium: 8, phosphorus: 160, potassium: 120, zinc: 0.6, selenium: 8, sodium: 85 } },
    { re: /twaróg półtłusty|twaróg wiejski|twaróg sernikowy|ser twarogowy/, n: { vitA: 60, b2: 0.2, b5: 0.4, b12: 0.5, choline: 18, calcium: 90, iron: 0.1, magnesium: 9, phosphorus: 140, potassium: 110, zinc: 0.6, selenium: 8, sodium: 60 } },
    { re: /ser żółty|gouda|edamski|emmental|cheddar|tylżycki|podlaski|maasdam/, n: { vitA: 250, vitD: 0.6, vitE: 0.5, vitK: 2, b1: 0.03, b2: 0.33, b3: 0.1, b5: 0.4, b6: 0.08, b9: 20, b12: 1.5, choline: 16, calcium: 700, iron: 0.3, magnesium: 25, phosphorus: 450, potassium: 80, zinc: 4, selenium: 12, copper: 30, sodium: 800 } },
    { re: /mozzarella/, n: { vitA: 180, vitD: 0.2, b2: 0.28, b12: 0.6, choline: 15, calcium: 505, iron: 0.2, magnesium: 20, phosphorus: 354, potassium: 76, zinc: 2.5, selenium: 15, sodium: 60 } },
    { re: /feta/, n: { vitA: 125, b2: 0.84, b12: 1.7, calcium: 493, iron: 0.65, magnesium: 19, phosphorus: 337, potassium: 62, zinc: 2.9, selenium: 15, sodium: 917 } },
    { re: /skyr/, n: { vitA: 10, b2: 0.16, b12: 0.4, calcium: 150, phosphorus: 130, potassium: 150, zinc: 0.5, selenium: 8, magnesium: 10, sodium: 60 } },
    { re: /jogurt grecki|jogurt naturalny|jogurt/, n: { vitA: 30, b2: 0.14, b5: 0.39, b12: 0.5, choline: 15, calcium: 121, iron: 0.05, magnesium: 12, phosphorus: 95, potassium: 155, zinc: 0.6, selenium: 3, sodium: 46 } },
    { re: /kefir|maślanka/, n: { vitA: 30, b2: 0.14, b5: 0.39, b12: 0.5, calcium: 120, iron: 0.05, magnesium: 12, phosphorus: 95, potassium: 150, zinc: 0.6, selenium: 3, sodium: 48 } },

    // Zboża / strączki / orzechy / nasiona
    { re: /ryż biały/, n: { b1: 0.07, b2: 0.05, b3: 1.6, b5: 1, b6: 0.16, b9: 8, calcium: 28, iron: 0.8, magnesium: 12, phosphorus: 43, potassium: 35, zinc: 1.1, selenium: 15, copper: 110, manganese: 1.1, sodium: 1 } },
    { re: /ryż brązowy/, n: { b1: 0.4, b2: 0.09, b3: 5, b5: 1.5, b6: 0.5, b9: 20, calcium: 33, iron: 1.5, magnesium: 143, phosphorus: 333, potassium: 223, zinc: 2, selenium: 20, copper: 180, manganese: 3.7, sodium: 2 } },
    { re: /płatki owsiane|owsiane|owsianka/, n: { b1: 0.76, b2: 0.14, b3: 0.96, b5: 1.3, b6: 0.12, b9: 56, choline: 32, calcium: 54, iron: 4.7, magnesium: 177, phosphorus: 523, potassium: 429, zinc: 4, selenium: 34, copper: 400, manganese: 4.9, sodium: 2 } },
    { re: /chleb razowy|chleb pełnoziarnisty|chleb żytni|chleb graham/, n: { b1: 0.36, b2: 0.2, b3: 3.5, b5: 0.5, b6: 0.2, b9: 30, calcium: 70, iron: 2.5, magnesium: 60, phosphorus: 180, potassium: 200, zinc: 1.7, selenium: 30, copper: 200, manganese: 1.8, sodium: 400 } },
    { re: /chleb|bułka|bagietka|tortilla/, n: { b1: 0.3, b2: 0.15, b3: 2.5, b5: 0.4, b6: 0.1, b9: 30, calcium: 50, iron: 1.5, magnesium: 25, phosphorus: 100, potassium: 100, zinc: 0.9, selenium: 20, copper: 120, manganese: 0.8, sodium: 400 } },
    { re: /mąka pszenna/, n: { b1: 0.12, b2: 0.04, b3: 1.2, b6: 0.04, b9: 30, calcium: 15, iron: 1.2, magnesium: 22, phosphorus: 108, potassium: 107, zinc: 0.7, selenium: 15, copper: 140, manganese: 0.7, sodium: 2 } },
    { re: /kasza gryczana|gryczana/, n: { b1: 0.1, b2: 0.42, b3: 7, b5: 1.2, b6: 0.21, b9: 30, choline: 20, calcium: 18, iron: 2.2, magnesium: 231, phosphorus: 347, potassium: 460, zinc: 2.4, selenium: 8, copper: 640, manganese: 1.3, sodium: 1 } },
    { re: /kasza jaglana|jaglana/, n: { b1: 0.42, b2: 0.29, b3: 4.7, b5: 1.2, b6: 0.38, b9: 85, calcium: 8, iron: 3, magnesium: 114, phosphorus: 285, potassium: 195, zinc: 1.7, selenium: 3, copper: 750, manganese: 1.6, sodium: 5 } },
    { re: /makaron/, n: { b1: 0.2, b2: 0.05, b3: 1.5, b5: 0.5, b6: 0.1, b9: 25, calcium: 21, iron: 1.5, magnesium: 30, phosphorus: 120, potassium: 180, zinc: 0.8, selenium: 20, copper: 100, manganese: 0.5, sodium: 5 } },
    { re: /soczewica/, n: { b1: 0.5, b2: 0.21, b3: 2.6, b5: 2.1, b6: 0.54, b9: 479, choline: 96, calcium: 35, iron: 3.3, magnesium: 47, phosphorus: 281, potassium: 677, zinc: 1.3, selenium: 6, copper: 250, manganese: 1.4, sodium: 2 } },
    { re: /ciecierzyca/, n: { b1: 0.48, b2: 0.2, b3: 1.5, b5: 1.6, b6: 0.54, b9: 172, choline: 99, calcium: 57, iron: 4.3, magnesium: 79, phosphorus: 252, potassium: 718, zinc: 2.8, selenium: 4, copper: 660, manganese: 21, sodium: 24 } },
    { re: /fasola/, n: { b1: 0.2, b2: 0.06, b3: 0.5, b5: 0.2, b6: 0.13, b9: 130, calcium: 70, iron: 2.5, magnesium: 50, phosphorus: 140, potassium: 400, zinc: 1.5, selenium: 3, copper: 200, manganese: 0.3, sodium: 1 } },
    { re: /orzechy włoskie/, n: { vitE: 0.7, vitK: 2.7, b1: 0.34, b2: 0.15, b3: 1.1, b5: 0.57, b6: 0.54, b9: 98, choline: 39, calcium: 98, iron: 2.9, magnesium: 158, phosphorus: 346, potassium: 441, zinc: 3.1, selenium: 5, copper: 1600, manganese: 3.4, sodium: 2 } },
    { re: /migdały/, n: { vitE: 26, vitK: 2, b1: 0.2, b2: 1.1, b3: 3.6, b5: 0.5, b6: 0.14, b9: 44, choline: 52, calcium: 269, iron: 3.7, magnesium: 268, phosphorus: 481, potassium: 733, zinc: 3.1, selenium: 4, copper: 1000, manganese: 2.1, sodium: 1 } },
    { re: /orzechy ziemne|arachid/, n: { vitE: 8, vitK: 0, b1: 0.64, b2: 0.14, b3: 12, b5: 1.7, b6: 0.35, b9: 240, choline: 52, calcium: 92, iron: 4.6, magnesium: 168, phosphorus: 376, potassium: 705, zinc: 3.3, selenium: 7, copper: 1100, manganese: 1.9, sodium: 18 } },
    { re: /nerkowca|nasiona słonecznika|słonecznik|pestki słonecznika/, n: { vitE: 35, vitK: 0, b1: 1.5, b2: 0.36, b3: 8.3, b5: 1.1, b6: 1.3, b9: 227, choline: 55, calcium: 78, iron: 5.3, magnesium: 325, phosphorus: 660, potassium: 645, zinc: 5, selenium: 53, copper: 1800, manganese: 1.9, sodium: 9 } },
    { re: /pestki dyni/, n: { vitE: 2, vitK: 7, b1: 0.27, b2: 0.15, b3: 1, b5: 0.7, b6: 0.14, b9: 58, choline: 63, calcium: 46, iron: 3.3, magnesium: 262, phosphorus: 1000, potassium: 809, zinc: 8, selenium: 9, copper: 1300, manganese: 4.5, sodium: 7 } },
    { re: /nasiona chia|chia/, n: { vitE: 0.5, b1: 0.62, b2: 0.17, b3: 8.8, b6: 0.12, b9: 49, calcium: 631, iron: 7.7, magnesium: 335, phosphorus: 860, potassium: 407, zinc: 4.6, selenium: 55, copper: 924, manganese: 2.7, sodium: 16 } },
    { re: /siemię lniane|len mielony/, n: { b1: 1.6, b2: 0.16, b3: 3, b5: 1, b6: 0.47, b9: 87, choline: 79, calcium: 255, iron: 5.7, magnesium: 392, phosphorus: 642, potassium: 813, zinc: 4.3, selenium: 25, copper: 1200, manganese: 2.5, sodium: 30 } },

    // Warzywa / owoce
    { re: /banan/, n: { vitC: 8.7, vitE: 0.1, vitK: 0.5, b1: 0.03, b2: 0.07, b3: 0.66, b5: 0.33, b6: 0.37, b9: 20, choline: 9.8, calcium: 5, iron: 0.26, magnesium: 27, phosphorus: 22, potassium: 358, zinc: 0.15, selenium: 1, copper: 80, manganese: 0.27, sodium: 1 } },
    { re: /jabłko/, n: { vitC: 4.6, vitE: 0.2, vitK: 2.2, b1: 0.02, b2: 0.03, b3: 0.09, b5: 0.06, b6: 0.04, b9: 3, calcium: 6, iron: 0.12, magnesium: 5, phosphorus: 11, potassium: 107, zinc: 0.04, selenium: 0, copper: 25, manganese: 0.04, sodium: 1 } },
    { re: /pomarańcza|pomelo|grejpfrut|cytryna|limonk/, n: { vitC: 53, vitE: 0.2, vitK: 0, b1: 0.09, b2: 0.04, b3: 0.28, b5: 0.25, b6: 0.06, b9: 30, calcium: 40, iron: 0.1, magnesium: 10, phosphorus: 14, potassium: 181, zinc: 0.07, selenium: 0.5, copper: 45, sodium: 0 } },
    { re: /truskawk/, n: { vitC: 59, vitE: 0.3, vitK: 2.2, b1: 0.02, b2: 0.02, b3: 0.4, b5: 0.13, b6: 0.05, b9: 24, calcium: 16, iron: 0.4, magnesium: 13, phosphorus: 24, potassium: 153, zinc: 0.14, selenium: 0.4, copper: 50, manganese: 0.4, sodium: 1 } },
    { re: /borówka|jagoda|malina|jeżyna/, n: { vitC: 25, vitE: 0.9, vitK: 19, b1: 0.03, b2: 0.04, b3: 0.4, b5: 0.25, b6: 0.05, b9: 21, calcium: 25, iron: 0.7, magnesium: 22, phosphorus: 29, potassium: 151, zinc: 0.42, selenium: 0.4, copper: 90, manganese: 0.6, sodium: 1 } },
    { re: /winogron/, n: { vitC: 4, vitE: 0.2, vitK: 15, b1: 0.09, b2: 0.07, b3: 0.19, b5: 0.05, b6: 0.09, b9: 2, calcium: 10, iron: 0.36, magnesium: 7, phosphorus: 20, potassium: 191, zinc: 0.07, selenium: 0.1, copper: 120, manganese: 0.1, sodium: 2 } },
    { re: /arbuz|melon/, n: { vitC: 8, vitE: 0.05, vitK: 0.1, b1: 0.03, b2: 0.02, b3: 0.18, b5: 0.22, b6: 0.05, b9: 3, calcium: 7, iron: 0.24, magnesium: 10, phosphorus: 11, potassium: 112, zinc: 0.1, selenium: 0.4, copper: 42, sodium: 1 } },
    { re: /ziemniak/, n: { vitC: 19.7, vitE: 0.05, vitK: 2, b1: 0.08, b2: 0.03, b3: 1.05, b5: 0.3, b6: 0.3, b9: 16, choline: 12, calcium: 12, iron: 0.8, magnesium: 23, phosphorus: 57, potassium: 425, zinc: 0.3, selenium: 0.4, copper: 110, manganese: 0.15, sodium: 6 } },
    { re: /pomidor/, n: { vitA: 42, vitC: 13.7, vitE: 0.54, vitK: 7.9, b1: 0.04, b2: 0.02, b3: 0.6, b5: 0.1, b6: 0.08, b9: 15, choline: 6.7, calcium: 10, iron: 0.27, magnesium: 11, phosphorus: 24, potassium: 237, zinc: 0.17, selenium: 0, copper: 60, manganese: 0.1, sodium: 5 } },
    { re: /ogórek/, n: { vitA: 5, vitC: 2.8, vitK: 16, b1: 0.03, b2: 0.03, b3: 0.1, b5: 0.26, b6: 0.04, b9: 7, calcium: 16, iron: 0.28, magnesium: 13, phosphorus: 24, potassium: 147, zinc: 0.2, selenium: 0.3, copper: 40, manganese: 0.08, sodium: 2 } },
    { re: /marchew/, n: { vitA: 835, vitC: 5.9, vitE: 0.66, vitK: 13, b1: 0.07, b2: 0.06, b3: 0.98, b5: 0.27, b6: 0.14, b9: 19, calcium: 33, iron: 0.3, magnesium: 12, phosphorus: 35, potassium: 320, zinc: 0.24, selenium: 0.1, copper: 45, manganese: 0.14, sodium: 69 } },
    { re: /papryka/, n: { vitA: 157, vitC: 80, vitE: 0.37, vitK: 4.9, b1: 0.06, b2: 0.08, b3: 0.98, b5: 0.32, b6: 0.29, b9: 46, calcium: 10, iron: 0.4, magnesium: 12, phosphorus: 26, potassium: 211, zinc: 0.3, selenium: 0, copper: 70, manganese: 0.12, sodium: 3 } },
    { re: /brokuł|kalafior/, n: { vitA: 31, vitC: 89, vitE: 0.78, vitK: 101, b1: 0.07, b2: 0.12, b3: 0.64, b5: 0.57, b6: 0.18, b9: 63, calcium: 47, iron: 0.7, magnesium: 21, phosphorus: 66, potassium: 316, zinc: 0.4, selenium: 2.5, copper: 50, manganese: 0.21, sodium: 33 } },
    { re: /szpinak/, n: { vitA: 469, vitC: 28, vitE: 2, vitK: 483, b1: 0.08, b2: 0.19, b3: 0.72, b5: 0.07, b6: 0.2, b9: 194, choline: 19, calcium: 99, iron: 2.7, magnesium: 79, phosphorus: 49, potassium: 558, zinc: 0.5, selenium: 1, copper: 130, manganese: 0.9, sodium: 79 } },
    { re: /sałata|rukola|roszponka|kapusta|jarmuż/, n: { vitA: 100, vitC: 35, vitE: 0.5, vitK: 120, b1: 0.05, b2: 0.08, b3: 0.5, b5: 0.2, b6: 0.1, b9: 60, calcium: 40, iron: 1, magnesium: 20, phosphorus: 40, potassium: 300, zinc: 0.3, selenium: 1, copper: 50, manganese: 0.3, sodium: 20 } },
    { re: /pieczarka|boczniak|grzyb|podgrzybek|leśne/, n: { vitD: 0.5, b1: 0.08, b2: 0.4, b3: 3.6, b5: 1.5, b6: 0.1, b9: 17, choline: 17, calcium: 3, iron: 0.5, magnesium: 9, phosphorus: 86, potassium: 318, zinc: 0.5, selenium: 9, copper: 320, manganese: 0.05, sodium: 5 } },
    { re: /cebula|czosnek/, n: { vitC: 8, vitK: 0.4, b1: 0.05, b2: 0.03, b3: 0.1, b5: 0.12, b6: 0.12, b9: 19, calcium: 23, iron: 0.2, magnesium: 10, phosphorus: 29, potassium: 146, zinc: 0.17, selenium: 0.5, copper: 40, manganese: 0.13, sodium: 4 } },
    { re: /awokado/, n: { vitA: 7, vitC: 10, vitE: 2.07, vitK: 21, b1: 0.07, b2: 0.13, b3: 1.7, b5: 1.4, b6: 0.26, b9: 81, choline: 14, calcium: 12, iron: 0.55, magnesium: 29, phosphorus: 52, potassium: 485, zinc: 0.64, selenium: 0.4, copper: 190, manganese: 0.14, sodium: 7 } },
    { re: /masło orzechowe/, n: { vitE: 9, vitK: 0.5, b1: 0.1, b2: 0.1, b3: 13, b5: 1.1, b6: 0.55, b9: 87, calcium: 49, iron: 1.9, magnesium: 168, phosphorus: 335, potassium: 558, zinc: 2.5, selenium: 4, copper: 420, manganese: 1.6, sodium: 400 } },

    // Napoje / słodycze / inne
    { re: /kakao|czekolada gorzka|czekolada 100|czekolada 85/, n: { vitA: 0, vitE: 0.4, vitK: 2, b1: 0.08, b2: 0.24, b3: 2.2, b5: 0.7, b6: 0.07, b9: 24, calcium: 73, iron: 11.9, magnesium: 228, phosphorus: 308, potassium: 715, zinc: 3.3, selenium: 2.5, copper: 1800, manganese: 1.7, sodium: 20 } },
    { re: /czekolada mleczna|milka|prince polo|toblerone/, n: { vitA: 30, vitE: 0.5, vitK: 5, b1: 0.09, b2: 0.3, b3: 0.9, b5: 0.6, b6: 0.07, b9: 10, calcium: 190, iron: 2.3, magnesium: 60, phosphorus: 205, potassium: 370, zinc: 2.1, selenium: 4, copper: 500, manganese: 0.5, sodium: 70 } },
    { re: /miód/, n: { vitC: 0.5, b2: 0.04, b3: 0.1, b5: 0.07, b6: 0.02, b9: 2, calcium: 6, iron: 0.4, magnesium: 2, phosphorus: 4, potassium: 52, zinc: 0.22, selenium: 0.8, copper: 40, manganese: 0.08, sodium: 4 } },
    { re: /tofu/, n: { vitA: 0, vitC: 0, vitE: 0.1, vitK: 2, b1: 0.08, b2: 0.05, b3: 0.4, b5: 0.2, b6: 0.09, b9: 15, calcium: 350, iron: 5.4, magnesium: 30, phosphorus: 97, potassium: 121, zinc: 0.8, selenium: 9, copper: 190, manganese: 0.6, sodium: 7 } },
];




