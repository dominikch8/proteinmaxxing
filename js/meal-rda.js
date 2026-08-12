/**
 * Orientacyjne RDA/AI (dorosły) — wartości liczbowe do % zapotrzebowania.
 * Zgodne z tabelą w kalkulatorze BMI.
 */
window.MEAL_RDA = {
    vitA: { label: 'Witamina A', unit: 'mcg', male: 900, female: 700 },
    b1: { label: 'Witamina B1', unit: 'mg', male: 1.2, female: 1.1 },
    b2: { label: 'Witamina B2', unit: 'mg', male: 1.3, female: 1.1 },
    b3: { label: 'Witamina B3', unit: 'mg', male: 16, female: 14 },
    b5: { label: 'Witamina B5', unit: 'mg', male: 5, female: 5 },
    b6: { label: 'Witamina B6', unit: 'mg', male: 1.7, female: 1.5 },
    b7: { label: 'Witamina B7', unit: 'mcg', male: 30, female: 30 },
    b9: { label: 'Witamina B9 (foliany)', unit: 'mcg', male: 400, female: 400 },
    b12: { label: 'Witamina B12', unit: 'mcg', male: 2.4, female: 2.4 },
    vitC: { label: 'Witamina C', unit: 'mg', male: 90, female: 75 },
    vitD: { label: 'Witamina D', unit: 'mcg', male: 15, female: 15 },
    vitE: { label: 'Witamina E', unit: 'mg', male: 15, female: 15 },
    vitK: { label: 'Witamina K', unit: 'mcg', male: 120, female: 90 },
    choline: { label: 'Cholina', unit: 'mg', male: 550, female: 425 },
    calcium: { label: 'Wapń', unit: 'mg', male: 1000, female: 1000 },
    iron: { label: 'Żelazo', unit: 'mg', male: 8, female: 18 },
    magnesium: { label: 'Magnez', unit: 'mg', male: 420, female: 320 },
    phosphorus: { label: 'Fosfor', unit: 'mg', male: 700, female: 700 },
    potassium: { label: 'Potas', unit: 'mg', male: 3400, female: 2600 },
    zinc: { label: 'Cynk', unit: 'mg', male: 11, female: 8 },
    selenium: { label: 'Selen', unit: 'mcg', male: 55, female: 55 },
    copper: { label: 'Miedź', unit: 'mcg', male: 900, female: 900 },
    manganese: { label: 'Mangan', unit: 'mg', male: 2.3, female: 1.8 },
    iodine: { label: 'Jod', unit: 'mcg', male: 150, female: 150 },
    chromium: { label: 'Chrom', unit: 'mcg', male: 35, female: 25 },
    sodium: { label: 'Sód', unit: 'mg', male: 2300, female: 2300, isMax: true },
};

window.getMealRdaTarget = function getMealRdaTarget(key, gender) {
    const row = window.MEAL_RDA[key];
    if (!row) return null;
    return gender === 'female' ? row.female : row.male;
};
