<?php

namespace App\Services;

use App\Models\AccessRequest;
use App\Models\AgentProfile;
use App\Models\Basketball\BasketballAccessRequest;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Player;
use App\Notifications\AccessRequestReceivedNotification;
use App\Notifications\AccessRequestRespondedNotification;
use Illuminate\Support\Facades\DB;

class AccessRequestService
{
    /**
     * $player is guaranteed the same sport as $agent by the caller (resolved
     * from the agent's own sport before reaching here), so agent_id/player_id
     * always point into the matching physical database.
     */
    public function request(AgentProfile $agent, Player $player, string $message): AccessRequest
    {
        $accessRequestModel = $agent->sport === AgentProfile::SPORT_BASKETBALL
            ? BasketballAccessRequest::class
            : AccessRequest::class;

        return DB::transaction(function () use ($agent, $player, $message, $accessRequestModel) {
            $accessRequest = $accessRequestModel::create([
                'agent_id' => $agent->id,
                'player_id' => $player->id,
                'academy_id' => $player->academy_id,
                'status' => 'pending',
                'message' => $message,
            ]);

            $academyUserId = $player->academy->user_id;

            $conversation = Conversation::firstOrCreate(
                ['initiator_id' => $agent->user_id, 'recipient_id' => $academyUserId],
                ['subject' => "Access request: {$player->full_name}", 'last_message_at' => now()]
            );

            $conversation->update(['last_message_at' => now()]);

            Message::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $agent->user_id,
                'player_card_id' => $player->id,
                'player_sport' => $agent->sport,
                'content' => $message,
            ]);

            $player->academy->user->notify(new AccessRequestReceivedNotification($accessRequest));

            return $accessRequest;
        });
    }

    public function respond(AccessRequest $accessRequest, bool $grant): AccessRequest
    {
        $accessRequest->update([
            'status' => $grant ? 'granted' : 'denied',
            'responded_at' => now(),
        ]);

        $accessRequest->agent->user->notify(new AccessRequestRespondedNotification($accessRequest));

        return $accessRequest;
    }
}
