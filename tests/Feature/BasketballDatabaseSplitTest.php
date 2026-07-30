<?php

namespace Tests\Feature;

use App\Models\AcademyProfile;
use App\Models\AgentProfile;
use App\Models\Basketball\BasketballAgentProfile;
use App\Models\Basketball\BasketballCoachProfile;
use App\Models\Basketball\BasketballJobPost;
use App\Models\Basketball\BasketballPlayer;
use App\Models\Basketball\BasketballTeam;
use App\Models\Basketball\BasketballWatchlist;
use App\Models\JobPost;
use App\Models\Team;
use App\Models\User;
use App\Models\Watchlist;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Regression coverage for the football/basketball physical database split:
 * cross-sport action guards (watchlist/job applications) and the write paths
 * that must land a new row in the correct physical database.
 */
class BasketballDatabaseSplitTest extends TestCase
{
    use RefreshDatabase;

    protected function makeBasketballAgent(): array
    {
        $user = User::factory()->agent()->create(['status' => User::STATUS_ACTIVE, 'sport' => 'basketball']);

        $profile = BasketballAgentProfile::create([
            'user_id' => $user->id,
            'agency_name' => 'Hoops Talent',
            'sport' => 'basketball',
            'license_number' => 'FIBA-123',
            'nationality' => 'USA',
            'experience_years' => 5,
            'regions' => ['North America'],
            'id_doc_url' => 'seed/id-test.pdf',
        ]);

        return [$user, $profile];
    }

    protected function makeBasketballPlayer(): BasketballPlayer
    {
        $academy = AcademyProfile::factory()->create(['sports' => ['basketball']]);
        $team = BasketballTeam::create([
            'academy_id' => $academy->id,
            'sport' => 'basketball',
            'name' => 'Hoopers 1',
            'season' => '2025/2026',
            'age_group' => 'Senior',
        ]);

        return BasketballPlayer::create([
            'academy_id' => $academy->id,
            'team_id' => $team->id,
            'sport' => 'basketball',
            'full_name' => 'Test Hooper',
            'slug' => 'test-hooper-'.uniqid(),
            'dob' => '2005-01-01',
            'nationality' => 'USA',
            'position' => 'PG',
            'dominant_hand' => 'right',
            'is_public' => true,
        ]);
    }

    public function test_football_agent_cannot_watchlist_a_basketball_player(): void
    {
        $footballAgentUser = User::factory()->agent()->create(['status' => User::STATUS_ACTIVE, 'sport' => 'football']);
        AgentProfile::factory()->create(['user_id' => $footballAgentUser->id, 'sport' => 'football']);

        $basketballPlayer = $this->makeBasketballPlayer();

        $this->actingAs($footballAgentUser)
            ->postJson(route('agent.watchlist.toggle', $basketballPlayer))
            ->assertStatus(403);

        $this->assertDatabaseMissing('watchlists', ['player_id' => $basketballPlayer->id]);
    }

    public function test_basketball_agent_can_watchlist_a_basketball_player_in_the_basketball_database(): void
    {
        [$agentUser, $agentProfile] = $this->makeBasketballAgent();
        $basketballPlayer = $this->makeBasketballPlayer();

        $response = $this->actingAs($agentUser)
            ->postJson(route('agent.watchlist.toggle', $basketballPlayer));

        $response->assertOk();
        $response->assertJson(['watching' => true]);

        $this->assertSame(1, BasketballWatchlist::where('agent_id', $agentProfile->id)
            ->where('player_id', $basketballPlayer->id)
            ->count());
        $this->assertSame(0, Watchlist::count());
    }

    public function test_academy_creates_basketball_team_in_the_basketball_database(): void
    {
        $academyUser = User::factory()->academy()->create(['status' => User::STATUS_ACTIVE]);
        AcademyProfile::factory()->create(['user_id' => $academyUser->id, 'sports' => ['football', 'basketball']]);

        $response = $this->actingAs($academyUser)->post(route('academy.teams.store'), [
            'sport' => 'basketball',
            'name' => 'New Hoopers Team',
            'season' => '2025/2026',
            'age_group' => 'Senior',
        ]);

        $response->assertRedirect();

        $this->assertSame(1, BasketballTeam::where('name', 'New Hoopers Team')->count());
        $this->assertSame(0, Team::where('name', 'New Hoopers Team')->count());
    }

    public function test_academy_creates_basketball_job_post_in_the_basketball_database(): void
    {
        $academyUser = User::factory()->academy()->create(['status' => User::STATUS_ACTIVE]);
        AcademyProfile::factory()->create(['user_id' => $academyUser->id, 'sports' => ['basketball']]);

        $response = $this->actingAs($academyUser)->post(route('academy.jobs.store'), [
            'sport' => 'basketball',
            'title' => 'Assistant Coach - Test City',
            'role_type' => 'assistant_coach',
            'description' => 'A basketball assistant coach role.',
            'location' => 'Test City, USA',
            'contract_type' => 'full_time',
            'application_deadline' => now()->addWeeks(2)->format('Y-m-d'),
        ]);

        $response->assertRedirect();

        $this->assertSame(1, BasketballJobPost::where('title', 'Assistant Coach - Test City')->count());
        $this->assertSame(0, JobPost::where('title', 'Assistant Coach - Test City')->count());
    }

    public function test_basketball_coach_cannot_apply_to_a_football_job_post(): void
    {
        $coachUser = User::factory()->coach()->create(['status' => User::STATUS_ACTIVE, 'sport' => 'basketball']);
        BasketballCoachProfile::create([
            'user_id' => $coachUser->id,
            'sport' => 'basketball',
            'full_name' => 'Test Basketball Coach',
            'badges' => ['FIBA Coaching License'],
            'preferred_role' => 'head_coach',
            'experience_years' => 5,
            'nationality' => 'USA',
            'cv_url' => 'seed/cv-test.pdf',
        ]);

        $footballJobPost = JobPost::factory()->create(['sport' => 'football', 'status' => 'open']);

        $this->actingAs($coachUser)->post(route('coach.jobs.apply', $footballJobPost), [
            'cover_letter' => 'I would like to apply.',
        ])->assertForbidden();
    }

    public function test_resolve_route_binding_reaches_a_real_basketball_team_by_id(): void
    {
        $academyUser = User::factory()->academy()->create(['status' => User::STATUS_ACTIVE]);
        $academyProfile = AcademyProfile::factory()->create(['user_id' => $academyUser->id, 'sports' => ['basketball']]);

        $team = BasketballTeam::create([
            'academy_id' => $academyProfile->id,
            'sport' => 'basketball',
            'name' => 'Route Binding Hoopers',
            'season' => '2025/2026',
            'age_group' => 'Senior',
        ]);

        $response = $this->actingAs($academyUser)->get(route('academy.teams.show', $team));

        $response->assertOk();
        $response->assertSee('Route Binding Hoopers');
    }
}
