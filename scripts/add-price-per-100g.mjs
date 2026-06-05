/** @deprecated Użyj: node scripts/calculate-serving-protein-prices.mjs */
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const r = spawnSync(process.execPath, [path.join(dir, 'calculate-serving-protein-prices.mjs')], {
    stdio: 'inherit',
});
process.exit(r.status ?? 1);
