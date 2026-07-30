<?php

namespace Database\Factories;

use App\Models\AgentProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AgentProfile>
 */
class AgentProfileFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory()->agent(),
            'agency_name' => fake()->company().' Sports Management',
            'sport' => AgentProfile::SPORT_FOOTBALL,
            'license_number' => strtoupper(fake()->bothify('FIFA-####-??')),
            'nationality' => fake()->country(),
            'experience_years' => fake()->numberBetween(1, 25),
            'regions' => fake()->randomElements(
                ['West Africa', 'East Africa', 'North Africa', 'Southern Africa', 'Europe', 'Middle East'],
                fake()->numberBetween(1, 3)
            ),
            'id_doc_url' => 'seed/id-'.fake()->uuid().'.pdf',
            'about' => fake()->paragraphs(2, true),
            'cover_image_url' => null,
        ];
    }
}
