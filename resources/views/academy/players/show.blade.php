<x-dashboard-layout title="{{ $player->full_name }}">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
            <h1 class="h5 mb-0">{{ $player->full_name }}</h1>
            <p class="small text-muted mb-0">{{ $player->team->name }}</p>
        </div>
        <div class="d-flex gap-2">
            <a href="{{ route('player.show', $player) }}" class="btn btn-outline-secondary btn-sm" target="_blank" rel="noopener">
                <i class="bi bi-box-arrow-up-right me-1" aria-hidden="true"></i>{{ __('View public profile') }}
            </a>
            <a href="{{ route('academy.players.edit', $player) }}" class="btn btn-outline-secondary btn-sm">{{ __('Edit') }}</a>
            <form method="POST" action="{{ route('academy.players.destroy', $player) }}">
                @csrf
                @method('DELETE')
                <button type="submit" class="btn btn-outline-danger btn-sm" data-confirm="{{ __('Remove this player permanently?') }}">
                    {{ __('Delete') }}
                </button>
            </form>
        </div>
    </div>

    <div class="row g-4">
        <div class="col-12 col-lg-4">
            <div class="card">
                <img src="{{ $player->primary_photo_url ? asset('storage/'.$player->primary_photo_url) : asset('img/default-avatar.svg') }}"
                     class="card-img-top" alt="{{ $player->full_name }}" style="aspect-ratio: 4/5; object-fit: cover;">
                <div class="card-body">
                    <div class="stat-strip gap-3 pb-1">
                        <div class="text-center px-2"><div class="small text-muted">{{ __('Age') }}</div><div class="fw-semibold">{{ $player->age }}</div></div>
                        <div class="text-center px-2"><div class="small text-muted">{{ __('Position') }}</div><div class="fw-semibold">{{ $player->position }}</div></div>
                        @if ($player->sport === 'basketball')
                            <div class="text-center px-2"><div class="small text-muted">{{ __('Hand') }}</div><div class="fw-semibold">{{ $player->dominant_hand ? ucfirst($player->dominant_hand) : '-' }}</div></div>
                        @else
                            <div class="text-center px-2"><div class="small text-muted">{{ __('Foot') }}</div><div class="fw-semibold">{{ $player->foot ? ucfirst($player->foot) : '-' }}</div></div>
                        @endif
                        <div class="text-center px-2"><div class="small text-muted">{{ __('Height') }}</div><div class="fw-semibold">{{ $player->height_cm ?? '-' }} cm</div></div>
                        <div class="text-center px-2"><div class="small text-muted">{{ __('Weight') }}</div><div class="fw-semibold">{{ $player->weight_kg ?? '-' }} kg</div></div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-12 col-lg-8">
            <ul class="nav nav-tabs d-none d-md-flex" id="playerTabs" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#tab-info" type="button" role="tab">{{ __('Info') }}</button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" data-bs-toggle="tab" data-bs-target="#tab-media" type="button" role="tab">{{ __('Media') }}</button>
                </li>
            </ul>

            <div class="tab-content d-none d-md-block border border-top-0 p-3 rounded-bottom bg-white">
                <div class="tab-pane fade show active" id="tab-info" role="tabpanel">
                    @include('academy.players.partials.info-tab')
                </div>
                <div class="tab-pane fade" id="tab-media" role="tabpanel">
                    @include('academy.players.partials.media-tab')
                </div>
            </div>

            {{-- Accordion below 768px --}}
            <div class="accordion d-md-none" id="playerAccordion">
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#acc-info">{{ __('Info') }}</button>
                    </h2>
                    <div id="acc-info" class="accordion-collapse collapse show" data-bs-parent="#playerAccordion">
                        <div class="accordion-body">@include('academy.players.partials.info-tab')</div>
                    </div>
                </div>
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#acc-media">{{ __('Media') }}</button>
                    </h2>
                    <div id="acc-media" class="accordion-collapse collapse" data-bs-parent="#playerAccordion">
                        <div class="accordion-body">@include('academy.players.partials.media-tab')</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-dashboard-layout>
