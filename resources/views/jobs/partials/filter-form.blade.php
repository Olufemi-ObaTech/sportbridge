<form method="GET" action="{{ route('jobs.index') }}">
    <div class="mb-3">
        <x-input-label for="job-filter-sport" value="{{ __('Sport') }}" />
        @php $currentJobSport = request()->has('sport') ? request('sport') : session('sport', \App\Http\Middleware\SetSport::DEFAULT); @endphp
        <select id="job-filter-sport" name="sport" class="form-select">
            <option value="all" @selected($currentJobSport === 'all')>{{ __('Any') }}</option>
            <option value="football" @selected($currentJobSport === 'football')>{{ __('Football') }}</option>
            <option value="basketball" @selected($currentJobSport === 'basketball')>{{ __('Basketball') }}</option>
        </select>
    </div>

    <div class="mb-3">
        <x-input-label for="job-filter-role" value="{{ __('Role Type') }}" />
        @php
            $roleOptions = $currentJobSport === 'all'
                ? \App\Models\JobPost::rolesFor('football') + \App\Models\JobPost::rolesFor('basketball')
                : \App\Models\JobPost::rolesFor($currentJobSport);
        @endphp
        <select id="job-filter-role" name="role_type" class="form-select">
            <option value="">{{ __('Any') }}</option>
            @foreach ($roleOptions as $value => $label)
                <option value="{{ $value }}" @selected(request('role_type') === $value)>{{ __($label) }}</option>
            @endforeach
        </select>
    </div>

    <div class="mb-3">
        <x-input-label for="job-filter-contract" value="{{ __('Contract Type') }}" />
        <select id="job-filter-contract" name="contract_type" class="form-select">
            <option value="">{{ __('Any') }}</option>
            @foreach (['full_time' => 'Full-time', 'part_time' => 'Part-time', 'contract' => 'Contract', 'volunteer' => 'Volunteer'] as $value => $label)
                <option value="{{ $value }}" @selected(request('contract_type') === $value)>{{ __($label) }}</option>
            @endforeach
        </select>
    </div>

    <div class="mb-3">
        <x-input-label for="job-filter-location" value="{{ __('Location') }}" />
        <input type="text" id="job-filter-location" name="location" class="form-control" value="{{ request('location') }}">
    </div>

    <button type="submit" class="btn btn-primary btn-sm w-100 mb-2">{{ __('Apply Filters') }}</button>
    <a href="{{ route('jobs.index') }}" class="btn btn-outline-secondary btn-sm w-100">{{ __('Reset') }}</a>
</form>
