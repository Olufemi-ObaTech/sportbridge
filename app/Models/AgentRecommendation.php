<?php

namespace App\Models;

use App\Models\Basketball\BasketballAgentProfile;
use App\Models\Basketball\BasketballPlayer;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * A non-binding, informational record of a proposed agent referral/commission
 * arrangement. SportBridge does not process, hold, or guarantee any payment.
 */
class AgentRecommendation extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Always the MAIN database - see AcademyProfile's note. Overrides
     * getConnectionName() rather than hardcoding $connection = 'mysql' so it
     * still resolves to the app's actual default connection (sqlite in tests).
     */
    public function getConnectionName()
    {
        return config('database.default');
    }

    public const STATUS_PENDING = 'pending';

    public const STATUS_ACKNOWLEDGED = 'acknowledged';

    public const STATUS_DECLINED = 'declined';

    protected $fillable = [
        'recommender_user_id',
        'agent_profile_id',
        'sport',
        'player_id',
        'recommended_to_name',
        'proposed_percentage',
        'note',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'proposed_percentage' => 'decimal:2',
        ];
    }

    public function recommender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recommender_user_id');
    }

    /**
     * agent_profile_id/player_id are ambiguous on their own (football and
     * basketball agent_profiles/players have independent auto-increment IDs
     * across two databases) - the `sport` column says which model/connection
     * to resolve against.
     */
    public function agentProfile(): BelongsTo
    {
        return $this->sport === 'basketball'
            ? $this->belongsTo(BasketballAgentProfile::class, 'agent_profile_id')
            : $this->belongsTo(AgentProfile::class, 'agent_profile_id');
    }

    public function player(): BelongsTo
    {
        return $this->sport === 'basketball'
            ? $this->belongsTo(BasketballPlayer::class, 'player_id')
            : $this->belongsTo(Player::class, 'player_id');
    }
}
