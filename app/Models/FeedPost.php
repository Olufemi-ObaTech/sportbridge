<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class FeedPost extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'author_id',
        'sport',
        'content',
        'media_urls',
        'is_pinned',
        'is_training',
        'training_link',
        'training_at',
        'is_live',
        'live_link',
        'live_at',
        'visibility',
        'likes_count',
        'comments_count',
    ];

    protected function casts(): array
    {
        return [
            'media_urls' => 'array',
            'is_pinned' => 'boolean',
            'is_training' => 'boolean',
            'training_at' => 'datetime',
            'is_live' => 'boolean',
            'live_at' => 'datetime',
            'likes_count' => 'integer',
            'comments_count' => 'integer',
        ];
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(PostComment::class);
    }

    public function likes(): HasMany
    {
        return $this->hasMany(PostLike::class);
    }

    public function scopePinned($query)
    {
        return $query->where('is_pinned', true);
    }

    public function scopePublicVisibility($query)
    {
        return $query->where('visibility', 'public');
    }

    /**
     * Sport-tagged posts matching $sport, plus untagged/general posts -
     * a post isn't hidden just because it wasn't tagged to a sport.
     */
    public function scopeForSport($query, ?string $sport)
    {
        if ($sport === null) {
            return $query;
        }

        return $query->where(function ($q) use ($sport) {
            $q->where('sport', $sport)->orWhereNull('sport');
        });
    }
}
