<x-dashboard-layout title="{{ __('My Profile') }}">
    <div class="row g-4">
        <div class="col-12 col-lg-8">
            <div class="card mb-4">
                <div class="card-body p-4">
                    <h2 class="h5 mb-3">{{ __('Profile Details') }}</h2>
                    <form method="POST" action="{{ route('player.profile.update') }}" enctype="multipart/form-data">
                        @csrf
                        @method('PUT')
                        @include('academy.players.partials.form', ['player' => $player])

                        <div class="row g-3 mb-4">
                            <div class="col-12">
                                <x-input-label for="cv" :value="__('CV / Resume (optional, pdf or docx, max 5MB)')" />
                                <input id="cv" name="cv" type="file" accept=".pdf,.docx" class="form-control">
                                <x-input-error :messages="$errors->get('cv')" />
                                @if ($player->cv_url)
                                    <a href="{{ URL::temporarySignedRoute('documents.player-cv', now()->addMinutes(10), ['player' => $player->id]) }}"
                                       class="small d-inline-block mt-1" target="_blank" rel="noopener">
                                        <i class="bi bi-file-earmark-text me-1" aria-hidden="true"></i>{{ __('View current CV') }}
                                    </a>
                                @endif
                            </div>
                        </div>

                        <x-primary-button>{{ __('Save Changes') }}</x-primary-button>
                    </form>
                </div>
            </div>

            <div class="card">
                <div class="card-body p-4">
                    <h2 class="h5 mb-3">{{ __('Photos & Highlight Videos') }}</h2>
                    @include('academy.players.partials.media-tab', [
                        'player' => $player,
                        'uploadUrl' => route('player.media.upload', $player),
                        'youtubeUrl' => route('player.media.youtube', $player),
                        'featureRoute' => 'player.media.feature',
                        'destroyRoute' => 'player.media.destroy',
                    ])
                </div>
            </div>
        </div>

        <div class="col-12 col-lg-4">
            <div class="card">
                <div class="card-body">
                    <h2 class="h6">{{ __('Your Public Profile') }}</h2>
                    <p class="small text-muted">{{ __('This is what academies, agents, scouts and coaches see when they find you.') }}</p>
                    <a href="{{ route('player.show', $player) }}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-secondary w-100">
                        <i class="bi bi-box-arrow-up-right me-1" aria-hidden="true"></i>{{ __('View live profile') }}
                    </a>
                </div>
            </div>
        </div>
    </div>
</x-dashboard-layout>
