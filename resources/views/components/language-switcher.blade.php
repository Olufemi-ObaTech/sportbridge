@props(['variant' => 'light'])

@php
    $languages = [
        'en' => 'English',
        'fr' => 'Français',
        'pt' => 'Português',
        'ar' => 'العربية',
        'es' => 'Español',
    ];
    $current = app()->getLocale();
@endphp

<div class="dropdown">
    <button class="btn btn-sm {{ $variant === 'dark' ? 'btn-outline-light' : 'btn-outline-secondary' }} dropdown-toggle d-inline-flex align-items-center gap-1"
            type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="{{ __('Language') }}">
        <i class="bi bi-globe2" aria-hidden="true"></i>
        <span class="text-uppercase">{{ $current }}</span>
    </button>
    <ul class="dropdown-menu dropdown-menu-end">
        @foreach ($languages as $code => $label)
            <li>
                <a class="dropdown-item d-flex align-items-center justify-content-between{{ $current === $code ? ' active' : '' }}"
                   href="{{ route('locale.update', $code) }}">
                    {{ $label }}
                    @if ($current === $code)
                        <i class="bi bi-check-lg" aria-hidden="true"></i>
                    @endif
                </a>
            </li>
        @endforeach
    </ul>
</div>
