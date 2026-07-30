@props(['name', 'value' => '', 'label' => 'About'])

<div>
    <x-input-label :for="$name" :value="__($label)" />
    <div id="{{ $name }}-quill" class="fc-quill bg-white" style="min-height: 200px;"></div>
    <textarea name="{{ $name }}" id="{{ $name }}" class="d-none">{{ old($name, $value) }}</textarea>
    <x-input-error :messages="$errors->get($name)" />
</div>

@once
    @push('scripts')
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.snow.css">
        <script src="https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.js"></script>
    @endpush
@endonce

@push('scripts')
    <script nonce="{{ request()->attributes->get('csp_nonce') }}">
        document.addEventListener('DOMContentLoaded', function () {
            var hidden = document.getElementById('{{ $name }}');
            var quill = new Quill('#{{ $name }}-quill', {
                theme: 'snow',
                placeholder: '{{ __('Tell people about you...') }}',
                modules: {
                    toolbar: [['bold', 'italic', 'underline'], [{ list: 'ordered' }, { list: 'bullet' }], ['link'], ['clean']],
                },
            });
            quill.root.innerHTML = hidden.value;
            quill.on('text-change', function () {
                hidden.value = quill.root.innerHTML;
            });
            hidden.closest('form').addEventListener('submit', function () {
                hidden.value = quill.root.innerHTML;
            });
        });
    </script>
@endpush
