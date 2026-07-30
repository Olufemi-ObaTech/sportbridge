<?php

namespace App\Models;

use App\Models\Basketball\BasketballPlayer;
use App\Models\Concerns\HasLinkedin;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Player extends Model
{
    use HasFactory, HasLinkedin, SoftDeletes;

    public const SPORT_FOOTBALL = 'football';

    public const SPORT_BASKETBALL = 'basketball';

    public const SPORTS = [self::SPORT_FOOTBALL, self::SPORT_BASKETBALL];

    public const POSITIONS_FOOTBALL = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'];

    public const POSITIONS_BASKETBALL = ['PG', 'SG', 'SF', 'PF', 'C'];

    protected $fillable = [
        'user_id',
        'team_id',
        'academy_id',
        'sport',
        'full_name',
        'slug',
        'dob',
        'nationality',
        'position',
        'secondary_position',
        'foot',
        'dominant_hand',
        'height_cm',
        'weight_kg',
        'jersey_number',
        'bio',
        'primary_photo_url',
        'cv_url',
        'current_club',
        'previous_clubs',
        'achievements',
        'linkedin',
        'guardian_name',
        'guardian_consent_at',
        'is_public',
        'views_count',
    ];

    /**
     * Valid position codes for a given sport. Single source of truth for
     * FormRequests/Imports so the football/basketball lists never drift
     * out of sync across the multiple places that validate a position.
     */
    public static function positionsFor(?string $sport): array
    {
        return $sport === self::SPORT_BASKETBALL ? self::POSITIONS_BASKETBALL : self::POSITIONS_FOOTBALL;
    }

    /**
     * `foot`/`dominant_hand` are validated as merely optional (not rejected)
     * for the "wrong" sport, so a stale value from a client that switched
     * sport mid-form can still pass validation - this strips whichever field
     * doesn't belong to $sport regardless of what was submitted. Must be a
     * real unset(), not a null assignment: the basketball `players` table
     * (mysql_basketball connection) has no `foot` column at all, so leaving
     * the key present - even as null - throws "Unknown column" on insert.
     */
    public static function sanitizeFootHand(array $data, ?string $sport): array
    {
        if ($sport === self::SPORT_BASKETBALL) {
            unset($data['foot']);
        } else {
            unset($data['dominant_hand']);
        }

        return $data;
    }

    protected function casts(): array
    {
        return [
            'dob' => 'date',
            'is_public' => 'boolean',
            'height_cm' => 'integer',
            'weight_kg' => 'integer',
            'jersey_number' => 'integer',
            'views_count' => 'integer',
            'previous_clubs' => 'array',
            'guardian_consent_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function academy(): BelongsTo
    {
        return $this->belongsTo(AcademyProfile::class, 'academy_id');
    }

    public function mediaAssets(): HasMany
    {
        return $this->hasMany(MediaAsset::class);
    }

    public function watchlistedBy(): BelongsToMany
    {
        return $this->belongsToMany(AgentProfile::class, 'watchlists', 'player_id', 'agent_id')
            ->withPivot('notes')
            ->withTimestamps();
    }

    public function accessRequests(): HasMany
    {
        return $this->hasMany(AccessRequest::class);
    }

    protected function age(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->dob?->age,
        );
    }

    protected function isFreeAgent(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->team_id === null,
        );
    }

    /**
     * Football and basketball position codes never overlap (GK/CB/... vs
     * PG/SG/...), so this doesn't need a sport filter to stay accurate.
     */
    public function scopeByPosition($query, string $position)
    {
        return $query->where(function ($q) use ($position) {
            $q->where('position', $position)->orWhere('secondary_position', $position);
        });
    }

    public function scopeAgeBetween($query, ?int $min, ?int $max)
    {
        if ($min !== null) {
            $query->where('dob', '<=', now()->subYears($min)->toDateString());
        }

        if ($max !== null) {
            $query->where('dob', '>=', now()->subYears($max + 1)->addDay()->toDateString());
        }

        return $query;
    }

    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    /**
     * Public + owned by an active account. A soft-deleted/suspended/denied
     * user's players (free-agent or academy-owned) drop out of public listings.
     */
    public function scopeVisible($query)
    {
        return $query->public()->where(function ($q) {
            $q->whereHas('user', fn ($u) => $u->where('status', User::STATUS_ACTIVE))
                ->orWhereHas('academy.user', fn ($u) => $u->where('status', User::STATUS_ACTIVE));
        });
    }

    public function isOwnerActive(): bool
    {
        if ($this->user_id) {
            return $this->user?->isActive() ?? false;
        }

        return $this->academy?->user?->isActive() ?? false;
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * Football and basketball players live in two physically separate
     * databases with independent id/slug sequences, so a route parameter
     * like {player} can't know in advance which one it refers to. Try the
     * football table first (this class's own default resolution), then fall
     * back to BasketballPlayer - the result is still `instanceof Player`
     * either way (BasketballPlayer extends Player), so every controller
     * type-hinted `Player $player` keeps working unchanged.
     *
     * IMPORTANT: the fallback calls resolveRouteBindingQuery() + first()
     * directly, NOT ->resolveRouteBinding(). BasketballPlayer doesn't override
     * resolveRouteBinding(), so calling it would run THIS SAME inherited
     * method body again (with $this now a BasketballPlayer) - which would
     * retry parent::, fail again, and fall back to "new BasketballPlayer()"
     * forever. That infinite recursion only shows up when a lookup genuinely
     * matches nothing on either side (e.g. a bad/mistyped URL) - it stayed
     * hidden in earlier testing because those calls always matched a real row.
     */
    public function resolveRouteBinding($value, $field = null)
    {
        $basketball = new BasketballPlayer;

        return parent::resolveRouteBinding($value, $field)
            ?? $basketball->resolveRouteBindingQuery($basketball, $value, $field)->first();
    }

    /**
     * Slugs are only guaranteed unique within a single table by default, but
     * football and basketball players live in two separate tables/databases -
     * without cross-checking both, a same-named player on each side could get
     * an identical slug, and resolveRouteBinding()'s football-first fallback
     * would then make the basketball one permanently unreachable by slug.
     */
    public static function uniqueSlug(string $seed): string
    {
        $base = Str::slug($seed);
        $slug = $base;
        $i = 1;

        while (self::where('slug', $slug)->exists() || BasketballPlayer::where('slug', $slug)->exists()) {
            $slug = "{$base}-".(++$i);
        }

        return $slug;
    }
}
