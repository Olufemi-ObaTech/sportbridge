@push('meta')
    <meta property="og:type" content="profile">
    <meta property="og:title" content="{{ $player->full_name }} - {{ $player->position }} - {{ config('app.name') }}">
    <meta property="og:description" content="{{ $player->age }} yo {{ $player->position }}{{ $player->academy ? ' at '.$player->academy->club_name : ' - Free Agent' }}">
    @if ($player->primary_photo_url)
        <meta property="og:image" content="{{ asset('storage/'.$player->primary_photo_url) }}">
    @endif
    <meta name="twitter:card" content="summary_large_image">
@endpush

<x-app-layout>
    <div class="row g-4">
        <div class="col-12 col-lg-4">
            <img src="{{ $player->primary_photo_url ? asset('storage/'.$player->primary_photo_url) : asset('img/default-avatar.svg') }}"
                 class="w-100 rounded" alt="{{ $player->full_name }}" style="aspect-ratio: 4/5; object-fit: cover;">

            @auth
                @if (auth()->user()->role === 'agent')
                    <div class="d-grid gap-2 mt-3">
                        <button type="button" class="btn btn-outline-primary watchlist-toggle"
                                data-url="{{ route('agent.watchlist.toggle', $player) }}" data-watching="false">
                            <i class="bi bi-bookmark-plus me-1" aria-hidden="true"></i>{{ __('Add to Watchlist') }}
                        </button>

                        @if ($player->academy && ! $canViewPrivateDetails)
                            <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#requestAccessModal">
                                <i class="bi bi-shield-lock me-1" aria-hidden="true"></i>{{ __('Request Full Access') }}
                            </button>
                        @endif
                    </div>
                @endif
            @endauth

            @if ($player->user)
                <div class="d-grid gap-2 mt-3">
                    <x-message-button :user="$player->user" />
                    <x-report-link :user="$player->user" />
                </div>
            @endif

            @if ($player->linkedin)
                <div class="d-grid mt-2">
                    <a href="{{ $player->linkedin_url }}" target="_blank" rel="noopener" class="btn btn-outline-secondary btn-sm">
                        <i class="bi bi-linkedin me-1" aria-hidden="true"></i>{{ __('LinkedIn') }}
                    </a>
                </div>
            @endif

            @if ($player->cv_url && $canViewPrivateDetails)
                <div class="d-grid mt-3">
                    <a href="{{ URL::temporarySignedRoute('documents.player-cv', now()->addMinutes(10), ['player' => $player->id]) }}"
                       class="btn btn-outline-secondary" target="_blank" rel="noopener">
                        <i class="bi bi-file-earmark-text me-1" aria-hidden="true"></i>{{ __('View CV') }}
                    </a>
                </div>
            @endif
        </div>

        <div class="col-12 col-lg-8">
            <h1 class="h4 mb-1">{{ $player->full_name }}</h1>
            <span class="badge text-bg-light border mb-2">{{ __(ucfirst($player->sport)) }}</span>
            <p class="text-muted mb-3">
                @if ($player->academy)
                    <a href="{{ route('academy.show', $player->academy) }}" class="text-decoration-none">{{ $player->academy->club_name }}</a>
                    @if ($player->team) &middot; {{ $player->team->name }} @endif
                @else
                    <span class="badge text-bg-secondary"><i class="bi bi-person-check me-1" aria-hidden="true"></i>{{ __('Free Agent') }}</span>
                @endif
            </p>

            <div class="stat-strip gap-4 pb-2 mb-3 border-bottom">
                <div class="text-center px-2"><div class="small text-muted">{{ __('Age') }}</div><div class="fw-semibold">{{ $player->age }}</div></div>
                <div class="text-center px-2"><div class="small text-muted">{{ __('Position') }}</div><div class="fw-semibold">{{ $player->position }}</div></div>
                <div class="text-center px-2"><div class="small text-muted">{{ __('Nationality') }}</div><div class="fw-semibold">{{ $player->nationality }}</div></div>
                @if ($player->sport === 'basketball')
                    <div class="text-center px-2"><div class="small text-muted">{{ __('Hand') }}</div><div class="fw-semibold">{{ $player->dominant_hand ? ucfirst($player->dominant_hand) : '-' }}</div></div>
                @else
                    <div class="text-center px-2"><div class="small text-muted">{{ __('Foot') }}</div><div class="fw-semibold">{{ $player->foot ? ucfirst($player->foot) : '-' }}</div></div>
                @endif
                <div class="text-center px-2"><div class="small text-muted">{{ __('Height') }}</div><div class="fw-semibold">{{ $player->height_cm ?? '-' }} cm</div></div>
                <div class="text-center px-2"><div class="small text-muted">{{ __('Weight') }}</div><div class="fw-semibold">{{ $player->weight_kg ?? '-' }} kg</div></div>
            </div>

            <ul class="nav nav-tabs d-none d-md-flex" role="tablist">
                <li class="nav-item"><button class="nav-link active" data-bs-toggle="tab" data-bs-target="#p-tab-bio" type="button">{{ __('Bio') }}</button></li>
                <li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#p-tab-media" type="button">{{ __('Media') }}</button></li>
                @if ($canViewPrivateDetails && $player->academy)
                    <li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#p-tab-contact" type="button">{{ __('Contact') }}</button></li>
                @endif
            </ul>

            <div class="tab-content d-none d-md-block border border-top-0 p-3 rounded-bottom bg-white">
                <div class="tab-pane fade show active" id="p-tab-bio">{{ $player->bio ?: __('No bio provided.') }}</div>
                <div class="tab-pane fade" id="p-tab-media">@include('public.partials.player-media')</div>
                @if ($canViewPrivateDetails && $player->academy)
                    <div class="tab-pane fade" id="p-tab-contact">@include('public.partials.player-contact')</div>
                @endif
            </div>

            <div class="accordion d-md-none" id="playerPublicAccordion">
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#pub-acc-bio">{{ __('Bio') }}</button>
                    </h2>
                    <div id="pub-acc-bio" class="accordion-collapse collapse show" data-bs-parent="#playerPublicAccordion">
                        <div class="accordion-body">{{ $player->bio ?: __('No bio provided.') }}</div>
                    </div>
                </div>
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#pub-acc-media">{{ __('Media') }}</button>
                    </h2>
                    <div id="pub-acc-media" class="accordion-collapse collapse" data-bs-parent="#playerPublicAccordion">
                        <div class="accordion-body">@include('public.partials.player-media')</div>
                    </div>
                </div>
                @if ($canViewPrivateDetails && $player->academy)
                    <div class="accordion-item">
                        <h2 class="accordion-header">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#pub-acc-contact">{{ __('Contact') }}</button>
                        </h2>
                        <div id="pub-acc-contact" class="accordion-collapse collapse" data-bs-parent="#playerPublicAccordion">
                            <div class="accordion-body">@include('public.partials.player-contact')</div>
                        </div>
                    </div>
                @endif
            </div>
        </div>
    </div>

    @auth
        @if ($player->academy && auth()->user()->role === 'agent' && ! $canViewPrivateDetails)
            <x-modal name="requestAccessModal">
                <form method="POST" action="{{ route('agent.access-requests.store', $player) }}">
                    @csrf
                    <div class="modal-header">
                        <h2 class="modal-title h5">{{ __('Request Full Access') }}</h2>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="{{ __('Close') }}"></button>
                    </div>
                    <div class="modal-body">
                        <x-input-label for="access-message" :value="__('Message to the academy')" />
                        <textarea id="access-message" name="message" rows="4" class="form-control" required></textarea>
                    </div>
                    <div class="modal-footer">
                        <x-secondary-button data-bs-dismiss="modal">{{ __('Cancel') }}</x-secondary-button>
                        <x-primary-button>{{ __('Send Request') }}</x-primary-button>
                    </div>
                </form>
            </x-modal>
        @endif
    @endauth
</x-app-layout>
