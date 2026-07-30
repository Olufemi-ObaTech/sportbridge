<x-dashboard-layout title="{{ __('Watchlist') }}">
    <h1 class="h5 mb-3">{{ __('Watchlist') }}</h1>

    @if ($players->isEmpty())
        <x-empty-state icon="bi-bookmark-star" :title="__('No players on your watchlist yet.')" :action="route('players.index')" :actionLabel="__('Find players')" />
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
                            <a href="{{ route('player.show', $player) }}" class="text-decoration-none small fw-semibold d-block text-truncate">{{ $player->full_name }}</a>
                            <div class="small text-muted">{{ $player->age }} {{ __('yrs') }} &middot; {{ $player->position }}</div>
                            <div class="small text-muted text-truncate">{{ $player->academy->club_name ?? __('Free Agent') }}</div>
                            <button type="button" class="btn btn-sm btn-outline-danger w-100 mt-2 watchlist-toggle"
                                    data-url="{{ route('agent.watchlist.toggle', $player) }}" data-watching="true">
                                <i class="bi bi-bookmark-dash me-1" aria-hidden="true"></i>{{ __('Remove') }}
                            </button>
                        </div>
                    </div>
                </div>
            @endforeach
        </div>

        <div class="mt-4">{{ $players->links() }}</div>
    @endif
</x-dashboard-layout>
