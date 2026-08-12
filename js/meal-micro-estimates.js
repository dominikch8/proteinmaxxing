/**
 * Orientacyjne mikroskładniki na 100 g — heurystyki po nazwie/kategorii.
 * Szacunki typowe (nie etykieta produktu).
 */
(function () {
    const CATEGORY_BASE = {
        mieso: { b3: 5, b6: 0.35, b12: 1.2, phosphorus: 180, zinc: 2.5, iron: 1.4, selenium: 18, potassium: 280, manganese: 0.03 },
        nabial: { calcium: 120, b2: 0.2, b12: 0.5, phosphorus: 100, potassium: 150, zinc: 0.5, manganese: 0.02 },
        sery: { calcium: 600, b2: 0.3, b12: 1.2, phosphorus: 450, zinc: 3, sodium: 600, vitA: 250, manganese: 0.05 },
        warzywa: { vitC: 25, potassium: 280, b9: 40, vitA: 80, vitK: 40, magnesium: 20, manganese: 0.3 },
        owoce: { vitC: 30, potassium: 200, b9: 20, vitA: 30, manganese: 0.1 },
        zboza: { b1: 0.25, magnesium: 50, iron: 1.5, phosphorus: 120, manganese: 1.2, b3: 2 },
        'platki-sniadaniowe': { iron: 4, b1: 0.5, b2: 0.5, b3: 5, b9: 100 },
        'polskie-obiadki': { sodium: 400, iron: 1, phosphorus: 100, potassium: 200 },
        zupy: { sodium: 350, potassium: 150, vitA: 40 },
        orzechy: { magnesium: 180, vitE: 8, zinc: 3, copper: 800, manganese: 2, phosphorus: 400, b1: 0.4 },
        tluszcze: { vitE: 15, vitA: 50 },
        makarony: { b1: 0.2, iron: 1.5, phosphorus: 120 },
        'mrozone-pizze': { calcium: 150, sodium: 500, b1: 0.15 },
        fastfood: { sodium: 500, iron: 1.2 },
        slodycze: { magnesium: 20, iron: 1 },
        batony: { magnesium: 30, iron: 1.2 },
        'batony-proteinowe': { calcium: 80, magnesium: 40 },
        sosy: { sodium: 700, vitC: 5 },
        napoje: { potassium: 20 },
        alkohole: { potassium: 30 },
        przyprawy: { sodium: 500, manganese: 2, iron: 5 },
    };

    const RULES = [
        { re: /pierś z kurczaka|piersi z kurczaka/i, n: { b3: 14, b6: 0.6, phosphorus: 220, selenium: 27, zinc: 0.7, potassium: 256, b12: 0.3 } },
        { re: /pierś z indyka|indyk/i, n: { b3: 11, b6: 0.8, phosphorus: 210, selenium: 25, zinc: 1.2, potassium: 280, b12: 0.4 } },
        { re: /wołowina|antrykot|biftek|tatar/i, n: { iron: 2.5, zinc: 5, b12: 2, b3: 5, b6: 0.4, phosphorus: 190, selenium: 20 } },
        { re: /łosoś|losos/i, n: { b12: 3.2, vitD: 11, selenium: 36, phosphorus: 250, b3: 8, potassium: 360, vitA: 40 } },
        { re: /tuńczyk|tunczyk/i, n: { b12: 2.2, selenium: 90, b3: 18, phosphorus: 220, vitD: 1.7 } },
        { re: /dorsz|pstrąg|makrela|śledź|sledz/i, n: { b12: 1.5, selenium: 30, phosphorus: 200, vitD: 4, iodine: 50 } },
        { re: /jajko|jajka|białka jaj/i, n: { b12: 1.1, choline: 250, vitA: 160, selenium: 30, b2: 0.45, phosphorus: 190, vitD: 2 } },
        { re: /twaróg|skyr|serek wiejski/i, n: { calcium: 90, phosphorus: 160, b12: 0.8, b2: 0.25, selenium: 10 } },
        { re: /jogurt|kefir|maślanka/i, n: { calcium: 120, b2: 0.2, b12: 0.4, phosphorus: 95, potassium: 150 } },
        { re: /mleko(?! skondens)/i, n: { calcium: 120, b2: 0.18, b12: 0.4, phosphorus: 90, potassium: 150 } },
        { re: /gouda|mozzarella|feta|parmezan|cheddar|emmental|camembert|halloumi|ser /i, n: { calcium: 700, phosphorus: 500, b12: 1.5, zinc: 3.5, vitA: 280, sodium: 650 } },
        { re: /szpinak/i, n: { vitK: 483, vitA: 469, vitC: 28, iron: 2.7, magnesium: 79, b9: 194, potassium: 558 } },
        { re: /brokuł/i, n: { vitC: 89, vitK: 102, b9: 63, potassium: 316, vitA: 31 } },
        { re: /papryka/i, n: { vitC: 128, vitA: 157, b6: 0.3, potassium: 211 } },
        { re: /marchew/i, n: { vitA: 835, vitK: 13, potassium: 320, vitC: 6 } },
        { re: /pomidor/i, n: { vitC: 14, potassium: 237, vitA: 42, vitK: 8 } },
        { re: /banan/i, n: { potassium: 358, b6: 0.4, vitC: 9, magnesium: 27 } },
        { re: /pomarańcz|kiwi|truskawk|malin|borówk/i, n: { vitC: 53, potassium: 180, b9: 30 } },
        { re: /jabłk|gruszk/i, n: { vitC: 5, potassium: 110 } },
        { re: /awokado/i, n: { potassium: 485, vitE: 2, b9: 81, magnesium: 29, vitK: 21 } },
        { re: /płatki owsiane|owsian/i, n: { magnesium: 138, iron: 4.2, b1: 0.5, phosphorus: 410, zinc: 3.6, manganese: 3.6 } },
        { re: /ryż|kasza|quinoa|komosa/i, n: { magnesium: 40, b1: 0.15, phosphorus: 100, manganese: 0.8 } },
        { re: /chleb|bułka|bagiet/i, n: { b1: 0.25, iron: 2, sodium: 450, phosphorus: 100 } },
        { re: /orzech|migdał|pistacj|nerkowc|laskow/i, n: { magnesium: 200, vitE: 10, zinc: 3, copper: 900, manganese: 2.2 } },
        { re: /chia|lnian|słonecznika|pestki/i, n: { magnesium: 300, phosphorus: 600, zinc: 4, copper: 1200, manganese: 2.5 } },
        { re: /czekolad|kakao/i, n: { magnesium: 80, iron: 4, copper: 800, manganese: 1 } },
        { re: /wątrób|watrob/i, n: { vitA: 6500, b12: 50, iron: 9, copper: 5000, b2: 2, choline: 350 } },
        { re: /szynka|kiełbasa|parówk|boczek/i, n: { sodium: 900, b1: 0.4, zinc: 2, iron: 1 } },
        { re: /coca-cola|pepsi|fanta|sprite|mirinda|ice tea|nestea/i, n: { sodium: 5, potassium: 5 } },
        { re: /kawa czarna|herbata czarna|^woda$|żywiec zdrój|cisowianka/i, n: { potassium: 50 } },
        { re: /sok pomarańcz/i, n: { vitC: 50, potassium: 200, b9: 30 } },
        { re: /sól kuchenna/i, n: { sodium: 38700 } },
        { re: /vegeta|przyprawa do kurczaka/i, n: { sodium: 15000 } },
        { re: /piwo|garage|tyskie|żywiec jasne|lech |heineken|corona|desperados|somersby|harnaś|okocim/i, n: { b3: 0.5, potassium: 40, magnesium: 8 } },
    ];

    const LABEL_TO_KEY = [
        [/wit\.?\s*a\b|witamina a/i, 'vitA'],
        [/b1|tiamina/i, 'b1'],
        [/b2|ryboflawina/i, 'b2'],
        [/b3|niacyna/i, 'b3'],
        [/b5|pantoten/i, 'b5'],
        [/b6|pirydoksyn/i, 'b6'],
        [/b7|biotyna/i, 'b7'],
        [/b9|folian|kwas foliowy|foliany/i, 'b9'],
        [/b12|kobalamin/i, 'b12'],
        [/wit\.?\s*c\b|witamina c/i, 'vitC'],
        [/wit\.?\s*d\b|witamina d/i, 'vitD'],
        [/wit\.?\s*e\b|witamina e/i, 'vitE'],
        [/wit\.?\s*k\b|witamina k/i, 'vitK'],
        [/cholina/i, 'choline'],
        [/wapń|wapn/i, 'calcium'],
        [/żelazo|zelazo/i, 'iron'],
        [/magnez/i, 'magnesium'],
        [/fosfor/i, 'phosphorus'],
        [/potas/i, 'potassium'],
        [/cynk/i, 'zinc'],
        [/selen/i, 'selenium'],
        [/miedź|miedz/i, 'copper'],
        [/mangan/i, 'manganese'],
        [/jod/i, 'iodine'],
        [/sód|sod\b/i, 'sodium'],
    ];

    const LABEL_DEFAULTS = {
        vitA: 80, b1: 0.2, b2: 0.2, b3: 3, b5: 0.5, b6: 0.2, b7: 5, b9: 40, b12: 0.5,
        vitC: 20, vitD: 1, vitE: 2, vitK: 30, choline: 50,
        calcium: 50, iron: 1, magnesium: 25, phosphorus: 80, potassium: 150,
        zinc: 1, selenium: 8, copper: 100, manganese: 0.4, iodine: 10, sodium: 50,
    };

    function merge(a, b) {
        const out = { ...a };
        for (const [k, v] of Object.entries(b || {})) {
            if (typeof v === 'number') out[k] = v;
        }
        return out;
    }

    function estimateMicrosPer100g(product) {
        if (!product) return {};
        // Preferuj dokładne wartości z bazy (microsDetail), jeśli są
        if (product.microsDetail && typeof product.microsDetail === 'object') {
            const keys = Object.keys(product.microsDetail);
            if (keys.length >= 4) return { ...product.microsDetail };
        }
        if (window.PRODUCT_MICROS_DATA && product.slug && window.PRODUCT_MICROS_DATA[product.slug]) {
            return { ...window.PRODUCT_MICROS_DATA[product.slug] };
        }
        let profile = { ...(CATEGORY_BASE[product.category] || {}) };
        const name = String(product.name || '');
        for (const rule of RULES) {
            if (rule.re.test(name)) {
                profile = merge(profile, rule.n);
                break;
            }
        }
        const microsText = String(product.micros || '');
        if (microsText && microsText !== '-') {
            for (const [re, key] of LABEL_TO_KEY) {
                if (re.test(microsText) && profile[key] == null) {
                    profile[key] = LABEL_DEFAULTS[key];
                }
            }
        }
        return profile;
    }

    function scaleMicros(per100, grams) {
        const factor = (Number(grams) || 0) / 100;
        const out = {};
        for (const [k, v] of Object.entries(per100 || {})) {
            if (typeof v === 'number') out[k] = v * factor;
        }
        return out;
    }

    window.estimateMicrosPer100g = estimateMicrosPer100g;
    window.scaleMicros = scaleMicros;
})();
