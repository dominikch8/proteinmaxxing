import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { detectGender } from './polish-gender.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const prodDir = path.join(root, 'produkty');

const files = fs.readdirSync(prodDir).filter((f) => f.endsWith('.html'));
const bad = [];

function esc(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

for (const file of files) {
    const html = fs.readFileSync(path.join(prodDir, file), 'utf8');
    const h1 = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
    if (!h1) continue;
    const name = h1[1].trim();
    const g = detectGender(name);
    const plain = html.replace(/<[^>]+>/g, ' ');

    if (g === 'pl') {
        if (new RegExp(`${esc(name)} ma\\b`).test(plain)) bad.push(`${file}: „ma” przy mnogiej`);
        if (new RegExp(`${esc(name)} nie jest\\b`).test(plain)) bad.push(`${file}: „nie jest” przy mnogiej`);
        if (new RegExp(`${esc(name)} jest „`).test(plain) || new RegExp(`${esc(name)} jest gęst`).test(plain)) {
            bad.push(`${file}: „jest” przy mnogiej`);
        }
    }
    if (g === 'f' && /nie jest „zakazany”/.test(plain)) bad.push(`${file}: zakazany (m) przy żeńskiej`);
    if (g === 'n' && /nie jest „zakazany”/.test(plain)) bad.push(`${file}: zakazany (m) przy nijakiej`);
    if (g === 'pl' && /nie są „zakazany”/.test(plain)) bad.push(`${file}: zakazany (m) przy mnogiej`);
}

console.log('checked', files.length, 'issues', bad.length);
for (const b of bad.slice(0, 50)) console.log(b);

const lody = fs.readFileSync(path.join(prodDir, 'lody-magnum-classic.html'), 'utf8');
const snip = lody.match(/Lody Magnum Classic<\/span> ([^.]+)/);
console.log('lody:', snip && snip[0]);

const kiel = fs.readFileSync(path.join(prodDir, 'kielbasa-mysliwska.html'), 'utf8');
const ksnip = kiel.match(/Kiełbasa myśliwska<\/span> ([^.]+)/);
console.log('kielbasa:', ksnip && ksnip[0]);
