/**
 * Doprowadza wszystkie zdjęcia produktów do stylu: białe tło, minimalizm.
 * 1) Pollinations (fotorealistyczne) dla pozycji spoza progu
 * 2) Emoji na białym tle dla tego, co nadal nie przechodzi audytu
 *
 * node scripts/ensure-all-product-images-minimal.mjs
 */
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const node = process.execPath;

function run(script, args = []) {
    console.log('\n→', `node scripts/${script}`, args.join(' '));
    const r = spawnSync(node, [path.join(root, 'scripts', script), ...args], {
        cwd: root,
        stdio: 'inherit',
        env: process.env
    });
    if (r.status !== 0) process.exit(r.status ?? 1);
}

run('build-product-image-regen-queue.mjs');
run('fetch-minimal-product-photos.mjs', ['--queue', '--delay=500']);
run('build-product-image-regen-queue.mjs');
run('regenerate-minimal-product-images.mjs', ['--queue']);
run('build-product-image-regen-queue.mjs');
run('audit-product-image-style.mjs');
