<?php

namespace Tests\Feature;

use App\Models\AcademyProfile;
use App\Models\AccessRequest;
use App\Models\AgentProfile;
use App\Models\Conversation;
use App\Models\Player;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AgentRatingGateTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_without_any_interaction_cannot_rate_an_agent(): void
    {
        $agent = AgentProfile::factory()->create();
        $rater = User::factory()->coach()->create(['status' => User::STATUS_ACTIVE]);

        $response = $this->actingAs($rater)->post(route('agents.ratings.store', $agent), [
            'score' => 5,
        ]);

        $response->assertForbidden();
        $this->assertDatabaseMissing('agent_ratings', ['user_id' => $rater->id]);
    }

    public function test_user_who_has_messaged_the_agent_can_rate_them(): void
    {
        $agent = AgentProfile::factory()->create();
        $rater = User::factory()->coach()->create(['status' => User::STATUS_ACTIVE]);

        Conversation::factory()->create([
            'initiator_id' => $rater->id,
            'recipient_id' => $agent->user_id,
        ]);

        $response = $this->actingAs($rater)->post(route('agents.ratings.store', $agent), [
            'score' => 4,
            'comment' => 'Responsive and professional.',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('agent_ratings', ['user_id' => $rater->id, 'agent_profile_id' => $agent->id, 'score' => 4]);
    }

    public function test_academy_whose_player_granted_the_agent_access_can_rate_them(): void
    {
        $agent = AgentProfile::factory()->create();
        $academyUser = User::factory()->academy()->create(['status' => User::STATUS_ACTIVE]);
        $academyProfile = AcademyProfile::factory()->create(['user_id' => $academyUser->id]);
        $team = Team::factory()->create(['academy_id' => $academyProfile->id]);
        $player = Player::factory()->create(['team_id' => $team->id, 'academy_id' => $academyProfile->id]);

        AccessRequest::factory()->create([
            'agent_id' => $agent->id,
            'player_id' => $player->id,
            'academy_id' => $academyProfile->id,
            'status' => 'granted',
        ]);

        $response = $this->actingAs($academyUser)->post(route('agents.ratings.store', $agent), [
            'score' => 5,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('agent_ratings', ['user_id' => $academyUser->id, 'agent_profile_id' => $agent->id]);
    }

    public function test_user_can_update_their_own_existing_rating_without_a_fresh_interaction(): void
    {
        $agent = AgentProfile::factory()->create();
        $rater = User::factory()->coach()->create(['status' => User::STATUS_ACTIVE]);

        Conversation::factory()->create(['initiator_id' => $rater->id, 'recipient_id' => $agent->user_id]);
        $this->actingAs($rater)->post(route('agents.ratings.store', $agent), ['score' => 3]);

        // No new interaction - just updating the existing rating - must still work.
        $response = $this->actingAs($rater)->post(route('agents.ratings.store', $agent), ['score' => 5]);

        $response->assertRedirect();
        $this->assertDatabaseHas('agent_ratings', ['user_id' => $rater->id, 'agent_profile_id' => $agent->id, 'score' => 5]);
    }
}
