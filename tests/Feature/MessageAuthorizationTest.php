<?php

namespace Tests\Feature;

use App\Models\AgentProfile;
use App\Models\Conversation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MessageAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_participant_can_view_a_conversation(): void
    {
        $agent = AgentProfile::factory()->create()->user;
        $other = User::factory()->create();

        $conversation = Conversation::factory()->create([
            'initiator_id' => $agent->id,
            'recipient_id' => $other->id,
        ]);

        $this->actingAs($agent)->get(route('inbox.show', $conversation))->assertOk();
    }

    public function test_non_participant_cannot_view_a_conversation(): void
    {
        $agent = AgentProfile::factory()->create()->user;
        $other = User::factory()->create();
        $outsider = User::factory()->create();

        $conversation = Conversation::factory()->create([
            'initiator_id' => $agent->id,
            'recipient_id' => $other->id,
        ]);

        $this->actingAs($outsider)->get(route('inbox.show', $conversation))->assertForbidden();
    }

    public function test_participant_can_send_a_message(): void
    {
        $agent = AgentProfile::factory()->create()->user;
        $other = User::factory()->create();

        $conversation = Conversation::factory()->create([
            'initiator_id' => $agent->id,
            'recipient_id' => $other->id,
        ]);

        $response = $this->actingAs($agent)->post(route('messages.store', $conversation), [
            'content' => 'Hello there',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('messages', [
            'conversation_id' => $conversation->id,
            'sender_id' => $agent->id,
            'content' => 'Hello there',
        ]);
    }

    public function test_non_participant_cannot_send_a_message(): void
    {
        $agent = AgentProfile::factory()->create()->user;
        $other = User::factory()->create();
        $outsider = User::factory()->create();

        $conversation = Conversation::factory()->create([
            'initiator_id' => $agent->id,
            'recipient_id' => $other->id,
        ]);

        $this->actingAs($outsider)->post(route('messages.store', $conversation), [
            'content' => 'Should not send',
        ])->assertForbidden();

        $this->assertDatabaseMissing('messages', ['content' => 'Should not send']);
    }
}
