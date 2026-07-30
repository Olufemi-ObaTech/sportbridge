<x-dashboard-layout title="{{ __('Players') }}">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 class="h5 mb-0">{{ __('Players') }}</h1>
    </div>

    <form method="GET" class="row g-2 mb-3">
        <div class="col-12 col-sm-4">
            <select name="team_id" class="form-select" data-auto-submit>
                <option value="">{{ __('All teams') }}</option>
                @foreach ($teams as $team)
                    <option value="{{ $team->id }}" @selected(request('team_id') == $team->id)>{{ $team->name }}</option>
                @endforeach
            </select>
        </div>
        <div class="col-12 col-sm-4">
            <input type="text" name="q" class="form-control" placeholder="{{ __('Search by name') }}" value="{{ request('q') }}">
        </div>
        <div class="col-12 col-sm-2">
            <button class="btn btn-outline-secondary w-100" type="submit">{{ __('Filter') }}</button>
        </div>
    </form>

    @if ($players->isEmpty())
        <x-empty-state icon="bi-person-badge" :title="__('No players found.')" />
    @else
        <div class="row row-cols-2 row-cols-md-3 row-cols-xl-4 g-3">
            @foreach ($players as $player)
                <div class="col">
                    <div class="card h-100 player-card">
                        <div class="photo-wrap">
                            <img src="{{ $player->primary_photo_url ? asset('storage/'.$player->primary_photo_url) : asset('img/default-avatar.svg') }}"
                                 alt="{{ $player->full_name }}" loading="lazy">
                        </div>
                        <div class="card-body p-2">
                            <a href="{{ route('academy.players.show', $player) }}" class="text-decoration-none small fw-semibold d-block text-truncate">{{ $player->full_name }}</a>
                            <div class="small text-muted">{{ $player->age }} {{ __('yrs') }} &middot; {{ $player->position }}</div>
                        </div>
                    </div>
                </div>
            @endforeach
        </div>

        <div class="mt-4">{{ $players->links() }}</div>
    @endif
</x-dashboard-layout>
