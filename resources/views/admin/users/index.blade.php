<x-dashboard-layout title="{{ __('Users') }}">
    <h1 class="h5 mb-3">{{ __('Users') }}</h1>

    <form method="GET" class="row g-2 mb-3">
        <div class="col-12 col-sm-6">
            <input type="text" name="q" class="form-control" placeholder="{{ __('Search name, email, club, license...') }}" value="{{ $search }}">
        </div>
        <div class="col-6 col-sm-3">
            <select name="role" class="form-select" data-auto-submit>
                <option value="">{{ __('All roles') }}</option>
                @foreach (['academy', 'agent', 'coach', 'player', 'super_admin'] as $role)
                    <option value="{{ $role }}" @selected(request('role') === $role)>{{ __(ucfirst(str_replace('_', ' ', $role))) }}</option>
                @endforeach
            </select>
        </div>
        <div class="col-6 col-sm-3">
            <button class="btn btn-outline-secondary w-100" type="submit">{{ __('Search') }}</button>
        </div>
    </form>

    <div class="table-responsive">
        <table class="table align-middle">
            <thead>
                <tr>
                    <th>{{ __('Name') }}</th>
                    <th>{{ __('Role') }}</th>
                    <th>{{ __('Status') }}</th>
                    <th class="text-end">{{ __('Actions') }}</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($users as $user)
                    <tr class="{{ $user->trashed() ? 'table-secondary' : '' }}">
                        <td>
                            {{ $user->name }}
                            @if ($user->academyProfile?->verified_badge || $user->agentProfile?->verified_badge)
                                <i class="bi bi-patch-check-fill text-primary ms-1" title="{{ __('Verified') }}" aria-hidden="true"></i>
                            @endif
                        </td>
                        <td><span class="badge text-bg-light border">{{ __(ucfirst(str_replace('_', ' ', $user->role))) }}</span></td>
                        <td>
                            <span class="badge text-bg-{{ match(true) {
                                $user->trashed() => 'dark',
                                $user->status === 'active' => 'success',
                                $user->status === 'pending' => 'secondary',
                                $user->status === 'suspended' => 'warning',
                                default => 'danger',
                            } }}">
                                {{ $user->trashed() ? __('Deleted') : ucfirst($user->status) }}
                            </span>
                        </td>
                        <td class="text-end">
                            <div class="d-flex gap-1 justify-content-end flex-wrap">
                                @if ($user->trashed())
                                    <form method="POST" action="{{ route('admin.users.restore', $user->id) }}">
                                        @csrf
                                        <button type="submit" class="btn btn-sm btn-outline-secondary">{{ __('Restore') }}</button>
                                    </form>
                                @else
                                    @if ($user->status !== 'suspended')
                                        <form method="POST" action="{{ route('admin.moderation.suspend', $user) }}">
                                            @csrf
                                            <button type="submit" class="btn btn-sm btn-outline-warning" data-confirm="{{ __('Suspend this account?') }}">{{ __('Suspend') }}</button>
                                        </form>
                                    @else
                                        <form method="POST" action="{{ route('admin.moderation.reinstate', $user) }}">
                                            @csrf
                                            <button type="submit" class="btn btn-sm btn-outline-success">{{ __('Reinstate') }}</button>
                                        </form>
                                    @endif

                                    @if ($user->role === 'academy' && $user->academyProfile && ! $user->academyProfile->verified_badge)
                                        <form method="POST" action="{{ route('admin.moderation.verify', $user->academyProfile) }}">
                                            @csrf
                                            <button type="submit" class="btn btn-sm btn-outline-primary">{{ __('Verify') }}</button>
                                        </form>
                                    @endif

                                    @if ($user->role === 'agent' && $user->agentProfile && ! $user->agentProfile->verified_badge)
                                        <form method="POST" action="{{ route('admin.moderation.verify-agent', $user->agentProfile) }}">
                                            @csrf
                                            <button type="submit" class="btn btn-sm btn-outline-primary">{{ __('Verify') }}</button>
                                        </form>
                                    @endif

                                    <form method="POST" action="{{ route('admin.moderation.destroy', $user) }}">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="btn btn-sm btn-outline-danger" data-confirm="{{ __('Delete this account?') }}">{{ __('Delete') }}</button>
                                    </form>
                                @endif
                            </div>
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <div class="mt-3">{{ $users->links() }}</div>
</x-dashboard-layout>
