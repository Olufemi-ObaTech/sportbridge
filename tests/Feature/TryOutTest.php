<?php

namespace Tests\Feature;

use App\Models\TryOut;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TryOutTest extends TestCase
{
    use RefreshDatabase;

    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'sport' => 'football',
            'gender' => 'mixed',
            'title' => 'U-18 Open Try-out',
            'description' => 'Bring boots and shin guards.',
            'location' => 'Lagos Stadium',
            'scheduled_date' => now()->addWeek()->format('Y-m-d'),
            'age_group' => 'U-18',
        ], $overrides);
    }

    public function test_any_active_role_can_post_a_try_out(): void
    {
        foreach ([User::ROLE_ACADEMY, User::ROLE_AGENT, User::ROLE_COACH, User::ROLE_PLAYER] as $role) {
            $user = User::factory()->create(['role' => $role, 'sport' => 'football', 'status' => User::STATUS_ACTIVE]);

            $this->actingAs($user)
                ->post(route('try-outs.store'), $this->validPayload(['title' => "Try-out by {$role}"]))
                ->assertRedirect();

            $this->assertDatabaseHas('try_outs', [
                'posted_by_user_id' => $user->id,
                'title' => "Try-out by {$role}",
                'status' => TryOut::STATUS_OPEN,
            ]);
        }
    }

    public function test_a_guest_can_browse_but_not_post(): void
    {
        $tryOut = TryOut::create(array_merge($this->validPayload(), [
            'posted_by_user_id' => User::factory()->create()->id,
        ]));

        $this->get(route('try-outs.index'))->assertOk();
        $this->get(route('try-outs.show', $tryOut))->assertOk();
        $this->get(route('try-outs.create'))->assertRedirect(route('login'));
    }

    public function test_a_matching_sport_player_can_express_interest_and_the_poster_is_notified(): void
    {
        $poster = User::factory()->create(['status' => User::STATUS_ACTIVE]);
        $tryOut = TryOut::create(array_merge($this->validPayload(), ['posted_by_user_id' => $poster->id]));
        $player = User::factory()->create(['role' => User::ROLE_PLAYER, 'sport' => 'football', 'status' => User::STATUS_ACTIVE]);

        $this->actingAs($player)
            ->post(route('try-outs.interest.store', $tryOut), ['message' => 'I can make it.'])
            ->assertRedirect();

        $this->assertDatabaseHas('try_out_interests', [
            'try_out_id' => $tryOut->id,
            'user_id' => $player->id,
            'message' => 'I can make it.',
        ]);
        $this->assertSame(1, $poster->fresh()->unreadNotifications()->count());
    }

    public function test_expressing_interest_twice_does_not_duplicate_or_renotify(): void
    {
        $poster = User::factory()->create(['status' => User::STATUS_ACTIVE]);
        $tryOut = TryOut::create(array_merge($this->validPayload(), ['posted_by_user_id' => $poster->id]));
        $player = User::factory()->create(['role' => User::ROLE_PLAYER, 'sport' => 'football', 'status' => User::STATUS_ACTIVE]);

        $this->actingAs($player)->post(route('try-outs.interest.store', $tryOut), []);
        $this->actingAs($player)->post(route('try-outs.interest.store', $tryOut), []);

        $this->assertSame(1, $tryOut->interests()->count());
        $this->assertSame(1, $poster->fresh()->unreadNotifications()->count());
    }

    public function test_a_mismatched_sport_player_cannot_express_interest(): void
    {
        $tryOut = TryOut::create(array_merge($this->validPayload(['sport' => 'football']), [
            'posted_by_user_id' => User::factory()->create()->id,
        ]));
        $basketballPlayer = User::factory()->create(['role' => User::ROLE_PLAYER, 'sport' => 'basketball', 'status' => User::STATUS_ACTIVE]);

        $this->actingAs($basketballPlayer)
            ->post(route('try-outs.interest.store', $tryOut), [])
            ->assertForbidden();
    }

    public function test_a_non_player_cannot_express_interest(): void
    {
        $tryOut = TryOut::create(array_merge($this->validPayload(), [
            'posted_by_user_id' => User::factory()->create()->id,
        ]));
        $agent = User::factory()->create(['role' => User::ROLE_AGENT, 'sport' => 'football', 'status' => User::STATUS_ACTIVE]);

        $this->actingAs($agent)
            ->post(route('try-outs.interest.store', $tryOut), [])
            ->assertForbidden();
    }

    public function test_interest_is_rejected_once_the_try_out_is_closed(): void
    {
        $tryOut = TryOut::create(array_merge($this->validPayload(), [
            'posted_by_user_id' => User::factory()->create()->id,
            'status' => TryOut::STATUS_CLOSED,
        ]));
        $player = User::factory()->create(['role' => User::ROLE_PLAYER, 'sport' => 'football', 'status' => User::STATUS_ACTIVE]);

        $this->actingAs($player)
            ->post(route('try-outs.interest.store', $tryOut), [])
            ->assertForbidden();
    }

    public function test_only_the_poster_can_view_the_interested_players_list(): void
    {
        $poster = User::factory()->create(['status' => User::STATUS_ACTIVE]);
        $stranger = User::factory()->create(['status' => User::STATUS_ACTIVE]);
        $tryOut = TryOut::create(array_merge($this->validPayload(), ['posted_by_user_id' => $poster->id]));

        $this->actingAs($poster)->get(route('try-outs.interested', $tryOut))->assertOk();
        $this->actingAs($stranger)->get(route('try-outs.interested', $tryOut))->assertForbidden();
    }

    public function test_only_the_poster_can_edit_or_close_their_try_out(): void
    {
        $poster = User::factory()->create(['status' => User::STATUS_ACTIVE]);
        $stranger = User::factory()->create(['status' => User::STATUS_ACTIVE]);
        $tryOut = TryOut::create(array_merge($this->validPayload(), ['posted_by_user_id' => $poster->id]));

        $this->actingAs($stranger)->get(route('try-outs.edit', $tryOut))->assertForbidden();
        $this->actingAs($stranger)->post(route('try-outs.close', $tryOut))->assertForbidden();

        $this->actingAs($poster)
            ->post(route('try-outs.close', $tryOut))
            ->assertRedirect();

        $this->assertSame(TryOut::STATUS_CLOSED, $tryOut->fresh()->status);
    }

    public function test_a_super_admin_can_also_view_interests_edit_and_close_any_try_out(): void
    {
        $poster = User::factory()->create(['status' => User::STATUS_ACTIVE]);
        $admin = User::factory()->create(['role' => User::ROLE_SUPER_ADMIN, 'status' => User::STATUS_ACTIVE]);
        $tryOut = TryOut::create(array_merge($this->validPayload(), ['posted_by_user_id' => $poster->id]));

        $this->actingAs($admin)->get(route('try-outs.interested', $tryOut))->assertOk();
        $this->actingAs($admin)->get(route('try-outs.edit', $tryOut))->assertOk();
        $this->actingAs($admin)->post(route('try-outs.close', $tryOut))->assertRedirect();
    }

    public function test_viewing_or_expressing_interest_in_a_try_out_with_a_deleted_poster_does_not_crash(): void
    {
        $poster = User::factory()->create(['status' => User::STATUS_ACTIVE]);
        $tryOut = TryOut::create(array_merge($this->validPayload(), ['posted_by_user_id' => $poster->id]));
        $poster->delete();

        $this->get(route('try-outs.index'))->assertOk();
        $this->get(route('try-outs.show', $tryOut))->assertOk();

        $player = User::factory()->create(['role' => User::ROLE_PLAYER, 'sport' => 'football', 'status' => User::STATUS_ACTIVE]);
        $this->actingAs($player)
            ->post(route('try-outs.interest.store', $tryOut), [])
            ->assertRedirect();

        $this->assertDatabaseHas('try_out_interests', ['try_out_id' => $tryOut->id, 'user_id' => $player->id]);
    }
}
