<?php

namespace Database\Factories;

use App\Models\AcademyProfile;
use App\Models\JobPost;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<JobPost>
 */
class JobPostFactory extends Factory
{
    public function definition(): array
    {
        $roleType = fake()->randomElement([
            'head_coach', 'assistant_coach', 'gk_coach', 'fitness_coach', 'analyst', 'physio', 'manager', 'scout',
        ]);

        $salaryMin = fake()->numberBetween(150_000, 500_000);

        return [
            'academy_id' => AcademyProfile::factory(),
            'title' => ucwords(str_replace('_', ' ', $roleType)).' - '.fake()->city(),
            'role_type' => $roleType,
            'description' => fake()->paragraphs(3, true),
            'requirements' => fake()->paragraph(),
            'location' => fake()->city().', '.fake()->country(),
            'salary_min' => $salaryMin,
            'salary_max' => $salaryMin + fake()->numberBetween(50_000, 300_000),
            'currency' => 'NGN',
            'contract_type' => fake()->randomElement(['full_time', 'part_time', 'contract', 'volunteer']),
            'application_deadline' => fake()->dateTimeBetween('+2 weeks', '+3 months')->format('Y-m-d'),
            'status' => 'open',
            'applications_count' => 0,
        ];
    }
}
