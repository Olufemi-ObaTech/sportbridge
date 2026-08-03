<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" dir="{{ in_array(app()->getLocale(), \App\Http\Middleware\SetLocale::RTL, true) ? 'rtl' : 'ltr' }}" data-bs-theme="light">
<head>
    @include('layouts.partials.head', ['title' => $title ? $title.' - '.config('app.name') : null])
</head>
<body>
    <div class="d-flex" style="min-height: 100vh;">
        {{-- Persistent sidebar at >=992px --}}
        <aside class="fc-sidebar d-none d-lg-block" style="width: 260px; flex: 0 0 260px;">
            @include('layouts.partials.sidebar')
        </aside>

        {{-- Offcanvas sidebar below 992px --}}
        <div class="offcanvas offcanvas-start fc-sidebar d-lg-none" tabindex="-1" id="dashboardSidebar" aria-labelledby="dashboardSidebarLabel">
            <div class="offcanvas-header">
                <h2 class="offcanvas-title h6" id="dashboardSidebarLabel">{{ __('Menu') }}</h2>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="{{ __('Close') }}"></button>
            </div>
            <div class="offcanvas-body p-0">
                @include('layouts.partials.sidebar')
            </div>
        </div>

        <div class="flex-grow-1 d-flex flex-column" style="min-width: 0;">
            <header class="fc-dashboard-header border-bottom sticky-top">
                <div class="d-flex align-items-center justify-content-between px-3" style="height: 60px;">
                    <div class="d-flex align-items-center gap-3">
                        <button class="btn btn-outline-secondary d-lg-none" type="button" data-bs-toggle="offcanvas"
                                data-bs-target="#dashboardSidebar" aria-controls="dashboardSidebar" aria-label="{{ __('Open menu') }}">
                            <i class="bi bi-list" aria-hidden="true"></i>
                        </button>
                        <h1 class="h5 mb-0">{{ $title ?? __('Dashboard') }}</h1>
                    </div>

                    <div class="d-flex align-items-center gap-2">
                        <x-notification-bell />
                        <x-language-switcher />
                        <button type="button" class="btn btn-link text-body" data-theme-toggle aria-pressed="false" aria-label="{{ __('Toggle dark mode') }}">
                            <i class="bi bi-moon-stars" aria-hidden="true"></i>
                        </button>
                        <x-dropdown align="end" width="48">
                            <x-slot name="trigger">
                                <span role="button" class="d-inline-flex align-items-center gap-2 text-decoration-none text-body">
                                    <i class="bi bi-person-circle fs-4" aria-hidden="true"></i>
                                    <span class="d-none d-sm-inline">{{ auth()->user()->name }}</span>
                                </span>
                            </x-slot>
                            <x-slot name="content">
                                <x-dropdown-link href="{{ route('home') }}">{{ __('View site') }}</x-dropdown-link>
                                <x-dropdown-link href="{{ route('profile.edit') }}">{{ __('Account Settings') }}</x-dropdown-link>
                                <form method="POST" action="{{ route('logout') }}">
                                    @csrf
                                    <x-dropdown-link href="{{ route('logout') }}" data-submit-closest-form>
                                        {{ __('Log Out') }}
                                    </x-dropdown-link>
                                </form>
                            </x-slot>
                        </x-dropdown>
                    </div>
                </div>
            </header>

            <main class="flex-grow-1 p-3 p-lg-4">
                @include('layouts.partials.flash-messages')

                {{ $slot }}
            </main>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    @stack('scripts')
</body>
</html>
