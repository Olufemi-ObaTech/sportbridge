<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMediaRequest;
use App\Http\Requests\StoreYoutubeRequest;
use App\Jobs\GenerateThumbnail;
use App\Models\FeedPost;
use App\Models\MediaAsset;
use App\Models\Player;
use App\Services\ImageService;
use App\Services\YoutubeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class MediaController extends Controller
{
    public function __construct(protected ImageService $images, protected YoutubeService $youtube) {}

    public function upload(StoreMediaRequest $request, Player $player): RedirectResponse|JsonResponse
    {
        if ($request->hasFile('image')) {
            $path = $this->images->storePublicImage($request->file('image'), 'players/media', 1600);
            $media = $player->mediaAssets()->create([
                'type' => MediaAsset::TYPE_IMAGE,
                'url' => $path,
                'title' => $request->input('title'),
                'sort_order' => $player->mediaAssets()->max('sort_order') + 1,
            ]);

            GenerateThumbnail::dispatch($media->id);
        } else {
            $path = $request->file('video')->store('players/media', 'public');
            $player->mediaAssets()->create([
                'type' => MediaAsset::TYPE_VIDEO,
                'url' => $path,
                'title' => $request->input('title'),
                'sort_order' => $player->mediaAssets()->max('sort_order') + 1,
            ]);

            $this->crossPostToFeed($player, $request->input('title'), [['type' => 'video', 'url' => $path]]);
        }

        if ($request->wantsJson()) {
            return response()->json(['status' => 'ok']);
        }

        return back()->with('status', __('Media uploaded successfully.'));
    }

    public function storeYoutube(StoreYoutubeRequest $request, Player $player): RedirectResponse|JsonResponse
    {
        $videoId = $this->youtube->extractVideoId($request->string('url'));

        if (! $videoId) {
            return back()->withErrors(['url' => __('That does not look like a valid YouTube URL.')]);
        }

        $player->mediaAssets()->create([
            'type' => MediaAsset::TYPE_YOUTUBE,
            'youtube_embed_id' => $videoId,
            'thumbnail_url' => $this->youtube->thumbnailUrl($videoId),
            'title' => $request->input('title'),
            'sort_order' => $player->mediaAssets()->max('sort_order') + 1,
        ]);

        $this->crossPostToFeed($player, $request->input('title'), [['type' => 'youtube', 'url' => $videoId]]);

        if ($request->wantsJson()) {
            return response()->json(['status' => 'ok']);
        }

        return back()->with('status', __('Video added successfully.'));
    }

    /**
     * Self-registered (free agent) players publish their own videos, so a new
     * highlight also shows up as a post on the Community Feed. Academy-owned
     * players have no linked login and can't author feed posts.
     */
    protected function crossPostToFeed(Player $player, ?string $title, array $media): void
    {
        if (! $player->user_id || ! $player->is_public) {
            return;
        }

        FeedPost::create([
            'author_id' => $player->user_id,
            'content' => $title ?: __(':name posted a new highlight video.', ['name' => $player->full_name]),
            'media_urls' => $media,
            'visibility' => 'public',
        ]);
    }

    public function setFeatured(MediaAsset $mediaAsset): JsonResponse
    {
        $this->authorize('update', $mediaAsset->player);

        $mediaAsset->player->mediaAssets()->update(['is_featured' => false]);
        $mediaAsset->update(['is_featured' => true]);

        return response()->json(['status' => 'ok']);
    }

    public function reorder(Request $request, Player $player): JsonResponse
    {
        $this->authorize('update', $player);

        $order = (array) $request->input('order', []);

        foreach ($order as $index => $mediaId) {
            $player->mediaAssets()->where('id', $mediaId)->update(['sort_order' => $index]);
        }

        return response()->json(['status' => 'ok']);
    }

    public function destroy(MediaAsset $mediaAsset): RedirectResponse|JsonResponse
    {
        $this->authorize('update', $mediaAsset->player);

        $this->images->delete($mediaAsset->url);
        $this->images->delete($mediaAsset->thumbnail_url);
        $mediaAsset->delete();

        if (request()->wantsJson()) {
            return response()->json(['status' => 'ok']);
        }

        return back()->with('status', __('Media removed.'));
    }
}
