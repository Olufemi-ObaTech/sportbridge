<?php

namespace App\Models;

use App\Models\Basketball\BasketballAgentProfile;
use App\Models\Concerns\HasLinkedin;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class AgentProfile extends Model
{
    use HasFactory, HasLinkedin, SoftDeletes;

    public const SPORT_FOOTBALL = 'football';

    public const SPORT_BASKETBALL = 'basketball';

    public const SPORTS = [self::SPORT_FOOTBALL, self::SPORT_BASKETBALL];

    protected $fillable = [
        'user_id',
        'agency_name',
        'sport',
        'license_number',
        'nationality',
        'experience_years',
        'regions',
        'id_doc_url',
        'about',
        'cover_image_url',
        'photo_url',
        'verification_body',
        'verified_badge',
        'linkedin',
    ];

    protected function casts(): array
    {
        return [
            'regions' => 'array',
            'experience_years' => 'integer',
            'verified_badge' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function watchlists(): HasMany
    {
        return $this->hasMany(Watchlist::class, 'agent_id');
    }

    public function watchedPlayers(): BelongsToMany
    {
        return $this->belongsToMany(Player::class, 'watchlists', 'agent_id', 'player_id')
            ->withPivot('notes')
            ->withTimestamps();
    }

    public function accessRequests(): HasMany
    {
        return $this->hasMany(AccessRequest::class, 'agent_id');
    }

    /**
     * agent_ratings/agent_recommendations live in the shared main database
     * and disambiguate a possibly-colliding agent_profile_id with a `sport`
     * column, since football and basketball agent_profiles now have
     * independent auto-increment IDs across two physical databases.
     *
     * The foreign key is passed explicitly ('agent_profile_id') rather than
     * left to Eloquent's naming convention: without it, calling this
     * inherited method on a BasketballAgentProfile instance would infer
     * "basketball_agent_profile_id" (derived from the calling class's own
     * name at runtime) instead of the real column name - the same class of
     * bug as Player::resolveRouteBinding()'s recursion, just in hasMany()'s
     * convention instead of resolveRouteBinding()'s inheritance.
     */
    public function ratings(): HasMany
    {
        return $this->hasMany(AgentRating::class, 'agent_profile_id')->where('sport', $this->sport);
    }

    public function recommendations(): HasMany
    {
        return $this->hasMany(AgentRecommendation::class, 'agent_profile_id')->where('sport', $this->sport);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(AgentDocument::class, 'agent_profile_id')->where('sport', $this->sport);
    }

    /**
     * Ratings are meant to reflect an actual client relationship, not a
     * drive-by opinion - "service received" means either the agent's user
     * account has exchanged messages with this user, or this agent was
     * granted access to a player this user owns/represents (see AccessRequest).
     *
     * Deliberately compares raw academy_id/player_id integers rather than
     * whereHas('academy'/'player', ...) - accessRequests() for a basketball
     * agent lives in the "mysql_basketball" connection, and a whereHas()
     * EXISTS-subquery can't reach across to the main database's users/
     * academy_profiles tables the way a plain column comparison can.
     */
    public function hasProvidedServiceTo(User $user): bool
    {
        $conversationExists = Conversation::where(function ($q) use ($user) {
            $q->where('initiator_id', $user->id)->orWhere('recipient_id', $user->id);
        })->where(function ($q) {
            $q->where('initiator_id', $this->user_id)->orWhere('recipient_id', $this->user_id);
        })->exists();

        if ($conversationExists) {
            return true;
        }

        $academyId = $user->academyProfile?->id;
        $playerId = $user->playerProfile?->id;

        if (! $academyId && ! $playerId) {
            return false;
        }

        return $this->accessRequests()
            ->where('status', 'granted')
            ->where(function ($q) use ($academyId, $playerId) {
                $q->when($academyId, fn ($q) => $q->orWhere('academy_id', $academyId))
                    ->when($playerId, fn ($q) => $q->orWhere('player_id', $playerId));
            })
            ->exists();
    }

    protected function averageRating(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->attributes['ratings_avg_score'] ?? $this->ratings()->avg('score'),
        );
    }

    protected function ratingsCount(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->attributes['ratings_count'] ?? $this->ratings()->count(),
        );
    }

    /**
     * Computed, not stored - always reflects current verification/rating
     * state instead of a manually-set field that can drift out of date.
     */
    protected function trustLevel(): Attribute
    {
        return Attribute::make(
            get: function () {
                $verified = (bool) $this->verified_badge;
                $avg = (float) ($this->average_rating ?? 0);
                $count = (int) ($this->ratings_count ?? 0);
                $years = (int) $this->experience_years;

                if ($verified && $count >= 10 && $avg >= 4.5) {
                    return 'verified_pro';
                }

                if (($verified && $count >= 5 && $avg >= 4.0) || ($years >= 10 && $avg >= 4.0 && $count >= 3)) {
                    return 'gold';
                }

                if ($verified || ($count >= 3 && $avg >= 3.5) || $years >= 5) {
                    return 'silver';
                }

                if ($count >= 1 || $years >= 1) {
                    return 'bronze';
                }

                return 'new';
            },
        );
    }

    /**
     * Football and basketball agent profiles live in two physically separate
     * databases with independent id sequences - try football first (this
     * class's own default resolution), then fall back to BasketballAgentProfile.
     * See Player::resolveRouteBinding() for the full rationale, including
     * why this calls resolveRouteBindingQuery()+first() and NOT
     * ->resolveRouteBinding() (which would recurse infinitely on a genuine
     * not-found, since BasketballAgentProfile inherits this exact method body).
     */
    public function resolveRouteBinding($value, $field = null)
    {
        $basketball = new BasketballAgentProfile;

        return parent::resolveRouteBinding($value, $field)
            ?? $basketball->resolveRouteBindingQuery($basketball, $value, $field)->first();
    }
}
