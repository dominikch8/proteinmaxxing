/**
 * Wspólna stopka HTML — prefix: '' (root) lub '../' (produkty/).
 */
export function buildSiteFooter(prefix = '') {
    return `    <footer class="site-footer">
        <p class="site-footer-brand"><strong>Proteiner</strong> — wszystko o białku</p>
        <nav class="site-footer-nav" aria-label="Nawigacja w stopce">
            <a href="${prefix}informacje">Informacje</a>
            <span aria-hidden="true">·</span>
            <a href="${prefix}dieta#produkty">Wszystkie produkty</a>
            <span aria-hidden="true">·</span>
            <a href="${prefix}kalkulator-posilkow">Kalkulator posiłków</a>
            <span aria-hidden="true">·</span>
            <a href="${prefix}porownaj-produkty">Porównaj produkty</a>
            <span aria-hidden="true">·</span>
            <a href="${prefix}dodaj-produkt">Dodaj produkt</a>
            <span aria-hidden="true">·</span>
            <a href="${prefix}poradnik-zywienia">Poradnik</a>
            <span aria-hidden="true">·</span>
            <a href="${prefix}artykuly">Artykuły</a>
        </nav>
        <p class="site-footer-copy">&copy; 2026 Wszelkie prawa zastrzeżone.</p>
    </footer>`;
}
