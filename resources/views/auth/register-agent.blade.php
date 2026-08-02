<x-guest-layout max-width="720px" :title="$sport === 'basketball' ? __('Register as a Basketball Agent or Scout - Free') : __('Register as a Football Agent or Scout - Free')">
    @php $isBasketball = $sport === 'basketball'; @endphp
    @push('meta')
        <meta name="description" content="{{ $isBasketball ? __('Join SportBridge as a licensed basketball agent or scout. Search verified player profiles, build a watchlist, and connect with academies worldwide.') : __('Join SportBridge as a licensed football agent or scout. Search verified player profiles, build a watchlist, and connect with academies worldwide.') }}">
    @endpush

    <h1 class="h4 mb-1">{{ $isBasketball ? __('Register as a Basketball Agent / Scout') : __('Register as a Football Agent / Scout') }}</h1>
    <p class="text-muted mb-4">{{ __('Discover talent and build your watchlist.') }}</p>

    <form method="POST" action="{{ route('register.agent', $sport) }}" enctype="multipart/form-data">
        @csrf

        <div class="row g-3">
            <div class="col-12 col-md-6">
                <x-input-label for="name" :value="__('Full Name')" />
                <x-text-input id="name" name="name" type="text" :value="old('name')" required autofocus />
                <x-input-error :messages="$errors->get('name')" />
            </div>

            <div class="col-12 col-md-6">
                <x-input-label for="agency_name" :value="__('Agency Name')" />
                <x-text-input id="agency_name" name="agency_name" type="text" :value="old('agency_name')" required />
                <x-input-error :messages="$errors->get('agency_name')" />
            </div>

            <div class="col-12 col-md-6">
                <x-input-label for="email" :value="__('Email')" />
                <x-text-input id="email" name="email" type="email" :value="old('email')" required autocomplete="username" />
                <x-input-error :messages="$errors->get('email')" />
            </div>

            <div class="col-12 col-md-6">
                <x-input-label for="license_number" :value="__('Association / Federation License Number')" />
                <x-text-input id="license_number" name="license_number" type="text" :value="old('license_number')" required />
                <x-input-error :messages="$errors->get('license_number')" />
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
                <x-input-label for="nationality" :value="__('Nationality')" />
                <x-text-input id="nationality" name="nationality" type="text" :value="old('nationality')" required />
                <x-input-error :messages="$errors->get('nationality')" />
            </div>

            <div class="col-12 col-md-6">
                <x-input-label for="experience_years" :value="__('Years of Experience')" />
                <x-text-input id="experience_years" name="experience_years" type="number" min="0" max="60" :value="old('experience_years')" required />
                <x-input-error :messages="$errors->get('experience_years')" />
            </div>

            <div class="col-12 col-md-6">
                <x-input-label for="verification_body" :value="__('Verifying Body (optional)')" />
                <x-text-input id="verification_body" name="verification_body" type="text" :value="old('verification_body')" placeholder="{{ $isBasketball ? __('e.g. NBPA, FIBA, national federation') : __('e.g. FIFA, English FA, CAF') }}" />
                <div class="form-text">{{ __('The federation or association that licenses you. Our team confirms this before your profile shows a verified badge.') }}</div>
                <x-input-error :messages="$errors->get('verification_body')" />
            </div>

            <div class="col-12">
                <x-input-label :value="__('Regions Covered (select all that apply)')" />
                @php $selectedRegions = old('regions', []); @endphp
                <div class="row row-cols-2 row-cols-md-3 g-2">
                    @foreach (['West Africa', 'East Africa', 'North Africa', 'Southern Africa', 'Europe', 'Middle East', 'North America', 'South America', 'Asia'] as $region)
                        <div class="col">
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="region-{{ Str::slug($region) }}" name="regions[]" value="{{ $region }}" @checked(in_array($region, $selectedRegions))>
                                <label class="form-check-label" for="region-{{ Str::slug($region) }}">{{ __($region) }}</label>
                            </div>
                        </div>
                    @endforeach
                </div>
                <x-input-error :messages="$errors->get('regions')" />
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
                <x-input-label for="id_document" :value="__('ID Document (pdf/jpg/png, max 5MB)')" />
                <input id="id_document" name="id_document" type="file" accept=".pdf,.jpg,.jpeg,.png" class="form-control" required>
                <x-input-error :messages="$errors->get('id_document')" />
            </div>
        </div>

        <p class="small text-muted mt-3">
            {{ __('Your account goes live immediately - no approval wait. You can start browsing and requesting player access right away.') }}
        </p>

        <div class="d-grid mt-3">
            <x-primary-button>{{ __('Create Agent Account') }}</x-primary-button>
        </div>

        <p class="text-center small mt-3 mb-0">
            {{ __('Already have an account?') }} <a href="{{ route('login') }}">{{ __('Log in') }}</a>
        </p>
    </form>
</x-guest-layout>
