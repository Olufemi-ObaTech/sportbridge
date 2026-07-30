@php $activeConversation = $conversation; @endphp

<x-app-layout>
    <div class="row g-0 border rounded overflow-hidden" style="min-height: 60vh;">
        <div class="col-12 col-md-4 border-end fc-inbox-list thread-open">
            @include('inbox.partials.list')
        </div>
        <div class="col-12 col-md-8 fc-thread-pane thread-open d-flex flex-column">
            @include('inbox.partials.thread')
        </div>
    </div>
</x-app-layout>
