@props(['size' => '28'])

<span {{ $attributes->merge(['class' => 'd-inline-flex align-items-center gap-2']) }}>
    <img src="{{ asset('img/logo-mark.svg') }}" alt="" width="{{ $size }}" height="{{ $size }}" style="width: {{ $size }}px; height: {{ $size }}px;">
    <span class="fw-bold" style="font-family: var(--fc-font-heading);">Sport<span class="fc-gradient-text">Bridge</span></span>
</span>
