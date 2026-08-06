<x-app-layout>
    <div class="container py-4" style="max-width: 800px;">
        <h1 class="h4 mb-4">{{ __('Trials') }}</h1>

        <div class="row g-4">
            <div class="col-12 col-lg-6">
                <h2 class="h6">{{ __('Proposed by you') }}</h2>
                <div class="card">
                    <div class="list-group list-group-flush">
                        @forelse ($organized as $trial)
                            <div class="list-group-item">
                                <div class="d-flex justify-content-between align-items-start gap-2">
                                    <div>
                                        <div class="fw-semibold small">{{ $trial->player?->full_name ?? __('Player') }}</div>
                                        <div class="text-muted" style="font-size: 0.78rem;">
                                            {{ $trial->scheduled_at->format('D, M j Y \a\t g:ia') }}
                                            @if ($trial->location) &middot; {{ $trial->location }} @endif
                                        </div>
                                    </div>
                                    <x-status-badge :status="$trial->status" />
                                </div>
                                @if ($trial->isPending())
                                    <form method="POST" action="{{ route('trials.cancel', $trial) }}" class="mt-2">
                                        @csrf
                                        <button type="submit" class="btn btn-sm btn-outline-danger" data-confirm="{{ __('Cancel this trial proposal?') }}">{{ __('Cancel') }}</button>
                                    </form>
                                @endif
                            </div>
                        @empty
                            <p class="text-muted small text-center py-4 mb-0">{{ __('No trials proposed yet.') }}</p>
                        @endforelse
                    </div>
                </div>
            </div>

            <div class="col-12 col-lg-6">
                <h2 class="h6">{{ __('Proposed to you') }}</h2>
                <div class="card">
                    <div class="list-group list-group-flush">
                        @forelse ($received as $trial)
                            <div class="list-group-item">
                                <div class="d-flex justify-content-between align-items-start gap-2">
                                    <div>
                                        <div class="fw-semibold small">{{ $trial->organizer->name }}</div>
                                        <div class="text-muted" style="font-size: 0.78rem;">
                                            {{ $trial->scheduled_at->format('D, M j Y \a\t g:ia') }}
                                            @if ($trial->location) &middot; {{ $trial->location }} @endif
                                        </div>
                                        @if ($trial->notes)
                                            <div class="small mt-1">{{ $trial->notes }}</div>
                                        @endif
                                    </div>
                                    <x-status-badge :status="$trial->status" />
                                </div>
                                @if ($trial->isPending())
                                    <div class="d-flex gap-2 mt-2">
                                        <form method="POST" action="{{ route('trials.respond', $trial) }}">
                                            @csrf
                                            <input type="hidden" name="decision" value="accepted">
                                            <button type="submit" class="btn btn-sm btn-success">{{ __('Accept') }}</button>
                                        </form>
                                        <form method="POST" action="{{ route('trials.respond', $trial) }}">
                                            @csrf
                                            <input type="hidden" name="decision" value="declined">
                                            <button type="submit" class="btn btn-sm btn-outline-danger">{{ __('Decline') }}</button>
                                        </form>
                                    </div>
                                @endif
                            </div>
                        @empty
                            <p class="text-muted small text-center py-4 mb-0">{{ __('No trials proposed to you yet.') }}</p>
                        @endforelse
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
