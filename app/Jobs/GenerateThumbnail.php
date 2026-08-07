<?php

namespace App\Jobs;

use App\Models\MediaAsset;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;

/**
 * Dispatches synchronously in-request - Railway runs no queue worker
 * (QUEUE_CONNECTION=database, nothing ever calls queue:work), so a job
 * implementing ShouldQueue would just sit unprocessed forever. Matches the
 * fix already applied to every Notification class for the same reason.
 * Keeps Dispatchable (not the full Queueable bundle) so ::dispatch() still
 * works from MediaController - it just runs handle() immediately now.
 */
class GenerateThumbnail
{
    use Dispatchable;

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
