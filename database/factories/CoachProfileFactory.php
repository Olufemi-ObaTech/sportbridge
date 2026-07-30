<?php

namespace Database\Factories;

use App\Models\CoachProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CoachProfile>
 */
class CoachProfileFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory()->coach(),
            'full_name' => fake()->name(),
            'badges' => fake()->randomElements(
                ['CAF D', 'CAF C', 'CAF B', 'CAF A', 'UEFA C', 'UEFA B', 'UEFA A', 'UEFA Pro', 'NFF Licence', 'Other'],
                fake()->numberBetween(1, 3)
            ),
            'preferred_role' => fake()->randomElement([
                'head_coach', 'assistant_coach', 'gk_coach', 'fitness_coach', 'analyst', 'physio', 'manager',
            ]),
            'experience_years' => fake()->numberBetween(1, 30),
            'current_club' => fake()->optional()->company().' FC',
            'nationality' => fake()->country(),
            'cv_url' => 'seed/cv-'.fake()->uuid().'.pdf',
            'about' => fake()->paragraphs(2, true),
            'cover_image_url' => null,
            'open_to_work' => fake()->boolean(80),
        ];
    }
}
