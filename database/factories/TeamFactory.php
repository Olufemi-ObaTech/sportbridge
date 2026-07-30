<?php

namespace Database\Factories;

use App\Models\AcademyProfile;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Team>
 */
class TeamFactory extends Factory
{
    public function definition(): array
    {
        return [
            'academy_id' => AcademyProfile::factory(),
            'sport' => 'football',
            'name' => fake()->randomElement(['Eagles', 'Lions', 'Panthers', 'Hawks', 'Stallions']).' '.fake()->numberBetween(1, 3),
            'season' => '2025/2026',
            'age_group' => fake()->randomElement(['U-13', 'U-15', 'U-17', 'U-20', 'Senior', 'Women']),
            'coach_name' => fake()->name(),
        ];
    }

    public function basketball(): static
    {
        return $this->state(fn () => [
            'sport' => 'basketball',
            'name' => fake()->randomElement(['Ballers', 'Hoopers', 'Dunkers', 'Shooters', 'Risers']).' '.fake()->numberBetween(1, 3),
        ]);
    }
}
