@php $tryOut = $tryOut ?? null; @endphp

<div class="row g-3 mb-4">
    <div class="col-12 col-md-6">
        <x-input-label for="title" :value="__('Title')" />
        <x-text-input id="title" name="title" type="text" :value="old('title', $tryOut->title ?? '')" placeholder="{{ __('e.g. U-18 Strikers Open Try-out') }}" required autofocus />
        <x-input-error :messages="$errors->get('title')" />
    </div>

    <div class="col-6 col-md-3">
        <x-input-label for="sport" :value="__('Sport')" />
        <select id="sport" name="sport" class="form-select" required>
            <option value="football" @selected(old('sport', $tryOut->sport ?? session('sport', \App\Http\Middleware\SetSport::DEFAULT)) === 'football')>{{ __('Football') }}</option>
            <option value="basketball" @selected(old('sport', $tryOut->sport ?? session('sport', \App\Http\Middleware\SetSport::DEFAULT)) === 'basketball')>{{ __('Basketball') }}</option>
        </select>
        <x-input-error :messages="$errors->get('sport')" />
    </div>

    <div class="col-6 col-md-3">
        <x-input-label for="gender" :value="__('Gender')" />
        <select id="gender" name="gender" class="form-select" required>
            <option value="male" @selected(old('gender', $tryOut->gender ?? '') === 'male')>{{ __('Male') }}</option>
            <option value="female" @selected(old('gender', $tryOut->gender ?? '') === 'female')>{{ __('Female') }}</option>
            <option value="mixed" @selected(old('gender', $tryOut->gender ?? '') === 'mixed')>{{ __('Mixed') }}</option>
        </select>
        <x-input-error :messages="$errors->get('gender')" />
    </div>

    <div class="col-12">
        <x-input-label for="description" :value="__('Details')" />
        <textarea id="description" name="description" rows="5" class="form-control" placeholder="{{ __('What players should know: requirements, what to bring, how to sign up, etc.') }}" required>{{ old('description', $tryOut->description ?? '') }}</textarea>
        <x-input-error :messages="$errors->get('description')" />
    </div>

    <div class="col-12 col-md-6">
        <x-input-label for="location" :value="__('Location')" />
        <x-text-input id="location" name="location" type="text" :value="old('location', $tryOut->location ?? '')" placeholder="{{ __('e.g. National Stadium, Lagos') }}" />
        <x-input-error :messages="$errors->get('location')" />
    </div>

    <div class="col-6 col-md-3">
        <x-input-label for="scheduled_date" :value="__('Date (optional)')" />
        <x-text-input id="scheduled_date" name="scheduled_date" type="date" :value="old('scheduled_date', optional($tryOut->scheduled_date ?? null)->format('Y-m-d'))" />
        <x-input-error :messages="$errors->get('scheduled_date')" />
    </div>

    <div class="col-6 col-md-3">
        <x-input-label for="age_group" :value="__('Age Group (optional)')" />
        <x-text-input id="age_group" name="age_group" type="text" :value="old('age_group', $tryOut->age_group ?? '')" placeholder="{{ __('e.g. U-18') }}" />
        <x-input-error :messages="$errors->get('age_group')" />
    </div>
</div>
