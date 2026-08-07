import { initInfiniteScroll } from './infinite-scroll.js';

function debounce(fn, delay) {
    let timer = null;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

function renderPlayerCard(template, player) {
    const node = template.content.cloneNode(true);
    const img = node.querySelector('img');
    img.src = player.primary_photo_url || '/img/default-avatar.svg';
    img.alt = player.full_name;

    const nameLink = node.querySelector('.player-name');
    nameLink.textContent = player.full_name;
    nameLink.href = player.url;

    const sportLabel = player.sport ? player.sport.charAt(0).toUpperCase() + player.sport.slice(1) : '';
    node.querySelector('.player-meta').textContent = `${sportLabel} · ${player.age} yrs · ${player.position}`;
    node.querySelector('.player-club').textContent = player.club_name;

    return node;
}

export function initPlayerFilters() {
    const root = document.getElementById('player-results');
    if (!root) {
        return;
    }

    const grid = document.getElementById('player-results-grid');
    const sentinel = document.getElementById('player-results-sentinel');
    const template = document.getElementById('player-card-template');
    // The filter form is rendered twice (desktop sidebar + mobile offcanvas,
    // only one visible at a time depending on viewport) - getElementById
    // would only ever find the first (desktop) copy, leaving the mobile one
    // completely unwired. querySelectorAll, unlike getElementById, still
    // matches every element sharing that id.
    const forms = document.querySelectorAll('#player-filter-form');
    const searchUrl = root.dataset.searchUrl;

    if (!forms.length) {
        return;
    }

    let currentPage = 1;
    let lastPage = 1;
    let activeForm = forms[0];

    function currentParams(page) {
        const params = new URLSearchParams(new FormData(activeForm));
        params.set('page', page);
        [...params.keys()].forEach((key) => {
            if (params.get(key) === '') {
                params.delete(key);
            }
        });
        return params;
    }

    async function fetchPlayers(page, { append = false } = {}) {
        const params = currentParams(page);

        const response = await fetch(`${searchUrl}?${params.toString()}`, {
            headers: { 'X-Requested-With': 'XMLHttpRequest', Accept: 'application/json' },
        });

        if (!response.ok) {
            console.error(`Player search failed: ${response.status}`);
            return;
        }

        const data = await response.json();

        if (!append) {
            grid.innerHTML = '';
        }

        if (data.data.length === 0 && !append) {
            grid.innerHTML = '<div class="col-12"><div class="fc-empty-state"><i class="bi bi-search" aria-hidden="true"></i><p class="mt-3 mb-0">No players match your filters.</p></div></div>';
        } else {
            data.data.forEach((player) => grid.appendChild(renderPlayerCard(template, player)));
        }

        currentPage = data.current_page;
        lastPage = data.last_page;

        if (!append) {
            const url = new URL(window.location.href);
            url.search = params.toString();
            window.history.pushState({}, '', url);
        }
    }

    const debouncedSearch = debounce(() => fetchPlayers(1), 300);

    const POSITIONS = {
        football: ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'],
        basketball: ['PG', 'SG', 'SF', 'PF', 'C'],
    };

    forms.forEach((form) => {
        const sportSelect = form.querySelector('.filter-sport');
        const positionSelect = form.querySelector('.filter-position');
        const footField = form.querySelector('.filter-foot-field');

        function syncSportFields() {
            if (!sportSelect || !positionSelect) {
                return;
            }

            const sport = sportSelect.value;
            const positions = POSITIONS[sport] || [...POSITIONS.football, ...POSITIONS.basketball];
            const current = positionSelect.value;

            positionSelect.innerHTML = '';
            const anyOption = document.createElement('option');
            anyOption.value = '';
            anyOption.textContent = 'Any';
            positionSelect.appendChild(anyOption);
            positions.forEach((position) => {
                const option = document.createElement('option');
                option.value = position;
                option.textContent = position;
                if (position === current) {
                    option.selected = true;
                }
                positionSelect.appendChild(option);
            });

            if (footField) {
                const isBasketball = sport === 'basketball';
                footField.style.display = isBasketball ? 'none' : '';
                const footSelect = footField.querySelector('select');
                if (footSelect) {
                    footSelect.disabled = isBasketball;
                    if (isBasketball) { footSelect.value = ''; }
                }
            }
        }

        sportSelect?.addEventListener('change', syncSportFields);
        syncSportFields();

        form.addEventListener('input', () => {
            activeForm = form;
            debouncedSearch();
        });
        form.addEventListener('change', () => {
            activeForm = form;
            debouncedSearch();
        });

        form.querySelector('#filter-reset')?.addEventListener('click', () => {
            form.reset();
            activeForm = form;
            fetchPlayers(1);
        });
    });

    initInfiniteScroll({
        sentinel,
        hasMore: () => currentPage < lastPage,
        onLoadMore: () => fetchPlayers(currentPage + 1, { append: true }),
    });

    fetchPlayers(1);
}
