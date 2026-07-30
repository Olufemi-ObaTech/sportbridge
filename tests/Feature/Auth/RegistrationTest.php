<?php

namespace Tests\Feature\Auth;

use App\Models\Basketball\BasketballAgentProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_choice_screen_can_be_rendered(): void
    {
        $this->get('/register')->assertStatus(200);
    }

    public function test_academy_registration_screen_can_be_rendered(): void
    {
        $this->get('/register/academy/football')->assertStatus(200);
        $this->get('/register/academy/basketball')->assertStatus(200);
    }

    public function test_agent_registration_screen_can_be_rendered(): void
    {
        $this->get('/register/agent/football')->assertStatus(200);
        $this->get('/register/agent/basketball')->assertStatus(200);
    }

    public function test_coach_registration_screen_can_be_rendered(): void
    {
        $this->get('/register/coach/football')->assertStatus(200);
        $this->get('/register/coach/basketball')->assertStatus(200);
    }

    public function test_academy_can_register_and_is_active_immediately(): void
    {
        Storage::fake('public');
        Storage::fake('local');

        $response = $this->post('/register/academy/football', [
            'club_name' => 'Lagos United',
            'email' => 'club@example.com',
            'password' => 'Str0ng!Passw0rd2026',
            'password_confirmation' => 'Str0ng!Passw0rd2026',
            'license_number' => 'LIC-1234',
            'country' => 'Nigeria',
            'state' => 'Lagos',
            'address' => '1 Stadium Road',
            'phone' => '+2348000000000',
            'license_document' => UploadedFile::fake()->create('license.pdf', 200, 'application/pdf'),
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));

        $user = User::where('email', 'club@example.com')->firstOrFail();
        $this->assertSame(User::ROLE_ACADEMY, $user->role);
        $this->assertSame(User::STATUS_ACTIVE, $user->status);
        $this->assertNotNull($user->academyProfile);
        $this->assertSame('LIC-1234', $user->academyProfile->license_number);
        $this->assertSame(['football'], $user->academyProfile->sports);
    }

    public function test_agent_can_register_and_is_active_immediately(): void
    {
        Storage::fake('public');
        Storage::fake('local');

        $response = $this->post('/register/agent/football', [
            'name' => 'Jane Scout',
            'agency_name' => 'Prime Talent',
            'email' => 'agent@example.com',
            'password' => 'Str0ng!Passw0rd2026',
            'password_confirmation' => 'Str0ng!Passw0rd2026',
            'license_number' => 'FIFA-999',
            'nationality' => 'Ghana',
            'experience_years' => 5,
            'regions' => ['West Africa', 'Europe'],
            'id_document' => UploadedFile::fake()->create('id.pdf', 200, 'application/pdf'),
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));

        $user = User::where('email', 'agent@example.com')->firstOrFail();
        $this->assertSame(User::ROLE_AGENT, $user->role);
        $this->assertSame(User::STATUS_ACTIVE, $user->status);
        $this->assertSame('football', $user->sport);
        $this->assertNotNull($user->agentProfile);
        $this->assertSame('FIFA-999', $user->agentProfile->license_number);
    }

    public function test_coach_can_register_and_is_active_immediately(): void
    {
        Storage::fake('public');
        Storage::fake('local');

        $response = $this->post('/register/coach/football', [
            'name' => 'Coach Mike',
            'email' => 'coach@example.com',
            'password' => 'Str0ng!Passw0rd2026',
            'password_confirmation' => 'Str0ng!Passw0rd2026',
            'badges' => ['UEFA B'],
            'preferred_role' => 'head_coach',
            'experience_years' => 8,
            'nationality' => 'England',
            'cv' => UploadedFile::fake()->create('cv.pdf', 200, 'application/pdf'),
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));

        $user = User::where('email', 'coach@example.com')->firstOrFail();
        $this->assertSame(User::ROLE_COACH, $user->role);
        $this->assertSame(User::STATUS_ACTIVE, $user->status);
        $this->assertSame('football', $user->sport);
        $this->assertNotNull($user->coachProfile);
    }

    public function test_player_can_register_and_is_active_immediately(): void
    {
        $response = $this->post('/register/player/football', [
            'name' => 'Young Talent',
            'email' => 'player@example.com',
            'password' => 'Str0ng!Passw0rd2026',
            'password_confirmation' => 'Str0ng!Passw0rd2026',
            'dob' => now()->subYears(18)->format('Y-m-d'),
            'nationality' => 'Nigeria',
            'position' => 'ST',
            'foot' => 'right',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));

        $user = User::where('email', 'player@example.com')->firstOrFail();
        $this->assertSame(User::ROLE_PLAYER, $user->role);
        $this->assertSame(User::STATUS_ACTIVE, $user->status);
        $this->assertNotNull($user->playerProfile);
    }

    public function test_basketball_agent_registers_into_the_basketball_database(): void
    {
        Storage::fake('public');
        Storage::fake('local');

        $response = $this->post('/register/agent/basketball', [
            'name' => 'Jordan Scout',
            'agency_name' => 'Prime Hoops',
            'email' => 'bb-agent@example.com',
            'password' => 'Str0ng!Passw0rd2026',
            'password_confirmation' => 'Str0ng!Passw0rd2026',
            'license_number' => 'FIBA-999',
            'nationality' => 'USA',
            'experience_years' => 5,
            'regions' => ['North America'],
            'id_document' => UploadedFile::fake()->create('id.pdf', 200, 'application/pdf'),
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));

        $user = User::where('email', 'bb-agent@example.com')->firstOrFail();
        $this->assertSame('basketball', $user->sport);
        $this->assertNotNull($user->agentProfile);
        $this->assertSame(BasketballAgentProfile::class, get_class($user->agentProfile));
        $this->assertSame('mysql_basketball', $user->agentProfile->getConnectionName());
    }

    public function test_academy_registration_requires_a_license_document(): void
    {
        $response = $this->post('/register/academy/football', [
            'club_name' => 'Lagos United',
            'email' => 'club2@example.com',
            'password' => 'Str0ng!Passw0rd2026',
            'password_confirmation' => 'Str0ng!Passw0rd2026',
            'license_number' => 'LIC-1234',
            'country' => 'Nigeria',
            'address' => '1 Stadium Road',
            'phone' => '+2348000000000',
        ]);

        $response->assertSessionHasErrors('license_document');
        $this->assertGuest();
    }
}
