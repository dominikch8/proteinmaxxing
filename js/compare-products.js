(function () {
    const COMPARE_METRICS = [
        { key: 'kcal', label: 'Kalorie', unit: 'kcal', icon: '🔥', decimals: 0, higherIsBetter: false, hint: 'mniej = lepiej' },
        { key: 'protein', label: 'Białko', unit: 'g', icon: '💪', decimals: 1, higherIsBetter: true, hint: 'więcej = lepiej' },
        { key: 'carbs', label: 'Węglowodany', unit: 'g', icon: '🌾', decimals: 1, neutral: true, hint: 'zależy od celu', hintKind: 'goal' },
        { key: 'fat', label: 'Tłuszcz', unit: 'g', icon: '🥑', decimals: 1, neutral: true, hint: 'zależy od celu', hintKind: 'goal' },
        {
            key: 'proteinPerKcal',
            label: 'Białko do kcal',
            labelFull: 'kcal na 1 g białka',
            unit: 'kcal/g białka',
            icon: '⚡',
            decimals: 1,
            higherIsBetter: false,
            hint: 'mniej = lepiej',
            compute(product) {
                if (!product || !(product.protein > 0)) return null;
                return product.kcal / product.protein;
            }
        },
        {
            key: 'unsatSatRatio',
            label: 'Nienasycone do nasyconych',
            labelFull: 'Nienasycone do nasyconych',
            unit: ':1',
            icon: '🫒',
            decimals: 1,
            format: 'ratio',
            higherIsBetter: true,
            hint: 'więcej = lepiej',
            compute(product) {
                if (!product || !(product.satFat > 0)) return null;
                return product.unsatFat / product.satFat;
            }
        }
    ];

    const KPI_METRICS = COMPARE_METRICS;

    /** Kolejność kategorii w podpowiedziach — fast food i polskie obiadki na górze. */
    const SUGGESTION_CATEGORY_ORDER = [
        'fastfood',
        'polskie-obiadki',
        ...CATEGORY_ORDER.filter((id) => id !== 'fastfood' && id !== 'polskie-obiadki')
    ];


    if (typeof productsDatabase === 'undefined') return;

    const state = { a: null, b: null };

    const slots = {
        a: {
            search: document.getElementById('compareSearchA'),
            suggestions: document.getElementById('compareSuggestionsA'),
            chip: document.getElementById('compareChipA'),
            field: document.querySelector('[data-slot="a"] .compare-field')
        },
        b: {
            search: document.getElementById('compareSearchB'),
            suggestions: document.getElementById('compareSuggestionsB'),
            chip: document.getElementById('compareChipB'),
            field: document.querySelector('[data-slot="b"] .compare-field')
        }
    };

    const emptyEl = document.getElementById('compareEmpty');
    const sectionEl = document.getElementById('compareChartSection');
    const chartEl = document.getElementById('compareChart');
    const legendEl = document.getElementById('compareLegend');
    const tableBody = document.getElementById('compareTableBody');
    const thA = document.getElementById('compareThA');
    const thB = document.getElementById('compareThB');
    const swapBtn = document.getElementById('compareSwapBtn');

    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function getProductBySlug(slug) {
        if (!slug) return null;
        return productsDatabase.find((p) => p.slug === slug) || null;
    }

    function formatValue(value, decimals) {
        const n = Number(value);
        if (Number.isNaN(n)) return '—';
        return n.toLocaleString('pl-PL', {
            minimumFractionDigits: 0,
            maximumFractionDigits: decimals ?? 1
        });
    }

    function formatWithUnit(value, unit, decimals) {
        const v = formatValue(value, decimals);
        return v === '—' ? v : `${v} ${unit}`;
    }

    function productSummary(p) {
        return `${p.kcal} kcal · ${p.protein} g białka · ${p.carbs} g węgli · ${p.fat} g tłuszczu`;
    }

    function getSuggestionProducts(query) {
        const q = query.toLowerCase().trim();
        let pool = productsDatabase;
        if (q) {
            pool = pool.filter((p) => p.name.toLowerCase().includes(q));
        }
        return [...pool];
    }

    function categoryLabel(catId) {
        return CATEGORY_SELECT_LABELS_DIETA[catId] || CATEGORY_LABELS[catId] || catId;
    }

    function groupProductsByCategory(products) {
        const byCat = new Map();
        for (const p of products) {
            if (!byCat.has(p.category)) byCat.set(p.category, []);
            byCat.get(p.category).push(p);
        }

        const groups = [];
        const used = new Set();

        for (const catId of SUGGESTION_CATEGORY_ORDER) {
            const list = byCat.get(catId);
            if (!list?.length) continue;
            list.sort((a, b) => a.name.localeCompare(b.name, 'pl'));
            groups.push({ category: catId, products: list });
            used.add(catId);
        }

        const rest = [...byCat.keys()]
            .filter((id) => !used.has(id))
            .sort((a, b) => categoryLabel(a).localeCompare(categoryLabel(b), 'pl'));

        for (const catId of rest) {
            const list = byCat.get(catId);
            list.sort((a, b) => a.name.localeCompare(b.name, 'pl'));
            groups.push({ category: catId, products: list });
        }

        return groups;
    }

    function layoutSuggestions(slotKey) {
        const { search, suggestions: ul } = slots[slotKey];
        if (!search || !ul || ul.hidden) return;

        const rect = search.getBoundingClientRect();
        const gap = 4;
        const bottomPad = 16;
        const top = rect.bottom + gap;
        const maxHeight = Math.max(160, window.innerHeight - top - bottomPad);

        ul.style.top = `${top}px`;
        ul.style.left = `${rect.left}px`;
        ul.style.width = `${rect.width}px`;
        ul.style.maxHeight = `${maxHeight}px`;
    }

    function scheduleLayoutSuggestions() {
        window.requestAnimationFrame(() => {
            if (!slots.a.suggestions?.hidden) layoutSuggestions('a');
            if (!slots.b.suggestions?.hidden) layoutSuggestions('b');
        });
    }

    function openSuggestions(slotKey) {
        const search = slots[slotKey]?.search;
        if (!search || search.hidden) return;
        showSuggestions(slotKey, getSuggestionProducts(search.value));
    }

    function hideSuggestions(slotKey) {
        const ul = slots[slotKey].suggestions;
        if (ul) ul.hidden = true;
    }

    function showSuggestions(slotKey, items) {
        const ul = slots[slotKey].suggestions;
        if (!ul) return;
        if (!items.length) {
            ul.hidden = true;
            ul.innerHTML = '';
            return;
        }
        const groups = groupProductsByCategory(items);
        ul.innerHTML = groups
            .map(
                (g) => `
            <li class="compare-suggestions-cat" role="presentation">${escapeHtml(categoryLabel(g.category))}</li>
            ${g.products
                .map(
                    (p) => `<li>
                <button type="button" data-slug="${escapeHtml(p.slug)}">
                    <span class="sug-emoji" aria-hidden="true">${p.emoji}</span>
                    <span>
                        <span>${escapeHtml(p.name)}</span>
                        <span class="sug-meta">${escapeHtml(productSummary(p))}</span>
                    </span>
                </button>
            </li>`
                )
                .join('')}`
            )
            .join('');
        ul.hidden = false;
        layoutSuggestions(slotKey);
    }

    function renderSelectedCard(slotKey, product) {
        const { search: input, chip, field } = slots[slotKey];
        if (!chip || !field) return;

        const emojiEl = chip.querySelector('.compare-chip-emoji');
        const nameEl = chip.querySelector('.compare-chip-name');

        if (!product) {
            chip.hidden = true;
            field.classList.remove('compare-field--filled');
            if (input) {
                input.value = '';
                input.hidden = false;
            }
            return;
        }

        if (emojiEl) emojiEl.textContent = product.emoji;
        if (nameEl) nameEl.textContent = product.name;
        chip.hidden = false;
        field.classList.add('compare-field--filled');
        if (input) {
            input.value = '';
            input.hidden = true;
        }
    }

    function beginProductChange(slotKey) {
        renderSelectedCard(slotKey, null);
        hideSuggestions(slotKey);
        window.requestAnimationFrame(() => {
            slots[slotKey].search?.focus();
            openSuggestions(slotKey);
        });
    }

    function setProduct(slotKey, product) {
        state[slotKey] = product;
        renderSelectedCard(slotKey, product);
        hideSuggestions(slotKey);
        syncUrl();
        renderComparison();
    }

    function syncUrl() {
        const params = new URLSearchParams();
        if (state.a?.slug) params.set('a', state.a.slug);
        if (state.b?.slug) params.set('b', state.b.slug);
        const qs = params.toString();
        const next = qs
            ? `${window.location.pathname}?${qs}`
            : window.location.pathname;
        history.replaceState(null, '', next);
    }

    function readUrlProducts() {
        const params = new URLSearchParams(window.location.search);
        state.a = getProductBySlug(params.get('a'));
        state.b = getProductBySlug(params.get('b'));
        renderSelectedCard('a', state.a);
        renderSelectedCard('b', state.b);
        syncUrl();
        renderComparison();
    }

    function getMetricDef(key) {
        return COMPARE_METRICS.find((m) => m.key === key);
    }

    function metricRaw(product, key) {
        const def = getMetricDef(key);
        if (!def || !product) return null;
        if (def.compute) return def.compute(product);
        const n = Number(product[key]);
        return Number.isFinite(n) ? n : null;
    }

    function metricNumeric(product, key) {
        const v = metricRaw(product, key);
        return v == null ? 0 : v;
    }

    function formatRatioCompact(value, decimals) {
        const n = formatValue(value, decimals);
        return `<span class="compare-metric-ratio"><span class="compare-metric-ratio-n">${n}</span><span class="compare-metric-ratio-sep">:</span><span class="compare-metric-ratio-denom">1</span></span>`;
    }

    function formatRatioPlain(value, decimals) {
        return `${formatValue(value, decimals)}:1`;
    }

    function formatMetricLabel(product, m) {
        const v = metricRaw(product, m.key);
        if (v == null) return '—';
        if (m.format === 'ratio') {
            return formatRatioCompact(v, m.decimals);
        }
        return formatWithUnit(v, m.unit, m.decimals);
    }

    function formatMetricScaleMax(m, max) {
        if (m.format === 'ratio') {
            return formatRatioPlain(max, m.decimals);
        }
        return `${formatValue(max, m.decimals)} ${m.unit}`;
    }

    function hintKindForMetric(m) {
        if (m.hintKind) return m.hintKind;
        if (m.higherIsBetter === true) return 'more';
        return 'less';
    }

    function metricWinner(va, vb, key, rawA, rawB) {
        const def = getMetricDef(key);
        if (def?.neutral) return null;
        if (rawA == null && rawB == null) return null;
        if (rawA == null) return 'b';
        if (rawB == null) return 'a';
        if (va === vb) return null;
        const higherBetter = def?.higherIsBetter === true;
        if (higherBetter) return va > vb ? 'a' : 'b';
        return va < vb ? 'a' : 'b';
    }

    function renderLegend() {
        if (!legendEl) return;
        legendEl.innerHTML = `
            <span class="compare-legend-pill compare-legend-pill--a">Produkt A</span>
            <span class="compare-legend-pill compare-legend-pill--b">Produkt B</span>
        `;
    }

    function renderKpiGrid(a, b) {
        const cards = KPI_METRICS.map((m) => {
            const rawA = metricRaw(a, m.key);
            const rawB = metricRaw(b, m.key);
            const va = rawA ?? 0;
            const vb = rawB ?? 0;
            const winner = metricWinner(va, vb, m.key, rawA, rawB);

            return `
                <div class="compare-kpi-card${m.key === 'unsatSatRatio' ? ' compare-kpi-card--unsat-sat' : ''}">
                    <span class="compare-kpi-icon" aria-hidden="true">${m.icon}</span>
                    <span class="compare-kpi-name">${escapeHtml(m.label)}</span>
                    <div class="compare-kpi-row">
                        <span class="compare-kpi-val compare-kpi-val--a${m.format === 'ratio' ? ' compare-kpi-val--ratio' : ''}${winner === 'a' ? ' is-winner' : ''}">${formatMetricLabel(a, m)}</span>
                        <span class="compare-kpi-vs" aria-hidden="true">vs</span>
                        <span class="compare-kpi-val compare-kpi-val--b${m.format === 'ratio' ? ' compare-kpi-val--ratio' : ''}${winner === 'b' ? ' is-winner' : ''}">${formatMetricLabel(b, m)}</span>
                    </div>
                </div>`;
        }).join('');

        return `<div class="compare-kpi-grid" role="group" aria-label="Podsumowanie makro">${cards}</div>`;
    }

    function axisMaxForMetric(key, va, vb) {
        const m = Math.max(va, vb, 0.001);
        if (key === 'kcal') return Math.ceil(m / 50) * 50 || 50;
        return Math.ceil(m * 10) / 10 || 1;
    }

    function buildGlassBarParts(slot, pct, label, isWinner, productName) {
        const fillW = pct > 0 ? pct : 0;
        return {
            slot: `
                <div class="compare-glass-slot compare-glass-slot--${slot}">
                    <span class="compare-glass-slot-tag">${slot.toUpperCase()}</span>
                    <span class="compare-glass-slot-name">${escapeHtml(productName)}</span>
                </div>`,
            track: `
                <div class="compare-glass-track compare-glass-track--${slot}">
                    <div class="compare-glass-fill compare-glass-fill--${slot}${isWinner ? ' is-winner' : ''}" style="width:${fillW}%"></div>
                    <span class="compare-glass-fill-val">${label}</span>
                </div>`
        };
    }

    function buildGlassBarsGrid(aName, bName, pctA, labelA, winA, pctB, labelB, winB, hintText) {
        const partsA = buildGlassBarParts('a', pctA, labelA, winA, aName);
        const partsB = buildGlassBarParts('b', pctB, labelB, winB, bName);
        const hintEl = hintText
            ? `<p class="compare-glass-hint compare-glass-hint--${hintText.kind}" role="note">${escapeHtml(hintText.text)}</p>`
            : '';

        return `
            <div class="compare-glass-metric-body">
                <div class="compare-glass-labels-col">
                    ${partsA.slot}
                    ${partsB.slot}
                </div>
                <div class="compare-glass-tracks-col${hintText ? ' compare-glass-tracks-col--hint' : ''}">
                    ${hintEl}
                    ${partsA.track}
                    ${partsB.track}
                </div>
            </div>`;
    }

    function buildGlassBarsHtml(a, b) {
        const rows = COMPARE_METRICS.map((m) => {
            const rawA = metricRaw(a, m.key);
            const rawB = metricRaw(b, m.key);
            const va = rawA ?? 0;
            const vb = rawB ?? 0;
            const max = axisMaxForMetric(m.key, va, vb);
            const pctA = rawA != null && max > 0 ? Math.round((va / max) * 100) : 0;
            const pctB = rawB != null && max > 0 ? Math.round((vb / max) * 100) : 0;
            const winA = metricWinner(va, vb, m.key, rawA, rawB) === 'a';
            const winB = metricWinner(va, vb, m.key, rawA, rawB) === 'b';
            const labelA = formatMetricLabel(a, m);
            const labelB = formatMetricLabel(b, m);

            const hintText = m.hint
                ? { text: m.hint, kind: hintKindForMetric(m) }
                : null;

            return `
                <div class="compare-glass-row${m.hint ? ' compare-glass-row--has-hint' : ''}">
                    <div class="compare-glass-row-head">
                        <span class="compare-glass-metric-icon" aria-hidden="true">${m.icon}</span>
                        <span class="compare-glass-metric-name">${escapeHtml(m.label)}</span>
                        <span class="compare-glass-metric-max">skala 0–${escapeHtml(formatMetricScaleMax(m, max))}</span>
                    </div>
                    ${buildGlassBarsGrid(a.name, b.name, pctA, labelA, winA, pctB, labelB, winB, hintText)}
                </div>`;
        }).join('');

        return `
            <div class="compare-glass-chart" role="img" aria-label="Wykres składników na 100 g: ${escapeHtml(a.name)} i ${escapeHtml(b.name)}">
                ${rows}
            </div>`;
    }

    function renderChart(a, b) {
        if (!chartEl) return;

        chartEl.setAttribute(
            'aria-label',
            `Porównanie ${a.name} i ${b.name}: makro, kcal na 1 g białka i stosunek tłuszczu nienasyconego do nasyconego na 100 g`
        );

        chartEl.innerHTML = `
            ${renderKpiGrid(a, b)}
            <div class="compare-glass-panel">
                ${buildGlassBarsHtml(a, b)}
            </div>
            <p class="compare-chart-footnote">Wszystkie wartości na 100 g produktu.</p>`;
    }

    function renderTable(a, b) {
        if (!tableBody) return;
        if (thA) thA.textContent = a.name;
        if (thB) thB.textContent = b.name;

        tableBody.innerHTML = COMPARE_METRICS.map((m) => {
            const rawA = metricRaw(a, m.key);
            const rawB = metricRaw(b, m.key);
            const va = rawA ?? 0;
            const vb = rawB ?? 0;
            const winA = metricWinner(va, vb, m.key, rawA, rawB) === 'a';
            const winB = metricWinner(va, vb, m.key, rawA, rawB) === 'b';
            return `<tr>
                <th scope="row">${escapeHtml(m.labelFull || m.label)}</th>
                <td class="${winA ? 'cell-winner cell-winner--a' : ''}">${formatMetricLabel(a, m)}</td>
                <td class="${winB ? 'cell-winner cell-winner--b' : ''}">${formatMetricLabel(b, m)}</td>
            </tr>`;
        }).join('');

        const microA = a.micros && a.micros !== '-' ? a.micros : '—';
        const microB = b.micros && b.micros !== '-' ? b.micros : '—';
        tableBody.insertAdjacentHTML(
            'beforeend',
            `<tr>
                <th scope="row">Witaminy i minerały</th>
                <td>${escapeHtml(microA)}</td>
                <td>${escapeHtml(microB)}</td>
            </tr>`
        );
    }

    function renderComparison() {
        const { a, b } = state;
        if (!a || !b) {
            if (emptyEl) emptyEl.hidden = false;
            if (sectionEl) sectionEl.hidden = true;
            return;
        }
        if (emptyEl) emptyEl.hidden = true;
        if (sectionEl) {
            sectionEl.hidden = false;
            sectionEl.classList.add('compare-chart-section--mounted');
        }
        renderLegend();
        renderChart(a, b);
        renderTable(a, b);
    }

    function bindSlot(slotKey) {
        const { search, suggestions } = slots[slotKey];
        if (!search) return;

        search.addEventListener('input', () => openSuggestions(slotKey));

        search.addEventListener('focus', () => openSuggestions(slotKey));

        search.addEventListener('click', () => openSuggestions(slotKey));

        const picker = search.closest('.compare-picker');
        const label = picker?.querySelector('.compare-picker-label');
        label?.addEventListener('click', () => {
            window.requestAnimationFrame(() => openSuggestions(slotKey));
        });

        suggestions?.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-slug]');
            if (!btn) return;
            const product = getProductBySlug(btn.dataset.slug);
            if (product) setProduct(slotKey, product);
        });

        search.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') hideSuggestions(slotKey);
        });
    }

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.compare-search-wrap')) {
            hideSuggestions('a');
            hideSuggestions('b');
        }
        const changeBtn = e.target.closest('.compare-chip-clear');
        if (changeBtn) {
            const key = changeBtn.dataset.clear;
            if (key) beginProductChange(key);
        }
    });

    swapBtn?.addEventListener('click', () => {
        const tmp = state.a;
        setProduct('a', state.b);
        setProduct('b', tmp);
    });

    bindSlot('a');
    bindSlot('b');
    window.addEventListener('resize', scheduleLayoutSuggestions);
    window.addEventListener('scroll', scheduleLayoutSuggestions, true);
    readUrlProducts();
})();
