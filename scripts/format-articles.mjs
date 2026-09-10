import fs from 'fs';
import path from 'path';

const root = process.cwd();
const indexPath = path.join(root, 'index.html');
const files = fs.readdirSync(root).filter(f => f.startsWith('art-') && f.endsWith('.html'));
if (!fs.existsSync(indexPath)) {
  console.error('index.html not found');
  process.exit(1);
}
const index = fs.readFileSync(indexPath, 'utf8');

function between(str, a, b) {
  const i = str.indexOf(a);
  if (i === -1) return null;
  const j = str.indexOf(b, i + a.length);
  if (j === -1) return null;
  return str.slice(i + a.length, j);
}

const headInner = between(index, '<head>', '</head>');
const headerHTML = between(index, '<header', '</header>');
const footerHTML = between(index, '<footer', '</footer>');

if (!headInner || headerHTML === null || footerHTML === null) {
  console.error('Could not extract template parts from index.html');
  process.exit(1);
}

const headerBlock = '<header' + headerHTML + '</header>';
const footerBlock = '<footer' + footerHTML + '</footer>';

for (const file of files) {
  const p = path.join(root, file);
  const src = fs.readFileSync(p, 'utf8');
  const titleMatch = src.match(/<title>([\s\S]*?)<\/title>/i);
  const descMatch = src.match(/<meta\s+name="description"\s+content="([^"]*)"\s*\/>?/i);
  const canonicalMatch = src.match(/<link\s+rel="canonical"\s+href="([^"]*)"\s*\/>?/i);
  const mainMatch = src.match(/<main[\s\S]*?>[\s\S]*?<\/main>/i);

  const title = titleMatch ? titleMatch[1].trim() : file.replace('.html', '');
  const desc = descMatch ? descMatch[1].trim() : '';
  const canonical = canonicalMatch ? canonicalMatch[1].trim() : '/' + file;
  const mainContent = mainMatch ? mainMatch[0] : `<main><h1>${title}</h1><p>Treść w przygotowaniu.</p></main>`;

  // Build new head by taking index headInner and replacing title, description, canonical
  let newHead = headInner;
  // Remove any existing <title> and meta description and canonical in head
  newHead = newHead.replace(/<title>[\s\S]*?<\/title>/i, '');
  newHead = newHead.replace(/<meta\s+name="description"[\s\S]*?>/i, '');
  newHead = newHead.replace(/<link\s+rel="canonical"[\s\S]*?>/i, '');

  // Inject our title/description/canonical near the top
  const injection = `    <title>${title}</title>\n    <meta name="description" content="${desc}">\n    <link rel="canonical" href="https://proteiner.pl${canonical.startsWith('/') ? '' : '/'}${canonical}">\n`;
  newHead = injection + newHead;

  const newHtml = `<!DOCTYPE html>\n<html lang="pl">\n<head>${newHead}\n</head>\n<body class="article-page">\n    ${headerBlock}\n    <div class="page-container">\n        <main class="main-content">\n            <article class="article-inner">\n${mainContent.replace(/^/gm, '                ')}\n            </article>\n        </main>\n    </div>\n    ${footerBlock}\n    <script src="js/site-motion.js?v=20260815copyBold"></script>\n    <script src="js/theme.js?v=20260815copyBold"></script>\n    <script src="js/site-motion.js?v=20260815copyBold"></script>\n</body>\n</html>`;

  fs.writeFileSync(p, newHtml, 'utf8');
  console.log('Updated', file);
}
console.log('Done');
