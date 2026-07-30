<x-guest-layout>
    <h1 class="h4 mb-3">{{ __('Log in') }}</h1>

    <x-auth-session-status class="mb-3" :status="session('status')" />

    <form method="POST" action="{{ route('login') }}">
        @csrf

        <div class="mb-3">
            <x-input-label for="email" :value="__('Email')" />
            <x-text-input id="email" type="email" name="email" :value="old('email')" required autofocus autocomplete="username" />
            <x-input-error :messages="$errors->get('email')" />
        </div>

        <div class="mb-3">
            <x-input-label for="password" :value="__('Password')" />
            <x-text-input id="password" type="password" name="password" required autocomplete="current-password" />
            <x-input-error :messages="$errors->get('password')" />
        </div>

        <div class="mb-3 form-check">
            <input id="remember_me" type="checkbox" class="form-check-input" name="remember">
            <label for="remember_me" class="form-check-label">{{ __('Remember me') }}</label>
        </div>

        <div class="d-flex align-items-center justify-content-between gap-3">
            @if (Route::has('password.request'))
                <a class="small" href="{{ route('password.request') }}">
                    {{ __('Forgot your password?') }}
                </a>
            @endif

            <x-primary-button>{{ __('Log in') }}</x-primary-button>
        </div>
    </form>

    <hr class="my-4">

    <p class="text-center small mb-0">
        {{ __("Don't have an account?") }}
        <a href="{{ route('register') }}">{{ __('Register') }}</a>
    </p>
</x-guest-layout>
