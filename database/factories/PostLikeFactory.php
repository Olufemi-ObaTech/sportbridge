<?php

namespace Database\Factories;

use App\Models\FeedPost;
use App\Models\PostLike;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PostLike>
 */
class PostLikeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'feed_post_id' => FeedPost::factory(),
            'user_id' => User::factory(),
        ];
    }
}
