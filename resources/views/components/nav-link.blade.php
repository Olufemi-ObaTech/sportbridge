@props(['active' => false])

<a {{ $attributes->merge(['class' => 'nav-link' . ($active ? ' active' : '')]) }} @if($active) aria-current="page" @endif>
    {{ $slot }}
</a>
