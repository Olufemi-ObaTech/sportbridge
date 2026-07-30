/**
 * Generic infinite-scroll helper. Observes a sentinel element and calls
 * onLoadMore() whenever it enters the viewport, as long as hasMore() is true
 * and a load isn't already in flight. Shows/hides a small spinner inside the
 * sentinel while loading.
 *
 * @param {Object} options
 * @param {HTMLElement} options.sentinel
 * @param {() => Promise<void>} options.onLoadMore
 * @param {() => boolean} options.hasMore
 */
export function initInfiniteScroll({ sentinel, onLoadMore, hasMore }) {
    if (!sentinel || !('IntersectionObserver' in window)) {
        return { stop() {} };
    }

    let loading = false;

    const spinner = document.createElement('div');
    spinner.className = 'spinner-border spinner-border-sm text-muted d-none';
    spinner.setAttribute('role', 'status');
    sentinel.appendChild(spinner);

    const observer = new IntersectionObserver(async (entries) => {
        const isVisible = entries.some((entry) => entry.isIntersecting);

        if (!isVisible || loading || !hasMore()) {
            return;
        }

        loading = true;
        spinner.classList.remove('d-none');

        try {
            await onLoadMore();
        } finally {
            loading = false;
            spinner.classList.add('d-none');

            if (!hasMore()) {
                observer.unobserve(sentinel);
            }
        }
    }, { rootMargin: '200px' });

    observer.observe(sentinel);

    return { stop: () => observer.disconnect() };
}
