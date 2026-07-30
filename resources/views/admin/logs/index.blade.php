<x-dashboard-layout title="{{ __('Activity Log') }}">
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h1 class="h5 mb-0">{{ __('Activity Log') }}</h1>
        <a href="{{ route('admin.logs.export', request()->query()) }}" class="btn btn-outline-secondary btn-sm">
            <i class="bi bi-download me-1" aria-hidden="true"></i>{{ __('Export CSV') }}
        </a>
    </div>

    <form method="GET" class="mb-3">
        <select name="action" class="form-select form-select-sm" style="max-width: 240px;" data-auto-submit>
            <option value="">{{ __('All actions') }}</option>
            @foreach (['approve', 'deny', 'suspend', 'reinstate', 'delete', 'verify', 'dismiss_report', 'report_actioned'] as $action)
                <option value="{{ $action }}" @selected(request('action') === $action)>{{ __(ucfirst(str_replace('_', ' ', $action))) }}</option>
            @endforeach
        </select>
    </form>

    <div class="table-responsive">
        <table class="table align-middle table-sm">
            <thead>
                <tr>
                    <th>{{ __('Date') }}</th>
                    <th>{{ __('Admin') }}</th>
                    <th>{{ __('Action') }}</th>
                    <th>{{ __('Target') }}</th>
                    <th>{{ __('Reason') }}</th>
                    <th>{{ __('IP') }}</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($logs as $log)
                    <tr>
                        <td class="small">{{ $log->created_at->format('M j, Y g:ia') }}</td>
                        <td>{{ $log->admin?->name }}</td>
                        <td><span class="badge text-bg-light border">{{ ucfirst($log->action) }}</span></td>
                        <td>{{ $log->targetUser?->name }}</td>
                        <td class="small">{{ $log->reason }}</td>
                        <td class="small">{{ $log->ip_address }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <div class="mt-3">{{ $logs->links() }}</div>
</x-dashboard-layout>
