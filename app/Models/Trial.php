<?php

namespace App\Models;

use App\Models\Basketball\BasketballPlayer;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Trial extends Model
{
    public const STATUS_PENDING = 'pending';

    public const STATUS_ACCEPTED = 'accepted';

    public const STATUS_DECLINED = 'declined';

    public const STATUS_CANCELLED = 'cancelled';

    /**
     * Always the MAIN database - see AgentRating's note. Overrides
     * getConnectionName() rather than hardcoding $connection = 'mysql' so it
     * still resolves to the app's actual default connection (sqlite in tests).
     */
    public function getConnectionName()
    {
        return config('database.default');
    }

    protected $fillable = [
        'organizer_user_id',
        'player_id',
        'sport',
        'scheduled_at',
        'location',
        'notes',
        'status',
        'responded_at',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
            'responded_at' => 'datetime',
        ];
    }

    public function organizer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'organizer_user_id');
    }

    /**
     * player_id/sport disambiguate which physical database/table to query,
     * same pattern as AgentRating::agentProfile().
     */
    public function player(): BelongsTo
    {
        return $this->sport === 'basketball'
            ? $this->belongsTo(BasketballPlayer::class, 'player_id')
            : $this->belongsTo(Player::class, 'player_id');
    }

    /**
     * A free-agent player responds for themself; an academy-managed player
     * (no user_id of their own) has the academy's account respond on their
     * behalf instead.
     */
    public function respondentUser(): ?User
    {
        $player = $this->player;

        if (! $player) {
            return null;
        }

        return $player->user_id ? $player->user : $player->academy?->user;
    }

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }
}
