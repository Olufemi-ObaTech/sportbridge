<?php

namespace Database\Factories;

use App\Models\AgentProfile;
use App\Models\Player;
use App\Models\Watchlist;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Watchlist>
 */
class WatchlistFactory extends Factory
{
    public function definition(): array
    {
        return [
            'agent_id' => AgentProfile::factory(),
            'player_id' => Player::factory(),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
