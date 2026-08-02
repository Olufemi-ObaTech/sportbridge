<x-dashboard-layout title="{{ __('Dashboard') }}">
    <x-dashboard-profile-card
        :photo-url="$academy->logo_url"
        :name="$academy->club_name"
        :subtitle="$academy->country"
        edit-route="academy.profile.edit"
        :view-route="route('academy.show', $academy)" />

    <div class="row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-3 mb-4">
        <div class="col">
            <div class="card h-100 p-3">
                <div class="text-muted small">{{ __('Teams') }}</div>
                <div class="fs-3 fw-bold">{{ $stats['teams'] }}</div>
            </div>
        </div>
        <div class="col">
            <div class="card h-100 p-3">
                <div class="text-muted small">{{ __('Players') }}</div>
                <div class="fs-3 fw-bold">{{ $stats['players'] }}</div>
            </div>
        </div>
        <div class="col">
            <div class="card h-100 p-3">
                <div class="text-muted small">{{ __('Open Jobs') }}</div>
                <div class="fs-3 fw-bold">{{ $stats['open_jobs'] }}</div>
            </div>
        </div>
        <div class="col">
            <div class="card h-100 p-3">
                <div class="text-muted small">{{ __('Pending Access Requests') }}</div>
                <div class="fs-3 fw-bold">{{ $stats['pending_access_requests'] }}</div>
            </div>
        </div>
    </div>

    <div class="row g-4">
        <div class="col-12 col-lg-8">
            <div class="card mb-4">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h2 class="h6 mb-0">{{ __('Recent Job Posts') }}</h2>
                        <a href="{{ route('academy.jobs.index') }}" class="small">{{ __('View all') }}</a>
                    </div>
                    @forelse ($recentJobPosts as $job)
                        <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                            <div>
                                <a href="{{ route('jobs.show', $job) }}" class="text-decoration-none">{{ $job->title }}</a>
                                <div class="small text-muted">{{ __(ucfirst(str_replace('_', ' ', $job->contract_type))) }}</div>
                            </div>
                            <span class="badge text-bg-{{ $job->status === 'open' ? 'success' : 'secondary' }}">{{ __(ucfirst($job->status)) }}</span>
                        </div>
                    @empty
                        <x-empty-state icon="bi-briefcase" :title="__('No jobs posted yet.')" :action="route('academy.jobs.create')" :actionLabel="__('Post a job')" />
                    @endforelse
                </div>
            </div>

            <div class="card">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h2 class="h6 mb-0">{{ __('Recently Added Players') }}</h2>
                        <a href="{{ route('academy.players.index') }}" class="small">{{ __('View all') }}</a>
                    </div>
                    @forelse ($recentPlayers as $player)
                        <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                            <a href="{{ route('academy.players.show', $player) }}" class="text-decoration-none">{{ $player->full_name }}</a>
                            <span class="badge text-bg-light border">{{ $player->position }}</span>
                        </div>
                    @empty
                        <x-empty-state icon="bi-person-badge" :title="__('No players added yet.')" />
                    @endforelse
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
                    <a href="{{ route('academy.profile.edit') }}" class="btn btn-sm btn-outline-primary">{{ __('Update profile') }}</a>
                </div>
            </div>

            <div class="card mb-4">
                <div class="card-body">
                    <h2 class="h6">{{ __('Messages') }}</h2>
                    <p class="mb-2">{{ __(':count unread', ['count' => $unreadMessages]) }}</p>
                    <a href="{{ route('inbox.index') }}" class="btn btn-sm btn-outline-primary">{{ __('Go to inbox') }}</a>
                </div>
            </div>

            <x-invite-card />
        </div>
    </div>
</x-dashboard-layout>
