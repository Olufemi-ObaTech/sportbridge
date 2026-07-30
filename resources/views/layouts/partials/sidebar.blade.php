@php
    $navItems = config('navigation.'.auth()->user()->role, []);
@endphp

<div class="d-flex flex-column h-100 p-3">
    <a href="{{ route('home') }}" class="d-none d-lg-inline-block text-decoration-none mb-4">
        <x-application-logo size="22" class="text-white" />
    </a>

    <nav class="nav nav-pills flex-column gap-1" aria-label="{{ __('Dashboard navigation') }}">
        @foreach ($navItems as $item)
            <a href="{{ route($item['route']) }}"
               class="nav-link{{ request()->routeIs(explode('.', $item['route'])[0].'.*') || request()->routeIs($item['route']) ? ' active' : '' }}">
                <i class="bi {{ $item['icon'] }} me-2" aria-hidden="true"></i>{{ __($item['label']) }}
            </a>
        @endforeach
    </nav>

    <div class="mt-auto pt-3 border-top border-light border-opacity-25">
        <form method="POST" action="{{ route('logout') }}">
            @csrf
            <button type="submit" class="nav-link btn btn-link text-start w-100 p-0">
                <i class="bi bi-box-arrow-right me-2" aria-hidden="true"></i>{{ __('Log Out') }}
            </button>
        </form>
    </div>
</div>
