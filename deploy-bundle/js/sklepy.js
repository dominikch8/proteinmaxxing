/**
 * Zakładka Dieta → Sklepy: wybór sieci + Top 10 białko/kcal lub cena/białko.
 */
(function () {
    const MODE_RATIO = 'ratio';
    const MODE_PRICE = 'price';

    let activeStoreId = 'biedronka';
    let activeMode = MODE_RATIO;

    function escapeHtml(str) {
        return String(str ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function proteinPer100kcal(p) {
        if (!p || !(p.kcal > 0) || p.protein == null) return null;
        return (p.protein * 100) / p.kcal;
    }

    function parseHash() {
        const raw = (window.location.hash || '').replace(/^#/, '').trim();
        if (!raw) return;
        const parts = raw.split('/').map((p) => decodeURIComponent(p).trim().toLowerCase());
        const storePart = parts[0];
        if (STORE_CATALOG.some((s) => s.id === storePart)) {
            activeStoreId = storePart;
        }
        if (parts[1] === 'cena' || parts[1] === 'price') activeMode = MODE_PRICE;
        if (parts[1] === 'bialko' || parts[1] === 'ratio' || parts[1] === 'maxxing') activeMode = MODE_RATIO;
    }

    function syncHash(replace) {
        const modeSeg = activeMode === MODE_PRICE ? 'cena' : 'bialko';
        const next = `${window.location.pathname}#${activeStoreId}/${modeSeg}`;
        const current = `${window.location.pathname}${window.location.hash}`;
        if (next === current) return;
        const fn = replace ? history.replaceState : history.pushState;
        fn.call(history, {}, '', next);
    }

    function productsForStore(storeId) {
        const slugSet = new Set(getStoreAssortmentSlugs(storeId));
        const db = typeof productsDatabase !== 'undefined' ? productsDatabase : [];
        return db.filter((p) => p.slug && slugSet.has(p.slug));
    }

    function rankProducts(list, mode) {
        if (mode === MODE_PRICE) {
            return list
                .map((p) => {
                    const cost = typeof proteinPricePer100g === 'function' ? proteinPricePer100g(p) : null;
                    return { ...p, _score: cost, _stat: cost };
                })
                .filter((p) => p._score != null && Number.isFinite(p._score))
                .sort((a, b) => a._score - b._score)
                .slice(0, 10);
        }
        return list
            .map((p) => {
                const ratio = proteinPer100kcal(p);
                return { ...p, _score: ratio, _stat: ratio };
            })
            .filter((p) => p._score != null && Number.isFinite(p._score))
            .sort((a, b) => b._score - a._score)
            .slice(0, 10);
    }

    function formatStat(p, mode) {
        if (mode === MODE_PRICE) {
            const pln = typeof formatPln === 'function' ? formatPln(p._stat) : `${p._stat.toFixed(2)} zł`;
            return `${pln} / 100 g białka`;
        }
        return `${p._stat.toFixed(1)} g białka / 100 kcal · ${p.protein} g B / ${p.kcal} kcal`;
    }

    function renderStoreChips() {
        const wrap = document.getElementById('sklepyStoreChips');
        if (!wrap) return;
        wrap.innerHTML = STORE_CATALOG.map((s) => {
            const active = s.id === activeStoreId ? ' is-active' : '';
            return `<button type="button" class="sklepy-chip${active}" data-store="${escapeHtml(s.id)}" aria-pressed="${s.id === activeStoreId}">
                <span class="sklepy-chip-emoji" aria-hidden="true">${s.emoji}</span>
                <span class="sklepy-chip-label">${escapeHtml(s.name)}</span>
            </button>`;
        }).join('');

        wrap.querySelectorAll('[data-store]').forEach((btn) => {
            btn.addEventListener('click', () => {
                activeStoreId = btn.getAttribute('data-store');
                syncHash(false);
                renderAll();
            });
        });
    }

    function renderModeToggle() {
        const wrap = document.getElementById('sklepyModeToggle');
        if (!wrap) return;
        wrap.querySelectorAll('[data-mode]').forEach((btn) => {
            const mode = btn.getAttribute('data-mode');
            const on = mode === activeMode;
            btn.classList.toggle('is-active', on);
            btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
    }

    function renderMeta() {
        const store = getStoreById(activeStoreId);
        const title = document.getElementById('sklepyActiveTitle');
        const blurb = document.getElementById('sklepyActiveBlurb');
        const article = document.getElementById('sklepyArticleLink');
        const heading = document.getElementById('sklepyRankingHeading');

        if (title) title.textContent = `${store.emoji} ${store.name}`;
        if (blurb) blurb.textContent = store.blurb;
        if (article) {
            if (store.article) {
                article.hidden = false;
                article.href = store.article;
                article.textContent = `Przewodnik: źródła białka w ${store.name} →`;
            } else {
                article.hidden = true;
            }
        }
        if (heading) {
            heading.textContent =
                activeMode === MODE_PRICE
                    ? `Top 10 — najtańsze białko (${store.name})`
                    : `Top 10 — białko / kalorie (${store.name})`;
        }
    }

    function renderRanking() {
        const grid = document.getElementById('sklepyRankingList');
        const empty = document.getElementById('sklepyEmpty');
        if (!grid) return;

        const ranked = rankProducts(productsForStore(activeStoreId), activeMode);
        if (!ranked.length) {
            grid.innerHTML = '';
            if (empty) empty.hidden = false;
            return;
        }
        if (empty) empty.hidden = true;

        grid.innerHTML = ranked
            .map((p, i) => {
                const rank = i + 1;
                const url = typeof productPageUrl === 'function' ? productPageUrl(p.slug) : `produkty/${p.slug}`;
                const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;
                return `<li class="sklepy-rank-item">
                    <a class="sklepy-rank-card" href="${escapeHtml(url)}">
                        <span class="sklepy-rank-pos" aria-hidden="true">${medal}</span>
                        <span class="sklepy-rank-emoji" aria-hidden="true">${p.emoji || '🍽️'}</span>
                        <span class="sklepy-rank-body">
                            <span class="sklepy-rank-name">${escapeHtml(p.name)}</span>
                            <span class="sklepy-rank-stat">${escapeHtml(formatStat(p, activeMode))}</span>
                        </span>
                        <span class="sklepy-rank-arrow" aria-hidden="true">→</span>
                    </a>
                </li>`;
            })
            .join('');
    }

    function renderAll() {
        renderStoreChips();
        renderModeToggle();
        renderMeta();
        renderRanking();
    }

    function bindModeToggle() {
        const wrap = document.getElementById('sklepyModeToggle');
        if (!wrap) return;
        wrap.querySelectorAll('[data-mode]').forEach((btn) => {
            btn.addEventListener('click', () => {
                activeMode = btn.getAttribute('data-mode') === MODE_PRICE ? MODE_PRICE : MODE_RATIO;
                syncHash(false);
                renderAll();
            });
        });
    }

    function boot() {
        parseHash();
        bindModeToggle();
        renderAll();
        syncHash(true);
        window.addEventListener('hashchange', () => {
            parseHash();
            renderAll();
        });
    }

    function start() {
        const loader =
            typeof ensureProductsDatabase === 'function'
                ? ensureProductsDatabase
                : typeof loadProductsDatabase === 'function'
                  ? loadProductsDatabase
                  : null;
        if (loader) {
            Promise.resolve(loader()).then(boot).catch(boot);
        } else {
            boot();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();
