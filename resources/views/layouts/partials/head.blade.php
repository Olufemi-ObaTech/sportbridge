<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="csrf-token" content="{{ csrf_token() }}">

<title>{{ $title ?? config('app.name', 'SportBridge') }}</title>

<meta name="description" content="{{ config('app.name') }} - connecting players, clubs, academies, agents, scouts and coaches across football and basketball, worldwide.">
<link rel="canonical" href="{{ url()->current() }}">
@stack('meta')

<link rel="icon" type="image/svg+xml" href="{{ asset('img/logo-mark.svg') }}">
<meta name="theme-color" content="#071A3D">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap">

{{-- Bootstrap 5.3 + Bootstrap Icons (CDN, per project spec) - RTL build swaps in automatically for Arabic --}}
@if (in_array(app()->getLocale(), \App\Http\Middleware\SetLocale::RTL, true))
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.rtl.min.css">
@else
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
@endif
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

@vite(['resources/css/app.css', 'resources/js/app.js'])

<meta name="pusher-key" content="{{ config('broadcasting.connections.pusher.key') }}">
