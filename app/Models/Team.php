<?php

namespace App\Models;

use App\Models\Basketball\BasketballTeam;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Team extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'academy_id',
        'sport',
        'name',
        'season',
        'age_group',
        'coach_name',
    ];

    public function academy(): BelongsTo
    {
        return $this->belongsTo(AcademyProfile::class, 'academy_id');
    }

    public function players(): HasMany
    {
        return $this->hasMany(Player::class);
    }

    /**
     * Football and basketball teams live in two physically separate
     * databases with independent id sequences - try football first (this
     * class's own default resolution), then fall back to BasketballTeam.
     * See Player::resolveRouteBinding() for the full rationale, including
     * why this calls resolveRouteBindingQuery()+first() and NOT
     * ->resolveRouteBinding() (which would recurse infinitely on a genuine
     * not-found, since BasketballTeam inherits this exact method body).
     */
    public function resolveRouteBinding($value, $field = null)
    {
        $basketball = new BasketballTeam;

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
