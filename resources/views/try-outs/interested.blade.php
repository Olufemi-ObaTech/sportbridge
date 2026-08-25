<x-dashboard-layout title="{{ __('Interested Players') }}">
    <div class="mb-3">
        <h1 class="h5 mb-0">{{ __('Interested Players for :title', ['title' => $tryOut->title]) }}</h1>
        <a href="{{ route('try-outs.show', $tryOut) }}" class="small">{{ __('View try-out posting') }}</a>
    </div>

    @if ($interests->isEmpty())
        <x-empty-state icon="bi-people" :title="__('No players have expressed interest yet.')" />
    @else
        @foreach ($interests as $interest)
            @php $player = $interest->user?->playerProfile; @endphp
            <div class="card mb-2">
                <div class="card-body d-flex justify-content-between align-items-start gap-3 flex-wrap">
                    <div>
                        @if ($player)
                            <a href="{{ route('player.show', $player) }}" class="text-decoration-none fw-semibold">{{ $interest->user->name }}</a>
                        @else
                            <span class="fw-semibold">{{ $interest->user?->name ?? __('Deleted user') }}</span>
                        @endif
                        <div class="small text-muted">{{ __('Expressed interest') }} {{ $interest->created_at->diffForHumans() }}</div>
                        @if ($interest->message)
                            <p class="mt-2 mb-0" style="white-space: pre-line;">{{ $interest->message }}</p>
                        @endif
                    </div>
                    @if ($interest->user)
                        <x-message-button :user="$interest->user" class="btn-sm" />
                    @endif
                </div>
            </div>
        @endforeach

        <div class="mt-3">{{ $interests->links() }}</div>
    @endif
</x-dashboard-layout>
