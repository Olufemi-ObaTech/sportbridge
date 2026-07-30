function csrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.content ?? '';
}

async function postToggle(url) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': csrfToken(),
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
    });

    if (!response.ok) {
        throw new Error(`Toggle failed: ${response.status}`);
    }

    return response.json();
}

export function initInteractions() {
    // data-auto-submit on a <select>/<input> submits its closest <form> on change,
    // replacing inline onchange="this.form.submit()" handlers (CSP-friendly).
    document.addEventListener('change', (event) => {
        const field = event.target.closest('[data-auto-submit]');
        if (field) {
            field.closest('form')?.submit();
        }
    });

    // data-submit-closest-form on a link/button submits its closest <form>,
    // replacing inline onclick="this.closest('form').submit()" handlers (e.g. Log Out).
    document.addEventListener('click', (event) => {
        const trigger = event.target.closest('[data-submit-closest-form]');
        if (trigger) {
            event.preventDefault();
            trigger.closest('form')?.submit();
        }
    });

    document.addEventListener('click', async (event) => {
        const likeBtn = event.target.closest('.like-toggle');
        if (likeBtn) {
            likeBtn.disabled = true;
            try {
                const data = await postToggle(likeBtn.dataset.url);
                likeBtn.querySelector('.likes-count').textContent = data.likes_count;
                likeBtn.classList.toggle('text-primary', data.liked);
            } catch (error) {
                console.error(error);
            } finally {
                likeBtn.disabled = false;
            }
            return;
        }

        const watchBtn = event.target.closest('.watchlist-toggle');
        if (watchBtn) {
            watchBtn.disabled = true;
            try {
                const data = await postToggle(watchBtn.dataset.url);
                const watching = data.watching;
                watchBtn.dataset.watching = String(watching);
                watchBtn.classList.toggle('btn-outline-danger', watching);
                watchBtn.classList.toggle('btn-outline-primary', !watching);
                watchBtn.innerHTML = watching
                    ? '<i class="bi bi-bookmark-dash me-1" aria-hidden="true"></i>Remove'
                    : '<i class="bi bi-bookmark-plus me-1" aria-hidden="true"></i>Add to Watchlist';
            } catch (error) {
                console.error(error);
            } finally {
                watchBtn.disabled = false;
            }
        }
    });
}
