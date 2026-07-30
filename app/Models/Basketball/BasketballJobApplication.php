<?php

namespace App\Models\Basketball;

use App\Models\JobApplication;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Basketball's version of JobApplication - lives in the "mysql_basketball"
 * physical database, intra-database FKs to BasketballJobPost/BasketballCoachProfile.
 */
class BasketballJobApplication extends JobApplication
{
    protected $connection = 'mysql_basketball';

    protected $table = 'job_applications';

    public function jobPost(): BelongsTo
    {
        return $this->belongsTo(BasketballJobPost::class, 'job_post_id');
    }

    public function coachProfile(): BelongsTo
    {
        return $this->belongsTo(BasketballCoachProfile::class, 'coach_profile_id');
    }
}
