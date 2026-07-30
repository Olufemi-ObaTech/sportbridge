<?php

namespace Database\Factories;

use App\Models\MediaAsset;
use App\Models\Player;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MediaAsset>
 */
class MediaAssetFactory extends Factory
{
    public function definition(): array
    {
        $type = fake()->randomElement(['image', 'video', 'youtube']);

        return [
            'player_id' => Player::factory(),
            'type' => $type,
            'url' => $type === 'youtube' ? null : 'seed/media-'.fake()->uuid().'.jpg',
            'youtube_embed_id' => $type === 'youtube' ? fake()->regexify('[A-Za-z0-9_-]{11}') : null,
            'title' => fake()->sentence(4),
            'thumbnail_url' => null,
            'duration_seconds' => $type === 'image' ? null : fake()->numberBetween(15, 300),
            'is_featured' => false,
            'sort_order' => fake()->numberBetween(0, 10),
        ];
    }

    public function featured(): static
    {
        return $this->state(fn (array $attributes) => ['is_featured' => true]);
    }
}
