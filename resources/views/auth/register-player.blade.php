<x-guest-layout max-width="640px" :title="$sport === 'basketball' ? __('Create Your Free Basketball Player Profile') : __('Create Your Free Football Player Profile')">
    @php
        $isBasketball = $sport === 'basketball';
        $positions = \App\Models\Player::positionsFor($sport);
    @endphp
    @push('meta')
        <meta name="description" content="{{ $isBasketball ? __('Create a free basketball player profile on SportBridge. Get discovered by academies, clubs, agents and scouts worldwide - no fees, ever.') : __('Create a free football player profile on SportBridge. Get discovered by academies, clubs, agents and scouts worldwide - no fees, ever.') }}">
    @endpush

    <h1 class="h4 mb-1">{{ $isBasketball ? __('Create your Basketball Player Profile') : __('Create your Football Player Profile') }}</h1>
    <p class="text-muted mb-4">{{ __('Free forever. Get discovered by academies, clubs, agents and scouts worldwide.') }}</p>

    <form method="POST" action="{{ route('register.player', $sport) }}" enctype="multipart/form-data">
        @csrf
        <input type="hidden" name="ref" value="{{ request('ref') }}">

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
                <x-input-label for="dob" :value="__('Date of Birth')" />
                <x-text-input id="dob" name="dob" type="date" :value="old('dob')" required />
                <x-input-error :messages="$errors->get('dob')" />
            </div>

            <div class="col-12 col-md-6">
                <x-input-label for="nationality" :value="__('Nationality')" />
                <x-text-input id="nationality" name="nationality" type="text" :value="old('nationality')" required />
                <x-input-error :messages="$errors->get('nationality')" />
            </div>

            <div class="col-6 col-md-4">
                <x-input-label for="position" :value="__('Position')" />
                <select id="position" name="position" class="form-select" required>
                    <option value="">{{ __('Select') }}</option>
                    @foreach ($positions as $position)
                        <option value="{{ $position }}" @selected(old('position') === $position)>{{ $position }}</option>
                    @endforeach
                </select>
                <x-input-error :messages="$errors->get('position')" />
            </div>

            <div class="col-6 col-md-4">
                <x-input-label for="secondary_position" :value="__('Secondary Position')" />
                <select id="secondary_position" name="secondary_position" class="form-select">
                    <option value="">{{ __('None') }}</option>
                    @foreach ($positions as $position)
                        <option value="{{ $position }}" @selected(old('secondary_position') === $position)>{{ $position }}</option>
                    @endforeach
                </select>
                <x-input-error :messages="$errors->get('secondary_position')" />
            </div>

            @if ($isBasketball)
                <div class="col-12 col-md-4">
                    <x-input-label for="dominant_hand" :value="__('Dominant Hand')" />
                    <select id="dominant_hand" name="dominant_hand" class="form-select" required>
                        <option value="">{{ __('Select') }}</option>
                        @foreach (['left', 'right', 'ambidextrous'] as $hand)
                            <option value="{{ $hand }}" @selected(old('dominant_hand') === $hand)>{{ __(ucfirst($hand)) }}</option>
                        @endforeach
                    </select>
                    <x-input-error :messages="$errors->get('dominant_hand')" />
                </div>
            @else
                <div class="col-12 col-md-4">
                    <x-input-label for="foot" :value="__('Preferred Foot')" />
                    <select id="foot" name="foot" class="form-select" required>
                        <option value="">{{ __('Select') }}</option>
                        @foreach (['left', 'right', 'both'] as $foot)
                            <option value="{{ $foot }}" @selected(old('foot') === $foot)>{{ __(ucfirst($foot)) }}</option>
                        @endforeach
                    </select>
                    <x-input-error :messages="$errors->get('foot')" />
                </div>
            @endif

            <div class="col-12 col-md-6">
                <x-input-label for="current_club" :value="__('Current Club / Academy (optional)')" />
                <x-text-input id="current_club" name="current_club" type="text" :value="old('current_club')" placeholder="{{ __('Leave blank if you\'re a free agent') }}" />
                <x-input-error :messages="$errors->get('current_club')" />
            </div>

            <div class="col-12 col-md-6">
                <x-input-label for="linkedin" :value="__('LinkedIn (optional)')" />
                <x-text-input id="linkedin" name="linkedin" type="text" :value="old('linkedin')" placeholder="{{ __('Handle or profile URL') }}" />
                <x-input-error :messages="$errors->get('linkedin')" />
            </div>

            <div class="col-12">
                <x-input-label for="photo" :value="__('Profile Photo (optional - you can add this later)')" />
                <input id="photo" name="photo" type="file" accept=".jpg,.jpeg,.png,.webp" class="form-control">
                <x-input-error :messages="$errors->get('photo')" />
            </div>
        </div>

        <div id="guardian-consent" class="row g-3 mt-1 p-3 mx-0 rounded" style="background: var(--fc-blue-100); display: none;">
            <div class="col-12">
                <p class="small fw-semibold mb-0"><i class="bi bi-shield-check me-1" aria-hidden="true"></i>{{ __('Players under 18 need a parent/guardian or club/academy to confirm this registration.') }}</p>
            </div>
            <div class="col-12">
                <x-input-label for="guardian_name" :value="__('Parent/Guardian or Club/Academy Contact Name')" />
                <x-text-input id="guardian_name" name="guardian_name" type="text" :value="old('guardian_name')" />
                <x-input-error :messages="$errors->get('guardian_name')" />
            </div>
            <div class="col-12">
                <div class="form-check">
                    <input type="checkbox" class="form-check-input" id="consent_confirmed" name="consent_confirmed" value="1" @checked(old('consent_confirmed'))>
                    <label class="form-check-label small" for="consent_confirmed">
                        {{ __('I confirm my parent/guardian and/or club/academy is aware of and consents to this registration.') }}
                    </label>
                </div>
                <x-input-error :messages="$errors->get('consent_confirmed')" />
            </div>
        </div>

        <p class="small text-muted mt-3">
            {{ __('Your profile goes live immediately - no approval wait. Add your CV, highlight videos and photos any time from your dashboard.') }}
        </p>

        <x-disclaimer-banner class="mt-2">
            {{ __('Never send money, fees, or payment of any kind to an agent or scout to arrange a trial, tryout, or introduction. Legitimate agents do not require upfront payment from players. Always independently verify an agent\'s credentials and licensing body before engaging with them.') }}
        </x-disclaimer-banner>

        <script nonce="{{ request()->attributes->get('csp_nonce') }}">
            (function () {
                var dob = document.getElementById('dob');
                var panel = document.getElementById('guardian-consent');
                function toggleGuardian() {
                    if (!dob.value) { return; }
                    var age = Math.floor((new Date() - new Date(dob.value)) / 31557600000);
                    panel.style.display = age < 18 ? 'flex' : 'none';
                }
                dob.addEventListener('change', toggleGuardian);
                toggleGuardian();
            })();
        </script>

        <div class="d-grid mt-3">
            <x-primary-button>{{ __('Create My Player Profile') }}</x-primary-button>
        </div>

        <p class="text-center small mt-3 mb-0">
            {{ __('Already have an account?') }} <a href="{{ route('login') }}">{{ __('Log in') }}</a>
        </p>
    </form>
</x-guest-layout>
