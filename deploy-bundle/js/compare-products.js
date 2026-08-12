(async function () {
    const COMPARE_METRICS = [
        { key: 'kcal', label: 'Kalorie', unit: 'kcal', icon: '🔥', decimals: 0, higherIsBetter: false, hint: 'mniej = lepiej' },
        { key: 'protein', label: 'Białko', unit: 'g', icon: '💪', decimals: 1, higherIsBetter: true, hint: 'więcej = lepiej' },
        {
            key: 'proteinPerKcal',
            label: 'Białko / 100 kcal',
            labelFull: 'Białko na 100 kcal',
            unit: 'g / 100 kcal',
            icon: '⚡',
            decimals: 1,
            higherIsBetter: true,
            hint: 'więcej = lepiej',
            compute(product) {
                if (typeof proteinPer100Kcal === 'function') {
                    return proteinPer100Kcal(product);
                }
                if (!product || !(product.kcal > 0) || !(product.protein > 0)) return null;
                return (product.protein / product.kcal) * 100;
            }
        },
        { key: 'fat', label: 'Tłuszcz', unit: 'g', icon: '🥑', decimals: 1, higherIsBetter: false, hint: 'mniej = lepiej' },
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
        },
        /* Kontekstowe — na końcu, wizualnie bledsze */
        { key: 'carbs', label: 'Węglowodany', unit: 'g', icon: '🌾', decimals: 1, neutral: true, hint: 'zależy od celu', hintKind: 'goal' }
    ];

    const KPI_METRICS = COMPARE_METRICS;

    /** Kolejność kategorii w podpowiedziach — fast food i polskie obiadki na górze. */
    const SUGGESTION_CATEGORY_ORDER = [
        'fastfood',
        'polskie-obiadki',
        ...CATEGORY_ORDER.filter((id) => id !== 'fastfood' && id !== 'polskie-obiadki')
    ];

    /** Propozycje po kliknięciu pustego / otwartego pola. */
    const PROPOSED_SLUGS = [
        'piers-z-kurczaka',
        'twarog-poltlusty',
        'jajko-kurze-cale',
        'losos-atlantycki',
        'ryz-bialy',
        'kasza-gryczana',
        'jogurt-grecki-naturalny',
        'banan',
        'brokuly',
        'indyk-mielony',
        'tofu-naturalne',
        'wolowina-poledwica',
        'tunczyk-w-sosie-wlasnym',
        'platki-owsiane',
        'ser-cottage',
        'awokado'
    ];

    if (typeof ensureProductsDatabase === 'function') {
        await ensureProductsDatabase();
    } else if (typeof productsDatabase === 'undefined') {
        return;
    }

    const state = { a: null, b: null };
    const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    const matchupEl = document.getElementById('compareMatchup');
    const scorelineEl = document.getElementById('compareScoreline');
    const tableBody = document.getElementById('compareTableBody');
    const thA = document.getElementById('compareThA');
    const thB = document.getElementById('compareThB');
    const swapBtn = document.getElementById('compareSwapBtn');
    const copyLinkBtn = document.getElementById('compareCopyLinkBtn');
    const quickEl = document.getElementById('compareQuick');

    document.body.classList.add('is-ready');

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

    function productImageCandidates(slug) {
        if (!slug) return [];
        return [`images/products/${slug}.webp`, `images/products/${slug}.jpg`, `images/products/${slug}.png`];
    }

    function bindProductImage(imgEl, product) {
        if (!imgEl) return;
        imgEl.classList.remove('is-loaded');
        imgEl.removeAttribute('src');
        if (!product?.slug) return;

        const candidates = productImageCandidates(product.slug);
        let i = 0;

        const tryNext = () => {
            if (i >= candidates.length) {
                imgEl.classList.remove('is-loaded');
                imgEl.removeAttribute('src');
                return;
            }
            imgEl.src = candidates[i++];
        };

        imgEl.onload = () => imgEl.classList.add('is-loaded');
        imgEl.onerror = tryNext;
        tryNext();
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

    function otherSlotSlug(slotKey) {
        const other = slotKey === 'a' ? state.b : state.a;
        return other?.slug || null;
    }

    function getProposedProducts(slotKey) {
        const exclude = otherSlotSlug(slotKey);
        const out = [];
        const seen = new Set();
        for (const slug of PROPOSED_SLUGS) {
            if (slug === exclude || seen.has(slug)) continue;
            const p = getProductBySlug(slug);
            if (!p) continue;
            seen.add(p.slug);
            out.push(p);
        }
        return out;
    }

    function getSuggestionProducts(query, slotKey) {
        const q = query.toLowerCase().trim();
        const exclude = otherSlotSlug(slotKey);
        let pool = productsDatabase.filter((p) => p.slug !== exclude);
        if (q) {
            pool = pool.filter((p) => p.name.toLowerCase().includes(q));
        }
        return pool;
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
            groups.push({ category: catId, label: categoryLabel(catId), products: list });
            used.add(catId);
        }

        const rest = [...byCat.keys()]
            .filter((id) => !used.has(id))
            .sort((a, b) => categoryLabel(a).localeCompare(categoryLabel(b), 'pl'));

        for (const catId of rest) {
            const list = byCat.get(catId);
            list.sort((a, b) => a.name.localeCompare(b.name, 'pl'));
            groups.push({ category: catId, label: categoryLabel(catId), products: list });
        }

        return groups;
    }

    function suggestionItemHtml(p) {
        return `<li>
            <button type="button" data-slug="${escapeHtml(p.slug)}">
                <span class="sug-emoji" aria-hidden="true">${p.emoji}</span>
                <span class="sug-copy">
                    <span class="sug-name">${escapeHtml(p.name)}</span>
                    <span class="sug-meta">${p.kcal} kcal · ${p.protein} g białka · ${p.fat} g tłuszczu</span>
                </span>
            </button>
        </li>`;
    }

    function layoutSuggestions(slotKey) {
        const { search, suggestions: ul } = slots[slotKey];
        if (!search || !ul || ul.hidden) return;

        const field = search.closest('.compare-field') || search;
        const rect = field.getBoundingClientRect();
        const gap = 6;
        const bottomPad = 16;
        const top = rect.bottom + gap;
        const maxHeight = Math.max(160, window.innerHeight - top - bottomPad);

        if (ul.parentElement !== document.body) {
            document.body.appendChild(ul);
        }
        ul.dataset.compareSlot = slotKey;
        ul.style.position = 'fixed';
        ul.style.zIndex = '10000';
        ul.style.top = `${top}px`;
        ul.style.left = `${Math.max(8, rect.left)}px`;
        ul.style.width = `${Math.min(rect.width, window.innerWidth - 16)}px`;
        ul.style.maxHeight = `${maxHeight}px`;
    }

    function scheduleLayoutSuggestions() {
        window.requestAnimationFrame(() => {
            if (!slots.a.suggestions?.hidden) layoutSuggestions('a');
            if (!slots.b.suggestions?.hidden) layoutSuggestions('b');
        });
    }

    function revealSearchForSuggestions(slotKey) {
        const { search, chip, field } = slots[slotKey];
        if (!search) return;
        if (search.hidden) {
            if (chip) {
                chip.hidden = true;
                chip.setAttribute('hidden', '');
            }
            field?.classList.remove('compare-field--filled');
            search.hidden = false;
            search.removeAttribute('hidden');
            search.value = '';
            search.placeholder = state[slotKey]?.name
                ? `Szukaj zamiast „${state[slotKey].name}”…`
                : 'Szukaj produktu…';
        }
    }

    function openSuggestions(slotKey) {
        const search = slots[slotKey]?.search;
        if (!search) return;
        // Zamknij drugą listę, żeby nie nachodziły.
        const other = slotKey === 'a' ? 'b' : 'a';
        hideSuggestions(other);
        revealSearchForSuggestions(slotKey);
        const query = search.value;
        const items = getSuggestionProducts(query, slotKey);
        showSuggestions(slotKey, items, { showProposed: !query.trim() });
        if (document.activeElement !== search) {
            search.focus({ preventScroll: true });
        }
    }

    function hideSuggestions(slotKey) {
        const wrap = document.querySelector(`[data-slot="${slotKey}"] .compare-search-wrap`);
        const ul = slots[slotKey]?.suggestions;
        if (!ul) return;
        ul.hidden = true;
        ul.setAttribute('hidden', '');
        // Wróć listę do wrapa, żeby markup został czytelny.
        if (wrap && ul.parentElement !== wrap) {
            wrap.appendChild(ul);
        }
    }

    function restoreChipIfNeeded(slotKey) {
        const { search, suggestions } = slots[slotKey];
        if (!state[slotKey]) return;
        if (suggestions && !suggestions.hidden) return;
        if (search && document.activeElement === search) return;
        renderSelectedCard(slotKey, state[slotKey]);
        if (search) search.placeholder = 'Szukaj produktu…';
    }

    function showSuggestions(slotKey, items, opts = {}) {
        const ul = slots[slotKey].suggestions;
        if (!ul) return;

        const showProposed = opts.showProposed === true;
        const proposed = showProposed ? getProposedProducts(slotKey) : [];
        const proposedSlugs = new Set(proposed.map((p) => p.slug));
        const restItems = showProposed ? items.filter((p) => !proposedSlugs.has(p.slug)) : items;

        if (!proposed.length && !restItems.length) {
            hideSuggestions(slotKey);
            return;
        }

        const groups = groupProductsByCategory(restItems);
        const parts = [];

        if (proposed.length) {
            parts.push(
                `<li class="compare-suggestions-cat compare-suggestions-cat--proposed" role="presentation">Proponowane</li>`
            );
            parts.push(proposed.map(suggestionItemHtml).join(''));
        }

        for (const g of groups) {
            parts.push(
                `<li class="compare-suggestions-cat" role="presentation">${escapeHtml(g.label)}</li>`
            );
            parts.push(g.products.map(suggestionItemHtml).join(''));
        }

        ul.innerHTML = parts.join('');
        ul.hidden = false;
        ul.removeAttribute('hidden');
        layoutSuggestions(slotKey);
    }

    function renderSelectedCard(slotKey, product) {
        const { search: input, chip, field } = slots[slotKey];
        if (!chip || !field) return;

        const emojiEl = chip.querySelector('.compare-chip-emoji');
        const nameEl = chip.querySelector('.compare-chip-name');
        const imgEl = chip.querySelector('.compare-chip-img');

        if (!product) {
            chip.hidden = true;
            chip.setAttribute('hidden', '');
            field.classList.remove('compare-field--filled');
            if (input) {
                input.value = '';
                input.hidden = false;
                input.removeAttribute('hidden');
            }
            bindProductImage(imgEl, null);
            return;
        }

        if (emojiEl) emojiEl.textContent = product.emoji;
        if (nameEl) nameEl.textContent = product.name;
        bindProductImage(imgEl, product);
        chip.hidden = false;
        chip.removeAttribute('hidden');
        field.classList.add('compare-field--filled');
        if (input) {
            input.value = '';
            input.hidden = true;
            input.setAttribute('hidden', '');
        }
    }

    function beginProductChange(slotKey) {
        state[slotKey] = null;
        renderSelectedCard(slotKey, null);
        const search = slots[slotKey].search;
        if (search) search.placeholder = 'Szukaj produktu…';
        hideSuggestions(slotKey);
        syncUrl();
        renderComparison();
        window.requestAnimationFrame(() => openSuggestions(slotKey));
    }

    function setProduct(slotKey, product) {
        state[slotKey] = product;
        renderSelectedCard(slotKey, product);
        hideSuggestions('a');
        hideSuggestions('b');
        syncUrl();
        renderComparison();
    }

    function buildCompareShareUrl() {
        const params = new URLSearchParams();
        if (state.a?.slug) params.set('a', state.a.slug);
        if (state.b?.slug) params.set('b', state.b.slug);
        const qs = params.toString();
        return qs
            ? `${window.location.origin}${window.location.pathname}?${qs}`
            : `${window.location.origin}${window.location.pathname}`;
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

    function tallyWins(a, b) {
        let winsA = 0;
        let winsB = 0;
        let scored = 0;
        for (const m of COMPARE_METRICS) {
            const rawA = metricRaw(a, m.key);
            const rawB = metricRaw(b, m.key);
            const winner = metricWinner(rawA ?? 0, rawB ?? 0, m.key, rawA, rawB);
            if (winner == null) continue;
            scored += 1;
            if (winner === 'a') winsA += 1;
            if (winner === 'b') winsB += 1;
        }
        return { winsA, winsB, scored };
    }

    function matchupSideHtml(product, side, isLead) {
        const macro = `${product.kcal} kcal · ${product.protein} g białka · ${product.fat} g tłuszczu`;
        return `
            <div class="compare-matchup-side compare-matchup-side--${side}${isLead ? ' is-lead' : ''}" data-tilt-side="${side}">
                <span class="compare-matchup-media" aria-hidden="true">
                    <span class="compare-matchup-media-glow"></span>
                    <img class="compare-matchup-img" data-matchup-img="${side}" alt="" width="48" height="48" decoding="async">
                    <span class="compare-matchup-emoji">${product.emoji}</span>
                </span>
                <span class="compare-matchup-copy">
                    <span class="compare-matchup-slot">Produkt ${side.toUpperCase()}</span>
                    <span class="compare-matchup-name">${escapeHtml(product.name)}</span>
                    <span class="compare-matchup-meta">${escapeHtml(macro)}</span>
                </span>
            </div>`;
    }

    function renderMatchup(a, b) {
        if (!matchupEl) return;
        const { winsA, winsB, scored } = tallyWins(a, b);
        const lead = scored && winsA !== winsB ? (winsA > winsB ? 'a' : 'b') : null;
        matchupEl.classList.toggle('compare-matchup--lead-a', lead === 'a');
        matchupEl.classList.toggle('compare-matchup--lead-b', lead === 'b');
        matchupEl.innerHTML = `
            ${matchupSideHtml(a, 'a', lead === 'a')}
            <div class="compare-matchup-vs-wrap" aria-hidden="true">
                <span class="compare-matchup-vs-ring"></span>
                <span class="compare-matchup-vs-ring compare-matchup-vs-ring--delay"></span>
                <span class="compare-matchup-vs">vs</span>
            </div>
            ${matchupSideHtml(b, 'b', lead === 'b')}
        `;
        bindProductImage(matchupEl.querySelector('[data-matchup-img="a"]'), a);
        bindProductImage(matchupEl.querySelector('[data-matchup-img="b"]'), b);
        bindMatchupTilt();
    }

    function bindMatchupTilt() {
        if (!matchupEl || reduceMotion()) return;
        matchupEl.querySelectorAll('.compare-matchup-side').forEach((side) => {
            const media = side.querySelector('.compare-matchup-media');
            if (!media) return;
            side.onpointermove = (e) => {
                const r = media.getBoundingClientRect();
                const x = (e.clientX - r.left) / r.width - 0.5;
                const y = (e.clientY - r.top) / r.height - 0.5;
                media.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 12}deg) translateZ(8px)`;
            };
            side.onpointerleave = () => {
                media.style.transform = '';
            };
        });
    }

    function animateCount(el, to, duration = 700) {
        if (!el) return;
        if (reduceMotion()) {
            el.textContent = String(to);
            return;
        }
        const start = performance.now();
        const from = 0;
        function frame(now) {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent = String(Math.round(from + (to - from) * eased));
            if (t < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
    }

    function renderScoreline(a, b) {
        if (!scorelineEl) return;
        const { winsA, winsB, scored } = tallyWins(a, b);
        if (!scored) {
            scorelineEl.hidden = true;
            scorelineEl.innerHTML = '';
            return;
        }

        const pctA = Math.round((winsA / scored) * 100);
        const pctB = Math.round((winsB / scored) * 100);
        const lead =
            winsA === winsB
                ? 'Remis w kategoriach punktowanych'
                : winsA > winsB
                  ? `${escapeHtml(a.name)} prowadzi`
                  : `${escapeHtml(b.name)} prowadzi`;
        const leadSide = winsA === winsB ? 'draw' : winsA > winsB ? 'a' : 'b';

        scorelineEl.hidden = false;
        scorelineEl.classList.remove('is-animating');
        scorelineEl.classList.toggle('compare-scoreline--lead-a', leadSide === 'a');
        scorelineEl.classList.toggle('compare-scoreline--lead-b', leadSide === 'b');
        scorelineEl.classList.toggle('compare-scoreline--draw', leadSide === 'draw');
        scorelineEl.innerHTML = `
            <div class="compare-scoreline-side compare-scoreline-side--a">
                <span class="compare-scoreline-label">Produkt A</span>
                <span class="compare-scoreline-value" data-count="${winsA}">0</span>
            </div>
            <div class="compare-scoreline-mid">
                <span class="compare-scoreline-score"><span data-count-mid="a">0</span><span class="compare-scoreline-score-sep">:</span><span data-count-mid="b">0</span></span>
                <span class="compare-scoreline-caption">${leadSide === 'draw' ? 'remis' : 'prowadzi'}</span>
            </div>
            <div class="compare-scoreline-side compare-scoreline-side--b">
                <span class="compare-scoreline-label">Produkt B</span>
                <span class="compare-scoreline-value" data-count="${winsB}">0</span>
            </div>
            <div class="compare-scoreline-tracks" aria-label="${lead}">
                <div class="compare-scoreline-track">
                    <span class="compare-scoreline-fill--a" style="--score-pct:${pctA}%; --score-delay:40ms"></span>
                </div>
                <div class="compare-scoreline-track">
                    <span class="compare-scoreline-fill--b" style="--score-pct:${pctB}%; --score-delay:120ms"></span>
                </div>
            </div>`;

        animateCount(scorelineEl.querySelector('.compare-scoreline-side--a .compare-scoreline-value'), winsA);
        animateCount(scorelineEl.querySelector('.compare-scoreline-side--b .compare-scoreline-value'), winsB);
        animateCount(scorelineEl.querySelector('[data-count-mid="a"]'), winsA, 650);
        animateCount(scorelineEl.querySelector('[data-count-mid="b"]'), winsB, 650);

        if (!reduceMotion()) {
            requestAnimationFrame(() => scorelineEl.classList.add('is-animating'));
        } else {
            scorelineEl.classList.add('is-animating');
        }
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

    function buildGlassBarParts(slot, pct, label, isWinner, productName, barIndex, options = {}) {
        const { micro = false } = options;
        const fillW = pct > 0 ? pct : 0;
        const delay = 120 + barIndex * 90;
        const winnerClass = !micro && isWinner ? ' is-winner' : '';
        const microTrackClass = micro ? ' compare-glass-track--micro' : '';
        const microValClass = micro ? ' compare-glass-fill-val--lead' : '';
        const safeLabel = micro ? escapeHtml(label) : label;

        return {
            slot: `
                <div class="compare-glass-slot compare-glass-slot--${slot}${winnerClass}">
                    <span class="compare-glass-slot-tag">${slot.toUpperCase()}</span>
                    <span class="compare-glass-slot-name">${escapeHtml(productName)}</span>
                </div>`,
            track: `
                <div class="compare-glass-track compare-glass-track--${slot}${microTrackClass}${winnerClass}" style="--bar-delay:${delay}ms">
                    <span class="compare-glass-track-grid" aria-hidden="true"></span>
                    <div class="compare-glass-fill compare-glass-fill--${slot}${winnerClass}" style="--bar-pct:${fillW}%; --bar-delay:${delay}ms" data-pct="${fillW}">
                        <span class="compare-glass-fill-sheen" aria-hidden="true"></span>
                        <span class="compare-glass-fill-glow" aria-hidden="true"></span>
                        <span class="compare-glass-fill-tip" aria-hidden="true"></span>
                    </div>
                    <span class="compare-glass-fill-val${microValClass}">${safeLabel}</span>
                </div>`
        };
    }

    function buildGlassBarsGrid(aName, bName, pctA, labelA, winA, pctB, labelB, winB, hintText, rowIndex, options = {}) {
        const partsA = buildGlassBarParts('a', pctA, labelA, winA, aName, rowIndex * 2, options);
        const partsB = buildGlassBarParts('b', pctB, labelB, winB, bName, rowIndex * 2 + 1, options);
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
        const rows = COMPARE_METRICS.map((m, rowIndex) => {
            const rawA = metricRaw(a, m.key);
            const rawB = metricRaw(b, m.key);
            const va = rawA ?? 0;
            const vb = rawB ?? 0;
            const max = axisMaxForMetric(m.key, va, vb);
            const pctA = rawA != null && max > 0 ? Math.round((va / max) * 100) : 0;
            const pctB = rawB != null && max > 0 ? Math.round((vb / max) * 100) : 0;
            const winner = metricWinner(va, vb, m.key, rawA, rawB);
            const winA = winner === 'a';
            const winB = winner === 'b';
            const labelA = formatMetricLabel(a, m);
            const labelB = formatMetricLabel(b, m);
            const delta =
                rawA != null && rawB != null && Math.abs(va - vb) > 0.0001
                    ? Math.abs(va - vb)
                    : null;
            const deltaText =
                delta == null
                    ? ''
                    : m.format === 'ratio'
                      ? `${formatValue(delta, m.decimals)}`
                      : `${formatValue(delta, m.decimals)} ${m.unit}`;

            const hintText = m.hint
                ? { text: m.hint, kind: hintKindForMetric(m) }
                : null;

            const mutedClass = m.neutral ? ' compare-glass-row--muted' : '';
            const rowClasses = `compare-glass-row${mutedClass}${m.hint ? ' compare-glass-row--has-hint' : ''}${winner ? ` compare-glass-row--lead-${winner}` : ''}`;

            return `
                <article class="${rowClasses}" style="--row-delay:${rowIndex * 70}ms">
                    <div class="compare-glass-row-head">
                        <span class="compare-glass-metric-badge" aria-hidden="true">
                            <span class="compare-glass-metric-icon">${m.icon}</span>
                        </span>
                        <div class="compare-glass-metric-copy">
                            <span class="compare-glass-metric-name">${escapeHtml(m.label)}</span>
                            <span class="compare-glass-metric-max">skala 0–${escapeHtml(formatMetricScaleMax(m, max))}</span>
                        </div>
                        ${
                            deltaText
                                ? `<span class="compare-glass-delta${m.neutral ? ' compare-glass-delta--soft' : ''}" title="Różnica">${escapeHtml(deltaText)}</span>`
                                : `<span class="compare-glass-delta compare-glass-delta--neutral">${m.neutral ? 'kontekst' : 'remis'}</span>`
                        }
                    </div>
                    ${buildGlassBarsGrid(a.name, b.name, pctA, labelA, winA, pctB, labelB, winB, hintText, rowIndex)}
                </article>`;
        }).join('');

        return `
            <div class="compare-glass-chart" role="img" aria-label="Wykres składników na 100 g: ${escapeHtml(a.name)} i ${escapeHtml(b.name)}">
                <div class="compare-glass-chart-head">
                    <p class="compare-glass-chart-kicker">Arena makro</p>
                    <p class="compare-glass-chart-title">Pojedynek wartości na 100&nbsp;g</p>
                </div>
                <div class="compare-glass-chart-body">
                    ${rows}
                </div>
            </div>`;
    }

    const MICRO_COMPARE_GROUPS = [
        {
            id: 'vitamins',
            title: 'Witaminy',
            keys: ['vitA', 'vitC', 'vitD', 'vitE', 'vitK', 'b1', 'b2', 'b3', 'b5', 'b7', 'b9', 'b12'],
        },
        {
            id: 'minerals',
            title: 'Minerały',
            keys: ['magnesium', 'iron', 'calcium', 'potassium', 'zinc', 'copper', 'phosphorus', 'manganese', 'iodine', 'sodium', 'selenium'],
        },
    ];

    const MICRO_ICONS = {
        vitA: '🥕',
        vitC: '🍊',
        vitD: '☀️',
        vitE: '🫒',
        vitK: '🥬',
        b1: 'B₁',
        b2: 'B₂',
        b3: 'B₃',
        b5: 'B₅',
        b6: 'B₆',
        b7: 'B₇',
        b9: 'B₉',
        b12: 'B₁₂',
        calcium: '🦴',
        iron: '🧲',
        magnesium: '⚡',
        phosphorus: 'P',
        potassium: '🍌',
        zinc: '⚙️',
        selenium: 'Se',
        copper: 'Cu',
        manganese: 'Mn',
        iodine: 'I',
        sodium: '🧂'
    };

    function formatMicroBarLabel(amount, key) {
        const meta = window.MEAL_RDA?.[key];
        if (!meta || amount == null || !(amount > 0)) return '—';
        const target = microRdaTarget(key);
        if (!target || target <= 0) return '—';
        const pct = Math.round((amount / target) * 100);
        return meta.isMax ? `${pct}% lim.` : `${pct}% RDA`;
    }

    function formatMicroBarDelta(va, vb, key) {
        const target = microRdaTarget(key);
        if (!target || target <= 0) return null;
        const diff = Math.abs((va / target) * 100 - (vb / target) * 100);
        if (diff < 0.05) return null;
        return `${Math.round(diff)} p.p.`;
    }

    function microRdaTarget(key) {
        const meta = window.MEAL_RDA?.[key];
        if (!meta) return null;
        const male = typeof window.getMealRdaTarget === 'function' ? window.getMealRdaTarget(key, 'male') : meta.male;
        const female = typeof window.getMealRdaTarget === 'function' ? window.getMealRdaTarget(key, 'female') : meta.female;
        if (male != null && female != null) return (male + female) / 2;
        return male != null ? male : female;
    }

    function pickMicroGroupsForChart() {
        const rda = window.MEAL_RDA || {};
        return MICRO_COMPARE_GROUPS.map((group) => ({
            ...group,
            keys: group.keys.filter((k) => rda[k]),
        })).filter((group) => group.keys.length);
    }

    function buildMicroRowHtml(a, b, key, rowIndex, microsA, microsB) {
        const meta = window.MEAL_RDA[key];
        if (!meta) return { html: '', winner: null };

        const va = microsA[key] || 0;
        const vb = microsB[key] || 0;
        const max = Math.max(va, vb, 0.001);
        const pctA = va > 0 ? Math.round((va / max) * 100) : 0;
        const pctB = vb > 0 ? Math.round((vb / max) * 100) : 0;
        const winner = microWinner(va, vb, key);
        const winA = winner === 'a';
        const winB = winner === 'b';
        const labelA = formatMicroBarLabel(va, key);
        const labelB = formatMicroBarLabel(vb, key);
        const deltaText = va > 0 || vb > 0 ? formatMicroBarDelta(va, vb, key) : null;
        const hintText =
            key === 'sodium'
                ? { text: 'mniej = lepiej', kind: 'less' }
                : { text: 'więcej = lepiej', kind: 'more' };
        const icon = MICRO_ICONS[key] || '•';
        const shortName = meta.label.replace(/\s*\([^)]*\)/g, '');

        return {
            winner,
            html: `
                <article class="compare-glass-row compare-glass-row--micro compare-glass-row--has-hint${winner ? ` compare-glass-row--lead-${winner}` : ''}" style="--row-delay:${(COMPARE_METRICS.length + rowIndex) * 70}ms">
                    <div class="compare-glass-row-head">
                        <span class="compare-glass-metric-badge" aria-hidden="true">
                            <span class="compare-glass-metric-icon compare-glass-metric-icon--micro">${icon}</span>
                        </span>
                        <div class="compare-glass-metric-copy">
                            <span class="compare-glass-metric-name">${escapeHtml(shortName)}</span>
                            <span class="compare-glass-metric-max">na 100&nbsp;g</span>
                        </div>
                        ${
                            deltaText
                                ? `<span class="compare-glass-delta" title="Różnica">${escapeHtml(deltaText)}</span>`
                                : `<span class="compare-glass-delta compare-glass-delta--neutral">remis</span>`
                        }
                    </div>
                    ${buildGlassBarsGrid(a.name, b.name, pctA, labelA, winA, pctB, labelB, winB, hintText, COMPARE_METRICS.length + rowIndex, { micro: true })}
                </article>`,
        };
    }

    function buildMicroGlassBarsHtml(a, b) {
        const microsA = getProductMicros(a);
        const microsB = getProductMicros(b);
        const groups = pickMicroGroupsForChart();
        if (!groups.length) return '';

        let winsA = 0;
        let winsB = 0;
        let rowIndex = 0;
        const groupsHtml = groups
            .map((group) => {
                const rows = group.keys
                    .map((key) => {
                        const built = buildMicroRowHtml(a, b, key, rowIndex, microsA, microsB);
                        rowIndex += 1;
                        if (built.winner === 'a') winsA += 1;
                        if (built.winner === 'b') winsB += 1;
                        return built.html;
                    })
                    .join('');

                return `
                <section class="compare-micro-group compare-micro-group--${escapeHtml(group.id)}" aria-labelledby="compareMicro${escapeHtml(group.id)}">
                    <h3 class="compare-micro-group-title" id="compareMicro${escapeHtml(group.id)}">${escapeHtml(group.title)}</h3>
                    <div class="compare-micro-group-rows">
                        ${rows}
                    </div>
                </section>`;
            })
            .join('');

        const scoreline =
            winsA || winsB
                ? `<p class="compare-glass-chart-score">A prowadzi <strong>${winsA}</strong> · B prowadzi <strong>${winsB}</strong></p>`
                : '';

        return `
            <div class="compare-glass-chart compare-glass-chart--micro" role="img" aria-label="Porównanie witamin i minerałów na 100 g: ${escapeHtml(a.name)} i ${escapeHtml(b.name)}">
                <div class="compare-glass-chart-head">
                    <p class="compare-glass-chart-kicker">Mikroskładniki</p>
                    <p class="compare-glass-chart-title">Witaminy i minerały</p>
                    ${scoreline}
                </div>
                <div class="compare-glass-chart-body compare-glass-chart-body--split">
                    ${groupsHtml}
                </div>
            </div>`;
    }

    function playDashboardMotion() {
        if (!chartEl) return;
        chartEl.classList.remove('is-animating');

        const fills = chartEl.querySelectorAll('.compare-glass-fill');
        const rows = chartEl.querySelectorAll('.compare-glass-row');
        fills.forEach((el) => {
            el.classList.remove('is-run');
            if (reduceMotion()) {
                el.style.width = `${el.dataset.pct || 0}%`;
            } else {
                el.style.width = '0%';
            }
        });
        rows.forEach((row) => row.classList.remove('is-visible'));

        const reveal = () => {
            chartEl.classList.add('is-animating');
            rows.forEach((row) => row.classList.add('is-visible'));
            fills.forEach((el) => {
                el.style.width = '';
                el.classList.add('is-run');
            });
        };

        if (reduceMotion()) {
            reveal();
            return;
        }

        void chartEl.offsetWidth;
        requestAnimationFrame(reveal);
    }

    function renderChart(a, b) {
        if (!chartEl) return;

        chartEl.setAttribute(
            'aria-label',
            `Porównanie ${a.name} i ${b.name}: makro, białko na 100 kcal i stosunek tłuszczu nienasyconego do nasyconego na 100 g`
        );

        chartEl.innerHTML = `
            ${renderKpiGrid(a, b)}
            <div class="compare-glass-panel compare-glass-panel--arena">
                <span class="compare-glass-panel-orb compare-glass-panel-orb--a" aria-hidden="true"></span>
                <span class="compare-glass-panel-orb compare-glass-panel-orb--b" aria-hidden="true"></span>
                ${buildGlassBarsHtml(a, b)}
                ${buildMicroGlassBarsHtml(a, b)}
            </div>
            <p class="compare-chart-footnote">Wszystkie wartości na 100 g produktu. Mikro: % RDA orientacyjny (średnia m/k), na 100 g.</p>`;

        playDashboardMotion();
    }

    function renderTableHeadCell(product, side) {
        return `<span class="compare-th-wrap compare-th-wrap--${side}"><span class="compare-th-badge compare-th-badge--${side}">${side.toUpperCase()}</span><span class="compare-th-name">${escapeHtml(product.name)}</span></span>`;
    }

    function renderTable(a, b) {
        if (!tableBody) return;
        if (thA) thA.innerHTML = renderTableHeadCell(a, 'a');
        if (thB) thB.innerHTML = renderTableHeadCell(b, 'b');

        tableBody.innerHTML = COMPARE_METRICS.map((m) => {
            const rawA = metricRaw(a, m.key);
            const rawB = metricRaw(b, m.key);
            const va = rawA ?? 0;
            const vb = rawB ?? 0;
            const winA = metricWinner(va, vb, m.key, rawA, rawB) === 'a';
            const winB = metricWinner(va, vb, m.key, rawA, rawB) === 'b';
            return `<tr${m.neutral ? ' class="compare-table-row--muted"' : ''}>
                <th scope="row">${escapeHtml(m.labelFull || m.label)}</th>
                <td class="${winA ? 'cell-winner cell-winner--a' : ''}">${formatMetricLabel(a, m)}</td>
                <td class="${winB ? 'cell-winner cell-winner--b' : ''}">${formatMetricLabel(b, m)}</td>
            </tr>`;
        }).join('');
    }

    function getProductMicros(product) {
        if (typeof window.estimateMicrosPer100g === 'function') {
            return window.estimateMicrosPer100g(product) || {};
        }
        if (product?.microsDetail && typeof product.microsDetail === 'object') {
            return { ...product.microsDetail };
        }
        if (window.PRODUCT_MICROS_DATA && product?.slug && window.PRODUCT_MICROS_DATA[product.slug]) {
            return { ...window.PRODUCT_MICROS_DATA[product.slug] };
        }
        return {};
    }

    function microWinner(va, vb, key) {
        const aOk = typeof va === 'number' && va > 0;
        const bOk = typeof vb === 'number' && vb > 0;
        if (!aOk && !bOk) return null;
        if (!aOk) return 'b';
        if (!bOk) return 'a';
        if (va === vb) return null;
        if (key === 'sodium') return va < vb ? 'a' : 'b';
        return va > vb ? 'a' : 'b';
    }

    function renderComparison() {
        const { a, b } = state;
        if (!a || !b) {
            if (emptyEl) {
                emptyEl.hidden = false;
                emptyEl.removeAttribute('hidden');
            }
            if (sectionEl) {
                sectionEl.hidden = true;
                sectionEl.setAttribute('hidden', '');
                sectionEl.classList.remove('is-entering', 'compare-chart-section--mounted');
            }
            if (scorelineEl) {
                scorelineEl.hidden = true;
                scorelineEl.setAttribute('hidden', '');
                scorelineEl.innerHTML = '';
            }
            return;
        }
        if (emptyEl) {
            emptyEl.hidden = true;
            emptyEl.setAttribute('hidden', '');
        }
        if (sectionEl) {
            const firstShow = sectionEl.hidden;
            sectionEl.hidden = false;
            sectionEl.removeAttribute('hidden');
            sectionEl.classList.remove('is-entering');
            if (firstShow && !reduceMotion()) {
                void sectionEl.offsetWidth;
                sectionEl.classList.add('is-entering');
            }
            sectionEl.classList.add('compare-chart-section--mounted');
        }
        try {
            renderMatchup(a, b);
            renderScoreline(a, b);
            renderChart(a, b);
            renderTable(a, b);
            requestAnimationFrame(() => {
                sectionEl?.querySelectorAll('.pm-reveal:not(.pm-revealed)').forEach((el) => {
                    el.classList.add('pm-revealed');
                });
            });
        } catch (err) {
            console.error('compare-products: render failed', err);
            if (chartEl) {
                chartEl.innerHTML = `<p class="compare-chart-error" role="alert">Nie udało się wyświetlić wykresu. Odśwież stronę.</p>`;
            }
        }
    }

    function bindSlot(slotKey) {
        const { search, suggestions, field } = slots[slotKey];
        if (!search) return;

        search.addEventListener('input', () => openSuggestions(slotKey));
        search.addEventListener('focus', () => openSuggestions(slotKey));
        search.addEventListener('click', (e) => {
            e.stopPropagation();
            openSuggestions(slotKey);
        });

        field?.addEventListener('click', (e) => {
            if (e.target.closest('.compare-chip-clear')) return;
            e.preventDefault();
            openSuggestions(slotKey);
        });

        const picker = search.closest('.compare-picker');
        const label = picker?.querySelector('.compare-picker-label');
        label?.addEventListener('click', (e) => {
            e.preventDefault();
            openSuggestions(slotKey);
        });

        suggestions?.addEventListener('mousedown', (e) => {
            // Nie chowaj listy przez blur inputu przed wyborem.
            e.preventDefault();
        });

        suggestions?.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-slug]');
            if (!btn) return;
            const product = getProductBySlug(btn.dataset.slug);
            if (product) setProduct(slotKey, product);
        });

        search.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                hideSuggestions(slotKey);
                restoreChipIfNeeded(slotKey);
                search.blur();
            }
        });

        search.addEventListener('blur', () => {
            window.setTimeout(() => {
                if (suggestions && !suggestions.hidden) return;
                restoreChipIfNeeded(slotKey);
            }, 120);
        });
    }

    document.addEventListener('click', (e) => {
        const inWrap = e.target.closest('.compare-search-wrap');
        const inSuggestions = e.target.closest('.compare-suggestions');
        if (!inWrap && !inSuggestions) {
            hideSuggestions('a');
            hideSuggestions('b');
            restoreChipIfNeeded('a');
            restoreChipIfNeeded('b');
        }
        const changeBtn = e.target.closest('.compare-chip-clear');
        if (changeBtn) {
            const key = changeBtn.dataset.clear;
            if (key) beginProductChange(key);
        }
    });

    swapBtn?.addEventListener('click', () => {
        if (!reduceMotion()) {
            swapBtn.classList.remove('is-spinning');
            void swapBtn.offsetWidth;
            swapBtn.classList.add('is-spinning');
            setTimeout(() => swapBtn.classList.remove('is-spinning'), 650);
        }
        const nextA = state.b;
        const nextB = state.a;
        state.a = nextA;
        state.b = nextB;
        renderSelectedCard('a', state.a);
        renderSelectedCard('b', state.b);
        hideSuggestions('a');
        hideSuggestions('b');
        syncUrl();
        renderComparison();
    });

    copyLinkBtn?.addEventListener('click', async () => {
        const url = buildCompareShareUrl();
        const labelEl = copyLinkBtn.querySelector('.compare-copy-link-label');
        const prev = labelEl?.textContent || copyLinkBtn.textContent;
        try {
            await navigator.clipboard.writeText(url);
            copyLinkBtn.classList.add('is-copied');
            if (labelEl) labelEl.textContent = 'Skopiowano';
            else copyLinkBtn.textContent = 'Skopiowano';
            setTimeout(() => {
                copyLinkBtn.classList.remove('is-copied');
                if (labelEl) labelEl.textContent = prev;
                else copyLinkBtn.textContent = prev;
            }, 2000);
        } catch {
            window.prompt('Skopiuj link do porównania:', url);
        }
    });

    quickEl?.addEventListener('click', (e) => {
        const btn = e.target.closest('.compare-quick-btn');
        if (!btn) return;
        const productA = getProductBySlug(btn.dataset.a);
        const productB = getProductBySlug(btn.dataset.b);
        if (!productA || !productB) return;
        state.a = productA;
        state.b = productB;
        renderSelectedCard('a', productA);
        renderSelectedCard('b', productB);
        hideSuggestions('a');
        hideSuggestions('b');
        syncUrl();
        renderComparison();
        sectionEl?.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
    });

    bindSlot('a');
    bindSlot('b');
    window.addEventListener('resize', scheduleLayoutSuggestions);
    window.addEventListener('scroll', scheduleLayoutSuggestions, true);
    readUrlProducts();
})();
