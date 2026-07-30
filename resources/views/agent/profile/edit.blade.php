<x-dashboard-layout title="{{ __('Agency Profile') }}">
    <div class="row g-4">
        <div class="col-12 col-lg-8">
            <div class="card">
                <div class="card-body p-4">
                    <form method="POST" action="{{ route('agent.profile.update') }}" enctype="multipart/form-data">
                        @csrf
                        @method('PUT')

                        <div class="row g-3">
                            <div class="col-12 col-md-6">
                                <x-input-label for="agency_name" :value="__('Agency Name')" />
                                <x-text-input id="agency_name" name="agency_name" type="text" :value="old('agency_name', $agent->agency_name)" required />
                                <x-input-error :messages="$errors->get('agency_name')" />
                            </div>

                            <div class="col-12 col-md-6">
                                <x-input-label for="nationality" :value="__('Nationality')" />
                                <x-text-input id="nationality" name="nationality" type="text" :value="old('nationality', $agent->nationality)" required />
                                <x-input-error :messages="$errors->get('nationality')" />
                            </div>

                            <div class="col-12 col-md-6">
                                <x-input-label for="experience_years" :value="__('Years of Experience')" />
                                <x-text-input id="experience_years" name="experience_years" type="number" min="0" max="60" :value="old('experience_years', $agent->experience_years)" required />
                                <x-input-error :messages="$errors->get('experience_years')" />
                            </div>

                            <div class="col-12 col-md-6">
                                <x-input-label for="verification_body" :value="__('Verifying Body')" />
                                <x-text-input id="verification_body" name="verification_body" type="text" :value="old('verification_body', $agent->verification_body)" placeholder="{{ $agent->sport === 'basketball' ? __('e.g. NBPA, FIBA, national federation') : __('e.g. FIFA, English FA, CAF') }}" />
                                @if ($agent->verified_badge)
                                    <p class="small text-success mt-1 mb-0"><i class="bi bi-patch-check-fill me-1" aria-hidden="true"></i>{{ __('Verified') }}</p>
                                @else
                                    <div class="form-text">{{ __('Pending admin verification.') }}</div>
                                @endif
                                <x-input-error :messages="$errors->get('verification_body')" />
                            </div>

                            <div class="col-12 col-md-6">
                                <x-input-label for="photo" :value="__('Profile Photo')" />
                                <input id="photo" name="photo" type="file" accept=".jpg,.jpeg,.png" class="form-control">
                                @if ($agent->photo_url)
                                    <img src="{{ asset('storage/'.$agent->photo_url) }}" alt="" class="mt-2 rounded" style="height:60px;width:60px;object-fit:cover;">
                                @endif
                                <x-input-error :messages="$errors->get('photo')" />
                            </div>

                            <div class="col-12 col-md-6">
                                <x-input-label for="cover_image" :value="__('Cover Image')" />
                                <input id="cover_image" name="cover_image" type="file" accept=".jpg,.jpeg,.png" class="form-control">
                                <x-input-error :messages="$errors->get('cover_image')" />
                            </div>

                            <div class="col-12">
                                <x-input-label :value="__('Regions Covered (select all that apply)')" />
                                @php $selectedRegions = old('regions', $agent->regions ?? []); @endphp
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
                                <x-text-input id="linkedin" name="linkedin" type="text" :value="old('linkedin', $agent->linkedin)" placeholder="{{ __('Handle or profile URL') }}" />
                                <x-input-error :messages="$errors->get('linkedin')" />
                            </div>

                            <div class="col-12">
                                <x-wysiwyg-editor name="about" :value="$agent->about" label="About you" />
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
            @php
                $trustLabels = [
                    'verified_pro' => ['label' => 'Verified Pro', 'class' => 'text-bg-primary'],
                    'gold' => ['label' => 'Gold', 'class' => 'text-bg-warning'],
                    'silver' => ['label' => 'Silver', 'class' => 'text-bg-secondary'],
                    'bronze' => ['label' => 'Bronze', 'class' => 'text-bg-light border'],
                    'new' => ['label' => 'New', 'class' => 'text-bg-light border'],
                ];
                $trust = $trustLabels[$agent->trust_level];
            @endphp
            <div class="card mb-4">
                <div class="card-body">
                    <h2 class="h6">{{ __('Your Standing') }}</h2>
                    <span class="badge {{ $trust['class'] }} mb-2"><i class="bi bi-shield-fill-check me-1" aria-hidden="true"></i>{{ __('Trust level') }}: {{ __($trust['label']) }}</span>
                    <p class="small text-muted mb-0">
                        @if ($agent->ratings_count)
                            <i class="bi bi-star-fill text-warning" aria-hidden="true"></i> {{ number_format($agent->average_rating, 1) }} ({{ $agent->ratings_count }} {{ __('ratings') }})
                        @else
                            {{ __('No ratings yet.') }}
                        @endif
                    </p>
                </div>
            </div>

            <div class="card">
                <div class="card-body">
                    <h2 class="h6">{{ __('ID Document') }}</h2>
                    @if ($agent->id_doc_url)
                        <a href="{{ URL::temporarySignedRoute('documents.agent-id', now()->addMinutes(10), ['agent' => $agent->id]) }}"
                           class="btn btn-sm btn-outline-secondary" target="_blank" rel="noopener">
                            <i class="bi bi-file-earmark-text me-1" aria-hidden="true"></i>{{ __('View document') }}
                        </a>
                    @else
                        <p class="small text-muted mb-0">{{ __('No document on file.') }}</p>
                    @endif
                </div>
            </div>
        </div>
    </div>
</x-dashboard-layout>
