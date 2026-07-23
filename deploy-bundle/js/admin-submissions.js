(function () {
    const gate = document.getElementById('adminGate');
    const panel = document.getElementById('adminPanel');
    const loginError = document.getElementById('adminLoginError');
    const logoutBtn = document.getElementById('adminLogoutBtn');
    const listEl = document.getElementById('adminList');
    const emptyEl = document.getElementById('adminEmpty');
    const toastEl = document.getElementById('adminToast');
    const filtersEl = document.getElementById('adminFilters');
    const gateStatus = document.getElementById('adminGateStatus');

    let currentFilter = 'pending';
    let currentUser = null;

    function showToast(msg, isError) {
        if (!toastEl) return;
        toastEl.textContent = msg;
        toastEl.hidden = !msg;
        toastEl.classList.toggle('admin-toast--error', !!isError);
        if (msg) {
            setTimeout(() => {
                toastEl.hidden = true;
            }, 5000);
        }
    }

    function showPanel(on) {
        if (gate) gate.hidden = on;
        if (panel) panel.hidden = !on;
        if (logoutBtn) logoutBtn.hidden = !on;
    }

    function setGateMessage(msg, isError) {
        if (gateStatus) {
            gateStatus.textContent = msg || '';
            gateStatus.hidden = !msg;
        }
        if (loginError) {
            loginError.textContent = isError ? msg : '';
            loginError.hidden = !isError;
        }
    }

    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function formatDate(iso) {
        try {
            return new Date(iso).toLocaleString('pl-PL', {
                dateStyle: 'short',
                timeStyle: 'short'
            });
        } catch {
            return iso;
        }
    }

    function statusLabel(status) {
        if (status === 'approved') return 'Zaakceptowane';
        if (status === 'rejected') return 'Odrzucone';
        return 'Oczekujące';
    }

    function updateCounts() {
        const c = PmxSubmissions.counts();
        const pendingEl = document.getElementById('countPending');
        const allEl = document.getElementById('countAll');
        if (pendingEl) pendingEl.textContent = String(c.pending);
        if (allEl) allEl.textContent = String(c.all);
    }

    function renderList() {
        if (!listEl) return;
        const items = PmxSubmissions.list(currentFilter);
        updateCounts();

        if (!items.length) {
            listEl.innerHTML = '';
            if (emptyEl) emptyEl.hidden = false;
            return;
        }
        if (emptyEl) emptyEl.hidden = true;

        listEl.innerHTML = items
            .map((entry) => {
                const p = entry.product;
                const cat = CATEGORY_LABELS[p.category] || p.category;
                const json = JSON.stringify(p, null, 2);
                return `
                <article class="admin-card" data-id="${escapeHtml(entry.id)}">
                    <div class="admin-card-head" data-toggle="${escapeHtml(entry.id)}">
                        <div>
                            <h2 class="admin-card-title">
                                <span aria-hidden="true">${escapeHtml(p.emoji || '🍽️')}</span>
                                ${escapeHtml(p.name)}
                            </h2>
                            <p class="admin-card-meta">${escapeHtml(cat)} · ${escapeHtml(formatDate(entry.submittedAt))}${entry.contactEmail ? ` · ${escapeHtml(entry.contactEmail)}` : ''}</p>
                        </div>
                        <span class="admin-badge admin-badge--${escapeHtml(entry.status)}">${escapeHtml(statusLabel(entry.status))}</span>
                    </div>
                    <div class="admin-card-body">
                        <dl class="admin-detail-grid">
                            <div><dt>Na 100 g</dt><dd>${p.kcal} kcal · B ${p.protein} g · W ${p.carbs} g · T ${p.fat} g</dd></div>
                            <div><dt>Tłuszcze</dt><dd>nasycone ${p.satFat} g · nienasycone ${p.unsatFat} g</dd></div>
                            <div><dt>Porcja</dt><dd>${escapeHtml(p.servingText)} (${p.servingGrams} g)</dd></div>
                            <div><dt>Źródło</dt><dd>${escapeHtml(entry.source || '—')}</dd></div>
                            ${p.micros ? `<div><dt>Mikro</dt><dd>${escapeHtml(p.micros)}</dd></div>` : ''}
                            ${p.extra ? `<div><dt>Opis</dt><dd>${escapeHtml(p.extra)}</dd></div>` : ''}
                        </dl>
                        <label class="visually-hidden" for="json-${escapeHtml(entry.id)}">JSON produktu</label>
                        <textarea class="admin-json" id="json-${escapeHtml(entry.id)}" readonly>${escapeHtml(json)}</textarea>
                        <div class="admin-card-actions">
                            <button type="button" class="admin-btn admin-btn--primary" data-copy="${escapeHtml(entry.id)}">Kopiuj JSON</button>
                            <button type="button" class="admin-btn" data-approve="${escapeHtml(entry.id)}">Zaakceptuj</button>
                            <button type="button" class="admin-btn" data-reject="${escapeHtml(entry.id)}">Odrzuć</button>
                            <button type="button" class="admin-btn admin-btn--danger" data-delete="${escapeHtml(entry.id)}">Usuń</button>
                        </div>
                    </div>
                </article>`;
            })
            .join('');
    }

    function getEntryJson(id) {
        const entry = PmxSubmissions.list('all').find((e) => e.id === id);
        return entry ? JSON.stringify(entry.product, null, 2) : '';
    }

    function bindListEvents() {
        if (!listEl) return;

        listEl.querySelectorAll('[data-toggle]').forEach((head) => {
            head.addEventListener('click', () => {
                head.closest('.admin-card')?.classList.toggle('is-open');
            });
        });

        listEl.querySelectorAll('[data-copy]').forEach((btn) => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-copy');
                const text = getEntryJson(id);
                try {
                    await navigator.clipboard.writeText(text);
                    showToast('Skopiowano JSON do schowka.');
                } catch {
                    showToast('Nie udało się skopiować — zaznacz tekst ręcznie.', true);
                }
            });
        });

        listEl.querySelectorAll('[data-approve]').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                PmxSubmissions.update(btn.getAttribute('data-approve'), { status: 'approved' });
                renderList();
                showToast('Oznaczono jako zaakceptowane.');
            });
        });

        listEl.querySelectorAll('[data-reject]').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                PmxSubmissions.update(btn.getAttribute('data-reject'), { status: 'rejected' });
                renderList();
                showToast('Oznaczono jako odrzucone.');
            });
        });

        listEl.querySelectorAll('[data-delete]').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!confirm('Usunąć to zgłoszenie z listy?')) return;
                PmxSubmissions.remove(btn.getAttribute('data-delete'));
                renderList();
                showToast('Usunięto zgłoszenie.');
            });
        });
    }

    function render() {
        renderList();
        bindListEvents();
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                if (window.ProteinerAuth) await ProteinerAuth.logout();
            } catch {
                /* ignore */
            }
            window.location.href = (window.PMX_ADMIN_PANEL && PMX_ADMIN_PANEL.loginUrl) || 'logowanie';
        });
    }

    if (filtersEl) {
        filtersEl.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-filter]');
            if (!btn) return;
            filtersEl.querySelectorAll('.btn-sub').forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            render();
        });
    }

    document.getElementById('adminImportBtn')?.addEventListener('click', () => {
        const text = document.getElementById('adminImportText')?.value || '';
        const { entries, errors } = PmxSubmissions.parseImportText(text);
        if (errors.length && !entries.length) {
            showToast(errors[0], true);
            return;
        }
        const added = PmxSubmissions.importEntries(entries);
        document.getElementById('adminImportText').value = '';
        render();
        showToast(`Zaimportowano ${added} zgłoszeń.`);
    });

    document.getElementById('adminExportBtn')?.addEventListener('click', () => {
        const data = PmxSubmissions.exportAll();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pmx-zgloszenia-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Pobrano plik JSON.');
    });

    document.getElementById('adminSyncServerBtn')?.addEventListener('click', async () => {
        try {
            const res = await fetch(`data/pending-submissions.json?t=${Date.now()}`);
            if (!res.ok) throw new Error('Brak pliku');
            const data = await res.json();
            const added = PmxSubmissions.mergeRemote(data);
            render();
            showToast(`Zsynchronizowano z serwera: ${added} nowych pozycji.`);
        } catch {
            showToast(
                'Nie udało się wczytać data/pending-submissions.json — możesz ręcznie wkleić JSON z e-maila.',
                true
            );
        }
    });

    async function initAuth() {
        showPanel(false);
        setGateMessage('Sprawdzam sesję…');
        const loginUrl = (window.PMX_ADMIN_PANEL && PMX_ADMIN_PANEL.loginUrl) || 'logowanie?next=admin-zgloszenia';

        if (!window.ProteinerAuth) {
            setGateMessage('Brak modułu logowania. Odśwież stronę albo wgraj js/auth-api.js.', true);
            return;
        }

        try {
            const data = await ProteinerAuth.me();
            currentUser = data && data.user ? data.user : null;
        } catch {
            setGateMessage(
                'API logowania niedostępne (potrzebny PHP na hostingu). Zaloguj się po wgraniu strony na serwer.',
                true
            );
            const link = document.getElementById('adminLoginLink');
            if (link) link.href = loginUrl;
            return;
        }

        if (!currentUser) {
            setGateMessage('Zaloguj się kontem administratora, żeby otworzyć panel.');
            const link = document.getElementById('adminLoginLink');
            if (link) link.href = loginUrl;
            return;
        }

        if (currentUser.role !== 'admin') {
            setGateMessage(
                'Jesteś zalogowany jako ' +
                    (currentUser.email || 'użytkownik') +
                    ', ale to konto nie ma uprawnień admina.',
                true
            );
            return;
        }

        showPanel(true);
        PmxSubmissions.migrateLegacy();
        render();
    }

    initAuth();
})();
