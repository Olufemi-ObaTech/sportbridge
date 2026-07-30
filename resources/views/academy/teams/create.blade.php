<x-dashboard-layout title="{{ __('New Team') }}">
    <div class="card">
        <div class="card-body p-4">
            <form method="POST" action="{{ route('academy.teams.store') }}">
                @csrf
                @include('academy.teams.partials.form')
                <x-primary-button>{{ __('Create Team') }}</x-primary-button>
            </form>
        </div>
    </div>
</x-dashboard-layout>
