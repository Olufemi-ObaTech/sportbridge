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
                    <canvas id="registrationsChart" height="180" role="img" aria-label="{{ __('Weekly registrations line chart') }}"></canvas>
                </div>
            </div>
        </div>
        <div class="col-12 col-lg-5">
            <div class="card h-100">
                <div class="card-body">
                    <h2 class="h6">{{ __('Users by role') }}</h2>
                    <canvas id="rolesChart" height="180" role="img" aria-label="{{ __('Users by role donut chart') }}"></canvas>
                </div>
            </div>
        </div>
    </div>

    <div class="row g-4">
        <div class="col-12 col-lg-6">
            <div class="card h-100">
                <div class="card-body">
                    <h2 class="h6">{{ __('Players by sport') }}</h2>
                    <canvas id="playersSportChart" height="160" role="img" aria-label="{{ __('Players by sport donut chart') }}"></canvas>
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
                    <canvas id="jobsSportChart" height="160" role="img" aria-label="{{ __('Job posts by sport donut chart') }}"></canvas>
                    <p class="text-muted small mt-2 mb-0">
                        {{ __(':football football · :basketball basketball', ['football' => number_format($footballJobs), 'basketball' => number_format($basketballJobs)]) }}
                    </p>
                </div>
            </div>
        </div>
    </div>

    @push('scripts')
        <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js" nonce="{{ request()->attributes->get('csp_nonce') }}"></script>
        <script nonce="{{ request()->attributes->get('csp_nonce') }}">
            const chartFont = { family: "'Inter', sans-serif", size: 12 };
            Chart.defaults.font = chartFont;
            Chart.defaults.color = '#5B6472';

            new Chart(document.getElementById('registrationsChart'), {
                type: 'line',
                data: {
                    labels: @json($weeklyRegistrations->pluck('label')),
                    datasets: [{
                        label: @json(__('New users')),
                        data: @json($weeklyRegistrations->pluck('count')),
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

            new Chart(document.getElementById('rolesChart'), {
                type: 'doughnut',
                data: {
                    labels: @json($roleCounts->keys()->map(fn ($r) => ucfirst(str_replace('_', ' ', $r)))),
                    datasets: [{
                        data: @json(array_values($roleCounts->toArray())),
                        backgroundColor: ['#1B54D6', '#38D6FF', '#F5B301', '#0B2B6B', '#C98A0A'],
                    }],
                },
                options: { plugins: { legend: { position: 'bottom' } } },
            });

            new Chart(document.getElementById('playersSportChart'), {
                type: 'doughnut',
                data: {
                    labels: [@json(__('Football')), @json(__('Basketball'))],
                    datasets: [{
                        data: [{{ $footballPlayers }}, {{ $basketballPlayers }}],
                        backgroundColor: ['#1B54D6', '#F5B301'],
                    }],
                },
                options: { plugins: { legend: { position: 'bottom' } } },
            });

            new Chart(document.getElementById('jobsSportChart'), {
                type: 'doughnut',
                data: {
                    labels: [@json(__('Football')), @json(__('Basketball'))],
                    datasets: [{
                        data: [{{ $footballJobs }}, {{ $basketballJobs }}],
                        backgroundColor: ['#1B54D6', '#F5B301'],
                    }],
                },
                options: { plugins: { legend: { position: 'bottom' } } },
            });
        </script>
    @endpush
</x-dashboard-layout>
