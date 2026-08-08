/**
 * Zakładka Dieta → Sklepy: wybór sieci (produkty / rankingi — później).
 */
(function () {
    let activeStoreId = 'biedronka';

    function escapeHtml(str) {
        return String(str ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function parseHash() {
        const raw = (window.location.hash || '').replace(/^#/, '').trim();
        if (!raw) return;
        const storePart = decodeURIComponent(raw.split('/')[0] || '').trim().toLowerCase();
        if (STORE_CATALOG.some((s) => s.id === storePart)) {
            activeStoreId = storePart;
        }
    }

    function syncHash(replace) {
        const next = `${window.location.pathname}#${activeStoreId}`;
        const current = `${window.location.pathname}${window.location.hash}`;
        if (next === current) return;
        const fn = replace ? history.replaceState : history.pushState;
        fn.call(history, {}, '', next);
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

    function renderMeta() {
        const store = getStoreById(activeStoreId);
        const title = document.getElementById('sklepyActiveTitle');
        const blurb = document.getElementById('sklepyActiveBlurb');
        const article = document.getElementById('sklepyArticleLink');
        const placeholder = document.getElementById('sklepyPlaceholder');

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
        if (placeholder) {
            placeholder.textContent = `Produkty i rankingi dla sieci ${store.name} pojawią się wkrótce.`;
        }
    }

    function renderAll() {
        renderStoreChips();
        renderMeta();
    }

    function boot() {
        parseHash();
        renderAll();
        syncHash(true);
        window.addEventListener('hashchange', () => {
            parseHash();
            renderAll();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
