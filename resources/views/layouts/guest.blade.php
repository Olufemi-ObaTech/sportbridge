<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" dir="{{ in_array(app()->getLocale(), \App\Http\Middleware\SetLocale::RTL, true) ? 'rtl' : 'ltr' }}" data-bs-theme="light">
<head>
    @include('layouts.partials.head', ['title' => $title ? $title.' - '.config('app.name') : null])
</head>
<body class="d-flex flex-column min-vh-100" style="background: var(--fc-gradient-hero);">
    <main class="flex-grow-1 d-flex align-items-center justify-content-center py-5 position-relative">
        <div class="position-absolute top-0 end-0 m-3">
            <x-language-switcher variant="dark" />
        </div>

        <div class="w-100 px-3 fc-animate-in" style="max-width: {{ $maxWidth ?? '480px' }};">
            <div class="text-center mb-4 text-white">
                <a href="{{ route('home') }}" class="text-decoration-none">
                    <x-application-logo size="32" />
                </a>
            </div>

            <div class="card" style="border: none;">
                <div class="card-body p-4 p-md-5">
                    @include('layouts.partials.flash-messages')

                    {{ $slot }}
                </div>
            </div>
        </div>
    </main>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
