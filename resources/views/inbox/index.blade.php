<x-app-layout>
    <div class="row g-0 border rounded overflow-hidden" style="min-height: 60vh;">
        <div class="col-12 col-md-4 border-end fc-inbox-list">
            @include('inbox.partials.list')
        </div>
        <div class="col-12 col-md-8 fc-thread-pane d-none d-md-flex align-items-center justify-content-center">
            <x-empty-state icon="bi-chat-dots" :title="__('Select a conversation to start reading.')" />
        </div>
    </div>
</x-app-layout>
