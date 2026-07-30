@php $statusRoute = $statusRoute ?? 'academy.applications.status'; @endphp
@foreach (['shortlisted' => __('Shortlist'), 'hired' => __('Hire'), 'rejected' => __('Reject')] as $status => $label)
    @if ($application->status !== $status)
        <form method="POST" action="{{ route($statusRoute, $application) }}">
            @csrf
            @method('PUT')
            <input type="hidden" name="status" value="{{ $status }}">
            <button type="submit" class="btn btn-sm btn-outline-{{ $status === 'rejected' ? 'danger' : 'secondary' }}">
                {{ $label }}
            </button>
        </form>
    @endif
@endforeach
