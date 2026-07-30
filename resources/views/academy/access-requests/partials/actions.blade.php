<form method="POST" action="{{ route('academy.access-requests.respond', $request) }}">
    @csrf
    <input type="hidden" name="decision" value="grant">
    <button type="submit" class="btn btn-sm btn-outline-success">{{ __('Grant') }}</button>
</form>
<form method="POST" action="{{ route('academy.access-requests.respond', $request) }}">
    @csrf
    <input type="hidden" name="decision" value="deny">
    <button type="submit" class="btn btn-sm btn-outline-danger">{{ __('Deny') }}</button>
</form>
