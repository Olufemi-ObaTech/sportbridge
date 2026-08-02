@push('meta')
    <meta property="og:type" content="profile">
    <meta property="og:title" content="{{ $coach->full_name }} - {{ config('app.name') }}">
    <meta property="og:description" content="{{ Str::limit(strip_tags($coach->about ?? ''), 150) ?: $coach->full_name.' on '.config('app.name') }}">
    @if ($coach->cover_image_url)
        <meta property="og:image" content="{{ asset('storage/'.$coach->cover_image_url) }}">
    @endif
    <meta name="twitter:card" content="summary_large_image">
@endpush

<x-app-layout>
    <div class="mb-4">
        @if ($coach->cover_image_url)
            <img src="{{ asset('storage/'.$coach->cover_image_url) }}" alt="" class="w-100 rounded" style="height: 200px; object-fit: cover;">
        @else
            <div class="w-100 rounded" style="height: 200px; background: var(--fc-gradient-primary);"></div>
        @endif

        <div class="pt-3 d-flex justify-content-between align-items-start flex-wrap gap-2">
            <div>
                <h1 class="h4 mb-0">{{ $coach->full_name }}</h1>
                <p class="text-muted mb-0">{{ __(ucfirst(str_replace('_', ' ', $coach->preferred_role))) }} &middot; {{ $coach->nationality }}</p>
                <p class="small text-muted mb-1">{{ $coach->experience_years }} {{ __('years of experience') }}@if($coach->current_club) &middot; {{ $coach->current_club }} @endif</p>
                <span class="badge text-bg-light border">{{ __(ucfirst($coach->sport)) }}</span>
                @if ($coach->linkedin)
                    <a href="{{ $coach->linkedin_url }}" target="_blank" rel="noopener" class="badge text-bg-light border text-decoration-none">
                        <i class="bi bi-linkedin" aria-hidden="true"></i> {{ __('LinkedIn') }}
                    </a>
                @endif
            </div>
            <div class="d-flex align-items-center gap-2">
                @if ($coach->open_to_work)
                    <span class="badge text-bg-success align-self-start">{{ __('Open to work') }}</span>
                @endif
                <x-message-button :user="$user" />
                <x-report-link :user="$user" class="btn btn-outline-danger btn-sm" />
            </div>
        </div>
    </div>

    <div class="row g-4">
        <div class="col-12 col-lg-8">
            @if ($coach->about)
                <div class="card mb-4">
                    <div class="card-body">{!! $coach->about !!}</div>
                </div>
            @endif

            @if ($coach->achievements)
                <div class="card mb-4">
                    <div class="card-body">
                        <h2 class="h6"><i class="bi bi-trophy-fill text-warning me-1" aria-hidden="true"></i>{{ __('Achievements') }}</h2>
                        <p class="mb-0" style="white-space: pre-line;">{{ $coach->achievements }}</p>
                    </div>
                </div>
            @endif

            @if ($mediaPosts->isNotEmpty())
                <x-media-gallery :posts="$mediaPosts" />
            @endif
        </div>
        <div class="col-12 col-lg-4">
            <div class="card">
                <div class="card-body">
                    <h2 class="h6">{{ __('Coaching Badges') }}</h2>
                    <div class="d-flex flex-wrap gap-1">
                        @foreach ($coach->badges ?? [] as $badge)
                            <span class="badge text-bg-light border">{{ $badge }}</span>
                        @endforeach
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
