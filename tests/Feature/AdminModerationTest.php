<?php

namespace Tests\Feature;

use App\Models\AcademyProfile;
use App\Models\CoachProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class AdminModerationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_approve_a_pending_account(): void
    {
        Notification::fake();

        $admin = User::factory()->superAdmin()->create();
        $pendingUser = AcademyProfile::factory()->create()->user;
        $pendingUser->update(['status' => User::STATUS_PENDING]);

        $response = $this->actingAs($admin)->post(route('admin.moderation.approve', $pendingUser));

        $response->assertRedirect();
        $this->assertSame(User::STATUS_ACTIVE, $pendingUser->fresh()->status);
        $this->assertDatabaseHas('admin_logs', [
            'admin_id' => $admin->id,
            'target_user_id' => $pendingUser->id,
            'action' => 'approve',
        ]);
    }

    public function test_admin_can_deny_a_pending_account_with_a_reason(): void
    {
        Notification::fake();

        $admin = User::factory()->superAdmin()->create();
        $pendingUser = AcademyProfile::factory()->create()->user;
        $pendingUser->update(['status' => User::STATUS_PENDING]);

        $response = $this->actingAs($admin)->post(route('admin.moderation.deny', $pendingUser), [
            'reason' => 'Documents could not be verified.',
        ]);

        $response->assertRedirect();
        $this->assertSame(User::STATUS_DENIED, $pendingUser->fresh()->status);
        $this->assertDatabaseHas('admin_logs', [
            'admin_id' => $admin->id,
            'target_user_id' => $pendingUser->id,
            'action' => 'deny',
            'reason' => 'Documents could not be verified.',
        ]);
    }

    public function test_deny_requires_a_reason(): void
    {
        $admin = User::factory()->superAdmin()->create();
        $pendingUser = AcademyProfile::factory()->create()->user;

        $this->actingAs($admin)
            ->post(route('admin.moderation.deny', $pendingUser), [])
            ->assertSessionHasErrors('reason');
    }

    public function test_non_admin_cannot_approve_accounts(): void
    {
        $coach = CoachProfile::factory()->create()->user;
        $pendingUser = AcademyProfile::factory()->create()->user;

        $this->actingAs($coach)
            ->post(route('admin.moderation.approve', $pendingUser))
            ->assertForbidden();
    }
}
