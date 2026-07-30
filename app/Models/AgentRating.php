<?php

namespace App\Models;

use App\Models\Basketball\BasketballAgentProfile;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class AgentRating extends Model
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

    protected $fillable = [
        'user_id',
        'agent_profile_id',
        'sport',
        'score',
        'comment',
    ];

    protected function casts(): array
    {
        return [
            'score' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * agent_profile_id is ambiguous on its own (football and basketball
     * agent_profiles have independent auto-increment IDs across two
     * databases) - the `sport` column says which model/connection to resolve.
     */
    public function agentProfile(): BelongsTo
    {
        return $this->sport === 'basketball'
            ? $this->belongsTo(BasketballAgentProfile::class, 'agent_profile_id')
            : $this->belongsTo(AgentProfile::class, 'agent_profile_id');
    }
}
