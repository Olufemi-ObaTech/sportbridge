@props(['icon' => 'bi-exclamation-triangle-fill'])

<div {{ $attributes->merge(['class' => 'alert alert-warning d-flex gap-2 align-items-start']) }} role="alert">
    <i class="bi {{ $icon }} mt-1" aria-hidden="true"></i>
    <div class="small">{{ $slot }}</div>
</div>
