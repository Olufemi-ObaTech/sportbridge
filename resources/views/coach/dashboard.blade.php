<x-dashboard-layout title="{{ __('Dashboard') }}">
    <x-dashboard-profile-card
        :photo-url="$coach->photo_url"
        :name="$coach->full_name"
        :subtitle="__(ucfirst(str_replace('_', ' ', $coach->preferred_role)))"
        edit-route="coach.profile.edit"
        :view-route="route('coach.show', auth()->user()->username)" />

    <div class="row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-3 mb-4">
        <div class="col">
            <div class="card h-100 p-3">
                <div class="text-muted small">{{ __('Applications') }}</div>
                <div class="fs-3 fw-bold">{{ $stats['applications'] }}</div>
            </div>
        </div>
        <div class="col">
            <div class="card h-100 p-3">
                <div class="text-muted small">{{ __('Shortlisted') }}</div>
                <div class="fs-3 fw-bold">{{ $stats['shortlisted'] }}</div>
            </div>
        </div>
        <div class="col">
            <div class="card h-100 p-3">
                <div class="text-muted small">{{ __('Hired') }}</div>
                <div class="fs-3 fw-bold">{{ $stats['hired'] }}</div>
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
                        <h2 class="h6 mb-0">{{ __('Recent Applications') }}</h2>
                        <a href="{{ route('jobs.index') }}" class="small">{{ __('Browse jobs') }}</a>
                    </div>
                    @forelse ($recentApplications as $application)
                        <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                            <a href="{{ route('jobs.show', $application->jobPost) }}" class="text-decoration-none">{{ $application->jobPost->title }}</a>
                            <span class="badge text-bg-{{ match($application->status) { 'hired' => 'success', 'shortlisted' => 'info', 'rejected' => 'danger', default => 'secondary' } }}">
                                {{ __(ucfirst($application->status)) }}
                            </span>
                        </div>
                    @empty
                        <x-empty-state icon="bi-briefcase" :title="__('You have not applied to any jobs yet.')" :action="route('jobs.index')" :actionLabel="__('Browse the job board')" />
                    @endforelse
                </div>
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
                    <a href="{{ route('coach.profile.edit') }}" class="btn btn-sm btn-outline-primary">{{ __('Update profile') }}</a>
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
