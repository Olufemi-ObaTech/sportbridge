<?php

namespace App\Models;

use App\Models\Basketball\BasketballAccessRequest;
use App\Models\Basketball\BasketballJobPost;
use App\Models\Basketball\BasketballPlayer;
use App\Models\Basketball\BasketballTeam;
use App\Models\Concerns\HasLinkedin;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class AcademyProfile extends Model
{
    use HasFactory, HasLinkedin, SoftDeletes;

    /**
     * Always the MAIN database regardless of caller - without this,
     * Eloquent's newRelatedInstance() silently inherits the CALLING model's
     * connection for any related model that hasn't declared its own, which
     * would hijack this onto "mysql_basketball" when accessed via a
     * Basketball* model's academy() relation. Overrides getConnectionName()
     * (rather than hardcoding $connection = 'mysql') so it dynamically
     * resolves to whatever the app's actual default connection is - 'mysql'
     * in production, 'sqlite' in tests - instead of forcing a literal
     * connection name that would bypass the test suite's sqlite swap.
     */
    public function getConnectionName()
    {
        return config('database.default');
    }

    protected $fillable = [
        'user_id',
        'club_name',
        'slug',
        'license_number',
        'license_doc_url',
        'fifa_connect_id',
        'has_fifa_tms_account',
        'fiba_map_id',
        'has_fiba_map_account',
        'country',
        'state',
        'address',
        'phone',
        'year_founded',
        'logo_url',
        'cover_image_url',
        'about',
        'achievements',
        'verified_badge',
        'leagues',
        'languages',
        'sports',
        'linkedin',
    ];

    protected function casts(): array
    {
        return [
            'verified_badge' => 'boolean',
            'has_fifa_tms_account' => 'boolean',
            'has_fiba_map_account' => 'boolean',
            'year_founded' => 'integer',
            'leagues' => 'array',
            'languages' => 'array',
            'sports' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function teams(): HasMany
    {
        return $this->hasMany(Team::class, 'academy_id');
    }

    public function players(): HasMany
    {
        return $this->hasMany(Player::class, 'academy_id');
    }

    public function jobPosts(): HasMany
    {
        return $this->hasMany(JobPost::class, 'academy_id');
    }

    public function accessRequests(): HasMany
    {
        return $this->hasMany(AccessRequest::class, 'academy_id');
    }

    /**
     * Basketball siblings - academy_profiles stays central (one row can run
     * both sports via the `sports` JSON column above), but its basketball
     * teams/players/jobs/access-requests live in the mysql_basketball
     * database, so these relations point at the Basketball* models instead.
     */
    public function basketballTeams(): HasMany
    {
        return $this->hasMany(BasketballTeam::class, 'academy_id');
    }

    public function basketballPlayers(): HasMany
    {
        return $this->hasMany(BasketballPlayer::class, 'academy_id');
    }

    public function basketballJobPosts(): HasMany
    {
        return $this->hasMany(BasketballJobPost::class, 'academy_id');
    }

    public function basketballAccessRequests(): HasMany
    {
        return $this->hasMany(BasketballAccessRequest::class, 'academy_id');
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
