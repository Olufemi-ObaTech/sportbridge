<x-dashboard-layout title="{{ __('Edit Try-out') }}">
    <div class="card">
        <div class="card-body p-4">
            <form method="POST" action="{{ route('try-outs.update', $tryOut) }}">
                @csrf
                @method('PUT')
                @include('try-outs.partials.form', ['tryOut' => $tryOut])
                <x-primary-button>{{ __('Save Changes') }}</x-primary-button>
            </form>
        </div>
    </div>
</x-dashboard-layout>
