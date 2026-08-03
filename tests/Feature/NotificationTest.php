<?php

namespace Tests\Feature;

use App\Models\Player;
use App\Models\User;
use App\Notifications\AccountApprovedNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_user_can_see_their_notifications_list(): void
    {
        $user = User::factory()->create(['status' => User::STATUS_ACTIVE]);
        $user->notify(new AccountApprovedNotification);

        $this->actingAs($user)
            ->get(route('notifications.index'))
            ->assertOk()
            ->assertSee('Your account has been approved.');
    }

    public function test_marking_a_notification_read_redirects_to_its_target_and_marks_it_read(): void
    {
        $user = User::factory()->create(['status' => User::STATUS_ACTIVE]);
        $user->notify(new AccountApprovedNotification);
        $notification = $user->notifications()->firstOrFail();

        $this->assertNull($notification->read_at);

        $this->actingAs($user)
            ->post(route('notifications.read', $notification->id))
            ->assertRedirect(route('dashboard'));

        $this->assertNotNull($notification->fresh()->read_at);
    }

    public function test_a_user_cannot_mark_another_users_notification_as_read(): void
    {
        $owner = User::factory()->create(['status' => User::STATUS_ACTIVE]);
        $owner->notify(new AccountApprovedNotification);
        $notification = $owner->notifications()->firstOrFail();

        $intruder = User::factory()->create(['status' => User::STATUS_ACTIVE]);

        $this->actingAs($intruder)
            ->post(route('notifications.read', $notification->id))
            ->assertNotFound();

        $this->assertNull($notification->fresh()->read_at);
    }

    public function test_mark_all_read_clears_every_unread_notification(): void
    {
        $user = User::factory()->create(['status' => User::STATUS_ACTIVE]);
        $user->notify(new AccountApprovedNotification);
        $user->notify(new AccountApprovedNotification);

        $this->assertSame(2, $user->unreadNotifications()->count());

        $this->actingAs($user)
            ->post(route('notifications.mark-all-read'))
            ->assertRedirect();

        $this->assertSame(0, $user->fresh()->unreadNotifications()->count());
    }

    public function test_the_dashboard_header_renders_the_notification_bell_with_an_unread_badge(): void
    {
        $user = User::factory()->create(['role' => User::ROLE_PLAYER, 'status' => User::STATUS_ACTIVE]);
        Player::factory()->create(['user_id' => $user->id]);
        $user->notify(new AccountApprovedNotification);

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertSee('bi-bell', false)
            ->assertSee(__('unread notifications'));
    }
}
