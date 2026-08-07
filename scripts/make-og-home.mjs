/**
 * Regenerates images/og-home.jpg with current Proteiner branding.
 * node scripts/make-og-home.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const W = 1200;
const H = 630;

const logo = await sharp(path.join(root, 'images', 'favicon.svg')).resize(220, 220).png().toBuffer();

const svg = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f8faff"/>
      <stop offset="45%" stop-color="#f5f7fb"/>
      <stop offset="100%" stop-color="#f3f5fa"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <circle cx="80" cy="80" r="180" fill="#1e3a5f" fill-opacity="0.06"/>
  <circle cx="1120" cy="560" r="220" fill="#800000" fill-opacity="0.07"/>
  <text x="340" y="300" font-family="Segoe UI, Arial, sans-serif" font-size="72" font-weight="800" fill="#0f172a">Proteiner.pl</text>
  <text x="340" y="370" font-family="Segoe UI, Arial, sans-serif" font-size="32" font-weight="600" fill="#475569">Kalkulator BMI · Białko · Dieta</text>
</svg>`);

const out = path.join(root, 'images', 'og-home.jpg');
await sharp(svg)
    .composite([{ input: logo, left: 90, top: Math.round((H - 220) / 2) }])
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(out);

const deploy = path.join(root, 'deploy-bundle', 'images', 'og-home.jpg');
fs.mkdirSync(path.dirname(deploy), { recursive: true });
fs.copyFileSync(out, deploy);
console.log('Wrote', out, fs.statSync(out).size, 'bytes');
