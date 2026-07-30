<?php

namespace Tests\Feature;

use App\Models\AcademyProfile;
use App\Models\Player;
use App\Models\Team;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlayerAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_academy_can_create_a_player_for_its_own_team(): void
    {
        $academy = AcademyProfile::factory()->create();
        $team = Team::factory()->create(['academy_id' => $academy->id]);

        $response = $this->actingAs($academy->user)->post(route('academy.players.store', $team), [
            'full_name' => 'Test Player',
            'dob' => now()->subYears(18)->format('Y-m-d'),
            'nationality' => 'Nigeria',
            'position' => 'ST',
            'foot' => 'right',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('players', [
            'full_name' => 'Test Player',
            'team_id' => $team->id,
            'academy_id' => $academy->id,
        ]);
    }

    public function test_academy_cannot_create_a_player_for_another_academys_team(): void
    {
        $ownAcademy = AcademyProfile::factory()->create();
        $otherAcademy = AcademyProfile::factory()->create();
        $otherTeam = Team::factory()->create(['academy_id' => $otherAcademy->id]);

        $this->actingAs($ownAcademy->user)->post(route('academy.players.store', $otherTeam), [
            'full_name' => 'Test Player',
            'dob' => now()->subYears(18)->format('Y-m-d'),
            'nationality' => 'Nigeria',
            'position' => 'ST',
            'foot' => 'right',
        ])->assertForbidden();
    }

    public function test_academy_cannot_update_another_academys_player(): void
    {
        $ownAcademy = AcademyProfile::factory()->create();
        $otherAcademy = AcademyProfile::factory()->create();
        $otherTeam = Team::factory()->create(['academy_id' => $otherAcademy->id]);
        $otherPlayer = Player::factory()->create(['team_id' => $otherTeam->id, 'academy_id' => $otherAcademy->id]);

        $this->actingAs($ownAcademy->user)->put(route('academy.players.update', $otherPlayer), [
            'full_name' => 'Hacked Name',
            'dob' => now()->subYears(18)->format('Y-m-d'),
            'nationality' => 'Nigeria',
            'position' => 'ST',
            'foot' => 'right',
        ])->assertForbidden();

        $this->assertDatabaseMissing('players', ['full_name' => 'Hacked Name']);
    }

    public function test_academy_cannot_delete_another_academys_player(): void
    {
        $ownAcademy = AcademyProfile::factory()->create();
        $otherAcademy = AcademyProfile::factory()->create();
        $otherTeam = Team::factory()->create(['academy_id' => $otherAcademy->id]);
        $otherPlayer = Player::factory()->create(['team_id' => $otherTeam->id, 'academy_id' => $otherAcademy->id]);

        $this->actingAs($ownAcademy->user)->delete(route('academy.players.destroy', $otherPlayer))
            ->assertForbidden();

        $this->assertDatabaseHas('players', ['id' => $otherPlayer->id]);
    }

    public function test_guest_can_view_a_public_player_profile(): void
    {
        $academy = AcademyProfile::factory()->create();
        $team = Team::factory()->create(['academy_id' => $academy->id]);
        $player = Player::factory()->create(['team_id' => $team->id, 'academy_id' => $academy->id, 'is_public' => true]);

        $this->get(route('player.show', $player))->assertOk();
    }

    public function test_guest_cannot_view_a_private_player_profile(): void
    {
        $academy = AcademyProfile::factory()->create();
        $team = Team::factory()->create(['academy_id' => $academy->id]);
        $player = Player::factory()->create(['team_id' => $team->id, 'academy_id' => $academy->id, 'is_public' => false]);

        $this->get(route('player.show', $player))->assertForbidden();
    }
}
