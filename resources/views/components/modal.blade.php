@props(['name', 'maxWidth' => 'lg'])

@php
    $maxWidthClass = match ($maxWidth) {
        'sm' => 'modal-sm',
        'lg' => 'modal-lg',
        'xl', '2xl' => 'modal-xl',
        default => '',
    };
@endphp

<div class="modal fade" id="{{ $name }}" tabindex="-1" aria-hidden="true" aria-labelledby="{{ $name }}-label">
    <div class="modal-dialog modal-dialog-centered {{ $maxWidthClass }}">
        <div class="modal-content">
            {{ $slot }}
        </div>
    </div>
</div>
