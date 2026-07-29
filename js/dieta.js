// Dieta — rankingi i baza produktów
const RANDOM_PREVIEW_COUNT = 12;
const BAZA_SHOW_MORE_STEP = 12;

let bazaRandomPool = [];
let bazaVisibleCount = RANDOM_PREVIEW_COUNT;

let maxxingRankedPool = [];
let maxxingVisibleCount = RANDOM_PREVIEW_COUNT;
let maxxingListKey = '';

let priceRankedPool = [];
let priceVisibleCount = RANDOM_PREVIEW_COUNT;
let priceListKey = '';

/** Pokazuje „Pokaż więcej” tylko gdy jest coś do doładowania. */
function setShowMoreWrapVisible(wrap, canShowMore) {
    if (!wrap) return;
    const show = Boolean(canShowMore);
    wrap.hidden = !show;
    wrap.style.display = show ? '' : 'none';
    const btn = wrap.querySelector('.btn-show-more');
    if (btn) btn.disabled = !show;
}

function pickRandomN(items, count) {
    const pool = [...items];
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, count);
}

function shuffleAll(items) {
    return pickRandomN(items, items.length);
}

function buildBazaProductCardHtml(p) {
            const url = productPageUrl(p.slug);
            return `
                    <a href="${url}" class="product-card-link" title="${p.name} – białko, kalorie, węglowodany, tłuszcz">
                    <article class="product-card">
                        <div class="prod-header">
                            <div class="prod-img">${p.emoji}</div>
                            <div>
                                <div class="prod-title">${p.name}</div>
                                ${p.note ? `<div class="prod-note">💡 ${p.note}</div>` : ''}
                            </div>
                        </div>
                        <div class="prod-kcal-badge"><span class="kcal-highlight">${p.kcal} kcal</span> / 100 g</div>
                        <div class="prod-macros">
                            <div class="p-macro">Białko<div>${p.protein} g</div></div>
                            <div class="p-macro">Węgle<div>${p.carbs} g</div></div>
                            <div class="p-macro">Tłuszcz<div>${p.fat} g</div></div>
                        </div>
                        <div class="prod-details">
                            <div>• Nasycone: <strong>${p.satFat}g</strong> / Nienasycone: <strong>${p.unsatFat}g</strong></div>
                            <div>• <strong>Mikro:</strong> ${p.micros}</div>
                        </div>
                        <div class="product-card-cta">Szczegóły makro i kalorii →</div>
                    </article>
                    </a>`;
        }

        function debounce(fn, delayMs) {
            let timer;
            return function debounced(...args) {
                clearTimeout(timer);
                timer = setTimeout(() => fn.apply(this, args), delayMs);
            };
        }

        window.debouncedBazaSearchInput = debounce(() => {
            if (typeof resetCategoryOnProductSearch === 'function') {
                resetCategoryOnProductSearch('productSearch', 'bazaCategoryFilter');
            }
            if (typeof onDietaCategoryChange === 'function') onDietaCategoryChange('baza');
        }, 200);

        function renderProductsList(products, { append = false, fromIndex = 0, toIndex } = {}) {
            const grid = document.getElementById('productsGrid');
            if (!grid) return;
            const end = toIndex == null ? products.length : toIndex;
            const slice = append ? products.slice(fromIndex, end) : products;
            const html = slice.map((p) => buildBazaProductCardHtml(p)).join('');
            if (append) {
                grid.insertAdjacentHTML('beforeend', html);
            } else {
                grid.innerHTML = html;
            }
        }

        function getBazaSortKey() {
            return document.getElementById('bazaSortFilter')?.value || 'random';
        }

        function getBazaFilteredPool() {
            const cat = document.getElementById('bazaCategoryFilter')?.value || 'all';
            const query = (document.getElementById('productSearch')?.value || '').toLowerCase().trim();
            let pool = productsDatabase;
            if (cat !== 'all') {
                pool = pool.filter((p) => p.category === cat);
            }
            if (query) {
                pool = pool.filter((p) => p.name.toLowerCase().includes(query));
            }
            return { pool, cat, query };
        }

        function sortBazaProducts(pool, sortKey) {
            const list = [...pool];
            const byName = (a, b) => a.name.localeCompare(b.name, 'pl');

            switch (sortKey) {
                case 'random':
                    return shuffleAll(list);
                case 'name-asc':
                    return list.sort(byName);
                case 'name-desc':
                    return list.sort((a, b) => byName(b, a));
                case 'protein-desc':
                    return list.sort((a, b) => b.protein - a.protein || byName(a, b));
                case 'protein-asc':
                    return list.sort((a, b) => a.protein - b.protein || byName(a, b));
                case 'kcal-asc':
                    return list.sort((a, b) => a.kcal - b.kcal || byName(a, b));
                case 'kcal-desc':
                    return list.sort((a, b) => b.kcal - a.kcal || byName(a, b));
                case 'ratio-asc':
                    return list.sort((a, b) => {
                        const ra = typeof proteinPer100Kcal === 'function' ? proteinPer100Kcal(a) : null;
                        const rb = typeof proteinPer100Kcal === 'function' ? proteinPer100Kcal(b) : null;
                        const va = ra == null ? -1 : ra;
                        const vb = rb == null ? -1 : rb;
                        return vb - va || byName(a, b);
                    });
                case 'price-asc':
                    return list.sort((a, b) => {
                        const ca = proteinPricePer100g(a) ?? Infinity;
                        const cb = proteinPricePer100g(b) ?? Infinity;
                        return ca - cb || byName(a, b);
                    });
                default:
                    return list;
            }
        }

        function isBazaRandomMode(cat, query) {
            return cat === 'all' && !query && getBazaSortKey() === 'random';
        }

        function updateBazaRandomHeading() {
            const heading = document.getElementById('randomProductsHeading');
            if (!heading) return;
            const { cat, query } = getBazaFilteredPool();
            const total = bazaRandomPool.length;
            const shown = Math.min(bazaVisibleCount, total);
            if (isBazaRandomMode(cat, query)) {
                heading.innerHTML = `<span>${shown} losowych produktów</span> z naszej bazy`;
                return;
            }
            const catLabel =
                cat === 'all'
                    ? 'Wyniki'
                    : CATEGORY_LABELS[cat] || CATEGORY_SELECT_LABELS_DIETA[cat] || cat;
            const qEsc = query
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
            const suffix = query ? ` (wyszukiwanie: „${qEsc}”)` : '';
            heading.innerHTML = `<span>${catLabel}</span>${suffix} — wyświetlono ${shown} z ${total} produktów`;
        }

        function updateProductsShowMoreUi() {
            const wrap = document.getElementById('productsShowMoreWrap');
            const shown = Math.min(bazaVisibleCount, bazaRandomPool.length);
            setShowMoreWrapVisible(wrap, shown < bazaRandomPool.length);
        }

        function renderBazaVisibleProducts() {
            renderProductsList(bazaRandomPool.slice(0, bazaVisibleCount));
            updateBazaRandomHeading();
            updateProductsShowMoreUi();
        }

        function renderRandomProducts() {
            const search = document.getElementById('productSearch');
            const catSelect = document.getElementById('bazaCategoryFilter');
            const sortSelect = document.getElementById('bazaSortFilter');
            if (search) search.value = '';
            if (catSelect) catSelect.value = 'all';
            if (sortSelect) sortSelect.value = 'random';
            refreshBazaProducts();
        }

        function refreshBazaProducts() {
            const heading = document.getElementById('randomProductsHeading');
            const { pool, cat, query } = getBazaFilteredPool();
            const sortKey = getBazaSortKey();
            if (heading) heading.style.display = 'block';

            bazaRandomPool = sortBazaProducts(pool, sortKey);
            bazaVisibleCount = Math.min(RANDOM_PREVIEW_COUNT, bazaRandomPool.length);
            renderBazaVisibleProducts();
        }

        function showMoreBazaProducts() {
            if (bazaVisibleCount >= bazaRandomPool.length) {
                updateProductsShowMoreUi();
                return;
            }
            const prevCount = bazaVisibleCount;
            bazaVisibleCount = Math.min(
                bazaVisibleCount + BAZA_SHOW_MORE_STEP,
                bazaRandomPool.length
            );
            renderProductsList(bazaRandomPool, {
                append: true,
                fromIndex: prevCount,
                toIndex: bazaVisibleCount
            });
            updateBazaRandomHeading();
            updateProductsShowMoreUi();
        }

        window.showMoreBazaProducts = showMoreBazaProducts;

        // g białka / 100 kcal — wyżej = lepiej (zielony)
        const RATIO_GREEN = 24;
        const RATIO_RED = 2.8;
        const RATIO_SPAN = RATIO_GREEN - RATIO_RED;
        const COST_GREEN = 5;
        const COST_RED = 45;
        const COST_SPAN = COST_RED - COST_GREEN;

        function computeMaxxingPresentation(p) {
            const ratio = typeof proteinPer100Kcal === 'function' ? proteinPer100Kcal(p) : null;
            let bgStyle = '';
            let textStyle = 'color: #1f2937;';
            let badgeTextStyle = 'color: #0f172a;';
            let ratioText = '';

            if (ratio == null) {
                bgStyle = 'background-color: #fee2e2;';
                textStyle = 'color: #991b1b;';
                badgeTextStyle = 'color: #7f1d1d;';
                ratioText = 'Brak białka / kcal';
            } else {
                let score = (RATIO_GREEN - ratio) / (RATIO_SPAN || 1);
                if (score < 0) score = 0;
                if (score > 1) score = 1;
                const hue = 152 - score * 118;
                const sat = 68 + (1 - score) * 18;
                const lightBg = 91 - score * 5;
                const lightText = 24 + score * 4;
                const lightBadge = Math.max(14, lightText - 10);
                bgStyle = `background-color: hsl(${hue}, ${sat}%, ${lightBg}%);`;
                textStyle = `color: hsl(${hue}, ${Math.min(88, sat + 12)}%, ${lightText}%);`;
                badgeTextStyle = `color: hsl(${hue}, ${Math.min(92, sat + 16)}%, ${lightBadge}%);`;
                ratioText = `${ratio.toFixed(1)} g białka / 100 kcal`;
            }

            return { ratio: ratio == null ? -1 : ratio, bgStyle, textStyle, badgeTextStyle, ratioText };
        }

        function computePricePresentation(p) {
            const proteinCost = proteinPricePer100g(p);
            let bgStyle = '';
            let textStyle = 'color: #1f2937;';
            let costText = '';

            if (proteinCost == null) {
                bgStyle = 'background-color: #f3f4f6;';
                textStyle = 'color: #6b7280;';
                costText = 'Brak białka — brak ceny / 100 g białka';
            } else {
                let score = (proteinCost - COST_GREEN) / (COST_SPAN || 1);
                if (score < 0) score = 0;
                if (score > 1) score = 1;
                const hue = 152 - score * 118;
                const sat = 68 + (1 - score) * 18;
                const lightBg = 91 - score * 5;
                const lightText = 24 + score * 4;
                bgStyle = `background-color: hsl(${hue}, ${sat}%, ${lightBg}%);`;
                textStyle = `color: hsl(${hue}, ${Math.min(88, sat + 12)}%, ${lightText}%);`;
                costText = `${formatPln(proteinCost)} / 100 g białka`;
            }

            return { proteinCost, bgStyle, textStyle, costText };
        }

        function computePricePresentationFromCost(proteinCost) {
            let score = (proteinCost - COST_GREEN) / (COST_SPAN || 1);
            if (score < 0) score = 0;
            if (score > 1) score = 1;
            const hue = 152 - score * 118;
            const sat = 68 + (1 - score) * 18;
            const lightBg = 91 - score * 5;
            const lightText = 24 + score * 4;
            const bgStyle = `background-color: hsl(${hue}, ${sat}%, ${lightBg}%);`;
            const textStyle = `color: hsl(${hue}, ${Math.min(88, sat + 12)}%, ${lightText}%);`;
            const costText = `${formatPln(proteinCost)} / 100 g białka`;
            return { proteinCost, bgStyle, textStyle, costText };
        }

        const CHUDE_RYBY_GROUP = {
            id: 'chude-ryby',
            label: 'Chude ryby',
            emoji: '🐟',
            alwaysAggregate: true,
            test: (p) => /dorsz|sandacz|mintaj|halibut|flądra|fladra/i.test(p.name)
        };

        const MAKARON_SUCHY_GROUP = {
            id: 'makaron-suchy',
            label: 'Makaron',
            emoji: '🍝',
            alwaysAggregate: true,
            test: (p) => /makaron/i.test(p.name) && /\(suchy\)|\(sucha\)/i.test(p.name)
                && !/z |gotow|carbonara|pesto|kurcz|serem/i.test(p.name)
                && !/ryżowy|ryzowy/i.test(p.name)
        };

        /** Grupowanie w rankingu „Wszystkie kategorie” (nie w Top 10, nie w pojedynczej kategorii). */
        const RANKING_ALL_CATEGORY_GROUPS = [CHUDE_RYBY_GROUP, MAKARON_SUCHY_GROUP];

        function getRankingGroupCategory(ruleId) {
            if (ruleId === 'chude-ryby' || ruleId === 'watrobki') return 'mieso';
            if (ruleId === 'makaron-suchy') return 'makarony';
            if (
                ruleId === 'kasze'
                || ruleId === 'ryz-suchy'
                || ruleId === 'platki-zboz'
            ) {
                return 'zboza';
            }
            return null;
        }

        function navigateToRankingCategory(mode, category) {
            const subTabId = mode === 'maxxing' ? 'protein-max' : 'protein-price';
            const target = document.getElementById(subTabId);
            if (!target) return;

            const parent = target.closest('.page-with-subtabs');
            if (parent) {
                parent.querySelectorAll('.sub-tab-content').forEach((el) => el.classList.remove('active'));
                parent.querySelectorAll('.btn-sub').forEach((el) => el.classList.remove('active'));
                target.classList.add('active');
                const tabButtons = parent.querySelectorAll('.btn-sub');
                const tabIndex = subTabId === 'protein-max' ? 1 : subTabId === 'protein-price' ? 2 : 0;
                if (tabButtons[tabIndex]) tabButtons[tabIndex].classList.add('active');
            }

            const catSel = document.getElementById(
                mode === 'maxxing' ? 'categoryFilter' : 'priceCategoryFilter'
            );
            if (catSel) catSel.value = category;

            const searchEl = document.getElementById(
                mode === 'maxxing' ? 'proteinMaxSearch' : 'proteinPriceSearch'
            );
            if (searchEl) searchEl.value = '';

            if (mode === 'maxxing') renderProteinMaxxing();
            else renderProteinPrice();

            if (typeof syncDietaUrl === 'function') syncDietaUrl(true);

            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        window.navigateToRankingCategory = navigateToRankingCategory;

        const TOP10_MAXXING_GROUPS = [CHUDE_RYBY_GROUP];

        function formatTop10LeanFishSubtitle(members) {
            const names = members.map((m) => m.name).join(', ');
            return `Uśrednione: ${names}`;
        }

        const TOP10_PRICE_GROUPS = [
            MAKARON_SUCHY_GROUP,
            {
                id: 'kasze',
                label: 'Różne kasze',
                emoji: '🌾',
                test: (p) => /^kasza /i.test(p.name) || /^kuskus$/i.test(p.name.trim())
                    || /^bulgur/i.test(p.name)
            },
            {
                id: 'ryz-suchy',
                label: 'Różne ryże (suche)',
                emoji: '🍚',
                test: (p) => /^ryż/i.test(p.name) && (
                    /\(suchy\)|\(sucha\)/i.test(p.name)
                    || /^ryż biały$/i.test(p.name.trim())
                )
            },
            {
                id: 'platki-zboz',
                label: 'Płatki i musli (zboża)',
                emoji: '🥣',
                test: (p) => p.category === 'zboza' && /płatki|musli|granola/i.test(p.name)
            },
            {
                id: 'watrobki',
                label: 'Wątróbka',
                emoji: '🫀',
                test: (p) => /^wątróbka/i.test(p.name)
            }
        ];

        function stripTop10GroupNamePrefix(name, prefixRe) {
            return name.replace(prefixRe, '').trim();
        }

        function formatTop10ShortPriceNote(categoryWord, kinds, maxShown = 4) {
            const shown = kinds.slice(0, maxShown);
            const suffix = kinds.length > shown.length ? ' itp.' : '.';
            return `Uśredniona cena za ${categoryWord} ${shown.join(', ')}${suffix}`;
        }

        function shortenKaszaKind(name) {
            const n = name.trim();
            if (/^kuskus$/i.test(n)) return 'kuskus';
            if (/^bulgur/i.test(n)) {
                return 'bulgur';
            }
            return stripTop10GroupNamePrefix(n, /^kasza\s+/i)
                .replace(/\s*\((suchy|sucha|gotowana|Pęczak)\)\s*$/gi, '')
                .trim()
                .toLowerCase();
        }

        function formatTop10PriceGroupNote(rule, members) {
            if (rule.id === 'watrobki') {
                const kinds = members.map((m) =>
                    stripTop10GroupNamePrefix(m.name, /^wątróbka\s+/i).toLowerCase()
                );
                return kinds.join(' i ');
            }
            if (rule.id === 'makaron-suchy') {
                return '';
            }
            if (rule.id === 'kasze') {
                const kinds = members.map((m) => shortenKaszaKind(m.name));
                return formatTop10ShortPriceNote('kasza', kinds);
            }
            if (rule.id === 'ryz-suchy') {
                const kinds = members.map((m) =>
                    stripTop10GroupNamePrefix(m.name, /^ryż\s+/i)
                        .replace(/\s*\((suchy|sucha)\)\s*$/i, '')
                        .toLowerCase()
                );
                return formatTop10ShortPriceNote('ryż', kinds);
            }
            return formatTop10GroupNote(members);
        }

        function formatTop10GroupNote(members, maxNames = 5, mode = 'price') {
            const names = members.map((m) => m.name);
            const head = names.slice(0, maxNames).join(', ');
            const rest = names.length - maxNames;
            const tail = rest > 0 ? ` i ${rest} innych` : '';
            if (mode === 'maxxing') {
                return `Uśredniony wynik g białka / 100 kcal (${members.length} produktów): ${head}${tail}.`;
            }
            return `Uśredniona cena za 100 g białka (${members.length} produktów): ${head}${tail}.`;
        }

        function computeMaxxingPresentationFromRatio(ratio) {
            if (ratio == null || ratio < 0) {
                return {
                    ratio: -1,
                    bgStyle: 'background-color: #fee2e2;',
                    textStyle: 'color: #991b1b;',
                    badgeTextStyle: 'color: #7f1d1d;',
                    ratioText: 'Brak białka / kcal'
                };
            }
            let score = (RATIO_GREEN - ratio) / (RATIO_SPAN || 1);
            if (score < 0) score = 0;
            if (score > 1) score = 1;
            const hue = 152 - score * 118;
            const sat = 68 + (1 - score) * 18;
            const lightBg = 91 - score * 5;
            const lightText = 24 + score * 4;
            const lightBadge = Math.max(14, lightText - 10);
            const bgStyle = `background-color: hsl(${hue}, ${sat}%, ${lightBg}%);`;
            const textStyle = `color: hsl(${hue}, ${Math.min(88, sat + 12)}%, ${lightText}%);`;
            const badgeTextStyle = `color: hsl(${hue}, ${Math.min(92, sat + 16)}%, ${lightBadge}%);`;
            const ratioText = `${ratio.toFixed(1)} g białka / 100 kcal`;
            return { ratio, bgStyle, textStyle, badgeTextStyle, ratioText };
        }

        function aggregateTop10MaxxingGroup(rule, members) {
            const avgRatio = Math.round(
                (members.reduce((s, m) => s + m.ratio, 0) / members.length) * 10
            ) / 10;
            const isLeanFish = rule.id === 'chude-ryby';
            const isMakaron = rule.id === 'makaron-suchy';
            return {
                name: rule.label,
                emoji: rule.emoji,
                isGroup: true,
                groupCount: members.length,
                groupSubtitle: isLeanFish ? formatTop10LeanFishSubtitle(members) : null,
                groupNote: isLeanFish ? '' : isMakaron ? '' : formatTop10GroupNote(members, 5, 'maxxing'),
                groupCategory: getRankingGroupCategory(rule.id),
                ratio: avgRatio,
                _pres: computeMaxxingPresentationFromRatio(avgRatio)
            };
        }

        function aggregateTop10PriceGroup(rule, members) {
            const avgCost = Math.round(
                (members.reduce((s, m) => s + m.proteinCost, 0) / members.length) * 100
            ) / 100;
            return {
                name: rule.label,
                emoji: rule.emoji,
                isGroup: true,
                groupCount: members.length,
                groupNote: formatTop10PriceGroupNote(rule, members),
                groupCategory: getRankingGroupCategory(rule.id),
                proteinCost: avgCost,
                _pres: computePricePresentationFromCost(avgCost)
            };
        }

        function applyRankingGroupsForAllCategory(items, mode) {
            const buckets = new Map();

            for (const p of items) {
                const rule = RANKING_ALL_CATEGORY_GROUPS.find((g) => g.test(p));
                const key = rule ? rule.id : p.slug;
                if (!buckets.has(key)) {
                    buckets.set(key, { rule, members: [] });
                }
                buckets.get(key).members.push(p);
            }

            const aggregated = [];
            for (const [, bucket] of buckets) {
                const { rule, members } = bucket;
                if (rule && (rule.alwaysAggregate || members.length > 1)) {
                    aggregated.push(
                        mode === 'maxxing'
                            ? aggregateTop10MaxxingGroup(rule, members)
                            : aggregateTop10PriceGroup(rule, members)
                    );
                } else {
                    aggregated.push(members[0]);
                }
            }
            return aggregated;
        }

        function getTop10ProteinMaxxing() {
            const scored = productsDatabase
                .filter(p => p.protein > 0)
                .map(p => {
                    const pres = computeMaxxingPresentation(p);
                    return { ...p, ratio: pres.ratio, _pres: pres };
                });

            const buckets = new Map();

            for (const p of scored) {
                const rule = TOP10_MAXXING_GROUPS.find((g) => g.test(p));
                const key = rule ? rule.id : p.slug;
                if (!buckets.has(key)) {
                    buckets.set(key, { rule, members: [] });
                }
                buckets.get(key).members.push(p);
            }

            const aggregated = [];
            for (const [, bucket] of buckets) {
                const { rule, members } = bucket;
                if (rule && (rule.alwaysAggregate || members.length > 1)) {
                    aggregated.push(aggregateTop10MaxxingGroup(rule, members));
                } else {
                    aggregated.push(members[0]);
                }
            }

            return aggregated
                .sort((a, b) => b.ratio - a.ratio)
                .slice(0, 10);
        }

        function getTop10ProteinPrice() {
            const scored = productsDatabase
                .map(p => {
                    const pres = computePricePresentation(p);
                    return { ...p, proteinCost: pres.proteinCost, _pres: pres };
                })
                .filter(p => p.proteinCost != null);

            const buckets = new Map();

            for (const p of scored) {
                const rule = TOP10_PRICE_GROUPS.find((g) => g.test(p));
                const key = rule ? rule.id : p.slug;
                if (!buckets.has(key)) {
                    buckets.set(key, { rule, members: [] });
                }
                buckets.get(key).members.push(p);
            }

            const aggregated = [];
            for (const [, bucket] of buckets) {
                const { rule, members } = bucket;
                if (rule && members.length > 1) {
                    aggregated.push(aggregateTop10PriceGroup(rule, members));
                } else {
                    aggregated.push(members[0]);
                }
            }

            return aggregated
                .sort((a, b) => a.proteinCost - b.proteinCost)
                .slice(0, 10);
        }

        function buildPodiumSlotHTML(p, rank, statHtml, pres, mode) {
            const podiumClass = rank === 1 ? 'pm-podium-1' : rank === 2 ? 'pm-podium-2' : 'pm-podium-3';
            const groupSubtitle = p.isGroup && p.groupSubtitle
                ? `<p class="pm-group-subtitle" style="${pres.textStyle}">${p.groupSubtitle}</p>`
                : '';
            const groupNote = p.isGroup && p.groupNote
                ? `<p class="pm-group-note" style="${pres.textStyle}">${p.groupNote}</p>`
                : '';
            const inner = `
                        <div class="pm-podium-rank">${rank}</div>
                        <div class="pm-podium-emoji">${p.emoji}</div>
                        <div class="pm-podium-name" style="${pres.textStyle}">${p.name}</div>
                        ${groupSubtitle}
                        <div class="pm-podium-stat pm-stat-muted">${statHtml}</div>
                        ${groupNote}`;

            if (p.isGroup && p.groupCategory) {
                return `
                <div class="pm-podium-slot ${podiumClass}">
                    <a href="#" class="pm-podium-card pm-podium-card--group" style="${pres.bgStyle}" title="${p.name}"
                        onclick="event.preventDefault(); navigateToRankingCategory('${mode}', '${p.groupCategory}');">
                        ${inner}
                    </a>
                </div>`;
            }

            if (p.isGroup) {
                return `
                <div class="pm-podium-slot ${podiumClass}">
                    <div class="pm-podium-card pm-podium-card--group" style="${pres.bgStyle}" title="${p.name}">
                        ${inner}
                    </div>
                </div>`;
            }

            const url = productPageUrl(p.slug);
            return `
                <div class="pm-podium-slot ${podiumClass}">
                    <a href="${url}" class="pm-podium-card" style="${pres.bgStyle}" title="${p.name}">
                        ${inner}
                    </a>
                </div>`;
        }

        function buildTop10ListItemHTML(p, rank, statText, mode) {
            if (p.isGroup && p.groupCategory) {
                return `
                <li class="pm-top10-list-item--group">
                    <a href="#" class="pm-top10-list-row" title="${p.name}"
                        onclick="event.preventDefault(); navigateToRankingCategory('${mode}', '${p.groupCategory}');"
                        style="display:flex;align-items:center;gap:14px;padding:14px 16px;background:var(--white);border:1px solid var(--border);border-radius:var(--radius-md);box-shadow:var(--shadow-sm);text-decoration:none;color:inherit;">
                        <span class="pm-list-rank">${rank}</span>
                        <span class="pm-list-emoji">${p.emoji}</span>
                        <span class="pm-list-body">
                            <div class="pm-list-name">${p.name}</div>
                            ${p.groupSubtitle ? `<p class="pm-group-subtitle">${p.groupSubtitle}</p>` : ''}
                            <div class="pm-list-stat pm-stat-muted">${statText}</div>
                            ${p.groupNote ? `<p class="pm-group-note">${p.groupNote}</p>` : ''}
                        </span>
                        <span class="pm-list-arrow">→</span>
                    </a>
                </li>`;
            }

            if (p.isGroup) {
                return `
                <li class="pm-top10-list-item--group">
                    <div class="pm-top10-list-row" style="display:flex;align-items:center;gap:14px;padding:14px 16px;background:var(--white);border:1px solid var(--border);border-radius:var(--radius-md);box-shadow:var(--shadow-sm);">
                        <span class="pm-list-rank">${rank}</span>
                        <span class="pm-list-emoji">${p.emoji}</span>
                        <span class="pm-list-body">
                            <div class="pm-list-name">${p.name}</div>
                            ${p.groupSubtitle ? `<p class="pm-group-subtitle">${p.groupSubtitle}</p>` : ''}
                            <div class="pm-list-stat pm-stat-muted">${statText}</div>
                            ${p.groupNote ? `<p class="pm-group-note">${p.groupNote}</p>` : ''}
                        </span>
                    </div>
                </li>`;
            }

            const url = productPageUrl(p.slug);
            return `
                <li>
                    <a href="${url}" title="${p.name}">
                        <span class="pm-list-rank">${rank}</span>
                        <span class="pm-list-emoji">${p.emoji}</span>
                        <span class="pm-list-body">
                            <div class="pm-list-name">${p.name}</div>
                            <div class="pm-list-stat pm-stat-muted">${statText}</div>
                        </span>
                        <span class="pm-list-arrow">→</span>
                    </a>
                </li>`;
        }

        function renderTop10Podium(grid, top10, mode) {
            grid.classList.add('pm-top10-mode');
            if (top10.length < 3) {
                grid.innerHTML = '<p style="text-align:center;color:var(--text-muted);">Za mało produktów w bazie do rankingu Top 10.</p>';
                return;
            }

            const lead = mode === 'maxxing'
                ? 'Najwięcej białka na 100 kcal — podium i miejsca 4–10'
                : 'Najbardziej ekonomiczne źródła 100 g białka. Pamiętaj, że wiele z nich dostarcza również sporą ilość węglowodanów i kalorii, dlatego uwzględnij je w swoim bilansie z głową.';

            const podiumOrder = [
                { p: top10[1], rank: 2 },
                { p: top10[0], rank: 1 },
                { p: top10[2], rank: 3 }
            ];

            let podiumHtml = '';
            podiumOrder.forEach(({ p, rank }) => {
                const pres = p._pres;
                const stat = mode === 'maxxing' ? pres.ratioText : pres.costText;
                podiumHtml += buildPodiumSlotHTML(p, rank, stat, pres, mode);
            });

            let listHtml = '';
            top10.slice(3).forEach((p, i) => {
                const rank = i + 4;
                const pres = p._pres;
                const stat = mode === 'maxxing' ? pres.ratioText : pres.costText;
                listHtml += buildTop10ListItemHTML(p, rank, stat, mode);
            });

            grid.innerHTML = `
                <div class="pm-top10-wrap">
                    <p class="pm-top10-lead">${lead}</p>
                    <div class="pm-podium">${podiumHtml}</div>
                    <p class="pm-top10-rest-title">Miejsca 4–10</p>
                    <ol class="pm-top10-list" start="4">${listHtml}</ol>
                </div>`;
        }

        function setRankingSearchVisible(mode, cat) {
            const searchId = mode === 'maxxing' ? 'proteinMaxSearch' : 'proteinPriceSearch';
            const searchEl = document.getElementById(searchId);
            const searchBar = searchEl?.closest('.search-bar');
            if (searchBar) searchBar.style.display = cat === 'top10' ? 'none' : '';
            if (cat === 'top10' && searchEl) searchEl.value = '';
        }

        function updateRankingShowMoreUi(wrapId, visibleCount, total, paginate) {
            const wrap = document.getElementById(wrapId);
            const shown = Math.min(visibleCount, total);
            setShowMoreWrapVisible(wrap, paginate && total > 0 && shown < total);
        }

        function updateRankingHeading(headingEl, visibleCount, total, cat, query) {
            if (!headingEl) return;
            if (query || total === 0) {
                headingEl.style.display = 'none';
                return;
            }
            const to = Math.min(visibleCount, total);
            headingEl.style.display = 'block';
            const range = total > 0 ? `miejsca 1–${to}` : '';
            if (cat === 'all') {
                headingEl.innerHTML = `<span>Ranking ${total} produktów w bazie:</span>`;
            } else {
                headingEl.innerHTML = `<span>Ranking w kategorii — ${range}</span> (${total} produktów)`;
            }
        }

        function buildRankBadgeHtml(rank) {
            if (rank == null) return '';
            return `<div class="pm-rank-badge" aria-label="Miejsce ${rank}">#${rank}</div>`;
        }

        function appendGroupRankingCardLink(grid, cardHtml, p, mode) {
            const catLabel =
                p.groupCategory === 'makarony'
                    ? 'Makarony'
                    : p.groupCategory === 'zboza'
                      ? 'Zboża i kasze'
                      : 'Mięsa i Ryby';
            grid.innerHTML += `
                    <a href="#" class="product-card-link" role="group"
                        aria-label="${p.name} — przejdź do kategorii ${catLabel}"
                        title="Przejdź do kategorii ${catLabel}"
                        onclick="event.preventDefault(); navigateToRankingCategory('${mode}', '${p.groupCategory}');">
                    ${cardHtml}
                    </a>`;
        }

        function buildRankingGroupDetailsHtml(p, mode) {
            if (p.name === 'Makaron') {
                return '';
            }
            if (p.name === 'Chude ryby') {
                if (mode === 'maxxing') {
                    return '';
                }
                return `<div class="prod-details" style="border-top: 1px dashed rgba(0,0,0,0.1); color: var(--text-dark); opacity: 0.9;">
                            <div style="font-size:0.82rem;">Wybierz kategorię <strong>Mięsa i Ryby</strong>, aby zobaczyć każdą rybę osobno.</div>
                        </div>`;
            }
            return p.groupNote
                ? `<div class="prod-details" style="border-top: 1px dashed rgba(0,0,0,0.1); color: var(--text-dark); opacity: 0.9;">
                            <div style="font-size:0.82rem;">${p.groupNote}</div>
                        </div>`
                : '';
        }

        function appendMaxxingRankingCard(grid, p, rank) {
            const pres = p._pres || computeMaxxingPresentation(p);
            const { bgStyle, textStyle, ratioText } = pres;
            const macroLine = p.isGroup
                ? (p.groupSubtitle
                    || (p.name === 'Makaron'
                        ? `Średnia z ${p.groupCount} makaronów (suche)`
                        : p.groupNote || `Średnia z ${p.groupCount} produktów w grupie`))
                : '';
            const detailsHtml = p.isGroup ? buildRankingGroupDetailsHtml(p, 'maxxing') : '';
            const cta = p.isGroup && p.groupCategory
                ? 'Przejdź do kategorii →'
                : p.isGroup
                    ? 'Grupa produktów — szczegóły w kategorii'
                    : 'Pełna karta produktu →';
            const cardHtml = `
                    <article class="product-card pm-ranked-card" style="${bgStyle}">
                        ${buildRankBadgeHtml(rank)}
                        <div class="prod-header">
                            <div class="prod-img" style="background: rgba(255,255,255,0.5);">${p.emoji}</div>
                            <div>
                                <div class="prod-title" style="${textStyle}">${p.name}</div>
                                ${macroLine ? `<div style="font-size: 0.8rem; opacity: 0.85; font-weight:600; ${textStyle}">${macroLine}</div>` : ''}
                            </div>
                        </div>
                        <div class="pm-ratio-badge pm-stat-muted">
                            ${ratioText}
                        </div>
                        ${detailsHtml}
                        <div class="product-card-cta" style="${textStyle}">${cta}</div>
                    </article>`;

            if (p.isGroup && p.groupCategory) {
                appendGroupRankingCardLink(grid, cardHtml, p, 'maxxing');
                return;
            }
            if (p.isGroup) {
                grid.innerHTML += `<div class="product-card-link pm-card-static" role="group" aria-label="${p.name}">${cardHtml}</div>`;
                return;
            }
            const url = productPageUrl(p.slug);
            grid.innerHTML += `
                    <a href="${url}" class="product-card-link" title="${p.name} – ranking białko maxxing">
                    ${cardHtml}
                    </a>`;
        }

        function appendPriceRankingCard(grid, p, rank) {
            const pres = p._pres || computePricePresentation(p);
            const { bgStyle, textStyle, costText } = pres;
            const detailsHtml = p.isGroup ? buildRankingGroupDetailsHtml(p, 'price') : '';
            const cta = p.isGroup && p.groupCategory
                ? 'Przejdź do kategorii →'
                : p.isGroup
                    ? 'Grupa produktów — szczegóły w kategorii'
                    : 'Pełna karta produktu →';
            const cardHtml = `
                    <article class="product-card pm-ranked-card" style="${bgStyle}">
                        ${buildRankBadgeHtml(rank)}
                        <div class="prod-header">
                            <div class="prod-img" style="background: rgba(255,255,255,0.5);">${p.emoji}</div>
                            <div>
                                <div class="prod-title" style="${textStyle}">${p.name}</div>
                            </div>
                        </div>
                        <div class="pm-ratio-badge pm-stat-muted">
                            ${costText}
                        </div>
                        ${detailsHtml}
                        <div class="product-card-cta" style="${textStyle}">${cta}</div>
                    </article>`;

            if (p.isGroup && p.groupCategory) {
                appendGroupRankingCardLink(grid, cardHtml, p, 'price');
                return;
            }
            if (p.isGroup) {
                grid.innerHTML += `<div class="product-card-link pm-card-static" role="group" aria-label="${p.name}">${cardHtml}</div>`;
                return;
            }
            const url = productPageUrl(p.slug);
            grid.innerHTML += `
                    <a href="${url}" class="product-card-link" title="${p.name} – cena za 100g białka">
                    ${cardHtml}
                    </a>`;
        }

        function renderProteinMaxxing() {
            const catReset =
                typeof resetCategoryOnProductSearch === 'function' &&
                resetCategoryOnProductSearch('proteinMaxSearch', 'categoryFilter');
            if (catReset && typeof syncRankingPageUrl === 'function') {
                syncRankingPageUrl('all', false);
            }
            const cat = document.getElementById('categoryFilter').value;
            const query = (document.getElementById('proteinMaxSearch')?.value || '').toLowerCase().trim();
            const grid = document.getElementById('proteinMaxxingGrid');
            const heading = document.getElementById('proteinMaxRandomHeading');
            const showMoreWrapId = 'proteinMaxShowMoreWrap';
            grid.innerHTML = '';
            grid.classList.remove('pm-top10-mode');
            setRankingSearchVisible('maxxing', cat);
            updateRankingShowMoreUi(showMoreWrapId, 0, 0, false);

            if (cat === 'top10') {
                if (heading) heading.style.display = 'none';
                renderTop10Podium(grid, getTop10ProteinMaxxing(), 'maxxing');
                return;
            }

            let filtered = cat === 'all' ? [...productsDatabase] : productsDatabase.filter(p => p.category === cat);
            if (query) {
                filtered = filtered.filter(p => p.name.toLowerCase().includes(query));
            }

            filtered.forEach(p => {
                const density = typeof proteinPer100Kcal === 'function' ? proteinPer100Kcal(p) : null;
                p.ratio = density == null ? -1 : density;
            });
            if (cat === 'all' && !query) {
                filtered = applyRankingGroupsForAllCategory(filtered, 'maxxing');
            }
            filtered.sort((a, b) => b.ratio - a.ratio);

            const listKey = `${cat}|${query}`;
            if (listKey !== maxxingListKey) {
                maxxingListKey = listKey;
                maxxingVisibleCount = RANDOM_PREVIEW_COUNT;
            }
            maxxingRankedPool = filtered;
            maxxingVisibleCount = Math.min(maxxingVisibleCount, filtered.length);

            const paginate = !query;
            const visible = paginate ? filtered.slice(0, maxxingVisibleCount) : filtered;

            updateRankingHeading(heading, visible.length, filtered.length, cat, query);
            updateRankingShowMoreUi(showMoreWrapId, maxxingVisibleCount, filtered.length, paginate);

            visible.forEach((p, index) => {
                appendMaxxingRankingCard(grid, p, paginate ? index + 1 : null);
            });
        }

        function appendMoreProteinMaxxingCards() {
            const grid = document.getElementById('proteinMaxxingGrid');
            const heading = document.getElementById('proteinMaxRandomHeading');
            const cat = document.getElementById('categoryFilter').value;
            const query = (document.getElementById('proteinMaxSearch')?.value || '').toLowerCase().trim();
            const paginate = !query;
            const prevCount = maxxingVisibleCount;
            maxxingVisibleCount = Math.min(
                maxxingVisibleCount + BAZA_SHOW_MORE_STEP,
                maxxingRankedPool.length
            );
            for (let i = prevCount; i < maxxingVisibleCount; i++) {
                appendMaxxingRankingCard(grid, maxxingRankedPool[i], paginate ? i + 1 : null);
            }
            updateRankingHeading(heading, maxxingVisibleCount, maxxingRankedPool.length, cat, query);
            updateRankingShowMoreUi(
                'proteinMaxShowMoreWrap',
                maxxingVisibleCount,
                maxxingRankedPool.length,
                paginate
            );
        }

        function showMoreProteinMaxxing() {
            if (maxxingVisibleCount >= maxxingRankedPool.length) {
                updateRankingShowMoreUi('proteinMaxShowMoreWrap', maxxingVisibleCount, maxxingRankedPool.length, true);
                return;
            }
            appendMoreProteinMaxxingCards();
        }

        function renderProteinPrice() {
            const catReset =
                typeof resetCategoryOnProductSearch === 'function' &&
                resetCategoryOnProductSearch('proteinPriceSearch', 'priceCategoryFilter');
            if (catReset && typeof syncRankingPageUrl === 'function') {
                syncRankingPageUrl('all', false);
            }
            const cat = document.getElementById('priceCategoryFilter').value;
            const query = (document.getElementById('proteinPriceSearch')?.value || '').toLowerCase().trim();
            const grid = document.getElementById('proteinPriceGrid');
            const heading = document.getElementById('proteinPriceHeading');
            const showMoreWrapId = 'proteinPriceShowMoreWrap';
            grid.innerHTML = '';
            grid.classList.remove('pm-top10-mode');
            setRankingSearchVisible('price', cat);
            updateRankingShowMoreUi(showMoreWrapId, 0, 0, false);

            if (cat === 'top10') {
                if (heading) heading.style.display = 'none';
                renderTop10Podium(grid, getTop10ProteinPrice(), 'price');
                return;
            }

            let filtered = cat === 'all'
                ? [...productsDatabase]
                : productsDatabase.filter(p => p.category === cat);
            if (query) {
                filtered = filtered.filter(p => p.name.toLowerCase().includes(query));
            }

            filtered.forEach(p => {
                p.proteinCost = proteinPricePer100g(p);
            });
            if (cat === 'all' && !query) {
                filtered = applyRankingGroupsForAllCategory(filtered, 'price');
            }
            filtered.sort((a, b) => {
                const ca = a.proteinCost ?? Infinity;
                const cb = b.proteinCost ?? Infinity;
                return ca - cb;
            });

            const listKey = `${cat}|${query}`;
            if (listKey !== priceListKey) {
                priceListKey = listKey;
                priceVisibleCount = RANDOM_PREVIEW_COUNT;
            }
            priceRankedPool = filtered;
            priceVisibleCount = Math.min(priceVisibleCount, filtered.length);

            const paginate = !query;
            const visible = paginate ? filtered.slice(0, priceVisibleCount) : filtered;

            updateRankingHeading(heading, visible.length, filtered.length, cat, query);
            updateRankingShowMoreUi(showMoreWrapId, priceVisibleCount, filtered.length, paginate);

            visible.forEach((p, index) => {
                appendPriceRankingCard(grid, p, paginate ? index + 1 : null);
            });
        }

        function appendMoreProteinPriceCards() {
            const grid = document.getElementById('proteinPriceGrid');
            const heading = document.getElementById('proteinPriceHeading');
            const cat = document.getElementById('priceCategoryFilter').value;
            const query = (document.getElementById('proteinPriceSearch')?.value || '').toLowerCase().trim();
            const paginate = !query;
            const prevCount = priceVisibleCount;
            priceVisibleCount = Math.min(
                priceVisibleCount + BAZA_SHOW_MORE_STEP,
                priceRankedPool.length
            );
            for (let i = prevCount; i < priceVisibleCount; i++) {
                appendPriceRankingCard(grid, priceRankedPool[i], paginate ? i + 1 : null);
            }
            updateRankingHeading(heading, priceVisibleCount, priceRankedPool.length, cat, query);
            updateRankingShowMoreUi(
                'proteinPriceShowMoreWrap',
                priceVisibleCount,
                priceRankedPool.length,
                paginate
            );
        }

        function showMoreProteinPrice() {
            if (priceVisibleCount >= priceRankedPool.length) {
                updateRankingShowMoreUi('proteinPriceShowMoreWrap', priceVisibleCount, priceRankedPool.length, true);
                return;
            }
            appendMoreProteinPriceCards();
        }

        window.renderProteinMaxxing = renderProteinMaxxing;
        window.renderProteinPrice = renderProteinPrice;
        window.showMoreProteinMaxxing = showMoreProteinMaxxing;
        window.showMoreProteinPrice = showMoreProteinPrice;

        function filterProducts() {
            refreshBazaProducts();
        }

        window.filterProducts = filterProducts;
        window.refreshBazaProducts = refreshBazaProducts;
        window.renderRandomProducts = renderRandomProducts;

        function initDietaCategorySelects() {
            populateCategorySelect(document.getElementById('bazaCategoryFilter'));
            populateCategorySelect(document.getElementById('categoryFilter'), { includeTop10: true });
            populateCategorySelect(document.getElementById('priceCategoryFilter'), { includeTop10: true });
        }

        async function bootDietaPage() {
            if (typeof ensureProductsDatabase === 'function') {
                await ensureProductsDatabase();
            }

        if (document.getElementById('productsGrid')) {
            initDietaCategorySelects();
            const urlKat =
                typeof getKategoriaFromUrl === 'function'
                    ? getKategoriaFromUrl()
                    : new URLSearchParams(window.location.search).get('kategoria');
            const bazaSel = document.getElementById('bazaCategoryFilter');
            if (
                urlKat &&
                urlKat !== 'all' &&
                bazaSel &&
                Array.from(bazaSel.options).some((o) => o.value === urlKat)
            ) {
                bazaSel.value = urlKat;
                refreshBazaProducts();
            } else {
                renderRandomProducts();
            }
        }

        if (typeof initDietaFromUrl === 'function') initDietaFromUrl();
        }

        bootDietaPage().catch((err) => console.error('dieta:', err));
