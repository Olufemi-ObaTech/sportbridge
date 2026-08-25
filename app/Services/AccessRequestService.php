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

        $accessRequest = DB::transaction(function () use ($agent, $player, $message, $accessRequestModel) {
            $academyUserId = $player->academy?->user_id;

            // A free-agent player has no academy - send the message/request
            // to the player's own account if no academy is attached.
            $recipientUserId = $academyUserId ?? $player->user_id;

            abort_unless($recipientUserId, 422, 'Player has no reachable owner for an access request.');

            $conversation = Conversation::firstOrCreate(
                ['initiator_id' => $agent->user_id, 'recipient_id' => $recipientUserId],
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

            // Created last: a basketball access request lands on a different
            // physical database connection than the conversation/message
            // above, so this transaction can't roll it back once it commits.
            // Doing it last means a failure anywhere above still rolls back
            // cleanly with nothing left orphaned on the other connection.
            return $accessRequestModel::create([
                'agent_id' => $agent->id,
                'player_id' => $player->id,
                'academy_id' => $player->academy_id,
                'status' => 'pending',
                'message' => $message,
            ]);
        });

        // Deliberately outside the transaction - notifying is a side effect
        // that must never fire before the records are actually committed.
        if ($player->academy?->user) {
            $player->academy->user->notify(new AccessRequestReceivedNotification($accessRequest));
        } elseif ($player->user) {
            $player->user->notify(new AccessRequestReceivedNotification($accessRequest));
        }

        return $accessRequest;
    }

    public function respond(AccessRequest $accessRequest, bool $grant): AccessRequest
    {
        $accessRequest->update([
            'status' => $grant ? 'granted' : 'denied',
            'responded_at' => now(),
        ]);

        $accessRequest->agent?->user?->notify(new AccessRequestRespondedNotification($accessRequest));

        return $accessRequest;
    }
}
