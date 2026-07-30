<?php

namespace Database\Factories;

use App\Models\AcademyProfile;
use App\Models\AccessRequest;
use App\Models\AgentProfile;
use App\Models\Player;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AccessRequest>
 */
class AccessRequestFactory extends Factory
{
    public function definition(): array
    {
        return [
            'agent_id' => AgentProfile::factory(),
            'player_id' => Player::factory(),
            'academy_id' => AcademyProfile::factory(),
            'status' => 'pending',
            'message' => fake()->paragraph(),
            'responded_at' => null,
        ];
    }
}
