@props(['photoUrl' => null, 'name', 'subtitle' => null, 'editRoute', 'viewRoute' => null])

<div class="card mb-4">
    <div class="card-body d-flex align-items-center gap-3 flex-wrap">
        <img src="{{ $photoUrl ? asset('storage/'.$photoUrl) : asset('img/default-avatar.svg') }}"
             alt="" class="rounded-circle flex-shrink-0" style="width: 64px; height: 64px; object-fit: cover;">
        <div class="flex-grow-1">
            <div class="fw-semibold">{{ $name }}</div>
            @if ($subtitle)
                <div class="small text-muted">{{ $subtitle }}</div>
            @endif
        </div>
        <div class="d-flex gap-2">
            @if ($viewRoute)
                <a href="{{ $viewRoute }}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-secondary">
                    <i class="bi bi-box-arrow-up-right me-1" aria-hidden="true"></i>{{ __('View') }}
                </a>
            @endif
            <a href="{{ route($editRoute) }}" class="btn btn-sm btn-primary">
                <i class="bi bi-pencil-square me-1" aria-hidden="true"></i>{{ __('Edit Profile') }}
            </a>
        </div>
    </div>
</div>
