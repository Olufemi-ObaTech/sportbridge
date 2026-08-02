<x-guest-layout max-width="720px" :title="$sport === 'basketball' ? __('Register as a Basketball Coach or Manager - Free') : __('Register as a Football Coach or Manager - Free')">
    @php
        $isBasketball = $sport === 'basketball';
        $roles = \App\Models\CoachProfile::rolesFor($sport);
        $badges = \App\Models\CoachProfile::badgesFor($sport);
    @endphp
    @push('meta')
        <meta name="description" content="{{ $isBasketball ? __('Create a free basketball coaching profile on SportBridge. Browse and apply to coaching vacancies at academies and clubs worldwide.') : __('Create a free football coaching profile on SportBridge. Browse and apply to coaching vacancies at academies and clubs worldwide.') }}">
    @endpush

    <h1 class="h4 mb-1">{{ $isBasketball ? __('Register as a Basketball Coach / Manager') : __('Register as a Football Coach / Manager') }}</h1>
    <p class="text-muted mb-4">{{ __('Find your next role at a club or academy.') }}</p>

    <form method="POST" action="{{ route('register.coach', $sport) }}" enctype="multipart/form-data">
        @csrf

        <div class="row g-3">
            <div class="col-12 col-md-6">
                <x-input-label for="name" :value="__('Full Name')" />
                <x-text-input id="name" name="name" type="text" :value="old('name')" required autofocus />
                <x-input-error :messages="$errors->get('name')" />
            </div>

            <div class="col-12 col-md-6">
                <x-input-label for="email" :value="__('Email')" />
                <x-text-input id="email" name="email" type="email" :value="old('email')" required autocomplete="username" />
                <x-input-error :messages="$errors->get('email')" />
            </div>

            <div class="col-12 col-md-6">
                <x-input-label for="password" :value="__('Password')" />
                <x-text-input id="password" name="password" type="password" required autocomplete="new-password" />
                <x-input-error :messages="$errors->get('password')" />
            </div>

            <div class="col-12 col-md-6">
                <x-input-label for="password_confirmation" :value="__('Confirm Password')" />
                <x-text-input id="password_confirmation" name="password_confirmation" type="password" required autocomplete="new-password" />
                <x-input-error :messages="$errors->get('password_confirmation')" />
            </div>

            <div class="col-12 col-md-6">
                <x-input-label for="preferred_role" :value="__('Preferred Role')" />
                <select id="preferred_role" name="preferred_role" class="form-select" required>
                    <option value="">{{ __('Select a role') }}</option>
                    @foreach ($roles as $value => $label)
                        <option value="{{ $value }}" @selected(old('preferred_role') === $value)>{{ __($label) }}</option>
                    @endforeach
                </select>
                <x-input-error :messages="$errors->get('preferred_role')" />
            </div>

            <div class="col-12 col-md-6">
                <x-input-label for="experience_years" :value="__('Years of Experience')" />
                <x-text-input id="experience_years" name="experience_years" type="number" min="0" max="60" :value="old('experience_years')" required />
                <x-input-error :messages="$errors->get('experience_years')" />
            </div>

            <div class="col-12 col-md-6">
                <x-input-label for="nationality" :value="__('Nationality')" />
                <x-text-input id="nationality" name="nationality" type="text" :value="old('nationality')" required />
                <x-input-error :messages="$errors->get('nationality')" />
            </div>

            <div class="col-12 col-md-6">
                <x-input-label for="current_club" :value="__('Current Club (optional)')" />
                <x-text-input id="current_club" name="current_club" type="text" :value="old('current_club')" />
                <x-input-error :messages="$errors->get('current_club')" />
            </div>

            <div class="col-12">
                <x-input-label :value="__('Coaching Badges (select all that apply)')" />
                @php $selectedBadges = old('badges', []); @endphp
                <div class="row row-cols-2 row-cols-md-4 g-2">
                    @foreach ($badges as $badge)
                        <div class="col">
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="badge-{{ Str::slug($badge) }}" name="badges[]" value="{{ $badge }}" @checked(in_array($badge, $selectedBadges))>
                                <label class="form-check-label" for="badge-{{ Str::slug($badge) }}">{{ $badge }}</label>
                            </div>
                        </div>
                    @endforeach
                </div>
                <x-input-error :messages="$errors->get('badges')" />
            </div>

            <div class="col-12">
                <x-input-label for="certificates" :value="__('Other Certificates (optional, one per line)')" />
                <textarea id="certificates" name="certificates" rows="2" class="form-control" placeholder="{{ __('e.g. Sports Science Diploma') }}">{{ old('certificates') }}</textarea>
                <x-input-error :messages="$errors->get('certificates')" />
            </div>

            <div class="col-12 col-md-6">
                <x-input-label for="linkedin" :value="__('LinkedIn (optional)')" />
                <x-text-input id="linkedin" name="linkedin" type="text" :value="old('linkedin')" placeholder="{{ __('Handle or profile URL') }}" />
                <x-input-error :messages="$errors->get('linkedin')" />
            </div>

            <div class="col-12 col-md-6">
                <x-input-label for="photo" :value="__('Profile Photo (optional)')" />
                <input id="photo" name="photo" type="file" accept=".jpg,.jpeg,.png" class="form-control">
                <x-input-error :messages="$errors->get('photo')" />
            </div>

            <div class="col-12 col-md-6">
                <x-input-label for="cv" :value="__('CV (pdf/docx, max 5MB)')" />
                <input id="cv" name="cv" type="file" accept=".pdf,.docx" class="form-control" required>
                <x-input-error :messages="$errors->get('cv')" />
            </div>
        </div>

        <p class="small text-muted mt-3">
            {{ __('Your account goes live immediately - no approval wait. You can start applying to jobs right away.') }}
        </p>

        <div class="d-grid mt-3">
            <x-primary-button>{{ __('Create Coach Account') }}</x-primary-button>
        </div>

        <p class="text-center small mt-3 mb-0">
            {{ __('Already have an account?') }} <a href="{{ route('login') }}">{{ __('Log in') }}</a>
        </p>
    </form>
</x-guest-layout>
