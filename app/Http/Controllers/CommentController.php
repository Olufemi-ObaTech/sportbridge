<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCommentRequest;
use App\Models\FeedPost;
use App\Models\PostComment;
use Illuminate\Http\RedirectResponse;

class CommentController extends Controller
{
    public function store(StoreCommentRequest $request, FeedPost $feedPost): RedirectResponse
    {
        $feedPost->comments()->create([
            'user_id' => $request->user()->id,
            'body' => $request->string('body'),
        ]);

        $feedPost->increment('comments_count');

        return back()->with('status', __('Comment added.'));
    }

    public function destroy(PostComment $comment): RedirectResponse
    {
        $user = request()->user();
        $canDeleteAsPostOwner = $user->can('delete', $comment->post);

        abort_unless($user->id === $comment->user_id || $canDeleteAsPostOwner, 403);

        $comment->post()->decrement('comments_count');
        $comment->delete();

        return back()->with('status', __('Comment removed.'));
    }
}
