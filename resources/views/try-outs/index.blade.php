<x-app-layout>
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h1 class="h4 mb-0">{{ __('Try-out Opportunities') }}</h1>
        @auth
            <div class="d-flex gap-2">
                <a href="{{ route('try-outs.mine') }}" class="btn btn-outline-secondary">{{ __('My Try-outs') }}</a>
                <a href="{{ route('try-outs.create') }}" class="btn btn-primary">
                    <i class="bi bi-plus-lg me-1" aria-hidden="true"></i>{{ __('Post a Try-out') }}
                </a>
            </div>
        @endauth
    </div>

    <form method="GET" class="row g-2 mb-4">
        <div class="col-6 col-md-3">
            <select name="sport" class="form-select" onchange="this.form.submit()">
                <option value="">{{ __('Any sport') }}</option>
                <option value="football" @selected(request('sport') === 'football')>{{ __('Football') }}</option>
                <option value="basketball" @selected(request('sport') === 'basketball')>{{ __('Basketball') }}</option>
            </select>
        </div>
        <div class="col-6 col-md-3">
            <select name="gender" class="form-select" onchange="this.form.submit()">
                <option value="">{{ __('Any gender') }}</option>
                <option value="male" @selected(request('gender') === 'male')>{{ __('Male') }}</option>
                <option value="female" @selected(request('gender') === 'female')>{{ __('Female') }}</option>
                <option value="mixed" @selected(request('gender') === 'mixed')>{{ __('Mixed') }}</option>
            </select>
        </div>
        <div class="col-12 col-md-4">
            <input type="text" name="location" class="form-control" placeholder="{{ __('Search by location') }}" value="{{ request('location') }}">
        </div>
        <div class="col-12 col-md-2">
            <button type="submit" class="btn btn-outline-secondary w-100">{{ __('Filter') }}</button>
        </div>
    </form>

    @if ($tryOuts->isEmpty())
        <x-empty-state icon="bi-calendar2-week" :title="__('No open try-out opportunities match your filters.')" />
    @else
        <div class="row row-cols-1 row-cols-md-2 g-3">
            @foreach ($tryOuts as $tryOut)
                <div class="col">
                    <div class="card h-100">
                        <div class="card-body">
                            <h2 class="h6 mb-1"><a href="{{ route('try-outs.show', $tryOut) }}" class="text-decoration-none">{{ $tryOut->title }}</a></h2>
                            <p class="small text-muted mb-2">
                                {{ __('Posted by') }} {{ $tryOut->postedByUser?->name ?? __('a deleted account') }}
                                @if ($tryOut->location)
                                    &middot; {{ $tryOut->location }}
                                @endif
                            </p>
                            <div class="d-flex flex-wrap gap-1 mb-2">
                                <span class="badge text-bg-primary">{{ __(ucfirst($tryOut->sport)) }}</span>
                                <span class="badge text-bg-light border">{{ __(ucfirst($tryOut->gender)) }}</span>
                                @if ($tryOut->age_group)
                                    <span class="badge text-bg-light border">{{ $tryOut->age_group }}</span>
                                @endif
                            </div>
                            @if ($tryOut->scheduled_date)
                                <p class="small text-muted mb-0">{{ __('Date') }}: {{ $tryOut->scheduled_date->format('M j, Y') }}</p>
                            @endif
                        </div>
                    </div>
                </div>
            @endforeach
        </div>

        <div class="mt-4">{{ $tryOuts->links() }}</div>
    @endif
</x-app-layout>
