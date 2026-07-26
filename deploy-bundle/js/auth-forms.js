/**
 * Formularze logowania / rejestracji.
 */
(function () {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const logoutBtn = document.getElementById('accountLogoutBtn');
    const accountBox = document.getElementById('accountBox');
    const accountGuest = document.getElementById('accountGuest');

    function showError(el, msg) {
        if (!el) return;
        el.textContent = msg || '';
        el.hidden = !msg;
    }

    function redirectAfterAuth(user) {
        try {
            sessionStorage.setItem('pmx_auth_nav_v1', JSON.stringify(user || null));
        } catch {
            /* ignore */
        }
        const params = new URLSearchParams(window.location.search);
        const next = params.get('next');
        if (next && !/^https?:/i.test(next) && !next.startsWith('//') && !next.includes('://')) {
            window.location.href = next.startsWith('/') ? next : next.replace(/^\.\//, '');
            return;
        }
        if (user && user.role === 'admin') {
            window.location.href = 'admin-zgloszenia';
            return;
        }
        window.location.href = 'konto';
    }

    if (loginForm) {
        const errorEl = document.getElementById('loginError');
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            showError(errorEl, '');
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            const btn = loginForm.querySelector('button[type="submit"]');
            if (btn) btn.disabled = true;
            try {
                const data = await ProteinerAuth.login(email, password);
                redirectAfterAuth(data.user);
            } catch (err) {
                showError(errorEl, err.message || 'Logowanie nie powiodło się.');
            } finally {
                if (btn) btn.disabled = false;
            }
        });
    }

    if (registerForm) {
        const errorEl = document.getElementById('registerError');
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            showError(errorEl, '');
            const name = document.getElementById('registerName').value.trim();
            const email = document.getElementById('registerEmail').value.trim();
            const password = document.getElementById('registerPassword').value;
            const password2 = document.getElementById('registerPassword2').value;
            if (password !== password2) {
                showError(errorEl, 'Hasła nie są takie same.');
                return;
            }
            const btn = registerForm.querySelector('button[type="submit"]');
            if (btn) btn.disabled = true;
            try {
                const data = await ProteinerAuth.register(name, email, password);
                redirectAfterAuth(data.user);
            } catch (err) {
                showError(errorEl, err.message || 'Rejestracja nie powiodła się.');
            } finally {
                if (btn) btn.disabled = false;
            }
        });
    }

    async function loadAccount() {
        if (!accountBox && !accountGuest) return;
        try {
            const data = await ProteinerAuth.me();
            const user = data && data.user;
            if (!user) {
                if (accountBox) accountBox.hidden = true;
                if (accountGuest) accountGuest.hidden = false;
                return;
            }
            if (accountGuest) accountGuest.hidden = true;
            if (accountBox) {
                accountBox.hidden = false;
                const nameEl = document.getElementById('accountName');
                const emailEl = document.getElementById('accountEmail');
                const roleEl = document.getElementById('accountRole');
                const adminLink = document.getElementById('accountAdminLink');
                if (nameEl) nameEl.textContent = user.name || '—';
                if (emailEl) emailEl.textContent = user.email || '—';
                if (roleEl) roleEl.textContent = user.role === 'admin' ? 'Administrator' : 'Użytkownik';
                if (adminLink) adminLink.hidden = user.role !== 'admin';
            }
        } catch {
            if (accountBox) accountBox.hidden = true;
            if (accountGuest) accountGuest.hidden = false;
        }
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await ProteinerAuth.logout();
            } catch {
                /* ignore */
            }
            try {
                sessionStorage.removeItem('pmx_auth_nav_v1');
            } catch {
                /* ignore */
            }
            window.location.href = 'logowanie';
        });
    }

    if (accountBox || accountGuest) {
        loadAccount();
    }
})();
