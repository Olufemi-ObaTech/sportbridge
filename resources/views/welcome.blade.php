<x-app-layout>
    @php $heroSport = session('sport', \App\Http\Middleware\SetSport::DEFAULT); @endphp
    <div class="fc-hero px-3 px-md-5 py-5 mb-5">
        <img src="{{ asset('img/world-cup-ball.avif') }}" alt="" class="fc-hero-ball d-none d-md-block">
        <div class="container py-4">
            <div class="row align-items-center g-5">
                <div class="col-12 col-lg-7">
                    <span class="fc-hero-badge fc-animate-in">
                        <i class="bi bi-globe-americas" aria-hidden="true"></i>
                        {{ __('Trusted by clubs, academies and agencies worldwide') }}
                    </span>
                    <h1 class="display-4 fw-bold mt-3 mb-3 fc-animate-in fc-delay-1">
                        {{ __('Connecting Sports talent with the people who build careers.') }}
                    </h1>
                    <p class="lead fc-animate-in fc-delay-2" style="color: rgba(247,249,248,.78);">
                        {{ __('Players build a free profile. Academies and clubs showcase squads and post jobs. Agents and scouts discover talent. Coaches and sporting directors find their next move. Every stakeholder in the game, connected.') }}
                    </p>
                    <div class="d-flex flex-wrap gap-2 mt-4 fc-animate-in fc-delay-3">
                        <a href="{{ route('register') }}" class="btn btn-secondary btn-lg">{{ __('Get started') }} <i class="bi bi-arrow-right ms-1" aria-hidden="true"></i></a>
                        <a href="{{ route('players.index') }}" class="btn btn-outline-light btn-lg">{{ __('Browse players') }}</a>
                    </div>

                    <div class="row g-4 mt-4 fc-animate-in fc-delay-3">
                        <div class="col-4">
                            <div class="fc-stat-value fc-gradient-text">500+</div>
                            <div class="small" style="color: rgba(247,249,248,.65);">{{ __('Player profiles') }}</div>
                        </div>
                        <div class="col-4">
                            <div class="fc-stat-value fc-gradient-text">120+</div>
                            <div class="small" style="color: rgba(247,249,248,.65);">{{ __('Academies & clubs') }}</div>
                        </div>
                        <div class="col-4">
                            <div class="fc-stat-value fc-gradient-text">40+</div>
                            <div class="small" style="color: rgba(247,249,248,.65);">{{ __('Countries reached') }}</div>
                        </div>
                    </div>
                </div>
                <div class="col-12 col-lg-5">
                    <div class="row row-cols-2 row-cols-lg-1 g-3 text-center text-lg-start">
                        <div class="col">
                            <div class="card h-100 p-3 p-md-4 d-flex flex-row align-items-center gap-3 justify-content-center justify-content-lg-start" style="border: none;">
                                <span class="fc-icon-badge fc-icon-badge-gold flex-shrink-0"><i class="bi bi-person-arms-up" aria-hidden="true"></i></span>
                                <div class="d-none d-lg-block">
                                    <h2 class="h6 mb-1">{{ __('Players') }}</h2>
                                    <p class="small text-muted mb-0">{{ __('Free profile. Get discovered.') }}</p>
                                </div>
                                <h2 class="h6 mb-0 d-lg-none">{{ __('Players') }}</h2>
                            </div>
                        </div>
                        <div class="col">
                            <div class="card h-100 p-3 p-md-4 d-flex flex-row align-items-center gap-3 justify-content-center justify-content-lg-start" style="border: none;">
                                <span class="fc-icon-badge flex-shrink-0"><i class="bi bi-building" aria-hidden="true"></i></span>
                                <div class="d-none d-lg-block">
                                    <h2 class="h6 mb-1">{{ __('Clubs & Academies') }}</h2>
                                    <p class="small text-muted mb-0">{{ __('Showcase your squad to the world.') }}</p>
                                </div>
                                <h2 class="h6 mb-0 d-lg-none">{{ __('Clubs') }}</h2>
                            </div>
                        </div>
                        <div class="col">
                            <div class="card h-100 p-3 p-md-4 d-flex flex-row align-items-center gap-3 justify-content-center justify-content-lg-start" style="border: none;">
                                <span class="fc-icon-badge flex-shrink-0"><i class="bi bi-binoculars" aria-hidden="true"></i></span>
                                <div class="d-none d-lg-block">
                                    <h2 class="h6 mb-1">{{ __('Agents & Scouts') }}</h2>
                                    <p class="small text-muted mb-0">{{ __('Scout the next generation.') }}</p>
                                </div>
                                <h2 class="h6 mb-0 d-lg-none">{{ __('Agents') }}</h2>
                            </div>
                        </div>
                        <div class="col">
                            <div class="card h-100 p-3 p-md-4 d-flex flex-row align-items-center gap-3 justify-content-center justify-content-lg-start" style="border: none;">
                                <span class="fc-icon-badge flex-shrink-0"><i class="bi bi-clipboard2-pulse" aria-hidden="true"></i></span>
                                <div class="d-none d-lg-block">
                                    <h2 class="h6 mb-1">{{ __('Coaches & Sporting Directors') }}</h2>
                                    <p class="small text-muted mb-0">{{ __('Land your next role.') }}</p>
                                </div>
                                <h2 class="h6 mb-0 d-lg-none">{{ __('Coaches') }}</h2>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="container">
        <div class="text-center mb-5">
            <h2 class="h3 fw-bold" style="color: var(--fc-blue-700);">{{ __('One platform, every side of the game') }}</h2>
            <p class="text-muted">{{ __('Purpose-built tools for players, clubs, agents, scouts, coaches and sporting directors alike.') }}</p>
        </div>

        <div class="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 pb-5">
            <div class="col">
                <div class="card h-100 p-4" style="border: none;">
                    <span class="fc-icon-badge fc-icon-badge-gold mb-3"><i class="bi bi-person-arms-up" aria-hidden="true"></i></span>
                    <h2 class="h5">{{ __('For Players') }}</h2>
                    <p class="text-muted">{{ __('Create a free profile with photos, highlight videos and your CV. Go public and get discovered - no academy required.') }}</p>
                    <a href="{{ route('register.player', $heroSport) }}" class="fw-semibold">{{ __('Create your player profile') }} <i class="bi bi-arrow-right" aria-hidden="true"></i></a>
                </div>
            </div>
            <div class="col">
                <div class="card h-100 p-4" style="border: none;">
                    <span class="fc-icon-badge mb-3"><i class="bi bi-person-badge" aria-hidden="true"></i></span>
                    <h2 class="h5">{{ __('For Clubs & Academies') }}</h2>
                    <p class="text-muted">{{ __('Build player profiles, manage teams, and post coaching or scouting vacancies to reach the right people.') }}</p>
                    <a href="{{ route('register.academy', $heroSport) }}" class="fw-semibold">{{ __('Register your academy') }} <i class="bi bi-arrow-right" aria-hidden="true"></i></a>
                </div>
            </div>
            <div class="col">
                <div class="card h-100 p-4" style="border: none;">
                    <span class="fc-icon-badge mb-3"><i class="bi bi-search" aria-hidden="true"></i></span>
                    <h2 class="h5">{{ __('For Agents & Scouts') }}</h2>
                    <p class="text-muted">{{ __('Search players by position, age, and nationality, build a watchlist, and request access to full profiles.') }}</p>
                    <a href="{{ route('register.agent', $heroSport) }}" class="fw-semibold">{{ __('Register as an agent') }} <i class="bi bi-arrow-right" aria-hidden="true"></i></a>
                </div>
            </div>
            <div class="col">
                <div class="card h-100 p-4" style="border: none;">
                    <span class="fc-icon-badge mb-3"><i class="bi bi-briefcase" aria-hidden="true"></i></span>
                    <h2 class="h5">{{ __('For Coaches & Sporting Directors') }}</h2>
                    <p class="text-muted">{{ __('Browse open roles across academies and clubs, and apply directly with your CV and badges.') }}</p>
                    <a href="{{ route('register.coach', $heroSport) }}" class="fw-semibold">{{ __('Register as a coach') }} <i class="bi bi-arrow-right" aria-hidden="true"></i></a>
                </div>
            </div>
        </div>

        <div class="rounded-4 p-5 mb-5 text-center fc-band-photo">
            <h2 class="h3 fw-bold text-white mb-2">{{ __('Ready to make your next move?') }}</h2>
            <p class="mb-4" style="color: rgba(255,255,255,.85);">{{ __('Join :app today, free for players — it only takes a minute to get started.', ['app' => config('app.name')]) }}</p>
            <a href="{{ route('register') }}" class="btn btn-secondary btn-lg">{{ __('Create your free account') }}</a>
        </div>
    </div>
</x-app-layout>
