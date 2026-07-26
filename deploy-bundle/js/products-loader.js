/** Lazy-load lekkiej bazy produktów (np. na stronie kalkulatora). */
let _productsLoadPromise = null;

function resolveProductsBaseUrl() {
    const marker = document.querySelector('script[src*="products-loader.js"]');
    if (marker?.src) {
        return marker.src.replace(/products-loader\.js(?:\?.*)?$/, '');
    }
    return 'js/';
}

function loadScript(url) {
    return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${url}"]`);
        if (existing) {
            existing.addEventListener('load', () => resolve(), { once: true });
            existing.addEventListener('error', () => reject(new Error(`Script failed: ${url}`)), { once: true });
            if (existing.dataset.loaded === '1') resolve();
            return;
        }
        const s = document.createElement('script');
        s.src = url;
        s.async = true;
        s.onload = () => {
            s.dataset.loaded = '1';
            resolve();
        };
        s.onerror = () => reject(new Error(`Script failed: ${url}`));
        document.head.appendChild(s);
    });
}

async function ensureProductsDatabase() {
    if (typeof productsDatabase !== 'undefined' && productsDatabase.length && productsDatabase._customMerged) {
        return productsDatabase;
    }
    if (_productsLoadPromise) return _productsLoadPromise;

    const base = resolveProductsBaseUrl();
    _productsLoadPromise = (async () => {
        if (typeof enrichProducts !== 'function') {
            await loadScript(`${base}product-utils.js`);
        }
        if (typeof productsDatabaseLite === 'undefined') {
            await loadScript(`${base}products-lite.js`);
        }
        if (typeof productsDatabase === 'undefined') {
            await loadScript(`${base}products-data.js`);
        }

        try {
            const prefix = base.replace(/js\/?$/, '');
            const res = await fetch(`${prefix}api/products/list.php`, {
                credentials: 'same-origin',
                headers: { Accept: 'application/json' }
            });
            if (res.ok) {
                const data = await res.json();
                const custom = (data && data.products) || [];
                if (custom.length && Array.isArray(productsDatabase)) {
                    const existingNames = new Set(
                        productsDatabase.map((p) => String(p.name || '').toLowerCase())
                    );
                    for (const p of custom) {
                        const key = String(p.name || '').toLowerCase();
                        if (!key || existingNames.has(key)) continue;
                        productsDatabase.push(p);
                        existingNames.add(key);
                    }
                    if (typeof enrichProducts === 'function') {
                        enrichProducts(productsDatabase);
                    }
                }
            }
        } catch {
            /* API niedostępne lokalnie bez PHP */
        }

        if (Array.isArray(productsDatabase)) {
            productsDatabase._customMerged = true;
        }
        return productsDatabase;
    })();

    return _productsLoadPromise;
}
