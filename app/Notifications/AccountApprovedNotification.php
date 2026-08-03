<?php

namespace App\Notifications;

use App\Notifications\Channels\WebPushChannel;
use App\Support\NotificationPresenter;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AccountApprovedNotification extends Notification
{
    public function via(object $notifiable): array
    {
        return ['mail', 'database', WebPushChannel::class];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $appName = config('app.name');

        return (new MailMessage)
            ->subject("Your {$appName} account has been approved")
            ->greeting("Welcome, {$notifiable->name}!")
            ->line('Your account has been reviewed and approved by our team.')
            ->action('Go to your dashboard', url('/dashboard'))
            ->line("Thanks for joining {$appName}.");
    }

    public function toArray(object $notifiable): array
    {
        return ['type' => 'account_approved'];
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
