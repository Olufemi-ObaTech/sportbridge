<x-app-layout>
    <div class="row g-4">
        <div class="col-12 col-lg-8">
            <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                <div>
                    <h1 class="h4 mb-1">{{ $tryOut->title }}</h1>
                    <p class="text-muted mb-0">
                        {{ __('Posted by') }} {{ $tryOut->postedByUser?->name ?? __('a deleted account') }}
                        @if ($tryOut->location)
                            &middot; {{ $tryOut->location }}
                        @endif
                    </p>
                </div>
                <span class="badge text-bg-{{ $tryOut->isOpen() ? 'success' : 'secondary' }}">{{ __(ucfirst($tryOut->status)) }}</span>
            </div>

            <div class="d-flex flex-wrap gap-2 mb-3">
                <span class="badge text-bg-primary">{{ __(ucfirst($tryOut->sport)) }}</span>
                <span class="badge text-bg-light border">{{ __(ucfirst($tryOut->gender)) }}</span>
                @if ($tryOut->age_group)
                    <span class="badge text-bg-light border">{{ $tryOut->age_group }}</span>
                @endif
            </div>

            <div class="card mb-3">
                <div class="card-body">
                    <h2 class="h6">{{ __('Details') }}</h2>
                    <p style="white-space: pre-line;" class="mb-0">{{ $tryOut->description }}</p>
                </div>
            </div>

            @if ($tryOut->scheduled_date)
                <p class="small text-muted">{{ __('Date') }}: {{ $tryOut->scheduled_date->format('F j, Y') }}</p>
            @endif
        </div>

        <div class="col-12 col-lg-4">
            <div class="card">
                <div class="card-body">
                    @auth
                        @can('viewInterests', $tryOut)
                            <a href="{{ route('try-outs.interested', $tryOut) }}" class="btn btn-outline-primary w-100 mb-2">
                                {{ __('View Interested Players') }} ({{ $tryOut->interests()->count() }})
                            </a>
                        @endcan
                        @can('update', $tryOut)
                            <a href="{{ route('try-outs.edit', $tryOut) }}" class="btn btn-outline-secondary w-100 mb-2">{{ __('Edit') }}</a>
                        @endcan
                        @can('close', $tryOut)
                            @if ($tryOut->isOpen())
                                <form method="POST" action="{{ route('try-outs.close', $tryOut) }}">
                                    @csrf
                                    <button type="submit" class="btn btn-outline-warning w-100" data-confirm="{{ __('Close this try-out to new interest?') }}">{{ __('Close Try-out') }}</button>
                                </form>
                            @endif
                        @endcan

                        @if ($hasExpressedInterest)
                            {{-- Shown regardless of whether expressInterest still passes (e.g. the
                                 try-out has since closed) - this confirms a past action, it isn't
                                 gating a new one. --}}
                            <div class="alert alert-success mb-0">
                                <i class="bi bi-check-circle-fill me-1" aria-hidden="true"></i>{{ __("You've expressed interest in this try-out.") }}
                            </div>
                        @elseif (auth()->user()->can('expressInterest', $tryOut))
                            <form method="POST" action="{{ route('try-outs.interest.store', $tryOut) }}">
                                @csrf
                                <div class="mb-2">
                                    <x-input-label for="message" :value="__('Message (optional)')" />
                                    <textarea id="message" name="message" rows="3" class="form-control" maxlength="1000"></textarea>
                                    <x-input-error :messages="$errors->get('message')" />
                                </div>
                                <button type="submit" class="btn btn-primary w-100">{{ __("I'm Interested") }}</button>
                            </form>
                        @endif
                    @else
                        <a href="{{ route('login') }}" class="btn btn-primary w-100">{{ __('Log in to express interest') }}</a>
                    @endauth
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
