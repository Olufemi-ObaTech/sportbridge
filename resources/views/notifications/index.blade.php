<x-app-layout>
    <div class="container py-4" style="max-width: 720px;">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h1 class="h4 mb-0">{{ __('Notifications') }}</h1>
            @if ($notifications->contains(fn ($n) => is_null($n->read_at)))
                <form method="POST" action="{{ route('notifications.mark-all-read') }}">
                    @csrf
                    <button type="submit" class="btn btn-sm btn-outline-secondary">{{ __('Mark all read') }}</button>
                </form>
            @endif
        </div>

        <div class="card">
            <div class="list-group list-group-flush">
                @forelse ($notifications as $notification)
                    @php $row = $presented[$notification->id]; @endphp
                    <form method="POST" action="{{ route('notifications.read', $notification->id) }}" class="list-group-item list-group-item-action d-flex gap-3 align-items-start {{ $notification->read_at ? '' : 'bg-light' }}">
                        @csrf
                        <i class="bi {{ $row['icon'] }} fs-5 mt-1" aria-hidden="true"></i>
                        <button type="submit" class="btn btn-link text-start text-decoration-none flex-grow-1 p-0 text-body">
                            {{ $row['message'] }}
                            <span class="d-block text-muted small mt-1">{{ $notification->created_at->diffForHumans() }}</span>
                        </button>
                        @if (! $notification->read_at)
                            <span class="badge bg-primary rounded-pill align-self-center">{{ __('New') }}</span>
                        @endif
                    </form>
                @empty
                    <div class="p-5 text-center">
                        <x-empty-state icon="bi-bell" :title="__(\"You're all caught up.\")" />
                    </div>
                @endforelse
            </div>
        </div>

        <div class="mt-3">
            {{ $notifications->links() }}
        </div>
    </div>
</x-app-layout>
