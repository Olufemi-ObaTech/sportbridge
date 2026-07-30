<dl class="row mb-0">
    <dt class="col-4 col-sm-3">{{ __('Nationality') }}</dt>
    <dd class="col-8 col-sm-9">{{ $player->nationality }}</dd>

    <dt class="col-4 col-sm-3">{{ __('Secondary Position') }}</dt>
    <dd class="col-8 col-sm-9">{{ $player->secondary_position ?? '—' }}</dd>

    <dt class="col-4 col-sm-3">{{ __('Jersey Number') }}</dt>
    <dd class="col-8 col-sm-9">{{ $player->jersey_number ?? '—' }}</dd>

    <dt class="col-4 col-sm-3">{{ __('Public Profile') }}</dt>
    <dd class="col-8 col-sm-9">{{ $player->is_public ? __('Visible') : __('Hidden') }}</dd>

    <dt class="col-4 col-sm-3">{{ __('Profile Views') }}</dt>
    <dd class="col-8 col-sm-9">{{ $player->views_count }}</dd>

    <dt class="col-4 col-sm-3">{{ __('Bio') }}</dt>
    <dd class="col-8 col-sm-9">{{ $player->bio ?: '—' }}</dd>
</dl>
