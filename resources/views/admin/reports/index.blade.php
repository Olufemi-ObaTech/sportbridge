<x-dashboard-layout title="{{ __('Reports') }}">
    <h1 class="h5 mb-3">{{ __('Reports') }}</h1>

    <form method="GET" class="mb-3">
        <select name="status" class="form-select form-select-sm" style="max-width: 220px;" data-auto-submit>
            @foreach (['pending' => __('Pending review'), 'dismissed' => __('Dismissed'), 'actioned' => __('Actioned'), '' => __('All')] as $value => $label)
                <option value="{{ $value }}" @selected($status === $value)>{{ $label }}</option>
            @endforeach
        </select>
    </form>

    <div class="table-responsive">
        <table class="table align-middle">
            <thead>
                <tr>
                    <th>{{ __('Date') }}</th>
                    <th>{{ __('Reported user') }}</th>
                    <th>{{ __('Open complaints') }}</th>
                    <th>{{ __('Reporter') }}</th>
                    <th>{{ __('Reason') }}</th>
                    <th>{{ __('Details') }}</th>
                    <th>{{ __('Status') }}</th>
                    <th class="text-end">{{ __('Actions') }}</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($reports as $report)
                    <tr>
                        <td class="small">{{ $report->created_at->format('M j, Y g:ia') }}</td>
                        <td>
                            {{ $report->reportedUser?->name }}
                            <div class="small text-muted">{{ __(ucfirst(str_replace('_', ' ', (string) $report->reportedUser?->role))) }}</div>
                        </td>
                        <td>
                            @php $count = $reportCounts[$report->reported_user_id] ?? 0; @endphp
                            @if ($count > 0)
                                <span class="badge text-bg-{{ $count > 1 ? 'warning' : 'light border' }}">{{ $count }} {{ __('open') }}</span>
                            @else
                                &mdash;
                            @endif
                        </td>
                        <td>{{ $report->reporter?->name }}</td>
                        <td><span class="badge text-bg-light border">{{ __(\App\Models\Report::REASONS[$report->reason] ?? $report->reason) }}</span></td>
                        <td class="small" style="max-width: 260px;">{{ Str::limit($report->details, 140) }}</td>
                        <td>
                            <span class="badge text-bg-{{ match($report->status) {
                                'pending' => 'secondary',
                                'dismissed' => 'light border',
                                'actioned' => 'success',
                                default => 'light border',
                            } }}">{{ ucfirst($report->status) }}</span>
                        </td>
                        <td class="text-end">
                            @if ($report->status === 'pending')
                                <div class="d-flex gap-1 justify-content-end flex-wrap">
                                    <a href="{{ route('admin.users.index', ['q' => $report->reportedUser?->email]) }}" class="btn btn-sm btn-outline-secondary">{{ __('View user') }}</a>
                                    <form method="POST" action="{{ route('admin.reports.dismiss', $report) }}">
                                        @csrf
                                        <button type="submit" class="btn btn-sm btn-outline-secondary">{{ __('Dismiss') }}</button>
                                    </form>
                                    <form method="POST" action="{{ route('admin.reports.actioned', $report) }}">
                                        @csrf
                                        <button type="submit" class="btn btn-sm btn-outline-success" data-confirm="{{ __('Mark all open reports against this user as actioned?') }}">{{ __('Mark actioned') }}</button>
                                    </form>
                                </div>
                            @else
                                <span class="small text-muted">{{ $report->reviewer?->name }}</span>
                            @endif
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <div class="mt-3">{{ $reports->links() }}</div>
</x-dashboard-layout>
