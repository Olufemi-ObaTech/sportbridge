<x-dashboard-layout title="{{ __('Edit Player') }}">
    <div class="card">
        <div class="card-body p-4">
            <h1 class="h5 mb-3">{{ __('Edit :name', ['name' => $player->full_name]) }}</h1>
            <form method="POST" action="{{ route('academy.players.update', $player) }}" enctype="multipart/form-data">
                @csrf
                @method('PUT')
                @include('academy.players.partials.form')
                <x-primary-button>{{ __('Save Changes') }}</x-primary-button>
            </form>
        </div>
    </div>
</x-dashboard-layout>
