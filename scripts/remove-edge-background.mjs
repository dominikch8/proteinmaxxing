/**
 * Usuwa jasne tło połączone z krawędziami (zostaje hexagon + białe P w środku).
 */
export function removeEdgeBackground(rawBuffer, width, height, channels, options = {}) {
    const { lumMin = 232, satMax = 28 } = options;
    const data = Buffer.from(rawBuffer);
    const visited = new Uint8Array(width * height);
    const queue = [];

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
        queue.push([x, y]);
    };

    for (let x = 0; x < width; x++) {
        push(x, 0);
        push(x, height - 1);
    }
    for (let y = 0; y < height; y++) {
        push(0, y);
        push(width - 1, y);
    }

    while (queue.length) {
        const [x, y] = queue.shift();
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
