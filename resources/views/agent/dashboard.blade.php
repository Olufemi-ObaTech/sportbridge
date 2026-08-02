<x-dashboard-layout title="{{ __('Dashboard') }}">
    <x-dashboard-profile-card
        :photo-url="$agent->photo_url"
        :name="auth()->user()->name"
        :subtitle="$agent->agency_name"
        edit-route="agent.profile.edit"
        :view-route="route('agent.show', auth()->user()->username)" />

    <div class="row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-3 mb-4">
        <div class="col">
            <div class="card h-100 p-3">
                <div class="text-muted small">{{ __('Watchlist') }}</div>
                <div class="fs-3 fw-bold">{{ $stats['watchlist'] }}</div>
            </div>
        </div>
        <div class="col">
            <div class="card h-100 p-3">
                <div class="text-muted small">{{ __('Pending Requests') }}</div>
                <div class="fs-3 fw-bold">{{ $stats['pending_access_requests'] }}</div>
            </div>
        </div>
        <div class="col">
            <div class="card h-100 p-3">
                <div class="text-muted small">{{ __('Granted Access') }}</div>
                <div class="fs-3 fw-bold">{{ $stats['granted_access'] }}</div>
            </div>
        </div>
        <div class="col">
            <div class="card h-100 p-3">
                <div class="text-muted small">{{ __('Unread Messages') }}</div>
                <div class="fs-3 fw-bold">{{ $unreadMessages }}</div>
            </div>
        </div>
    </div>

    <div class="row g-4">
        <div class="col-12 col-lg-8">
            <div class="card">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h2 class="h6 mb-0">{{ __('Recently Watched Players') }}</h2>
                        <a href="{{ route('agent.watchlist.index') }}" class="small">{{ __('View all') }}</a>
                    </div>
                    @forelse ($watchedPlayers as $player)
                        <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                            <a href="{{ route('player.show', $player) }}" class="text-decoration-none">{{ $player->full_name }}</a>
                            <span class="small text-muted">{{ $player->academy->club_name ?? __('Free Agent') }}</span>
                        </div>
                    @empty
                        <x-empty-state icon="bi-bookmark-star" :title="__('No players on your watchlist yet.')" :action="route('players.index')" :actionLabel="__('Find players')" />
                    @endforelse
                </div>
            </div>

            <div class="mt-4">
                <x-media-gallery :posts="$myMediaPosts" :show-upload-link="true" />
            </div>
        </div>

        <div class="col-12 col-lg-4">
            <div class="card mb-4">
                <div class="card-body">
                    <h2 class="h6">{{ __('Profile Completeness') }}</h2>
                    <div class="progress mb-2" role="progressbar" aria-valuenow="{{ $completeness['percent'] }}" aria-valuemin="0" aria-valuemax="100">
                        <div class="progress-bar" style="width: {{ $completeness['percent'] }}%">{{ $completeness['percent'] }}%</div>
                    </div>
                    @if ($completeness['next_action'])
                        <p class="small text-muted mb-2">{{ __('Next step') }}: {{ __($completeness['next_action']) }}</p>
                    @endif
                    <a href="{{ route('agent.profile.edit') }}" class="btn btn-sm btn-outline-primary">{{ __('Update profile') }}</a>
                </div>
            </div>

            <div class="card mb-4">
                <div class="card-body">
                    <h2 class="h6">{{ __('Messages') }}</h2>
                    <p class="mb-2">{{ __(':count unread', ['count' => $unreadMessages]) }}</p>
                    <a href="{{ route('inbox.index') }}" class="btn btn-sm btn-outline-primary">{{ __('Go to inbox') }}</a>
                </div>
            </div>

            <div class="mb-4">
                <x-invite-card />
            </div>

            <div class="card">
                <div class="card-body">
                    <h2 class="h6">{{ __('Supporting Documents') }}</h2>
                    <p class="small text-muted">{{ __('Upload licenses, certifications, or references. Only you and Super Admin can view these files.') }}</p>

                    @forelse ($agent->documents as $document)
                        <div class="d-flex justify-content-between align-items-center py-1 border-bottom small">
                            <a href="{{ route('documents.agent-document', [$agent, $document]) }}" target="_blank" rel="noopener">
                                <i class="bi bi-file-earmark-text me-1" aria-hidden="true"></i>{{ $document->title }}
                            </a>
                            <div class="d-flex align-items-center gap-2">
                                @if ($document->verified_at)
                                    <span class="badge text-bg-success">{{ __('Verified') }}</span>
                                @endif
                                <form method="POST" action="{{ route('agents.documents.destroy', [$agent, $document]) }}">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="btn btn-sm btn-link text-danger p-0" data-confirm="{{ __('Remove this document?') }}">{{ __('Remove') }}</button>
                                </form>
                            </div>
                        </div>
                    @empty
                        <p class="small text-muted">{{ __('No documents uploaded yet.') }}</p>
                    @endforelse

                    <form method="POST" action="{{ route('agents.documents.store', $agent) }}" enctype="multipart/form-data" class="mt-3">
                        @csrf
                        <div class="mb-2">
                            <x-input-label for="title" :value="__('Document title')" />
                            <x-text-input id="title" name="title" type="text" placeholder="{{ __('e.g. FIFA License Certificate') }}" required />
                            <x-input-error :messages="$errors->get('title')" />
                        </div>
                        <div class="mb-2">
                            <x-input-label for="file" :value="__('File (PDF, JPG, PNG - max 5MB)')" />
                            <input id="file" name="file" type="file" class="form-control form-control-sm" accept=".pdf,.jpg,.jpeg,.png" required>
                            <x-input-error :messages="$errors->get('file')" />
                        </div>
                        <x-secondary-button type="submit">{{ __('Upload Document') }}</x-secondary-button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</x-dashboard-layout>
