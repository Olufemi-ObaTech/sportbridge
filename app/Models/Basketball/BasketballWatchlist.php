<?php

namespace App\Models\Basketball;

use App\Models\Watchlist;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Basketball's version of Watchlist - lives in the "mysql_basketball"
 * physical database, intra-database FKs to BasketballAgentProfile/BasketballPlayer.
 */
class BasketballWatchlist extends Watchlist
{
    protected $connection = 'mysql_basketball';

    protected $table = 'watchlists';

    public function agent(): BelongsTo
    {
        return $this->belongsTo(BasketballAgentProfile::class, 'agent_id');
    }

    public function player(): BelongsTo
    {
        return $this->belongsTo(BasketballPlayer::class, 'player_id');
    }
}
