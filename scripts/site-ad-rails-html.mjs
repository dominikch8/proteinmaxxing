/**
 * Boczne sloty reklam Monetag (In-Page Push w kontenerach body).
 * Zmień zone ID po utworzeniu nowych stref w panelu Monetag.
 */
export const AD_RAIL_ZONES = {
    left: '11118313',
    right: '11118646'
};

const NAP5K_SRC = 'https://nap5k.com/tag.min.js';

function buildAdRailAside(side) {
    const zone = AD_RAIL_ZONES[side];
    if (!zone) return '';
    return `        <aside class="site-ad-rail site-ad-rail--${side}" aria-label="Reklama">
            <div class="site-ad-slot" data-ad-zone="${zone}" data-ad-src="${NAP5K_SRC}"></div>
        </aside>`;
}

export function buildSiteLayoutOpen() {
    const left = buildAdRailAside('left');
    return `    <div class="site-layout">
${left}
        <div class="site-layout__center">
`;
}

export function buildSiteLayoutClose() {
    const right = buildAdRailAside('right');
    return `        </div>
${right}
    </div>
`;
}

export function buildAdRailsScript(prefix = '') {
    return `    <script src="${prefix}js/site-ad-rails.js"></script>`;
}
