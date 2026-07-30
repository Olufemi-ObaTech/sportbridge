<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" dir="{{ in_array(app()->getLocale(), \App\Http\Middleware\SetLocale::RTL, true) ? 'rtl' : 'ltr' }}" data-bs-theme="light">
<head>
    @include('layouts.partials.head')
</head>
<body class="d-flex flex-column min-vh-100">
    <a class="visually-hidden-focusable btn btn-primary position-absolute top-0 start-0 m-2" href="#main-content">
        {{ __('Skip to main content') }}
    </a>

    @include('layouts.partials.navbar')

    <main id="main-content" class="flex-grow-1">
        <div class="container py-4">
            @include('layouts.partials.flash-messages')
        </div>

        @isset($header)
            <div class="container pb-3">
                {{ $header }}
            </div>
        @endisset

        {{ $slot }}
    </main>

    @include('layouts.partials.footer')

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    @stack('scripts')
</body>
</html>
