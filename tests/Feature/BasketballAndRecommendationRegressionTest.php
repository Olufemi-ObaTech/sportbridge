<?php

namespace Tests\Feature;

use App\Models\AcademyProfile;
use App\Models\AgentProfile;
use App\Models\Player;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Regression coverage for bugs found in the football->basketball
 * generalization and agent-recommendation "player_id" gap.
 */
class BasketballAndRecommendationRegressionTest extends TestCase
{
    use RefreshDatabase;

    public function test_academy_can_view_basketball_player_show_page(): void
    {
        $academy = User::factory()->academy()->create(['status' => User::STATUS_ACTIVE]);
        $academyProfile = AcademyProfile::factory()->create(['user_id' => $academy->id]);
        $team = Team::factory()->basketball()->create(['academy_id' => $academyProfile->id]);
        $player = Player::factory()->basketball()->create(['team_id' => $team->id, 'academy_id' => $academyProfile->id]);

        $response = $this->actingAs($academy)->get(route('academy.players.show', $player));

        $response->assertOk();
        $response->assertSee('Hand');
    }

    public function test_football_player_show_page_still_shows_foot(): void
    {
        $academy = User::factory()->academy()->create(['status' => User::STATUS_ACTIVE]);
        $academyProfile = AcademyProfile::factory()->create(['user_id' => $academy->id]);
        $team = Team::factory()->create(['academy_id' => $academyProfile->id]);
        $player = Player::factory()->create(['team_id' => $team->id, 'academy_id' => $academyProfile->id]);

        $response = $this->actingAs($academy)->get(route('academy.players.show', $player));

        $response->assertOk();
        $response->assertSee('Foot');
    }

    public function test_authenticated_user_sees_recommend_agent_modal_with_search_box(): void
    {
        $player = User::factory()->create(['status' => User::STATUS_ACTIVE]);
        Player::factory()->create(['user_id' => $player->id, 'team_id' => null, 'academy_id' => null]);

        $agent = AgentProfile::factory()->create();
        $agent->user()->update(['status' => User::STATUS_ACTIVE, 'username' => 'test-agent-username']);

        $response = $this->actingAs($player)->get(route('agent.show', 'test-agent-username'));

        $response->assertOk();
        $response->assertSee('recommend_search', false);
        $response->assertSee('This is me');
    }

    public function test_recommendation_store_with_player_id_appears_in_sent_and_received(): void
    {
        $recommender = User::factory()->create(['status' => User::STATUS_ACTIVE]);
        $playerUser = User::factory()->create(['status' => User::STATUS_ACTIVE]);
        $player = Player::factory()->create(['user_id' => $playerUser->id, 'team_id' => null, 'academy_id' => null]);
        $agent = AgentProfile::factory()->create();

        $this->actingAs($recommender)->post(route('agents.recommendations.store', $agent), [
            'player_id' => $player->id,
            'proposed_percentage' => 10,
        ])->assertRedirect();

        $this->assertDatabaseHas('agent_recommendations', [
            'recommender_user_id' => $recommender->id,
            'agent_profile_id' => $agent->id,
            'player_id' => $player->id,
        ]);

        $sentResponse = $this->actingAs($recommender)->get(route('recommendations.index'));
        $sentResponse->assertOk();
        $sentResponse->assertSee($agent->agency_name);

        $receivedResponse = $this->actingAs($playerUser)->get(route('recommendations.index'));
        $receivedResponse->assertOk();
        $receivedResponse->assertSee($agent->agency_name);
        $receivedResponse->assertSee('Acknowledge');
    }

    public function test_both_player_id_and_recommended_to_name_together_is_rejected(): void
    {
        $recommender = User::factory()->create(['status' => User::STATUS_ACTIVE]);
        $player = Player::factory()->create();
        $agent = AgentProfile::factory()->create();

        $this->actingAs($recommender)->post(route('agents.recommendations.store', $agent), [
            'player_id' => $player->id,
            'recommended_to_name' => 'Someone Else',
            'proposed_percentage' => 10,
        ])->assertSessionHasErrors();
    }
}
