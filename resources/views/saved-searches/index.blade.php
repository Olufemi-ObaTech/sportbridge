<x-app-layout>
    <div class="container py-4" style="max-width: 720px;">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h1 class="h4 mb-0">{{ __('Saved Searches') }}</h1>
            <a href="{{ route('players.index') }}" class="btn btn-sm btn-outline-primary">{{ __('Browse players') }}</a>
        </div>
        <p class="text-muted small">{{ __("You'll be notified the moment a new player matches one of these searches.") }}</p>

        <div class="card">
            <div class="list-group list-group-flush">
                @forelse ($savedSearches as $savedSearch)
                    <div class="list-group-item d-flex justify-content-between align-items-center gap-3">
                        <div>
                            <div class="fw-semibold small">{{ $savedSearch->label }}</div>
                            <div class="text-muted" style="font-size: 0.78rem;">
                                {{ $savedSearch->sport ? ucfirst($savedSearch->sport) : __('Any sport') }}
                                &middot; {{ __('Saved') }} {{ $savedSearch->created_at->diffForHumans() }}
                            </div>
                        </div>
                        <form method="POST" action="{{ route('saved-searches.destroy', $savedSearch) }}">
                            @csrf
                            @method('DELETE')
                            <button type="submit" class="btn btn-sm btn-outline-danger" data-confirm="{{ __('Remove this saved search?') }}">
                                <i class="bi bi-trash" aria-hidden="true"></i>
                            </button>
                        </form>
                    </div>
                @empty
                    <div class="p-5 text-center">
                        <x-empty-state icon="bi-bookmark-star" :title="__('No saved searches yet.')" :action="route('players.index')" :action-label="__('Search players')" />
                    </div>
                @endforelse
            </div>
        </div>
    </div>
</x-app-layout>
