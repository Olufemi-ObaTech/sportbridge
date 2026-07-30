<div class="d-flex mb-2 {{ $message->sender_id === auth()->id() ? 'justify-content-end' : 'justify-content-start' }}" data-message-id="{{ $message->id }}">
    <div class="p-2 rounded {{ $message->sender_id === auth()->id() ? 'text-white' : 'bg-light' }}"
         style="max-width: 75%; {{ $message->sender_id === auth()->id() ? 'background: var(--fc-gradient-primary);' : '' }}">
        @if ($message->playerCard)
            <a href="{{ route('player.show', $message->playerCard) }}" class="d-block small fw-semibold mb-1 {{ $message->sender_id === auth()->id() ? 'text-white' : '' }}">
                <i class="bi bi-person-badge me-1" aria-hidden="true"></i>{{ $message->playerCard->full_name }}
            </a>
        @endif
        <div>{{ $message->content }}</div>
        <div class="small {{ $message->sender_id === auth()->id() ? 'text-white-50' : 'text-muted' }}">{{ $message->created_at->format('g:i A') }}</div>
    </div>
</div>
