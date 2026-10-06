/**
 * Widget komentarzy dla produktów i artykułów.
 * Oczekuje kontenera: <div id="comments" data-entity-type="product|article" data-entity-slug="...">
 */
(function () {
    const API_BASE = '/api/comments';

    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function formatDate(iso) {
        try {
            return new Date(iso).toLocaleString('pl-PL', { dateStyle: 'medium', timeStyle: 'short' });
        } catch {
            return iso;
        }
    }

    function scriptPrefix() {
        const path = window.location.pathname || '';
        if (path.includes('/produkty/')) {
            return path.includes('/kategoria/') ? '../../' : '../';
        }
        return '';
    }

    function ensureAuthApi(prefix) {
        if (window.ProteinerAuth) return Promise.resolve();
        return new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = prefix + 'js/auth-api.js';
            s.onload = () => resolve();
            s.onerror = () => reject(new Error('Nie załadowano auth-api.js'));
            document.head.appendChild(s);
        });
    }

    async function request(path, options) {
        const opts = Object.assign(
            { credentials: 'same-origin', headers: { Accept: 'application/json' } },
            options || {}
        );
        let res;
        try {
            res = await fetch(API_BASE + path, opts);
        } catch {
            throw new Error('API niedostępne (komentarze działają na hostingu z PHP).');
        }
        let data = null;
        try {
            data = await res.json();
        } catch {
            data = null;
        }
        if (!res.ok) {
            const err = new Error((data && data.error) || 'Nie udało się wykonać żądania.');
            err.status = res.status;
            throw err;
        }
        return data;
    }

    function renderComments(root, comments, canComment, isAdmin) {
        const list = root.querySelector('.comments-list');
        list.innerHTML = '';

        if (!comments.length) {
            list.innerHTML = '<p class="comments-empty">Brak komentarzy. Bądź pierwszy!</p>';
        } else {
            for (const c of comments) {
                const el = document.createElement('article');
                el.className = 'comment';
                el.innerHTML =
                    '<div class="comment-head">' +
                    '<span class="comment-author">' + escapeHtml(c.author) + '</span>' +
                    '<span class="comment-date">' + escapeHtml(formatDate(c.createdAt)) + '</span>' +
                    '</div>' +
                    '<div class="comment-body">' + escapeHtml(c.body) + '</div>' +
                    (c.isOwner || isAdmin ? '<button type="button" class="comment-del" data-id="' + c.id + '">Usuń</button>' : '');
                list.appendChild(el);
            }
        }

        const form = root.querySelector('.comments-form');
        const hint = root.querySelector('.comments-login-hint');
        if (!form) return;
        if (!canComment) {
            form.hidden = true;
            if (hint) {
                hint.hidden = false;
                const a = hint.querySelector('a');
                if (a) a.href = scriptPrefix() + 'logowanie';
            }
        } else {
            form.hidden = false;
            if (hint) hint.hidden = true;
        }

        list.querySelectorAll('.comment-del').forEach((btn) => {
            btn.addEventListener('click', async () => {
                if (!confirm('Usunąć ten komentarz?')) return;
                try {
                    await request('/delete.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: Number(btn.dataset.id) })
                    });
                    loadComments(root);
                } catch (e) {
                    alert(e.message);
                }
            });
        });
    }

    async function loadComments(root) {
        const entityType = root.dataset.entityType;
        const entitySlug = root.dataset.entitySlug;
        if (!entityType || !entitySlug) return;

        let canComment = false;
        let isAdmin = false;
        try {
            await ensureAuthApi(scriptPrefix());
            const me = await window.ProteinerAuth.me();
            canComment = !!(me && me.user);
            isAdmin = !!(me && me.user && me.user.role === 'admin');
        } catch {
            canComment = false;
        }

        try {
            const data = await request(
                '/list.php?entity_type=' + encodeURIComponent(entityType) + '&entity_slug=' + encodeURIComponent(entitySlug),
                { method: 'GET' }
            );
            renderComments(root, data.comments || [], canComment, isAdmin);
        } catch {
            const list = root.querySelector('.comments-list');
            if (list) list.innerHTML = '<p class="comments-empty">Nie udało się wczytać komentarzy.</p>';
        }
    }

    function init() {
        const root = document.getElementById('comments');
        if (!root) return;

        if (!root.querySelector('.comments-list')) {
            root.innerHTML =
                '<h2 class="comments-title">Komentarze</h2>' +
                '<div class="comments-list"></div>' +
                '<p class="comments-login-hint" hidden>Zaloguj się, aby dodać komentarz — <a href="logowanie">przejdź do logowania</a>.</p>' +
                '<form class="comments-form" hidden>' +
                '<textarea class="comments-input" name="body" maxlength="1000" rows="3" placeholder="Napisz komentarz…"></textarea>' +
                '<div class="comments-actions">' +
                '<span class="comments-error" role="alert" hidden></span>' +
                '<button type="submit" class="comments-submit">Dodaj komentarz</button>' +
                '</div>' +
                '</form>';
        }

        const form = root.querySelector('.comments-form');
        const input = root.querySelector('.comments-input');
        const errEl = root.querySelector('.comments-error');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const text = (input.value || '').trim();
            if (text.length < 2) {
                if (errEl) { errEl.textContent = 'Komentarz jest za krótki.'; errEl.hidden = false; }
                return;
            }
            if (errEl) { errEl.hidden = true; }
            const btn = form.querySelector('button[type="submit"]');
            if (btn) btn.disabled = true;
            try {
                await request('/create.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        entity_type: root.dataset.entityType,
                        entity_slug: root.dataset.entitySlug,
                        body: text
                    })
                });
                input.value = '';
                loadComments(root);
            } catch (err) {
                if (errEl) { errEl.textContent = err.message; errEl.hidden = false; }
            } finally {
                if (btn) btn.disabled = false;
            }
        });

        loadComments(root);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
