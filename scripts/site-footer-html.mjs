/** Link partnerski (omg10) — ten sam na wszystkich stronach. */
export const PARTNER_OFFERS_URL = 'https://omg10.com/4/11118561';

/**
 * Wspólna stopka HTML — prefix: '' (root) lub '../' (produkty/).
 */
export function buildSiteFooter(prefix = '') {
    return `    <footer class="site-footer">
        <p class="site-footer-brand"><strong>Proteiner</strong> — kalkulator dietetyczny i baza produktów</p>
        <nav class="site-footer-nav" aria-label="Nawigacja w stopce">
            <a href="${prefix}informacje.html">Informacje</a>
            <span aria-hidden="true">·</span>
            <a href="${prefix}o-mnie.html">O mnie</a>
            <span aria-hidden="true">·</span>
            <a href="${prefix}dieta.html#produkty">Wszystkie produkty</a>
            <span aria-hidden="true">·</span>
            <a href="${prefix}porownaj-produkty.html">Porównaj produkty</a>
            <span aria-hidden="true">·</span>
            <a href="${prefix}dodaj-produkt.html">Dodaj produkty</a>
            <span aria-hidden="true">·</span>
            <a href="${prefix}poradnik-zywienia.html">Poradnik</a>
            <span aria-hidden="true">·</span>
            <a class="site-footer-partner" href="${PARTNER_OFFERS_URL}" rel="nofollow sponsored noopener" target="_blank">Oferty partnerskie</a>
        </nav>
        <p class="site-footer-copy">&copy; 2026 Wszelkie prawa zastrzeżone.</p>
    </footer>`;
}
