<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AgentDocument extends Model
{
    use HasFactory;

    /**
     * Always the MAIN database (see AgentRating's identical note) - without
     * this, Eloquent's newRelatedInstance() auto-inherits whatever
     * connection the calling AgentProfile/BasketballAgentProfile happens to
     * have, since this model doesn't declare one of its own. That silently
     * sent basketball agents' documents() queries to the mysql_basketball
     * connection, where agent_documents doesn't exist (it lives centrally,
     * like agent_ratings/agent_recommendations) - 500 on every basketball
     * agent's dashboard. Overrides getConnectionName() rather than
     * hardcoding $connection = 'mysql' so it still resolves to the app's
     * actual default connection (sqlite in tests).
     */
    public function getConnectionName()
    {
        return config('database.default');
    }

    protected $fillable = [
        'agent_profile_id',
        'sport',
        'title',
        'file_url',
        'verified_at',
        'verified_by',
    ];

    protected function casts(): array
    {
        return [
            'verified_at' => 'datetime',
        ];
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
