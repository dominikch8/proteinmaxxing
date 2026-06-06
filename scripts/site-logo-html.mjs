/**
 * Ikona marki obok „Proteiner” w nagłówku.
 * prefix: '' (root) lub '../' (produkty/)
 */
export function buildLogoMark(prefix = '') {
    return `<img class="logo-mark" src="${prefix}images/favicon.svg" alt="" width="56" height="56" decoding="async">`;
}
