<?php

namespace App\Jobs;

use App\Models\MediaAsset;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;

class GenerateThumbnail implements ShouldQueue
{
    use Queueable;

    public function __construct(public int $mediaAssetId) {}

    public function handle(): void
    {
        /** @var MediaAsset|null $media */
        $media = MediaAsset::find($this->mediaAssetId);

        if (! $media || $media->type !== MediaAsset::TYPE_IMAGE || ! $media->url) {
            return;
        }

        if (! Storage::disk('public')->exists($media->url)) {
            return;
        }

        $manager = ImageManager::gd();
        $image = $manager->read(Storage::disk('public')->path($media->url));
        $image->scaleDown(width: 400);

        $thumbnailPath = 'players/thumbnails/'.pathinfo($media->url, PATHINFO_FILENAME).'.webp';
        Storage::disk('public')->put($thumbnailPath, (string) $image->toWebp(quality: 82));

        $media->update(['thumbnail_url' => $thumbnailPath]);
    }
}
