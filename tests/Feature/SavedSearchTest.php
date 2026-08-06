<?php

namespace Tests\Feature;

use App\Models\Player;
use App\Models\SavedSearch;
use App\Models\User;
use App\Services\SavedSearchMatcher;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SavedSearchTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_user_can_save_a_search(): void
    {
        $user = User::factory()->create(['status' => User::STATUS_ACTIVE]);

        $this->actingAs($user)
            ->postJson(route('saved-searches.store'), [
                'criteria' => ['position' => 'ST', 'age_min' => '16', 'age_max' => '19', 'nationality' => 'Nigeria'],
            ])
            ->assertOk();

        $saved = SavedSearch::where('user_id', $user->id)->firstOrFail();
        $this->assertSame('ST', $saved->criteria['position']);
        $this->assertStringContainsString('ST', $saved->label);
    }

    public function test_a_user_can_view_and_delete_their_saved_searches(): void
    {
        $user = User::factory()->create(['status' => User::STATUS_ACTIVE]);
        $saved = SavedSearch::create(['user_id' => $user->id, 'label' => 'Test', 'criteria' => ['position' => 'GK']]);

        $this->actingAs($user)->get(route('saved-searches.index'))->assertOk()->assertSee('Test');

        $this->actingAs($user)->delete(route('saved-searches.destroy', $saved))->assertRedirect();
        $this->assertDatabaseMissing('saved_searches', ['id' => $saved->id]);
    }

    public function test_a_user_cannot_delete_another_users_saved_search(): void
    {
        $owner = User::factory()->create(['status' => User::STATUS_ACTIVE]);
        $saved = SavedSearch::create(['user_id' => $owner->id, 'label' => 'Test', 'criteria' => []]);

        $intruder = User::factory()->create(['status' => User::STATUS_ACTIVE]);

        $this->actingAs($intruder)->delete(route('saved-searches.destroy', $saved))->assertForbidden();
        $this->assertDatabaseHas('saved_searches', ['id' => $saved->id]);
    }

    public function test_registering_a_matching_player_notifies_the_saved_search_owner(): void
    {
        $agent = User::factory()->create(['status' => User::STATUS_ACTIVE]);
        SavedSearch::create([
            'user_id' => $agent->id,
            'sport' => 'football',
            'label' => 'ST Nigeria',
            'criteria' => ['position' => 'ST', 'nationality' => 'Nigeria'],
        ]);

        $this->post('/register/player/football', [
            'name' => 'Match Player',
            'email' => 'match-player@example.com',
            'password' => 'Str0ng!Passw0rd2026',
            'password_confirmation' => 'Str0ng!Passw0rd2026',
            'dob' => now()->subYears(19)->format('Y-m-d'),
            'nationality' => 'Nigeria',
            'position' => 'ST',
            'foot' => 'right',
        ])->assertRedirect(route('dashboard', absolute: false));

        $this->assertSame(1, $agent->fresh()->unreadNotifications()->count());
    }

    public function test_a_non_matching_player_does_not_notify(): void
    {
        $agent = User::factory()->create(['status' => User::STATUS_ACTIVE]);
        SavedSearch::create([
            'user_id' => $agent->id,
            'sport' => 'football',
            'label' => 'GK Ghana',
            'criteria' => ['position' => 'GK', 'nationality' => 'Ghana'],
        ]);

        $this->post('/register/player/football', [
            'name' => 'No Match Player',
            'email' => 'no-match-player@example.com',
            'password' => 'Str0ng!Passw0rd2026',
            'password_confirmation' => 'Str0ng!Passw0rd2026',
            'dob' => now()->subYears(19)->format('Y-m-d'),
            'nationality' => 'Nigeria',
            'position' => 'ST',
            'foot' => 'right',
        ])->assertRedirect(route('dashboard', absolute: false));

        $this->assertSame(0, $agent->fresh()->unreadNotifications()->count());
    }

    public function test_matcher_evaluates_criteria_directly(): void
    {
        $player = Player::factory()->make(['position' => 'ST', 'secondary_position' => null, 'nationality' => 'Nigeria', 'height_cm' => 180]);

        $this->assertTrue(SavedSearchMatcher::matches($player, ['position' => 'ST']));
        $this->assertFalse(SavedSearchMatcher::matches($player, ['position' => 'GK']));
        $this->assertTrue(SavedSearchMatcher::matches($player, ['min_height' => 170, 'max_height' => 190]));
        $this->assertFalse(SavedSearchMatcher::matches($player, ['min_height' => 190]));
    }
}
