<x-dashboard-layout title="{{ $team->name }}">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
            <h1 class="h5 mb-0">{{ $team->name }}</h1>
            <p class="small text-muted mb-0">{{ $team->age_group }} &middot; {{ $team->season }}</p>
        </div>
        <div class="d-flex gap-2">
            <a href="{{ route('academy.players.create', $team) }}" class="btn btn-primary btn-sm">
                <i class="bi bi-plus-lg me-1" aria-hidden="true"></i>{{ __('Add Player') }}
            </a>
            <a href="{{ route('academy.teams.edit', $team) }}" class="btn btn-outline-secondary btn-sm">{{ __('Edit') }}</a>
            <form method="POST" action="{{ route('academy.teams.destroy', $team) }}">
                @csrf
                @method('DELETE')
                <button type="submit" class="btn btn-outline-danger btn-sm" data-confirm="{{ __('Delete this team and detach its players?') }}">
                    {{ __('Delete') }}
                </button>
            </form>
        </div>
    </div>

    <div class="card mb-3">
        <div class="card-body">
            <h2 class="h6 mb-3">{{ __('Bulk Import Players') }}</h2>
            <div id="csv-import-app" data-team-id="{{ $team->id }}" data-import-url="{{ route('academy.players.import', $team) }}"></div>
        </div>
    </div>

    @if ($team->players->isEmpty())
        <x-empty-state icon="bi-person-badge" :title="__('No players in this team yet.')" :action="route('academy.players.create', $team)" :actionLabel="__('Add a player')" />
    @else
        <div class="table-responsive d-none d-md-block">
            <table class="table align-middle">
                <thead>
                    <tr>
                        <th>{{ __('Name') }}</th>
                        <th>{{ __('Position') }}</th>
                        <th>{{ __('Age') }}</th>
                        <th>{{ __('Nationality') }}</th>
                        <th class="text-end">{{ __('Actions') }}</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($team->players as $player)
                        <tr>
                            <td><a href="{{ route('academy.players.show', $player) }}" class="text-decoration-none">{{ $player->full_name }}</a></td>
                            <td><span class="badge text-bg-light border">{{ $player->position }}</span></td>
                            <td>{{ $player->age }}</td>
                            <td>{{ $player->nationality }}</td>
                            <td class="text-end">
                                <a href="{{ route('academy.players.edit', $player) }}" class="btn btn-sm btn-outline-secondary">{{ __('Edit') }}</a>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <div class="d-md-none">
            @foreach ($team->players as $player)
                <div class="card mb-2">
                    <div class="card-body d-flex justify-content-between align-items-center">
                        <div>
                            <a href="{{ route('academy.players.show', $player) }}" class="text-decoration-none fw-semibold">{{ $player->full_name }}</a>
                            <div class="small text-muted">{{ $player->position }} &middot; {{ $player->age }} {{ __('yrs') }} &middot; {{ $player->nationality }}</div>
                        </div>
                        <a href="{{ route('academy.players.edit', $player) }}" class="btn btn-sm btn-outline-secondary">{{ __('Edit') }}</a>
                    </div>
                </div>
            @endforeach
        </div>
    @endif

    @push('scripts')
        <script src="https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js"></script>
    @endpush
</x-dashboard-layout>
