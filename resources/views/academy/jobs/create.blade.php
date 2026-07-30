@php $storeRoute = $storeRoute ?? 'academy.jobs.store'; @endphp
<x-dashboard-layout title="{{ __('Post a Job') }}">
    <div class="card">
        <div class="card-body p-4">
            <form method="POST" action="{{ route($storeRoute) }}">
                @csrf
                @include('academy.jobs.partials.form')
                <x-primary-button>{{ __('Post Job') }}</x-primary-button>
            </form>
        </div>
    </div>
</x-dashboard-layout>
