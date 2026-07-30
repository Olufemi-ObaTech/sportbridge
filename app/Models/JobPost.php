<?php

namespace App\Models;

use App\Models\Basketball\BasketballJobPost;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class JobPost extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'academy_id',
        'posted_by_user_id',
        'sport',
        'title',
        'role_type',
        'description',
        'requirements',
        'location',
        'salary_min',
        'salary_max',
        'currency',
        'contract_type',
        'application_deadline',
        'status',
        'applications_count',
    ];

    protected function casts(): array
    {
        return [
            'application_deadline' => 'date',
            'salary_min' => 'integer',
            'salary_max' => 'integer',
            'applications_count' => 'integer',
        ];
    }

    public function academy(): BelongsTo
    {
        return $this->belongsTo(AcademyProfile::class, 'academy_id');
    }

    public function postedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'posted_by_user_id');
    }

    protected function posterName(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->academy?->club_name ?? $this->postedBy?->name ?? __(':app member', ['app' => config('app.name')]),
        );
    }

    public function applications(): HasMany
    {
        return $this->hasMany(JobApplication::class);
    }

    public function scopeOpen($query)
    {
        return $query->where('status', 'open');
    }

    /**
     * Vacancy role options as [value => label] - reuses CoachProfile's
     * sport-aware coaching titles (job applicants are always coach accounts)
     * plus "Scout", which isn't a coaching title but is a real vacancy type.
     */
    public static function rolesFor(?string $sport): array
    {
        return CoachProfile::rolesFor($sport) + ['scout' => 'Scout'];
    }

    /**
     * Football and basketball job posts live in two physically separate
     * databases with independent id sequences - try football first (this
     * class's own default resolution), then fall back to BasketballJobPost.
     * See Player::resolveRouteBinding() for the full rationale, including
     * why this calls resolveRouteBindingQuery()+first() and NOT
     * ->resolveRouteBinding() (which would recurse infinitely on a genuine
     * not-found, since BasketballJobPost inherits this exact method body).
     */
    public function resolveRouteBinding($value, $field = null)
    {
        $basketball = new BasketballJobPost;

        return parent::resolveRouteBinding($value, $field)
            ?? $basketball->resolveRouteBindingQuery($basketball, $value, $field)->first();
    }
}
