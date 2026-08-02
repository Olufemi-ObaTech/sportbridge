@push('meta')
    <meta property="og:type" content="profile">
    <meta property="og:title" content="{{ $agent->agency_name }} - {{ config('app.name') }}">
    <meta property="og:description" content="{{ Str::limit(strip_tags($agent->about ?? ''), 150) ?: $agent->agency_name.' on '.config('app.name') }}">
    @if ($agent->cover_image_url)
        <meta property="og:image" content="{{ asset('storage/'.$agent->cover_image_url) }}">
    @endif
    <meta name="twitter:card" content="summary_large_image">
@endpush

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

<x-app-layout>
    <x-disclaimer-banner class="mb-4">
        {{ __('Never send money, fees, or payment of any kind to an agent or scout to arrange a trial, tryout, or introduction. Legitimate agents do not require upfront payment from players. Always independently verify an agent\'s credentials and licensing body before engaging with them.') }}
    </x-disclaimer-banner>

    <div class="mb-4">
        @if ($agent->cover_image_url)
            <img src="{{ asset('storage/'.$agent->cover_image_url) }}" alt="" class="w-100 rounded" style="height: 200px; object-fit: cover;">
        @else
            <div class="w-100 rounded" style="height: 200px; background: var(--fc-gradient-primary);"></div>
        @endif

        <div class="pt-3 d-flex justify-content-between align-items-start flex-wrap gap-2">
            <div>
                <h1 class="h4 mb-0">
                    {{ $user->name }}
                    @if ($agent->verified_badge)
                        <i class="bi bi-patch-check-fill text-primary" title="{{ __('Verified') }}" aria-hidden="true"></i>
                    @endif
                </h1>
                <p class="text-muted mb-0">
                    {{ $agent->agency_name }} &middot; {{ $agent->nationality }}
                    @if ($agent->verification_body)
                        &middot; {{ __('Verified by :body', ['body' => $agent->verification_body]) }}
                    @endif
                </p>
                <p class="small text-muted mb-1">{{ $agent->experience_years }} {{ __('years of experience') }}</p>
                <p class="small text-muted mb-1">
                    {{ __('License') }}: {{ $agent->license_number }}
                    <i class="bi bi-info-circle" title="{{ __('Self-reported by the agent. Only the Verified badge above confirms admin verification - always confirm a license independently with the issuing body before engaging.') }}" aria-hidden="true"></i>
                </p>
                <span class="badge text-bg-light border">{{ __(ucfirst($agent->sport)) }}</span>
                <span class="badge {{ $trust['class'] }}"><i class="bi bi-shield-fill-check me-1" aria-hidden="true"></i>{{ __('Trust level') }}: {{ __($trust['label']) }}</span>
                @if ($agent->ratings_count)
                    <span class="badge text-bg-light border"><i class="bi bi-star-fill text-warning me-1" aria-hidden="true"></i>{{ number_format($agent->average_rating, 1) }} ({{ $agent->ratings_count }})</span>
                @endif
                @if ($agent->linkedin)
                    <a href="{{ $agent->linkedin_url }}" target="_blank" rel="noopener" class="badge text-bg-light border text-decoration-none">
                        <i class="bi bi-linkedin" aria-hidden="true"></i> {{ __('LinkedIn') }}
                    </a>
                @endif
            </div>
            <div class="d-flex flex-column gap-2">
                <x-message-button :user="$user" />
                <x-report-link :user="$user" class="btn btn-outline-danger btn-sm" />
                @auth
                    <button type="button" class="btn btn-outline-secondary btn-sm" data-bs-toggle="modal" data-bs-target="#recommendAgentModal">
                        <i class="bi bi-hand-thumbs-up me-1" aria-hidden="true"></i>{{ __('Recommend this agent') }}
                    </button>
                @endauth
            </div>
        </div>
    </div>

    <div class="row g-4">
        <div class="col-12 col-lg-8">
            @if ($agent->about)
                <div class="card mb-4">
                    <div class="card-body">{!! $agent->about !!}</div>
                </div>
            @endif

            @if ($agent->achievements)
                <div class="card mb-4">
                    <div class="card-body">
                        <h2 class="h6"><i class="bi bi-trophy-fill text-warning me-1" aria-hidden="true"></i>{{ __('Achievements') }}</h2>
                        <p class="mb-0" style="white-space: pre-line;">{{ $agent->achievements }}</p>
                    </div>
                </div>
            @endif

            @if ($mediaPosts->isNotEmpty())
                <x-media-gallery :posts="$mediaPosts" />
            @endif
        </div>
        <div class="col-12 col-lg-4">
            <div class="card mb-4">
                <div class="card-body">
                    <h2 class="h6">{{ __('Regions Covered') }}</h2>
                    <div class="d-flex flex-wrap gap-1">
                        @foreach ($agent->regions ?? [] as $region)
                            <span class="badge text-bg-light border">{{ __($region) }}</span>
                        @endforeach
                    </div>
                </div>
            </div>

            @auth
                @if (auth()->id() !== $user->id)
                    @php
                        $canRate = $agent->ratings()->where('user_id', auth()->id())->exists()
                            || $agent->hasProvidedServiceTo(auth()->user());
                    @endphp
                    <div class="card">
                        <div class="card-body">
                            <h2 class="h6">{{ __('Rate this agent') }}</h2>
                            @if ($canRate)
                                <form method="POST" action="{{ route('agents.ratings.store', $agent) }}">
                                    @csrf
                                    <div class="mb-2">
                                        <x-input-label for="score" :value="__('Score (1-5)')" />
                                        <select id="score" name="score" class="form-select form-select-sm" required>
                                            @foreach ([5, 4, 3, 2, 1] as $score)
                                                <option value="{{ $score }}">{{ $score }} {{ __('star') }}{{ $score > 1 ? 's' : '' }}</option>
                                            @endforeach
                                        </select>
                                        <x-input-error :messages="$errors->get('score')" />
                                    </div>
                                    <div class="mb-2">
                                        <x-input-label for="comment" :value="__('Comment (optional)')" />
                                        <textarea id="comment" name="comment" rows="2" class="form-control form-control-sm"></textarea>
                                        <x-input-error :messages="$errors->get('comment')" />
                                    </div>
                                    <x-secondary-button type="submit">{{ __('Submit Rating') }}</x-secondary-button>
                                </form>
                            @else
                                <p class="small text-muted mb-0">{{ __('You can rate this agent once you\'ve messaged them or they\'ve been granted access to a player you own/represent.') }}</p>
                            @endif
                        </div>
                    </div>
                @endif
            @endauth
        </div>
    </div>

    @auth
        <x-modal name="recommendAgentModal">
            <form method="POST" action="{{ route('agents.recommendations.store', $agent) }}">
                @csrf
                <div class="modal-header">
                    <h2 class="modal-title h5">{{ __('Recommend this agent') }}</h2>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="{{ __('Close') }}"></button>
                </div>
                <div class="modal-body">
                    <x-disclaimer-banner icon="bi-info-circle-fill" class="alert-info">
                        {{ __('This is a documented record of a proposed referral arrangement only. :app does not process, hold, or guarantee any commission payment.', ['app' => config('app.name')]) }}
                    </x-disclaimer-banner>

                    <div class="mb-2 position-relative">
                        <x-input-label for="recommend_search" :value="__('Recommending to')" />
                        <x-text-input id="recommend_search" type="text" autocomplete="off"
                            placeholder="{{ __('Search a player on :app, or type a name/club not yet on the platform', ['app' => config('app.name')]) }}" />
                        <input type="hidden" id="recommend_player_id" name="player_id" value="">
                        <input type="hidden" id="recommend_to_name" name="recommended_to_name" value="">
                        <div id="recommend_results" class="list-group position-absolute w-100 shadow-sm" style="z-index: 1060; display: none; max-height: 220px; overflow-y: auto;"></div>
                        <div id="recommend_selected" class="form-text" style="display: none;"></div>
                        @auth
                            @if (auth()->user()->playerProfile)
                                <button type="button" id="recommend_self" class="btn btn-sm btn-link p-0 mt-1"
                                    data-player-id="{{ auth()->user()->playerProfile->id }}"
                                    data-player-name="{{ auth()->user()->playerProfile->full_name }}">{{ __('This is me') }}</button>
                            @endif
                        @endauth
                        <x-input-error :messages="$errors->get('player_id')" />
                        <x-input-error :messages="$errors->get('recommended_to_name')" />
                    </div>
                    <div class="mb-2">
                        <x-input-label for="proposed_percentage" :value="__('Proposed Commission %')" />
                        <x-text-input id="proposed_percentage" name="proposed_percentage" type="number" min="0" max="100" step="0.01" required />
                        <x-input-error :messages="$errors->get('proposed_percentage')" />
                    </div>
                    <div class="mb-2">
                        <x-input-label for="note" :value="__('Note (optional)')" />
                        <textarea id="note" name="note" rows="3" class="form-control"></textarea>
                        <x-input-error :messages="$errors->get('note')" />
                    </div>
                </div>
                <div class="modal-footer">
                    <x-secondary-button data-bs-dismiss="modal">{{ __('Cancel') }}</x-secondary-button>
                    <x-primary-button>{{ __('Submit Recommendation') }}</x-primary-button>
                </div>
            </form>
        </x-modal>

        <script nonce="{{ request()->attributes->get('csp_nonce') }}">
            (function () {
                var searchInput = document.getElementById('recommend_search');
                var playerIdInput = document.getElementById('recommend_player_id');
                var toNameInput = document.getElementById('recommend_to_name');
                var results = document.getElementById('recommend_results');
                var selectedNote = document.getElementById('recommend_selected');
                var selfButton = document.getElementById('recommend_self');
                var searchUrl = '{{ route('api.players.search') }}';
                var timer = null;

                function clearSelection() {
                    playerIdInput.value = '';
                    selectedNote.style.display = 'none';
                    selectedNote.textContent = '';
                }

                function selectPlayer(id, name) {
                    playerIdInput.value = id;
                    toNameInput.value = '';
                    searchInput.value = name;
                    selectedNote.style.display = '';
                    selectedNote.textContent = '{{ __('Recommending to a player on :app', ['app' => config('app.name')]) }}: ' + name;
                    results.style.display = 'none';
                    results.innerHTML = '';
                }

                searchInput.addEventListener('input', function () {
                    var query = searchInput.value.trim();
                    toNameInput.value = query;
                    clearSelection();

                    clearTimeout(timer);
                    if (query.length < 2) {
                        results.style.display = 'none';
                        results.innerHTML = '';
                        return;
                    }

                    timer = setTimeout(function () {
                        fetch(searchUrl + '?q=' + encodeURIComponent(query), {
                            headers: { 'X-Requested-With': 'XMLHttpRequest', Accept: 'application/json' },
                        })
                            .then(function (response) { return response.ok ? response.json() : { data: [] }; })
                            .then(function (payload) {
                                var players = (payload.data || []).slice(0, 6);
                                results.innerHTML = '';
                                if (players.length === 0) {
                                    results.style.display = 'none';
                                    return;
                                }
                                players.forEach(function (player) {
                                    var item = document.createElement('button');
                                    item.type = 'button';
                                    item.className = 'list-group-item list-group-item-action small';
                                    item.textContent = player.full_name + ' (' + player.sport + (player.club_name ? ', ' + player.club_name : '') + ')';
                                    item.addEventListener('click', function () {
                                        selectPlayer(player.id, player.full_name);
                                    });
                                    results.appendChild(item);
                                });
                                results.style.display = '';
                            });
                    }, 250);
                });

                selfButton?.addEventListener('click', function () {
                    selectPlayer(selfButton.dataset.playerId, selfButton.dataset.playerName);
                });

                document.addEventListener('click', function (event) {
                    if (!results.contains(event.target) && event.target !== searchInput) {
                        results.style.display = 'none';
                    }
                });
            })();
        </script>
    @endauth
</x-app-layout>
