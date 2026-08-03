<nav class="navbar navbar-expand-lg sticky-top shadow-sm" data-bs-theme="dark">
    <div class="container">
        <a class="navbar-brand" href="{{ route('home') }}">
            <x-application-logo size="24" />
        </a>

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar"
                aria-controls="mainNavbar" aria-expanded="false" aria-label="{{ __('Toggle navigation') }}">
            <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="mainNavbar">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                <li class="nav-item">
                    <x-nav-link href="{{ route('players.index') }}" :active="request()->routeIs('players.index')">{{ __('Players') }}</x-nav-link>
                </li>
                <li class="nav-item">
                    <x-nav-link href="{{ route('jobs.index') }}" :active="request()->routeIs('jobs.*')">{{ __('Jobs') }}</x-nav-link>
                </li>
                <li class="nav-item">
                    <x-nav-link href="{{ route('feed.index') }}" :active="request()->routeIs('feed.index')">{{ __('Feed') }}</x-nav-link>
                </li>
            </ul>

            <ul class="navbar-nav ms-auto align-items-lg-center gap-lg-2">
                <li class="nav-item">
                    <x-sport-switcher variant="dark" />
                </li>
                <li class="nav-item">
                    <x-language-switcher variant="dark" />
                </li>
                <li class="nav-item">
                    <button type="button" class="btn btn-link nav-link" data-theme-toggle aria-pressed="false" aria-label="{{ __('Toggle dark mode') }}">
                        <i class="bi bi-moon-stars" aria-hidden="true"></i>
                    </button>
                </li>

                @auth
                    <li class="nav-item">
                        <x-nav-link href="{{ route('dashboard') }}" :active="request()->routeIs('dashboard')">{{ __('Dashboard') }}</x-nav-link>
                    </li>
                    <li class="nav-item">
                        <x-notification-bell variant="dark" />
                    </li>
                    <li class="nav-item">
                        <x-dropdown align="end" width="48">
                            <x-slot name="trigger">
                                <span class="nav-link d-inline-flex align-items-center gap-1">
                                    {{ auth()->user()->name }}
                                    <i class="bi bi-chevron-down small" aria-hidden="true"></i>
                                </span>
                            </x-slot>
                            <x-slot name="content">
                                <x-dropdown-link href="{{ route('profile.edit') }}">{{ __('Account Settings') }}</x-dropdown-link>
                                <x-dropdown-link href="{{ route('recommendations.index') }}">{{ __('My Recommendations') }}</x-dropdown-link>
                                <form method="POST" action="{{ route('logout') }}">
                                    @csrf
                                    <x-dropdown-link href="{{ route('logout') }}" data-submit-closest-form>
                                        {{ __('Log Out') }}
                                    </x-dropdown-link>
                                </form>
                            </x-slot>
                        </x-dropdown>
                    </li>
                @else
                    <li class="nav-item">
                        <x-nav-link href="{{ route('login') }}" :active="request()->routeIs('login')">{{ __('Log in') }}</x-nav-link>
                    </li>
                    <li class="nav-item">
                        <a href="{{ route('register') }}" class="btn btn-secondary btn-sm ms-lg-2">{{ __('Join :app', ['app' => config('app.name')]) }}</a>
                    </li>
                @endauth
            </ul>
        </div>
    </div>
</nav>
