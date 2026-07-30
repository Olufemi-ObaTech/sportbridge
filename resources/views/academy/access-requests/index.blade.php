<x-dashboard-layout title="{{ __('Access Requests') }}">
    <h1 class="h5 mb-3">{{ __('Access Requests') }}</h1>

    @if ($requests->isEmpty())
        <x-empty-state icon="bi-shield-check" :title="__('No access requests yet.')" />
    @else
        <div class="table-responsive d-none d-md-block">
            <table class="table align-middle">
                <thead>
                    <tr>
                        <th>{{ __('Agent') }}</th>
                        <th>{{ __('Player') }}</th>
                        <th>{{ __('Message') }}</th>
                        <th>{{ __('Status') }}</th>
                        <th class="text-end">{{ __('Actions') }}</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($requests as $request)
                        @include('academy.access-requests.partials.row', ['request' => $request])
                    @endforeach
                </tbody>
            </table>
        </div>

        <div class="d-md-none">
            @foreach ($requests as $request)
                <div class="card mb-2">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <span class="fw-semibold">{{ $request->agent->agency_name }}</span>
                            <span class="badge text-bg-{{ match($request->status) { 'granted' => 'success', 'denied' => 'danger', default => 'secondary' } }}">
                                {{ ucfirst($request->status) }}
                            </span>
                        </div>
                        <div class="small text-muted">{{ __('Player') }}: {{ $request->player->full_name }}</div>
                        <p class="small mb-2">{{ $request->message }}</p>
                        @if ($request->status === 'pending')
                            <div class="d-flex gap-1">
                                @include('academy.access-requests.partials.actions', ['request' => $request])
                            </div>
                        @endif
                    </div>
                </div>
            @endforeach
        </div>

        <div class="mt-3">{{ $requests->links() }}</div>
    @endif
</x-dashboard-layout>
