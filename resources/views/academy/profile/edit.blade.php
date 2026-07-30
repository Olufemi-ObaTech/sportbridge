<x-dashboard-layout title="{{ __('Club Profile') }}">
    <div class="row g-4">
        <div class="col-12 col-lg-8">
            <div class="card">
                <div class="card-body p-4">
                    <form method="POST" action="{{ route('academy.profile.update') }}" enctype="multipart/form-data">
                        @csrf
                        @method('PUT')

                        <div class="row g-3">
                            <div class="col-12 col-md-6">
                                <x-input-label for="club_name" :value="__('Club Name')" />
                                <x-text-input id="club_name" name="club_name" type="text" :value="old('club_name', $academy->club_name)" required />
                                <x-input-error :messages="$errors->get('club_name')" />
                            </div>

                            <div class="col-12 col-md-6">
                                <x-input-label for="phone" :value="__('Contact Phone')" />
                                <x-text-input id="phone" name="phone" type="text" :value="old('phone', $academy->phone)" required />
                                <x-input-error :messages="$errors->get('phone')" />
                            </div>

                            <div class="col-12 col-md-4">
                                <x-input-label for="country" :value="__('Country')" />
                                <x-text-input id="country" name="country" type="text" :value="old('country', $academy->country)" required />
                                <x-input-error :messages="$errors->get('country')" />
                            </div>

                            <div class="col-12 col-md-4">
                                <x-input-label for="state" :value="__('State / City')" />
                                <x-text-input id="state" name="state" type="text" :value="old('state', $academy->state)" />
                                <x-input-error :messages="$errors->get('state')" />
                            </div>

                            <div class="col-12 col-md-4">
                                <x-input-label for="year_founded" :value="__('Year Founded')" />
                                <x-text-input id="year_founded" name="year_founded" type="number" :value="old('year_founded', $academy->year_founded)" />
                                <x-input-error :messages="$errors->get('year_founded')" />
                            </div>

                            <div class="col-12">
                                <x-input-label for="address" :value="__('Stadium or Training Ground Address')" />
                                <x-text-input id="address" name="address" type="text" :value="old('address', $academy->address)" required />
                                <x-input-error :messages="$errors->get('address')" />
                            </div>

                            <div class="col-12 col-md-6">
                                <x-input-label for="logo" :value="__('Club Logo')" />
                                <input id="logo" name="logo" type="file" accept=".jpg,.jpeg,.png" class="form-control">
                                @if ($academy->logo_url)
                                    <img src="{{ asset('storage/'.$academy->logo_url) }}" alt="" class="mt-2 rounded" style="height:60px;width:60px;object-fit:cover;">
                                @endif
                                <x-input-error :messages="$errors->get('logo')" />
                            </div>

                            <div class="col-12 col-md-6">
                                <x-input-label for="cover_image" :value="__('Cover Image')" />
                                <input id="cover_image" name="cover_image" type="file" accept=".jpg,.jpeg,.png" class="form-control">
                                <x-input-error :messages="$errors->get('cover_image')" />
                            </div>

                            <div class="col-12">
                                <x-input-label for="leagues" :value="__('Leagues / Tournaments (one per line)')" />
                                <textarea id="leagues" name="leagues" rows="3" class="form-control" placeholder="{{ __('e.g. Nigeria Premier Football League') }}">{{ old('leagues', implode("\n", $academy->leagues ?? [])) }}</textarea>
                                <div class="form-text">{{ __('Leagues, cups or tournaments your academy competes in.') }}</div>
                                <x-input-error :messages="$errors->get('leagues')" />
                            </div>

                            <div class="col-12">
                                <x-input-label :value="__('Languages')" />
                                @php $selectedLanguages = old('languages', $academy->languages ?? []); @endphp
                                <div class="row row-cols-2 row-cols-md-4 g-2">
                                    @foreach (['English', 'French', 'Spanish', 'Portuguese', 'Arabic', 'Swahili', 'Hausa', 'Yoruba', 'Igbo', 'German', 'Italian', 'Dutch'] as $language)
                                        <div class="col">
                                            <div class="form-check">
                                                <input type="checkbox" class="form-check-input" id="language-{{ Str::slug($language) }}" name="languages[]" value="{{ $language }}" @checked(in_array($language, $selectedLanguages))>
                                                <label class="form-check-label" for="language-{{ Str::slug($language) }}">{{ __($language) }}</label>
                                            </div>
                                        </div>
                                    @endforeach
                                </div>
                                <x-input-error :messages="$errors->get('languages')" />
                            </div>

                            <div class="col-12">
                                <x-input-label :value="__('Sports (select all that apply)')" />
                                @php $selectedSports = old('sports', $academy->sports ?? []); @endphp
                                <div class="row row-cols-2 g-2">
                                    @foreach (['football' => 'Football', 'basketball' => 'Basketball'] as $value => $label)
                                        <div class="col">
                                            <div class="form-check">
                                                <input type="checkbox" class="form-check-input" id="sport-{{ $value }}" name="sports[]" value="{{ $value }}" @checked(in_array($value, $selectedSports))>
                                                <label class="form-check-label" for="sport-{{ $value }}">{{ __($label) }}</label>
                                            </div>
                                        </div>
                                    @endforeach
                                </div>
                                <x-input-error :messages="$errors->get('sports')" />
                            </div>

                            <div class="col-12 col-md-6">
                                <x-input-label for="fifa_connect_id" :value="__('FIFA Connect ID (optional)')" />
                                <x-text-input id="fifa_connect_id" name="fifa_connect_id" type="text" :value="old('fifa_connect_id', $academy->fifa_connect_id)" />
                                <div class="form-text">{{ __('Self-reported only - not independently verified by :app.', ['app' => config('app.name')]) }}</div>
                                <x-input-error :messages="$errors->get('fifa_connect_id')" />
                            </div>

                            <div class="col-12 col-md-6">
                                <x-input-label for="has_fifa_tms_account" :value="__('Has a FIFA TMS Account?')" />
                                @php $currentTms = old('has_fifa_tms_account', $academy->has_fifa_tms_account === null ? '' : ($academy->has_fifa_tms_account ? '1' : '0')); @endphp
                                <select id="has_fifa_tms_account" name="has_fifa_tms_account" class="form-select">
                                    <option value="" @selected($currentTms === '')>{{ __('Not sure / prefer not to say') }}</option>
                                    <option value="1" @selected($currentTms === '1')>{{ __('Yes') }}</option>
                                    <option value="0" @selected($currentTms === '0')>{{ __('No') }}</option>
                                </select>
                                <x-input-error :messages="$errors->get('has_fifa_tms_account')" />
                            </div>

                            <div class="col-12 col-md-6">
                                <x-input-label for="fiba_map_id" :value="__('FIBA MAP ID (optional)')" />
                                <x-text-input id="fiba_map_id" name="fiba_map_id" type="text" :value="old('fiba_map_id', $academy->fiba_map_id)" />
                                <div class="form-text">{{ __('Self-reported only - not independently verified by :app.', ['app' => config('app.name')]) }}</div>
                                <x-input-error :messages="$errors->get('fiba_map_id')" />
                            </div>

                            <div class="col-12 col-md-6">
                                <x-input-label for="has_fiba_map_account" :value="__('Has a FIBA MAP Account?')" />
                                @php $currentMap = old('has_fiba_map_account', $academy->has_fiba_map_account === null ? '' : ($academy->has_fiba_map_account ? '1' : '0')); @endphp
                                <select id="has_fiba_map_account" name="has_fiba_map_account" class="form-select">
                                    <option value="" @selected($currentMap === '')>{{ __('Not sure / prefer not to say') }}</option>
                                    <option value="1" @selected($currentMap === '1')>{{ __('Yes') }}</option>
                                    <option value="0" @selected($currentMap === '0')>{{ __('No') }}</option>
                                </select>
                                <x-input-error :messages="$errors->get('has_fiba_map_account')" />
                            </div>

                            <div class="col-12 col-md-6">
                                <x-input-label for="linkedin" :value="__('LinkedIn (optional)')" />
                                <x-text-input id="linkedin" name="linkedin" type="text" :value="old('linkedin', $academy->linkedin)" placeholder="{{ __('Handle or profile URL') }}" />
                                <x-input-error :messages="$errors->get('linkedin')" />
                            </div>

                            <div class="col-12">
                                <x-wysiwyg-editor name="about" :value="$academy->about" label="About your academy" />
                            </div>
                        </div>

                        <div class="mt-4">
                            <x-primary-button>{{ __('Save Changes') }}</x-primary-button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <div class="col-12 col-lg-4">
            <div class="card">
                <div class="card-body">
                    <h2 class="h6">{{ __('License Document') }}</h2>
                    @if ($academy->license_doc_url)
                        <a href="{{ URL::temporarySignedRoute('documents.academy-license', now()->addMinutes(10), ['academy' => $academy->id]) }}"
                           class="btn btn-sm btn-outline-secondary" target="_blank" rel="noopener">
                            <i class="bi bi-file-earmark-text me-1" aria-hidden="true"></i>{{ __('View document') }}
                        </a>
                    @else
                        <p class="small text-muted mb-0">{{ __('No document on file.') }}</p>
                    @endif

                    @if ($academy->verified_badge)
                        <p class="small text-success mt-3 mb-0"><i class="bi bi-patch-check-fill me-1" aria-hidden="true"></i>{{ __('Verified academy') }}</p>
                    @endif

                    @if ($academy->fifa_connect_id)
                        <span class="badge text-bg-light border mt-3 d-inline-flex align-items-center gap-1">
                            <i class="bi bi-shield-check" aria-hidden="true"></i> {{ __('FIFA Connect ID') }}: {{ $academy->fifa_connect_id }}
                        </span>
                    @endif

                    @if ($academy->has_fifa_tms_account)
                        <span class="badge text-bg-light border mt-3 d-inline-flex align-items-center gap-1">
                            <i class="bi bi-check-circle" aria-hidden="true"></i> {{ __('FIFA TMS account') }}
                        </span>
                    @endif

                    @if ($academy->fiba_map_id)
                        <span class="badge text-bg-light border mt-3 d-inline-flex align-items-center gap-1">
                            <i class="bi bi-shield-check" aria-hidden="true"></i> {{ __('FIBA MAP ID') }}: {{ $academy->fiba_map_id }}
                        </span>
                    @endif

                    @if ($academy->has_fiba_map_account)
                        <span class="badge text-bg-light border mt-3 d-inline-flex align-items-center gap-1">
                            <i class="bi bi-check-circle" aria-hidden="true"></i> {{ __('FIBA MAP account') }}
                        </span>
                    @endif
                </div>
            </div>
        </div>
    </div>
</x-dashboard-layout>
