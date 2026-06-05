/** Dodaje skrypt AdSense do istniejących stron produktów (jednorazowo). */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'produkty');
const snippet = `<meta name="google-adsense-account" content="ca-pub-8540801395510703">
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8540801395510703"
        crossorigin="anonymous"></script>
    `;

let n = 0;
for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.html')) continue;
    const fp = path.join(dir, file);
    let html = fs.readFileSync(fp, 'utf8');
    if (html.includes('adsbygoogle.js')) continue;
    if (!html.includes('<head>')) continue;
    html = html.replace('<head>', `<head>\n    ${snippet}`);
    fs.writeFileSync(fp, html, 'utf8');
    n++;
}
console.log(`Zaktualizowano ${n} plików HTML w produkty/`);
