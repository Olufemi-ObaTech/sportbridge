<x-dashboard-layout title="{{ __('My Try-outs') }}">
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h1 class="h5 mb-0">{{ __('My Try-outs') }}</h1>
        <a href="{{ route('try-outs.create') }}" class="btn btn-primary">
            <i class="bi bi-plus-lg me-1" aria-hidden="true"></i>{{ __('Post a Try-out') }}
        </a>
    </div>

    @if ($tryOuts->isEmpty())
        <x-empty-state icon="bi-calendar2-week" :title="__('No try-outs posted yet.')" :action="route('try-outs.create')" :actionLabel="__('Post your first try-out')" />
    @else
        <div class="table-responsive d-none d-md-block">
            <table class="table align-middle">
                <thead>
                    <tr>
                        <th>{{ __('Title') }}</th>
                        <th>{{ __('Sport') }}</th>
                        <th>{{ __('Status') }}</th>
                        <th>{{ __('Interested') }}</th>
                        <th>{{ __('Date') }}</th>
                        <th class="text-end">{{ __('Actions') }}</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($tryOuts as $tryOut)
                        <tr>
                            <td><a href="{{ route('try-outs.show', $tryOut) }}" class="text-decoration-none">{{ $tryOut->title }}</a></td>
                            <td>{{ __(ucfirst($tryOut->sport)) }}</td>
                            <td><span class="badge text-bg-{{ $tryOut->isOpen() ? 'success' : 'secondary' }}">{{ __(ucfirst($tryOut->status)) }}</span></td>
                            <td><a href="{{ route('try-outs.interested', $tryOut) }}">{{ $tryOut->interests_count }}</a></td>
                            <td>{{ $tryOut->scheduled_date?->format('M j, Y') ?? __('TBD') }}</td>
                            <td class="text-end">
                                <a href="{{ route('try-outs.edit', $tryOut) }}" class="btn btn-sm btn-outline-secondary">{{ __('Edit') }}</a>
                                @if ($tryOut->isOpen())
                                    <form method="POST" action="{{ route('try-outs.close', $tryOut) }}" class="d-inline">
                                        @csrf
                                        <button type="submit" class="btn btn-sm btn-outline-warning" data-confirm="{{ __('Close this try-out to new interest?') }}">{{ __('Close') }}</button>
                                    </form>
                                @endif
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <div class="d-md-none">
            @foreach ($tryOuts as $tryOut)
                <div class="card mb-2">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <a href="{{ route('try-outs.show', $tryOut) }}" class="text-decoration-none fw-semibold">{{ $tryOut->title }}</a>
                            <span class="badge text-bg-{{ $tryOut->isOpen() ? 'success' : 'secondary' }}">{{ __(ucfirst($tryOut->status)) }}</span>
                        </div>
                        <div class="small text-muted mt-1">
                            {{ __(ucfirst($tryOut->sport)) }} &middot;
                            <a href="{{ route('try-outs.interested', $tryOut) }}">{{ __(':count interested', ['count' => $tryOut->interests_count]) }}</a>
                        </div>
                        <a href="{{ route('try-outs.edit', $tryOut) }}" class="btn btn-sm btn-outline-secondary mt-2">{{ __('Edit') }}</a>
                    </div>
                </div>
            @endforeach
        </div>

        <div class="mt-3">{{ $tryOuts->links() }}</div>
    @endif
</x-dashboard-layout>
