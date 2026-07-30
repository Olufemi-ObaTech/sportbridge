<?php

namespace App\Models\Basketball;

use App\Models\AgentProfile;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Basketball's version of AgentProfile - same shape, lives in the
 * "mysql_basketball" physical database. `user()` stays inherited unchanged.
 * `ratings()`/`recommendations()` also stay inherited unchanged - they
 * already filter by `$this->sport` dynamically (see AgentProfile), and
 * agent_ratings/agent_recommendations live centrally in the main database.
 */
class BasketballAgentProfile extends AgentProfile
{
    protected $connection = 'mysql_basketball';

    protected $table = 'agent_profiles';

    public function watchlists(): HasMany
    {
        return $this->hasMany(BasketballWatchlist::class, 'agent_id');
    }

    public function watchedPlayers(): BelongsToMany
    {
        return $this->belongsToMany(BasketballPlayer::class, 'watchlists', 'agent_id', 'player_id')
            ->withPivot('notes')
            ->withTimestamps();
    }

    public function accessRequests(): HasMany
    {
        return $this->hasMany(BasketballAccessRequest::class, 'agent_id');
    }
}
