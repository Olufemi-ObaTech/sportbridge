@php $team = $team ?? null; @endphp

<div class="row g-3 mb-4">
    <div class="col-12 col-md-6">
        <x-input-label for="name" :value="__('Team Name')" />
        <x-text-input id="name" name="name" type="text" :value="old('name', $team->name ?? '')" required autofocus />
        <x-input-error :messages="$errors->get('name')" />
    </div>

    @if ($team)
        <div class="col-12 col-md-6">
            <x-input-label :value="__('Sport')" />
            <x-text-input type="text" :value="ucfirst($team->sport)" disabled />
            <div class="form-text">{{ __('Sport is set when the team is created and cannot be changed.') }}</div>
        </div>
    @else
        <div class="col-12 col-md-6">
            <x-input-label for="sport" :value="__('Sport')" />
            @php $currentTeamSport = old('sport', session('sport', \App\Http\Middleware\SetSport::DEFAULT)); @endphp
            <select id="sport" name="sport" class="form-select" required>
                <option value="football" @selected($currentTeamSport === 'football')>{{ __('Football') }}</option>
                <option value="basketball" @selected($currentTeamSport === 'basketball')>{{ __('Basketball') }}</option>
            </select>
            <x-input-error :messages="$errors->get('sport')" />
        </div>
    @endif

    <div class="col-12 col-md-6">
        <x-input-label for="season" :value="__('Season')" />
        <x-text-input id="season" name="season" type="text" placeholder="2025/2026" :value="old('season', $team->season ?? '')" required />
        <x-input-error :messages="$errors->get('season')" />
    </div>

    <div class="col-12 col-md-6">
        <x-input-label for="age_group" :value="__('Age Group')" />
        <select id="age_group" name="age_group" class="form-select" required>
            @foreach (['U-13', 'U-15', 'U-17', 'U-20', 'Senior', 'Women'] as $group)
                <option value="{{ $group }}" @selected(old('age_group', $team->age_group ?? '') === $group)>{{ __($group) }}</option>
            @endforeach
        </select>
        <x-input-error :messages="$errors->get('age_group')" />
    </div>

    <div class="col-12 col-md-6">
        <x-input-label for="coach_name" :value="__('Coach Name')" />
        <x-text-input id="coach_name" name="coach_name" type="text" :value="old('coach_name', $team->coach_name ?? '')" />
        <x-input-error :messages="$errors->get('coach_name')" />
    </div>
</div>
