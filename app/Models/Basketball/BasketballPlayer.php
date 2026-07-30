<?php

namespace App\Models\Basketball;

use App\Models\AcademyProfile;
use App\Models\Player;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Basketball's version of Player - same shape, lives in the "mysql_basketball"
 * physical database. `user()`/`academy()` stay inherited from Player unchanged
 * since users/academy_profiles live centrally; Eloquent resolves those
 * relationships using the related model's own connection either way.
 */
class BasketballPlayer extends Player
{
    protected $connection = 'mysql_basketball';

    protected $table = 'players';

    public function team(): BelongsTo
    {
        return $this->belongsTo(BasketballTeam::class, 'team_id');
    }

    public function mediaAssets(): HasMany
    {
        return $this->hasMany(BasketballMediaAsset::class, 'player_id');
    }

    public function watchlistedBy(): BelongsToMany
    {
        return $this->belongsToMany(BasketballAgentProfile::class, 'watchlists', 'player_id', 'agent_id')
            ->withPivot('notes')
            ->withTimestamps();
    }

    public function accessRequests(): HasMany
    {
        return $this->hasMany(BasketballAccessRequest::class, 'player_id');
    }

    /**
     * `whereHas('user', ...)` can't cross a database connection boundary the
     * way it can within one database, since users lives in the main DB while
     * this model lives in mysql_basketball. Resolve the active-user/academy
     * ID sets from the main connection first, then filter here with a plain
     * whereIn - the standard workaround for a "join" across two databases.
     */
    public function scopeVisible($query)
    {
        $activeUserIds = User::active()->pluck('id');
        $activeAcademyIds = AcademyProfile::whereHas('user', fn ($u) => $u->where('status', User::STATUS_ACTIVE))->pluck('id');

        return $query->public()->where(function ($q) use ($activeUserIds, $activeAcademyIds) {
            $q->whereIn('user_id', $activeUserIds)
                ->orWhereIn('academy_id', $activeAcademyIds);
        });
    }
}
