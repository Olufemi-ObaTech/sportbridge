@php
    $inviteLink = route('register', ['ref' => auth()->user()->username]);
    $shareText = __('Join me on :app - connecting players, academies, agents and coaches worldwide.', ['app' => config('app.name')]);
    $referralCount = auth()->user()->referrals()->count();
@endphp

<div class="card">
    <div class="card-body">
        <h2 class="h6">{{ __('Invite Others') }}</h2>
        <p class="small text-muted">{{ __('Share your personal link. Anyone who joins through it counts toward your invites.') }}</p>

        <div class="input-group input-group-sm mb-2">
            <input type="text" id="invite-link-input" class="form-control" value="{{ $inviteLink }}" readonly>
            <button type="button" class="btn btn-outline-secondary" data-copy-target="#invite-link-input" data-copied-label="{{ __('Copied!') }}">
                {{ __('Copy') }}
            </button>
        </div>

        <div class="d-flex flex-wrap gap-2 mb-2">
            <a href="https://wa.me/?text={{ urlencode($shareText.' '.$inviteLink) }}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-success">
                <i class="bi bi-whatsapp me-1" aria-hidden="true"></i>WhatsApp
            </a>
            <a href="https://twitter.com/intent/tweet?text={{ urlencode($shareText) }}&url={{ urlencode($inviteLink) }}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-secondary">
                <i class="bi bi-twitter-x me-1" aria-hidden="true"></i>X
            </a>
            <a href="mailto:?subject={{ urlencode(__('Join :app', ['app' => config('app.name')])) }}&body={{ urlencode($shareText.' '.$inviteLink) }}" class="btn btn-sm btn-outline-secondary">
                <i class="bi bi-envelope me-1" aria-hidden="true"></i>{{ __('Email') }}
            </a>
        </div>

        <p class="small text-muted mb-0">
            <i class="bi bi-people-fill me-1" aria-hidden="true"></i>
            {{ trans_choice(':count person has joined using your invite|:count people have joined using your invite', $referralCount, ['count' => $referralCount]) }}
        </p>
    </div>
</div>
