<?php

namespace Database\Factories;

use App\Models\AdminLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AdminLog>
 */
class AdminLogFactory extends Factory
{
    public function definition(): array
    {
        return [
            'admin_id' => User::factory()->superAdmin(),
            'target_user_id' => User::factory(),
            'target_type' => null,
            'target_id' => null,
            'action' => fake()->randomElement(['approve', 'deny', 'suspend', 'reinstate', 'delete', 'verify']),
            'reason' => fake()->optional()->sentence(),
            'ip_address' => fake()->ipv4(),
        ];
    }
}
