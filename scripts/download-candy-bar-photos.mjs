/**
 * Download REAL internet product photos for candy/protein bars → images/products/{slug}.jpg
 * Prefer curated Wikimedia Commons URLs; fall back to Wikipedia / Commons / Openverse search.
 *
 * node scripts/download-candy-bar-photos.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'images', 'products');
const bundleDir = path.join(root, 'deploy-bundle', 'images', 'products');
const UA = 'Proteiner/1.0 (nutrition education; contact: dominikchw1@gmail.com)';

/** name → slug (Snickers lives as baton-np-snickers) */
const PRODUCTS = [
  { name: 'Go On Protein Bar', slug: 'go-on-protein-bar', queries: ['Go On protein bar', 'protein chocolate bar wrapper'] },
  { name: 'Duplo', slug: 'duplo', queries: ['Duplo chocolate bar Ferrero', 'Duplo Ferrero'] },
  { name: 'Lion', slug: 'lion', queries: ['Lion chocolate bar Nestle', 'Lion bar candy'] },
  { name: 'Pawełek', slug: 'pawelek', queries: ['Pawełek baton', 'Pawelek chocolate bar'] },
  { name: 'Kinder Maxi King', slug: 'kinder-maxi-king', queries: ['Kinder Maxi King', 'Maxi King chocolate'] },
  { name: 'Toblerone', slug: 'toblerone', queries: ['Toblerone chocolate bar'] },
  { name: 'Twix', slug: 'twix', queries: ['Twix chocolate bar'] },
  { name: 'Bounty', slug: 'bounty', queries: ['Bounty chocolate bar coconut'] },
  { name: 'Kit Kat', slug: 'kit-kat', queries: ['Kit Kat chocolate bar'] },
  { name: 'Snickers', slug: 'baton-np-snickers', queries: ['Snickers chocolate bar'] },
  { name: 'Kinder Bueno', slug: 'kinder-bueno', queries: ['Kinder Bueno chocolate'] },
  { name: 'Prince Polo', slug: 'prince-polo', queries: ['Prince Polo wafer', 'Prince Polo chocolate'] },
  { name: 'Danusia', slug: 'danusia', queries: ['Danusia czekolada', 'Danusia chocolate bar'] },
  { name: '3 Bit', slug: '3-bit', queries: ['3 Bit chocolate bar', '3Bit wafer'] },
  { name: 'KitKat Chunky', slug: 'kitkat-chunky', queries: ['KitKat Chunky', 'Kit Kat Chunky bar'] },
  { name: 'Bounty Dark', slug: 'bounty-dark', queries: ['Bounty Dark chocolate', 'Bounty dark coconut'] },
  { name: 'Nestlé Crunch', slug: 'nestle-crunch', queries: ['Nestle Crunch bar', 'Crunch chocolate bar'] },
  { name: 'Princessa', slug: 'princessa', queries: ['Princessa wafer', 'Princessa baton'] },
  { name: 'Twix White', slug: 'twix-white', queries: ['Twix White chocolate', 'Twix White bar'] },
  { name: 'Snickers White', slug: 'snickers-white', queries: ['Snickers White chocolate', 'Snickers White bar'] },
  { name: 'Grześki', slug: 'grzeski', queries: ['Grześki wafel', 'Grzeski wafer chocolate'] },
  { name: 'Lion White', slug: 'lion-white', queries: ['Lion White chocolate bar', 'Lion White Nestle'] },
  { name: 'Kinder Country', slug: 'kinder-country', queries: ['Kinder Country chocolate', 'Kinder Country bar'] },
  { name: 'Corny Big', slug: 'corny-big', queries: ['Corny Big bar', 'Corny muesli bar'] },
  { name: 'Nuts', slug: 'nuts', queries: ['Nuts chocolate bar Nestle', 'Nuts candy bar'] },
  { name: 'Knoppers', slug: 'knoppers', queries: ['Knoppers wafer', 'Knoppers chocolate'] },
  { name: 'Mars', slug: 'mars', queries: ['Mars chocolate bar'] },
  { name: 'Milky Way', slug: 'milky-way', queries: ['Milky Way chocolate bar'] },
];

/** Curated real Wikimedia / known product shots (prefer white/simple background). */
const CURATED = {
  'baton-np-snickers': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Snickers-broken.JPG/960px-Snickers-broken.JPG',
  twix: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Twix-broken.jpg/960px-Twix-broken.jpg',
  bounty: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Bounty-Split.jpg/960px-Bounty-Split.jpg',
  'bounty-dark': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Bounty-Split.jpg/960px-Bounty-Split.jpg',
  'kinder-bueno': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Kinder-Bueno-Split.jpg/960px-Kinder-Bueno-Split.jpg',
  toblerone: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Toblerone.jpg/960px-Toblerone.jpg',
  mars: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/2023_Baton_Mars_%281%29.jpg/960px-2023_Baton_Mars_%281%29.jpg',
  knoppers: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/2023_Knoppers_%282%29.jpg/960px-2023_Knoppers_%282%29.jpg',
  'corny-big': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Corny.jpg/960px-Corny.jpg',
  'kit-kat': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Kit-Kat-Split.jpg/960px-Kit-Kat-Split.jpg',
  'kitkat-chunky': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/KitKat.jpg/960px-KitKat.jpg',
  'milky-way': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Milky-Way-Bars-USUK-Whole.jpg/960px-Milky-Way-Bars-USUK-Whole.jpg',
  'nestle-crunch': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Nestl%C3%A9_Crunch.jpg/960px-Nestl%C3%A9_Crunch.jpg',
  'kinder-country': 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Kinder_Country.jpg',
  lion: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Lion-Bar-Split.jpg/960px-Lion-Bar-Split.jpg',
  'lion-white': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Lion-Bar-White-Choc-Split.jpg/960px-Lion-Bar-White-Choc-Split.jpg',
  duplo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Duplo_Ferrero.jpg/960px-Duplo_Ferrero.jpg',
  danusia: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/2023_Baton_Danusia_Klasyczna.jpg/960px-2023_Baton_Danusia_Klasyczna.jpg',
  'prince-polo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Prince-Polo-Dark-Split.jpg/960px-Prince-Polo-Dark-Split.jpg',
  nuts: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Nuts_chocolate_bar_01.jpg/960px-Nuts_chocolate_bar_01.jpg',
  'twix-white': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Twix_white_split_%286902053171%29.jpg/960px-Twix_white_split_%286902053171%29.jpg',
};

const BAD_IMAGE = /logo|icon|banner|sprite|button|avatar|stamp|seal|flag\.png/i;
const BAD_TITLE = /logo|icon|diagram|map|flag|coat of arms|symbol|chart|graph|list of|disambiguation|category:/i;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWikipedia(query) {
  const params = new URLSearchParams({
    action: 'query', generator: 'search', gsrsearch: query, gsrlimit: '6',
    prop: 'pageimages', piprop: 'thumbnail', pithumbsize: '900', format: 'json', origin: '*',
  });
  const res = await fetch(`https://en.wikipedia.org/w/api.php?${params}`, { headers: { 'User-Agent': UA } });
  if (!res.ok) return null;
  const data = await res.json();
  for (const page of Object.values(data?.query?.pages || {})) {
    if (BAD_TITLE.test(page.title || '')) continue;
    const src = page.thumbnail?.source;
    if (src && !BAD_IMAGE.test(src)) return src;
  }
  return null;
}

async function fetchCommons(query) {
  const params = new URLSearchParams({
    action: 'query', generator: 'search', gsrsearch: `filetype:bitmap ${query}`,
    gsrnamespace: '6', gsrlimit: '10', prop: 'imageinfo', iiprop: 'url', iiurlwidth: '900',
    format: 'json', origin: '*',
  });
  const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, { headers: { 'User-Agent': UA } });
  if (!res.ok) return null;
  const data = await res.json();
  for (const page of Object.values(data?.query?.pages || {})) {
    if (BAD_TITLE.test(page?.title || '')) continue;
    const info = page?.imageinfo?.[0];
    const url = info?.thumburl || info?.url;
    if (url && /\.(jpg|jpeg|png|webp)/i.test(url) && !BAD_IMAGE.test(url) && !BAD_IMAGE.test(page?.title || '')) {
      return url;
    }
  }
  return null;
}

async function fetchOpenverse(query) {
  const params = new URLSearchParams({
    q: query, page_size: '8', license_type: 'commercial,modification', extension: 'jpg,jpeg,png,webp',
  });
  const res = await fetch(`https://api.openverse.engineering/v1/images/?${params}`, { headers: { 'User-Agent': UA } });
  if (!res.ok) return null;
  const data = await res.json();
  for (const hit of data?.results || []) {
    const url = hit?.url || hit?.thumbnail;
    const title = hit?.title || '';
    if (url && !BAD_IMAGE.test(url) && !BAD_TITLE.test(title)) return url;
  }
  return null;
}

async function findImageUrl(p) {
  if (CURATED[p.slug]) return { url: CURATED[p.slug], source: 'curated-wikimedia' };
  const sources = [
    ['wikipedia', fetchWikipedia],
    ['commons', fetchCommons],
    ['openverse', fetchOpenverse],
  ];
  for (const q of p.queries) {
    for (const [label, fn] of sources) {
      try {
        const url = await fn(q);
        if (url) return { url, source: label };
      } catch { /* next */ }
      await sleep(80);
    }
  }
  return null;
}

async function saveJpg(url, outPath) {
  const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(40000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await sharp(buf)
    .resize(800, 600, { fit: 'contain', background: { r: 255, g: 255, b: 255 } })
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(outPath);
}

function ensureJpgHtml(slug) {
  const pages = [
    path.join(root, 'produkty', `${slug}.html`),
    path.join(root, 'deploy-bundle', 'produkty', `${slug}.html`),
  ];
  const results = [];
  for (const htmlPath of pages) {
    if (!fs.existsSync(htmlPath)) {
      results.push({ path: htmlPath, status: 'missing' });
      continue;
    }
    let html = fs.readFileSync(htmlPath, 'utf8');
    const before = html;
    // Prefer .jpg as primary src; keep webp/placeholder fallback
    html = html.replace(
      new RegExp(`(src=["'])\\.\\./images/products/${slug}\\.(png|webp)(["'])`, 'gi'),
      `$1../images/products/${slug}.jpg$3`
    );
    html = html.replace(
      new RegExp(`(content=["']https://proteiner\\.pl/images/products/${slug})\\.(png|webp)(["'])`, 'gi'),
      `$1.jpg$3`
    );
    // Normalize onerror chain to jpg → webp → placeholder
    html = html.replace(
      new RegExp(
        `<img([^>]*?)src=["']\\.\\./images/products/${slug}\\.jpg["']([^>]*?)>`,
        'gi'
      ),
      (match, pre, post) => {
        let attrs = `${pre} src="../images/products/${slug}.jpg"${post}`;
        if (!/onerror=/i.test(attrs)) {
          attrs = attrs.replace(
            /\s*\/?>$/,
            ` onerror="this.onerror=null;this.src='../images/products/${slug}.webp';this.onerror=function(){this.onerror=null;this.src='../images/products/placeholder.svg';};">`
          );
        } else {
          attrs = attrs.replace(
            /onerror=["'][^"']*["']/i,
            `onerror="this.onerror=null;this.src='../images/products/${slug}.webp';this.onerror=function(){this.onerror=null;this.src='../images/products/placeholder.svg';};"`
          );
        }
        return `<img${attrs}>`.replace(/<img\s+src=/, '<img src=');
      }
    );
    if (html !== before) {
      fs.writeFileSync(htmlPath, html, 'utf8');
      results.push({ path: htmlPath, status: 'updated' });
    } else {
      results.push({ path: htmlPath, status: 'ok' });
    }
  }
  return results;
}

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(bundleDir, { recursive: true });

const report = [];

for (const p of PRODUCTS) {
  const outPath = path.join(outDir, `${p.slug}.jpg`);
  const bundlePath = path.join(bundleDir, `${p.slug}.jpg`);
  try {
    const found = await findImageUrl(p);
    if (!found) {
      report.push({ name: p.name, slug: p.slug, url: null, status: 'fail-no-url' });
      console.log(`FAIL ${p.slug}: no URL`);
      continue;
    }
    await saveJpg(found.url, outPath);
    fs.copyFileSync(outPath, bundlePath);
    const htmlStatus = ensureJpgHtml(p.slug);
    report.push({
      name: p.name,
      slug: p.slug,
      url: found.url,
      source: found.source,
      status: 'success',
      html: htmlStatus.map((h) => h.status).join(','),
    });
    console.log(`OK ${p.slug} ← ${found.source} ${found.url}`);
  } catch (err) {
    report.push({ name: p.name, slug: p.slug, url: null, status: `fail:${err.message}` });
    console.log(`FAIL ${p.slug}: ${err.message}`);
  }
  await sleep(120);
}

const reportPath = path.join(root, 'scripts', 'candy-bar-photos-report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
console.log(`\nWrote ${reportPath}`);
console.log(`Success: ${report.filter((r) => r.status === 'success').length}/${report.length}`);
