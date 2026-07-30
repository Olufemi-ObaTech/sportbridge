<?php

namespace Database\Factories;

use App\Models\CoachProfile;
use App\Models\JobApplication;
use App\Models\JobPost;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<JobApplication>
 */
class JobApplicationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'job_post_id' => JobPost::factory(),
            'coach_profile_id' => CoachProfile::factory(),
            'cover_letter' => fake()->paragraphs(2, true),
            'cv_url' => null,
            'status' => 'pending',
            'applied_at' => now(),
        ];
    }
}
