function csrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.content;
}

export function initSavedSearch() {
    document.addEventListener('click', async (event) => {
        const trigger = event.target.closest('[data-save-search]');
        if (!trigger) {
            return;
        }

        // The filter form is rendered twice (desktop + mobile offcanvas) with
        // the same id - resolve from the actual button clicked rather than
        // getElementById, which would always grab the desktop copy regardless
        // of which form the visitor was actually looking at.
        const form = trigger.closest('form');
        if (!form) {
            return;
        }

        const criteria = {};
        new URLSearchParams(new FormData(form)).forEach((value, key) => {
            if (value !== '') {
                criteria[key] = value;
            }
        });

        const original = trigger.innerHTML;
        trigger.disabled = true;

        try {
            const response = await fetch('/saved-searches', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken(),
                    Accept: 'application/json',
                },
                body: JSON.stringify({ criteria }),
            });

            if (response.ok) {
                trigger.innerHTML = '<i class="bi bi-bookmark-check-fill me-1" aria-hidden="true"></i>Saved';
                setTimeout(() => {
                    trigger.innerHTML = original;
                    trigger.disabled = false;
                }, 1800);
            } else {
                trigger.disabled = false;
            }
        } catch (e) {
            trigger.disabled = false;
        }
    });
}
