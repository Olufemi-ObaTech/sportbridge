<x-app-layout>
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h1 class="h4 mb-0">{{ __('Find Players') }}</h1>
        <button type="button" class="btn btn-outline-secondary d-lg-none" data-bs-toggle="offcanvas" data-bs-target="#playerFilters">
            <i class="bi bi-funnel me-1" aria-hidden="true"></i>{{ __('Filters') }}
        </button>
    </div>

    <div class="row g-4">
        <div class="col-lg-3 d-none d-lg-block">
            <div class="card p-3 sticky-top" style="top: 80px;">
                @include('players.partials.filter-form')
            </div>
        </div>

        <div class="offcanvas offcanvas-end d-lg-none" tabindex="-1" id="playerFilters">
            <div class="offcanvas-header">
                <h2 class="offcanvas-title h6">{{ __('Filters') }}</h2>
                <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="{{ __('Close') }}"></button>
            </div>
            <div class="offcanvas-body">
                @include('players.partials.filter-form')
            </div>
        </div>

        <div class="col-12 col-lg-9">
            <div id="player-results" data-search-url="{{ route('api.players.search') }}">
                <div class="row row-cols-2 row-cols-md-3 row-cols-xl-4 g-3" id="player-results-grid">
                    <div class="col-12 placeholder-glow">
                        <span class="placeholder col-12" style="height: 200px;"></span>
                    </div>
                </div>
                <div id="player-results-sentinel" class="py-4 text-center text-muted small"></div>
            </div>
        </div>
    </div>

    <template id="player-card-template">
        <div class="col">
            <div class="card h-100 player-card">
                <div class="photo-wrap">
                    <img alt="" loading="lazy">
                </div>
                <div class="card-body p-2">
                    <a class="text-decoration-none small fw-semibold d-block text-truncate player-name" href="#"></a>
                    <div class="small text-muted player-meta"></div>
                    <div class="small text-muted text-truncate player-club"></div>
                </div>
            </div>
        </div>
    </template>
</x-app-layout>
