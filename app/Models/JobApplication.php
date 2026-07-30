<?php

namespace App\Models;

use App\Models\Basketball\BasketballJobApplication;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_post_id',
        'coach_profile_id',
        'cover_letter',
        'cv_url',
        'status',
        'applied_at',
    ];

    protected function casts(): array
    {
        return [
            'applied_at' => 'datetime',
        ];
    }

    public function jobPost(): BelongsTo
    {
        return $this->belongsTo(JobPost::class);
    }

    public function coachProfile(): BelongsTo
    {
        return $this->belongsTo(CoachProfile::class);
    }

    /**
     * Football and basketball job applications live in two physically
     * separate databases with independent id sequences - try football first
     * (this class's own default resolution), then fall back to
     * BasketballJobApplication. See Player::resolveRouteBinding() for the
     * full rationale, including why this calls resolveRouteBindingQuery()+
     * first() and NOT ->resolveRouteBinding() (which would recurse
     * infinitely on a genuine not-found, since BasketballJobApplication
     * inherits this exact method body).
     */
    public function resolveRouteBinding($value, $field = null)
    {
        $basketball = new BasketballJobApplication;

        return parent::resolveRouteBinding($value, $field)
            ?? $basketball->resolveRouteBindingQuery($basketball, $value, $field)->first();
    }
}
