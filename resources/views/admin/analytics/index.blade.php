<x-dashboard-layout title="{{ __('Analytics') }}">
    <h1 class="h5 mb-1">{{ __('Analytics') }}</h1>
    <p class="text-muted small mb-4">{{ __('Live counts across both the football and basketball databases.') }}</p>

    <div class="row row-cols-2 row-cols-md-4 g-3 mb-4">
        <div class="col">
            <div class="card h-100 p-3">
                <div class="text-muted small">{{ __('Total Users') }}</div>
                <div class="fs-3 fw-bold">{{ number_format($totalUsers) }}</div>
            </div>
        </div>
        <div class="col">
            <div class="card h-100 p-3">
                <div class="text-muted small">{{ __('Active') }}</div>
                <div class="fs-3 fw-bold text-success">{{ number_format($statusCounts['active'] ?? 0) }}</div>
            </div>
        </div>
        <div class="col">
            <div class="card h-100 p-3">
                <div class="text-muted small">{{ __('Pending Review') }}</div>
                <div class="fs-3 fw-bold text-warning">{{ number_format($statusCounts['pending'] ?? 0) }}</div>
            </div>
        </div>
        <div class="col">
            <div class="card h-100 p-3">
                <div class="text-muted small">{{ __('Suspended') }}</div>
                <div class="fs-3 fw-bold text-danger">{{ number_format($statusCounts['suspended'] ?? 0) }}</div>
            </div>
        </div>
    </div>

    <div class="row g-4 mb-4">
        <div class="col-12 col-lg-7">
            <div class="card h-100">
                <div class="card-body">
                    <h2 class="h6">{{ __('Registrations — last 12 weeks') }}</h2>
                        <canvas id="registrationsChart" height="180" role="img" aria-label="{{ __('Weekly registrations line chart') }}" data-labels="{{ e(json_encode($weeklyRegistrations->pluck('label')->values())) }}" data-values="{{ e(json_encode($weeklyRegistrations->pluck('count')->values())) }}" data-series-label="{{ e(__('New users')) }}"></canvas>
                </div>
            </div>
        </div>
        <div class="col-12 col-lg-5">
            <div class="card h-100">
                <div class="card-body">
                    <h2 class="h6">{{ __('Users by role') }}</h2>
                        <canvas id="rolesChart" height="180" role="img" aria-label="{{ __('Users by role donut chart') }}" data-labels="{{ e(json_encode($roleCounts->keys()->map(fn ($role) => ucfirst(str_replace('_', ' ', $role)))->values())) }}" data-values="{{ e(json_encode(array_values($roleCounts->toArray()))) }}"></canvas>
                </div>
            </div>
        </div>
    </div>

    <div class="row g-4">
        <div class="col-12 col-lg-6">
            <div class="card h-100">
                <div class="card-body">
                    <h2 class="h6">{{ __('Players by sport') }}</h2>
                        <canvas id="playersSportChart" height="160" role="img" aria-label="{{ __('Players by sport donut chart') }}" data-labels="{{ e(json_encode([__('Football'), __('Basketball')])) }}" data-values="{{ e(json_encode([$footballPlayers, $basketballPlayers])) }}"></canvas>
                    <p class="text-muted small mt-2 mb-0">
                        {{ __(':football football · :basketball basketball', ['football' => number_format($footballPlayers), 'basketball' => number_format($basketballPlayers)]) }}
                    </p>
                </div>
            </div>
        </div>
        <div class="col-12 col-lg-6">
            <div class="card h-100">
                <div class="card-body">
                    <h2 class="h6">{{ __('Job posts by sport') }}</h2>
                        <canvas id="jobsSportChart" height="160" role="img" aria-label="{{ __('Jobs by sport donut chart') }}" data-labels="{{ e(json_encode([__('Football'), __('Basketball')])) }}" data-values="{{ e(json_encode([$footballJobs, $basketballJobs])) }}"></canvas>
                    <p class="text-muted small mt-2 mb-0">
                        {{ __(':football football · :basketball basketball', ['football' => number_format($footballJobs), 'basketball' => number_format($basketballJobs)]) }}
                    </p>
                </div>
            </div>
        </div>
    </div>

    <section class="card mt-4" aria-labelledby="pending-accounts-title">
        <div class="card-body">
            <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <div>
                    <h2 id="pending-accounts-title" class="h6 mb-1">{{ __('Pending registrations') }}</h2>
                    <p class="text-muted small mb-0">{{ __('Every account waiting for review, approval or denial.') }}</p>
                </div>
                <span class="badge text-bg-warning">{{ number_format($pendingUsers->count()) }} {{ __('pending') }}</span>
            </div>
            @if ($pendingUsers->isEmpty())
                <x-empty-state icon="bi-check2-circle" :title="__('No pending registrations')" />
            @else
                <div class="table-responsive">
                    <table class="table align-middle mb-0">
                        <thead>
                            <tr>
                                <th>{{ __('Name') }}</th>
                                <th>{{ __('Role') }}</th>
                                <th>{{ __('Email') }}</th>
                                <th>{{ __('Registered') }}</th>
                                <th class="text-end">{{ __('Review') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach ($pendingUsers as $user)
                                <tr>
                                    <td class="fw-semibold">{{ $user->name }}</td>
                                    <td><span class="badge text-bg-light border">{{ match ($user->role) { 'academy' => __('Club / Academy'), 'agent' => __('Scout / Agent'), 'coach' => __('Coach'), 'player' => __('Player'), default => __(ucfirst(str_replace('_', ' ', $user->role))) } }}</span></td>
                                    <td class="text-muted">{{ $user->email }}</td>
                                    <td class="small text-muted">{{ $user->created_at->format('M j, Y') }}</td>
                                    <td class="text-end"><a href="{{ route('admin.moderation.pending') }}" class="btn btn-sm btn-outline-primary"><i class="bi bi-arrow-up-right me-1" aria-hidden="true"></i>{{ __('Open queue') }}</a></td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            @endif
        </div>
    </section>

    <section class="card mt-4" aria-labelledby="suspended-accounts-title">
        <div class="card-body">
            <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <div>
                    <h2 id="suspended-accounts-title" class="h6 mb-1">{{ __('Accounts under suspension') }}</h2>
                    <p class="text-muted small mb-0">{{ __('Review every suspended account and reinstate access when appropriate.') }}</p>
                </div>
                <span class="badge text-bg-danger">{{ number_format($suspendedUsers->count()) }} {{ __('suspended') }}</span>
            </div>
            @if ($suspendedUsers->isEmpty())
                <x-empty-state icon="bi-shield-check" :title="__('No suspended accounts')" />
            @else
                <div class="table-responsive">
                    <table class="table align-middle mb-0">
                        <thead>
                            <tr>
                                <th>{{ __('Name') }}</th>
                                <th>{{ __('Role') }}</th>
                                <th>{{ __('Email') }}</th>
                                <th>{{ __('Updated') }}</th>
                                <th class="text-end">{{ __('Action') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach ($suspendedUsers as $user)
                                <tr>
                                    <td class="fw-semibold">{{ $user->name }}</td>
                                    <td><span class="badge text-bg-light border">{{ match ($user->role) { 'academy' => __('Club / Academy'), 'agent' => __('Scout / Agent'), 'coach' => __('Coach'), 'player' => __('Player'), default => __(ucfirst(str_replace('_', ' ', $user->role))) } }}</span></td>
                                    <td class="text-muted">{{ $user->email }}</td>
                                    <td class="small text-muted">{{ $user->updated_at->format('M j, Y') }}</td>
                                    <td class="text-end">
                                        <form method="POST" action="{{ route('admin.moderation.reinstate', $user) }}">
                                            @csrf
                                            <button type="submit" class="btn btn-sm btn-outline-success"><i class="bi bi-unlock me-1" aria-hidden="true"></i>{{ __('Reinstate') }}</button>
                                        </form>
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            @endif
        </div>
    </section>

    @push('scripts')
        <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js" nonce="{{ request()->attributes->get('csp_nonce') }}"></script>
        <script nonce="{{ request()->attributes->get('csp_nonce') }}">
            const chartFont = { family: "'Inter', sans-serif", size: 12 };
            const chartLibrary = window.Chart;
            chartLibrary.defaults.font = chartFont;
            chartLibrary.defaults.color = '#5B6472';

            const chartData = (id) => {
                const canvas = document.getElementById(id);
                return {
                    canvas,
                    labels: JSON.parse(canvas.dataset.labels),
                    values: JSON.parse(canvas.dataset.values),
                };
            };

            const registrations = chartData('registrationsChart');
            new chartLibrary(registrations.canvas, {
                type: 'line',
                data: {
                    labels: registrations.labels,
                    datasets: [{
                        label: registrations.canvas.dataset.seriesLabel,
                        data: registrations.values,
                        borderColor: '#1B54D6',
                        backgroundColor: 'rgba(27, 84, 214, 0.12)',
                        fill: true,
                        tension: 0.3,
                        pointRadius: 3,
                    }],
                },
                options: {
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
                },
            });

            const roles = chartData('rolesChart');
            new chartLibrary(roles.canvas, {
                type: 'doughnut',
                data: {
                    labels: roles.labels,
                    datasets: [{
                        data: roles.values,
                        backgroundColor: ['#1B54D6', '#38D6FF', '#F5B301', '#0B2B6B', '#C98A0A'],
                    }],
                },
                options: { plugins: { legend: { position: 'bottom' } } },
            });

            const playerSports = chartData('playersSportChart');
            new chartLibrary(playerSports.canvas, {
                type: 'doughnut',
                data: {
                    labels: playerSports.labels,
                    datasets: [{
                        data: playerSports.values,
                        backgroundColor: ['#1B54D6', '#F5B301'],
                    }],
                },
                options: { plugins: { legend: { position: 'bottom' } } },
            });

            const jobSports = chartData('jobsSportChart');
            new chartLibrary(jobSports.canvas, {
                type: 'doughnut',
                data: {
                    labels: jobSports.labels,
                    datasets: [{
                        data: jobSports.values,
                        backgroundColor: ['#1B54D6', '#F5B301'],
                    }],
                },
                options: { plugins: { legend: { position: 'bottom' } } },
            });
        </script>
    @endpush
</x-dashboard-layout>
