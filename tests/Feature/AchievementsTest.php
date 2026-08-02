<?php

namespace Tests\Feature;

use App\Models\AcademyProfile;
use App\Models\AgentProfile;
use App\Models\CoachProfile;
use App\Models\Player;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Every role can list achievements on their profile, self-editable and
 * publicly visible - Player already had the column, but it was only
 * settable by the managing academy and never actually displayed anywhere.
 */
class AchievementsTest extends TestCase
{
    use RefreshDatabase;

    public function test_academy_can_add_achievements_and_they_show_publicly(): void
    {
        $user = User::factory()->academy()->create(['status' => User::STATUS_ACTIVE]);
        $academy = AcademyProfile::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user)->put(route('academy.profile.update'), [
            'club_name' => $academy->club_name,
            'license_number' => $academy->license_number,
            'country' => $academy->country,
            'address' => $academy->address,
            'phone' => $academy->phone,
            'achievements' => 'National U-17 Champions 2024',
        ])->assertRedirect();

        $this->assertSame('National U-17 Champions 2024', $academy->fresh()->achievements);

        $this->get(route('academy.show', $academy->fresh()))
            ->assertOk()
            ->assertSee('National U-17 Champions 2024');
    }

    public function test_agent_can_add_achievements_and_they_show_publicly(): void
    {
        $user = User::factory()->agent()->create(['status' => User::STATUS_ACTIVE]);
        $agent = AgentProfile::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user)->put(route('agent.profile.update'), [
            'agency_name' => $agent->agency_name,
            'license_number' => $agent->license_number,
            'nationality' => $agent->nationality,
            'experience_years' => $agent->experience_years,
            'regions' => $agent->regions,
            'achievements' => 'Placed 20+ players in professional clubs',
        ])->assertRedirect();

        $this->assertSame('Placed 20+ players in professional clubs', $agent->fresh()->achievements);

        $this->get(route('agent.show', $user->username))
            ->assertOk()
            ->assertSee('Placed 20+ players in professional clubs');
    }

    public function test_coach_can_add_achievements_and_they_show_publicly(): void
    {
        $user = User::factory()->coach()->create(['status' => User::STATUS_ACTIVE]);
        $coach = CoachProfile::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user)->put(route('coach.profile.update'), [
            'full_name' => $coach->full_name,
            'preferred_role' => $coach->preferred_role,
            'experience_years' => $coach->experience_years,
            'nationality' => $coach->nationality,
            'badges' => $coach->badges,
            'achievements' => 'Won Regional Championship 2023',
        ])->assertRedirect();

        $this->assertSame('Won Regional Championship 2023', $coach->fresh()->achievements);

        $this->get(route('coach.show', $user->username))
            ->assertOk()
            ->assertSee('Won Regional Championship 2023');
    }

    public function test_player_can_self_edit_achievements_and_they_show_publicly(): void
    {
        $user = User::factory()->create(['role' => User::ROLE_PLAYER, 'status' => User::STATUS_ACTIVE]);
        $player = Player::factory()->create(['user_id' => $user->id, 'is_public' => true]);

        $this->actingAs($user)->put(route('player.profile.update'), [
            'full_name' => $player->full_name,
            'dob' => $player->dob->format('Y-m-d'),
            'nationality' => $player->nationality,
            'position' => $player->position,
            'foot' => $player->foot ?? 'right',
            'achievements' => 'Regional U-17 Top Scorer 2024',
        ])->assertRedirect();

        $this->assertSame('Regional U-17 Top Scorer 2024', $player->fresh()->achievements);

        $this->get(route('player.show', $player->fresh()))
            ->assertOk()
            ->assertSee('Regional U-17 Top Scorer 2024');
    }
}
