<x-app-layout>
    <div class="row justify-content-center">
        <div class="col-12 col-lg-8">
            <div class="card">
                <div class="card-body p-4 p-lg-5 text-center">
                    <i class="bi bi-hourglass-split display-4 mb-3" style="color: var(--fc-gold);" aria-hidden="true"></i>
                    <h1 class="h3">{{ __('Your account is under review') }}</h1>
                    <p class="text-muted">
                        {{ __("Thanks for registering with :app. Our team is reviewing your documents and will approve your account shortly. You'll get an email as soon as you're approved.", ['app' => config('app.name')]) }}
                    </p>
                    <p class="text-muted small">
                        {{ __('While you wait, you can review and update your account settings below. Posting, messaging, and applying are disabled until your account is approved.') }}
                    </p>
                    <a href="{{ route('profile.edit') }}" class="btn btn-outline-primary mt-2">{{ __('View account settings') }}</a>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
