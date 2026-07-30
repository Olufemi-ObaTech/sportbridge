<x-dashboard-layout title="{{ __('Pending Queue') }}">
    <div class="row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-3 mb-4">
        <div class="col">
            <div class="card h-100 p-3">
                <div class="text-muted small">{{ __('Total Users') }}</div>
                <div class="fs-3 fw-bold">{{ $stats['total_users'] }}</div>
            </div>
        </div>
        <div class="col">
            <div class="card h-100 p-3">
                <div class="text-muted small">{{ __('Pending Review') }}</div>
                <div class="fs-3 fw-bold">{{ $stats['pending_count'] }}</div>
            </div>
        </div>
        <div class="col">
            <div class="card h-100 p-3">
                <div class="text-muted small">{{ __('New This Week') }}</div>
                <div class="fs-3 fw-bold">{{ $stats['new_this_week'] }}</div>
            </div>
        </div>
        <div class="col">
            <div class="card h-100 p-3">
                <div class="text-muted small mb-2">{{ __('By Role') }}</div>
                @foreach ($stats['by_role'] as $role => $count)
                    <div class="d-flex justify-content-between small">
                        <span>{{ __(ucfirst(str_replace('_', ' ', $role))) }}</span><span class="fw-semibold">{{ $count }}</span>
                    </div>
                @endforeach
            </div>
        </div>
    </div>

    <div class="d-flex justify-content-between align-items-center mb-3">
        <h1 class="h5 mb-0">{{ __('Pending Registrations') }}</h1>
        <form method="GET" class="d-flex gap-2">
            <select name="role" class="form-select form-select-sm" data-auto-submit>
                <option value="">{{ __('All roles') }}</option>
                <option value="academy" @selected(request('role') === 'academy')>{{ __('Academy') }}</option>
                <option value="agent" @selected(request('role') === 'agent')>{{ __('Agent') }}</option>
                <option value="coach" @selected(request('role') === 'coach')>{{ __('Coach') }}</option>
                <option value="player" @selected(request('role') === 'player')>{{ __('Player') }}</option>
            </select>
        </form>
    </div>

    @if ($pending->isEmpty())
        <x-empty-state icon="bi-check2-circle" :title="__('No pending accounts. All caught up!')" />
    @else
        <div class="table-responsive d-none d-md-block">
            <table class="table align-middle">
                <thead>
                    <tr>
                        <th>{{ __('Name') }}</th>
                        <th>{{ __('Role') }}</th>
                        <th>{{ __('Registered') }}</th>
                        <th>{{ __('Documents') }}</th>
                        <th class="text-end">{{ __('Actions') }}</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($pending as $user)
                        @include('admin.partials.pending-row', ['user' => $user])
                    @endforeach
                </tbody>
            </table>
        </div>

        <div class="d-md-none">
            @foreach ($pending as $user)
                <div class="card mb-2">
                    <div class="card-body">
                        <div class="fw-semibold">{{ $user->name }}</div>
                        <div class="small text-muted mb-2">{{ __(ucfirst($user->role)) }} &middot; {{ $user->created_at->diffForHumans() }}</div>
                        <div class="d-flex flex-wrap gap-1">
                            @include('admin.partials.pending-actions', ['user' => $user])
                        </div>
                    </div>
                </div>
            @endforeach
        </div>

        <div class="mt-3">{{ $pending->links() }}</div>
    @endif
</x-dashboard-layout>
