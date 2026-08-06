@props(['status'])

@php
    $variant = match ($status) {
        'accepted', 'active', 'approved', 'granted' => 'success',
        'declined', 'denied', 'rejected', 'cancelled' => 'danger',
        'pending' => 'warning',
        default => 'secondary',
    };
@endphp

<span class="badge text-bg-{{ $variant }} text-capitalize">{{ __($status) }}</span>
