<x-dashboard-layout title="{{ __('Edit Team') }}">
    <div class="card">
        <div class="card-body p-4">
            <form method="POST" action="{{ route('academy.teams.update', $team) }}">
                @csrf
                @method('PUT')
                @include('academy.teams.partials.form')
                <x-primary-button>{{ __('Save Changes') }}</x-primary-button>
            </form>
        </div>
    </div>
</x-dashboard-layout>
