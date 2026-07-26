(function () {
    /** E-mail administratora — FormSubmit wyśle tu zgłoszenie (przy pierwszym użyciu potwierdź link aktywacyjny). */
    const ADMIN_EMAIL = 'developeranios@gmail.com';
    const form = document.getElementById('addProductForm');
    const categoryEl = document.getElementById('apCategory');
    const errorEl = document.getElementById('addProductFormError');
    const successEl = document.getElementById('addProductFormSuccess');
    const submitBtn = document.getElementById('addProductSubmit');

    if (!form || !categoryEl) return;

    populateCategorySelect(categoryEl, { includeAll: false, useDietaLabels: true });

    function showError(msg) {
        if (!errorEl) return;
        errorEl.textContent = msg;
        errorEl.hidden = !msg;
        if (msg && successEl) successEl.hidden = true;
    }

    function showSuccess(msg) {
        if (!successEl) return;
        successEl.textContent = msg;
        successEl.hidden = !msg;
        if (msg && errorEl) errorEl.hidden = true;
    }

    function parseNum(id, required) {
        const el = document.getElementById(id);
        if (!el) return required ? null : 0;
        const raw = String(el.value).trim().replace(',', '.');
        if (raw === '') return required ? null : 0;
        const n = Number(raw);
        return Number.isFinite(n) ? n : null;
    }

    function buildPayload() {
        const name = document.getElementById('apName').value.trim();
        const category = categoryEl.value;
        let emoji = document.getElementById('apEmoji').value.trim();
        if (!emoji) emoji = '🍽️';

        const kcal = parseNum('apKcal', true);
        const protein = parseNum('apProtein', true);
        const carbs = parseNum('apCarbs', true);
        const fat = parseNum('apFat', true);
        const satFat = parseNum('apSatFat', true);
        const unsatFat = parseNum('apUnsatFat', true);
        const servingText = document.getElementById('apServingText').value.trim();
        const servingGrams = parseNum('apServingGrams', true);
        const servingPriceRaw = document.getElementById('apServingPrice').value.trim();
        const servingPricePln =
            servingPriceRaw === '' ? null : parseNum('apServingPrice', false);
        const micros = document.getElementById('apMicros').value.trim();
        const extra = document.getElementById('apExtra').value.trim();
        const contactEmail = document.getElementById('apEmail').value.trim();

        if (!name) return { error: 'Podaj nazwę produktu.' };
        if (!category) return { error: 'Wybierz kategorię.' };
        if (kcal == null || protein == null || carbs == null || fat == null || satFat == null || unsatFat == null) {
            return { error: 'Uzupełnij wszystkie pola makro na 100 g.' };
        }
        if (servingGrams == null || servingGrams <= 0) {
            return { error: 'Podaj gramaturę porcji (większą niż 0).' };
        }
        if (!servingText) return { error: 'Podaj opis porcji.' };
        if (satFat + unsatFat > fat + 0.6) {
            return {
                error: 'Suma tłuszczów nasyconych i nienasyconych nie może być wyraźnie większa niż tłuszcz ogółem.'
            };
        }

        const servingRatio = Math.round((servingGrams / 100) * 1000) / 1000;
        const proteinInServing = Math.round(protein * servingRatio * 10) / 10;

        const product = {
            name,
            emoji,
            category,
            servingText,
            servingRatio,
            servingGrams,
            kcal: Math.round(kcal),
            protein,
            carbs,
            fat,
            satFat,
            unsatFat,
            micros: micros || '—',
            extra: extra || '',
            servingPricePln: servingPricePln != null && servingPricePln >= 0 ? servingPricePln : null,
            proteinInServing
        };

        if (servingPricePln != null && protein > 0 && servingRatio > 0) {
            product.pricePer100gProtein =
                Math.round(((servingPricePln * 100) / (protein * servingRatio)) * 100) / 100;
        }

        return {
            product,
            contactEmail,
            submittedAt: new Date().toISOString()
        };
    }

    function formatEmailBody(data) {
        const p = data.product;
        const catLabel = CATEGORY_LABELS[p.category] || p.category;
        const lines = [
            'Nowe zgłoszenie produktu — Proteiner',
            '',
            `Data: ${data.submittedAt}`,
            p.contactEmail ? `Kontakt: ${data.contactEmail}` : 'Kontakt: (brak)',
            '',
            `Nazwa: ${p.name}`,
            `Kategoria: ${catLabel} (${p.category})`,
            `Emotka: ${p.emoji}`,
            '',
            '— Na 100 g —',
            `Kalorie: ${p.kcal} kcal`,
            `Białko: ${p.protein} g`,
            `Węglowodany: ${p.carbs} g`,
            `Tłuszcz: ${p.fat} g`,
            `Tłuszcze nasycone: ${p.satFat} g`,
            `Tłuszcze nienasycone: ${p.unsatFat} g`,
            '',
            '— Porcja —',
            `Opis: ${p.servingText}`,
            `Gramatura: ${p.servingGrams} g`,
            `servingRatio: ${p.servingRatio}`,
            `Białko w porcji: ${p.proteinInServing} g`,
            p.servingPricePln != null ? `Cena porcji: ${p.servingPricePln} PLN` : 'Cena porcji: —',
            p.pricePer100gProtein != null
                ? `Cena za 100 g białka: ${p.pricePer100gProtein} PLN`
                : '',
            '',
            `Mikroelementy: ${p.micros}`,
            p.extra ? `Opis: ${p.extra}` : '',
            '',
            '— JSON (do wklejenia do bazy) —',
            JSON.stringify(p, null, 2)
        ];
        return lines.filter(Boolean).join('\n');
    }

    function saveLocalBackup(data) {
        if (typeof PmxSubmissions !== 'undefined') {
            PmxSubmissions.add(data, 'form');
        }
    }

    async function sendToAdmin(data) {
        const p = data.product;
        const catLabel = CATEGORY_LABELS[p.category] || p.category;
        const body = {
            _subject: `[Proteiner] Nowy produkt: ${p.name}`,
            _template: 'box',
            _captcha: 'false',
            name: p.name,
            category: catLabel,
            emoji: p.emoji,
            kcal: p.kcal,
            protein: p.protein,
            carbs: p.carbs,
            fat: p.fat,
            satFat: p.satFat,
            unsatFat: p.unsatFat,
            serving: `${p.servingText} (${p.servingGrams} g)`,
            micros: p.micros,
            extra: p.extra || '—',
            contact_email: data.contactEmail || '—',
            json: JSON.stringify(p),
            message: formatEmailBody(data)
        };

        const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(ADMIN_EMAIL)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            throw new Error('Nie udało się wysłać formularza.');
        }
        const json = await res.json().catch(() => ({}));
        if (json.success === false) {
            throw new Error(json.message || 'Błąd wysyłki.');
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        showError('');
        showSuccess('');

        if (!document.getElementById('apConfirm').checked) {
            showError('Zaznacz potwierdzenie, że wartości dotyczą 100 g produktu.');
            return;
        }

        const built = buildPayload();
        if (built.error) {
            showError(built.error);
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Wysyłanie…';

        try {
            await sendToAdmin(built);
            saveLocalBackup(built);
            form.reset();
            populateCategorySelect(categoryEl, { includeAll: false, useDietaLabels: true });
            showSuccess(
                'Dzięki! Zgłoszenie zostało wysłane do weryfikacji. Gdy je zaakceptuję, produkt pojawi się w bazie.'
            );
        } catch {
            saveLocalBackup(built);
            showSuccess(
                'Zgłoszenie zapisane lokalnie — e-mail mógł się nie wysłać (sprawdź połączenie). Skontaktuj się ze mną przez stronę Informacje, jeśli nic nie dotrze.'
            );
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Wyślij do weryfikacji';
        }
    });
})();
