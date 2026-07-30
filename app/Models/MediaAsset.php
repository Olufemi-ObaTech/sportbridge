<?php

namespace App\Models;

use App\Models\Basketball\BasketballMediaAsset;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MediaAsset extends Model
{
    use HasFactory;

    public const TYPE_IMAGE = 'image';

    public const TYPE_VIDEO = 'video';

    public const TYPE_YOUTUBE = 'youtube';

    protected $fillable = [
        'player_id',
        'type',
        'url',
        'youtube_embed_id',
        'title',
        'thumbnail_url',
        'duration_seconds',
        'is_featured',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_featured' => 'boolean',
            'duration_seconds' => 'integer',
            'sort_order' => 'integer',
        ];
    }

    public function player(): BelongsTo
    {
        return $this->belongsTo(Player::class);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Football and basketball media assets live in two physically separate
     * databases with independent id sequences - try football first (this
     * class's own default resolution), then fall back to BasketballMediaAsset.
     * See Player::resolveRouteBinding() for the full rationale, including
     * why this calls resolveRouteBindingQuery()+first() and NOT
     * ->resolveRouteBinding() (which would recurse infinitely on a genuine
     * not-found, since BasketballMediaAsset inherits this exact method body).
     */
    public function resolveRouteBinding($value, $field = null)
    {
        $basketball = new BasketballMediaAsset;

        return parent::resolveRouteBinding($value, $field)
            ?? $basketball->resolveRouteBindingQuery($basketball, $value, $field)->first();
    }
}
