/**
 * Przygotowuje deploy-bundle/ do wgrania na LH.pl.
 * Uruchamiane w CI przed FTP deploy.
 */
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const node = process.execPath;

function run(script, args = []) {
    const rel = path.join('scripts', script);
    console.log(`\n▶ node ${rel} ${args.join(' ')}`.trim());
    const res = spawnSync(node, [path.join(root, rel), ...args], {
        cwd: root,
        stdio: 'inherit',
        env: process.env
    });
    if (res.status !== 0) process.exit(res.status ?? 1);
}

run('build-products-lite.mjs');
run('generate-product-card-images.mjs', ['--only-missing']);
run('generate-product-pages.mjs');
run('patch-products-lite.mjs');
run('pack-for-hosting.mjs');

const bundle = path.join(root, 'deploy-bundle');
if (!fs.existsSync(bundle)) {
    console.error('Brak deploy-bundle/ po pack-for-hosting.mjs');
    process.exit(1);
}
console.log('\n✓ deploy-bundle gotowy do FTP');
