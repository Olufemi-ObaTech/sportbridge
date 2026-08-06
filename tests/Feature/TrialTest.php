<?php

namespace Tests\Feature;

use App\Models\AcademyProfile;
use App\Models\Player;
use App\Models\Team;
use App\Models\Trial;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TrialTest extends TestCase
{
    use RefreshDatabase;

    private function freeAgentPlayer(): Player
    {
        $user = User::factory()->create(['role' => User::ROLE_PLAYER, 'status' => User::STATUS_ACTIVE]);

        return Player::factory()->create(['user_id' => $user->id, 'team_id' => null, 'academy_id' => null, 'is_public' => true]);
    }

    private function academyManagedPlayer(): array
    {
        $academyUser = User::factory()->academy()->create(['status' => User::STATUS_ACTIVE]);
        $academy = AcademyProfile::factory()->create(['user_id' => $academyUser->id]);
        $team = Team::factory()->create(['academy_id' => $academy->id]);
        $player = Player::factory()->create(['team_id' => $team->id, 'academy_id' => $academy->id, 'user_id' => null, 'is_public' => true]);

        return [$academyUser, $player];
    }

    public function test_an_agent_can_propose_a_trial_for_a_free_agent_player(): void
    {
        $organizer = User::factory()->create(['status' => User::STATUS_ACTIVE]);
        $player = $this->freeAgentPlayer();

        $this->actingAs($organizer)
            ->post(route('trials.store', $player), [
                'scheduled_at' => now()->addWeek()->format('Y-m-d H:i:s'),
                'location' => 'Lagos Stadium',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('trials', [
            'organizer_user_id' => $organizer->id,
            'player_id' => $player->id,
            'sport' => 'football',
            'status' => Trial::STATUS_PENDING,
        ]);

        $this->assertSame(1, $player->user->unreadNotifications()->count());
    }

    public function test_proposing_a_trial_for_an_academy_managed_player_notifies_the_academy(): void
    {
        [$academyUser, $player] = $this->academyManagedPlayer();
        $organizer = User::factory()->create(['status' => User::STATUS_ACTIVE]);

        $this->actingAs($organizer)
            ->post(route('trials.store', $player), ['scheduled_at' => now()->addWeek()->format('Y-m-d H:i:s')])
            ->assertRedirect();

        $this->assertSame(1, $academyUser->fresh()->unreadNotifications()->count());
    }

    public function test_the_respondent_can_accept_a_trial(): void
    {
        [$academyUser, $player] = $this->academyManagedPlayer();
        $organizer = User::factory()->create(['status' => User::STATUS_ACTIVE]);

        $trial = Trial::create([
            'organizer_user_id' => $organizer->id,
            'player_id' => $player->id,
            'sport' => 'football',
            'scheduled_at' => now()->addWeek(),
            'status' => Trial::STATUS_PENDING,
        ]);

        $this->actingAs($academyUser)
            ->post(route('trials.respond', $trial), ['decision' => 'accepted'])
            ->assertRedirect();

        $this->assertSame(Trial::STATUS_ACCEPTED, $trial->fresh()->status);
        $this->assertSame(1, $organizer->fresh()->unreadNotifications()->count());
    }

    public function test_a_stranger_cannot_respond_to_someone_elses_trial(): void
    {
        [, $player] = $this->academyManagedPlayer();
        $organizer = User::factory()->create(['status' => User::STATUS_ACTIVE]);
        $stranger = User::factory()->create(['status' => User::STATUS_ACTIVE]);

        $trial = Trial::create([
            'organizer_user_id' => $organizer->id,
            'player_id' => $player->id,
            'sport' => 'football',
            'scheduled_at' => now()->addWeek(),
            'status' => Trial::STATUS_PENDING,
        ]);

        $this->actingAs($stranger)
            ->post(route('trials.respond', $trial), ['decision' => 'accepted'])
            ->assertForbidden();
    }

    public function test_the_organizer_can_cancel_a_pending_trial(): void
    {
        $organizer = User::factory()->create(['status' => User::STATUS_ACTIVE]);
        $player = $this->freeAgentPlayer();

        $trial = Trial::create([
            'organizer_user_id' => $organizer->id,
            'player_id' => $player->id,
            'sport' => 'football',
            'scheduled_at' => now()->addWeek(),
            'status' => Trial::STATUS_PENDING,
        ]);

        $this->actingAs($organizer)->post(route('trials.cancel', $trial))->assertRedirect();

        $this->assertSame(Trial::STATUS_CANCELLED, $trial->fresh()->status);
    }

    public function test_trials_index_shows_organized_and_received_trials_separately(): void
    {
        $organizer = User::factory()->create(['status' => User::STATUS_ACTIVE]);
        $player = $this->freeAgentPlayer();

        Trial::create([
            'organizer_user_id' => $organizer->id,
            'player_id' => $player->id,
            'sport' => 'football',
            'scheduled_at' => now()->addWeek(),
            'status' => Trial::STATUS_PENDING,
        ]);

        $this->actingAs($organizer)->get(route('trials.index'))->assertOk();
        $this->actingAs($player->user)->get(route('trials.index'))->assertOk();
    }
}
