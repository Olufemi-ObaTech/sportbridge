@php
    $navItems = config('navigation.'.auth()->user()->role, []);

    // Highlighting by request()->routeIs(explode('.', $route)[0].'.*') collapses
    // every nav item down to its first segment (e.g. "admin.analytics.index" and
    // "admin.users.index" both become "admin.*"), so unrelated sibling sections
    // light up together. Instead, pick whichever nav item's route is the longest
    // matching prefix of the current route name - the same "most specific route
    // wins" rule a router uses - so e.g. "jobs.mine.create" matches "jobs.mine.index"
    // (prefix "jobs.mine") and not also "jobs.index" (prefix "jobs").
    $currentRouteName = request()->route()?->getName() ?? '';
    $activeNavRoute = null;
    $bestPrefixLength = -1;

    foreach ($navItems as $item) {
        $prefix = \Illuminate\Support\Str::beforeLast($item['route'], '.');

        if ($currentRouteName === $item['route'] || str_starts_with($currentRouteName, $prefix.'.')) {
            if (strlen($prefix) > $bestPrefixLength) {
                $bestPrefixLength = strlen($prefix);
                $activeNavRoute = $item['route'];
            }
        }
    }
@endphp

<div class="d-flex flex-column h-100 p-3">
    <a href="{{ route('home') }}" class="d-none d-lg-inline-block text-decoration-none mb-4">
        <x-application-logo size="22" class="text-white" />
    </a>

    <nav class="nav nav-pills flex-column gap-1" aria-label="{{ __('Dashboard navigation') }}">
        @foreach ($navItems as $item)
            <a href="{{ route($item['route']) }}"
               class="nav-link{{ $item['route'] === $activeNavRoute ? ' active' : '' }}">
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
