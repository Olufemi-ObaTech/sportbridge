<?php

namespace App\Models;

use App\Models\Basketball\BasketballAccessRequest;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AccessRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'agent_id',
        'player_id',
        'academy_id',
        'status',
        'message',
        'responded_at',
    ];

    protected function casts(): array
    {
        return [
            'responded_at' => 'datetime',
        ];
    }

    public function agent(): BelongsTo
    {
        return $this->belongsTo(AgentProfile::class, 'agent_id');
    }

    public function player(): BelongsTo
    {
        return $this->belongsTo(Player::class);
    }

    public function academy(): BelongsTo
    {
        return $this->belongsTo(AcademyProfile::class, 'academy_id');
    }

    public function isGranted(): bool
    {
        return $this->status === 'granted';
    }

    /**
     * Football and basketball access requests live in two physically
     * separate databases with independent id sequences - try football first
     * (this class's own default resolution), then fall back to
     * BasketballAccessRequest. See Player::resolveRouteBinding() for the
     * full rationale, including why this calls resolveRouteBindingQuery()+
     * first() and NOT ->resolveRouteBinding() (which would recurse
     * infinitely on a genuine not-found, since BasketballAccessRequest
     * inherits this exact method body).
     */
    public function resolveRouteBinding($value, $field = null)
    {
        $basketball = new BasketballAccessRequest;

        return parent::resolveRouteBinding($value, $field)
            ?? $basketball->resolveRouteBindingQuery($basketball, $value, $field)->first();
    }
}
