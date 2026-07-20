const SHOW_STEP = 12;

let pool = [];
let visibleCount = SHOW_STEP;

function debounce(fn, delayMs) {
    let timer;
    return function debounced(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delayMs);
    };
}

function getCategoryId() {
    return document.body.dataset.category || '';
}

function proteinKcalRatio(p) {
    return p.protein > 0 ? p.kcal / p.protein : Infinity;
}

function sortPool(list, sortKey) {
    const sorted = [...list];
    switch (sortKey) {
        case 'protein-desc':
            sorted.sort((a, b) => b.protein - a.protein || a.name.localeCompare(b.name, 'pl'));
            break;
        case 'kcal-asc':
            sorted.sort((a, b) => a.kcal - b.kcal || a.name.localeCompare(b.name, 'pl'));
            break;
        case 'ratio-asc':
            sorted.sort(
                (a, b) =>
                    proteinKcalRatio(a) - proteinKcalRatio(b) ||
                    a.name.localeCompare(b.name, 'pl')
            );
            break;
        default:
            sorted.sort((a, b) => a.name.localeCompare(b.name, 'pl'));
    }
    return sorted;
}

function buildCardHtml(p) {
    const url = `../${p.slug}`;
    return `
        <a href="${url}" class="product-card-link" title="${p.name} – makro na 100 g">
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
                <div class="product-card-cta">Szczegóły →</div>
            </article>
        </a>`;
}

function getFilteredSorted() {
    const query = (document.getElementById('categorySearch')?.value || '').toLowerCase().trim();
    const sortKey = document.getElementById('categorySort')?.value || 'name-asc';
    let list = pool;
    if (query) {
        list = list.filter((p) => p.name.toLowerCase().includes(query));
    }
    return sortPool(list, sortKey);
}

function updateShowMore(sortedLength) {
    const wrap = document.getElementById('categoryShowMoreWrap');
    if (!wrap) return;
    const canShow = visibleCount < sortedLength;
    wrap.hidden = !canShow;
    wrap.style.display = canShow ? '' : 'none';
}

function renderGrid(resetVisible = true) {
    const grid = document.getElementById('categoryProductsGrid');
    if (!grid) return;
    const sorted = getFilteredSorted();
    if (resetVisible) visibleCount = SHOW_STEP;
    const slice = sorted.slice(0, visibleCount);
    grid.innerHTML = slice.map((p) => buildCardHtml(p)).join('');
    updateShowMore(sorted.length);
}

function showMore() {
    const sorted = getFilteredSorted();
    if (visibleCount >= sorted.length) return;
    const grid = document.getElementById('categoryProductsGrid');
    const from = visibleCount;
    visibleCount = Math.min(visibleCount + SHOW_STEP, sorted.length);
    const html = sorted.slice(from, visibleCount).map((p) => buildCardHtml(p)).join('');
    grid.insertAdjacentHTML('beforeend', html);
    updateShowMore(sorted.length);
}

async function initCategoryPage() {
    const cat = getCategoryId();
    if (!cat) return;

    if (typeof ensureProductsDatabase === 'function') {
        await ensureProductsDatabase();
    }
    if (typeof productsDatabase === 'undefined') return;

    pool = productsDatabase.filter((p) => p.category === cat);

    const search = document.getElementById('categorySearch');
    const sort = document.getElementById('categorySort');
    const moreBtn = document.getElementById('categoryShowMoreBtn');
    const debouncedSearch = debounce(() => renderGrid(true), 200);

    if (search) search.addEventListener('input', debouncedSearch);
    if (sort) sort.addEventListener('change', () => renderGrid(true));
    if (moreBtn) moreBtn.addEventListener('click', showMore);

    renderGrid(true);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initCategoryPage().catch((err) => console.error('category-page:', err));
    });
} else {
    initCategoryPage().catch((err) => console.error('category-page:', err));
}
