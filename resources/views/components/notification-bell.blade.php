@props(['variant' => 'light'])

@php
    $unread = auth()->user()->unreadNotifications()->count();
    $recent = auth()->user()->notifications()->latest()->take(8)->get();
@endphp

<div class="dropdown">
    <button class="btn btn-link nav-link position-relative p-2 text-decoration-none {{ $variant === 'dark' ? 'text-light' : '' }}" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="{{ __('Notifications') }}">
        <i class="bi bi-bell fs-5" aria-hidden="true"></i>
        @if ($unread > 0)
            <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style="font-size: 0.6rem;">
                {{ $unread > 9 ? '9+' : $unread }}
                <span class="visually-hidden">{{ __('unread notifications') }}</span>
            </span>
        @endif
    </button>
    <div class="dropdown-menu dropdown-menu-end shadow p-0" style="width: 320px; max-width: 90vw;">
        <div class="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
            <span class="fw-semibold small">{{ __('Notifications') }}</span>
            @if ($unread > 0)
                <form method="POST" action="{{ route('notifications.mark-all-read') }}">
                    @csrf
                    <button type="submit" class="btn btn-link btn-sm p-0 small">{{ __('Mark all read') }}</button>
                </form>
            @endif
        </div>
        <div style="max-height: 360px; overflow-y: auto;">
            @forelse ($recent as $notification)
                @php $presented = \App\Support\NotificationPresenter::present($notification); @endphp
                <form method="POST" action="{{ route('notifications.read', $notification->id) }}" class="d-block">
                    @csrf
                    <button type="submit" class="dropdown-item d-flex gap-2 align-items-start py-2 {{ $notification->read_at ? '' : 'bg-light' }}">
                        <i class="bi {{ $presented['icon'] }} mt-1" aria-hidden="true"></i>
                        <span class="small text-wrap text-start">
                            {{ $presented['message'] }}
                            <span class="d-block text-muted" style="font-size: 0.75rem;">{{ $notification->created_at->diffForHumans() }}</span>
                        </span>
                    </button>
                </form>
            @empty
                <p class="text-muted small text-center py-4 mb-0">{{ __("You're all caught up.") }}</p>
            @endforelse
        </div>
        <div class="text-center border-top py-2">
            <a href="{{ route('notifications.index') }}" class="small">{{ __('View all notifications') }}</a>
        </div>
    </div>
</div>
