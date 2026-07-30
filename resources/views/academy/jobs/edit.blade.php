@php $updateRoute = $updateRoute ?? 'academy.jobs.update'; @endphp
<x-dashboard-layout title="{{ __('Edit Job') }}">
    <div class="card">
        <div class="card-body p-4">
            <form method="POST" action="{{ route($updateRoute, $jobPost) }}">
                @csrf
                @method('PUT')
                @include('academy.jobs.partials.form')
                <x-primary-button>{{ __('Save Changes') }}</x-primary-button>
            </form>
        </div>
    </div>
</x-dashboard-layout>
