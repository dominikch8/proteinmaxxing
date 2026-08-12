/**
 * Disclaimer zdrowotny i informacja o źródłach — wspólne fragmenty HTML.
 * prefix: '' (root) lub '../' (produkty/)
 */

export function buildHealthDisclaimer(prefix = '', opts = {}) {
    const { compact = false } = opts;
    const contact = `${prefix}informacje#kontakt`;
    const poradnik = `${prefix}poradnik-zywienia`;
    const informacje = `${prefix}informacje`;

    if (compact) {
        return `    <aside class="health-disclaimer health-disclaimer--compact" role="note">
        <p><strong>Informacja:</strong> Proteiner to narzędzie edukacyjne, nie porada medyczna. Wyniki kalkulatora i dane w bazie mają charakter orientacyjny. Przed zmianą diety skonsultuj się z lekarzem lub dyplomowanym dietetykiem. <a href="${contact}">Kontakt</a> · <a href="${informacje}">Polityka</a></p>
    </aside>`;
    }

    return `    <aside class="health-disclaimer" role="note" aria-labelledby="health-disclaimer-heading">
        <h2 id="health-disclaimer-heading">Ważna informacja zdrowotna</h2>
        <p>Proteiner pomaga <strong>szacować</strong> zapotrzebowanie kaloryczne i porównywać produkty spożywcze. Treści na stronie mają charakter <strong>edukacyjny i informacyjny</strong> — nie zastępują indywidualnej porady lekarskiej, dietetycznej ani psychologicznej.</p>
        <p>Nie stawiamy diagnoz ani nie prowadzimy terapii. Jeśli masz choroby przewlekłe, jesteś w ciąży, karmisz piersią lub stosujesz leki — skonsultuj plan żywienia ze specjalistą. Wartości odżywcze w bazie pochodzą ze źródeł publicznych i etykiet producentów; mogą różnić się od konkretnej partii produktu.</p>
        <p><a href="${contact}">Kontakt i wsparcie</a> · <a href="${poradnik}">Poradnik żywienia</a> · <a href="${informacje}">Polityka prywatności</a></p>
    </aside>`;
}

export function buildDataSourcesNote(prefix = '') {
    return `    <section class="data-sources-note" aria-labelledby="data-sources-heading">
        <h2 id="data-sources-heading">Skąd bierzemy dane?</h2>
        <p>Makroskładniki zestawiamy na podstawie tabel wartości odżywczych (m.in. <a href="https://www.ilewazy.pl/" target="_blank" rel="noopener noreferrer">IleWazy.pl</a>, bazy USDA oraz etykiety producentów dostępne publicznie). Ceny są szacunkowe na podstawie gazetek sieci Biedronka i Lidl — służą do porównań, nie do transakcji. Szczegóły i kontakt opisujemy w sekcji <a href="${prefix}informacje#kontakt">Kontakt i wsparcie</a>.</p>
    </section>`;
}
