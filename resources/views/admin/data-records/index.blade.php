<x-dashboard-layout title="{{ __('Data Records') }}">
    <h1 class="h5 mb-1">{{ __('Data Records') }}</h1>
    <p class="text-muted small mb-4">
        {{ __('A separate database holding a snapshot of every user record, kept split into football and basketball tables. Rebuild it on demand - it is not updated in real time.') }}
    </p>

    <div class="mb-3">
        <form method="POST" action="{{ route('admin.data-records.sync') }}">
            @csrf
            <button type="submit" class="btn btn-primary btn-sm">
                <i class="bi bi-arrow-repeat me-1" aria-hidden="true"></i>{{ __('Sync now') }}
            </button>
        </form>
        <p class="small text-muted mt-2 mb-0">
            {{ __('Last synced') }}:
            {{ $lastSyncedAt ? \Illuminate\Support\Carbon::parse($lastSyncedAt)->format('M j, Y g:ia') : __('never') }}
        </p>
    </div>

    <div class="row g-3">
        <div class="col-12 col-md-6">
            <div class="card h-100">
                <div class="card-body">
                    <h2 class="h6">{{ __('Football') }}</h2>
                    <p class="fs-3 fw-bold mb-2">{{ number_format($footballCount) }}</p>
                    <a href="{{ route('admin.data-records.export', 'football') }}" class="btn btn-sm btn-outline-secondary">
                        <i class="bi bi-download me-1" aria-hidden="true"></i>{{ __('Export CSV') }}
                    </a>
                </div>
            </div>
        </div>
        <div class="col-12 col-md-6">
            <div class="card h-100">
                <div class="card-body">
                    <h2 class="h6">{{ __('Basketball') }}</h2>
                    <p class="fs-3 fw-bold mb-2">{{ number_format($basketballCount) }}</p>
                    <a href="{{ route('admin.data-records.export', 'basketball') }}" class="btn btn-sm btn-outline-secondary">
                        <i class="bi bi-download me-1" aria-hidden="true"></i>{{ __('Export CSV') }}
                    </a>
                </div>
            </div>
        </div>
    </div>
</x-dashboard-layout>
