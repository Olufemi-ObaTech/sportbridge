<x-app-layout>
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h1 class="h4 mb-0">{{ __('Job Board') }}</h1>
        <button type="button" class="btn btn-outline-secondary d-lg-none" data-bs-toggle="offcanvas" data-bs-target="#jobFilters">
            <i class="bi bi-funnel me-1" aria-hidden="true"></i>{{ __('Filters') }}
        </button>
    </div>

    <div class="row g-4">
        <div class="col-lg-3 d-none d-lg-block">
            <div class="card p-3 sticky-top" style="top: 80px;">
                @include('jobs.partials.filter-form')
            </div>
        </div>

        <div class="offcanvas offcanvas-bottom d-lg-none" tabindex="-1" id="jobFilters">
            <div class="offcanvas-header">
                <h2 class="offcanvas-title h6">{{ __('Filters') }}</h2>
                <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="{{ __('Close') }}"></button>
            </div>
            <div class="offcanvas-body">
                @include('jobs.partials.filter-form')
            </div>
        </div>

        <div class="col-12 col-lg-9">
            @if ($jobs->isEmpty())
                <x-empty-state icon="bi-briefcase" :title="__('No open jobs match your filters.')" />
            @else
                <div class="row row-cols-1 row-cols-md-2 g-3">
                    @foreach ($jobs as $job)
                        <div class="col">
                            <div class="card h-100">
                                <div class="card-body">
                                    <h2 class="h6 mb-1"><a href="{{ route('jobs.show', $job) }}" class="text-decoration-none">{{ $job->title }}</a></h2>
                                    <p class="small text-muted mb-2">{{ $job->posterName }} &middot; {{ $job->location }}</p>
                                    <div class="d-flex flex-wrap gap-1 mb-2">
                                        <span class="badge text-bg-primary">{{ __(ucfirst($job->sport)) }}</span>
                                        <span class="badge text-bg-light border">{{ __(ucfirst(str_replace('_', ' ', $job->contract_type))) }}</span>
                                        <span class="badge text-bg-light border">{{ __(ucfirst(str_replace('_', ' ', $job->role_type))) }}</span>
                                    </div>
                                    <p class="small text-muted mb-0">{{ __('Deadline') }}: {{ $job->application_deadline->format('M j, Y') }}</p>
                                </div>
                            </div>
                        </div>
                    @endforeach
                </div>

                <div class="mt-4">{{ $jobs->links() }}</div>
            @endif
        </div>
    </div>
</x-app-layout>
