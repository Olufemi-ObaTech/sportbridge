<x-guest-layout max-width="720px" :title="$sport === 'basketball' ? __('Register Your Basketball Academy or Club - Free') : __('Register Your Football Academy or Club - Free')">
    @php $isBasketball = $sport === 'basketball'; @endphp
    @push('meta')
        <meta name="description" content="{{ $isBasketball ? __('List your basketball academy or club on SportBridge for free. Showcase your player roster and post coaching job openings to a global audience.') : __('List your football academy or club on SportBridge for free. Showcase your player roster and post coaching job openings to a global audience.') }}">
    @endpush

    <h1 class="h4 mb-1">{{ $isBasketball ? __('Register your Basketball Academy / Club') : __('Register your Football Academy / Club') }}</h1>
    <p class="text-muted mb-4">{{ __('Showcase your players and post job openings.') }}</p>

    <form method="POST" action="{{ route('register.academy', $sport) }}" enctype="multipart/form-data">
        @csrf
        <input type="hidden" name="ref" value="{{ request('ref') }}">

        <div class="row g-3">
            <div class="col-12 col-md-6">
                <x-input-label for="club_name" :value="__('Club Name')" />
                <x-text-input id="club_name" name="club_name" type="text" :value="old('club_name')" required autofocus />
                <x-input-error :messages="$errors->get('club_name')" />
            </div>

            <div class="col-12 col-md-6">
                <x-input-label for="email" :value="__('Official Email')" />
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
                <x-input-label for="license_number" :value="__('License / Registration Number')" />
                <x-text-input id="license_number" name="license_number" type="text" :value="old('license_number')" required />
                <x-input-error :messages="$errors->get('license_number')" />
            </div>

            <div class="col-12 col-md-6">
                <x-input-label for="year_founded" :value="__('Year Founded')" />
                <x-text-input id="year_founded" name="year_founded" type="number" min="1850" :max="date('Y')" :value="old('year_founded')" />
                <x-input-error :messages="$errors->get('year_founded')" />
            </div>

            @if ($isBasketball)
                <div class="col-12 col-md-6">
                    <x-input-label for="fiba_map_id" :value="__('FIBA MAP ID (optional)')" />
                    <x-text-input id="fiba_map_id" name="fiba_map_id" type="text" :value="old('fiba_map_id')" />
                    <div class="form-text">{{ __('Self-reported only - not independently verified by :app.', ['app' => config('app.name')]) }}</div>
                    <x-input-error :messages="$errors->get('fiba_map_id')" />
                </div>

                <div class="col-12 col-md-6">
                    <x-input-label for="has_fiba_map_account" :value="__('Has a FIBA MAP Account?')" />
                    <select id="has_fiba_map_account" name="has_fiba_map_account" class="form-select">
                        <option value="" @selected(old('has_fiba_map_account') === null)>{{ __('Not sure / prefer not to say') }}</option>
                        <option value="1" @selected(old('has_fiba_map_account') === '1')>{{ __('Yes') }}</option>
                        <option value="0" @selected(old('has_fiba_map_account') === '0')>{{ __('No') }}</option>
                    </select>
                    <x-input-error :messages="$errors->get('has_fiba_map_account')" />
                </div>
            @else
                <div class="col-12 col-md-6">
                    <x-input-label for="fifa_connect_id" :value="__('FIFA Connect ID (optional)')" />
                    <x-text-input id="fifa_connect_id" name="fifa_connect_id" type="text" :value="old('fifa_connect_id')" />
                    <div class="form-text">{{ __('Self-reported only - not independently verified by :app.', ['app' => config('app.name')]) }}</div>
                    <x-input-error :messages="$errors->get('fifa_connect_id')" />
                </div>

                <div class="col-12 col-md-6">
                    <x-input-label for="has_fifa_tms_account" :value="__('Has a FIFA TMS Account?')" />
                    <select id="has_fifa_tms_account" name="has_fifa_tms_account" class="form-select">
                        <option value="" @selected(old('has_fifa_tms_account') === null)>{{ __('Not sure / prefer not to say') }}</option>
                        <option value="1" @selected(old('has_fifa_tms_account') === '1')>{{ __('Yes') }}</option>
                        <option value="0" @selected(old('has_fifa_tms_account') === '0')>{{ __('No') }}</option>
                    </select>
                    <x-input-error :messages="$errors->get('has_fifa_tms_account')" />
                </div>
            @endif

            <div class="col-12 col-md-6">
                <x-input-label for="linkedin" :value="__('LinkedIn (optional)')" />
                <x-text-input id="linkedin" name="linkedin" type="text" :value="old('linkedin')" placeholder="{{ __('Handle or profile URL') }}" />
                <x-input-error :messages="$errors->get('linkedin')" />
            </div>

            <div class="col-12 col-md-4">
                <x-input-label for="country" :value="__('Country')" />
                <x-text-input id="country" name="country" type="text" :value="old('country')" required />
                <x-input-error :messages="$errors->get('country')" />
            </div>

            <div class="col-12 col-md-4">
                <x-input-label for="state" :value="__('State / City')" />
                <x-text-input id="state" name="state" type="text" :value="old('state')" />
                <x-input-error :messages="$errors->get('state')" />
            </div>

            <div class="col-12 col-md-4">
                <x-input-label for="phone" :value="__('Contact Phone')" />
                <x-text-input id="phone" name="phone" type="text" :value="old('phone')" required />
                <x-input-error :messages="$errors->get('phone')" />
            </div>

            <div class="col-12">
                <x-input-label for="address" :value="__('Stadium or Training Ground Address')" />
                <x-text-input id="address" name="address" type="text" :value="old('address')" required />
                <x-input-error :messages="$errors->get('address')" />
            </div>

            <div class="col-12 col-md-6">
                <x-input-label for="logo" :value="__('Logo (jpg/png, max 2MB)')" />
                <input id="logo" name="logo" type="file" accept=".jpg,.jpeg,.png" class="form-control">
                <x-input-error :messages="$errors->get('logo')" />
            </div>

            <div class="col-12 col-md-6">
                <x-input-label for="license_document" :value="__('License Document (pdf/jpg, max 5MB)')" />
                <input id="license_document" name="license_document" type="file" accept=".pdf,.jpg,.jpeg" class="form-control" required>
                <x-input-error :messages="$errors->get('license_document')" />
            </div>
        </div>

        <p class="small text-muted mt-3">
            {{ __('Your account goes live immediately - no approval wait. You can start adding players and posting jobs right away.') }}
        </p>

        @if ($isBasketball)
            <p class="small text-muted mb-0">
                {{ __('Also run a football program under the same club? Add it any time from your profile page after signing up.') }}
            </p>
        @else
            <p class="small text-muted mb-0">
                {{ __('Also run a basketball program under the same club? Add it any time from your profile page after signing up.') }}
            </p>
        @endif

        <div class="d-grid mt-3">
            <x-primary-button>{{ __('Create Academy Account') }}</x-primary-button>
        </div>

        <p class="text-center small mt-3 mb-0">
            {{ __('Already have an account?') }} <a href="{{ route('login') }}">{{ __('Log in') }}</a>
        </p>
    </form>
</x-guest-layout>
