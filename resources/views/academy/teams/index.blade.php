<x-dashboard-layout title="{{ __('Teams') }}">
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h1 class="h5 mb-0">{{ __('Teams') }}</h1>
        <a href="{{ route('academy.teams.create') }}" class="btn btn-primary">
            <i class="bi bi-plus-lg me-1" aria-hidden="true"></i>{{ __('New Team') }}
        </a>
    </div>

    @if ($teams->isEmpty())
        <x-empty-state icon="bi-people" :title="__('No teams yet.')" :action="route('academy.teams.create')" :actionLabel="__('Create your first team')" />
    @else
        <div class="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-3">
            @foreach ($teams as $team)
                <div class="col">
                    <div class="card h-100">
                        <div class="card-body">
                            <h2 class="h6"><a href="{{ route('academy.teams.show', $team) }}" class="text-decoration-none">{{ $team->name }}</a></h2>
                            <p class="small text-muted mb-1">{{ $team->age_group }} &middot; {{ $team->season }}</p>
                            <p class="small mb-0">{{ __(':count players', ['count' => $team->players_count]) }}</p>
                        </div>
                    </div>
                </div>
            @endforeach
        </div>
    @endif
</x-dashboard-layout>
