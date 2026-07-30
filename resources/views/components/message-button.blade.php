@props(['user'])

@auth
    @if (auth()->id() !== $user->id)
        <form method="POST" action="{{ route('inbox.start', $user) }}" class="d-inline">
            @csrf
            <button type="submit" {{ $attributes->merge(['class' => 'btn btn-outline-primary']) }}>
                <i class="bi bi-chat-dots me-1" aria-hidden="true"></i>{{ __('Message') }}
            </button>
        </form>
    @endif
@else
    <a href="{{ route('login') }}" {{ $attributes->merge(['class' => 'btn btn-outline-primary']) }}>
        <i class="bi bi-chat-dots me-1" aria-hidden="true"></i>{{ __('Message') }}
    </a>
@endauth
