<?php

namespace Database\Factories;

use App\Models\FeedPost;
use App\Models\PostComment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PostComment>
 */
class PostCommentFactory extends Factory
{
    private const SAMPLE_COMMENTS = [
        'Great news, well deserved!',
        'This is exactly the kind of progress we love to see.',
        'Congratulations to everyone involved.',
        'Really impressive work from the whole squad.',
        'Would love to know more details about this.',
        'Keep up the great work!',
        'Excellent update, thanks for sharing.',
        'This is inspiring for young players everywhere.',
        'Fantastic to see the hard work paying off.',
        'Looking forward to seeing more like this.',
        'Well done to the coaching staff too.',
        'Brilliant news for the academy.',
        'That is a huge step forward.',
        'So proud of this progress.',
        'Amazing effort from everyone involved.',
    ];

    public function definition(): array
    {
        return [
            'feed_post_id' => FeedPost::factory(),
            'user_id' => User::factory(),
            'body' => fake()->randomElement(self::SAMPLE_COMMENTS),
        ];
    }
}
