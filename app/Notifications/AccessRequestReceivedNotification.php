<?php

namespace App\Notifications;

use App\Models\AccessRequest;
use App\Notifications\Channels\WebPushChannel;
use App\Support\NotificationPresenter;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AccessRequestReceivedNotification extends Notification
{
    public function __construct(public AccessRequest $accessRequest) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database', WebPushChannel::class];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $player = $this->accessRequest->player;
        $agent = $this->accessRequest->agent;

        return (new MailMessage)
            ->subject('New scouting access request')
            ->line("{$agent->agency_name} has requested access to {$player->full_name}'s full profile.")
            ->action('Review request', route('academy.access-requests.index'));
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'access_request_received',
            'access_request_id' => $this->accessRequest->id,
            'player_id' => $this->accessRequest->player_id,
        ];
    }

    public function toWebPush(object $notifiable): array
    {
        $presented = NotificationPresenter::presentData($this->toArray($notifiable));

        return [
            'title' => config('app.name'),
            'body' => $presented['message'],
            'url' => $presented['url'],
        ];
    }
}
