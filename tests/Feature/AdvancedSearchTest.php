<?php

namespace Tests\Feature;

use App\Models\AcademyProfile;
use App\Models\Player;
use App\Models\Team;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdvancedSearchTest extends TestCase
{
    use RefreshDatabase;

    public function test_search_filters_by_max_height(): void
    {
        Player::factory()->create(['height_cm' => 165, 'is_public' => true]);
        Player::factory()->create(['height_cm' => 195, 'is_public' => true]);

        $response = $this->getJson(route('api.players.search', ['sport' => 'football', 'max_height' => 170]))
            ->assertOk();

        $this->assertCount(1, $response->json('data'));
        $this->assertSame(165, $response->json('data.0.height_cm'));
    }

    public function test_search_filters_by_club_name(): void
    {
        $academy = AcademyProfile::factory()->create(['club_name' => 'Lagos United FC']);
        $team = Team::factory()->create(['academy_id' => $academy->id]);
        Player::factory()->create(['team_id' => $team->id, 'academy_id' => $academy->id, 'is_public' => true]);

        $otherAcademy = AcademyProfile::factory()->create(['club_name' => 'Accra Hearts']);
        $otherTeam = Team::factory()->create(['academy_id' => $otherAcademy->id]);
        Player::factory()->create(['team_id' => $otherTeam->id, 'academy_id' => $otherAcademy->id, 'is_public' => true]);

        $response = $this->getJson(route('api.players.search', ['sport' => 'football', 'club' => 'Lagos']))
            ->assertOk();

        $this->assertCount(1, $response->json('data'));
        $this->assertSame('Lagos United FC', $response->json('data.0.club_name'));
    }

    /**
     * The club filter used to be a whereHas('academy', ...), which throws or
     * silently misbehaves for BasketballPlayer since its academy_id points at
     * a table in a different physical database - this pins the whereIn-based
     * fix (see SearchController) actually works for the "all sports" merge path.
     */
    public function test_club_filter_does_not_error_when_searching_all_sports(): void
    {
        $academy = AcademyProfile::factory()->create(['club_name' => 'Lagos United FC']);
        $team = Team::factory()->create(['academy_id' => $academy->id]);
        Player::factory()->create(['team_id' => $team->id, 'academy_id' => $academy->id, 'is_public' => true]);

        $this->getJson(route('api.players.search', ['sport' => 'all', 'club' => 'Lagos']))
            ->assertOk();
    }

    public function test_search_sorts_by_name(): void
    {
        Player::factory()->create(['full_name' => 'Zed Zebra', 'is_public' => true]);
        Player::factory()->create(['full_name' => 'Alan Apple', 'is_public' => true]);

        $response = $this->getJson(route('api.players.search', ['sport' => 'football', 'sort' => 'name_asc']))
            ->assertOk();

        $this->assertSame('Alan Apple', $response->json('data.0.full_name'));
        $this->assertSame('Zed Zebra', $response->json('data.1.full_name'));
    }
}
