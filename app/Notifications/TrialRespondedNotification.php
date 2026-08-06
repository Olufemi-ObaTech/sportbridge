<?php

namespace App\Notifications;

use App\Models\Trial;
use App\Notifications\Channels\WebPushChannel;
use App\Support\NotificationPresenter;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TrialRespondedNotification extends Notification
{
    public function __construct(public Trial $trial) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database', WebPushChannel::class];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Update on your trial proposal')
            ->line("Your trial proposal for {$this->trial->player?->full_name} was {$this->trial->status}.")
            ->action('View trials', route('trials.index'));
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'trial_responded',
            'trial_id' => $this->trial->id,
            'player_name' => $this->trial->player?->full_name,
            'status' => $this->trial->status,
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
