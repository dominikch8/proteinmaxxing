/** Wspólne helpery dla generatora i kontekstu opisów. */

export function hashSlug(slug, salt = 0) {
    let h = salt ^ 0x811c9dc5;
    for (let i = 0; i < slug.length; i++) {
        h ^= slug.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
}

export function pick(arr, slug, salt = 0) {
    if (!arr.length) return '';
    return arr[hashSlug(slug, salt) % arr.length];
}

export function fmt(n) {
    const v = Number(n);
    return Number.isInteger(v) ? String(v) : v.toFixed(1).replace(/\.0$/, '');
}

export function servingPhrase(p) {
    if (p.servingText) return p.servingText;
    if (p.servingGrams) return `porcja ok. ${p.servingGrams} g`;
    if (p.servingRatio) return `porcja (${p.servingRatio} × 100 g)`;
    return 'porcja z tabeli powyżej';
}
