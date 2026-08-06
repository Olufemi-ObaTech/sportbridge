<?php

namespace Tests\Feature;

use App\Models\Player;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnalyticsTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_view_the_analytics_dashboard(): void
    {
        $admin = User::factory()->superAdmin()->create();
        Player::factory()->create();

        $this->actingAs($admin)
            ->get(route('admin.analytics.index'))
            ->assertOk()
            ->assertSee('Analytics');
    }

    public function test_non_admin_cannot_view_the_analytics_dashboard(): void
    {
        $user = User::factory()->create(['status' => User::STATUS_ACTIVE]);

        $this->actingAs($user)
            ->get(route('admin.analytics.index'))
            ->assertForbidden();
    }

    public function test_guest_is_redirected_from_the_analytics_dashboard(): void
    {
        $this->get(route('admin.analytics.index'))->assertRedirect(route('login'));
    }
}
