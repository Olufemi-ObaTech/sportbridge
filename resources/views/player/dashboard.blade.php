<x-dashboard-layout title="{{ __('Dashboard') }}">
    <div class="row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-3 mb-4">
        <div class="col">
            <div class="card h-100 p-3">
                <div class="text-muted small">{{ __('Profile Views') }}</div>
                <div class="fs-3 fw-bold">{{ $stats['profile_views'] }}</div>
            </div>
        </div>
        <div class="col">
            <div class="card h-100 p-3">
                <div class="text-muted small">{{ __('Media Items') }}</div>
                <div class="fs-3 fw-bold">{{ $stats['media_items'] }}</div>
            </div>
        </div>
        <div class="col">
            <div class="card h-100 p-3">
                <div class="text-muted small">{{ __('Watchlisted By') }}</div>
                <div class="fs-3 fw-bold">{{ $stats['watchlisted_by'] }}</div>
            </div>
        </div>
        <div class="col">
            <div class="card h-100 p-3">
                <div class="text-muted small">{{ __('Unread Messages') }}</div>
                <div class="fs-3 fw-bold">{{ $unreadMessages }}</div>
            </div>
        </div>
    </div>

    <div class="row g-4">
        <div class="col-12 col-lg-8">
            <div class="card">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h2 class="h6 mb-0">{{ __('Your Public Profile') }}</h2>
                        <a href="{{ route('player.show', $player) }}" target="_blank" rel="noopener" class="small">{{ __('View live profile') }} <i class="bi bi-box-arrow-up-right" aria-hidden="true"></i></a>
                    </div>

                    <div class="d-flex align-items-center gap-3">
                        <img src="{{ $player->primary_photo_url ? asset('storage/'.$player->primary_photo_url) : asset('img/default-avatar.svg') }}"
                             alt="" class="rounded" style="width: 72px; height: 90px; object-fit: cover;">
                        <div>
                            <div class="fw-semibold">{{ $player->full_name }}</div>
                            <div class="small text-muted">{{ $player->age }} {{ __('yrs') }} &middot; {{ $player->position }} &middot; {{ $player->nationality }}</div>
                            <span class="badge {{ $player->is_public ? 'text-bg-success' : 'text-bg-secondary' }} mt-1">
                                {{ $player->is_public ? __('Public') : __('Hidden') }}
                            </span>
                        </div>
                    </div>

                    <hr>

                    <div class="d-flex flex-wrap gap-2">
                        <a href="{{ route('player.profile.edit') }}" class="btn btn-sm btn-primary">
                            <i class="bi bi-pencil-square me-1" aria-hidden="true"></i>{{ __('Edit Profile & Media') }}
                        </a>
                        <a href="{{ route('players.index') }}" class="btn btn-sm btn-outline-secondary">
                            <i class="bi bi-people me-1" aria-hidden="true"></i>{{ __('Browse other players') }}
                        </a>
                    </div>
                </div>
            </div>

            <div class="mt-4">
                <x-media-gallery :posts="$myMediaPosts" :show-upload-link="true" />
            </div>
        </div>

        <div class="col-12 col-lg-4">
            <div class="card mb-4">
                <div class="card-body">
                    <h2 class="h6">{{ __('Profile Completeness') }}</h2>
                    <div class="progress mb-2" role="progressbar" aria-valuenow="{{ $completeness['percent'] }}" aria-valuemin="0" aria-valuemax="100">
                        <div class="progress-bar" style="width: {{ $completeness['percent'] }}%">{{ $completeness['percent'] }}%</div>
                    </div>
                    @if ($completeness['next_action'])
                        <p class="small text-muted mb-2">{{ __('Next step') }}: {{ __($completeness['next_action']) }}</p>
                    @endif
                    <a href="{{ route('player.profile.edit') }}" class="btn btn-sm btn-outline-primary">{{ __('Update profile') }}</a>
                </div>
            </div>

            <div class="card">
                <div class="card-body">
                    <h2 class="h6">{{ __('Messages') }}</h2>
                    <p class="mb-2">{{ __(':count unread', ['count' => $unreadMessages]) }}</p>
                    <a href="{{ route('inbox.index') }}" class="btn btn-sm btn-outline-primary">{{ __('Go to inbox') }}</a>
                </div>
            </div>
        </div>
    </div>
</x-dashboard-layout>
