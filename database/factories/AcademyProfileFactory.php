<?php

namespace Database\Factories;

use App\Models\AcademyProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<AcademyProfile>
 */
class AcademyProfileFactory extends Factory
{
    public function definition(): array
    {
        $clubName = fake()->city().' '.fake()->randomElement(['FC', 'United', 'City', 'Academy', 'Rangers']);

        return [
            'user_id' => User::factory()->academy(),
            'club_name' => $clubName,
            'slug' => Str::slug($clubName).'-'.fake()->unique()->numberBetween(1000, 9999),
            'license_number' => strtoupper(fake()->bothify('LIC-####-????')),
            'license_doc_url' => 'seed/license-'.fake()->uuid().'.pdf',
            'country' => fake()->randomElement(['Nigeria', 'Ghana', 'Senegal', 'Ivory Coast', 'Morocco', 'South Africa']),
            'state' => fake()->state(),
            'address' => fake()->streetAddress(),
            'phone' => fake()->phoneNumber(),
            'year_founded' => fake()->numberBetween(1970, 2020),
            'logo_url' => null,
            'cover_image_url' => null,
            'about' => fake()->paragraphs(3, true),
            'verified_badge' => fake()->boolean(30),
        ];
    }

    public function verified(): static
    {
        return $this->state(fn (array $attributes) => ['verified_badge' => true]);
    }
}
