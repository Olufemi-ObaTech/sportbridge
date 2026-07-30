<?php

namespace Database\Factories;

use App\Models\Player;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Player>
 */
class PlayerFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->name();
        $sport = Player::SPORT_FOOTBALL;
        $positions = Player::positionsFor($sport);

        return [
            'team_id' => Team::factory(),
            'academy_id' => fn (array $attributes) => Team::find($attributes['team_id'])?->academy_id,
            'sport' => $sport,
            'full_name' => $name,
            'slug' => Str::slug($name).'-'.fake()->unique()->numberBetween(1000, 9999),
            'dob' => fake()->dateTimeBetween('-30 years', '-15 years')->format('Y-m-d'),
            'nationality' => fake()->country(),
            'position' => fake()->randomElement($positions),
            'secondary_position' => fake()->optional(0.4)->randomElement($positions),
            'foot' => fake()->randomElement(['left', 'right', 'both']),
            'height_cm' => fake()->numberBetween(165, 198),
            'weight_kg' => fake()->numberBetween(58, 92),
            'jersey_number' => fake()->numberBetween(1, 99),
            'bio' => fake()->paragraph(),
            'primary_photo_url' => null,
            'is_public' => true,
            'views_count' => fake()->numberBetween(0, 500),
        ];
    }

    // Realistic, position-correlated height/weight ranges (cm/kg) - guards run
    // shorter and lighter, centers taller and heavier, matching real basketball builds.
    private const BASKETBALL_PHYSIQUE = [
        'PG' => ['height' => [178, 193], 'weight' => [75, 95]],
        'SG' => ['height' => [188, 198], 'weight' => [80, 100]],
        'SF' => ['height' => [196, 206], 'weight' => [90, 110]],
        'PF' => ['height' => [203, 211], 'weight' => [100, 120]],
        'C' => ['height' => [208, 218], 'weight' => [110, 130]],
    ];

    public function basketball(): static
    {
        return $this->state(function () {
            $positions = Player::positionsFor(Player::SPORT_BASKETBALL);
            $position = fake()->randomElement($positions);
            $physique = self::BASKETBALL_PHYSIQUE[$position];

            return [
                'team_id' => Team::factory()->basketball(),
                'sport' => Player::SPORT_BASKETBALL,
                'position' => $position,
                'secondary_position' => fake()->optional(0.4)->randomElement($positions),
                'foot' => null,
                'dominant_hand' => fake()->randomElement(['left', 'right', 'ambidextrous']),
                'height_cm' => fake()->numberBetween(...$physique['height']),
                'weight_kg' => fake()->numberBetween(...$physique['weight']),
                'jersey_number' => fake()->numberBetween(0, 99),
            ];
        });
    }
}
