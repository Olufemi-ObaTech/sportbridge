<x-dashboard-layout title="{{ __('Applicants') }}">
    <div class="mb-3">
        <h1 class="h5 mb-0">{{ __('Applicants for :title', ['title' => $jobPost->title]) }}</h1>
        <a href="{{ route('jobs.show', $jobPost) }}" class="small">{{ __('View job posting') }}</a>
    </div>

    @if ($applications->isEmpty())
        <x-empty-state icon="bi-people" :title="__('No applications yet.')" />
    @else
        <div class="table-responsive d-none d-md-block">
            <table class="table align-middle">
                <thead>
                    <tr>
                        <th>{{ __('Coach') }}</th>
                        <th>{{ __('Experience') }}</th>
                        <th>{{ __('Status') }}</th>
                        <th>{{ __('CV') }}</th>
                        <th class="text-end">{{ __('Actions') }}</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($applications as $application)
                        @include('academy.jobs.partials.applicant-row', ['application' => $application, 'statusRoute' => $statusRoute ?? 'academy.applications.status'])
                    @endforeach
                </tbody>
            </table>
        </div>

        <div class="d-md-none">
            @foreach ($applications as $application)
                <div class="card mb-2">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <span class="fw-semibold">{{ $application->coachProfile->full_name }}</span>
                            <span class="badge text-bg-{{ match($application->status) { 'hired' => 'success', 'shortlisted' => 'info', 'rejected' => 'danger', default => 'secondary' } }}">
                                {{ __(ucfirst($application->status)) }}
                            </span>
                        </div>
                        <div class="small text-muted">{{ $application->coachProfile->experience_years }} {{ __('yrs experience') }}</div>
                        <div class="mt-2 d-flex flex-wrap gap-1">
                            @include('academy.jobs.partials.applicant-actions', ['application' => $application, 'statusRoute' => $statusRoute ?? 'academy.applications.status'])
                        </div>
                    </div>
                </div>
            @endforeach
        </div>

        <div class="mt-3">{{ $applications->links() }}</div>
    @endif
</x-dashboard-layout>
