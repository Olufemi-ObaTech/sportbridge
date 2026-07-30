<x-app-layout>
    <div class="row justify-content-center">
        <div class="col-12 col-lg-8">
            <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <h1 class="h4 mb-0">{{ __('Community Feed') }}</h1>
                <div class="btn-group btn-group-sm" role="group">
                    <a href="{{ route('feed.index', ['sport' => 'all']) }}" class="btn btn-outline-secondary {{ $currentSport === null ? 'active' : '' }}">{{ __('Any') }}</a>
                    <a href="{{ route('feed.index', ['sport' => 'football']) }}" class="btn btn-outline-secondary {{ $currentSport === 'football' ? 'active' : '' }}">{{ __('Football') }}</a>
                    <a href="{{ route('feed.index', ['sport' => 'basketball']) }}" class="btn btn-outline-secondary {{ $currentSport === 'basketball' ? 'active' : '' }}">{{ __('Basketball') }}</a>
                </div>
            </div>

            @auth
                @if (auth()->user()->isActive())
                    <div class="card mb-4">
                        <div class="card-body">
                            <form method="POST" action="{{ route('feed.store') }}" enctype="multipart/form-data">
                                @csrf
                                <textarea name="content" rows="3" class="form-control mb-2" placeholder="{{ __('Share an update...') }}" required>{{ old('content') }}</textarea>
                                <x-input-error :messages="$errors->get('content')" />

                                <div class="mt-2">
                                    <x-input-label for="post-sport" :value="__('Sport (optional)')" />
                                    <select id="post-sport" name="sport" class="form-select form-select-sm">
                                        <option value="" @selected(old('sport', $currentSport) === null)>{{ __('General') }}</option>
                                        <option value="football" @selected(old('sport', $currentSport) === 'football')>{{ __('Football') }}</option>
                                        <option value="basketball" @selected(old('sport', $currentSport) === 'basketball')>{{ __('Basketball') }}</option>
                                    </select>
                                    <x-input-error :messages="$errors->get('sport')" />
                                </div>

                                <div class="mt-2">
                                    <input type="file" name="media[]" class="form-control form-control-sm" accept="image/*,video/mp4,video/quicktime" multiple>
                                    <div class="form-text">{{ __('JPG, PNG, WEBP, MP4 - max 50MB') }}</div>
                                    <x-input-error :messages="$errors->get('media.*')" />
                                </div>

                                <div class="form-check mt-3">
                                    <input type="checkbox" class="form-check-input" id="is_live" name="is_live" value="1" @checked(old('is_live'))>
                                    <label class="form-check-label" for="is_live">{{ __('This is a live video') }}</label>
                                </div>

                                <div id="live-fields" class="row g-2 mt-1" style="display: {{ old('is_live') ? 'flex' : 'none' }};">
                                    <div class="col-12 col-sm-7">
                                        <x-input-label for="live_link" :value="__('Live Stream Link')" />
                                        <x-text-input id="live_link" name="live_link" type="url" placeholder="https://..." :value="old('live_link')" />
                                        <div class="form-text">{{ __('YouTube Live, Facebook Live, Zoom - anywhere viewers can watch.') }}</div>
                                        <x-input-error :messages="$errors->get('live_link')" />
                                    </div>
                                    <div class="col-12 col-sm-5">
                                        <x-input-label for="live_at" :value="__('Started / Starts At (optional)')" />
                                        <input type="datetime-local" id="live_at" name="live_at" class="form-control" value="{{ old('live_at') }}">
                                        <x-input-error :messages="$errors->get('live_at')" />
                                    </div>
                                </div>

                                <div class="form-check mt-3">
                                    <input type="checkbox" class="form-check-input" id="is_training" name="is_training" value="1" @checked(old('is_training'))>
                                    <label class="form-check-label" for="is_training">{{ __('This is an online training session') }}</label>
                                </div>

                                <div id="training-fields" class="row g-2 mt-1" style="display: {{ old('is_training') ? 'flex' : 'none' }};">
                                    <div class="col-12 col-sm-7">
                                        <x-input-label for="training_link" :value="__('Training / Meeting Link')" />
                                        <x-text-input id="training_link" name="training_link" type="url" placeholder="https://..." :value="old('training_link')" />
                                        <x-input-error :messages="$errors->get('training_link')" />
                                    </div>
                                    <div class="col-12 col-sm-5">
                                        <x-input-label for="training_at" :value="__('Date & Time')" />
                                        <input type="datetime-local" id="training_at" name="training_at" class="form-control" value="{{ old('training_at') }}">
                                        <x-input-error :messages="$errors->get('training_at')" />
                                    </div>
                                </div>

                                <div class="d-flex justify-content-end mt-3">
                                    <x-primary-button>{{ __('Post') }}</x-primary-button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <script nonce="{{ request()->attributes->get('csp_nonce') }}">
                        (function () {
                            var liveCheckbox = document.getElementById('is_live');
                            var liveFields = document.getElementById('live-fields');
                            var trainingCheckbox = document.getElementById('is_training');
                            var trainingFields = document.getElementById('training-fields');

                            // A post is either a live broadcast or a scheduled training
                            // session, not both - checking one unchecks the other.
                            liveCheckbox?.addEventListener('change', function () {
                                liveFields.style.display = liveCheckbox.checked ? 'flex' : 'none';
                                if (liveCheckbox.checked) {
                                    trainingCheckbox.checked = false;
                                    trainingFields.style.display = 'none';
                                }
                            });
                            trainingCheckbox?.addEventListener('change', function () {
                                trainingFields.style.display = trainingCheckbox.checked ? 'flex' : 'none';
                                if (trainingCheckbox.checked) {
                                    liveCheckbox.checked = false;
                                    liveFields.style.display = 'none';
                                }
                            });
                        })();
                    </script>
                @endif
            @endauth

            @forelse ($posts as $post)
                @include('feed.partials.post', ['post' => $post])
            @empty
                <x-empty-state icon="bi-newspaper" :title="__('No posts yet. Be the first to share something.')" />
            @endforelse

            <div class="mt-3">{{ $posts->links() }}</div>
        </div>
    </div>
</x-app-layout>
