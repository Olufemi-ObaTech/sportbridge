@php
    $jobPost = $jobPost ?? null;
    $currentJobFormSport = old('sport', $jobPost->sport ?? session('sport', \App\Http\Middleware\SetSport::DEFAULT));
    $roles = \App\Models\JobPost::rolesFor($currentJobFormSport);
@endphp

<div class="row g-3 mb-4">
    <div class="col-12 col-md-8">
        <x-input-label for="title" :value="__('Job Title')" />
        <x-text-input id="title" name="title" type="text" :value="old('title', $jobPost->title ?? '')" required autofocus />
        <x-input-error :messages="$errors->get('title')" />
    </div>

    <div class="col-12 col-md-4">
        <x-input-label for="sport" :value="__('Sport')" />
        @if ($jobPost)
            {{-- Sport is fixed once a job post exists - it determines which physical database the row lives in. --}}
            <input type="text" class="form-control" value="{{ __(ucfirst($jobPost->sport)) }}" disabled>
        @else
            <select id="sport" name="sport" class="form-select" required>
                <option value="football" @selected(old('sport', session('sport', \App\Http\Middleware\SetSport::DEFAULT)) === 'football')>{{ __('Football') }}</option>
                <option value="basketball" @selected(old('sport', session('sport', \App\Http\Middleware\SetSport::DEFAULT)) === 'basketball')>{{ __('Basketball') }}</option>
            </select>
            <x-input-error :messages="$errors->get('sport')" />
        @endif
    </div>

    <div class="col-12 col-md-4">
        <x-input-label for="role_type" :value="__('Role Type')" />
        <select id="role_type" name="role_type" class="form-select" required>
            @foreach ($roles as $value => $label)
                <option value="{{ $value }}" @selected(old('role_type', $jobPost->role_type ?? '') === $value)>{{ __($label) }}</option>
            @endforeach
        </select>
        <x-input-error :messages="$errors->get('role_type')" />
    </div>

    <div class="col-12">
        <x-input-label for="description" :value="__('Description')" />
        <textarea id="description" name="description" rows="5" class="form-control" required>{{ old('description', $jobPost->description ?? '') }}</textarea>
        <x-input-error :messages="$errors->get('description')" />
    </div>

    <div class="col-12">
        <x-input-label for="requirements" :value="__('Requirements')" />
        <textarea id="requirements" name="requirements" rows="3" class="form-control">{{ old('requirements', $jobPost->requirements ?? '') }}</textarea>
        <x-input-error :messages="$errors->get('requirements')" />
    </div>

    <div class="col-12 col-md-6">
        <x-input-label for="location" :value="__('Location')" />
        <x-text-input id="location" name="location" type="text" :value="old('location', $jobPost->location ?? '')" required />
        <x-input-error :messages="$errors->get('location')" />
    </div>

    <div class="col-12 col-md-6">
        <x-input-label for="contract_type" :value="__('Contract Type')" />
        <select id="contract_type" name="contract_type" class="form-select" required>
            @foreach (['full_time' => 'Full-time', 'part_time' => 'Part-time', 'contract' => 'Contract', 'volunteer' => 'Volunteer'] as $value => $label)
                <option value="{{ $value }}" @selected(old('contract_type', $jobPost->contract_type ?? '') === $value)>{{ __($label) }}</option>
            @endforeach
        </select>
        <x-input-error :messages="$errors->get('contract_type')" />
    </div>

    <div class="col-6 col-md-3">
        <x-input-label for="salary_min" :value="__('Salary Min')" />
        <x-text-input id="salary_min" name="salary_min" type="number" min="0" :value="old('salary_min', $jobPost->salary_min ?? '')" />
        <x-input-error :messages="$errors->get('salary_min')" />
    </div>

    <div class="col-6 col-md-3">
        <x-input-label for="salary_max" :value="__('Salary Max')" />
        <x-text-input id="salary_max" name="salary_max" type="number" min="0" :value="old('salary_max', $jobPost->salary_max ?? '')" />
        <x-input-error :messages="$errors->get('salary_max')" />
    </div>

    <div class="col-6 col-md-3">
        <x-input-label for="currency" :value="__('Currency')" />
        <x-text-input id="currency" name="currency" type="text" maxlength="3" :value="old('currency', $jobPost->currency ?? 'NGN')" />
        <x-input-error :messages="$errors->get('currency')" />
    </div>

    <div class="col-6 col-md-3">
        <x-input-label for="application_deadline" :value="__('Application Deadline')" />
        <x-text-input id="application_deadline" name="application_deadline" type="date" :value="old('application_deadline', optional($jobPost->application_deadline ?? null)->format('Y-m-d'))" required />
        <x-input-error :messages="$errors->get('application_deadline')" />
    </div>

    @if ($jobPost)
        <div class="col-12 col-md-6">
            <x-input-label for="status" :value="__('Status')" />
            <select id="status" name="status" class="form-select" required>
                @foreach (['open' => 'Open', 'filled' => 'Filled', 'closed' => 'Closed'] as $value => $label)
                    <option value="{{ $value }}" @selected(old('status', $jobPost->status) === $value)>{{ __($label) }}</option>
                @endforeach
            </select>
            <x-input-error :messages="$errors->get('status')" />
        </div>
    @endif
</div>

<script nonce="{{ request()->attributes->get('csp_nonce') }}">
    (function () {
        var sportSelect = document.getElementById('sport');
        var roleSelect = document.getElementById('role_type');
        if (!sportSelect) { return; }
        var ROLES = {
            football: {{ \Illuminate\Support\Js::from(\App\Models\JobPost::rolesFor('football')) }},
            basketball: {{ \Illuminate\Support\Js::from(\App\Models\JobPost::rolesFor('basketball')) }}
        };

        sportSelect.addEventListener('change', function () {
            var roles = ROLES[sportSelect.value] || ROLES.football;
            var current = roleSelect.value;
            roleSelect.innerHTML = '';
            Object.keys(roles).forEach(function (value) {
                var option = document.createElement('option');
                option.value = value;
                option.textContent = roles[value];
                if (value === current) { option.selected = true; }
                roleSelect.appendChild(option);
            });
        });
    })();
</script>
