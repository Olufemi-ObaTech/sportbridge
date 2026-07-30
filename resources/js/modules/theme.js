const COOKIE_NAME = 'fc_theme';
const root = document.documentElement;

function readCookie(name) {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name, value) {
    const oneYear = 60 * 60 * 24 * 365;
    document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${oneYear}; path=/; SameSite=Lax`;
}

function applyTheme(theme) {
    root.setAttribute('data-bs-theme', theme);
    document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
        btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
        const icon = btn.querySelector('i');
        if (icon) {
            icon.className = theme === 'dark' ? 'bi bi-sun' : 'bi bi-moon-stars';
        }
    });
}

function currentTheme() {
    const stored = readCookie(COOKIE_NAME);
    if (stored === 'dark' || stored === 'light') {
        return stored;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

applyTheme(currentTheme());

document.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-theme-toggle]');
    if (!btn) {
        return;
    }
    const next = root.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
    writeCookie(COOKIE_NAME, next);
    applyTheme(next);
});
