<div class="p-2 border-bottom bg-light">
    <h1 class="h6 mb-0 px-2">{{ __('Inbox') }}</h1>
</div>

<div class="list-group list-group-flush" style="max-height: 70vh; overflow-y: auto;">
    @forelse ($conversations as $conversation)
        @php
            $other = $conversation->otherParticipant(auth()->user());
            $lastMessage = $conversation->messages->first();
        @endphp
        <a href="{{ route('inbox.show', $conversation) }}"
           class="list-group-item list-group-item-action {{ isset($activeConversation) && $activeConversation->id === $conversation->id ? 'active' : '' }}">
            <div class="d-flex justify-content-between">
                <span class="fw-semibold">{{ $other->name }}</span>
                @if ($conversation->last_message_at)
                    <span class="small">{{ $conversation->last_message_at->diffForHumans(null, true) }}</span>
                @endif
            </div>
            @if ($lastMessage)
                <div class="small text-truncate">{{ $lastMessage->content }}</div>
            @endif
        </a>
    @empty
        <div class="p-3">
            <x-empty-state icon="bi-chat-dots" :title="__('No conversations yet.')" />
        </div>
    @endforelse
</div>
