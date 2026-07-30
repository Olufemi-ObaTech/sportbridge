@props(['align' => 'end', 'width' => '48'])

@php
    $widthPx = is_numeric($width) ? $width * 5 : 240;
@endphp

<div class="dropdown">
    <div role="button" tabindex="0" data-bs-toggle="dropdown" aria-expanded="false" aria-haspopup="true">
        {{ $trigger }}
    </div>
    <div class="dropdown-menu dropdown-menu-{{ $align }} shadow-sm p-1" style="min-width: {{ $widthPx }}px;">
        {{ $content }}
    </div>
</div>
