/**
 * Czyści cutouty wszystkich produktów:
 * - wypełnia dziury wewnątrz produktu (niepołączone z brzegiem)
 * - usuwa miękkie cienie kontaktu przy krawędzi (bez zjadania białych naczyń)
 * - usuwa białe frędzle / halo
 *
 * node scripts/cleanup-all-product-cutouts.mjs
 * node scripts/cleanup-all-product-cutouts.mjs --slug=krupnik
 * node scripts/cleanup-all-product-cutouts.mjs --limit=20
 */
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const productsDir = path.join(root, 'images', 'products');
const bundleDir = path.join(root, 'deploy-bundle', 'images', 'products');

const args = process.argv.slice(2);
const onlySlugs = args.filter((a) => a.startsWith('--slug=')).map((a) => a.slice(7));
const limitArg = args.find((a) => a.startsWith('--limit='));
const limit = limitArg ? Number(limitArg.slice(8)) : Infinity;

function idx(x, y, w) {
    return (y * w + x) * 4;
}

async function writeRetry(p, buf) {
    fs.mkdirSync(path.dirname(p), { recursive: true });
    for (let i = 0; i < 8; i++) {
        try {
            fs.writeFileSync(p, buf);
            return;
        } catch {
            await new Promise((r) => setTimeout(r, 200 * (i + 1)));
        }
    }
    const tmp = path.join(os.tmpdir(), `pmx-${path.basename(p)}`);
    fs.writeFileSync(tmp, buf);
    fs.copyFileSync(tmp, p);
}

function markExterior(data, width, height) {
    const exterior = new Uint8Array(width * height);
    const q = [];
    const push = (x, y) => {
        if (x < 0 || y < 0 || x >= width || y >= height) return;
        const p = y * width + x;
        if (exterior[p]) return;
        if (data[idx(x, y, width) + 3] >= 12) return;
        exterior[p] = 1;
        q.push(x, y);
    };
    for (let x = 0; x < width; x++) {
        push(x, 0);
        push(x, height - 1);
    }
    for (let y = 0; y < height; y++) {
        push(0, y);
        push(width - 1, y);
    }
    for (let qi = 0; qi < q.length; qi += 2) {
        const x = q[qi];
        const y = q[qi + 1];
        push(x + 1, y);
        push(x - 1, y);
        push(x, y + 1);
        push(x, y - 1);
    }
    return exterior;
}

function fillInteriorHoles(data, width, height) {
    const exterior = markExterior(data, width, height);
    let filled = 0;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const p = y * width + x;
            const i = idx(x, y, width);
            if (data[i + 3] >= 12 || exterior[p]) continue;
            let best = null;
            let bestD = Infinity;
            for (let r = 1; r <= 28 && best == null; r++) {
                for (let dy = -r; dy <= r; dy++) {
                    for (let dx = -r; dx <= r; dx++) {
                        if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
                        const nx = x + dx;
                        const ny = y + dy;
                        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
                        const ni = idx(nx, ny, width);
                        if (data[ni + 3] < 200) continue;
                        const d = dx * dx + dy * dy;
                        if (d < bestD) {
                            bestD = d;
                            best = ni;
                        }
                    }
                }
            }
            if (best != null) {
                data[i] = data[best];
                data[i + 1] = data[best + 1];
                data[i + 2] = data[best + 2];
                data[i + 3] = 255;
                filled++;
            }
        }
    }
    return filled;
}

/** Usuwa miękkie cienie przy krawędzi — chroni białe / kremowe naczynia i sery. */
function removeContactShadows(data, width, height) {
    const next = Buffer.from(data);
    let removed = 0;
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const i = idx(x, y, width);
            if (data[i + 3] < 8) continue;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const lum = (r + g + b) / 3;
            const sat = max - min;

            // nie tykać jasnego produktu (miska, mozzarella, mleko…)
            if (lum >= 185 && sat <= 45) continue;
            // nie tykać wyraźnie kolorowego produktu
            if (sat > 42) continue;

            let nearClear = 0;
            let nearOpaqueProduct = 0;
            for (let dy = -3; dy <= 3; dy++) {
                for (let dx = -3; dx <= 3; dx++) {
                    if (!dx && !dy) continue;
                    const nx = x + dx;
                    const ny = y + dy;
                    if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
                    const ni = idx(nx, ny, width);
                    const na = data[ni + 3];
                    if (na < 20) nearClear++;
                    else {
                        const nl = (data[ni] + data[ni + 1] + data[ni + 2]) / 3;
                        const ns =
                            Math.max(data[ni], data[ni + 1], data[ni + 2]) -
                            Math.min(data[ni], data[ni + 1], data[ni + 2]);
                        if (nl > 160 || ns > 30) nearOpaqueProduct++;
                    }
                }
            }
            if (nearClear < 4) continue;

            // szary / zielonkawy cień stołu
            const looksLikeShadow =
                (sat <= 36 && lum >= 30 && lum <= 175) ||
                (g >= r && g >= b && sat <= 40 && lum <= 160 && nearClear >= 6);

            if (!looksLikeShadow) continue;
            // jeśli otoczony jasnym produktem, to raczej cień pod spodem — OK do usunięcia
            next[i + 3] = 0;
            removed++;
        }
    }
    for (let i = 0; i < data.length; i++) data[i] = next[i];
    return removed;
}

function defringe(data) {
    let n = 0;
    for (let i = 0; i < data.length; i += 4) {
        const a = data[i + 3];
        if (a === 0) continue;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const lum = (r + g + b) / 3;
        if (a < 250 && lum > 210) {
            data[i + 3] = 0;
            n++;
        } else if (r > 248 && g > 248 && b > 248 && a < 255) {
            data[i + 3] = 0;
            n++;
        } else if (r > 242 && g > 242 && b > 242 && a < 220) {
            data[i + 3] = 0;
            n++;
        }
    }
    return n;
}

/** Usuwa izolowane „śmieci” poza główną masą produktu (małe wyspy). */
function removeSmallIslands(data, width, height, maxIsland = 900) {
    const exterior = markExterior(data, width, height);
    const seen = new Uint8Array(width * height);
    let removed = 0;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const p = y * width + x;
            const i = idx(x, y, width);
            if (data[i + 3] < 12 || seen[p]) continue;
            const stack = [x, y];
            const cells = [];
            seen[p] = 1;
            while (stack.length) {
                const cy = stack.pop();
                const cx = stack.pop();
                cells.push(cx, cy);
                for (const [dx, dy] of [
                    [1, 0],
                    [-1, 0],
                    [0, 1],
                    [0, -1],
                ]) {
                    const nx = cx + dx;
                    const ny = cy + dy;
                    if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
                    const np = ny * width + nx;
                    if (seen[np]) continue;
                    if (data[idx(nx, ny, width) + 3] < 12) continue;
                    seen[np] = 1;
                    stack.push(nx, ny);
                }
            }
            const count = cells.length / 2;
            if (count > maxIsland) continue;
            // nie usuwaj jeśli to jedyna masa (nie powinno się zdarzyć przy max 900)
            for (let ci = 0; ci < cells.length; ci += 2) {
                data[idx(cells[ci], cells[ci + 1], width) + 3] = 0;
                removed++;
            }
        }
    }
    void exterior;
    return removed;
}

function audit(data, width, height) {
    let transparent = 0;
    let softShadowEdge = 0;
    let whiteEdge = 0;
    const total = width * height;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = idx(x, y, width);
            const a = data[i + 3];
            if (a < 10) {
                transparent++;
                continue;
            }
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const lum = (r + g + b) / 3;
            const sat = Math.max(r, g, b) - Math.min(r, g, b);
            let nearT = false;
            for (const [dx, dy] of [
                [1, 0],
                [-1, 0],
                [0, 1],
                [0, -1],
            ]) {
                const nx = x + dx;
                const ny = y + dy;
                if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
                if (data[idx(nx, ny, width) + 3] < 20) nearT = true;
            }
            if (!nearT) continue;
            if (sat <= 28 && lum >= 40 && lum <= 200) softShadowEdge++;
            if (lum > 235 && sat < 20) whiteEdge++;
        }
    }
    return {
        transPct: (100 * transparent) / total,
        softShadowEdge,
        whiteEdge,
    };
}

async function processSlug(slug) {
    const pngPath = path.join(productsDir, `${slug}.png`);
    if (!fs.existsSync(pngPath)) return null;
    const base = await sharp(fs.readFileSync(pngPath)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const { width, height } = base.info;
    const data = Buffer.from(base.data);

    const before = audit(data, width, height);
    const holes = fillInteriorHoles(data, width, height);
    const shadows = removeContactShadows(data, width, height);
    const fringe = defringe(data);
    // drugi pass dziur po usunięciu cieni
    const holes2 = fillInteriorHoles(data, width, height);
    // tylko mikroskopijne śmieci (nie ziarna / kruszonka)
    const islands = removeSmallIslands(data, width, height, 40);
    const after = audit(data, width, height);

    const png = await sharp(data, { raw: { width, height, channels: 4 } }).png({ compressionLevel: 9 }).toBuffer();
    const jpg = await sharp(png).flatten({ background: '#fff' }).jpeg({ quality: 90, mozjpeg: true }).toBuffer();
    const webp = await sharp(png).webp({ quality: 82, alphaQuality: 90, effort: 4 }).toBuffer();

    for (const dir of [productsDir, bundleDir]) {
        await writeRetry(path.join(dir, `${slug}.png`), png);
        await writeRetry(path.join(dir, `${slug}.jpg`), jpg);
        await writeRetry(path.join(dir, `${slug}.webp`), webp);
    }

    return {
        slug,
        holes: holes + holes2,
        shadows,
        fringe,
        islands,
        before,
        after,
    };
}

const files = fs
    .readdirSync(productsDir)
    .filter((f) => f.endsWith('.png'))
    .map((f) => f.replace(/\.png$/, ''));
const slugs = (onlySlugs.length ? onlySlugs : files).slice(0, limit);

console.log(`Cleaning ${slugs.length} product cutouts…`);
let improved = 0;
const report = [];
for (const slug of slugs) {
    try {
        const r = await processSlug(slug);
        if (!r) continue;
        const better =
            r.after.softShadowEdge < r.before.softShadowEdge ||
            r.after.whiteEdge < r.before.whiteEdge ||
            r.holes > 0 ||
            r.islands > 0;
        if (better) improved++;
        if (r.holes > 50 || r.shadows > 100 || r.islands > 0) {
            console.log(
                `${slug}: holes=${r.holes} shadows=${r.shadows} fringe=${r.fringe} islands=${r.islands} soft ${r.before.softShadowEdge}→${r.after.softShadowEdge}`
            );
        }
        report.push(r);
    } catch (e) {
        console.error('FAIL', slug, e.message);
    }
}

fs.writeFileSync(
    path.join(__dirname, 'cutout-cleanup-report.json'),
    JSON.stringify(
        {
            total: report.length,
            improved,
            at: new Date().toISOString(),
            items: report.map((r) => ({
                slug: r.slug,
                holes: r.holes,
                shadows: r.shadows,
                fringe: r.fringe,
                islands: r.islands,
                softBefore: r.before.softShadowEdge,
                softAfter: r.after.softShadowEdge,
                whiteBefore: r.before.whiteEdge,
                whiteAfter: r.after.whiteEdge,
                transPct: r.after.transPct,
            })),
        },
        null,
        2
    )
);
console.log(`Done. Processed ${report.length}, changed meaningfully ~${improved}.`);
