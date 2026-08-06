<?php

namespace Tests\Feature\Api;

use App\Models\JobPost;
use App\Models\Player;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_user_can_log_in_and_receive_a_token(): void
    {
        $user = User::factory()->create(['status' => User::STATUS_ACTIVE, 'password' => 'Str0ng!Passw0rd2026']);

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'Str0ng!Passw0rd2026',
            'device_name' => 'phpunit-test-device',
        ]);

        $response->assertOk()->assertJsonStructure(['token', 'user' => ['id', 'email', 'role']]);
        $this->assertDatabaseHas('personal_access_tokens', ['tokenable_id' => $user->id]);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        $user = User::factory()->create(['status' => User::STATUS_ACTIVE, 'password' => 'Str0ng!Passw0rd2026']);

        $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
            'device_name' => 'phpunit-test-device',
        ])->assertUnprocessable();
    }

    public function test_a_suspended_user_cannot_log_in_via_the_api(): void
    {
        $user = User::factory()->create(['status' => User::STATUS_SUSPENDED, 'password' => 'Str0ng!Passw0rd2026']);

        $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'Str0ng!Passw0rd2026',
            'device_name' => 'phpunit-test-device',
        ])->assertUnprocessable();
    }

    public function test_an_authenticated_token_can_fetch_the_current_user(): void
    {
        $user = User::factory()->create(['status' => User::STATUS_ACTIVE]);
        $token = $user->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('user.id', $user->id);
    }

    public function test_notifications_endpoint_requires_authentication(): void
    {
        $this->getJson('/api/notifications')->assertUnauthorized();
    }

    public function test_players_endpoint_is_public(): void
    {
        Player::factory()->create(['is_public' => true]);

        $this->getJson('/api/players/search?sport=football')->assertOk()->assertJsonStructure(['data', 'current_page']);
    }

    public function test_a_single_player_can_be_fetched_by_slug(): void
    {
        $player = Player::factory()->create(['is_public' => true]);

        $this->getJson("/api/players/{$player->slug}")
            ->assertOk()
            ->assertJsonPath('data.slug', $player->slug);
    }

    public function test_jobs_endpoint_is_public(): void
    {
        JobPost::factory()->create(['status' => 'open']);

        $this->getJson('/api/jobs?sport=football')->assertOk()->assertJsonStructure(['data', 'current_page']);
    }

    public function test_logout_revokes_the_current_token(): void
    {
        $user = User::factory()->create(['status' => User::STATUS_ACTIVE]);
        $token = $user->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/logout')
            ->assertOk();

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
}
