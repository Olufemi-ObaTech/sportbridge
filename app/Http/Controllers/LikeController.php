<?php

namespace App\Http\Controllers;

use App\Models\FeedPost;
use App\Models\PostLike;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LikeController extends Controller
{
    public function toggle(Request $request, FeedPost $feedPost): JsonResponse
    {
        $this->authorize('view', $feedPost);

        $like = PostLike::where('feed_post_id', $feedPost->id)->where('user_id', $request->user()->id)->first();

        if ($like) {
            $like->delete();
            $feedPost->decrement('likes_count');
            $liked = false;
        } else {
            PostLike::create(['feed_post_id' => $feedPost->id, 'user_id' => $request->user()->id]);
            $feedPost->increment('likes_count');
            $liked = true;
        }

        return response()->json(['liked' => $liked, 'likes_count' => $feedPost->fresh()->likes_count]);
    }
}
