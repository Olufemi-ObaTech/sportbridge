<?php

namespace App\Models\Basketball;

use App\Models\JobPost;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Basketball's version of JobPost - same shape, lives in the
 * "mysql_basketball" physical database. `academy()`/`postedBy()` stay
 * inherited unchanged since academy_profiles/users live centrally.
 */
class BasketballJobPost extends JobPost
{
    protected $connection = 'mysql_basketball';

    protected $table = 'job_posts';

    public function applications(): HasMany
    {
        return $this->hasMany(BasketballJobApplication::class, 'job_post_id');
    }
}
