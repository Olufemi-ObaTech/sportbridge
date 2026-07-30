<?php

namespace App\Models\Basketball;

use App\Models\CoachProfile;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Basketball's version of CoachProfile - same shape, lives in the
 * "mysql_basketball" physical database. `user()` stays inherited unchanged.
 */
class BasketballCoachProfile extends CoachProfile
{
    protected $connection = 'mysql_basketball';

    protected $table = 'coach_profiles';

    public function jobApplications(): HasMany
    {
        return $this->hasMany(BasketballJobApplication::class, 'coach_profile_id');
    }
}
