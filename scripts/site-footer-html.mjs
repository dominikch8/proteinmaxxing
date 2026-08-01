/**
 * Wspólna stopka HTML — prefix: '' (root) lub '../' (produkty/).
 */
import { buildMediaBoxySideRails, buildMediaBoxyUnit } from './site-head-assets.mjs';

export function buildSiteFooter(prefix = '') {
    return `${buildMediaBoxySideRails()}
${buildMediaBoxyUnit()}
    <footer class="site-footer">
        <p class="site-footer-brand"><strong>Proteiner</strong> — kalkulator dietetyczny i baza produktów</p>
        <nav class="site-footer-nav" aria-label="Nawigacja w stopce">
            <a href="${prefix}informacje">Informacje</a>
            <span aria-hidden="true">·</span>
            <a href="${prefix}o-mnie">O mnie</a>
            <span aria-hidden="true">·</span>
            <a href="${prefix}dieta#produkty">Wszystkie produkty</a>
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
