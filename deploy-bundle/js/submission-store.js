(function (global) {
    const QUEUE_KEY = 'pmx_admin_queue';
    const LEGACY_KEY = 'pmx_product_submissions';

    function genId() {
        return `sub_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    }

    function readQueue() {
        try {
            const raw = localStorage.getItem(QUEUE_KEY);
            const arr = raw ? JSON.parse(raw) : [];
            return Array.isArray(arr) ? arr : [];
        } catch {
            return [];
        }
    }

    function writeQueue(items) {
        localStorage.setItem(QUEUE_KEY, JSON.stringify(items));
    }

    function normalizeEntry(raw, source = 'import') {
        if (!raw || typeof raw !== 'object') return null;

        if (raw.product && typeof raw.product === 'object') {
            return {
                id: raw.id || genId(),
                status: raw.status || 'pending',
                submittedAt: raw.submittedAt || new Date().toISOString(),
                contactEmail: raw.contactEmail || '',
                product: raw.product,
                source: raw.source || source,
                adminNote: raw.adminNote || ''
            };
        }

        if (raw.name && raw.category) {
            return {
                id: genId(),
                status: 'pending',
                submittedAt: new Date().toISOString(),
                contactEmail: '',
                product: raw,
                source,
                adminNote: ''
            };
        }

        return null;
    }

    function migrateLegacy() {
        let added = 0;
        try {
            const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) || '[]');
            if (!Array.isArray(legacy) || !legacy.length) return 0;
            const queue = readQueue();
            const existingIds = new Set(queue.map((e) => e.id));
            for (const item of legacy) {
                const entry = normalizeEntry(item, 'form');
                if (!entry) continue;
                if (item.id && existingIds.has(item.id)) continue;
                queue.push(entry);
                added++;
            }
            writeQueue(queue);
            localStorage.removeItem(LEGACY_KEY);
        } catch {
            /* ignore */
        }
        return added;
    }

    function list(filterStatus) {
        migrateLegacy();
        const items = readQueue().sort(
            (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)
        );
        if (!filterStatus || filterStatus === 'all') return items;
        return items.filter((e) => e.status === filterStatus);
    }

    function add(data, source = 'form') {
        const entry = normalizeEntry(data, source);
        if (!entry) return null;
        const queue = readQueue();
        queue.push(entry);
        writeQueue(queue);
        return entry;
    }

    function update(id, patch) {
        const queue = readQueue();
        const idx = queue.findIndex((e) => e.id === id);
        if (idx === -1) return null;
        queue[idx] = { ...queue[idx], ...patch, id };
        writeQueue(queue);
        return queue[idx];
    }

    function remove(id) {
        const queue = readQueue().filter((e) => e.id !== id);
        writeQueue(queue);
    }

    function counts() {
        const items = list('all');
        return {
            all: items.length,
            pending: items.filter((e) => e.status === 'pending').length,
            approved: items.filter((e) => e.status === 'approved').length,
            rejected: items.filter((e) => e.status === 'rejected').length
        };
    }

    function parseImportText(text) {
        const trimmed = String(text).trim();
        if (!trimmed) return { entries: [], errors: ['Pusty tekst.'] };

        const entries = [];
        const errors = [];

        function tryPush(obj, source) {
            const entry = normalizeEntry(obj, source);
            if (entry) entries.push(entry);
        }

        try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
                parsed.forEach((item) => tryPush(item, 'import'));
            } else {
                tryPush(parsed, 'import');
            }
        } catch {
            const jsonField = trimmed.match(/"json"\s*:\s*"((?:\\.|[^"\\])*)"/);
            if (jsonField) {
                try {
                    tryPush(JSON.parse(jsonField[1].replace(/\\"/g, '"')), 'email');
                } catch {
                    errors.push('Nie udało się odczytać pola json z wiadomości.');
                }
            }

            const blocks = trimmed.match(/\{[\s\S]*?\}/g) || [];
            for (const block of blocks) {
                try {
                    tryPush(JSON.parse(block), 'email');
                } catch {
                    /* skip invalid blocks */
                }
            }
        }

        if (!entries.length && !errors.length) {
            errors.push('Nie znaleziono poprawnego JSON. Wklej obiekt produktu lub całą wiadomość e-mail.');
        }

        const unique = [];
        const seen = new Set();
        for (const e of entries) {
            const key = `${e.product.name}|${e.submittedAt}`;
            if (seen.has(key)) continue;
            seen.add(key);
            unique.push(e);
        }

        return { entries: unique, errors };
    }

    function importEntries(newEntries, { skipDuplicates = true } = {}) {
        const queue = readQueue();
        let added = 0;
        const names = new Set(
            queue.map((e) => `${e.product.name.toLowerCase()}|${e.submittedAt}`)
        );

        for (const entry of newEntries) {
            const key = `${entry.product.name.toLowerCase()}|${entry.submittedAt}`;
            if (skipDuplicates && names.has(key)) continue;
            queue.push(entry);
            names.add(key);
            added++;
        }

        writeQueue(queue);
        return added;
    }

    function mergeRemote(items) {
        if (!Array.isArray(items)) return 0;
        const normalized = items.map((i) => normalizeEntry(i, 'server')).filter(Boolean);
        return importEntries(normalized, { skipDuplicates: true });
    }

    function exportAll() {
        return list('all');
    }

    global.PmxSubmissions = {
        list,
        add,
        update,
        remove,
        counts,
        parseImportText,
        importEntries,
        mergeRemote,
        exportAll,
        migrateLegacy
    };
})(window);
