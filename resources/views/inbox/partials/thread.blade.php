<div class="p-2 border-bottom bg-light d-flex align-items-center gap-2">
    <button type="button" class="btn btn-sm btn-link d-md-none p-0" id="inbox-back-btn" aria-label="{{ __('Back to conversations') }}">
        <i class="bi bi-arrow-left fs-5" aria-hidden="true"></i>
    </button>
    <div>
        <div class="fw-semibold">{{ $otherUser->name }}</div>
        @if ($conversation->subject)
            <div class="small text-muted">{{ $conversation->subject }}</div>
        @endif
    </div>
</div>

@if ($otherUser->role === \App\Models\User::ROLE_AGENT)
    <x-disclaimer-banner class="m-2 mb-0 py-2">
        {{ __('Never send money, fees, or payment of any kind to an agent or scout to arrange a trial, tryout, or introduction. Always independently verify their credentials first.') }}
    </x-disclaimer-banner>
@endif

<div id="chat-messages"
     class="flex-grow-1 p-3"
     style="overflow-y: auto; max-height: 55vh;"
     data-conversation-id="{{ $conversation->id }}"
     data-poll-url="{{ route('api.conversations.poll', $conversation) }}"
     data-current-user-id="{{ auth()->id() }}">
    @foreach ($conversation->messages as $message)
        @include('inbox.partials.message', ['message' => $message])
    @endforeach
</div>

<form id="chat-send-form" class="p-2 border-top d-flex gap-2" action="{{ route('messages.store', $conversation) }}" method="POST">
    @csrf
    <input type="text" name="content" id="chat-input" class="form-control" placeholder="{{ __('Write a message...') }}" required autocomplete="off">
    <button type="submit" class="btn btn-primary"><i class="bi bi-send" aria-hidden="true"></i></button>
</form>
