<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\ImageManager;

class ImageService
{
    protected ImageManager $manager;

    public function __construct(?ImageManager $manager = null)
    {
        $this->manager = $manager ?? ImageManager::gd();
    }

    /**
     * Store a public-facing image (logo, cover photo, player photo) on the
     * "public" disk, downscaled and re-encoded as WebP with EXIF stripped.
     */
    public function storePublicImage(UploadedFile $file, string $directory, int $maxWidth = 1200): string
    {
        $image = $this->manager->read($file->getRealPath());
        $image->scaleDown(width: $maxWidth);

        $path = trim($directory, '/').'/'.Str::uuid().'.webp';
        Storage::disk('public')->put($path, (string) $image->toWebp(quality: 85));

        return $path;
    }

    /**
     * Store a sensitive document (license, ID, CV) on the private "local"
     * disk with a hashed filename. Never exposed via a public URL directly -
     * always served through a signed, authorized route.
     */
    public function storePrivateDocument(UploadedFile $file, string $directory): string
    {
        $filename = Str::uuid().'.'.$file->getClientOriginalExtension();

        return $file->storeAs(trim($directory, '/'), $filename, 'local');
    }

    public function delete(?string $path, string $disk = 'public'): void
    {
        if ($path) {
            Storage::disk($disk)->delete($path);
        }
    }
}
