/**
 * Homepage: shuffle articles into left/right rails + random product picks.
 */
(function () {
    function shuffle(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    function slugify(name) {
        return String(name)
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/ą/g, 'a')
            .replace(/ć/g, 'c')
            .replace(/ę/g, 'e')
            .replace(/ł/g, 'l')
            .replace(/ń/g, 'n')
            .replace(/ó/g, 'o')
            .replace(/ś/g, 's')
            .replace(/ź/g, 'z')
            .replace(/ż/g, 'z')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function renderArticles() {
        const left = document.getElementById('homeArticlesLeft');
        const right = document.getElementById('homeArticlesRight');
        if (!left || !right || !Array.isArray(window.HOME_ARTICLES)) return;

        const picked = shuffle(window.HOME_ARTICLES).slice(0, 8);
        const leftItems = picked.slice(0, 4);
        const rightItems = picked.slice(4, 8);

        const html = (items) =>
            items
                .map(
                    (a) => `<li>
            <a class="home-rail-link" href="${escapeHtml(a.slug)}">
                <span class="home-rail-emoji" aria-hidden="true">${escapeHtml(a.emoji || '📄')}</span>
                <span>
                    <span class="home-rail-title">${escapeHtml(a.title)}</span>
                    <span class="home-rail-desc">${escapeHtml(a.subtitle || '')}</span>
                </span>
            </a>
        </li>`
                )
                .join('');

        left.innerHTML = html(leftItems);
        right.innerHTML = html(rightItems);
    }

    function renderPicks() {
        const grid = document.getElementById('homeProductPicks');
        if (!grid || typeof productsDatabaseLite === 'undefined' || !Array.isArray(productsDatabaseLite)) return;

        const highProtein = productsDatabaseLite.filter((p) => Number(p.protein) >= 15);
        const pool = highProtein.length >= 8 ? highProtein : productsDatabaseLite;
        const picks = shuffle(pool).slice(0, 4);

        grid.innerHTML = picks
            .map((p) => {
                const slug = slugify(p.name);
                return `<li>
            <a class="home-pick-link" href="produkty/${escapeHtml(slug)}">
                <span class="home-pick-emoji" aria-hidden="true">${escapeHtml(p.emoji || '🍽️')}</span>
                <span class="home-pick-name">${escapeHtml(p.name)}</span>
                <span class="home-pick-meta">${escapeHtml(String(p.protein))} g białka · ${escapeHtml(String(p.kcal))} kcal / 100 g</span>
            </a>
        </li>`;
            })
            .join('');
    }

    renderArticles();
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderPicks);
    } else {
        renderPicks();
    }
})();
