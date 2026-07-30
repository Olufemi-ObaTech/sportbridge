<x-app-layout>
    <h1 class="h4 mb-3">{{ __('My Recommendations') }}</h1>

    <x-disclaimer-banner icon="bi-info-circle-fill" class="alert-info mb-4">
        {{ __('These are documented, informational records of proposed referral arrangements only. :app does not process, hold, or guarantee any commission payment.', ['app' => config('app.name')]) }}
    </x-disclaimer-banner>

    <div class="row g-4">
        <div class="col-12 col-lg-6">
            <h2 class="h6">{{ __('Sent by you') }}</h2>
            @if ($sent->isEmpty())
                <x-empty-state icon="bi-hand-thumbs-up" :title="__('You have not recommended any agents yet.')" />
            @else
                <div class="list-group">
                    @foreach ($sent as $recommendation)
                        <div class="list-group-item">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <div class="fw-semibold">{{ $recommendation->agentProfile->agency_name }}</div>
                                    <div class="small text-muted">
                                        {{ __('To') }}: {{ $recommendation->player?->full_name ?? $recommendation->recommended_to_name }}
                                        &middot; {{ $recommendation->proposed_percentage }}%
                                    </div>
                                </div>
                                <span class="badge text-bg-light border">{{ __(ucfirst($recommendation->status)) }}</span>
                            </div>
                        </div>
                    @endforeach
                </div>
            @endif
        </div>

        <div class="col-12 col-lg-6">
            <h2 class="h6">{{ __('Received about you') }}</h2>
            @if ($received->isEmpty())
                <x-empty-state icon="bi-inbox" :title="__('No recommendations reference you yet.')" />
            @else
                <div class="list-group">
                    @foreach ($received as $recommendation)
                        <div class="list-group-item">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <div class="fw-semibold">{{ $recommendation->agentProfile->agency_name }}</div>
                                    <div class="small text-muted">
                                        {{ __('From') }}: {{ $recommendation->recommender->name }}
                                        &middot; {{ $recommendation->proposed_percentage }}%
                                    </div>
                                </div>
                                <span class="badge text-bg-light border">{{ __(ucfirst($recommendation->status)) }}</span>
                            </div>
                            @if ($recommendation->status === 'pending')
                                <div class="d-flex gap-2 mt-2">
                                    <form method="POST" action="{{ route('recommendations.status', $recommendation) }}">
                                        @csrf
                                        @method('PUT')
                                        <input type="hidden" name="status" value="acknowledged">
                                        <x-secondary-button type="submit">{{ __('Acknowledge') }}</x-secondary-button>
                                    </form>
                                    <form method="POST" action="{{ route('recommendations.status', $recommendation) }}">
                                        @csrf
                                        @method('PUT')
                                        <input type="hidden" name="status" value="declined">
                                        <x-danger-button type="submit">{{ __('Decline') }}</x-danger-button>
                                    </form>
                                </div>
                            @endif
                        </div>
                    @endforeach
                </div>
            @endif
        </div>
    </div>
</x-app-layout>
