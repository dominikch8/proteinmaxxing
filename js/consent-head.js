window.dataLayer = window.dataLayer || [];
function gtag() {
    dataLayer.push(arguments);
}
window.gtag = window.gtag || gtag;
gtag('consent', 'default', {
    ad_storage: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'denied',
    personalization_storage: 'denied',
    security_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 1500
});
gtag('set', 'ads_data_redaction', true);
gtag('set', 'url_passthrough', false);
(function () {
    const s = {
        adStorage: { storageName: 'ad_storage', serialNumber: 0 },
        analyticsStorage: { storageName: 'analytics_storage', serialNumber: 1 },
        functionalityStorage: { storageName: 'functionality_storage', serialNumber: 2 },
        personalizationStorage: { storageName: 'personalization_storage', serialNumber: 3 },
        securityStorage: { storageName: 'security_storage', serialNumber: 4 },
        adUserData: { storageName: 'ad_user_data', serialNumber: 5 },
        adPersonalization: { storageName: 'ad_personalization', serialNumber: 6 }
    };
    let c = localStorage.getItem('__lxG__consent__v2');
    if (c) {
        c = JSON.parse(c);
        if (c && c.cls_val) c = c.cls_val;
        if (c) c = c.split('|');
        if (c && c.length && typeof c[14] !== undefined) {
            c = c[14].split('').map((e) => e - 0);
            if (c.length) {
                let t = {};
                Object.values(s)
                    .sort((e, t) => e.serialNumber - t.serialNumber)
                    .forEach((e) => {
                        t[e.storageName] = c[e.serialNumber] ? 'granted' : 'denied';
                    });
                gtag('consent', 'update', t);
            }
        }
    }
})();
