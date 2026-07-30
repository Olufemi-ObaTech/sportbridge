<?php

namespace Tests\Feature;

use App\Models\CoachProfile;
use App\Models\JobPost;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class JobApplicationTest extends TestCase
{
    use RefreshDatabase;

    public function test_coach_can_apply_to_an_open_job(): void
    {
        $coach = CoachProfile::factory()->create();
        $job = JobPost::factory()->create(['status' => 'open']);

        $response = $this->actingAs($coach->user)->post(route('coach.jobs.apply', $job), [
            'cover_letter' => 'I would love to join your club.',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('job_applications', [
            'job_post_id' => $job->id,
            'coach_profile_id' => $coach->id,
        ]);
        $this->assertSame(1, $job->fresh()->applications_count);
    }

    public function test_coach_cannot_apply_twice_to_the_same_job(): void
    {
        $coach = CoachProfile::factory()->create();
        $job = JobPost::factory()->create(['status' => 'open']);

        $this->actingAs($coach->user)->post(route('coach.jobs.apply', $job), [
            'cover_letter' => 'First application.',
        ])->assertRedirect();

        $this->actingAs($coach->user)->post(route('coach.jobs.apply', $job), [
            'cover_letter' => 'Second application.',
        ])->assertSessionHasErrors('cover_letter');

        $this->assertDatabaseCount('job_applications', 1);
    }

    public function test_coach_cannot_apply_to_a_closed_job(): void
    {
        $coach = CoachProfile::factory()->create();
        $job = JobPost::factory()->create(['status' => 'closed']);

        $this->actingAs($coach->user)->post(route('coach.jobs.apply', $job), [
            'cover_letter' => 'Please consider me.',
        ])->assertForbidden();
    }

    public function test_academy_cannot_apply_to_a_job(): void
    {
        $job = JobPost::factory()->create(['status' => 'open']);
        $academy = $job->academy->user;

        $this->actingAs($academy)->post(route('coach.jobs.apply', $job), [
            'cover_letter' => 'Should not work.',
        ])->assertForbidden();
    }
}
