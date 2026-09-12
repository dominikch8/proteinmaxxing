// Partie 2+: linie JSON w plikach scripts/_batch*.mjs
const batchFiles = fs.readdirSync(path.join(root, 'scripts'))
    .filter((f) => /^_batch\d+\.mjs$/.test(f))
    .sort();
let addedBatch = 0;
for (const bf of batchFiles) {
    const b2 = fs.readFileSync(path.join(root, 'scripts', bf), 'utf8');
    for (const line of b2.split(/\r?\n/)) {
        const t = line.trim().replace(/,$/, '');
        if (!t.startsWith('{"name"')) continue;
        let obj;
        try { obj = JSON.parse(t); } catch { skipped.push('BŁĄD JSON(' + bf + '): ' + t.slice(0, 40)); continue; }
        if (existing.has(obj.name) || seen.has(obj.name)) { skipped.push(obj.name); continue; }
        seen.add(obj.name);
        out.push(obj);
        addedBatch++;
    }
}

// Uzupełniające partie w _np-more.json (jeśli istnieje)
const morePath = path.join(root, 'scripts', '_np-more.json');
let addedMore = 0;
if (fs.existsSync(morePath)) {
    const more = JSON.parse(fs.readFileSync(morePath, 'utf8'));
    for (const obj of more) {
        if (!obj || !obj.name || obj.name === '__NEXT__') continue;
        if (existing.has(obj.name) || seen.has(obj.name)) { skipped.push(obj.name); continue; }
        seen.add(obj.name);
        out.push(obj);
        addedMore++;
    }
}