<?php

namespace App\Models\Basketball;

use App\Models\AcademyProfile;
use App\Models\Team;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Basketball's version of Team - same shape, lives in the "mysql_basketball"
 * physical database. `academy()` stays inherited from Team unchanged since
 * academy_profiles lives centrally in the main database regardless of sport;
 * Eloquent resolves that relationship using AcademyProfile's own connection.
 */
class BasketballTeam extends Team
{
    protected $connection = 'mysql_basketball';

    protected $table = 'teams';

    public function academy(): BelongsTo
    {
        return $this->belongsTo(AcademyProfile::class, 'academy_id');
    }

    public function players(): HasMany
    {
        return $this->hasMany(BasketballPlayer::class, 'team_id');
    }
}
