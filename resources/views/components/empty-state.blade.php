@props(['icon' => 'bi-inbox', 'title', 'action' => null, 'actionLabel' => null])

<div class="fc-empty-state">
    <i class="bi {{ $icon }}" aria-hidden="true"></i>
    <p class="mt-3 mb-3">{{ $title }}</p>
    @if ($action && $actionLabel)
        <a href="{{ $action }}" class="btn btn-primary">{{ $actionLabel }}</a>
    @endif
    {{ $slot ?? '' }}
</div>
