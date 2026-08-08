/**
 * Wspólny schemat witamin/minerałów + RDA (dorosły) + formatowanie.
 * Wartości RDA zbliżone do USDA / praktyki kalkulatora Proteiner.
 */

export const MICRO_KEYS_ORDER = [
    'vitA', 'vitC', 'vitD', 'vitE', 'vitK',
    'b1', 'b2', 'b3', 'b5', 'b6', 'b7', 'b9', 'b12',
    'choline',
    'calcium', 'iron', 'magnesium', 'phosphorus', 'potassium',
    'zinc', 'selenium', 'copper', 'manganese', 'iodine', 'sodium',
];

export const MICRO_META = {
    vitA: { label: 'Witamina A', unit: 'µg', rdaMale: 900, rdaFemale: 700 },
    b1: { label: 'Witamina B1 (tiamina)', unit: 'mg', rdaMale: 1.2, rdaFemale: 1.1 },
    b2: { label: 'Witamina B2 (ryboflawina)', unit: 'mg', rdaMale: 1.3, rdaFemale: 1.1 },
    b3: { label: 'Witamina B3 (niacyna)', unit: 'mg', rdaMale: 16, rdaFemale: 14 },
    b5: { label: 'Witamina B5', unit: 'mg', rdaMale: 5, rdaFemale: 5 },
    b6: { label: 'Witamina B6', unit: 'mg', rdaMale: 1.7, rdaFemale: 1.5 },
    b7: { label: 'Witamina B7 (biotyna)', unit: 'µg', rdaMale: 30, rdaFemale: 30 },
    b9: { label: 'Witamina B9 (foliany)', unit: 'µg', rdaMale: 400, rdaFemale: 400 },
    b12: { label: 'Witamina B12', unit: 'µg', rdaMale: 2.4, rdaFemale: 2.4 },
    vitC: { label: 'Witamina C', unit: 'mg', rdaMale: 90, rdaFemale: 75 },
    vitD: { label: 'Witamina D', unit: 'µg', rdaMale: 15, rdaFemale: 15 },
    vitE: { label: 'Witamina E', unit: 'mg', rdaMale: 15, rdaFemale: 15 },
    vitK: { label: 'Witamina K', unit: 'µg', rdaMale: 120, rdaFemale: 90 },
    choline: { label: 'Cholina', unit: 'mg', rdaMale: 550, rdaFemale: 425 },
    calcium: { label: 'Wapń', unit: 'mg', rdaMale: 1000, rdaFemale: 1000 },
    iron: { label: 'Żelazo', unit: 'mg', rdaMale: 8, rdaFemale: 18 },
    magnesium: { label: 'Magnez', unit: 'mg', rdaMale: 420, rdaFemale: 320 },
    phosphorus: { label: 'Fosfor', unit: 'mg', rdaMale: 700, rdaFemale: 700 },
    potassium: { label: 'Potas', unit: 'mg', rdaMale: 3400, rdaFemale: 2600 },
    zinc: { label: 'Cynk', unit: 'mg', rdaMale: 11, rdaFemale: 8 },
    selenium: { label: 'Selen', unit: 'µg', rdaMale: 55, rdaFemale: 55 },
    copper: { label: 'Miedź', unit: 'µg', rdaMale: 900, rdaFemale: 900 },
    manganese: { label: 'Mangan', unit: 'mg', rdaMale: 2.3, rdaFemale: 1.8 },
    iodine: { label: 'Jod', unit: 'µg', rdaMale: 150, rdaFemale: 150 },
    sodium: { label: 'Sód', unit: 'mg', rdaMale: 2300, rdaFemale: 2300, isMax: true },
};

/** RDA używane na stronach produktów (średnia mężczyzna/kobieta; żelazo — kobieta). */
export function rdaForDisplay(key) {
    const m = MICRO_META[key];
    if (!m) return null;
    if (key === 'iron') return m.rdaFemale;
    return Math.round(((m.rdaMale + m.rdaFemale) / 2) * 1000) / 1000;
}

export function formatMicroAmount(value, unit) {
    if (value == null || Number.isNaN(value)) return '—';
    const n = Number(value);
    if (n === 0) return `0 ${unit}`;
    if (n >= 100) return `${Math.round(n)} ${unit}`;
    if (n >= 10) return `${Math.round(n * 10) / 10} ${unit}`;
    if (n >= 1) return `${Math.round(n * 100) / 100} ${unit}`;
    if (unit === 'µg') return `${Math.round(n * 10) / 10} ${unit}`;
    return `${Math.round(n * 1000) / 1000} ${unit}`;
}

export function pctOfRda(amount, key) {
    const rda = rdaForDisplay(key);
    if (!rda || amount == null) return 0;
    return (Number(amount) / rda) * 100;
}

export function pctClass(pct, isMax = false) {
    if (isMax) {
        if (pct >= 100) return 'is-high';
        if (pct >= 40) return 'is-ok';
        return 'is-low';
    }
    if (pct >= 100) return 'is-high';
    if (pct >= 20) return 'is-good';
    if (pct >= 8) return 'is-ok';
    return 'is-low';
}

export function roundMicro(key, value) {
    if (value == null || Number.isNaN(value)) return null;
    const n = Math.max(0, Number(value));
    const unit = MICRO_META[key]?.unit;
    if (unit === 'µg') {
        if (n >= 100) return Math.round(n);
        return Math.round(n * 10) / 10;
    }
    if (n >= 100) return Math.round(n);
    if (n >= 10) return Math.round(n * 10) / 10;
    if (n >= 1) return Math.round(n * 100) / 100;
    return Math.round(n * 1000) / 1000;
}

export function cleanMicros(obj) {
    const out = {};
    for (const key of MICRO_KEYS_ORDER) {
        if (obj[key] == null) continue;
        const v = roundMicro(key, obj[key]);
        if (v == null || v === 0) continue;
        out[key] = v;
    }
    return out;
}

export function microsToLabelString(micros) {
    const labels = [];
    for (const key of MICRO_KEYS_ORDER) {
        if (micros[key] == null) continue;
        const pct = pctOfRda(micros[key], key);
        if (pct < 5 && key !== 'sodium') continue;
        labels.push(MICRO_META[key].label.replace(/\s*\([^)]*\)/, ''));
        if (labels.length >= 5) break;
    }
    return labels.length ? labels.join(', ') : '-';
}
