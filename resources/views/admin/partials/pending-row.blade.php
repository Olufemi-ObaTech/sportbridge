<tr>
    <td>{{ $user->name }}</td>
    <td><span class="badge text-bg-light border">{{ ucfirst($user->role) }}</span></td>
    <td class="small">{{ $user->created_at->format('M j, Y') }}</td>
    <td>
        @php $profile = $user->academyProfile ?? $user->agentProfile ?? $user->coachProfile; @endphp
        @if ($user->role === 'academy' && $profile?->license_doc_url)
            <a href="{{ URL::temporarySignedRoute('documents.academy-license', now()->addMinutes(10), ['academy' => $profile->id]) }}" target="_blank" rel="noopener">{{ __('License') }}</a>
        @elseif ($user->role === 'agent' && $profile?->id_doc_url)
            <a href="{{ URL::temporarySignedRoute('documents.agent-id', now()->addMinutes(10), ['agent' => $profile->id]) }}" target="_blank" rel="noopener">{{ __('ID Document') }}</a>
        @elseif ($user->role === 'coach' && $profile?->cv_url)
            <a href="{{ URL::temporarySignedRoute('documents.coach-cv', now()->addMinutes(10), ['coach' => $profile->id]) }}" target="_blank" rel="noopener">{{ __('CV') }}</a>
        @else
            &mdash;
        @endif
    </td>
    <td class="text-end">
        <div class="d-flex gap-1 justify-content-end flex-wrap">
            @include('admin.partials.pending-actions')
        </div>
    </td>
</tr>
