<footer class="mt-auto py-5" style="background: linear-gradient(160deg, var(--fc-navy-800) 0%, var(--fc-blue-900) 100%); color: rgba(247,249,248,.82);" data-bs-theme="dark">
    <div class="container">
        <div class="row g-4">
            <div class="col-12 col-sm-6 col-lg-3">
                <x-application-logo size="22" class="mb-2" />
                <p class="small mb-0">{{ __('Connecting players, clubs, academies, agents, scouts, coaches and sporting directors across the world.') }}</p>
            </div>
            <div class="col-6 col-sm-6 col-lg-3">
                <h2 class="h6 text-uppercase text-white-50">{{ __('Explore') }}</h2>
                <ul class="list-unstyled small">
                    <li><a class="link-light link-underline-opacity-0" href="{{ route('players.index') }}">{{ __('Players') }}</a></li>
                    <li><a class="link-light link-underline-opacity-0" href="{{ route('jobs.index') }}">{{ __('Jobs') }}</a></li>
                    <li><a class="link-light link-underline-opacity-0" href="{{ route('feed.index') }}">{{ __('Feed') }}</a></li>
                </ul>
            </div>
            <div class="col-6 col-sm-6 col-lg-3">
                <h2 class="h6 text-uppercase text-white-50">{{ __('Join') }}</h2>
                @php $footerSport = session('sport', \App\Http\Middleware\SetSport::DEFAULT); @endphp
                <ul class="list-unstyled small">
                    <li><a class="link-light link-underline-opacity-0" href="{{ route('register.player', $footerSport) }}">{{ __('Player') }}</a></li>
                    <li><a class="link-light link-underline-opacity-0" href="{{ route('register.academy', $footerSport) }}">{{ __('Academy / Club') }}</a></li>
                    <li><a class="link-light link-underline-opacity-0" href="{{ route('register.agent', $footerSport) }}">{{ __('Agent / Scout') }}</a></li>
                    <li><a class="link-light link-underline-opacity-0" href="{{ route('register.coach', $footerSport) }}">{{ __('Coach / Manager') }}</a></li>
                </ul>
            </div>
            <div class="col-6 col-sm-6 col-lg-3">
                <h2 class="h6 text-uppercase text-white-50">{{ __('World Clock') }}</h2>
                <div class="d-flex flex-column gap-1 small" id="footer-world-clock">
                    <div class="d-flex justify-content-between gap-2">
                        <span><i class="bi bi-geo-alt me-1" aria-hidden="true"></i>{{ __('London') }}</span>
                        <span class="fw-semibold font-monospace" data-tz="Europe/London">--:--:--</span>
                    </div>
                    <div class="d-flex justify-content-between gap-2">
                        <span><i class="bi bi-geo-alt me-1" aria-hidden="true"></i>{{ __('New York') }}</span>
                        <span class="fw-semibold font-monospace" data-tz="America/New_York">--:--:--</span>
                    </div>
                    <div class="d-flex justify-content-between gap-2">
                        <span><i class="bi bi-geo-alt me-1" aria-hidden="true"></i>{{ __('Tokyo') }}</span>
                        <span class="fw-semibold font-monospace" data-tz="Asia/Tokyo">--:--:--</span>
                    </div>
                    <div class="d-flex justify-content-between gap-2">
                        <span><i class="bi bi-geo-alt me-1" aria-hidden="true"></i>{{ __('Lagos') }}</span>
                        <span class="fw-semibold font-monospace" data-tz="Africa/Lagos">--:--:--</span>
                    </div>
                    <div class="d-flex justify-content-between gap-2">
                        <span><i class="bi bi-geo-alt me-1" aria-hidden="true"></i>{{ __('Qatar') }}</span>
                        <span class="fw-semibold font-monospace" data-tz="Asia/Qatar">--:--:--</span>
                    </div>
                </div>
            </div>
        </div>

        <hr class="border-light opacity-25">

        <p class="small mb-2 fw-bold" style="max-width: 70ch;">
            {{ __(':app connects players, academies, agents, scouts and coaches, but is not a party to any agreement between them and does not process payments between users. License numbers, verifying bodies and other credentials shown on profiles are self-reported unless marked with a Verified badge. Always independently verify who you are dealing with, and never send money to arrange a trial or introduction.', ['app' => config('app.name')]) }}
        </p>

        <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
            <p class="small mb-0 text-white-50">&copy; {{ date('Y') }} {{ config('app.name') }}. {{ __('All rights reserved.') }}</p>
            <a href="#main-content" class="small link-light link-underline-opacity-0">
                {{ __('Back to top') }} <i class="bi bi-arrow-up-short" aria-hidden="true"></i>
            </a>
        </div>
    </div>

    <script nonce="{{ request()->attributes->get('csp_nonce') }}">
        (function () {
            var clockEls = document.querySelectorAll('#footer-world-clock [data-tz]');
            if (!clockEls.length) { return; }

            function updateClocks() {
                var now = new Date();
                clockEls.forEach(function (el) {
                    el.textContent = new Intl.DateTimeFormat('en-GB', {
                        timeZone: el.dataset.tz,
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false,
                    }).format(now);
                });
            }

            updateClocks();
            setInterval(updateClocks, 1000);
        })();
    </script>
</footer>
