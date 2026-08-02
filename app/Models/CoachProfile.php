<?php

namespace App\Models;

use App\Models\Basketball\BasketballCoachProfile;
use App\Models\Concerns\HasLinkedin;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class CoachProfile extends Model
{
    use HasFactory, HasLinkedin, SoftDeletes;

    public const SPORT_FOOTBALL = 'football';

    public const SPORT_BASKETBALL = 'basketball';

    public const SPORTS = [self::SPORT_FOOTBALL, self::SPORT_BASKETBALL];

    public const BADGES_FOOTBALL = ['CAF D', 'CAF C', 'CAF B', 'CAF A', 'UEFA C', 'UEFA B', 'UEFA A', 'UEFA Pro', 'NFF Licence', 'Other'];

    // Real-world basketball coaching credentialing bodies (FIBA/USA Basketball/NCAA/national federations).
    public const BADGES_BASKETBALL = ['FIBA Coaching License', 'USA Basketball Coach License', 'NCAA Coaching Certification', 'National Federation Coaching License', 'Other'];

    // Roles shared by both sports.
    public const ROLES_SHARED = [
        'head_coach' => 'Head Coach',
        'assistant_coach' => 'Assistant Coach',
        'fitness_coach' => 'Strength & Conditioning Coach',
        'analyst' => 'Analyst',
        'physio' => 'Physio / Athletic Trainer',
        'manager' => 'Manager',
        'sporting_director' => 'Sporting Director',
        'technical_director' => 'Technical Director',
        'youth_coordinator' => 'Youth Coordinator',
        'team_manager' => 'Team Manager',
        'other' => 'Other',
    ];

    // Goalkeeper Coach is football/soccer-specific - basketball has no equivalent position.
    public const ROLES_FOOTBALL_ONLY = [
        'gk_coach' => 'Goalkeeper Coach',
    ];

    // Real basketball-specific coaching titles (research-backed: player development, shooting coach).
    public const ROLES_BASKETBALL_ONLY = [
        'player_development_coach' => 'Player Development Coach',
        'shooting_coach' => 'Shooting Coach',
    ];

    protected $fillable = [
        'user_id',
        'sport',
        'full_name',
        'badges',
        'certificates',
        'preferred_role',
        'experience_years',
        'current_club',
        'nationality',
        'cv_url',
        'about',
        'achievements',
        'cover_image_url',
        'photo_url',
        'open_to_work',
        'linkedin',
    ];

    public static function badgesFor(?string $sport): array
    {
        return $sport === self::SPORT_BASKETBALL ? self::BADGES_BASKETBALL : self::BADGES_FOOTBALL;
    }

    /**
     * Preferred-role options as [value => label], sport-specific roles
     * (Goalkeeper Coach / Player Development Coach, Shooting Coach) spliced
     * in right after Assistant Coach, shared roles after that.
     */
    public static function rolesFor(?string $sport): array
    {
        $sportOnly = $sport === self::SPORT_BASKETBALL ? self::ROLES_BASKETBALL_ONLY : self::ROLES_FOOTBALL_ONLY;

        return array_slice(self::ROLES_SHARED, 0, 2, true)
            + $sportOnly
            + array_slice(self::ROLES_SHARED, 2, null, true);
    }

    protected function casts(): array
    {
        return [
            'badges' => 'array',
            'certificates' => 'array',
            'experience_years' => 'integer',
            'open_to_work' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function jobApplications(): HasMany
    {
        return $this->hasMany(JobApplication::class, 'coach_profile_id');
    }

    /**
     * Football and basketball coach profiles live in two physically separate
     * databases with independent id sequences - try football first (this
     * class's own default resolution), then fall back to BasketballCoachProfile.
     * See Player::resolveRouteBinding() for the full rationale, including
     * why this calls resolveRouteBindingQuery()+first() and NOT
     * ->resolveRouteBinding() (which would recurse infinitely on a genuine
     * not-found, since BasketballCoachProfile inherits this exact method body).
     */
    public function resolveRouteBinding($value, $field = null)
    {
        $basketball = new BasketballCoachProfile;

        return parent::resolveRouteBinding($value, $field)
            ?? $basketball->resolveRouteBindingQuery($basketball, $value, $field)->first();
    }
}
