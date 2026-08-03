<?php

namespace App\Models;

use App\Models\Basketball\BasketballAgentProfile;
use App\Models\Basketball\BasketballCoachProfile;
use App\Models\Basketball\BasketballPlayer;
use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, SoftDeletes;

    /**
     * Always the MAIN database regardless of caller - see AcademyProfile's
     * note for why this must be explicit. Overrides getConnectionName()
     * rather than hardcoding $connection = 'mysql' so it still resolves to
     * whatever the app's actual default connection is (sqlite in tests).
     */
    public function getConnectionName()
    {
        return config('database.default');
    }

    public const ROLE_SUPER_ADMIN = 'super_admin';

    public const ROLE_ACADEMY = 'academy';

    public const ROLE_AGENT = 'agent';

    public const ROLE_COACH = 'coach';

    public const ROLE_PLAYER = 'player';

    public const STATUS_PENDING = 'pending';

    public const STATUS_ACTIVE = 'active';

    public const STATUS_SUSPENDED = 'suspended';

    public const STATUS_DENIED = 'denied';

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        // Null for Academy (multi-sport, stays central) and Super Admin.
        // Set for Player/Agent/Coach, since their profile now lives in one
        // of two physical databases depending on which sport they chose.
        'sport',
        'status',
        'username',
        'profile_photo_path',
        'email_verified_at',
        'referred_by',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_seen_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function academyProfile(): HasOne
    {
        return $this->hasOne(AcademyProfile::class);
    }

    public function agentProfile(): HasOne
    {
        return $this->sport === 'basketball'
            ? $this->hasOne(BasketballAgentProfile::class, 'user_id')
            : $this->hasOne(AgentProfile::class);
    }

    public function coachProfile(): HasOne
    {
        return $this->sport === 'basketball'
            ? $this->hasOne(BasketballCoachProfile::class, 'user_id')
            : $this->hasOne(CoachProfile::class);
    }

    public function playerProfile(): HasOne
    {
        return $this->sport === 'basketball'
            ? $this->hasOne(BasketballPlayer::class, 'user_id')
            : $this->hasOne(Player::class);
    }

    public function feedPosts(): HasMany
    {
        return $this->hasMany(FeedPost::class, 'author_id');
    }

    public function referredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referred_by');
    }

    /**
     * Every role can already refer others via their personalized invite
     * link (see the invite-card component) - this counts who actually
     * completed registration through it, shown as a lightweight social
     * proof stat rather than tracking clicks.
     */
    public function referrals(): HasMany
    {
        return $this->hasMany(User::class, 'referred_by');
    }

    public function pushSubscriptions(): HasMany
    {
        return $this->hasMany(PushSubscription::class);
    }

    public function sentConversations(): HasMany
    {
        return $this->hasMany(Conversation::class, 'initiator_id');
    }

    public function receivedConversations(): HasMany
    {
        return $this->hasMany(Conversation::class, 'recipient_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function adminLogs(): HasMany
    {
        return $this->hasMany(AdminLog::class, 'admin_id');
    }

    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeRole($query, string $role)
    {
        return $query->where('role', $role);
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === self::ROLE_SUPER_ADMIN;
    }

    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function profile(): AcademyProfile|AgentProfile|CoachProfile|Player|BasketballAgentProfile|BasketballCoachProfile|BasketballPlayer|null
    {
        return match ($this->role) {
            self::ROLE_ACADEMY => $this->academyProfile,
            self::ROLE_AGENT => $this->agentProfile,
            self::ROLE_COACH => $this->coachProfile,
            self::ROLE_PLAYER => $this->playerProfile,
            default => null,
        };
    }
}
