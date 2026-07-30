<x-dashboard-layout title="{{ __('Add Player') }}">
    <div class="card">
        <div class="card-body p-4">
            <h1 class="h5 mb-3">{{ __('Add Player to :team', ['team' => $team->name]) }}</h1>
            <form method="POST" action="{{ route('academy.players.store', $team) }}" enctype="multipart/form-data">
                @csrf
                @include('academy.players.partials.form')
                <x-primary-button>{{ __('Add Player') }}</x-primary-button>
            </form>
        </div>
    </div>
</x-dashboard-layout>
