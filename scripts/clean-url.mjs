/**
 * Czyste URL-e bez .html (dieta.html → dieta, index.html → /).
 */
export function toCleanPath(href) {
    if (href == null || href === '') return href;
    const s = String(href);
    if (/^(mailto|tel|javascript|data):/i.test(s)) return s;
    if (/^https?:\/\//i.test(s) && !/proteiner\.pl/i.test(s)) return s;

    const isAbs = /^https:\/\/proteiner\.pl/i.test(s);
    const withoutHost = isAbs ? s.replace(/^https:\/\/proteiner\.pl/i, '') : s;
    const m = withoutHost.match(/^([^?#]*)([?#][\s\S]*)?$/);
    let path = m[1];
    const suffix = m[2] || '';

    // meta refresh: 0;url=...
    const urlPrefix = path.match(/^(.*?;\s*url=)(.+)$/i);
    if (urlPrefix) {
        return urlPrefix[1] + toCleanPath(urlPrefix[2] + suffix);
    }

    if (/\.html$/i.test(path)) path = path.slice(0, -5);

    if (path === 'index' || path === '/index') {
        path = '/';
    } else if (path.endsWith('/index')) {
        path = path.slice(0, -6);
        if (!path || path === '.') path = '/';
        else if (path === '..' || /^\.\.(\/\.\.)*$/.test(path)) path += '/';
    }

    if (isAbs) {
        const rest = path.startsWith('/') ? path : `/${path}`;
        return `https://proteiner.pl${rest === '/' ? '/' : rest}${suffix}`;
    }
    return path + suffix;
}

/** Usuwa .html z href/content/action/canonical/sitemap w HTML/XML. */
export function stripHtmlExtensionsInContent(content) {
    let out = content;

    out = out.replace(/https:\/\/proteiner\.pl\/[^\s"'<>]+/gi, (url) => {
        if (!/\.html/i.test(url)) return url;
        return toCleanPath(url);
    });

    out = out.replace(/\b(href|content|action)=(["'])([^"']+)\2/gi, (full, attr, q, val) => {
        if (!/\.html/i.test(val)) return full;
        return `${attr}=${q}${toCleanPath(val)}${q}`;
    });

    out = out.replace(
        /\b(location\.(?:replace|assign))\((["'])([^"']+)\2\)/g,
        (full, pre, q, val) => {
            if (!/\.html/i.test(val)) return full;
            return `${pre}(${q}${toCleanPath(val)}${q})`;
        }
    );

    out = out.replace(/<loc>([^<]+)<\/loc>/gi, (_, url) => `<loc>${toCleanPath(url.trim())}</loc>`);

    return out;
}
