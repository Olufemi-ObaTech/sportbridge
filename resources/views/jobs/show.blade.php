@push('meta')
    <meta property="og:type" content="article">
    <meta property="og:title" content="{{ $jobPost->title }} - {{ $jobPost->posterName }}">
    <meta property="og:description" content="{{ Str::limit(strip_tags($jobPost->description), 150) }}">
@endpush

<x-app-layout>
    <div class="row g-4">
        <div class="col-12 col-lg-8">
            <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                <div>
                    <h1 class="h4 mb-1">{{ $jobPost->title }}</h1>
                    <p class="text-muted mb-0">
                        @if ($jobPost->academy)
                            <a href="{{ route('academy.show', $jobPost->academy) }}" class="text-decoration-none">{{ $jobPost->posterName }}</a>
                        @else
                            {{ $jobPost->posterName }}
                        @endif
                        &middot; {{ $jobPost->location }}
                    </p>
                </div>
                <span class="badge text-bg-{{ $jobPost->status === 'open' ? 'success' : 'secondary' }}">{{ __(ucfirst($jobPost->status)) }}</span>
            </div>

            <div class="d-flex flex-wrap gap-2 mb-3">
                <span class="badge text-bg-primary">{{ __(ucfirst($jobPost->sport)) }}</span>
                <span class="badge text-bg-light border">{{ __(ucfirst(str_replace('_', ' ', $jobPost->role_type))) }}</span>
                <span class="badge text-bg-light border">{{ __(ucfirst(str_replace('_', ' ', $jobPost->contract_type))) }}</span>
                @if ($jobPost->salary_min || $jobPost->salary_max)
                    <span class="badge text-bg-light border">{{ $jobPost->currency }} {{ number_format($jobPost->salary_min) }}–{{ number_format($jobPost->salary_max) }}</span>
                @endif
            </div>

            <div class="card mb-3">
                <div class="card-body">
                    <h2 class="h6">{{ __('Description') }}</h2>
                    <p style="white-space: pre-line;">{{ $jobPost->description }}</p>

                    @if ($jobPost->requirements)
                        <h2 class="h6 mt-3">{{ __('Requirements') }}</h2>
                        <p style="white-space: pre-line;" class="mb-0">{{ $jobPost->requirements }}</p>
                    @endif
                </div>
            </div>

            <p class="small text-muted">{{ __('Application deadline') }}: {{ $jobPost->application_deadline->format('F j, Y') }}</p>
        </div>

        <div class="col-12 col-lg-4">
            <div class="card">
                <div class="card-body">
                    @auth
                        @if (auth()->user()->role === 'coach' && $jobPost->status === 'open')
                            <button type="button" class="btn btn-primary w-100" data-bs-toggle="modal" data-bs-target="#applyModal">
                                {{ __('Apply Now') }}
                            </button>
                        @elseif (auth()->user()->can('manageApplications', $jobPost))
                            <a href="{{ route(auth()->user()->role === 'academy' ? 'academy.jobs.applicants' : 'jobs.mine.applicants', $jobPost) }}" class="btn btn-outline-primary w-100">
                                {{ __('View Applicants') }} ({{ $jobPost->applications_count }})
                            </a>
                        @endif
                    @else
                        <a href="{{ route('login') }}" class="btn btn-primary w-100">{{ __('Log in to apply') }}</a>
                    @endauth
                </div>
            </div>
        </div>
    </div>

    @auth
        @if (auth()->user()->role === 'coach' && $jobPost->status === 'open')
            <x-modal name="applyModal">
                <form method="POST" action="{{ route('coach.jobs.apply', $jobPost) }}" enctype="multipart/form-data">
                    @csrf
                    <div class="modal-header">
                        <h2 class="modal-title h5">{{ __('Apply for :title', ['title' => $jobPost->title]) }}</h2>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="{{ __('Close') }}"></button>
                    </div>
                    <div class="modal-body">
                        <x-input-label for="cover_letter" :value="__('Cover Letter')" />
                        <textarea id="cover_letter" name="cover_letter" rows="6" class="form-control" required></textarea>
                        <x-input-error :messages="$errors->get('cover_letter')" />

                        <div class="mt-3">
                            <x-input-label for="apply-cv" :value="__('CV (optional - uses your profile CV otherwise)')" />
                            <input id="apply-cv" name="cv" type="file" accept=".pdf,.docx" class="form-control">
                            <x-input-error :messages="$errors->get('cv')" />
                        </div>
                    </div>
                    <div class="modal-footer">
                        <x-secondary-button data-bs-dismiss="modal">{{ __('Cancel') }}</x-secondary-button>
                        <x-primary-button>{{ __('Submit Application') }}</x-primary-button>
                    </div>
                </form>
            </x-modal>
        @endif
    @endauth
</x-app-layout>
