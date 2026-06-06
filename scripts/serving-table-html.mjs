export function getServingMacros(p) {
    if (!p || !(p.servingRatio > 0)) return null;
    const r = p.servingRatio;
    return {
        kcal: Math.round(p.kcal * r),
        protein: Number((p.protein * r).toFixed(1)),
        carbs: Number((p.carbs * r).toFixed(1)),
        fat: Number((p.fat * r).toFixed(1))
    };
}

/**
 * @param {object} p — produkt z servingText i servingRatio
 * @param {{ esc?: (s: string) => string, formatPrice?: (n: number) => string, compact?: boolean }} [opts]
 */
export function buildServingTableHtml(p, opts = {}) {
    if (!p?.servingText || !(p.servingRatio > 0)) return '';
    const m = getServingMacros(p);
    if (!m) return '';

    const esc = opts.esc || ((s) => String(s));
    const compact = opts.compact === true;
    const cls = compact ? 'serving-table serving-table--compact' : 'serving-table';
    const priceRow =
        p.servingPricePln != null && opts.formatPrice
            ? `<tr><th>Cena (szac.)</th><td>~${esc(opts.formatPrice(p.servingPricePln))}</td></tr>`
            : '';

    return `<div class="serving-table-wrap">
                    <p class="serving-table-caption">Porcja: <strong>${esc(p.servingText)}</strong></p>
                    <table class="${cls}">
                        <caption class="visually-hidden">Makroskładniki na porcję ${esc(p.servingText)}</caption>
                        <tbody>
                            <tr><th>Kalorie</th><td>${m.kcal} kcal</td></tr>
                            <tr><th>Białko</th><td>${m.protein} g</td></tr>
                            <tr><th>Węglowodany</th><td>${m.carbs} g</td></tr>
                            <tr><th>Tłuszcz</th><td>${m.fat} g</td></tr>
                            ${priceRow}
                        </tbody>
                    </table>
                </div>`;
}
