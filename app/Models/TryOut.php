<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TryOut extends Model
{
    use HasFactory;

    public const SPORT_FOOTBALL = 'football';

    public const SPORT_BASKETBALL = 'basketball';

    public const GENDER_MALE = 'male';

    public const GENDER_FEMALE = 'female';

    public const GENDER_MIXED = 'mixed';

    public const STATUS_OPEN = 'open';

    public const STATUS_CLOSED = 'closed';

    /**
     * Always the MAIN database - see AgentRating's note. Overrides
     * getConnectionName() rather than hardcoding $connection = 'mysql' so it
     * still resolves to the app's actual default connection (sqlite in tests).
     */
    public function getConnectionName()
    {
        return config('database.default');
    }

    protected $fillable = [
        'posted_by_user_id',
        'sport',
        'gender',
        'title',
        'description',
        'location',
        'scheduled_date',
        'age_group',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_date' => 'date',
        ];
    }

    public function postedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'posted_by_user_id');
    }

    public function interests(): HasMany
    {
        return $this->hasMany(TryOutInterest::class);
    }

    public function scopeOpen($query)
    {
        return $query->where('status', self::STATUS_OPEN);
    }

    public function isOpen(): bool
    {
        return $this->status === self::STATUS_OPEN;
    }
}
