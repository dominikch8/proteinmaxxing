/**
 * Kalkulator posiłków — suma makro + orientacyjne mikro vs RDA.
 */
(function () {
    const STORAGE_KEY = 'pmx_meal_calc_v1';
    /** @type {{ id: string, slug: string, name: string, emoji: string, grams: number, mode: 'grams'|'servings', servings: number }[]} */
    let mealItems = [];
    let selectedProduct = null;
    let amountMode = 'grams';

    function $(id) {
        return document.getElementById(id);
    }

    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function findProduct(slug) {
        if (typeof productsDatabase === 'undefined') return null;
        return productsDatabase.find((p) => p.slug === slug) || null;
    }

    function hasServing(p) {
        return p && p.servingRatio > 0 && p.servingText;
    }

    function servingGramsOf(p) {
        if (!hasServing(p)) return null;
        if (p.servingGrams > 0) return p.servingGrams;
        return Math.round(p.servingRatio * 100);
    }

    function macrosForGrams(p, grams) {
        const f = (Number(grams) || 0) / 100;
        return {
            kcal: Math.round((p.kcal || 0) * f),
            protein: Number(((p.protein || 0) * f).toFixed(1)),
            carbs: Number(((p.carbs || 0) * f).toFixed(1)),
            fat: Number(((p.fat || 0) * f).toFixed(1)),
            satFat: Number(((p.satFat || 0) * f).toFixed(1)),
            unsatFat: Number(((p.unsatFat || 0) * f).toFixed(1)),
        };
    }

    function loadState() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            const data = JSON.parse(raw);
            if (Array.isArray(data.items)) mealItems = data.items;
            if (data.gender) {
                const g = $('mealGender');
                if (g) g.value = data.gender;
            }
            if (data.dailyKcal) {
                const el = $('mealDailyKcal');
                if (el) el.value = data.dailyKcal;
            }
            if (data.dailyProtein) {
                const el = $('mealDailyProtein');
                if (el) el.value = data.dailyProtein;
            }
        } catch {
            /* ignore */
        }
    }

    function saveState() {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    items: mealItems,
                    gender: $('mealGender')?.value || 'male',
                    dailyKcal: $('mealDailyKcal')?.value || '',
                    dailyProtein: $('mealDailyProtein')?.value || '',
                })
            );
        } catch {
            /* ignore */
        }
    }

    function setSelectedProduct(p) {
        selectedProduct = p;
        const chip = $('mealSelectedChip');
        const input = $('mealProductSearch');
        if (!p) {
            if (chip) chip.hidden = true;
            if (input) {
                input.value = '';
                input.focus();
            }
            updateAmountUi();
            return;
        }
        if (input) input.value = p.name;
        if (chip) {
            chip.hidden = false;
            chip.querySelector('.meal-chip-emoji').textContent = p.emoji || '🍽️';
            chip.querySelector('.meal-chip-name').textContent = p.name;
        }
        updateAmountUi();
        hideSuggestions();
    }

    function updateAmountUi() {
        const p = selectedProduct;
        const gramsWrap = $('mealGramsWrap');
        const servingsWrap = $('mealServingsWrap');
        const servingHint = $('mealServingHint');
        const modeGrams = $('mealModeGrams');
        const modeServings = $('mealModeServings');
        const canServe = hasServing(p);

        if (modeServings) {
            modeServings.disabled = !canServe;
            if (!canServe && amountMode === 'servings') {
                amountMode = 'grams';
            }
        }
        if (modeGrams) modeGrams.classList.toggle('is-active', amountMode === 'grams');
        if (modeServings) modeServings.classList.toggle('is-active', amountMode === 'servings');

        if (gramsWrap) gramsWrap.hidden = amountMode !== 'grams';
        if (servingsWrap) servingsWrap.hidden = amountMode !== 'servings' || !canServe;

        if (servingHint) {
            if (canServe) {
                const g = servingGramsOf(p);
                servingHint.textContent = `Porcja: ${p.servingText}${g ? ` ≈ ${g} g` : ''}`;
                servingHint.hidden = false;
            } else {
                servingHint.textContent = 'Ten produkt nie ma zdefiniowanej porcji — podaj gramy.';
                servingHint.hidden = false;
            }
        }
    }

    function getSuggestionProducts(query) {
        if (typeof productsDatabase === 'undefined') return [];
        const q = query.toLowerCase().trim();
        let pool = [...productsDatabase];
        if (q) pool = pool.filter((p) => p.name.toLowerCase().includes(q));
        return pool.slice(0, 12);
    }

    function hideSuggestions() {
        const box = $('mealSuggestions');
        if (box) {
            box.hidden = true;
            box.innerHTML = '';
        }
    }

    function renderSuggestions(query) {
        const box = $('mealSuggestions');
        if (!box) return;
        const items = getSuggestionProducts(query);
        if (!items.length) {
            box.hidden = true;
            box.innerHTML = '<p class="meal-suggest-empty">Brak wyników</p>';
            box.hidden = false;
            return;
        }
        box.innerHTML = items
            .map(
                (p) => `<button type="button" class="meal-suggest-item" data-slug="${escapeHtml(p.slug)}">
                <span class="meal-suggest-emoji">${escapeHtml(p.emoji || '🍽️')}</span>
                <span class="meal-suggest-text">
                    <span class="meal-suggest-name">${escapeHtml(p.name)}</span>
                    <span class="meal-suggest-meta">${p.kcal} kcal · B ${p.protein}g / 100 g${hasServing(p) ? ` · ${escapeHtml(p.servingText)}` : ''}</span>
                </span>
            </button>`
            )
            .join('');
        box.hidden = false;
    }

    function resolveItemGrams(item) {
        const p = findProduct(item.slug);
        if (!p) return item.grams || 0;
        if (item.mode === 'servings' && hasServing(p)) {
            return (Number(item.servings) || 0) * servingGramsOf(p);
        }
        return Number(item.grams) || 0;
    }

    function addCurrentToMeal() {
        if (!selectedProduct) {
            $('mealProductSearch')?.focus();
            return;
        }
        let grams = 0;
        let servings = 1;
        let mode = amountMode;

        if (amountMode === 'servings' && hasServing(selectedProduct)) {
            servings = Math.max(0.25, Number($('mealServingsInput')?.value) || 1);
            grams = servings * servingGramsOf(selectedProduct);
        } else {
            mode = 'grams';
            grams = Math.max(1, Number($('mealGramsInput')?.value) || 100);
        }

        mealItems.push({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            slug: selectedProduct.slug,
            name: selectedProduct.name,
            emoji: selectedProduct.emoji || '🍽️',
            grams,
            mode,
            servings,
        });
        saveState();
        renderMealList();
        renderTotals();
        setSelectedProduct(null);
        if ($('mealGramsInput')) $('mealGramsInput').value = '100';
        if ($('mealServingsInput')) $('mealServingsInput').value = '1';
    }

    function removeItem(id) {
        mealItems = mealItems.filter((x) => x.id !== id);
        saveState();
        renderMealList();
        renderTotals();
    }

    function clearMeal() {
        mealItems = [];
        saveState();
        renderMealList();
        renderTotals();
    }

    function renderMealList() {
        const list = $('mealItemsList');
        const empty = $('mealEmptyHint');
        if (!list) return;
        if (!mealItems.length) {
            list.innerHTML = '';
            if (empty) empty.hidden = false;
            return;
        }
        if (empty) empty.hidden = true;
        list.innerHTML = mealItems
            .map((item) => {
                const p = findProduct(item.slug);
                const grams = resolveItemGrams(item);
                const m = p ? macrosForGrams(p, grams) : { kcal: 0, protein: 0, carbs: 0, fat: 0 };
                const amountLabel =
                    item.mode === 'servings' && p && hasServing(p)
                        ? `${item.servings}× ${p.servingText} (≈ ${Math.round(grams)} g)`
                        : `${Math.round(grams)} g`;
                return `<li class="meal-item" data-id="${escapeHtml(item.id)}">
                    <span class="meal-item-emoji">${escapeHtml(item.emoji)}</span>
                    <span class="meal-item-body">
                        <span class="meal-item-name">${escapeHtml(item.name)}</span>
                        <span class="meal-item-amount">${escapeHtml(amountLabel)}</span>
                    </span>
                    <span class="meal-item-macros">${m.kcal} kcal · B ${m.protein}g · W ${m.carbs}g · T ${m.fat}g</span>
                    <button type="button" class="meal-item-remove" data-remove="${escapeHtml(item.id)}" aria-label="Usuń ${escapeHtml(item.name)}">×</button>
                </li>`;
            })
            .join('');
    }

    function sumMeal() {
        const totals = {
            kcal: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            satFat: 0,
            unsatFat: 0,
            micros: {},
        };
        for (const item of mealItems) {
            const p = findProduct(item.slug);
            if (!p) continue;
            const grams = resolveItemGrams(item);
            const m = macrosForGrams(p, grams);
            totals.kcal += m.kcal;
            totals.protein += m.protein;
            totals.carbs += m.carbs;
            totals.fat += m.fat;
            totals.satFat += m.satFat;
            totals.unsatFat += m.unsatFat;
            if (typeof estimateMicrosPer100g === 'function' && typeof scaleMicros === 'function') {
                const scaled = scaleMicros(estimateMicrosPer100g(p), grams);
                for (const [k, v] of Object.entries(scaled)) {
                    totals.micros[k] = (totals.micros[k] || 0) + v;
                }
            }
        }
        totals.protein = Number(totals.protein.toFixed(1));
        totals.carbs = Number(totals.carbs.toFixed(1));
        totals.fat = Number(totals.fat.toFixed(1));
        totals.satFat = Number(totals.satFat.toFixed(1));
        totals.unsatFat = Number(totals.unsatFat.toFixed(1));
        return totals;
    }

    function fmtNum(n, digits = 1) {
        if (n >= 100) return String(Math.round(n));
        return Number(n).toFixed(digits).replace(/\.0$/, '');
    }

    function renderTotals() {
        const t = sumMeal();
        const set = (id, val) => {
            const el = $(id);
            if (el) el.textContent = val;
        };
        set('mealTotalKcal', `${t.kcal}`);
        set('mealTotalProtein', `${t.protein} g`);
        set('mealTotalCarbs', `${t.carbs} g`);
        set('mealTotalFat', `${t.fat} g`);
        set('mealTotalSat', `${t.satFat} g`);
        set('mealTotalUnsat', `${t.unsatFat} g`);

        const dailyKcal = Number($('mealDailyKcal')?.value) || 0;
        const dailyProtein = Number($('mealDailyProtein')?.value) || 0;
        const kcalPct = dailyKcal > 0 ? Math.round((t.kcal / dailyKcal) * 100) : null;
        const protPct = dailyProtein > 0 ? Math.round((t.protein / dailyProtein) * 100) : null;
        set('mealKcalPct', kcalPct != null ? `${kcalPct}% dziennego limitu kcal` : 'Podaj limit kcal poniżej');
        set('mealProteinPct', protPct != null ? `${protPct}% dziennego białka` : 'Podaj cel białka poniżej');

        const barK = $('mealBarKcal');
        const barP = $('mealBarProtein');
        if (barK) barK.style.width = `${Math.min(100, kcalPct || 0)}%`;
        if (barP) barP.style.width = `${Math.min(100, protPct || 0)}%`;

        renderMicroTable(t.micros);
        saveState();
    }

    function renderMicroTable(microsSum) {
        const tbody = $('mealMicroBody');
        const note = $('mealMicroNote');
        if (!tbody || typeof MEAL_RDA === 'undefined') return;
        const gender = $('mealGender')?.value === 'female' ? 'female' : 'male';
        const rows = Object.keys(MEAL_RDA)
            .map((key) => {
                const meta = MEAL_RDA[key];
                const amount = microsSum[key] || 0;
                if (amount <= 0) return null;
                const target = getMealRdaTarget(key, gender);
                const pct = target > 0 ? (amount / target) * 100 : 0;
                const pctLabel = meta.isMax
                    ? `${fmtNum(pct, 0)}% limitu`
                    : `${fmtNum(pct, 0)}% RDA`;
                const pctClass = meta.isMax
                    ? pct >= 100
                        ? 'is-high'
                        : 'is-ok'
                    : pct >= 100
                      ? 'is-good'
                      : pct >= 30
                        ? 'is-ok'
                        : 'is-low';
                return `<tr>
                    <td><strong>${escapeHtml(meta.label)}</strong></td>
                    <td>${fmtNum(amount, amount < 10 ? 2 : 1)} ${escapeHtml(meta.unit)}</td>
                    <td>${fmtNum(target, target < 10 ? 1 : 0)} ${escapeHtml(meta.unit)}</td>
                    <td><span class="meal-pct ${pctClass}">${pctLabel}</span>
                        <span class="meal-pct-bar" aria-hidden="true"><span style="width:${Math.min(100, pct)}%"></span></span>
                    </td>
                </tr>`;
            })
            .filter(Boolean);

        tbody.innerHTML = rows.length
            ? rows.join('')
            : '<tr><td colspan="4">Dodaj produkty, żeby zobaczyć szacunek mikroskładników.</td></tr>';
        if (note) {
            note.hidden = !mealItems.length;
        }
    }

    function bind() {
        const search = $('mealProductSearch');
        if (search) {
            search.addEventListener('input', () => {
                selectedProduct = null;
                const chip = $('mealSelectedChip');
                if (chip) chip.hidden = true;
                renderSuggestions(search.value);
            });
            search.addEventListener('focus', () => {
                if (search.value.trim() || !selectedProduct) renderSuggestions(search.value);
            });
        }

        $('mealSuggestions')?.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-slug]');
            if (!btn) return;
            const p = findProduct(btn.getAttribute('data-slug'));
            if (p) setSelectedProduct(p);
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.meal-search-wrap')) hideSuggestions();
        });

        $('mealChipClear')?.addEventListener('click', () => setSelectedProduct(null));

        $('mealModeGrams')?.addEventListener('click', () => {
            amountMode = 'grams';
            updateAmountUi();
        });
        $('mealModeServings')?.addEventListener('click', () => {
            if (selectedProduct && hasServing(selectedProduct)) {
                amountMode = 'servings';
                updateAmountUi();
            }
        });

        $('mealAddBtn')?.addEventListener('click', addCurrentToMeal);
        $('mealClearBtn')?.addEventListener('click', clearMeal);

        $('mealItemsList')?.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-remove]');
            if (btn) removeItem(btn.getAttribute('data-remove'));
        });

        ['mealGender', 'mealDailyKcal', 'mealDailyProtein'].forEach((id) => {
            $(id)?.addEventListener('change', renderTotals);
            $(id)?.addEventListener('input', renderTotals);
        });

        $('mealFillFromBmi')?.addEventListener('click', () => {
            window.location.href = 'kalkulator-bmi';
        });
    }

    async function boot() {
        if (typeof ensureProductsDatabase === 'function') {
            await ensureProductsDatabase();
        }
        loadState();
        bind();
        updateAmountUi();
        renderMealList();
        renderTotals();
    }

    boot().catch((err) => console.error('meal-calculator:', err));
})();
