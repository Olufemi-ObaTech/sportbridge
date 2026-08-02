@push('meta')
    <meta property="og:type" content="profile">
    <meta property="og:title" content="{{ $academy->club_name }} - {{ config('app.name') }}">
    <meta property="og:description" content="{{ Str::limit(strip_tags($academy->about ?? ''), 150) ?: $academy->club_name.' on '.config('app.name') }}">
    @if ($academy->cover_image_url)
        <meta property="og:image" content="{{ asset('storage/'.$academy->cover_image_url) }}">
    @endif
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ $academy->club_name }}">
@endpush

<x-app-layout>
    <div class="mb-4">
        @if ($academy->cover_image_url)
            <img src="{{ asset('storage/'.$academy->cover_image_url) }}" alt="" class="w-100 rounded" style="height: 220px; object-fit: cover;">
        @else
            <div class="w-100 rounded" style="height: 220px; background: var(--fc-gradient-primary);"></div>
        @endif

        <div class="d-flex align-items-center gap-3 mt-n5 ms-3 position-relative">
            <img src="{{ $academy->logo_url ? asset('storage/'.$academy->logo_url) : asset('img/default-avatar.svg') }}"
                 alt="{{ $academy->club_name }}" class="rounded bg-white border" style="width: 96px; height: 96px; object-fit: cover;">
            <div class="pt-4 flex-grow-1 d-flex justify-content-between align-items-start flex-wrap gap-2">
                <div>
                    <h1 class="h4 mb-0">
                        {{ $academy->club_name }}
                        @if ($academy->verified_badge)
                            <i class="bi bi-patch-check-fill text-primary" title="{{ __('Verified') }}" aria-hidden="true"></i>
                        @endif
                    </h1>
                    <p class="small text-muted mb-1">{{ $academy->country }}@if($academy->state), {{ $academy->state }}@endif</p>
                    <div class="d-flex flex-wrap gap-1">
                        @foreach ($academy->sports ?? [] as $sport)
                            <span class="badge text-bg-light border">{{ __(ucfirst($sport)) }}</span>
                        @endforeach
                        @if ($academy->fifa_connect_id)
                            <span class="badge text-bg-light border"><i class="bi bi-shield-check" aria-hidden="true"></i> {{ __('FIFA Connect ID') }}: {{ $academy->fifa_connect_id }}</span>
                        @endif
                        @if ($academy->has_fifa_tms_account)
                            <span class="badge text-bg-light border"><i class="bi bi-check-circle" aria-hidden="true"></i> {{ __('FIFA TMS account') }}</span>
                        @endif
                        @if ($academy->fiba_map_id)
                            <span class="badge text-bg-light border"><i class="bi bi-shield-check" aria-hidden="true"></i> {{ __('FIBA MAP ID') }}: {{ $academy->fiba_map_id }}</span>
                        @endif
                        @if ($academy->has_fiba_map_account)
                            <span class="badge text-bg-light border"><i class="bi bi-check-circle" aria-hidden="true"></i> {{ __('FIBA MAP account') }}</span>
                        @endif
                        @if ($academy->linkedin)
                            <a href="{{ $academy->linkedin_url }}" target="_blank" rel="noopener" class="badge text-bg-light border text-decoration-none">
                                <i class="bi bi-linkedin" aria-hidden="true"></i> {{ __('LinkedIn') }}
                            </a>
                        @endif
                    </div>
                </div>
                <x-message-button :user="$academy->user" />
                <x-report-link :user="$academy->user" class="btn btn-outline-danger btn-sm" />
            </div>
        </div>
    </div>

    @if ($academy->about)
        <div class="card mb-4">
            <div class="card-body">{!! $academy->about !!}</div>
        </div>
    @endif

    @if ($pinnedPost)
        <div class="card mb-4 border-warning">
            <div class="card-body">
                <span class="badge text-bg-warning mb-2"><i class="bi bi-pin-angle-fill me-1" aria-hidden="true"></i>{{ __('Pinned') }}</span>
                <p class="mb-0">{{ $pinnedPost->content }}</p>
            </div>
        </div>
    @endif

    @if ($mediaPosts->isNotEmpty())
        <div class="mb-4">
            <x-media-gallery :posts="$mediaPosts" />
        </div>
    @endif

    <h2 class="h5 mb-3">{{ __('Featured Players') }}</h2>

    @if ($academy->players->isEmpty())
        <x-empty-state icon="bi-person-badge" :title="__('No public players yet.')" />
    @else
        <div class="row row-cols-2 row-cols-md-3 row-cols-xl-4 g-3">
            @foreach ($academy->players as $player)
                <div class="col">
                    <div class="card h-100 player-card">
                        <div class="photo-wrap">
                            <img src="{{ $player->primary_photo_url ? asset('storage/'.$player->primary_photo_url) : asset('img/default-avatar.svg') }}"
                                 alt="{{ $player->full_name }}" loading="lazy">
                        </div>
                        <div class="card-body p-2">
                            <a href="{{ route('player.show', $player) }}" class="text-decoration-none small fw-semibold d-block text-truncate">{{ $player->full_name }}</a>
                            <div class="small text-muted">{{ $player->age }} {{ __('yrs') }} &middot; {{ $player->position }}</div>
                        </div>
                    </div>
                </div>
            @endforeach
        </div>
    @endif

    <h2 class="h5 mt-4 mb-3">{{ __('Teams') }}</h2>
    <div class="row row-cols-1 row-cols-md-3 g-3">
        @foreach ($academy->teams as $team)
            <div class="col">
                <div class="card h-100 p-3">
                    <div class="fw-semibold">{{ $team->name }}</div>
                    <div class="small text-muted">{{ __(ucfirst($team->sport)) }} &middot; {{ $team->age_group }} &middot; {{ $team->season }}</div>
                </div>
            </div>
        @endforeach
    </div>
</x-app-layout>
