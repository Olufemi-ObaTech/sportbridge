<?php

namespace App\Notifications;

use App\Models\AccessRequest;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AccessRequestRespondedNotification extends Notification
{
    public function __construct(public AccessRequest $accessRequest) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $player = $this->accessRequest->player;
        $granted = $this->accessRequest->isGranted();

        $message = (new MailMessage)->subject('Update on your access request');

        if ($granted) {
            $message->line("Your request to view {$player->full_name}'s full profile has been granted.")
                ->action('View player profile', route('player.show', $player));
        } else {
            $message->line("Your request to view {$player->full_name}'s full profile was declined.");
        }

        return $message;
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'access_request_responded',
            'access_request_id' => $this->accessRequest->id,
            'status' => $this->accessRequest->status,
        ];
    }
}
