<tr>
    <td>{{ $application->coachProfile->full_name }}</td>
    <td>{{ $application->coachProfile->experience_years }} {{ __('yrs') }}</td>
    <td>
        <span class="badge text-bg-{{ match($application->status) { 'hired' => 'success', 'shortlisted' => 'info', 'rejected' => 'danger', default => 'secondary' } }}">
            {{ __(ucfirst($application->status)) }}
        </span>
    </td>
    <td>
        @if ($application->cv_url || $application->coachProfile->cv_url)
            <a href="{{ URL::temporarySignedRoute('documents.application-cv', now()->addMinutes(10), ['jobApplication' => $application->id]) }}" target="_blank" rel="noopener">
                {{ __('View CV') }}
            </a>
        @else
            &mdash;
        @endif
    </td>
    <td class="text-end">
        <div class="d-flex gap-1 justify-content-end flex-wrap">
            @include('academy.jobs.partials.applicant-actions', ['statusRoute' => $statusRoute ?? 'academy.applications.status'])
        </div>
    </td>
</tr>
