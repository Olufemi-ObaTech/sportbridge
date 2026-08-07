<?php

namespace App\Models;

use App\Models\Basketball\BasketballWatchlist;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Watchlist extends Model
{
    use HasFactory;

    protected $fillable = [
        'agent_id',
        'player_id',
        'notes',
    ];

    public function agent(): BelongsTo
    {
        return $this->belongsTo(AgentProfile::class, 'agent_id');
    }

    public function player(): BelongsTo
    {
        return $this->belongsTo(Player::class);
    }

    /**
     * Football and basketball watchlists live in two physically separate
     * databases with independent id sequences - try football first (this
     * class's own default resolution), then fall back to BasketballWatchlist.
     * See Player::resolveRouteBinding() for the full rationale, including
     * why this calls resolveRouteBindingQuery()+first() and NOT
     * ->resolveRouteBinding() (which would recurse infinitely on a genuine
     * not-found, since BasketballWatchlist inherits this exact method body).
     */
    public function resolveRouteBinding($value, $field = null)
    {
        $basketball = new BasketballWatchlist;

        // Ids can collide across the two databases (independent auto-increment
        // sequences) - resolve whichever table matches the visitor's current
        // sport context first, so a collision favors the sport they're
        // actually browsing instead of always favoring football.
        if (session('sport') === 'basketball') {
            return $basketball->resolveRouteBindingQuery($basketball, $value, $field)->first()
                ?? parent::resolveRouteBinding($value, $field);
        }

        return parent::resolveRouteBinding($value, $field)
            ?? $basketball->resolveRouteBindingQuery($basketball, $value, $field)->first();
    }
}
