<x-app-layout>
    <div class="row justify-content-center">
        <div class="col-12 col-md-8 col-lg-6">
            <div class="card">
                <div class="card-body">
                    <h1 class="h5 mb-1">{{ __('Report :name', ['name' => $reportedUser->name]) }}</h1>
                    <p class="text-muted small mb-3">{{ __('A Super Admin reviews every report. Accounts are automatically hidden from public view once they accumulate enough complaints from different users.') }}</p>

                    <x-input-error :messages="$errors->get('report')" class="mb-3" />

                    <form method="POST" action="{{ route('reports.store', $reportedUser) }}">
                        @csrf
                        <div class="mb-3">
                            <x-input-label for="reason" :value="__('Reason')" />
                            <select id="reason" name="reason" class="form-select" required>
                                <option value="">{{ __('Select a reason') }}</option>
                                @foreach (\App\Models\Report::REASONS as $value => $label)
                                    <option value="{{ $value }}" @selected(old('reason') === $value)>{{ __($label) }}</option>
                                @endforeach
                            </select>
                            <x-input-error :messages="$errors->get('reason')" />
                        </div>
                        <div class="mb-3">
                            <x-input-label for="details" :value="__('Details (optional)')" />
                            <textarea id="details" name="details" rows="4" class="form-control">{{ old('details') }}</textarea>
                            <x-input-error :messages="$errors->get('details')" />
                        </div>
                        <div class="d-flex gap-2">
                            <x-primary-button type="submit">{{ __('Submit Report') }}</x-primary-button>
                            <a href="{{ url()->previous() }}" class="btn btn-outline-secondary">{{ __('Cancel') }}</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
