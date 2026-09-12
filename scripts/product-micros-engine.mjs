/**
 * Silnik szacowania / przypisywania mikroskładników na 100 g.
 * Źródła: USDA FoodData Central (typowe wartości), tabele IŻŻ/literatura, OFF (przy fetcherze).
 */
import { cleanMicros } from './lib/micros-shared.mjs';
import { PURE_LEAN, CURATED_FOODS } from './product-micros-curated.mjs';

const CATEGORY_BASE = {
    mieso: {
        b3: 5, b6: 0.35, b12: 1.2, phosphorus: 180, zinc: 2.5, iron: 1.4,
        selenium: 18, potassium: 280, b5: 0.8, choline: 70, sodium: 60,
        magnesium: 22, b2: 0.15, b1: 0.08, copper: 80, vitD: 0.2,
    },
    nabial: {
        calcium: 120, b2: 0.2, b12: 0.5, phosphorus: 100, potassium: 150,
        zinc: 0.5, b5: 0.4, selenium: 5, sodium: 50, magnesium: 12,
        vitA: 30, b1: 0.04, iodine: 15, choline: 15,
    },
    sery: {
        calcium: 600, b2: 0.3, b12: 1.2, phosphorus: 450, zinc: 3,
        sodium: 600, vitA: 250, b5: 0.4, selenium: 12, magnesium: 25,
        b6: 0.08, potassium: 80, iodine: 20,
    },
    warzywa: {
        vitC: 25, potassium: 280, b9: 40, vitA: 80, vitK: 40,
        magnesium: 20, manganese: 0.2, copper: 60, iron: 0.8,
        phosphorus: 40, calcium: 20, b6: 0.1, b1: 0.05, vitE: 0.5,
    },
    owoce: {
        vitC: 30, potassium: 200, b9: 20, vitA: 30, magnesium: 12,
        manganese: 0.1, copper: 50, vitE: 0.3, b6: 0.08, phosphorus: 20,
        calcium: 15, iron: 0.3, vitK: 5,
    },
    zboza: {
        b1: 0.25, magnesium: 50, iron: 1.5, phosphorus: 120,
        manganese: 1.2, b3: 2, zinc: 1.2, copper: 150, selenium: 10,
        b6: 0.15, potassium: 150, b9: 25, sodium: 5, vitE: 0.5,
    },
    'platki-sniadaniowe': {
        iron: 6, b1: 0.8, b2: 0.8, b3: 8, b9: 150, b6: 0.8,
        zinc: 2, sodium: 400, magnesium: 40, phosphorus: 120,
        calcium: 50, potassium: 180, vitA: 200, b12: 0.8,
    },
    'polskie-obiadki': {
        sodium: 400, iron: 1.2, phosphorus: 100, potassium: 220,
        b1: 0.15, zinc: 1, selenium: 8, magnesium: 20, b3: 2,
        calcium: 40, b12: 0.3, vitA: 30, copper: 80, manganese: 0.2,
    },
    zupy: {
        sodium: 350, potassium: 180, vitA: 40, vitC: 5,
        magnesium: 12, phosphorus: 40, iron: 0.4, calcium: 25,
        b1: 0.05, zinc: 0.3, selenium: 2, copper: 40,
    },
    orzechy: {
        magnesium: 180, vitE: 8, zinc: 3, copper: 800, manganese: 2,
        phosphorus: 400, b1: 0.4, iron: 3, selenium: 8, potassium: 500,
        b6: 0.3, b3: 2, calcium: 80, b9: 40, vitK: 5,
    },
    tluszcze: {
        vitE: 15, vitA: 50, vitK: 20, vitD: 0.1,
    },
    makarony: {
        b1: 0.2, iron: 1.5, phosphorus: 120, magnesium: 30,
        manganese: 0.5, b3: 1.5, zinc: 0.8, selenium: 20,
        copper: 100, potassium: 80, b6: 0.08, b9: 20, sodium: 10,
    },
    'mrozone-pizze': {
        calcium: 150, sodium: 550, b1: 0.15, phosphorus: 150,
        iron: 1.2, zinc: 1.5, vitA: 60, b12: 0.4, potassium: 180,
        magnesium: 25, b3: 2, selenium: 10, copper: 80,
    },
    fastfood: {
        sodium: 550, iron: 1.5, phosphorus: 140, zinc: 1.5,
        b3: 3, calcium: 80, potassium: 200, magnesium: 25,
        b12: 0.5, selenium: 10, b1: 0.2, copper: 90, vitA: 40,
    },
    slodycze: {
        magnesium: 25, iron: 1.2, phosphorus: 60, copper: 200,
        sodium: 80, calcium: 50, potassium: 120, zinc: 0.5,
        b2: 0.1, manganese: 0.3, selenium: 2,
    },
    batony: {
        magnesium: 35, iron: 1.5, phosphorus: 80, calcium: 60,
        sodium: 150, potassium: 150, zinc: 0.8, copper: 250,
        b3: 1, manganese: 0.4,
    },
    'batony-proteinowe': {
        calcium: 100, magnesium: 50, phosphorus: 150, iron: 2,
        zinc: 2, b12: 0.5, sodium: 200, potassium: 180,
        b6: 0.3, b3: 3, selenium: 8,
    },
    sosy: {
        sodium: 700, vitC: 4, potassium: 80, vitA: 20,
        phosphorus: 30, magnesium: 10, iron: 0.4, calcium: 20,
        zinc: 0.2, copper: 40,
    },
    napoje: {
        potassium: 15, sodium: 8, magnesium: 3, calcium: 5, phosphorus: 5,
    },
    alkohole: {
        potassium: 40, magnesium: 8, b3: 0.4, phosphorus: 20,
        sodium: 5, b2: 0.03, b9: 5,
    },
    przyprawy: {
        sodium: 200, manganese: 2, iron: 8, calcium: 200, copper: 400,
        magnesium: 100, potassium: 500, zinc: 2, selenium: 5,
        vitK: 50, vitA: 100, vitC: 10,
    },
};

/** Dokładniejsze profile po nazwie (USDA / tabele żywieniowe / etykiety). */
const NAME_RULES = [
    { re: /pierś z kurczaka/i, n: { b3: 14.8, b6: 0.6, phosphorus: 220, selenium: 27, zinc: 0.7, potassium: 256, b12: 0.3, b5: 1.1, choline: 85, iron: 0.4, sodium: 45, magnesium: 28 } },
    { re: /pierś z indyka/i, n: { b3: 11.8, b6: 0.81, phosphorus: 213, selenium: 24, zinc: 1.2, potassium: 293, b12: 0.4, b5: 0.9, iron: 0.7, sodium: 50, magnesium: 28 } },
    { re: /wołowina \(polędwica\)|wołowina/i, n: { iron: 2.6, zinc: 4.8, b12: 2.1, b3: 5.5, b6: 0.4, phosphorus: 198, selenium: 22, potassium: 318, choline: 85, sodium: 55 } },
    { re: /wieprzowina \(schab|schab/i, n: { b1: 0.7, b3: 6, b6: 0.5, phosphorus: 200, zinc: 2.2, selenium: 36, potassium: 350, b12: 0.6, iron: 0.8 } },
    { re: /indyk mielony|kurczak mielony/i, n: { b3: 8, b6: 0.5, phosphorus: 180, zinc: 2, selenium: 20, b12: 0.5, iron: 1.2, potassium: 250 } },
    { re: /mięso mielone wołowe/i, n: { iron: 2.2, zinc: 4.5, b12: 2.2, b3: 4.5, phosphorus: 180, selenium: 18 } },
    { re: /łosoś|losos/i, n: { b12: 3.2, vitD: 11, selenium: 36, phosphorus: 252, b3: 8.5, potassium: 363, vitA: 40, b6: 0.8, choline: 90 } },
    { re: /tuńczyk|tunczyk/i, n: { b12: 2.2, selenium: 90, b3: 18.5, phosphorus: 222, vitD: 1.7, potassium: 237, b6: 0.9 } },
    { re: /dorsz/i, n: { b12: 1.0, selenium: 33, phosphorus: 203, vitD: 0.9, iodine: 110, potassium: 413, b3: 2.1 } },
    { re: /makrela/i, n: { b12: 8.7, vitD: 16, selenium: 44, phosphorus: 217, b3: 9, iodine: 50 } },
    { re: /śledź|sledz/i, n: { b12: 13, vitD: 4.2, selenium: 36, phosphorus: 236, sodium: 500, iodine: 30 } },
    { re: /pstrąg/i, n: { b12: 3.5, vitD: 3.5, selenium: 28, phosphorus: 245, b3: 5 } },
    { re: /krewetki/i, n: { b12: 1.1, selenium: 38, phosphorus: 200, zinc: 1.3, iodine: 35, copper: 300, sodium: 500 } },
    { re: /wątróbka|watrobka|wątroba/i, n: { vitA: 6500, b12: 59, iron: 9, copper: 5000, b2: 2.8, choline: 350, b9: 290, selenium: 40, zinc: 4 } },
    { re: /jajko kurze|jajko/i, n: { b12: 1.1, choline: 294, vitA: 160, selenium: 30, b2: 0.46, phosphorus: 198, vitD: 2, b5: 1.5, iron: 1.8, zinc: 1.3 } },
    { re: /białka jaj/i, n: { b2: 0.4, selenium: 20, potassium: 163, sodium: 166, b12: 0.1, choline: 1 } },
    { re: /twaróg chudy/i, n: { calcium: 90, phosphorus: 170, b12: 0.9, b2: 0.25, selenium: 11, potassium: 100, zinc: 0.5 } },
    { re: /twaróg półtłusty|twaróg sernikowy|twaróg wiejski/i, n: { calcium: 100, phosphorus: 180, b12: 0.8, b2: 0.25, selenium: 10 } },
    { re: /skyr/i, n: { calcium: 120, phosphorus: 170, b12: 0.7, b2: 0.25, potassium: 140, selenium: 10 } },
    { re: /serek wiejski/i, n: { calcium: 80, phosphorus: 150, b12: 0.6, b2: 0.2, selenium: 9 } },
    { re: /jogurt grecki/i, n: { calcium: 110, phosphorus: 135, b12: 0.5, b2: 0.25, potassium: 141 } },
    { re: /jogurt naturalny|jogurt pitny|jogurt owocowy|jogurt kokosowy/i, n: { calcium: 120, phosphorus: 95, b12: 0.4, b2: 0.2, potassium: 150 } },
    { re: /kefir|maślanka/i, n: { calcium: 120, phosphorus: 100, b12: 0.3, b2: 0.2, potassium: 150 } },
    { re: /mleko 0%|mleko 2%|mleko 3|mleko bez|mleko roślinne|mleko skondens/i, n: { calcium: 120, b2: 0.18, b12: 0.45, phosphorus: 90, potassium: 150 } },
    { re: /śmietana|śmietanka/i, n: { vitA: 300, calcium: 70, phosphorus: 60, b2: 0.1, sodium: 40 } },
    { re: /ser gouda|gouda/i, n: { calcium: 700, phosphorus: 546, b12: 1.5, zinc: 3.9, vitA: 253, sodium: 819, b2: 0.33 } },
    { re: /mozzarella/i, n: { calcium: 505, phosphorus: 354, b12: 2.3, zinc: 2.9, vitA: 179, sodium: 627 } },
    { re: /parmezan/i, n: { calcium: 1184, phosphorus: 694, b12: 1.2, zinc: 2.8, vitA: 207, sodium: 1529 } },
    { re: /feta/i, n: { calcium: 493, phosphorus: 337, b12: 1.7, zinc: 2.9, vitA: 125, sodium: 1116 } },
    { re: /cheddar/i, n: { calcium: 721, phosphorus: 512, b12: 1.1, zinc: 3.1, vitA: 265, sodium: 621 } },
    { re: /camembert|brie/i, n: { calcium: 388, phosphorus: 347, b12: 1.3, zinc: 2.4, vitA: 241, sodium: 842 } },
    { re: /halloumi/i, n: { calcium: 700, phosphorus: 450, sodium: 1100, b12: 1.2, zinc: 3 } },
    { re: /emmental/i, n: { calcium: 970, phosphorus: 605, b12: 2.3, zinc: 4.3, vitA: 260, sodium: 190 } },
    { re: /ricotta|mascarpone/i, n: { calcium: 200, phosphorus: 150, vitA: 180, b12: 0.3, sodium: 100 } },
    { re: /oscypek|ser wędzony|ser tylżycki|ser edamski|ser żółty|ser topiony|ser kozi|ser pleśniowy|ser provolone|ser cottage|ser twarogowy/i, n: { calcium: 650, phosphorus: 480, b12: 1.4, zinc: 3.2, sodium: 700, vitA: 220 } },
    { re: /szpinak/i, n: { vitK: 483, vitA: 469, vitC: 28, iron: 2.7, magnesium: 79, b9: 194, potassium: 558, manganese: 0.9, calcium: 99 } },
    { re: /brokuł/i, n: { vitC: 89, vitK: 102, b9: 63, potassium: 316, vitA: 31, phosphorus: 66, magnesium: 21 } },
    { re: /papryka czerwona/i, n: { vitC: 128, vitA: 157, b6: 0.29, potassium: 211, vitE: 1.6 } },
    { re: /papryka zielona|papryka żółta/i, n: { vitC: 80, vitA: 37, b6: 0.22, potassium: 175 } },
    { re: /marchew/i, n: { vitA: 835, vitK: 13, potassium: 320, vitC: 5.9, b6: 0.14 } },
    { re: /pomidor(?!owa)|pomidorki/i, n: { vitC: 14, potassium: 237, vitA: 42, vitK: 7.9, b9: 15 } },
    { re: /banan/i, n: { potassium: 358, b6: 0.37, vitC: 8.7, magnesium: 27, manganese: 0.27, copper: 78 } },
    { re: /pomarańcz/i, n: { vitC: 53, potassium: 181, b9: 30, calcium: 40, b1: 0.09 } },
    { re: /kiwi/i, n: { vitC: 93, potassium: 312, vitE: 1.5, vitK: 40, b9: 25 } },
    { re: /truskawk/i, n: { vitC: 59, manganese: 0.39, b9: 24, potassium: 153 } },
    { re: /malin/i, n: { vitC: 26, manganese: 0.67, b9: 21, potassium: 151, vitE: 0.9 } },
    { re: /borówk|jagod/i, n: { vitC: 10, vitK: 19, manganese: 0.34, potassium: 77 } },
    { re: /jabłk/i, n: { vitC: 4.6, potassium: 107, vitK: 2.2 } },
    { re: /gruszk/i, n: { vitC: 4.3, potassium: 116, copper: 82 } },
    { re: /awokado/i, n: { potassium: 485, vitE: 2.1, b9: 81, magnesium: 29, vitK: 21, b5: 1.4, copper: 190 } },
    { re: /cytryn|limon/i, n: { vitC: 53, potassium: 138, b9: 11 } },
    { re: /ananas/i, n: { vitC: 48, manganese: 0.93, b1: 0.08, potassium: 109 } },
    { re: /mango/i, n: { vitC: 36, vitA: 54, b9: 43, potassium: 168 } },
    { re: /winogron/i, n: { vitC: 3.2, potassium: 191, vitK: 14.6 } },
    { re: /arbuz/i, n: { vitC: 8.1, vitA: 28, potassium: 112 } },
    { re: /melon/i, n: { vitC: 37, vitA: 169, potassium: 267 } },
    { re: /czosnek/i, n: { manganese: 1.7, vitC: 31, b6: 1.2, selenium: 14, calcium: 181 } },
    { re: /cebula/i, n: { vitC: 7.4, b6: 0.12, potassium: 146, b9: 19 } },
    { re: /ziemniak/i, n: { potassium: 421, vitC: 20, b6: 0.3, magnesium: 23, phosphorus: 57 } },
    { re: /batat/i, n: { vitA: 709, vitC: 2.4, potassium: 337, manganese: 0.26, b6: 0.21 } },
    { re: /fasola biała|ciecierzyca|soczewica|fasolka/i, n: { iron: 2.5, b9: 100, magnesium: 50, phosphorus: 140, potassium: 400, zinc: 1.5, copper: 300 } },
    { re: /tofu/i, n: { calcium: 350, iron: 5.4, magnesium: 50, phosphorus: 120, zinc: 1.6, copper: 300, manganese: 1.2 } },
    { re: /płatki owsiane/i, n: { magnesium: 138, iron: 4.2, b1: 0.46, phosphorus: 410, zinc: 3.6, manganese: 3.6, copper: 390, selenium: 29 } },
    { re: /ryż biały|ryż basmati|ryż arborio|ryż do sushi/i, n: { manganese: 0.5, selenium: 7.5, phosphorus: 43, magnesium: 12, b1: 0.02, copper: 70 } },
    { re: /ryż brązowy|ryż dziki|ryż jałowcowy/i, n: { magnesium: 44, phosphorus: 83, manganese: 1.0, b1: 0.1, selenium: 10, zinc: 0.7 } },
    { re: /kasza gryczana/i, n: { magnesium: 90, manganese: 0.8, copper: 400, phosphorus: 180, iron: 1.5, b3: 3 } },
    { re: /kasza jaglana|kasza manna|kasza jęczmienna|pęczak|bulgur|kuskus|quinoa|komosa/i, n: { magnesium: 60, phosphorus: 150, iron: 1.8, b1: 0.2, manganese: 0.8, zinc: 1.2 } },
    { re: /chleb żytni|chleb pszenny|chleb tostowy|chleb gryczany|chleb orkiszowy|pumpernikiel/i, n: { b1: 0.25, iron: 2.2, sodium: 480, phosphorus: 110, magnesium: 40, selenium: 20, zinc: 1.2 } },
    { re: /bułka|baguette|kajzerka|grahamka|croissant|precel|tortilla/i, n: { b1: 0.3, iron: 2.5, sodium: 500, phosphorus: 100, selenium: 18 } },
    { re: /makaron.*suchy|spaghetti suchy|penne suchy|fusilli|rigatoni|lazanki|świderki|jajeczny suchy|pełnoziarnisty suchy|ryżowy suchy|pszenny suchy/i, n: { b1: 0.17, iron: 1.3, phosphorus: 115, selenium: 38, manganese: 0.5, magnesium: 30 } },
    { re: /makaron chiński|udon|gnocchi/i, n: { b1: 0.1, iron: 1.0, phosphorus: 60, sodium: 200, selenium: 15 } },
    { re: /migdał/i, n: { vitE: 25.6, magnesium: 270, manganese: 2.3, copper: 1000, phosphorus: 481, calcium: 3.1, calcium: 269, iron: 3.7, b2: 1.1 } },
    { re: /orzechy włoskie/i, n: { manganese: 3.4, copper: 1580, magnesium: 158, phosphorus: 346, vitE: 0.7, b6: 0.54, zinc: 3.1 } },
    { re: /orzechy laskowe/i, n: { vitE: 15, manganese: 6.2, copper: 1725, magnesium: 163, phosphorus: 290 } },
    { re: /orzechy nerkowca|nerkowc/i, n: { copper: 2190, magnesium: 292, phosphorus: 593, zinc: 5.8, iron: 6.7, selenium: 20 } },
    { re: /pistacj/i, n: { b6: 1.7, phosphorus: 490, copper: 1300, magnesium: 121, vitB1: 0.87, potassium: 1025 } },
    { re: /orzechy ziemne|masło orzechowe/i, n: { magnesium: 168, phosphorus: 358, zinc: 3.3, vitE: 8.3, b3: 12, manganese: 1.9 } },
    { re: /pestki dyni|słonecznika|chia|siemię|lnian/i, n: { magnesium: 550, phosphorus: 1200, zinc: 7, iron: 8, manganese: 4, copper: 1400, selenium: 10 } },
    { re: /oliwa z oliwek/i, n: { vitE: 14.4, vitK: 60 } },
    { re: /olej rzepakowy|olej słonecznikowy|olej sezamowy/i, n: { vitE: 17, vitK: 10 } },
    { re: /masło ekstra|masło klarowane|ghee/i, n: { vitA: 684, vitE: 2.3, vitD: 0.5, vitK: 7 } },
    { re: /szpinak|jarmuż|rukola|roszponka|sałata/i, n: { vitK: 200, vitA: 200, b9: 100, vitC: 20, iron: 1.5, magnesium: 30 } },
    { re: /szynka|kiełbasa|parówk|boczek|kabanos|salami|mortadela|baleron|pasztet|salceson/i, n: { sodium: 900, b1: 0.5, zinc: 2.2, iron: 1.2, phosphorus: 180, b12: 0.6, selenium: 15 } },
    { re: /izolat białka|koncentrat białka|whey|wpi|wpc/i, n: { calcium: 400, phosphorus: 300, potassium: 500, magnesium: 80, zinc: 3, b12: 1, sodium: 200 } },
    { re: /coca-cola zero|coca-cola|pepsi|fanta|sprite|mirinda|ice tea|nestea|tymbark|kubuś/i, n: { sodium: 8, potassium: 5, phosphorus: 10, magnesium: 2, calcium: 3 } },
    { re: /sok pomarańcz/i, n: { vitC: 50, potassium: 200, b9: 30, magnesium: 11, calcium: 11, b1: 0.09 } },
    { re: /^woda$/i, n: { calcium: 40, magnesium: 15, sodium: 5, potassium: 2 } },
    { re: /kawa czarna|herbata czarna/i, n: { potassium: 50, magnesium: 5, manganese: 0.2, b3: 0.5, phosphorus: 5 } },
    { re: /red bull|monster|tiger|black energy|oshee/i, n: { b3: 8, b5: 2, b6: 2, b12: 2, sodium: 100, b2: 0.5 } },
    { re: /sól kuchenna/i, n: { sodium: 38758, iodine: 2000 } },
    { re: /vegeta|przyprawa do kurczaka/i, n: { sodium: 15000, iron: 5, potassium: 500, magnesium: 50 } },
    { re: /piwo|garage|tyskie|żywiec jasne|lech |heineken|corona|desperados|somersby|harnaś|okocim/i, n: { b3: 0.5, potassium: 40, magnesium: 8, phosphorus: 30, b9: 6, b2: 0.03, sodium: 5, selenium: 1 } },
    { re: /wódka|wyborowa|soplica|żubrówka|jagermeister|baileys|prosecco|wino /i, n: { potassium: 70, magnesium: 8, phosphorus: 15, iron: 0.3, manganese: 0.1, copper: 30, b3: 0.1 } },
    { re: /oliwa|olej |smalec|tłuszcz kaczy|margaryna|masło/i, n: { vitE: 12, vitA: 40, vitK: 15, vitD: 0.2 } },
    { re: /czekolada gorzka|czekolada 100|czekolada mleczna|toblerone/i, n: { magnesium: 146, iron: 8, copper: 1200, manganese: 1.5, phosphorus: 200, zinc: 2 } },
    { re: /snickers|mars|twix|bounty|kit.?kat|lion|milky way|kinder|prince polo|3 bit|pawełek|grześki|danusia|princessa|duplo|knoppers/i, n: { magnesium: 40, iron: 1.2, calcium: 80, phosphorus: 100, sodium: 180 } },
    { re: /guseppe|feliciana|ristorante|wagner|don peppe|dzik protein pizza|pizza /i, n: { calcium: 160, sodium: 550, phosphorus: 160, iron: 1.5, zinc: 1.8, b1: 0.2, b12: 0.5, vitA: 50 } },
    { re: /big mac|whopper|cheeseburger|hamburger|kebab|hot.?dog|burrito|wrap |tacos|quesadilla|shawarma|falafel/i, n: { sodium: 600, iron: 2, zinc: 2.5, phosphorus: 150, calcium: 100, b12: 0.8, b3: 4 } },
    { re: /frytki/i, n: { potassium: 450, sodium: 300, vitC: 5, phosphorus: 80, magnesium: 25 } },
    { re: /rosół|żurek|barszcz|pomidorowa|ogórkowa|krupnik|grochówka|kapuśniak|flaki|zupa /i, n: { sodium: 380, potassium: 180, vitA: 50, phosphorus: 40, iron: 0.5 } },
    { re: /pierogi|gołąbki|bigos|kotlet|schabowy|kopytka|kluski|pyzy|naleśniki|placki|krokiety|golonka|żeberka/i, n: { sodium: 450, iron: 1.3, phosphorus: 120, zinc: 1.5, b1: 0.2, potassium: 220 } },
    { re: /ketchup|majonez|musztarda|sos /i, n: { sodium: 900, vitC: 5, vitA: 30, potassium: 100 } },
    { re: /cynamon|kurkuma|oregano|bazylia|majeranek|tymianek|pieprz|papryka ostra|papryka słodka|chili|imbir mielony|kminek|ziele angielskie|liść laurowy|gałka|czosnek granulowany|zioła prowansalskie/i, n: { manganese: 8, iron: 15, calcium: 600, copper: 500, magnesium: 150, potassium: 1000 } },
];

function merge(a, b) {
    const out = { ...a };
    for (const [k, v] of Object.entries(b || {})) {
        if (typeof v === 'number' && !Number.isNaN(v)) out[k] = v;
    }
    return out;
}

/**
 * @param {{ name: string, category: string, slug?: string, micros?: string }} product
 * @param {Record<string, number>|null} override — z API / ręczny override
 */
export function buildMicrosForProduct(product, override = null) {
    let profile = { ...(CATEGORY_BASE[product.category] || {}) };
    const name = String(product.name || '');
    for (const rule of NAME_RULES) {
        if (rule.re.test(name)) {
            profile = merge(profile, rule.n);
            break;
        }
    }
    if (override) profile = merge(profile, override);
    // Usuń pola pomocnicze
    delete profile.fiberHint;
    delete profile.vitB1;
    return cleanMicros(profile);
}

export { CATEGORY_BASE, NAME_RULES };
