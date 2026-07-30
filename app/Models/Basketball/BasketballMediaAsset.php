<?php

namespace App\Models\Basketball;

use App\Models\MediaAsset;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Basketball's version of MediaAsset - lives in the "mysql_basketball"
 * physical database, intra-database FK to BasketballPlayer.
 */
class BasketballMediaAsset extends MediaAsset
{
    protected $connection = 'mysql_basketball';

    protected $table = 'media_assets';

    public function player(): BelongsTo
    {
        return $this->belongsTo(BasketballPlayer::class, 'player_id');
    }
}
