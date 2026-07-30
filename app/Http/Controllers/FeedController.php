<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFeedPostRequest;
use App\Http\Requests\UpdateFeedPostRequest;
use App\Models\FeedPost;
use App\Services\ImageService;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class FeedController extends Controller
{
    public function __construct(protected ImageService $images) {}

    public function index(Request $request): View
    {
        $sportParam = $request->query('sport');
        $sport = match (true) {
            $sportParam === 'all' => null,
            in_array($sportParam, ['football', 'basketball'], true) => $sportParam,
            default => session('sport', 'football'),
        };

        $posts = FeedPost::with(['author', 'comments.user'])
            ->publicVisibility()
            ->forSport($sport)
            ->orderByDesc('is_pinned')
            ->latest()
            ->paginate(10);

        return view('feed.index', ['posts' => $posts, 'currentSport' => $sport]);
    }

    public function store(StoreFeedPostRequest $request): RedirectResponse
    {
        $media = [];
        foreach ($request->file('media', []) as $file) {
            if (str_starts_with((string) $file->getMimeType(), 'video/')) {
                $media[] = ['type' => 'video', 'url' => $file->store('feed', 'public')];
            } else {
                $media[] = ['type' => 'image', 'url' => $this->images->storePublicImage($file, 'feed', 1600)];
            }
        }

        FeedPost::create([
            'author_id' => $request->user()->id,
            'sport' => $request->input('sport') ?: null,
            'content' => $request->string('content'),
            'media_urls' => $media ?: null,
            'is_training' => $request->boolean('is_training'),
            'training_link' => $request->boolean('is_training') ? $request->input('training_link') : null,
            'training_at' => $request->boolean('is_training') ? $request->input('training_at') : null,
            'is_live' => $request->boolean('is_live'),
            'live_link' => $request->boolean('is_live') ? $request->input('live_link') : null,
            'live_at' => $request->boolean('is_live') ? $request->input('live_at') : null,
            'visibility' => $request->input('visibility', 'public'),
        ]);

        return back()->with('status', __('Post published.'));
    }

    public function update(UpdateFeedPostRequest $request, FeedPost $feedPost): RedirectResponse
    {
        $feedPost->update([
            'content' => $request->string('content'),
            'visibility' => $request->input('visibility', $feedPost->visibility),
        ]);

        return back()->with('status', __('Post updated.'));
    }

    public function destroy(FeedPost $feedPost): RedirectResponse
    {
        $this->authorize('delete', $feedPost);

        foreach ((array) $feedPost->media_urls as $item) {
            $this->images->delete($item['url'] ?? null);
        }

        $feedPost->delete();

        return back()->with('status', __('Post deleted.'));
    }

    public function pin(FeedPost $feedPost): RedirectResponse
    {
        $this->authorize('pin', $feedPost);

        $feedPost->author->feedPosts()->update(['is_pinned' => false]);
        $feedPost->update(['is_pinned' => true]);

        return back()->with('status', __('Post pinned.'));
    }
}
