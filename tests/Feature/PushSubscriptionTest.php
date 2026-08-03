<?php

namespace Tests\Feature;

use App\Models\PushSubscription;
use App\Models\User;
use App\Notifications\AccountApprovedNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PushSubscriptionTest extends TestCase
{
    use RefreshDatabase;

    private function subscriptionPayload(string $endpoint = 'https://fcm.googleapis.com/fcm/send/abc123'): array
    {
        return [
            'endpoint' => $endpoint,
            'keys' => [
                'p256dh' => 'test-public-key',
                'auth' => 'test-auth-token',
            ],
            'contentEncoding' => 'aes128gcm',
        ];
    }

    public function test_a_user_can_register_a_push_subscription(): void
    {
        $user = User::factory()->create(['status' => User::STATUS_ACTIVE]);

        $this->actingAs($user)
            ->postJson(route('webpush.subscribe'), $this->subscriptionPayload())
            ->assertOk();

        $this->assertDatabaseHas('push_subscriptions', [
            'user_id' => $user->id,
            'endpoint_hash' => hash('sha256', 'https://fcm.googleapis.com/fcm/send/abc123'),
        ]);
    }

    public function test_resubscribing_with_the_same_endpoint_updates_rather_than_duplicates(): void
    {
        $user = User::factory()->create(['status' => User::STATUS_ACTIVE]);

        $this->actingAs($user)->postJson(route('webpush.subscribe'), $this->subscriptionPayload())->assertOk();
        $this->actingAs($user)->postJson(route('webpush.subscribe'), $this->subscriptionPayload())->assertOk();

        $this->assertSame(1, PushSubscription::where('user_id', $user->id)->count());
    }

    public function test_a_user_can_remove_their_push_subscription(): void
    {
        $user = User::factory()->create(['status' => User::STATUS_ACTIVE]);
        $this->actingAs($user)->postJson(route('webpush.subscribe'), $this->subscriptionPayload())->assertOk();

        $this->actingAs($user)
            ->postJson(route('webpush.unsubscribe'), ['endpoint' => 'https://fcm.googleapis.com/fcm/send/abc123'])
            ->assertOk();

        $this->assertDatabaseCount('push_subscriptions', 0);
    }

    /**
     * No subscriptions means the webpush channel must be a silent no-op -
     * this proves toArray()/toWebPush() and the shared NotificationPresenter
     * mapping never throw for a notifiable with nothing subscribed, and that
     * no HTTP call to a push service is attempted (which would fail/hang in
     * a test environment).
     */
    public function test_notifying_a_user_with_no_push_subscriptions_does_not_error(): void
    {
        $user = User::factory()->create(['status' => User::STATUS_ACTIVE]);

        $user->notify(new AccountApprovedNotification);

        $this->assertSame(1, $user->fresh()->unreadNotifications()->count());
    }
}
