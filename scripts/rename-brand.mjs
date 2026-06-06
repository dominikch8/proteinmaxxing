import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP_DIRS = new Set(['.git', 'node_modules']);
const EXT = new Set(['.html', '.js', '.mjs', '.json', '.xml', '.md', '.svg', '.css', '.txt']);

const brandOnly = [
    [/\| ProteinMaxxing<\/title>/g, '| Proteiner</title>'],
    [/\[ProteinMaxxing\]/g, '[Proteiner]'],
    [/Narzędzia Proteiner/g, 'Narzędzia Proteiner'],
    [/w Proteiner zawsze/g, 'w Proteiner zawsze'],
    [/aria-label="Proteiner"/g, 'aria-label="Proteiner"'],
];

function walk(dir, files = []) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
        if (SKIP_DIRS.has(ent.name)) continue;
        const p = path.join(dir, ent.name);
        if (ent.isDirectory()) walk(p, files);
        else if (EXT.has(path.extname(ent.name).toLowerCase())) files.push(p);
    }
    return files;
}

let changed = 0;

for (const file of walk(ROOT)) {
    let text = fs.readFileSync(file, 'utf8');
    const orig = text;

    text = text.replace(/https:\/\/proteinmaxxing\.pl/g, 'https://proteiner.pl');
    text = text.replace(/ProteinMaxxing\.pl/g, 'Proteiner');

    for (const [re, rep] of brandOnly) {
        text = text.replace(re, rep);
    }

    if (file.endsWith(`${path.sep}package.json`)) {
        text = text.replace(/"name": "proteinmaxxing"/g, '"name": "proteiner"');
    }

    if (text !== orig) {
        fs.writeFileSync(file, text, 'utf8');
        changed++;
    }
}

console.log(`Updated ${changed} files.`);
