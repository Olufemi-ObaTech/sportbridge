<?php

namespace App\Notifications;

use App\Models\TryOut;
use App\Models\User;
use App\Notifications\Channels\WebPushChannel;
use App\Support\NotificationPresenter;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TryOutInterestNotification extends Notification
{
    public function __construct(public TryOut $tryOut, public User $interestedUser) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database', WebPushChannel::class];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('New try-out interest')
            ->line("{$this->interestedUser->name} expressed interest in your try-out \"{$this->tryOut->title}\".")
            ->action('View interested players', route('try-outs.interested', $this->tryOut));
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'try_out_interest',
            'try_out_id' => $this->tryOut->id,
            'try_out_title' => $this->tryOut->title,
            'interested_user_name' => $this->interestedUser->name,
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
