@php
    $player = $player ?? null;
    // Sport is locked once set - inherited from the team when adding a new
    // player, or from the player's own existing sport when editing.
    $currentSport = $player->sport ?? ($team->sport ?? \App\Models\Player::SPORT_FOOTBALL);
    $isBasketball = $currentSport === \App\Models\Player::SPORT_BASKETBALL;
    $positions = \App\Models\Player::positionsFor($currentSport);
@endphp

<div class="row g-3 mb-4">
    <div class="col-12 col-md-6">
        <x-input-label for="full_name" :value="__('Full Name')" />
        <x-text-input id="full_name" name="full_name" type="text" :value="old('full_name', $player->full_name ?? '')" required autofocus />
        <x-input-error :messages="$errors->get('full_name')" />
    </div>

    <div class="col-12 col-md-6">
        <x-input-label for="dob" :value="__('Date of Birth')" />
        <x-text-input id="dob" name="dob" type="date" :value="old('dob', optional($player->dob ?? null)->format('Y-m-d'))" required />
        <x-input-error :messages="$errors->get('dob')" />
    </div>

    <div class="col-12 col-md-4">
        <x-input-label for="nationality" :value="__('Nationality')" />
        <x-text-input id="nationality" name="nationality" type="text" :value="old('nationality', $player->nationality ?? '')" required />
        <x-input-error :messages="$errors->get('nationality')" />
    </div>

    <div class="col-12 col-md-4">
        <x-input-label :value="__('Sport')" />
        <x-text-input type="text" :value="ucfirst($currentSport)" disabled />
    </div>

    <div class="col-6 col-md-4">
        <x-input-label for="position" :value="__('Position')" />
        <select id="position" name="position" class="form-select" required>
            @foreach ($positions as $position)
                <option value="{{ $position }}" @selected(old('position', $player->position ?? '') === $position)>{{ $position }}</option>
            @endforeach
        </select>
        <x-input-error :messages="$errors->get('position')" />
    </div>

    <div class="col-6 col-md-4">
        <x-input-label for="secondary_position" :value="__('Secondary Position')" />
        <select id="secondary_position" name="secondary_position" class="form-select">
            <option value="">{{ __('None') }}</option>
            @foreach ($positions as $position)
                <option value="{{ $position }}" @selected(old('secondary_position', $player->secondary_position ?? '') === $position)>{{ $position }}</option>
            @endforeach
        </select>
        <x-input-error :messages="$errors->get('secondary_position')" />
    </div>

    @if ($isBasketball)
        <div class="col-6 col-md-4">
            <x-input-label for="dominant_hand" :value="__('Dominant Hand')" />
            <select id="dominant_hand" name="dominant_hand" class="form-select" required>
                @foreach (['left', 'right', 'ambidextrous'] as $hand)
                    <option value="{{ $hand }}" @selected(old('dominant_hand', $player->dominant_hand ?? '') === $hand)>{{ __(ucfirst($hand)) }}</option>
                @endforeach
            </select>
            <x-input-error :messages="$errors->get('dominant_hand')" />
        </div>
    @else
        <div class="col-6 col-md-4">
            <x-input-label for="foot" :value="__('Preferred Foot')" />
            <select id="foot" name="foot" class="form-select" required>
                @foreach (['left', 'right', 'both'] as $foot)
                    <option value="{{ $foot }}" @selected(old('foot', $player->foot ?? '') === $foot)>{{ __(ucfirst($foot)) }}</option>
                @endforeach
            </select>
            <x-input-error :messages="$errors->get('foot')" />
        </div>
    @endif

    <div class="col-6 col-md-4">
        <x-input-label for="height_cm" :value="__('Height (cm)')" />
        <x-text-input id="height_cm" name="height_cm" type="number" min="100" max="230" :value="old('height_cm', $player->height_cm ?? '')" />
        <x-input-error :messages="$errors->get('height_cm')" />
    </div>

    <div class="col-6 col-md-4">
        <x-input-label for="weight_kg" :value="__('Weight (kg)')" />
        <x-text-input id="weight_kg" name="weight_kg" type="number" min="30" max="150" :value="old('weight_kg', $player->weight_kg ?? '')" />
        <x-input-error :messages="$errors->get('weight_kg')" />
    </div>

    <div class="col-6 col-md-4">
        <x-input-label for="jersey_number" :value="__('Jersey Number')" />
        <x-text-input id="jersey_number" name="jersey_number" type="number" min="1" max="99" :value="old('jersey_number', $player->jersey_number ?? '')" />
        <x-input-error :messages="$errors->get('jersey_number')" />
    </div>

    <div class="col-12 col-md-6">
        <x-input-label for="current_club" :value="__('Current Club / Academy')" />
        <x-text-input id="current_club" name="current_club" type="text" :value="old('current_club', $player->current_club ?? '')" placeholder="{{ __('Leave blank if a free agent') }}" />
        <x-input-error :messages="$errors->get('current_club')" />
    </div>

    <div class="col-12 col-md-6">
        <x-input-label for="previous_clubs" :value="__('Previous Clubs (one per line)')" />
        <textarea id="previous_clubs" name="previous_clubs" rows="1" class="form-control">{{ old('previous_clubs', implode("\n", $player->previous_clubs ?? [])) }}</textarea>
        <x-input-error :messages="$errors->get('previous_clubs')" />
    </div>

    <div class="col-12 col-md-6">
        <x-input-label for="linkedin" :value="__('LinkedIn (optional)')" />
        <x-text-input id="linkedin" name="linkedin" type="text" :value="old('linkedin', $player->linkedin ?? '')" placeholder="{{ __('Handle or profile URL') }}" />
        <x-input-error :messages="$errors->get('linkedin')" />
    </div>

    <div class="col-12">
        <x-input-label for="bio" :value="__('Bio')" />
        <textarea id="bio" name="bio" rows="4" class="form-control">{{ old('bio', $player->bio ?? '') }}</textarea>
        <x-input-error :messages="$errors->get('bio')" />
    </div>

    <div class="col-12">
        <x-input-label for="achievements" :value="__('Achievements / Honours (one per line)')" />
        <textarea id="achievements" name="achievements" rows="3" class="form-control" placeholder="{{ __('e.g. State U-17 Champion 2024') }}">{{ old('achievements', $player->achievements ?? '') }}</textarea>
        <x-input-error :messages="$errors->get('achievements')" />
    </div>

    <div class="col-12 col-md-6">
        <x-input-label for="primary_photo" :value="__('Primary Photo')" />
        <input id="primary_photo" name="primary_photo" type="file" accept=".jpg,.jpeg,.png" class="form-control">
        <x-input-error :messages="$errors->get('primary_photo')" />
    </div>

    <div class="col-12 col-md-6 d-flex align-items-end">
        <div class="form-check">
            <input type="checkbox" class="form-check-input" id="is_public" name="is_public" value="1" @checked(old('is_public', $player->is_public ?? true))>
            <label class="form-check-label" for="is_public">{{ __('Visible on public profile') }}</label>
        </div>
    </div>
</div>
