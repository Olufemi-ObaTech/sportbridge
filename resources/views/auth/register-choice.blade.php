<x-guest-layout max-width="960px">
    <h1 class="h4 mb-1 text-center">{{ __('Join :app', ['app' => config('app.name')]) }}</h1>
    <p class="text-muted text-center mb-4">{{ __('Choose your account type, then your sport.') }}</p>

    @php
        $roles = [
            [
                'role' => 'player',
                'icon' => 'bi-person-arms-up',
                'badge' => 'fc-icon-badge-gold',
                'title' => __('Player'),
                'description' => __('Free forever. Build your profile and get discovered.'),
            ],
            [
                'role' => 'academy',
                'icon' => 'bi-building',
                'badge' => '',
                'title' => __('Academy / Club'),
                'description' => __('Showcase players and post coaching jobs.'),
            ],
            [
                'role' => 'agent',
                'icon' => 'bi-binoculars',
                'badge' => '',
                'title' => __('Agent / Scout'),
                'description' => __('Discover talent and manage your watchlist.'),
            ],
            [
                'role' => 'coach',
                'icon' => 'bi-clipboard2-pulse',
                'badge' => '',
                'title' => __('Coach / Manager'),
                'description' => __('Find your next role at a club.'),
            ],
        ];
    @endphp

    <div class="row row-cols-1 row-cols-md-2 g-3">
        @foreach ($roles as $item)
            <div class="col">
                <div class="card h-100 p-4 text-center">
                    <span class="fc-icon-badge {{ $item['badge'] }} mx-auto mb-3"><i class="bi {{ $item['icon'] }}" aria-hidden="true"></i></span>
                    <h2 class="h6 mb-1">{{ $item['title'] }}</h2>
                    <p class="small text-muted mb-3">{{ $item['description'] }}</p>
                    <div class="d-flex gap-2 justify-content-center mt-auto">
                        <a href="{{ route('register.'.$item['role'], 'football') }}" class="btn btn-outline-primary btn-sm flex-fill">
                            <i class="bi bi-dribbble me-1" aria-hidden="true"></i>{{ __('Football') }}
                        </a>
                        <a href="{{ route('register.'.$item['role'], 'basketball') }}" class="btn btn-outline-primary btn-sm flex-fill">
                            <i class="bi bi-circle me-1" aria-hidden="true"></i>{{ __('Basketball') }}
                        </a>
                    </div>
                </div>
            </div>
        @endforeach
    </div>

    <p class="text-center small mt-4 mb-0">
        {{ __('Already have an account?') }} <a href="{{ route('login') }}">{{ __('Log in') }}</a>
    </p>
</x-guest-layout>
