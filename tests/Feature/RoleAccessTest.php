<?php

namespace Tests\Feature;

use App\Models\AcademyProfile;
use App\Models\AgentProfile;
use App\Models\CoachProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_coach_cannot_access_admin_area(): void
    {
        $coach = CoachProfile::factory()->create()->user;

        $this->actingAs($coach)->get('/admin/dashboard')->assertForbidden();
    }

    public function test_agent_cannot_access_academy_area(): void
    {
        $agent = AgentProfile::factory()->create()->user;

        $this->actingAs($agent)->get('/academy/teams')->assertForbidden();
    }

    public function test_academy_cannot_access_coach_area(): void
    {
        $academy = AcademyProfile::factory()->create()->user;

        $this->actingAs($academy)->get('/coach/profile/edit')->assertForbidden();
    }

    public function test_guest_is_redirected_to_login_from_protected_routes(): void
    {
        $this->get('/dashboard')->assertRedirect('/login');
    }

    public function test_super_admin_can_access_admin_area(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $this->actingAs($admin)->get('/admin/dashboard')->assertOk();
    }

    public function test_pending_user_is_redirected_away_from_role_dashboard_actions(): void
    {
        $academy = AcademyProfile::factory()->create()->user;
        $academy->update(['status' => User::STATUS_PENDING]);

        $this->actingAs($academy)->get('/academy/teams')->assertRedirect(route('dashboard'));
    }

    public function test_suspended_user_is_logged_out_on_next_request(): void
    {
        $academy = AcademyProfile::factory()->create()->user;
        $academy->update(['status' => User::STATUS_SUSPENDED]);

        $this->actingAs($academy)->get('/dashboard')->assertRedirect(route('login'));
        $this->assertGuest();
    }
}
