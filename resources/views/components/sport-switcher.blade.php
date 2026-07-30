@props(['variant' => 'light'])

@php
    $sports = [
        'football' => ['label' => 'Football', 'icon' => 'bi-dribbble'],
        'basketball' => ['label' => 'Basketball', 'icon' => 'bi-circle'],
    ];
    $current = session('sport', \App\Http\Middleware\SetSport::DEFAULT);
@endphp

<div class="dropdown">
    <button class="btn btn-sm {{ $variant === 'dark' ? 'btn-outline-light' : 'btn-outline-secondary' }} dropdown-toggle d-inline-flex align-items-center gap-1"
            type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="{{ __('Sport') }}">
        <i class="bi {{ $sports[$current]['icon'] }}" aria-hidden="true"></i>
        <span>{{ __($sports[$current]['label']) }}</span>
    </button>
    <ul class="dropdown-menu dropdown-menu-end">
        @foreach ($sports as $code => $sport)
            <li>
                <a class="dropdown-item d-flex align-items-center justify-content-between{{ $current === $code ? ' active' : '' }}"
                   href="{{ route('sport.update', $code) }}">
                    <span><i class="bi {{ $sport['icon'] }} me-1" aria-hidden="true"></i>{{ __($sport['label']) }}</span>
                    @if ($current === $code)
                        <i class="bi bi-check-lg" aria-hidden="true"></i>
                    @endif
                </a>
            </li>
        @endforeach
    </ul>
</div>
