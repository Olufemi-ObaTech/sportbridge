<form method="POST" action="{{ route('admin.moderation.approve', $user) }}">
    @csrf
    <button type="submit" class="btn btn-sm btn-success" data-confirm="{{ __('Approve this account?') }}" data-confirm-variant="btn-success">
        {{ __('Approve') }}
    </button>
</form>

<button type="button" class="btn btn-sm btn-outline-danger" data-bs-toggle="modal" data-bs-target="#deny-modal-{{ $user->id }}">
    {{ __('Deny') }}
</button>

<x-modal name="deny-modal-{{ $user->id }}" maxWidth="md">
    <form method="POST" action="{{ route('admin.moderation.deny', $user) }}">
        @csrf
        <div class="modal-header">
            <h2 class="modal-title h5">{{ __('Deny :name', ['name' => $user->name]) }}</h2>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="{{ __('Close') }}"></button>
        </div>
        <div class="modal-body">
            <x-input-label for="deny-reason-{{ $user->id }}" :value="__('Reason (sent to the user)')" />
            <textarea id="deny-reason-{{ $user->id }}" name="reason" rows="3" class="form-control" required></textarea>
        </div>
        <div class="modal-footer">
            <x-secondary-button data-bs-dismiss="modal">{{ __('Cancel') }}</x-secondary-button>
            <x-danger-button>{{ __('Deny Account') }}</x-danger-button>
        </div>
    </form>
</x-modal>
