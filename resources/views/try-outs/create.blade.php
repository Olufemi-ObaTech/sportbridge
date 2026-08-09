<x-dashboard-layout title="{{ __('Post a Try-out') }}">
    <div class="card">
        <div class="card-body p-4">
            <form method="POST" action="{{ route('try-outs.store') }}">
                @csrf
                @include('try-outs.partials.form')
                <x-primary-button>{{ __('Post Try-out') }}</x-primary-button>
            </form>
        </div>
    </div>
</x-dashboard-layout>
