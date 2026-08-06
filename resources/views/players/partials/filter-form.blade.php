<form id="player-filter-form">
    <div class="mb-3">
        <x-input-label for="filter-q" value="{{ __('Name') }}" />
        <input type="text" id="filter-q" name="q" class="form-control" placeholder="{{ __('Search by name') }}">
    </div>

    <div class="mb-3">
        <x-input-label for="filter-sport" value="{{ __('Sport') }}" />
        @php $currentSwitcherSport = session('sport', \App\Http\Middleware\SetSport::DEFAULT); @endphp
        <select id="filter-sport" name="sport" class="form-select filter-sport">
            <option value="all">{{ __('Any') }}</option>
            <option value="football" @selected($currentSwitcherSport === 'football')>{{ __('Football') }}</option>
            <option value="basketball" @selected($currentSwitcherSport === 'basketball')>{{ __('Basketball') }}</option>
        </select>
    </div>

    <div class="mb-3">
        <x-input-label for="filter-position" value="{{ __('Position') }}" />
        <select id="filter-position" name="position" class="form-select filter-position">
            <option value="">{{ __('Any') }}</option>
            @foreach (\App\Models\Player::POSITIONS_FOOTBALL as $position)
                <option value="{{ $position }}">{{ $position }}</option>
            @endforeach
        </select>
    </div>

    <div class="row g-2 mb-3">
        <div class="col-6">
            <x-input-label for="filter-age-min" value="{{ __('Min Age') }}" />
            <input type="number" id="filter-age-min" name="age_min" class="form-control" min="10" max="45">
        </div>
        <div class="col-6">
            <x-input-label for="filter-age-max" value="{{ __('Max Age') }}" />
            <input type="number" id="filter-age-max" name="age_max" class="form-control" min="10" max="45">
        </div>
    </div>

    <div class="mb-3 filter-foot-field">
        <x-input-label for="filter-foot" value="{{ __('Preferred Foot') }}" />
        <select id="filter-foot" name="foot" class="form-select">
            <option value="">{{ __('Any') }}</option>
            <option value="left">{{ __('Left') }}</option>
            <option value="right">{{ __('Right') }}</option>
            <option value="both">{{ __('Both') }}</option>
        </select>
    </div>

    <div class="mb-3">
        <x-input-label for="filter-nationality" value="{{ __('Nationality') }}" />
        <input type="text" id="filter-nationality" name="nationality" class="form-control">
    </div>

    <div class="row g-2 mb-3">
        <div class="col-6">
            <x-input-label for="filter-min-height" value="{{ __('Min Height (cm)') }}" />
            <input type="number" id="filter-min-height" name="min_height" class="form-control" min="100" max="230">
        </div>
        <div class="col-6">
            <x-input-label for="filter-max-height" value="{{ __('Max Height (cm)') }}" />
            <input type="number" id="filter-max-height" name="max_height" class="form-control" min="100" max="230">
        </div>
    </div>

    <div class="mb-3">
        <x-input-label for="filter-club" value="{{ __('Club / Academy') }}" />
        <input type="text" id="filter-club" name="club" class="form-control" placeholder="{{ __('Search by club name') }}">
    </div>

    <div class="mb-3">
        <x-input-label for="filter-sort" value="{{ __('Sort by') }}" />
        <select id="filter-sort" name="sort" class="form-select">
            <option value="newest">{{ __('Newest first') }}</option>
            <option value="oldest">{{ __('Oldest first') }}</option>
            <option value="name_asc">{{ __('Name (A-Z)') }}</option>
            <option value="name_desc">{{ __('Name (Z-A)') }}</option>
            <option value="age_asc">{{ __('Youngest first') }}</option>
            <option value="age_desc">{{ __('Oldest player first') }}</option>
        </select>
    </div>

    <button type="button" id="filter-reset" class="btn btn-outline-secondary btn-sm w-100">{{ __('Reset filters') }}</button>

    @auth
        <button type="button" id="filter-save-search" class="btn btn-outline-primary btn-sm w-100 mt-2" data-save-search>
            <i class="bi bi-bookmark-plus me-1" aria-hidden="true"></i>{{ __('Save this search') }}
        </button>
    @endauth
</form>
