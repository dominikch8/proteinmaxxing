/**
 * Usuwa jasne tło połączone z krawędziami (zostaje hexagon + białe P w środku).
 */
export function removeEdgeBackground(rawBuffer, width, height, channels, options = {}) {
    const { lumMin = 232, satMax = 28 } = options;
    const data = Buffer.from(rawBuffer);
    const visited = new Uint8Array(width * height);
    const qx = new Int32Array(width * height);
    const qy = new Int32Array(width * height);
    let qh = 0;
    let qt = 0;

    const idx = (x, y) => (y * width + x) * channels;
    const isBg = (i) => {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const lum = (r + g + b) / 3;
        return lum >= lumMin && max - min <= satMax;
    };

    const push = (x, y) => {
        if (x < 0 || y < 0 || x >= width || y >= height) return;
        const p = y * width + x;
        if (visited[p]) return;
        const i = idx(x, y);
        if (!isBg(i)) return;
        visited[p] = 1;
        qx[qt] = x;
        qy[qt] = y;
        qt++;
    };

    for (let x = 0; x < width; x++) {
        push(x, 0);
        push(x, height - 1);
    }
    for (let y = 0; y < height; y++) {
        push(0, y);
        push(width - 1, y);
    }

    while (qh < qt) {
        const x = qx[qh];
        const y = qy[qh];
        qh++;
        const i = idx(x, y);
        data[i + 3] = 0;
        push(x + 1, y);
        push(x - 1, y);
        push(x, y + 1);
        push(x, y - 1);
    }

    return data;
}

/**
 * Wycina miękki cień / szary blat połączony z już wyciętym tłem.
 * Nie rusza jasnych naczyń (miska/talerz ~lum>210) ani kolorowego jedzenia.
 */
export function removeConnectedShadows(data, width, height, channels, options = {}) {
    const { lumMin = 55, lumMax = 150, satMax = 26 } = options;
    const visited = new Uint8Array(width * height);
    const qx = new Int32Array(width * height);
    const qy = new Int32Array(width * height);
    let qh = 0;
    let qt = 0;
    const idx = (x, y) => (y * width + x) * channels;

    const isShadowPixel = (i) => {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const sat = Math.max(r, g, b) - Math.min(r, g, b);
        const lum = (r + g + b) / 3;
        return sat <= satMax && lum >= lumMin && lum <= lumMax;
    };

    const push = (x, y) => {
        if (x < 0 || y < 0 || x >= width || y >= height) return;
        const p = y * width + x;
        if (visited[p]) return;
        const i = idx(x, y);
        if (data[i + 3] < 8) return;
        if (!isShadowPixel(i)) return;
        visited[p] = 1;
        qx[qt] = x;
        qy[qt] = y;
        qt++;
    };

    // seed only along the cutout border (transparent next to opaque)
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (data[idx(x, y) + 3] >= 8) continue;
            push(x + 1, y);
            push(x - 1, y);
            push(x, y + 1);
            push(x, y - 1);
        }
    }

    while (qh < qt) {
        const x = qx[qh];
        const y = qy[qh];
        qh++;
        const i = idx(x, y);
        data[i + 3] = 0;
        push(x + 1, y);
        push(x - 1, y);
        push(x, y + 1);
        push(x, y - 1);
    }

    return data;
}

/** Usuwa półprzezroczystą jasną obwódkę (halo). */
export function defringeLightHalos(data, channels) {
    for (let i = 0; i < data.length; i += channels) {
        const a = data[i + 3];
        if (a === 0) continue;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const lum = (r + g + b) / 3;
        if (a < 250 && lum > 200) {
            data[i + 3] = 0;
        }
    }
    return data;
}
