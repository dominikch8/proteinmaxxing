/**
 * Dopełnia WebP dla produktów, które mają tylko JPG (bez PNG).
 * Uruchom: node scripts/_np-webp.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'images', 'products');
let sharp;
try { sharp = (await import('sharp')).default; } catch { console.error('Brak sharp'); process.exit(1); }

const files = fs.readdirSync(dir);
const jpgs = files.filter((f) => f.endsWith('.jpg'));
let ok = 0, skip = 0, fail = 0;
for (const f of jpgs) {
    const out = path.join(dir, f.replace(/\.jpg$/i, '.webp'));
    if (fs.existsSync(out)) { skip++; continue; }
    try {
        await sharp(path.join(dir, f)).webp({ quality: 80, effort: 4 }).toFile(out);
        ok++;
    } catch (e) {
        fail++;
        console.error('FAIL', f, e.message);
    }
}
console.log(`WebP z JPG: nowe=${ok} już były=${skip} błędy=${fail} (JPG ogółem: ${jpgs.length})`);