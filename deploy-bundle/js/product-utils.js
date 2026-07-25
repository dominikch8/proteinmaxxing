function slugify(name) {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/ą/g, 'a').replace(/ć/g, 'c').replace(/ę/g, 'e')
        .replace(/ł/g, 'l').replace(/ń/g, 'n').replace(/ó/g, 'o')
        .replace(/ś/g, 's').replace(/ź/g, 'z').replace(/ż/g, 'z')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/** Grams of protein per 100 kcal (higher = denser protein). */
function proteinPer100Kcal(p) {
    if (!p || !(p.kcal > 0) || !(p.protein > 0)) return null;
    return (p.protein / p.kcal) * 100;
}

const CATEGORY_LABELS = {
    mieso: 'Mięsa i ryby',
    nabial: 'Nabiał i jaja',
    warzywa: 'Warzywa',
    owoce: 'Owoce',
    zboza: 'Zboża i kasze',
    'polskie-obiadki': 'Polskie obiadki',
    zupy: 'Zupy',
    orzechy: 'Orzechy',
    tluszcze: 'Tłuszcze i oleje',
    makarony: 'Dania z makaronu',
    fastfood: 'Fast food',
    slodycze: 'Słodycze i przekąski',
    batony: 'Batony',
    sosy: 'Sosy'
};

/** Kolejność opcji w filtrach kategorii. */
const CATEGORY_ORDER = [
    'mieso',
    'nabial',
    'warzywa',
    'owoce',
    'zboza',
    'polskie-obiadki',
    'zupy',
    'orzechy',
    'tluszcze',
    'makarony',
    'fastfood',
    'slodycze',
    'batony',
    'sosy'
];

/** Etykiety w selectach na stronie diety (zgodne z dotychczasowym UI). */
const CATEGORY_SELECT_LABELS_DIETA = {
    mieso: 'Mięsa i Ryby',
    nabial: 'Nabiał i Jaja',
    warzywa: 'Warzywa',
    owoce: 'Owoce',
    zboza: 'Zboża i Kasze',
    'polskie-obiadki': 'Polskie obiadki',
    zupy: 'Zupy',
    orzechy: 'Orzechy',
    tluszcze: 'Tłuszcze i oleje',
    makarony: 'Dania z Makaronu',
    fastfood: 'Fast Food',
    slodycze: 'Słodycze i Przekąski',
    batony: 'Batony',
    sosy: 'Sosy'
};

/**
 * Wypełnia &lt;select&gt; opcjami kategorii z jednej bazy (CATEGORY_ORDER).
 * @param {HTMLSelectElement|null} selectEl
 * @param {{ includeAll?: boolean, includeTop10?: boolean, useDietaLabels?: boolean }} opts
 */
function populateCategorySelect(selectEl, opts = {}) {
    if (!selectEl) return;
    const { includeAll = true, includeTop10 = false, useDietaLabels = true } = opts;
    const prev = selectEl.value;
    const parts = [];
    if (includeAll) {
        parts.push('<option value="all">Wszystkie kategorie</option>');
    }
    for (const id of CATEGORY_ORDER) {
        const label = useDietaLabels
            ? (CATEGORY_SELECT_LABELS_DIETA[id] || CATEGORY_LABELS[id])
            : CATEGORY_LABELS[id];
        parts.push(`<option value="${id}">${label}</option>`);
    }
    if (includeTop10) {
        parts.push('<option value="top10">Top 10🏆</option>');
    }
    selectEl.innerHTML = parts.join('');
    if ([...selectEl.options].some((o) => o.value === prev)) {
        selectEl.value = prev;
    }
}

function enrichProducts(raw) {
    const seen = {};
    return raw.map((p) => {
        let base = p.slug && String(p.slug).trim() ? String(p.slug).trim() : slugify(p.name);
        let slug = base;
        let n = 2;
        while (seen[slug]) {
            slug = `${base}-${p.category || 'x'}`;
            if (seen[slug]) slug = `${base}-${n++}`;
        }
        seen[slug] = true;
        return { ...p, slug };
    });
}

function categoryPageUrl(category) {
    if (!category || category === 'all') return 'dieta#produkty';
    return `dieta#produkty/kategoria/${encodeURIComponent(category)}`;
}

function productPageUrl(slug) {
    return `produkty/${slug}`;
}

function productImagePaths(slug) {
    return {
        jpg: `../images/products/${slug}.jpg`,
        webp: `../images/products/${slug}.webp`,
        placeholder: '../images/products/placeholder.svg'
    };
}

function getProductImageSrc(slug, imageMap) {
    if (imageMap && imageMap[slug]) return imageMap[slug];
    return productImagePaths(slug).jpg;
}

/** PLN za 100 g produktu — szacunek z ceny i wagi porcji. */
function foodPricePer100g(p) {
    if (!p) return null;
    const grams = p.servingGrams > 0 ? p.servingGrams : p.servingRatio > 0 ? p.servingRatio * 100 : 0;
    if (grams > 0 && p.servingPricePln != null && p.servingPricePln >= 0) {
        return Math.round((p.servingPricePln / grams) * 10000) / 100;
    }
    return null;
}

/** PLN za 100 g czystego białka — z bazy lub z ceny porcji. */
function proteinPricePer100g(p) {
    if (!p) return null;
    if (p.pricePer100gProtein != null && p.pricePer100gProtein > 0) return p.pricePer100gProtein;
    if (p.servingPricePln && p.protein > 0 && p.servingRatio > 0) {
        return Math.round(((p.servingPricePln * 100) / (p.protein * p.servingRatio)) * 100) / 100;
    }
    return null;
}

function formatPln(value) {
    return `${Number(value).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł`;
}

function escapeHtmlText(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function getServingMacros(p) {
    if (!p || !(p.servingRatio > 0)) return null;
    const r = p.servingRatio;
    return {
        kcal: Math.round(p.kcal * r),
        protein: Number((p.protein * r).toFixed(1)),
        carbs: Number((p.carbs * r).toFixed(1)),
        fat: Number((p.fat * r).toFixed(1))
    };
}

function buildServingTableHtml(p, opts = {}) {
    if (!p?.servingText || !(p.servingRatio > 0)) return '';
    const m = getServingMacros(p);
    if (!m) return '';

    const compact = opts.compact === true;
    const cls = compact ? 'serving-table serving-table--compact' : 'serving-table';
    const priceRow =
        p.servingPricePln != null
            ? `<tr><th>Cena (szac.)</th><td>~${escapeHtmlText(formatPln(p.servingPricePln))}</td></tr>`
            : '';

    return `<div class="serving-table-wrap">
        <p class="serving-table-caption">Porcja: <strong>${escapeHtmlText(p.servingText)}</strong></p>
        <table class="${cls}">
            <caption class="visually-hidden">Makroskładniki na porcję ${escapeHtmlText(p.servingText)}</caption>
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
