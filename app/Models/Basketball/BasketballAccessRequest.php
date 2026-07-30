<?php

namespace App\Models\Basketball;

use App\Models\AcademyProfile;
use App\Models\AccessRequest;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Basketball's version of AccessRequest - lives in the "mysql_basketball"
 * physical database. `agent()`/`player()` are intra-database FKs;
 * `academy()` stays inherited unchanged since academy_profiles lives
 * centrally (a soft, app-enforced reference - no DB-level FK, since
 * academy_profiles isn't in this database).
 */
class BasketballAccessRequest extends AccessRequest
{
    protected $connection = 'mysql_basketball';

    protected $table = 'access_requests';

    public function agent(): BelongsTo
    {
        return $this->belongsTo(BasketballAgentProfile::class, 'agent_id');
    }

    public function player(): BelongsTo
    {
        return $this->belongsTo(BasketballPlayer::class, 'player_id');
    }

    public function academy(): BelongsTo
    {
        return $this->belongsTo(AcademyProfile::class, 'academy_id');
    }
}
