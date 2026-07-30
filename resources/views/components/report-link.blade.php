@props(['user'])

@if ($user && (! auth()->check() || auth()->id() !== $user->id) && ! $user->isSuperAdmin())
    <a href="{{ route('reports.create', $user) }}" {{ $attributes->merge(['class' => 'btn btn-outline-danger']) }}>
        <i class="bi bi-flag me-1" aria-hidden="true"></i>{{ __('Report') }}
    </a>
@endif
