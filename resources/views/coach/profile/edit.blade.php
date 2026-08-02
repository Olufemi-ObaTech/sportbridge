<x-dashboard-layout title="{{ __('My Profile') }}">
    <div class="row g-4">
        <div class="col-12 col-lg-8">
            <div class="card">
                <div class="card-body p-4">
                    <form method="POST" action="{{ route('coach.profile.update') }}" enctype="multipart/form-data">
                        @csrf
                        @method('PUT')

                        <div class="row g-3">
                            <div class="col-12 col-md-6">
                                <x-input-label for="full_name" :value="__('Full Name')" />
                                <x-text-input id="full_name" name="full_name" type="text" :value="old('full_name', $coach->full_name)" required />
                                <x-input-error :messages="$errors->get('full_name')" />
                            </div>

                            <div class="col-12 col-md-6">
                                <x-input-label :value="__('Sport')" />
                                <x-text-input type="text" :value="ucfirst($coach->sport)" disabled />
                                <div class="form-text">{{ __('Contact support to change your sport.') }}</div>
                            </div>

                            <div class="col-12 col-md-6">
                                <x-input-label for="preferred_role" :value="__('Preferred Role')" />
                                @php $roles = \App\Models\CoachProfile::rolesFor($coach->sport); @endphp
                                <select id="preferred_role" name="preferred_role" class="form-select" required>
                                    @foreach ($roles as $value => $label)
                                        <option value="{{ $value }}" @selected(old('preferred_role', $coach->preferred_role) === $value)>{{ __($label) }}</option>
                                    @endforeach
                                </select>
                                <x-input-error :messages="$errors->get('preferred_role')" />
                            </div>

                            <div class="col-12 col-md-6">
                                <x-input-label for="experience_years" :value="__('Years of Experience')" />
                                <x-text-input id="experience_years" name="experience_years" type="number" min="0" max="60" :value="old('experience_years', $coach->experience_years)" required />
                                <x-input-error :messages="$errors->get('experience_years')" />
                            </div>

                            <div class="col-12 col-md-6">
                                <x-input-label for="nationality" :value="__('Nationality')" />
                                <x-text-input id="nationality" name="nationality" type="text" :value="old('nationality', $coach->nationality)" required />
                                <x-input-error :messages="$errors->get('nationality')" />
                            </div>

                            <div class="col-12 col-md-6">
                                <x-input-label for="current_club" :value="__('Current Club')" />
                                <x-text-input id="current_club" name="current_club" type="text" :value="old('current_club', $coach->current_club)" />
                                <x-input-error :messages="$errors->get('current_club')" />
                            </div>

                            <div class="col-12 col-md-6 d-flex align-items-end">
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" id="open_to_work" name="open_to_work" value="1" @checked(old('open_to_work', $coach->open_to_work))>
                                    <label class="form-check-label" for="open_to_work">{{ __('Open to work') }}</label>
                                </div>
                            </div>

                            <div class="col-12">
                                <x-input-label :value="__('Coaching Badges (select all that apply)')" />
                                @php $selectedBadges = old('badges', $coach->badges ?? []); @endphp
                                <div class="row row-cols-2 row-cols-md-4 g-2">
                                    @foreach (\App\Models\CoachProfile::badgesFor($coach->sport) as $badge)
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
                                <x-input-label for="certificates" :value="__('Other Certificates (one per line)')" />
                                <textarea id="certificates" name="certificates" rows="2" class="form-control">{{ old('certificates', implode("\n", $coach->certificates ?? [])) }}</textarea>
                                <x-input-error :messages="$errors->get('certificates')" />
                            </div>

                            <div class="col-12 col-md-4">
                                <x-input-label for="photo" :value="__('Profile Photo')" />
                                <input id="photo" name="photo" type="file" accept=".jpg,.jpeg,.png" class="form-control">
                                @if ($coach->photo_url)
                                    <img src="{{ asset('storage/'.$coach->photo_url) }}" alt="" class="mt-2 rounded" style="height:60px;width:60px;object-fit:cover;">
                                @endif
                                <x-input-error :messages="$errors->get('photo')" />
                            </div>

                            <div class="col-12 col-md-4">
                                <x-input-label for="cover_image" :value="__('Cover Image')" />
                                <input id="cover_image" name="cover_image" type="file" accept=".jpg,.jpeg,.png" class="form-control">
                                <x-input-error :messages="$errors->get('cover_image')" />
                            </div>

                            <div class="col-12 col-md-4">
                                <x-input-label for="cv" :value="__('Replace CV (optional)')" />
                                <input id="cv" name="cv" type="file" accept=".pdf,.docx" class="form-control">
                                <x-input-error :messages="$errors->get('cv')" />
                            </div>

                            <div class="col-12 col-md-6">
                                <x-input-label for="linkedin" :value="__('LinkedIn (optional)')" />
                                <x-text-input id="linkedin" name="linkedin" type="text" :value="old('linkedin', $coach->linkedin)" placeholder="{{ __('Handle or profile URL') }}" />
                                <x-input-error :messages="$errors->get('linkedin')" />
                            </div>

                            <div class="col-12">
                                <x-wysiwyg-editor name="about" :value="$coach->about" label="About you" />
                            </div>

                            <div class="col-12">
                                <x-input-label for="achievements" :value="__('Achievements / Honours (optional)')" />
                                <textarea id="achievements" name="achievements" rows="3" class="form-control" placeholder="{{ __('e.g. Won Regional Championship 2023, promoted 3 clubs to top division') }}">{{ old('achievements', $coach->achievements) }}</textarea>
                                <x-input-error :messages="$errors->get('achievements')" />
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
                    <h2 class="h6">{{ __('CV') }}</h2>
                    @if ($coach->cv_url)
                        <a href="{{ URL::temporarySignedRoute('documents.coach-cv', now()->addMinutes(10), ['coach' => $coach->id]) }}"
                           class="btn btn-sm btn-outline-secondary" target="_blank" rel="noopener">
                            <i class="bi bi-file-earmark-text me-1" aria-hidden="true"></i>{{ __('View CV') }}
                        </a>
                    @else
                        <p class="small text-muted mb-0">{{ __('No CV on file.') }}</p>
                    @endif
                </div>
            </div>
        </div>
    </div>
</x-dashboard-layout>
