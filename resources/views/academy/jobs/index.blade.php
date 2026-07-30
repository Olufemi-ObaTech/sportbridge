@php
    $createRoute = $createRoute ?? 'academy.jobs.create';
    $editRoute = $editRoute ?? 'academy.jobs.edit';
    $closeRoute = $closeRoute ?? 'academy.jobs.close';
    $applicantsRoute = $applicantsRoute ?? 'academy.jobs.applicants';
@endphp
<x-dashboard-layout title="{{ __('Job Posts') }}">
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h1 class="h5 mb-0">{{ __('Job Posts') }}</h1>
        <a href="{{ route($createRoute) }}" class="btn btn-primary">
            <i class="bi bi-plus-lg me-1" aria-hidden="true"></i>{{ __('Post a Job') }}
        </a>
    </div>

    @if ($jobs->isEmpty())
        <x-empty-state icon="bi-briefcase" :title="__('No jobs posted yet.')" :action="route($createRoute)" :actionLabel="__('Post your first job')" />
    @else
        <div class="table-responsive d-none d-md-block">
            <table class="table align-middle">
                <thead>
                    <tr>
                        <th>{{ __('Title') }}</th>
                        <th>{{ __('Sport') }}</th>
                        <th>{{ __('Status') }}</th>
                        <th>{{ __('Applicants') }}</th>
                        <th>{{ __('Deadline') }}</th>
                        <th class="text-end">{{ __('Actions') }}</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($jobs as $job)
                        <tr>
                            <td><a href="{{ route('jobs.show', $job) }}" class="text-decoration-none">{{ $job->title }}</a></td>
                            <td>{{ __(ucfirst($job->sport)) }}</td>
                            <td><span class="badge text-bg-{{ $job->status === 'open' ? 'success' : 'secondary' }}">{{ __(ucfirst($job->status)) }}</span></td>
                            <td><a href="{{ route($applicantsRoute, $job) }}">{{ $job->applications_count }}</a></td>
                            <td>{{ $job->application_deadline->format('M j, Y') }}</td>
                            <td class="text-end">
                                <a href="{{ route($editRoute, $job) }}" class="btn btn-sm btn-outline-secondary">{{ __('Edit') }}</a>
                                @if ($job->status === 'open')
                                    <form method="POST" action="{{ route($closeRoute, $job) }}" class="d-inline">
                                        @csrf
                                        <button type="submit" class="btn btn-sm btn-outline-warning" data-confirm="{{ __('Close this job to new applications?') }}">{{ __('Close') }}</button>
                                    </form>
                                @endif
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <div class="d-md-none">
            @foreach ($jobs as $job)
                <div class="card mb-2">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <a href="{{ route('jobs.show', $job) }}" class="text-decoration-none fw-semibold">{{ $job->title }}</a>
                            <span class="badge text-bg-{{ $job->status === 'open' ? 'success' : 'secondary' }}">{{ __(ucfirst($job->status)) }}</span>
                        </div>
                        <div class="small text-muted mt-1">
                            {{ __(ucfirst($job->sport)) }} &middot;
                            <a href="{{ route($applicantsRoute, $job) }}">{{ __(':count applicants', ['count' => $job->applications_count]) }}</a>
                            &middot; {{ __('Deadline') }} {{ $job->application_deadline->format('M j, Y') }}
                        </div>
                        <a href="{{ route($editRoute, $job) }}" class="btn btn-sm btn-outline-secondary mt-2">{{ __('Edit') }}</a>
                    </div>
                </div>
            @endforeach
        </div>

        <div class="mt-3">{{ $jobs->links() }}</div>
    @endif
</x-dashboard-layout>
