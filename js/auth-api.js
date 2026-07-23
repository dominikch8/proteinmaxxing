/**
 * Klient API auth Proteiner.
 */
(function (global) {
    const API_BASE = '/api/auth';

    async function request(path, options) {
        const opts = Object.assign(
            {
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                }
            },
            options || {}
        );
        let res;
        try {
            res = await fetch(API_BASE + path, opts);
        } catch (err) {
            const error = new Error(
                'Brak połączenia z API. Logowanie działa na hostingu z PHP (np. po wgraniu na LH.pl).'
            );
            error.code = 'NETWORK';
            throw error;
        }
        let data = null;
        try {
            data = await res.json();
        } catch {
            data = null;
        }
        if (!res.ok) {
            const error = new Error((data && data.error) || 'Nie udało się wykonać żądania.');
            error.status = res.status;
            error.data = data;
            throw error;
        }
        return data;
    }

    const AuthApi = {
        me() {
            return request('/me.php', { method: 'GET', headers: { Accept: 'application/json' } });
        },
        login(email, password) {
            return request('/login.php', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
        },
        register(name, email, password) {
            return request('/register.php', {
                method: 'POST',
                body: JSON.stringify({ name, email, password })
            });
        },
        logout() {
            return request('/logout.php', { method: 'POST', body: '{}' });
        }
    };

    global.ProteinerAuth = AuthApi;
})(window);
