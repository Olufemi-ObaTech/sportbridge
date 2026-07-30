<?php

namespace Database\Factories;

use App\Models\Conversation;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Conversation>
 */
class ConversationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'initiator_id' => User::factory(),
            'recipient_id' => User::factory(),
            'subject' => fake()->optional()->sentence(4),
            'last_message_at' => now(),
        ];
    }
}
